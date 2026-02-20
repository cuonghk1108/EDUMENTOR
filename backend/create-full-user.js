// Create a new user with full achievements
const Datastore = require('nedb-promises');
const path = require('path');
const bcrypt = require('bcryptjs');

const createFullUser = async () => {
  try {
    const dataDir = path.join(__dirname, 'database/data');
    const db = {
      users: Datastore.create({ filename: path.join(dataDir, 'users.db'), autoload: true }),
      learningStats: Datastore.create({ filename: path.join(dataDir, 'learning_stats.db'), autoload: true }),
      streaks: Datastore.create({ filename: path.join(dataDir, 'streaks.db'), autoload: true }),
      chatHistory: Datastore.create({ filename: path.join(dataDir, 'chat_history.db'), autoload: true })
    };

    const email = 'cuonghk1108@gmail.com';
    const password = 'Test@123456';
    const name = 'Võ Xuân Cường';

    console.log('🎯 Tạo tài khoản mới với đầy đủ huy hiệu\n');

    // Check if user exists
    let user = await db.users.findOne({ email });
    
    if (user) {
      console.log(`✅ Tài khoản tồn tại: ${user.name}`);
      const userId = user._id;
      
      // Just update stats for existing user
      console.log(`📍 User ID: ${userId}\n`);
      
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

      const numReplaced = await db.learningStats.update(
        { userId },
        maxStats,
        { upsert: true }
      );
      console.log('✅ Cập nhật thống kê học tập');

      // Update streak
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
      console.log('✅ Cập nhật chuỗi học tập');

      // Count existing chat messages
      const existingChats = await db.chatHistory.count({ userId });
      const chatToAdd = Math.max(0, 150 - existingChats);
      
      if (chatToAdd > 0) {
        for (let i = 0; i < chatToAdd; i++) {
          await db.chatHistory.insert({
            userId,
            role: 'user',
            content: `Câu hỏi ${i + 1}?`,
            createdAt: new Date(Date.now() - Math.random() * 30 * 24 * 60 * 60 * 1000)
          });
        }
      }
      console.log(`✅ Chat messages: ${existingChats + chatToAdd}`);

      console.log(`\n📊 Tài khoản cuonghk1108@gmail.com`);
      console.log(`\n🏆 HUY HIỆU: 8/8 ✅`);
      console.log('   ✅ 🎓 Khởi đầu');
      console.log('   ✅ 🔥 Tuần hoàn hảo');
      console.log('   ✅ 💎 Kiên trì tháng');
      console.log('   ✅ 🏆 Quiz Master');
      console.log('   ✅ ⭐ Hoàn hảo');
      console.log('   ✅ 💭 Tò mò');
      console.log('   ✅ 🌅 Chim sớm');
      console.log('   ✅ 🦉 Cú đêm');
      
    } else {
      // Create new user
      console.log('📝 Tạo tài khoản mới...');
      
      const salt = await bcrypt.genSalt(10);
      const hashedPassword = await bcrypt.hash(password, salt);
      
      const newUser = await db.users.insert({
        email,
        password: hashedPassword,
        name,
        grade: '12',
        school: 'THPT',
        avatar: '',
        settings: {
          notifications: true,
          darkMode: false,
          language: 'vi'
        },
        createdAt: new Date(),
        updatedAt: new Date()
      });
      
      const userId = newUser._id;
      console.log(`✅ Tài khoản đã tạo: ${newUser.name}`);
      console.log(`📍 User ID: ${userId}\n`);
      
      // Create learning stats
      await db.learningStats.insert({
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
      });
      console.log('✅ Cập nhật thống kê học tập');
      
      // Create streak
      await db.streaks.insert({
        userId,
        currentStreak: 31,
        longestStreak: 31,
        totalStudyDays: 31,
        lastStudyDate: new Date(),
        createdAt: new Date()
      });
      console.log('✅ Cập nhật chuỗi học tập');
      
      // Add chat messages
      for (let i = 0; i < 150; i++) {
        await db.chatHistory.insert({
          userId,
          role: 'user',
          content: `Câu hỏi ${i + 1}?`,
          createdAt: new Date(Date.now() - Math.random() * 30 * 24 * 60 * 60 * 1000)
        });
      }
      console.log('✅ Thêm 150 tin nhắn AI');

      console.log(`\n📊 Tài khoản đã tạo!`);
      console.log(`   📧 Email: ${email}`);
      console.log(`   🔑 Password: ${password}`);
      console.log(`\n🏆 HUY HIỆU: 8/8 ✅`);
    }
    
    process.exit(0);
  } catch (error) {
    console.error('❌ Error:', error.message);
    console.error(error.stack);
    process.exit(1);
  }
};

createFullUser();
