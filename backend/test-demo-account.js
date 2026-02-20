const Database = require('nedb-promises');
const bcrypt = require('bcryptjs');
const path = require('path');

// Check the database
const users = Database.create({ filename: path.join(__dirname, './database/data/users.db'), autoload: true });

async function testDemoAccount() {
  try {
    console.log('🔍 Kiểm tra tài khoản demo...\n');
    
    // Find the demo account
    const user = await users.findOne({ email: 'demo@edumentor.io.vn' });
    
    if (!user) {
      console.log('❌ Không tìm thấy tài khoản: demo@edumentor.io.vn');
      console.log('\n📋 Các tài khoản hiện có:');
      const allUsers = await users.find({});
      allUsers.forEach(u => {
        console.log(`   - ${u.email} (ID: ${u._id})`);
      });
      return;
    }

    console.log('✅ Tìm thấy tài khoản:');
    console.log(`   Email: ${user.email}`);
    console.log(`   ID: ${user._id}`);
    console.log(`   Name: ${user.name}`);
    console.log(`   Hash: ${user.password.substring(0, 20)}...`);
    
    // Test password
    console.log('\n🔐 Kiểm tra mật khẩu...');
    const isValid = await bcrypt.compare('123456', user.password);
    console.log(`   Mật khẩu "123456" hợp lệ: ${isValid ? '✅ CÓ' : '❌ KHÔNG'}`);
    
    if (!isValid) {
      console.log('\n⚠️ Mật khẩu không khớp!');
      console.log('Cố gắng hash lại mật khẩu...');
      
      const newHash = await bcrypt.hash('123456', 10);
      await users.update({ _id: user._id }, { $set: { password: newHash } });
      console.log('✅ Đã cập nhật mật khẩu');
    }

  } catch (error) {
    console.error('❌ Lỗi:', error.message);
  }
}

testDemoAccount();
