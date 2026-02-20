// Direct database script to populate cuonghk1108@gmail.com with all achievements
const Datastore = require('nedb-promises');
const path = require('path');

const populateAchievements = async () => {
  try {
    const dataDir = path.join(__dirname, 'database/data');
    const db = {
      users: Datastore.create({ filename: path.join(dataDir, 'users.db'), autoload: true }),
      learningStats: Datastore.create({ filename: path.join(dataDir, 'learning_stats.db'), autoload: true }),
      streaks: Datastore.create({ filename: path.join(dataDir, 'streaks.db'), autoload: true }),
      chatHistory: Datastore.create({ filename: path.join(dataDir, 'chat_history.db'), autoload: true })
    };

    console.log('🎯 Đẩy tài khoản với đầy đủ huy hiệu\n');

    // Find user
    const user = await db.users.findOne({ email: 'cuonghk1108@gmail.com' });
    
    if (!user) {
      console.error('❌ Không tìm thấy user cuonghk1108@gmail.com');
      process.exit(1);
    }

    const userId = user._id;
    console.log(`✅ Tìm thấy user: ${user.name} (${user.email})`);
    console.log(`📍 User ID: ${userId}\n`);

    // Update learning stats to unlock all achievements
    console.log('📊 Cập nhật thống kê học tập...');
    
    const maxStats = {
      userId,
      totalLessons: 100,
      completedLessons: 100,
      totalQuizzes: 50,
      averageScore: 95,
      totalCorrect: 500,
      totalQuestions: 527,
      topicStats: {
        'Toán': { attempts: 20, correct: 19, total: 20 },
        'Vật lý': { attempts: 15, correct: 15, total: 15 },
        'Hóa học': { attempts: 15, correct: 14, total: 15 }
      },
      weakTopics: [],
      strongTopics: [
        { name: 'Toán', level: 'Excellent' },
        { name: 'Vật lý', level: 'Excellent' },
        { name: 'Hóa học', level: 'Very Good' }
      ],
      streakDays: 31,
      lastActiveDate: new Date(),
      perfectScores: 5,
      earlyMorningStudies: 20,
      lateNightStudies: 20,
      totalMessages: 150,
      createdAt: new Date()
    };

    await db.learningStats.update(
      { userId },
      maxStats,
      { upsert: true }
    );
    console.log('   ✅ Bài học: 100/100');
    console.log('   ✅ Quiz: 50');
    console.log('   ✅ Độ chính xác: 95%');
    console.log('   ✅ Điểm cao: 5');
    console.log('   ✅ Tin nhắn AI: 150');
    console.log('   ✅ Học sớm: 20 lần');
    console.log('   ✅ Học đêm: 20 lần');

    // Update streak
    console.log('\n🔥 Cập nhật chuỗi học tập...');
    const streakData = {
      userId,
      currentStreak: 31,
      longestStreak: 31,
      totalStudyDays: 31,
      lastStudyDate: new Date(),
      updatedAt: new Date()
    };
    
    await db.streaks.update(
      { userId },
      streakData,
      { upsert: true }
    );
    console.log('   ✅ Current Streak: 31 ngày');
    console.log('   ✅ Longest Streak: 31 ngày');
    console.log('   ✅ Total Study Days: 31 ngày');

    // Add chat messages
    console.log('\n💬 Thêm 150 tin nhắn AI...');
    const chatMessages = [];
    for (let i = 0; i < 150; i++) {
      chatMessages.push({
        userId,
        role: 'user',
        content: `Câu hỏi ${i + 1}?`,
        createdAt: new Date(Date.now() - Math.random() * 30 * 24 * 60 * 60 * 1000)
      });
    }
    for (const msg of chatMessages) {
      await db.chatHistory.insert(msg);
    }
    console.log('   ✅ Đã thêm 150 tin nhắn');

    console.log('\n🏆 HUY HIỆU ĐÃ MỞ:');
    console.log('   ✅ 🎓 Khởi đầu (1 bài học) - UNLOCK');
    console.log('   ✅ 🔥 Tuần hoàn hảo (7 ngày) - UNLOCK');
    console.log('   ✅ 💎 Kiên trì tháng (30 ngày) - UNLOCK');
    console.log('   ✅ 🏆 Quiz Master (50 quiz) - UNLOCK');
    console.log('   ✅ ⭐ Hoàn hảo (100% score) - UNLOCK');
    console.log('   ✅ 💭 Tò mò (100 câu hỏi) - UNLOCK');
    console.log('   ✅ 🌅 Chim sớm (học sáng sớm) - UNLOCK');
    console.log('   ✅ 🦉 Cú đêm (học đêm khuya) - UNLOCK');

    console.log(`\n✨ Tất cả 8 huy hiệu đã mở khóa!`);
    console.log(`\n🎯 Tài khoản email: cuonghk1108@gmail.com`);
    console.log(`🔑 Mật khẩu: Test@123456`);

    process.exit(0);
  } catch (error) {
    console.error('❌ Error:', error.message);
    console.error(error.stack);
    process.exit(1);
  }
};

populateAchievements();
