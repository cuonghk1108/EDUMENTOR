// Add sample badges to a user by email
const Datastore = require('nedb-promises');
const path = require('path');

const addBadges = async () => {
  try {
    const dataDir = path.join(__dirname, 'database/data');
    const users = Datastore.create({ filename: path.join(dataDir, 'users.db'), autoload: true });

    const email = 'cuonghk1108@gmail.com';
    const user = await users.findOne({ email });
    if (!user) {
      console.error('❌ User not found');
      process.exit(1);
    }

    const now = new Date().toISOString();
    const sampleBadges = [
      { id: 'first_quiz', name: 'First Quiz', xp: 50, unlockedAt: now },
      { id: '10_sessions', name: '10 Sessions', xp: 100, unlockedAt: now },
      { id: 'early_bird', name: 'Early Bird', xp: 100, unlockedAt: now }
    ];

    const merged = Array.isArray(user.badges) ? user.badges.concat(sampleBadges) : sampleBadges;

    await users.update({ _id: user._id }, { $set: { badges: merged } }, { upsert: false });

    console.log(`✅ Added ${sampleBadges.length} badges to ${email}`);
    process.exit(0);
  } catch (err) {
    console.error('❌ Error:', err.message);
    process.exit(1);
  }
};

addBadges();
