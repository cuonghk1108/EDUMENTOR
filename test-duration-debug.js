const axios = require('axios');
const baseURL = 'http://localhost:5000/api';

async function test() {
  try {
    // Register and login
    const user = await axios.post(baseURL + '/auth/register', {
      email: 'test_' + Date.now() + '@example.com',
      password: 'Test123!@#'
    });
    
    const login = await axios.post(baseURL + '/auth/login', {
      email: user.data.user.email,
      password: 'Test123!@#'
    });
    
    const token = login.data.token;
    
    console.log('Creating audio for new text...');
    
    // Generate audio with NEW text (cache MISS)
    const audio = await axios.post(baseURL + '/tts/generate', {
      text: 'This is a test for duration calculation with new text that should not be cached'
    }, {
      headers: { 'Authorization': 'Bearer ' + token }
    });
    
    console.log('✅ Audio generated');
    console.log('   Duration:', audio.data.audio.duration);
    console.log('   Size:', audio.data.audio.size);
    console.log('   Cached:', audio.data.audio.cached);
    
  } catch (err) {
    console.error('❌ Error:', err.response?.data || err.message);
  }
}

test();
