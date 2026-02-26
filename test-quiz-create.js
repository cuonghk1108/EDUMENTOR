// Test script for quiz creation error
const axios = require('axios');

const testQuizCreation = async () => {
  try {
    const timestamp = Date.now();
    const email = `quiz-test-${timestamp}@example.com`;
    const password = 'Test@123456';

    // Step 1: Register
    console.log('📝 Step 1: Registering test user...');
    const regRes = await axios.post('http://localhost:5000/api/auth/register', {
      email,
      password,
      name: 'Test User',
      grade: '12',
      school: 'Test School'
    });
    console.log('✅ Registered:', regRes.data.user?.id);

    // Step 2: Login
    console.log('\n🔐 Step 2: Logging in...');
    const loginRes = await axios.post('http://localhost:5000/api/auth/login', {
      email,
      password
    });
    const token = loginRes.data.token;
    const userId = loginRes.data.user.id;
    console.log('✅ Logged in | User ID:', userId);

    // Step 3: Generate Quiz
    console.log('\n📋 Step 3: Creating quiz...');
    const quizText = `
Lịch sử Việt Nam là một chủ đề rộng lớn bao gồm nhiều giai đoạn từ thời cổ đại đến hiện đại.
Trong thời kỳ này, Việt Nam đã trải qua sự phát triển, xâm lược, kháng chiến và độc lập.
Các triều đại như Hùng Vương, Trần, Lý, Nguyễn đã góp phần xây dựng nên lịch sử huy hoàng của dân tộc.
    `;

    try {
      const quizRes = await axios.post(
        'http://localhost:5000/api/quiz',
        {
          text: quizText,
          topic: 'Lịch sử Việt Nam',
          lessonId: null
        },
        {
          headers: {
            'Authorization': `Bearer ${token}`,
            'Content-Type': 'application/json'
          }
        }
      );

      console.log('✅ Quiz created successfully!');
      console.log('Quiz ID:', quizRes.data.quiz?.id);
      console.log('Total questions:', quizRes.data.quiz?.totalQuestions);
      console.log('Quiz topic:', quizRes.data.quiz?.topic);
      console.log('\nFull response:');
      console.log(JSON.stringify(quizRes.data, null, 2));
    } catch (quizError) {
      console.error('❌ Quiz creation error:');
      if (quizError.response?.data) {
        console.error('Response status:', quizError.response.status);
        console.error('Response data:', quizError.response.data);
      } else {
        console.error('Error message:', quizError.message);
      }
    }

  } catch (error) {
    console.error('❌ Test error:', error.message);
    if (error.response?.data) {
      console.error('Response data:', error.response.data);
    }
  }
};

testQuizCreation();
