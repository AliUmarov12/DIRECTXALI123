const axios = require('axios');
axios.post('http://localhost:3000/api/ai/chat', { message: 'Hello' })
  .then(res => console.log(res.data))
  .catch(err => console.log(err.response ? err.response.data : err.message));
