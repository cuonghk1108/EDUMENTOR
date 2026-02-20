const Database = require('nedb-promises');
const bcrypt = require('bcryptjs');
const path = require('path');

const users = Database.create({ filename: path.join(__dirname, './database/data/users.db'), autoload: true });

async function debugLogin() {
  try {
    const email = 'demo@edumentor.io.vn';
    const password = '123456';

    console.log('🔍 Debug Login Process\n');
    console.log('Step 1️⃣: Tìm user bằng email...');
    const user = await users.findOne({ email });
    
    if (!user) {
      console.log('   ❌ Không tìm thấy user');
      console.log('\n📋 Tất cả emails trong database:');
      const allUsers = await users.find({});
      allUsers.forEach(u => console.log(`   - "${u.email}"`));
      return;
    }

    console.log('   ✅ Tìm thấy user');
    console.log(`   ID: ${user._id}`);
    console.log(`   Email: ${user.email}`);
    console.log(`   Name: ${user.name}`);
    
    console.log('\nStep 2️⃣: So sánh mật khẩu...');
    console.log(`   Input password: "${password}"`);
    console.log(`   Stored hash: ${user.password.substring(0, 30)}...`);
    
    const isValid = await bcrypt.compare(password, user.password);
    console.log(`   Compare result: ${isValid}`);
    
    if (!isValid) {
      console.log('\n❌ Mật khẩu không khớp!');
      console.log('Cố gắng khôi phục mật khẩu...');
      const newHash = await bcrypt.hash(password, 10);
      await users.update({ _id: user._id }, { $set: { password: newHash } });
      console.log('✅ Đã cập nhật mật khẩu');
      
      // Verify
      const user2 = await users.findOne({ _id: user._id });
      const isValid2 = await bcrypt.compare(password, user2.password);
      console.log(`   Xác minh lại: ${isValid2}`);
    } else {
      console.log('\n✅ Mật khẩu chính xác! Đăng nhập thành công!');
    }

  } catch (error) {
    console.error('❌ Lỗi:', error.message);
    console.error(error.stack);
  }
}

debugLogin();
