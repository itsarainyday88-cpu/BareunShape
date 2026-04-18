import { GoogleGenerativeAI } from '@google/generative-ai';
import { createClient } from '@supabase/supabase-js';

const genAI = new GoogleGenerativeAI(process.env.GEMINI_API_KEY!);
const supabase = createClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!
);

/**
 * 사용자 메시지와 가장 유사한 원장님의 과거 문체 데이터를 검색하여
 * 시스템 프롬프트에 주입할 컨텍스트 블록을 반환합니다.
 */
export async function retrieveStyleContext(query: string, matchCount = 3): Promise<string> {
    try {
        // 1. 쿼리를 벡터로 변환
        const embeddingModel = genAI.getGenerativeModel({ model: 'gemini-embedding-001' });
        const result = await embeddingModel.embedContent(query);
        const queryEmbedding = result.embedding.values;

        // 2. Supabase에서 RAG 전용 테이블(archive_posts) 기반 유사 문체 데이터 검색
        const { data: documents, error } = await supabase.rpc('match_archive_posts', {
            query_embedding: queryEmbedding,
            match_threshold: 0.3,
            match_count: matchCount,
        });

        if (error || !documents || documents.length === 0) {
            // console.warn('[RAG] No matching documents found or error:', error?.message);
            return '';
        }

        // 3. 검색된 문서를 컨텍스트 블록으로 조합
        let context = `\n\n--- [파인액터스연기학원 원장님 과거 작성 글 참조 데이터 (RAG)] ---\n`;
        context += `다음은 이 학원 원장님이 이전에 작성하셨던 실제 글에서 발췌한 내용들입니다.\n`;
        context += `작성 중인 글에서도 아래 참조 데이터의 '열정적이면서도 섬세한' 배우다운 문체를 참고하십시오.\n\n`;

        documents.forEach((doc: { content: string }, idx: number) => {
            context += `[참조 ${idx + 1}]\n${doc.content}\n\n`;
        });

        context += `--- [참조 데이터 끝] ---\n`;
        return context;
    } catch (err) {
        // console.warn('[RAG] Context retrieval logic failed:', err);
        return '';
    }
}
