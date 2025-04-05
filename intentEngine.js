const axios = require('axios');

async function predictIntent(message) {
  try {
    const res = await axios.post(
      'https://giadai-jason-intent-api.hf.space/predict',
      { message }
    );
    return res.data; // { intent: "nang_nguc" }
  } catch (err) {
    console.error('❌ Lỗi gọi NLP API:', err.message);
    return { intent: 'unknown' };
  }
}

module.exports = { predictIntent };
