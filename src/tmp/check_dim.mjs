import { GoogleGenerativeAI } from '@google/generative-ai';
import dotenv from 'dotenv';
dotenv.config({ path: 'c:/Users/Bijou/.gemini/Hames/BareunShape/BareunShape.Admin/.env.local' });

const genAI = new GoogleGenerativeAI(process.env.GEMINI_API_KEY);

async function checkDim() {
    const model = genAI.getGenerativeModel({ model: "gemini-embedding-001" });
    const result = await model.embedContent("Hello world");
    console.log("Model:", model.model);
    console.log("Dimension:", result.embedding.values.length);
}

checkDim();
