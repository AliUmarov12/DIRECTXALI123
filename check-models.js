require('dotenv').config();
const axios = require('axios');
const key = process.env.GEMINI_API_KEY;

axios.get(`https://generativelanguage.googleapis.com/v1beta/models?key=${key}`)
  .then(res => {
    console.log("Available models:");
    res.data.models.forEach(m => console.log(m.name, "—", m.supportedGenerationMethods.join(',')));
  })
  .catch(err => {
    console.log("Error:", err.response ? err.response.data : err.message);
  });
