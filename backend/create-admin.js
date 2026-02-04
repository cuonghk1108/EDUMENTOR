/**
 * Script to create admin account
 * Usage: node create-admin.js
 */

const { userService } = require('./services/firebaseService');
const { hashPassword } = require('./middleware/auth');

async function createAdmin() {
  const adminData = {
    email: 'admin@edumentor.io.vn',
    password: 'Admin@123456',
    name: 'Administrator',
    grade: '',
    school: 'EduMentor',
    role: 'admin'
  };

  try {
    // Check if admin exists
    const existingUser = await userService.getByEmail(adminData.email);
    if (existingUser) {
      console.log(`⚠️  Admin account already exists: ${adminData.email}`);
      
      // Update to admin role
      await userService.update(existingUser.id, { role: 'admin' });
      console.log(`✅ Updated user to admin role`);
      console.log(`\n📧 Email: ${adminData.email}`);
      console.log(`🔑 Password: (use your existing password)`);
      return;
    }

    // Hash password
    const hashedPassword = await hashPassword(adminData.password);
    
    const userData = {
      ...adminData,
      password: hashedPassword,
      avatar: '',
      settings: {
        notifications: true,
        darkMode: false,
        language: 'vi'
      }
    };

    // Create admin user
    const user = await userService.create(userData);

    console.log(`\n✅ Admin account created successfully!`);
    console.log(`\n━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━`);
    console.log(`📧 Email:    ${adminData.email}`);
    console.log(`🔑 Password: ${adminData.password}`);
    console.log(`━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━`);
    console.log(`\n🔗 Login at: http://localhost:3000/login`);
    console.log(`🔗 Admin panel: http://localhost:3000/admin`);
    console.log(`\n⚠️  Please change your password after first login!`);

  } catch (error) {
    console.error('❌ Error creating admin:', error.message);
    process.exit(1);
  }
}

createAdmin()
  .then(() => process.exit(0))
  .catch(err => {
    console.error(err);
    process.exit(1);
  });
