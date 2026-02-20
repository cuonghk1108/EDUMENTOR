const http = require('http');

async function testLogin() {
  return new Promise((resolve) => {
    const loginData = JSON.stringify({
      email: 'demo@edumentor.io.vn',
      password: '123456'
    });

    const options = {
      hostname: 'localhost',
      port: 5000,
      path: '/api/auth/login',
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Content-Length': Buffer.byteLength(loginData)
      }
    };

    const req = http.request(options, (res) => {
      let data = '';

      res.on('data', (chunk) => {
        data += chunk;
      });

      res.on('end', () => {
        console.log('📡 Backend Status:', res.statusCode);
        console.log('📥 Response:', data);
        resolve();
      });
    });

    req.on('error', (error) => {
      console.error('❌ Không thể kết nối tới backend!');
      console.error('   Lỗi:', error.message);
      console.error('\n💡 Hãy khởi động backend bằng: npm start');
      resolve();
    });

    req.write(loginData);
    req.end();
  });
}

testLogin();
