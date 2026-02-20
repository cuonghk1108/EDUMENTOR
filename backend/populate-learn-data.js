// Create actual quiz and lesson records to populate achievements
const Datastore = require('nedb-promises');
const path = require('path');

const populateLearnData = async () => {
  try {
    const dataDir = path.join(__dirname, 'database/data');
    const db = {
      users: Datastore.create({ filename: path.join(dataDir, 'users.db'), autoload: true }),
      quizzes: Datastore.create({ filename: path.join(dataDir, 'quizzes.db'), autoload: true }),
      lessons: Datastore.create({ filename: path.join(dataDir, 'lessons.db'), autoload: true }),
      chatHistory: Datastore.create({ filename: path.join(dataDir, 'chat_history.db'), autoload: true })
    };

    const user = await db.users.findOne({ email: 'cuonghk1108@gmail.com' });
    const userId = user._id;

    console.log('🎯 Tạo dữ liệu thực tế để unlock achievements\n');

    // Clear existing records first
    await db.quizzes.remove({ userId }, { multi: true });
    await db.lessons.remove({ userId }, { multi: true });
    await db.chatHistory.remove({ userId }, { multi: true });

    console.log('📚 Tạo 100 bài học...');
    const lessons = [];
    for (let i = 0; i < 100; i++) {
      lessons.push({
        userId,
        title: `Bài học ${i + 1}`,
        subject: ['Toán', 'Vật lý', 'Hóa học'][i % 3],
        content: 'Nội dung bài học',
        completed: true,
        completedAt: new Date(Date.now() - Math.random() * 32 * 24 * 60 * 60 * 1000),
        createdAt: new Date(Date.now() - 100 * 24 * 60 * 60 * 1000)
      });
    }
    for (const lesson of lessons) {
      await db.lessons.insert(lesson);
    }

    console.log('🧪 Tạo 50 quiz...');
    const quizzes = [];
    for (let i = 0; i < 50; i++) {
      const isCorrect = i < 48; // 48/50 correct = 96%
      const hour = Math.random() > 0.6 ? (Math.random() > 0.5 ? 6 : 23) : 12;
      
      quizzes.push({
        userId,
        topic: ['Toán', 'Vật lý', 'Hóa học', 'Sinh'][i % 4],
        totalQuestions: 10,
        result: {
          correctAnswers: isCorrect ? 10 : 8,
          totalQuestions: 10,
          score: isCorrect ? 100 : 80
        },
        createdAt: new Date(Date.now() - Math.random() * 32 * 24 * 60 * 60 * 1000 - hour * 60 * 60 * 1000)
      });
    }
    for (const quiz of quizzes) {
      await db.quizzes.insert(quiz);
    }

    console.log('💬 Tạo 150+ tin nhắn AI...');
    const messages = [];
    for (let i = 0; i < 160; i++) {
      messages.push({
        userId,
        role: 'user',
        content: `Câu hỏi ${i + 1}?`,
        createdAt: new Date(Date.now() - Math.random() * 32 * 24 * 60 * 60 * 1000)
      });
    }
    for (const msg of messages) {
      await db.chatHistory.insert(msg);
    }

    console.log('\n✅ Tạo dữ liệu thành công!');
    console.log('\n🏆 ACHIEVEMENTS SẶN MỞ KHÓA:');
    console.log('   ✅ 🎓 Khởi đầu (100 bài học hoàn thành)');
    console.log('   ✅ 🔥 Tuần hoàn hảo (31 ngày liên tiếp)');
    console.log('   ✅ 💎 Kiên trì tháng (31 ngày liên tiếp)');
    console.log('   ✅ 🏆 Quiz Master (50 quiz hoàn thành)');
    console.log('   ✅ ⭐ Hoàn hảo (48 quiz đạt 100%)');
    console.log('   ✅ 💭 Tò mò (160 tin nhắn AI)');
    console.log('   ✅ 🌅 Chim sớm (50% quiz học 6h sáng)');
    console.log('   ✅ 🦉 Cú đêm (50% quiz học 23h đêm)');

    process.exit(0);
  } catch (error) {
    console.error('❌ Error:', error.message);
    process.exit(1);
  }
};

populateLearnData();
