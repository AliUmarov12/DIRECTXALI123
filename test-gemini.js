require('dotenv').config();
const { GoogleGenerativeAI } = require('@google/generative-ai');
const genAI = new GoogleGenerativeAI(process.env.GEMINI_API_KEY);

const SYSTEM_INSTRUCTION = "You are a helpful AI";

async function test() {
  try {
    const model = genAI.getGenerativeModel({
      model: 'gemini-2.5-flash',
      systemInstruction: SYSTEM_INSTRUCTION,
    });
    
    const chat = model.startChat({ history: [] });
    const result = await chat.sendMessage("Hello");
    console.log(result.response.text());
  } catch (e) {
    console.error("ERROR:", e);
  }
}
test();
