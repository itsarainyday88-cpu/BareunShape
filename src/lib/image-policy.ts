import metadata from '../../public/images/assets-metadata.json';

export type ImageCategory = 'PEOPLE' | 'FACILITY' | 'BRANDING';
export type ImageTag = 'directors' | 'exterior' | 'entrance' | 'studio' | 'consulting' | 'logo' | 'map' | 'general';

interface ImageAsset {
    id: string;
    category: string;
    tag: string;
    path: string;
    original_name: string;
}

/**
 * 프롬프트를 분석하여 AI 생성을 허용할지, 아니면 실물 사진을 반환할지 결정합니다.
 * 고도화된 선택 로직을 연기학원 환경에 맞춰 적용함.
 */
export function getImagePolicy(prompt: string, excludedPaths: string[] = [], agentId?: string): {
    shouldGenerate: boolean;
    selectedImagePath?: string;
    reason?: string;
} {
    const p = prompt.toLowerCase();
    const isInsta = agentId === 'Insta';

    // 0. 강제 생성 백도어
    if (p.includes('[force_generate]')) {
        return { shouldGenerate: true, reason: 'Force generation requested.' };
    }

    // [Option 3] 맥락 인식: 인스타 에이전트 + 감성 키워드가 많으면 AI 생성 우선
    const emotionalKeywords = ['감성', '분위기', 'mood', 'cinematic', '따뜻한', 'smile', 'lighting', 'vibrant'];
    const hasEmotionalHint = emotionalKeywords.some(k => p.includes(k));
    const isRichPrompt = p.length > 35;

    if (isInsta && (hasEmotionalHint || isRichPrompt)) {
        return {
            shouldGenerate: true,
            reason: `[Insta Choice] Rich/Emotional context detected (${p.length} chars). Prioritizing AI for premium look.`
        };
    }

    // 1. 교육진 관련 키워드 (PEOPLE) -> 실사 우선 (브랜드 신뢰도)
    if (p.includes('원장') || p.includes('선생님') || p.includes('배우') || p.includes('actor') || p.includes('teacher') || p.includes('director')) {
        const filtered = metadata.filter(img => 
            img.category === 'PEOPLE' && 
            img.tag === 'directors' &&
            !excludedPaths.includes(img.path)
        );
        const selected = filtered.length > 0 ? filtered[Math.floor(Math.random() * filtered.length)] : null;
        
        if (selected) {
            // 인스타라면 20% 확률로 다양성을 위해 AI 생성 이미지로 대체 가능
            if (isInsta && Math.random() < 0.2) {
                return { shouldGenerate: true, reason: '[Insta Mix] 20% luck: Trying AI version for variety.' };
            }
            return {
                shouldGenerate: false,
                selectedImagePath: selected.path,
                reason: 'Real academy staff asset matched for trust.'
            };
        }
    }

    // 2. 학원 시설 관련 키워드 (FACILITY)
    let facilityTag: string | null = null;
    if (p.includes('외관') || p.includes('건물') || p.includes('exterior')) facilityTag = 'exterior';
    else if (p.includes('로비') || p.includes('대기실') || p.includes('interior') || p.includes('entrance')) facilityTag = 'entrance';
    else if (p.includes('상담') || p.includes('상담실') || p.includes('consulting')) facilityTag = 'consulting';
    else if (p.includes('연습실') || p.includes('수업실') || p.includes('무대') || p.includes('studio')) facilityTag = 'studio';

    if (facilityTag) {
        const filtered = metadata.filter(img => 
            img.category === 'FACILITY' && 
            img.tag === facilityTag &&
            !excludedPaths.includes(img.path)
        );
        const selected = filtered.length > 0 ? filtered[Math.floor(Math.random() * filtered.length)] : null;
        if (selected) {
            // 인스타는 시설 사진이라도 40% 확률로 AI 생성을 섞어 세련됨 강조
            const aiWeight = isInsta ? 0.4 : 0.1;
            if (Math.random() < aiWeight) {
                return { shouldGenerate: true, reason: `[Insta Mix] AI Weight (${aiWeight}) applied for facility variety.` };
            }
            return {
                shouldGenerate: false,
                selectedImagePath: selected.path,
                reason: `Facility hint found for ${facilityTag}, using real asset.`
            };
        }
    }

    // 3. 로고/지도 관련 (BRANDING)
    if (p.includes('로고') || p.includes('logo')) {
        return { shouldGenerate: false, selectedImagePath: '/images/logo.png', reason: 'Branding asset requested' };
    }
    if (p.includes('지도') || p.includes('위치') || p.includes('map')) {
        return { shouldGenerate: false, selectedImagePath: '/images/map.png', reason: 'Map asset requested' };
    }

    // 4. 그 외 추상적 키워드는 AI 생성 허용
    return {
        shouldGenerate: true,
        reason: 'Attempting latest AI generation for max variety.'
    };
}

/**
 * AI 생성 실패 시 또는 강제 치환 시 사용할 폴백 이미지
 */
export function getFallbackImage(prompt: string, excludedPaths: string[] = [], agentId?: string): string {
    const policy = getImagePolicy(prompt, excludedPaths, agentId);
    
    if (policy.selectedImagePath && !excludedPaths.includes(policy.selectedImagePath)) {
        return policy.selectedImagePath;
    }

    const unused = metadata.filter(img => !excludedPaths.includes(img.path));
    if (unused.length > 0) {
        return unused[Math.floor(Math.random() * unused.length)].path;
    }

    return 'https://placehold.co/800x500/1a1a1a/ffffff?text=Acting+Studio'; // 최후의 임시 연습실 사진 폴백
}
