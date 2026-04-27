const express = require('express');
const axios = require('axios');
const { GoogleGenerativeAI } = require('@google/generative-ai');
const router = express.Router();

const GEMINI_API_KEY = process.env.GEMINI_API_KEY;
const YOU_API_KEY = process.env.YOU_API_KEY;

const genAI = new GoogleGenerativeAI(GEMINI_API_KEY);

// System prompt describing DirectX AI
const SYSTEM_INSTRUCTION = `
You are DirectX AI, the central intelligent assistant for the AZCON ecosystem.
Your role is to help users navigate and utilize the AZCON platform, which includes:
1. Transit & Flights: Live flight board for Heydar Aliyev Int'l (GYD) with delay detection.
2. Unified Wallet: A digital wallet for managing balances and transport QR payments.
3. eSIM Services: Airalo data packages on the Azercell network.
4. Smart Route: Optimal transport planning with live traffic awareness.

Guidelines:
- If asked, introduce yourself as DirectX AI in English.
- You are multilingual. Always respond in the language the user speaks to you (e.g. if they speak Azerbaijani, respond in Azerbaijani).
- Use the real-time context provided to you (from You.com) to give accurate, up-to-date answers regarding weather, traffic, accidents, etc.
- Be professional, concise, and helpful. Format your responses using markdown for readability.
`;

/**
 * Helper to fetch real-time context from You.com
 */
async function getYouContext(query) {
  if (!YOU_API_KEY || YOU_API_KEY.includes('...')) return null;
  
  try {
    const response = await axios.get('https://api.ydc-index.io/search', {
      params: { query },
      headers: { 'X-API-Key': YOU_API_KEY }
    });
    
    if (response.data && response.data.hits) {
      // Extract top 3 snippets for context
      const snippets = response.data.hits.slice(0, 3).map(hit => hit.snippets.join(' ')).join('\n');
      return snippets;
    }
  } catch (error) {
    console.error('[You.com API Error]', error.message);
  }
  return null;
}

// ─────────────────────────────────────────────────────────────
//  POST /api/ai/chat
// ─────────────────────────────────────────────────────────────
router.post('/chat', async (req, res) => {
  const { message, history = [] } = req.body;

  if (!message) {
    return res.status(400).json({ error: 'Message is required' });
  }

  try {
    // 1. Fetch real-time context from You.com based on user query
    const realTimeContext = await getYouContext(message);
    
    // 2. Initialize Gemini Model
    const model = genAI.getGenerativeModel({
      model: 'gemini-2.5-flash',
      systemInstruction: SYSTEM_INSTRUCTION,
    });

    // 3. Prepare Chat Session
    const chat = model.startChat({
      history: history.map(msg => ({
        role: msg.role === 'ai' ? 'model' : 'user',
        parts: [{ text: msg.text }],
      })),
    });

    // 4. Inject context if available
    let prompt = message;
    if (realTimeContext) {
      prompt = `[REAL-TIME CONTEXT FROM INTERNET]\n${realTimeContext}\n\n[USER QUERY]\n${message}`;
    }

    // 5. Send Message to Gemini
    const result = await chat.sendMessage(prompt);
    const responseText = result.response.text();

    res.json({ reply: responseText });
  } catch (err) {
    console.error('[Gemini API Error]', err);
    res.status(500).json({ error: 'Failed to generate response', detail: err.message });
  }
});

module.exports = router;
