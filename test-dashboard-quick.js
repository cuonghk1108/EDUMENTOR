// Quick test for dashboard API
const axios = require('axios');

const testDashboardAPI = async () => {
  try {
    const timestamp = Date.now();
    const email = `dashboard-test-${timestamp}@example.com`;
    const password = 'Test@123456';

    // Register
    console.log('📝 Registering test user...');
    const regRes = await axios.post('http://localhost:5000/api/auth/register', {
      email,
      password,
      name: 'Test User',
      grade: '12',
      school: 'Test School'
    });
    console.log('✅ Registered:', regRes.data.user?.id);

    // Login
    console.log('\n🔐 Logging in...');
    const loginRes = await axios.post('http://localhost:5000/api/auth/login', {
      email,
      password
    });
    const token = loginRes.data.token;
    const userId = loginRes.data.user.id;
    console.log('✅ Logged in | Token:', token.substring(0, 15) + '...');

    // Get Dashboard
    console.log('\n📊 Fetching dashboard...');
    const dashRes = await axios.get(`http://localhost:5000/api/dashboard/${userId}`, {
      headers: { 'Authorization': `Bearer ${token}` }
    });
    
    console.log('✅ Dashboard loaded!');
    console.log(JSON.stringify(dashRes.data, null, 2).substring(0, 500) + '...');
    
    process.exit(0);
  } catch (error) {
    console.error('❌ Error:', error.response?.data?.error || error.message);
    if (error.response?.status === 500) {
      console.log('\n📋 Server Error Details:', error.response.data);
    }
    process.exit(1);
  }
};

testDashboardAPI();
