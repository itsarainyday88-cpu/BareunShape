import { createClient } from '@supabase/supabase-js';
import dotenv from 'dotenv';
import path from 'path';

// .env.local 로드
dotenv.config({ path: 'c:/Users/Bijou/.gemini/Hames/BareunShape/BareunShape.Admin/.env.local' });

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
const supabaseKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;

const supabase = createClient(supabaseUrl, supabaseKey);

async function runTest() {
    console.log('--- 🚀 DB 연동 실시간 테스트 시작 ---');
    
    const testTopic = `[시스템 점검] ${new Date().toLocaleString()} 자동 테스트 일정`;
    const testDate = new Date().toISOString().split('T')[0];

    // 1. 일정 등록 테스트
    console.log('1. 테스트 일정 등록 중...');
    const { data: insertData, error: insertError } = await supabase
        .from('calendar')
        .insert([
            {
                work_date: testDate,
                agent_id: 'Marketer',
                topic: testTopic,
                status: 'planned'
            }
        ])
        .select();

    if (insertError) {
        console.error('❌ 등록 실패:', insertError.message);
        return;
    }
    console.log('✅ 등록 성공:', insertData[0].id);

    // 2. 일정 조회 테스트
    console.log('2. 저장된 데이터 조회 중...');
    const { data: selectData, error: selectError } = await supabase
        .from('calendar')
        .select('*')
        .eq('id', insertData[0].id);

    if (selectError) {
        console.error('❌ 조회 실패:', selectError.message);
    } else {
        console.log('✅ 조회 성공! 데이터 확인:', JSON.stringify(selectData[0], null, 2));
    }

    // 3. 테스트 데이터 정리 (삭제)
    // console.log('3. 테스트 데이터 삭제 중...');
    // await supabase.from('calendar').delete().eq('id', insertData[0].id);
    // console.log('✅ 테스트 완료 및 정리 성공');
}

runTest();
