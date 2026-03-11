import { GoogleGenerativeAI } from '@google/generative-ai';
import { getSystemInstruction, CLINIC_BIO } from './agents/prompts';
import { generateAndSaveImage } from './imagen';
import { thinkingToolDefinitions, searchToolDefinitions } from './tools/definitions';
import { thinkingTools } from './tools/thinkingHelpers';
import { searchTools } from './tools/searchHelpers';
import { retrieveStyleContext } from './rag';

const apiKey = process.env.GEMINI_API_KEY!;
const genAI = new GoogleGenerativeAI(apiKey);

/** 
 * 이미지 생성 실패 시 정책 엔진을 통해 최적의 실사 자산을 반환합니다.
 */
async function getFallbackImageAsync(promptText: string, usedUrls: string[] = [], agentId?: string): Promise<string> {
    const { getFallbackImage } = await import('./image-policy');
    return getFallbackImage(promptText, usedUrls, agentId);
}

const agentTemperatures: Record<string, number> = {
    Insta: 0.95,
    Blog: 0.9,
    Threads: 0.85,
    Shortform: 0.7,
    Marketer: 0.7,
};

/**
 * [BareunShape Edition] 실시간 의료 맥락 생성기
 */
function getTodayContext() {
    const now = new Date(new Date().toLocaleString("en-US", { timeZone: "Asia/Seoul" }));
    const dateStr = now.toLocaleDateString('ko-KR', { year: 'numeric', month: 'long', day: 'numeric', weekday: 'long' });
    const month = now.getMonth() + 1;

    let medicalSeason = "";
    if (month === 3) medicalSeason = "새 학기 시작, 어린이 치과 검진 및 예방 진료 권장기";
    else if (month === 5) medicalSeason = "가정의 달, 부모님을 위한 고난도 임플란트 및 틀니 상담 집중 기간";
    else if (month === 7 || month === 8) medicalSeason = "여름방학 기간, 학생 교정 및 집중 치료 골든타임";
    else if (month === 12 || month === 1) medicalSeason = "연말연시 정기 검진 및 스케일링 권고 시즌";
    else medicalSeason = "기본에 충실한 정기 검진 및 예방 치료 강조 시기";

    return `- 오늘: ${dateStr}\n- 의료 시즌 맥락: ${medicalSeason}\n- 분위기: 환자분들의 정직한 진료와 바른 기능 회복에 대한 관심이 높은 시기입니다.`;
}

// Export as a streaming generator
export async function* generateAgentResponseStream(agentId: string, message: string, history: any[] = [], useSearch: boolean = false) {
    const usedImageUrls = new Set<string>();
    if (!apiKey) {
        throw new Error('GEMINI_API_KEY is not set');
    }

    const cleanHistory = history.length > 0 && history[0].role === 'model'
        ? history.slice(1)
        : history;

    const tryStream = async function* (modelName: string, retries = 1) {
        // 모든 에이전트: 커스텀 검색 + 사고 도구 활성화
        let tools: any[] = [
            {
                functionDeclarations: [
                    ...searchToolDefinitions[0].functionDeclarations,
                    ...thinkingToolDefinitions[0].functionDeclarations,
                ]
            }
        ];

        if (useSearch) {
            tools.push({
                googleSearchRetrieval: {
                    dynamicRetrievalConfig: { mode: "MODE_DYNAMIC", dynamicThreshold: 0.3 },
                },
            });
        }

        const todayContext = getTodayContext();
        let systemInstruction = getSystemInstruction(agentId, todayContext);

        // RAG 기반 문체 컨텍스트 주입 (Blog, Threads)
        if (agentId === 'Blog' || agentId === 'Threads') {
            const styleContext = await retrieveStyleContext(message);
            if (styleContext) {
                systemInstruction += `\n\n[✍️ RAG Style Context - 최우선 글투 기준]\n` + styleContext;
            }
        }

        const model = genAI.getGenerativeModel({
            model: modelName,
            systemInstruction: systemInstruction,
            tools: tools as any,
            generationConfig: {
                temperature: agentTemperatures[agentId] || 0.7,
                maxOutputTokens: 16384,
            },
        });

        // Vision Support
        const prepareMessageParts = async (msg: string) => {
            const parts: any[] = [];
            const imageRegex = /!\[.*?\]\((https?:\/\/.*?|data:image\/.*?)\)/g;
            let lastIndex = 0;
            let match;

            while ((match = imageRegex.exec(msg)) !== null) {
                const textBefore = msg.substring(lastIndex, match.index).trim();
                if (textBefore) parts.push({ text: textBefore });

                const url = match[1];
                try {
                    const response = await fetch(url);
                    if (response.ok) {
                        const buffer = await response.arrayBuffer();
                        const base64 = Buffer.from(buffer).toString('base64');
                        const mimeType = response.headers.get('content-type') || 'image/jpeg';
                        parts.push({ inlineData: { data: base64, mimeType: mimeType } });
                    }
                } catch (err) { console.error('[Vision] Fetch failed:', url); }
                lastIndex = imageRegex.lastIndex;
            }

            const remainingText = msg.substring(lastIndex).trim();
            if (remainingText) parts.push({ text: remainingText });
            return parts.length > 0 ? parts : [{ text: msg }];
        };

        const chatHistory = await Promise.all(cleanHistory.map(async (msg) => ({
            role: msg.role === 'user' ? 'user' : 'model',
            parts: await prepareMessageParts(typeof msg.content === 'string' ? msg.content : JSON.stringify(msg.content)),
        })));

        const chat = model.startChat({ history: chatHistory });
        let currentInput: any = await prepareMessageParts(message);
        let functionCallCount = 0;
        const MAX_FUNCTION_CALLS = 10;
        let verifiedFacts = `${message}\n${CLINIC_BIO}\n`;

        while (true) {
            let attempt = 0;
            let responseStream = null;

            while (attempt <= retries) {
                try {
                    const result = await chat.sendMessageStream(currentInput);
                    responseStream = result.stream;
                    break;
                } catch (error: any) {
                    attempt++;
                    if (attempt > retries) throw error;
                    await new Promise(resolve => setTimeout(resolve, 2000 * attempt));
                }
            }

            if (!responseStream) throw new Error("Stream failed");

            let buffer = '';
            let isFirstTextPassed = false;
            let instaHookText = '';
            let threadsLineCount = 0;
            let skipThreadsPost = false;
            let inThreadsCompliance = false;
            let functionCallDetected = false;
            let functionCallData: any = null;

            for await (const chunk of responseStream) {
                const funcCalls = chunk.functionCalls();
                if (funcCalls && funcCalls.length > 0) {
                    functionCallDetected = true;
                    functionCallData = funcCalls[0];
                    continue;
                }

                let chunkText = '';
                try { chunkText = chunk.text(); } catch (e) { continue; }
                if (!chunkText) continue;
                buffer += chunkText;

                if (buffer.includes('\n') || buffer.length > 2000) {
                    const lines = buffer.split('\n');
                    const remainder = buffer.endsWith('\n') ? '' : lines.pop() || '';

                    for (const line of lines) {
                        const markerRegex = /\[IMAGE_GENERATE:(.*?)\]/i;
                        const match = line.match(markerRegex);

                        if (match) {
                            if (agentId === 'Shortform') {
                                yield line.replace(match[0], '').trim() + '\n';
                                continue;
                            }

                            const fullMatch = match[0];
                            let promptText = match[1].trim().replace(/^[:\s]+/, '').trim();
                            if (promptText && promptText.length > 5) {
                                try {
                                    const imageUrl = await generateAndSaveImage(promptText, Array.from(usedImageUrls), agentId);
                                    if (imageUrl) {
                                        usedImageUrls.add(imageUrl);
                                        const finalUrl = imageUrl.startsWith('data:') ? imageUrl : encodeURI(imageUrl);
                                        yield line.replace(fullMatch, `\n\n![AI 생성 이미지](${finalUrl})\n\n`) + '\n';
                                    } else {
                                        const fallback = await getFallbackImageAsync(promptText, Array.from(usedImageUrls), agentId);
                                        usedImageUrls.add(fallback);
                                        yield line.replace(fullMatch, `\n\n![병원 이미지](${encodeURI(fallback)})\n\n`) + '\n';
                                    }
                                    continue;
                                } catch (err) {
                                    const fallback = await getFallbackImageAsync(promptText, Array.from(usedImageUrls), agentId);
                                    usedImageUrls.add(fallback);
                                    yield line.replace(fullMatch, `\n\n![병원 이미지](${encodeURI(fallback)})\n\n`) + '\n';
                                }
                            } else yield line + '\n';
                        } else {
                            let processedLine = line + '\n';
                            if (agentId === 'Shortform') {
                                processedLine = processedLine.replace(/!\[.*?\]\(.*?\)/g, '');
                                if (!processedLine.trim()) continue;
                            }

                            processedLine = filterPhantomReferences(processedLine) + '\n';
                            if (agentId !== 'Insta') processedLine = verifyFactIntegrity(processedLine, verifiedFacts);

                            if (agentId === 'Threads') {
                                const postMatch = processedLine.match(/^Post\s+(\d+):/i);
                                if (postMatch) {
                                    const pNum = parseInt(postMatch[1]);
                                    if (pNum > 2) { skipThreadsPost = true; continue; }
                                    threadsLineCount = 0; inThreadsCompliance = false; skipThreadsPost = false;
                                    yield processedLine;
                                } else if (processedLine.trim().includes('🚦')) {
                                    inThreadsCompliance = true; skipThreadsPost = false; yield processedLine;
                                } else if (inThreadsCompliance) {
                                    yield processedLine;
                                } else if (!skipThreadsPost && processedLine.trim().length > 0) {
                                    threadsLineCount++; if (threadsLineCount <= 2) yield processedLine;
                                } else if (!skipThreadsPost) yield processedLine;
                            } else if (agentId === 'Insta') {
                                if (!isFirstTextPassed && processedLine.trim().length > 0) {
                                    if (processedLine.trim().startsWith('![')) yield processedLine;
                                    else {
                                        processedLine = enforceInstaHook(processedLine.trim()) + '\n';
                                        instaHookText = processedLine.trim();
                                        isFirstTextPassed = true; yield processedLine;
                                    }
                                } else if (isFirstTextPassed && processedLine.trim().startsWith('📌')) {
                                    if (!isSimilarToHook(instaHookText, processedLine)) yield processedLine;
                                } else yield processedLine;
                            } else yield processedLine;
                        }
                    }
                    buffer = remainder;
                }
            }

            if (buffer.trim()) {
                let textToYield = filterPhantomReferences(buffer);
                if (agentId === 'Insta' && !isFirstTextPassed && textToYield.trim().length > 0) {
                    textToYield = enforceInstaHook(textToYield);
                }
                yield textToYield;
            }

            if (functionCallDetected && functionCallData && functionCallCount < MAX_FUNCTION_CALLS) {
                functionCallCount++;
                const fnName = functionCallData.name;
                const fnArgs = functionCallData.args;

                let toolResult: any;
                try {
                    if (fnName === 'init_thinking') toolResult = await thinkingTools.init_thinking(fnArgs);
                    else if (fnName === 'add_thought_step') toolResult = await thinkingTools.add_thought_step(fnArgs);
                    else if (fnName === 'reflect_thinking') toolResult = await thinkingTools.reflect_thinking();
                    else if (fnName === 'googleSearch') toolResult = { content: "Search grounding complete." };
                    else if (fnName === 'search_local_trends') toolResult = await searchTools.search_local_trends(fnArgs);
                    else if (fnName === 'scrape_website') toolResult = await searchTools.scrape_website(fnArgs);
                    else toolResult = { error: "Unknown tool" };
                } catch (err: any) { toolResult = { error: err.message }; }

                if (toolResult && typeof toolResult === 'object') verifiedFacts += JSON.stringify(toolResult) + "\n";

                currentInput = [{ functionResponse: { name: fnName, response: { content: toolResult } } }];
                continue;
            }

            break;
        }
    };

    const modelQueue = ['gemini-3-flash-preview', 'gemini-2.5-flash', 'gemini-3.1-pro-preview'];

    let lastError: any = null;
    for (const modelName of modelQueue) {
        try {
            yield* tryStream(modelName, 1);
            return;
        } catch (error: any) {
            lastError = error;
            console.warn(`[Stream] Model ${modelName} failed.`, error.message);
        }
    }
    throw lastError || new Error('All models failed');
}

/** [Insta] Hook & Emoji Enforcement */
function enforceInstaHook(text: string): string {
    if (!text.trim() || text.includes('![')) return text;
    const lines = text.split('\n');
    let firstIdx = lines.findIndex(l => l.trim().length > 0);
    if (firstIdx === -1) return text;

    let hook = lines[firstIdx].trim();
    if (hook.length > 28) hook = hook.substring(0, 25) + '...';
    
    const emojiRegex = /(\u00a9|\u00ae|[\u2000-\u3300]|\ud83c[\ud000-\udfff]|\ud83d[\ud000-\udfff]|\ud83e[\ud000-\udfff])/;
    if (!emojiRegex.test(hook)) hook = `✨ ${hook} 🦷`;
    
    lines[firstIdx] = hook;
    return lines.join('\n');
}

/** Phantom Reference Filter */
function filterPhantomReferences(text: string): string {
    const patterns = [/위\s+카드뉴스(에서)?\s+(확인하듯|보듯|나와\s+있듯)/g, /사진\s+속\s+(정보|수치|문구)/g];
    let cleaned = text;
    for (const p of patterns) cleaned = cleaned.replace(p, '');
    return cleaned.trim();
}

/** Similarity Check */
function isSimilarToHook(hook: string, line: string): boolean {
    const clean = (t: string) => t.replace(/[^\w\s가-힣]/g, '').split(/\s+/).filter(w => w.length > 1);
    const hw = clean(hook);
    const lw = clean(line);
    if (lw.length === 0) return false;
    let matches = lw.filter(w => hw.some(h => h.includes(w) || w.includes(h))).length;
    return (matches / lw.length) > 0.6;
}

/** Truth-Guard Engine */
function verifyFactIntegrity(text: string, knownFacts: string): string {
    const factPattern = /([1-9]\d*)\s*(명|%|점|학년도|등급|위|%p|원|건|개|배|학기|대|곳|가지)/g;
    return text.replace(factPattern, (match, value) => {
        if (parseInt(value) <= 10 || knownFacts.includes(value)) return match;
        return `[🚨 확인 필요: ${match}]`;
    });
}
