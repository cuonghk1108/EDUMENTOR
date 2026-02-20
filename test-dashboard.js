// Test dashboard endpoint
const axios = require('axios');

const testDashboard = async () => {
  try {
    // First, let's register and login a test user
    const email = `test_${Date.now()}@example.com`;
    const password = 'Test@123456';
    
    console.log('📝 Registering test user...');
    const registerRes = await axios.post('http://localhost:5000/api/auth/register', {
      email,
      password,
      name: 'Test User',
      grade: '12',
      school: 'Test School'
    });
    
    console.log('✅ Registration successful:', registerRes.data.user?.id);
    
    console.log('\n🔐 Logging in...');
    const loginRes = await axios.post('http://localhost:5000/api/auth/login', {
      email,
      password
    });
    
    const token = loginRes.data.token;
    const userId = loginRes.data.user.id;
    
    console.log('✅ Login successful');
    console.log('Token:', token.substring(0, 20) + '...');
    console.log('User ID:', userId);
    
    console.log('\n📊 Fetching dashboard...');
    const dashboardRes = await axios.get(
      `http://localhost:5000/api/dashboard/${userId}`,
      {
        headers: {
          'Authorization': `Bearer ${token}`
        }
      }
    );
    
    console.log('✅ Dashboard fetched successfully!');
    console.log(JSON.stringify(dashboardRes.data, null, 2));
    
  } catch (error) {
    console.error('❌ Error:', error.response?.data || error.message);
    if (error.response?.status === 401) {
      console.log('❌ Authentication failed - check token');
    }
    if (error.response?.status === 404) {
      console.log('❌ Dashboard endpoint not found - check route');
    }
    process.exit(1);
  }
};

testDashboard();
