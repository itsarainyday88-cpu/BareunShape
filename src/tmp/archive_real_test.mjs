import { createClient } from '@supabase/supabase-js';
import dotenv from 'dotenv';

// .env.local 로드
dotenv.config({ path: 'c:/Users/Bijou/.gemini/Hames/BareunShape/BareunShape.Admin/.env.local' });

const supabase = createClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY
);

async function testArchive() {
    console.log('--- 📂 보관함(Archive) DB 실시간 테스트 시작 ---');

    const testTitle = `[보관함 테스트] ${new Date().toLocaleString()}`;
    const testContent = `# ${testTitle}\n\n이 문서는 AI 에이전트가 데이터베이스 연동 테스트를 위해 생성한 샘플 문서입니다.\n\n이 메시지가 보인다면 보관함도 DB와 실시간으로 연결되어 있는 것입니다.`;

    // 1. 문서 등록 테스트 (documents 테이블)
    console.log('1. 보관함에 테스트 문서 등록 중...');
    const { data: insertDoc, error: insertError } = await supabase
        .from('documents')
        .insert([
            {
                agent_id: 'Marketer',
                content: testContent,
                created_at: new Date().toISOString()
            }
        ])
        .select();

    if (insertError) {
        console.error('❌ 등록 실패:', insertError.message);
        return;
    }
    console.log('✅ 보관함 등록 성공! ID:', insertDoc[0].id);

    // 2. 등록된 문서 확인 (목록 조회)
    console.log('2. 보관함 목록에서 해당 문서 데이터 확인 중...');
    const { data: checkDoc, error: checkError } = await supabase
        .from('documents')
        .select('*')
        .eq('id', insertDoc[0].id);

    if (checkError) {
        console.error('❌ 조회 실패:', checkError.message);
    } else {
        console.log('✅ 보관함 조회 성공! 내용 확인:', checkDoc[0].content.substring(0, 50) + '...');
    }
}

testArchive();
