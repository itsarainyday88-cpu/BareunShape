import fs from 'fs';
import path from 'path';
import crypto from 'crypto';

/**
 * Generates an image using Gemini Imagen 3 via REST API.
 * Saves the image to public/generated-images and returns the public URL.
 */
export async function generateAndSaveImage(prompt: string, excludedPaths: string[] = [], agentId?: string): Promise<string | null> {
    const apiKey = process.env.GEMINI_API_KEY || process.env.IMAGEN_API_KEY;
    if (!apiKey) {
        console.error('GEMINI_API_KEY is missing');
        return null;
    }

    // Clean up prompt
    let cleanPrompt = prompt.replace(/> \*\*Nano Banana Prompt:\*\*/g, '').trim();

    // 1. Policy Check: Should we skip AI generation for real-world assets?
    const { getImagePolicy } = await import('@/lib/image-policy');
    const policy = getImagePolicy(cleanPrompt, excludedPaths, agentId);
    if (!policy.shouldGenerate) {
        console.log(`[Policy] Skipping AI generation. Reason: ${policy.reason}`);
        return policy.selectedImagePath || null;
    }

    // 2. Negative Prompt Injection
    const visuals = "Photographic style. High quality. NO TEXT. Subject: Korean, Asian featured people and dental clinic environment. ";
    const finalPrompt = visuals + cleanPrompt + " :: Do not include any text, signs, or watermarks.";

    console.log(`[Imagen] Generating image for: "${finalPrompt.substring(0, 50)}..."`);

    async function callImagenApi(promptToUse: string, modelName: string): Promise<string | null> {
        let url = '';
        let requestBody: any = {};

        // Use generateContent for gemini/imagen models in v1beta
        url = `https://generativelanguage.googleapis.com/v1beta/models/${modelName}:generateContent?key=${apiKey}`;
        requestBody = {
            contents: [{ parts: [{ text: promptToUse }] }],
        };

        try {
            const response = await fetch(url, {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify(requestBody)
            });

            if (!response.ok) {
                const errorText = await response.text();
                console.error(`[Imagen] API Error (${modelName}):`, response.status, errorText);
                return null;
            }

            const data = await response.json();
            const part = data.candidates?.[0]?.content?.parts?.find((p: any) => p.inlineData);
            if (part && part.inlineData && part.inlineData.data) {
                return part.inlineData.data;
            }
            return null;

        } catch (e: any) {
            console.error(`[Imagen] Call Failed (${modelName}):`, e.message);
            return null;
        }
    }

    try {
        const modelOrder = [
            'imagen-3.0-generate-001',
            'imagen-3.0-fast-generate-001',
            'gemini-3-pro-image-preview',
            'gemini-3.1-flash-image-preview'
        ];

        let base64Data = null;
        for (const modelId of modelOrder) {
            base64Data = await callImagenApi(finalPrompt, modelId);
            if (base64Data) break;
        }

        if (base64Data) {
            const buffer = Buffer.from(base64Data, 'base64');
            const publicDir = path.join(process.cwd(), 'public', 'generated-images');
            if (!fs.existsSync(publicDir)) {
                fs.mkdirSync(publicDir, { recursive: true });
            }
            const hash = crypto.createHash('md5').update(cleanPrompt + Date.now().toString()).digest('hex').substring(0, 8);
            const filename = `${Date.now()}-${hash}.png`;
            const filePath = path.join(publicDir, filename);
            fs.writeFileSync(filePath, buffer);
            console.log(`[Imagen] Saved to: ${filePath}`);
            return `/generated-images/${filename}`;
        } else {
            console.log('[Imagen] All engines failed. Returning fallback from Policy Engine.');
            const { getFallbackImage } = await import('@/lib/image-policy');
            return getFallbackImage(cleanPrompt, excludedPaths, agentId);
        }
    } catch (error: any) {
        console.error('[Imagen] Critical Error:', error.message);
        const { getFallbackImage } = await import('@/lib/image-policy');
        return getFallbackImage(cleanPrompt, excludedPaths, agentId);
    }
}
