const Database = require('nedb-promises');
const bcrypt = require('bcryptjs');
const path = require('path');

// Initialize NeDB Promises
const users = Database.create({ filename: path.join(__dirname, './database/users.db'), autoload: true });
const learningStats = Database.create({ filename: path.join(__dirname, './database/learningStats.db'), autoload: true });

async function createDemoAccount() {
  try {
    const email = 'demo@edumentor.io.vn';
    const password = '123456';
    const name = 'Demo User';

    // Check if user already exists
    const existingUser = await users.findOne({ email });
    
    if (existingUser) {
      console.log('❌ Tài khoản đã tồn tại: ' + email);
      return;
    }

    // Generate user ID
    const userId = Math.random().toString(36).substring(2, 15) + 
                  Math.random().toString(36).substring(2, 15);

    // Hash password
    const hashedPassword = await bcrypt.hash(password, 10);

    // Insert user
    await users.insert({
      _id: userId,
      email,
      password: hashedPassword,
      name,
      grade: '12',
      school: 'Demo School',
      createdAt: new Date()
    });

    // Initialize learning stats
    await learningStats.insert({
      userId,
      totalLessons: 0,
      completedLessons: 0,
      totalQuizzes: 0,
      correctAnswers: 0,
      totalQuestions: 0,
      streakDays: 0,
      totalMessages: 0,
      perfectScores: 0,
      earlyMorningStudies: 0,
      lateNightStudies: 0
    });

    console.log('✅ Tài khoản demo được tạo thành công!');
    console.log('📧 Email: ' + email);
    console.log('🔑 Mật khẩu: ' + password);
    console.log('👤 ID: ' + userId);

  } catch (error) {
    console.error('❌ Lỗi:', error.message);
  }
}

createDemoAccount();
