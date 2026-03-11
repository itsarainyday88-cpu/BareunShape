import { GoogleGenerativeAI } from '@google/generative-ai';
import { createClient } from '@supabase/supabase-js';
import dotenv from 'dotenv';

dotenv.config({ path: 'c:/Users/Bijou/.gemini/Hames/BareunShape/BareunShape.Admin/.env.local' });

const genAI = new GoogleGenerativeAI(process.env.GEMINI_API_KEY);
const supabase = createClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY
);

const scrapedData = [
    {
        "title": "성남 임플란트 치과, 단 하나의 임플란트도 허투로 심지 않습니다.",
        "url": "https://m.blog.naver.com/rightshapedent/224203918164",
        "content": "안녕하세요. 성남중앙시장 앞 바른모양치과입니다. 많은 분들이 임플란트 수술에만 관심을 가지시지만, 실제로는 그 위에 올라가는 보철물의 완성도 역시 매우 중요한 부분입니다. 임플란트는 자연치아처럼 치주인대가 있는 구조가 아니기 때문에 씹는 힘이 그대로 전달됩니다. 따라서 보철물의 형태나 교합이 맞지 않으면 나사가 풀리거나 부러지는 등의 문제가 생길 수 있습니다. 저희 바른모양치과는 보철과 전문의와 통합치의학전문의가 협진하여 잇몸뼈 상태를 정확히 확인하고, 임플란트 주위염과 같은 문제가 발생하지 않도록 정밀한 계획을 세워 시술합니다. 단 하나의 임플란트라도 허투루 심지 않고 최선을 다하겠습니다."
    },
    {
        "title": "성남 자연치 살리는 치과, 치아가 흔들릴 때, 무조건 발치를 해야 하는 걸까요?",
        "url": "https://m.blog.naver.com/rightshapedent/224193932248",
        "content": "안녕하세요. 성남중앙시장 앞 바른모양치과입니다. 치아가 흔들린다고 해서 무조건 뽑아야 하는 것은 아닙니다. 치아가 흔들리는 원인은 크게 1. 충치가 깊어져 신경 조직까지 영향을 받았을 때, 2. 치주조직의 손상이 누적되었을 때(풍치), 3. 외상으로 인해 지지 결합이 약해졌을 때로 나눌 수 있습니다. 각 원인에 맞는 적절한 치료(신경치료, 치주치료 등)를 통해 흔들림을 잡고 자연치아를 더 오래 사용할 수 있는 경우가 많습니다. 저희 바른모양치과는 정밀한 진단을 통해 발치 여부를 신중히 결정하며, 최대한 자연치아를 살리는 방향으로 진료합니다."
    },
    {
        "title": "성남 사랑니 치과, 통증 없다고 그대로 두는 것. 정말 괜찮은 걸까요?",
        "url": "https://m.blog.naver.com/rightshapedent/224192695544",
        "content": "안녕하세요. 바른모양치과입니다. 사랑니가 통증이 없다고 해서 그대로 두어도 괜찮은지 궁금해하시는 분들이 많습니다. 하지만 사랑니는 위치상 관리가 어렵고, 주변 치아에 악영향(충치, 음식물 끼임, 염증 등)을 줄 수 있기 때문에 정밀 진단 후 발치 여부를 결정하는 것이 좋습니다. 특히 매복 사랑니나 비스듬히 난 사랑니는 인접 어금니까지 손상시킬 수 있으므로 주의가 필요합니다. 바른모양치과는 환자분의 상태를 면밀히 파악하여 안전하게 발치를 진행하며, 통증을 최소화하기 위해 노력합니다."
    },
    {
        "title": "태평역 네비게이션 임플란트, 정확도를 높이는 방법은 따로 있습니다.",
        "url": "https://m.blog.naver.com/rightshapedent/224193892516",
        "content": "안녕하세요. 바른모양치과입니다. 네비게이션 임플란트는 디지털 가이드를 사용하여 정확한 위치와 각도에 임플란트를 식립하는 방법입니다. 하지만 디지털 장비만큼 중요한 것은 수술을 직접 집도하는 의료진의 숙련도입니다. 저희는 보철과 전문의와 통합치의학전문의가 협진하여 환자 개개인의 구강 구조에 최적화된 식립 계획을 세웁니다. 통증과 부기를 줄이고 시술 시간을 단축할 수 있는 네비게이션 임플란트를 바른모양치과에서 만나보세요."
    },
    {
        "title": "태평역 틀니 치과, 임플란트가 부담된다면 이런 방법도 있습니다",
        "url": "https://m.blog.naver.com/rightshapedent/224188161549",
        "content": "안녕하세요. 바른모양치과입니다. 임플란트 식립이 어렵거나 비용, 수술 과정이 부담스러운 분들에게는 틀니가 좋은 대안이 될 수 있습니다. 틀니는 크게 전체 틀니, 부분 틀니, 그리고 임플란트와 결합한 임플란트 틀니로 나뉩니다. 저희 바른모양치과는 보철과 전문의가 직접 환자분의 구강 상태를 정밀하게 진단하여, 들뜨지 않고 편안하게 사용할 수 있는 맞춤형 틀니를 제작해 드립니다. 임플란트가 고민된다면 틀니 상담도 받아보세요."
    }
];

async function getEmbedding(text) {
    const model = genAI.getGenerativeModel({ model: "gemini-embedding-001" });
    const result = await model.embedContent(text);
    return result.embedding.values;
}

async function indexData() {
    console.log(`Starting RAG index for ${scrapedData.length} documents...`);

    for (const post of scrapedData) {
        console.log(`Indexing: ${post.title}`);

        try {
            const embedding = await getEmbedding(post.content);

            const { error } = await supabase.from('archive_posts').insert({
                content: post.content,
                embedding: embedding,
                metadata: {
                    title: post.title,
                    url: post.url,
                    source: 'official_blog_scraped'
                }
            });

            if (error) {
                console.error(`Insert failed for ${post.title}:`, error.message);
            } else {
                console.log(`Success: ${post.title} indexed.`);
            }
        } catch (e) {
            console.error(`Error processing ${post.title}:`, e.message);
        }

        await new Promise(r => setTimeout(r, 500));
    }

    console.log("RAG Indexing complete.");
}

indexData();
