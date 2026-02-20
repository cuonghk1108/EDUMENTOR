const Database = require('nedb-promises');
const bcrypt = require('bcryptjs');
const path = require('path');

// Use the CORRECT database path that firebaseService uses
const users = Database.create({ filename: path.join(__dirname, './database/data/users.db'), autoload: true });
const learningStats = Database.create({ filename: path.join(__dirname, './database/data/learning_stats.db'), autoload: true });

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
    const newUser = await users.insert({
      email,
      password: hashedPassword,
      name,
      grade: '12',
      school: 'Demo School',
      avatar: '',
      settings: {
        notifications: true,
        darkMode: false,
        language: 'vi'
      },
      createdAt: new Date(),
      updatedAt: new Date()
    });

    // Initialize learning stats
    await learningStats.insert({
      userId: newUser._id,
      totalLessons: 0,
      completedLessons: 0,
      totalQuizzes: 0,
      correctAnswers: 0,
      totalQuestions: 0,
      streakDays: 0,
      totalMessages: 0,
      perfectScores: 0,
      earlyMorningStudies: 0,
      lateNightStudies: 0,
      createdAt: new Date(),
      updatedAt: new Date()
    });

    console.log('✅ Tài khoản demo được tạo thành công!');
    console.log('📧 Email: ' + email);
    console.log('🔑 Mật khẩu: ' + password);
    console.log('👤 ID: ' + newUser._id);
    console.log('📍 Database: ./database/data/users.db');

  } catch (error) {
    console.error('❌ Lỗi:', error.message);
  }
}

createDemoAccount();
