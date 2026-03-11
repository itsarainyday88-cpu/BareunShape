import { GoogleGenerativeAI } from '@google/generative-ai';
import { createClient } from '@supabase/supabase-js';
import dotenv from 'dotenv';

dotenv.config({ path: 'c:/Users/Bijou/.gemini/Hames/BareunShape/BareunShape.Admin/.env.local' });

const genAI = new GoogleGenerativeAI(process.env.GEMINI_API_KEY);
const supabase = createClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY
);

const TAVILY_API_KEY = process.env.TAVILY_API_KEY;

const blogPosts = [
    { title: "성남 임플란트 치과, 단 하나의 임플란트도 허투로 심지 않습니다.", url: "https://blog.naver.com/rightshapedent/224203918164" },
    { title: "성남 자연치 살리는 치과, 치아가 흔들릴 때, 무조건 발치를 해야 하는 걸까요?", url: "https://blog.naver.com/rightshapedent/224193932248" },
    { title: "성남 사랑니 치과, 통증 없다고 그대로 두는 것. 정말 괜찮은 걸까요?", url: "https://blog.naver.com/rightshapedent/224192695544" },
    { title: "태평역 네비게이션 임플란트, 정확도를 높이는 방법은 따로 있습니다.", url: "https://blog.naver.com/rightshapedent/224193892516" },
    { title: "태평역 틀니 치과, 임플란트가 부담된다면 이런 방법도 있습니다", url: "https://blog.naver.com/rightshapedent/224188161549" },
    { title: "수정구 치과, 턱이 뻐근하고 귀 옆이 아프다면? 턱관절 문제의 원인과 접근법", url: "https://blog.naver.com/rightshapedent/224185194017" },
    { title: "성남 스케일링 치과, 치석제거를 미루고 계셨다면 한 번쯤 확인해 보세요", url: "https://blog.naver.com/rightshapedent/224183186214" },
    { title: "태평동치과, 수술 후 회복을 돕는 PDRN 주사, 언제 도움이 될까요?", url: "https://blog.naver.com/rightshapedent/224181057474" },
    { title: "태평역치과, 잘 쓰고 있던 틀니가 헐거워지는 이유, 대부분은 ‘치조골 변화’입니다", url: "https://blog.naver.com/rightshapedent/224178875501" },
    { title: "수진역 앞니 벌어짐 치료, 고민하신다면, 이 부분부터 살펴보세요", url: "https://blog.naver.com/rightshapedent/224176840778" },
    { title: "수진역치과, “잇몸이 피가 나고 부었다면?” 치과의사가 직접 알려드리는 잇몸 치료의 모든 것", url: "https://blog.naver.com/rightshapedent/224174828131" },
    { title: "수진동 구강검진 모든 치과가 가능한 건 아닙니다, 구강검진 전 ‘검진기관 찾기’", url: "https://blog.naver.com/rightshapedent/224172810793" },
    { title: "수정구 치과, 크게 아프지 않아서 미뤄온 스케일링, 정말 괜찮을까요?", url: "https://blog.naver.com/rightshapedent/224170792942" },
    { title: "태평역 신경치료, 만병통치약 이라기 보다는 ‘마지막 선택지’여야 합니다 (2)", url: "https://blog.naver.com/rightshapedent/224168758872" },
    { title: "태평역치과, \"치과 가기 너무 무서워요!\" 치과 공포증, 어떻게 극복할 수 있을까요?", url: "https://blog.naver.com/rightshapedent/224166258079" }
];

async function scrapeWithTavily(url) {
    try {
        const resp = await fetch('https://api.tavily.com/extract', {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
                'Authorization': `Bearer ${TAVILY_API_KEY}`
            },
            body: JSON.stringify({ urls: [url] })
        });
        const data = await resp.json();
        return data.results?.[0]?.raw_content || null;
    } catch (e) {
        console.error(`Scrape failed for ${url}:`, e.message);
        return null;
    }
}

async function getEmbedding(text) {
    const model = genAI.getGenerativeModel({ model: "gemini-embedding-001" });
    const result = await model.embedContent(text);
    return result.embedding.values;
}

async function processPosts() {
    console.log(`Starting RAG sync for ${blogPosts.length} posts...`);

    for (const post of blogPosts) {
        console.log(`Processing: ${post.title}`);

        // 1. Scrape
        let content = await scrapeWithTavily(post.url);
        if (!content) {
            console.warn(`Skipping ${post.title} due to scrape failure.`);
            continue;
        }

        // Clean content a bit (remove excessive whitespace)
        content = content.replace(/\s+/g, ' ').substring(0, 5000);

        // 2. Embedding
        const embedding = await getEmbedding(content);

        // 3. Upsert into Supabase
        const { error } = await supabase.from('archive_posts').insert({
            content: content,
            embedding: embedding,
            metadata: {
                title: post.title,
                url: post.url,
                source: 'official_blog'
            }
        });

        if (error) {
            console.error(`DB Insert failed for ${post.title}:`, error.message);
        } else {
            console.log(`Success: ${post.title} indexed.`);
        }

        // Rate limiting avoidance
        await new Promise(r => setTimeout(r, 1000));
    }

    console.log("RAG synchronization complete.");
}

processPosts();
