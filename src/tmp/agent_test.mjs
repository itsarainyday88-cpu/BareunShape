async function testAgent(agentId, message) {
    console.log(`\n======================================================`);
    console.log(`🤖 에이전트 [${agentId}] 테스트 중...`);
    console.log(`💬 요청: ${message}`);
    console.log(`------------------------------------------------------`);
    try {
        const res = await fetch('http://127.0.0.1:3001/api/chat', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ agentId, message, history: [], useSearch: false })
        });
        
        if (!res.ok) {
            console.log(`❌ 에러 발생: ${res.status} ${res.statusText}`);
            const errTxt = await res.text();
            console.log(`내용: ${errTxt}`);
            return;
        }
        
        // chunk streaming
        const text = await res.text();
        
        console.log(`✅ 응답 완료 (${text.length} 자)`);
        console.log(text.substring(0, 600) + (text.length > 600 ? '\n\n... (새략됨) ...' : ''));
        
        if (text.includes('치과') || text.includes('임플란트') || text.includes('교정')) {
            console.log(`\n⚠️ 경고: 응답 내에 '치과/임플란트/교정' 등 이전 맥락 단어가 포함되어 있습니다!`);
        } else if (text.includes('파인액터스') || text.includes('연기학원')) {
            console.log(`\n🎉 성공: '파인액터스' 또는 '연기학원' 맥락이 잘 반영되었습니다.`);
        }

    } catch (e) {
        console.log(`❌ 서버 연결 실패 (개발 서버가 켜져 있는지 확인): ${e.message}`);
    }
}

async function runTests() {
    console.log('🚀 파인액터스 에이전트 성능 검토 시작');
    
    // 1. Marketer
    await testAgent('Marketer', '이번 달 말에 새로 열리는 연기 기초반 신규 수강생 모집을 위한 마케팅 기획안을 간단히 짜줘.');
    
    // 2. Blog
    await testAgent('Blog', '연기 기초반 신규 수강생 모집 블로그 포스팅 작성해줘.');
    
    // 3. Insta
    await testAgent('Insta', '연기 기초반 신규 수강생 모집 인스타 피드 게시글 작성해줘.');
    
    // 4. Shortform
    await testAgent('Shortform', '연기 기초반 신규 수강생 모집을 알리는 릴스 대본 짜줘.');
    
}

runTests();
