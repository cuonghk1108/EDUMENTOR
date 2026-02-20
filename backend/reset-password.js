// Reset password for cuonghk1108@gmail.com
const Datastore = require('nedb-promises');
const path = require('path');
const bcrypt = require('bcryptjs');

const resetPassword = async () => {
  try {
    const dataDir = path.join(__dirname, 'database/data');
    const db = {
      users: Datastore.create({ filename: path.join(dataDir, 'users.db'), autoload: true })
    };

    const email = 'cuonghk1108@gmail.com';
    const newPassword = 'Test@123456';

    // Hash password using async function
    const salt = await bcrypt.genSalt(10);
    const hashedPassword = await bcrypt.hash(newPassword, salt);

    // Update user - use proper update syntax
    const numReplaced = await db.users.update(
      { email },
      { $set: { password: hashedPassword } },
      {}
    );

    if (numReplaced === 0) {
      console.error(`❌ User ${email} not found`);
      process.exit(1);
    }

    console.log(`✅ Password reset for ${email}`);
    console.log(`🔑 New password: ${newPassword}`);

    process.exit(0);
  } catch (error) {
    console.error('❌ Error:', error.message);
    process.exit(1);
  }
};

resetPassword();
