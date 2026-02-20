// Create a complete test account with full badges
const Datastore = require('nedb-promises');
const path = require('path');
const bcrypt = require('bcryptjs');

const createTestAccount = async () => {
  try {
    const dataDir = path.join(__dirname, 'database/data');
    const db = {
      users: Datastore.create({ filename: path.join(dataDir, 'users.db'), autoload: true }),
      quizzes: Datastore.create({ filename: path.join(dataDir, 'quizzes.db'), autoload: true }),
      lessons: Datastore.create({ filename: path.join(dataDir, 'lessons.db'), autoload: true }),
      chatHistory: Datastore.create({ filename: path.join(dataDir, 'chat_history.db'), autoload: true }),
      learningStats: Datastore.create({ filename: path.join(dataDir, 'learning_stats.db'), autoload: true }),
      streaks: Datastore.create({ filename: path.join(dataDir, 'streaks.db'), autoload: true })
    };

    const email = 'fullbadges@example.com';
    const password = 'Badges@123';
    const name = 'Full Badges User';

    console.log('🎯 Tạo tài khoản test với đầy đủ badges\n');

    // Hash password
    const salt = await bcrypt.genSalt(10);
    const hashedPassword = await bcrypt.hash(password, salt);

    // Create user
    const user = await db.users.insert({
      email,
      password: hashedPassword,
      name,
      grade: '12',
      school: 'THPT Test',
      avatar: '',
      settings: {
        notifications: true,
        darkMode: false,
        language: 'vi'
      },
      createdAt: new Date(),
      updatedAt: new Date()
    });

    const userId = user._id;

    console.log(`✅ Tài khoản tạo: ${email}`);
    console.log(`📍 User ID: ${userId}\n`);

    // Create 50 quizzes  
    console.log('🧪 Tạo 50 quiz...');
    for (let i = 0; i < 50; i++) {
      const isCorrect = i < 48;
      const hour = Math.random() > 0.6 ? (Math.random() > 0.5 ? 6 : 23) : 12;
      
      await db.quizzes.insert({
        userId,
        topic: ['Toán', 'Vật lý', 'Hóa học','Sinh'][i % 4],
        totalQuestions: 10,
        result: {
          correctAnswers: isCorrect ? 10 : 8,
          totalQuestions: 10,
          score: isCorrect ? 100 : 80
        },
        createdAt: new Date(Date.now() - Math.random() * 32 * 24 * 60 * 60 * 1000 - hour * 60 * 60 * 1000)
      });
    }

    // Create 100 lessons
    console.log('📚 Tạo 100 bài học...');
    for (let i = 0; i < 100; i++) {
      await db.lessons.insert({
        userId,
        title: `Bài ${i + 1}`,
        subject: ['Toán', 'Vật lý', 'Hóa học'][i % 3],
        content: 'Contentz',
        completed: true,
        completedAt: new Date(Date.now() - Math.random() * 32 * 24 * 60 * 60 * 1000),
        createdAt: new Date(Date.now() - 100 * 24 * 60 * 60 * 1000)
      });
    }

    // Create 160 chat messages
    console.log('💬 Tạo 160 tin nhắn...');
    for (let i = 0; i < 160; i++) {
      await db.chatHistory.insert({
        userId,
        role: 'user',
        content: `Q${i}?`,
        createdAt: new Date(Date.now() - Math.random() * 32 * 24 * 60 * 60 * 1000)
      });
    }

    // Create streaks
    console.log('🔥 Cập nhật streak...');
    await db.streaks.insert({
      userId,
      currentStreak: 31,
      longestStreak: 31,
      totalStudyDays: 31,
      lastStudyDate: new Date(),
      updatedAt: new Date()
    });

    // Create learning stats
    console.log('📊 Cập nhật learning stats...');
    await db.learningStats.insert({
      userId,
      totalLessons: 100,
      completedLessons: 100,
      totalQuizzes: 50,
      averageScore: 96,
      totalCorrect: 490,
      totalQuestions: 510,
      topicStats: {},
      weakTopics: [],
      strongTopics: [],
      streakDays: 31,
      lastActiveDate: new Date(),
      createdAt: new Date()
    });

    console.log('\n✅ TÀI KHOẢN TEST ĐÃ SẴN SÀNG:');
    console.log(`\n📧 Email: ${email}`);
    console.log(`🔑 Password: ${password}`);
    console.log(`\n🏆 8/8 BADGES SẴN MỞ KHÓA:`);
    console.log('   ✅ 🎓 Khởi đầu');
    console.log('   ✅ 🔥 Tuần hoàn hảo');
    console.log('   ✅ 💎 Kiên trì tháng');
    console.log('   ✅ 🏆 Quiz Master');
    console.log('   ✅ ⭐ Hoàn hảo');  
    console.log('   ✅ 💭 Tò mò');
    console.log('   ✅ 🌅 Chim sớm');
    console.log('   ✅ 🦉 Cú đêm');

    process.exit(0);
  } catch (error) {
    console.error('❌ Error:', error.message);
    process.exit(1);
  }
};

createTestAccount();
