const axios = require('axios');
axios.post('http://localhost:3000/api/ai/chat', { message: 'Hello' })
  .then(res => {
    console.log("SUCCESS:");
    console.log(JSON.stringify(res.data, null, 2));
  })
  .catch(err => {
    console.log("ERROR:");
    console.log(JSON.stringify(err.response ? err.response.data : err.message, null, 2));
  });
