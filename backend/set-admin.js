/**
 * Script to set a user as admin
 * Usage: node set-admin.js <email>
 */

const Datastore = require('nedb-promises');
const path = require('path');

const dataDir = path.join(__dirname, 'database/data');
const usersDb = Datastore.create({ filename: path.join(dataDir, 'users.db'), autoload: true });

async function setAdmin(email) {
  if (!email) {
    console.log('Usage: node set-admin.js <email>');
    console.log('Example: node set-admin.js admin@example.com');
    process.exit(1);
  }

  const user = await usersDb.findOne({ email });
  
  if (!user) {
    console.log(`❌ User with email "${email}" not found`);
    
    // List all users
    const allUsers = await usersDb.find({});
    if (allUsers.length > 0) {
      console.log('\nAvailable users:');
      allUsers.forEach(u => {
        console.log(`  - ${u.email} (${u.name}) - Role: ${u.role || 'user'}`);
      });
    } else {
      console.log('\nNo users found in database. Please register a user first.');
    }
    process.exit(1);
  }

  // Update user role to admin
  await usersDb.update({ _id: user._id }, { $set: { role: 'admin', updatedAt: new Date() } });
  
  console.log(`✅ User "${user.name}" (${email}) is now an admin!`);
  console.log(`\nYou can now access the admin panel at /admin`);
}

const email = process.argv[2];
setAdmin(email).catch(console.error);
