async function testQuizAndLesson() {
  try {
    console.log('🧪 Testing Quiz and Lesson Issues\n');

    const API_URL = 'http://localhost:5000/api';

    async function apiCall(method, path, data = null, token = null) {
      const url = `${API_URL}${path}`;
      const options = {
        method,
        headers: {
          'Content-Type': 'application/json',
          ...(token && { Authorization: `Bearer ${token}` })
        }
      };
      
      if (data) {
        options.body = JSON.stringify(data);
      }

      const response = await fetch(url, options);
      const result = await response.json();
      
      if (!response.ok) {
        throw new Error(result.error || `HTTP ${response.status}`);
      }
      
      return result;
    }

    // Step 1: Register/Login
    console.log('1. Logging in...');
    const email = `test_${Date.now()}@test.com`;
    const password = 'Test@123456';
    
    await apiCall('POST', '/auth/register', {
      email,
      password,
      name: 'Test User',
      grade: '12',
      school: 'Test School'
    });

    const loginRes = await apiCall('POST', '/auth/login', {
      email,
      password
    });

    const token = loginRes.token;
    console.log('✅ Login successful\n');

    // Step 2: Generate a quiz
    console.log('2. Generating quiz...');
    const quizRes = await apiCall('POST', '/quiz', {
      text: `Định luật Newton thứ nhất: Một vật đứng yên hoặc chuyển động thẳng đều sẽ giữ nguyên trạng thái đó nếu không có lực tác dụng.
      
Định luật Newton thứ hai: F = ma, trong đó F là lực, m là khối lượng, a là gia tốc.

Định luật Newton thứ ba: Khi vật A tác dụng lên vật B một lực, thì vật B cũng tác dụng lên vật A một lực có cùng độ lớn, cùng phương, ngược chiều.`,
      count: 3,
      topic: 'Định luật Newton',
      subject: 'Vật Lý'
    }, token);

    const quiz = quizRes.quiz;
    console.log('✅ Quiz generated:', quiz.id);
    console.log('📝 Questions structure:');
    quiz.questions.forEach((q, i) => {
      console.log(`   Question ${i}:`, {
        hasId: !!q.id,
        id: q.id,
        question: q.question.substring(0, 50) + '...',
        answer: q.answer
      });
    });
    console.log('');

    // Step 3: Submit quiz with answers
    console.log('3. Submitting quiz...');
    const answers = {};
    quiz.questions.forEach((q, index) => {
      answers[index] = q.answer; // Submit correct answers using index
    });

    console.log('📤 Submitting answers:', answers);

    try {
      const submitRes = await apiCall('POST', '/quiz/submit', {
        quizId: quiz.id,
        answers
      }, token);

      console.log('✅ Quiz submission successful!');
      console.log('📊 Result:', {
        score: submitRes.result.score,
        correctAnswers: submitRes.result.correctAnswers,
        totalQuestions: submitRes.result.totalQuestions
      });
      console.log('');
    } catch (error) {
      console.error('❌ Quiz submission failed:');
      console.error('   Error:', error.message);
      console.log('');
    }

    // Step 4: Generate a lesson
    console.log('4. Generating lesson...');
    const lessonRes = await apiCall('POST', '/lesson', {
      text: `Định luật Newton

**1. Định luật 1 (Quán tính):**
Một vật đứng yên hoặc chuyển động thẳng đều sẽ giữ nguyên trạng thái đó nếu không có lực tác dụng.

**2. Định luật 2:**
Gia tốc của vật tỉ lệ thuận với lực tác dụng và tỉ lệ nghịch với khối lượng:
F = ma

**3. Định luật 3:**
Khi vật A tác dụng lên vật B một lực, thì vật B cũng tác dụng lên vật A một lực có cùng độ lớn, cùng phương, ngược chiều.`,
      title: 'Định luật Newton',
      subject: 'Vật Lý',
      chapter: 'Động lực học'
    }, token);

    const lesson = lessonRes.lesson;
    console.log('✅ Lesson generated:', lesson._id || lesson.id);
    console.log('📚 Lesson structure:', {
      hasContent: !!lesson.content,
      contentLength: lesson.content?.length || 0,
      hasStructuredContent: !!lesson.structuredContent,
      structuredContentType: typeof lesson.structuredContent
    });

    if (!lesson.structuredContent) {
      console.log('⚠️  WARNING: structuredContent is missing!');
      console.log('   This means interactive lesson view will not work.');
    } else {
      console.log('✅ structuredContent exists');
      if (typeof lesson.structuredContent === 'string') {
        try {
          const parsed = JSON.parse(lesson.structuredContent);
          console.log('   Parsed structure has:', Object.keys(parsed));
        } catch (e) {
          console.log('   ❌ Failed to parse structuredContent as JSON');
        }
      } else {
        console.log('   Structure has keys:', Object.keys(lesson.structuredContent));
      }
    }
    console.log('');

    console.log('🎉 All tests completed!');

  } catch (error) {
    console.error('❌ Test failed:');
    console.error('   Message:', error.message);
    if (error.response) {
      console.error('   Status:', error.response.status);
      console.error('   Data:', JSON.stringify(error.response.data, null, 2));
    }
    process.exit(1);
  }
}

testQuizAndLesson();
