// Check database for achievements data
const Datastore = require('nedb-promises');
const path = require('path');

const checkDatabase = async () => {
  try {
    const dataDir = path.join(__dirname, 'database/data');
    const db = {
      users: Datastore.create({ filename: path.join(dataDir, 'users.db'), autoload: true }),
      learningStats: Datastore.create({ filename: path.join(dataDir, 'learning_stats.db'), autoload: true })
    };

    // Find user
    const user = await db.users.findOne({ email: 'cuonghk1108@gmail.com' });
    
    console.log('👤 USER DATABASE:');
    console.log(`   Email: ${user?.email}`);
    console.log(`   Name: ${user?.name}`);
    console.log(`   ID: ${user?._id}`);
    console.log(`   Password hash: ${user?.password ? user.password.substring(0, 20) + '...' : 'N/A'}`);

    // Find stats
    const stats = await db.learningStats.findOne({ userId: user?._id });
    
    console.log('\n📊 LEARNING STATS:');
    if (stats) {
      console.log(`   Total Lessons: ${stats.totalLessons}`);
      console.log(`   Completed Lessons: ${stats.completedLessons}`);
      console.log(`   Total Quizzes: ${stats.totalQuizzes}`);
      console.log(`   Average Score: ${stats.averageScore}`);
      console.log(`   Streak Days: ${stats.streakDays}`);
      console.log(`   Perfect Scores: ${stats.perfectScores}`);
      console.log(`   Total Messages: ${stats.totalMessages}`);
      console.log(`   Early Bird: ${stats.earlyMorningStudies}`);
      console.log(`   Night Owl: ${stats.lateNightStudies}`);
    } else {
      console.log('   ❌ No learning stats found!');
    }

    process.exit(0);
  } catch (error) {
    console.error('❌ Error:', error.message);
    process.exit(1);
  }
};

checkDatabase();
