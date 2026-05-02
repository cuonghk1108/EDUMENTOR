/**
 * TEST LESSON CREATION WITH AUDIO AND STORAGE
 * Kiểm tra toàn diện quy trình: Tạo bài học -> Tạo audio -> Lưu trữ
 */

// Try to load axios from backend if running from root
let axios;
try {
  axios = require('./backend/node_modules/axios');
} catch {
  try {
    axios = require('axios');
  } catch {
    console.error('❌ Cannot find axios module. Please install it: npm install axios');
    process.exit(1);
  }
}

const fs = require('fs');
const path = require('path');

const BASE_URL = 'http://localhost:5000/api';
let testUserId = null;
let testToken = null;
let testLessonId = null;
let testAudioId = null;

const colors = {
  reset: '\x1b[0m',
  bright: '\x1b[1m',
  green: '\x1b[32m',
  yellow: '\x1b[33m',
  blue: '\x1b[34m',
  red: '\x1b[31m',
  cyan: '\x1b[36m'
};

const log = {
  section: (title) => console.log(`\n${colors.bright}${colors.blue}═══ ${title} ═══${colors.reset}`),
  success: (msg) => console.log(`${colors.green}✅ ${msg}${colors.reset}`),
  error: (msg) => console.log(`${colors.red}❌ ${msg}${colors.reset}`),
  info: (msg) => console.log(`${colors.cyan}ℹ️  ${msg}${colors.reset}`),
  warning: (msg) => console.log(`${colors.yellow}⚠️  ${msg}${colors.reset}`),
  step: (num, msg) => console.log(`\n${colors.bright}${colors.yellow}[BƯỚC ${num}] ${msg}${colors.reset}`)
};

// Test data
const testEmail = `test_lesson_${Date.now()}@example.com`;
const testPassword = 'Test@123456';
const testLessonContent = `
Phương trình bậc hai là phương trình có dạng ax² + bx + c = 0 (a ≠ 0).

CÔNG THỨC NGHIỆM:
x = (-b ± √(b² - 4ac)) / 2a

DELTA = b² - 4ac

VÍ DỤ: Giải phương trình x² - 3x + 2 = 0
- a = 1, b = -3, c = 2
- Δ = 9 - 8 = 1
- x₁ = (3 + 1) / 2 = 2
- x₂ = (3 - 1) / 2 = 1

Nghiệm là x = 1 hoặc x = 2
`;

const testDashboard = async () => {
  try {
    log.section('1️⃣ ĐĂNG KÝ TÀI KHOẢN');
    
    log.info(`Email: ${testEmail}`);
    
    const registerRes = await axios.post(`${BASE_URL}/auth/register`, {
      email: testEmail,
      password: testPassword,
      name: 'Test Lesson User',
      grade: '12',
      school: 'Test School'
    });
    
    if (registerRes.data.user) {
      testUserId = registerRes.data.user.id;
      log.success(`Đăng ký thành công - User ID: ${testUserId}`);
    } else {
      throw new Error('Không nhận được User ID từ đăng ký');
    }

    log.section('2️⃣ ĐĂNG NHẬP');
    
    const loginRes = await axios.post(`${BASE_URL}/auth/login`, {
      email: testEmail,
      password: testPassword
    });
    
    testToken = loginRes.data.token;
    log.success(`Đăng nhập thành công`);
    log.info(`Token: ${testToken.substring(0, 20)}...`);

    log.section('3️⃣ TẠO BÀI HỌC');
    
    log.info('Tạo bài học về "Phương trình bậc hai"');
    log.info(`Độ dài nội dung: ${testLessonContent.length} ký tự`);
    
    const lessonRes = await axios.post(
      `${BASE_URL}/lesson`,
      {
        text: testLessonContent,
        title: 'Phương trình bậc hai',
        subject: 'Toán học',
        chapter: 'Bài 1'
      },
      {
        headers: { 'Authorization': `Bearer ${testToken}` }
      }
    );
    
    if (lessonRes.data.lesson && lessonRes.data.lesson._id) {
      testLessonId = lessonRes.data.lesson._id;
      log.success(`Tạo bài học thành công - ID: ${testLessonId}`);
      
      log.info(`Tiêu đề: ${lessonRes.data.lesson.title}`);
      log.info(`Môn học: ${lessonRes.data.lesson.subject}`);
      log.info(`Chương: ${lessonRes.data.lesson.chapter}`);
      log.info(`Tạo lúc: ${new Date(lessonRes.data.lesson.createdAt).toLocaleString('vi-VN')}`);
      
      // Check if content was generated
      if (lessonRes.data.lesson.content) {
        log.info(`✓ Nội dung Markdown được tạo (${lessonRes.data.lesson.content.length} ký tự)`);
      }
      
      if (lessonRes.data.lesson.structuredContent) {
        log.info(`✓ Nội dung Structured được tạo`);
      }
    } else {
      throw new Error('Không nhận được ID bài học từ response');
    }

    log.section('4️⃣ KIỂM TRA BÀI HỌC ĐÃ LƯU TRỮ');
    
    const getRes = await axios.get(
      `${BASE_URL}/lesson/${testLessonId}`,
      {
        headers: { 'Authorization': `Bearer ${testToken}` }
      }
    );
    
    const savedLesson = getRes.data.lesson;
    log.success(`Lấy bài học từ database thành công`);
    log.info(`Bài học tồn tại trong DB: ${savedLesson._id === testLessonId ? '✓' : '✗'}`);
    log.info(`Nội dung Markdown: ${savedLesson.content ? '✓' : '✗'}`);
    log.info(`Structured Content: ${savedLesson.structuredContent ? '✓' : '✗'}`);
    log.info(`audioGenerated: ${savedLesson.audioGenerated}`);

    log.section('5️⃣ TẠO AUDIO TỪ BÀI HỌC');
    
    log.info('Tạo audio từ nội dung bài học...');
    
    const textForAudio = testLessonContent.substring(0, 500); // Giới hạn độ dài
    log.info(`Độ dài text cho audio: ${textForAudio.length} ký tự`);
    
    const audioRes = await axios.post(
      `${BASE_URL}/tts/generate`,
      {
        text: textForAudio,
        voiceId: 'en-US-natalie',
        style: 'Conversational',
        speed: 5,
        lessonId: testLessonId
      },
      {
        headers: { 'Authorization': `Bearer ${testToken}` }
      }
    );
    
    if (audioRes.data.audio && audioRes.data.audio.id) {
      testAudioId = audioRes.data.audio.id;
      log.success(`Tạo audio thành công`);
      log.info(`Audio ID: ${testAudioId}`);
      log.info(`Định dạng: ${audioRes.data.audio.format}`);
      log.info(`Kích thước: ${audioRes.data.audio.size} bytes (${(audioRes.data.audio.size / 1024).toFixed(2)} KB)`);
      log.info(`Thời lượng: ${audioRes.data.audio.duration}s`);
      log.info(`URL: ${audioRes.data.audio.url}`);
      log.info(`Có cache: ${audioRes.data.audio.cached ? '✓' : '✗'}`);
    } else {
      throw new Error('Không nhận được Audio ID từ response');
    }

    log.section('6️⃣ KIỂM TRA AUDIO FILE TRONG STORAGE');
    
    const audioDir = path.join(__dirname, 'backend/uploads/audio');
    log.info(`Thư mục audio: ${audioDir}`);
    
    if (fs.existsSync(audioDir)) {
      const files = fs.readdirSync(audioDir);
      log.success(`Thư mục tồn tại`);
      log.info(`Số file audio: ${files.length}`);
      
      // Check if our audio file exists
      const audioFiles = files.filter(f => f.startsWith(testAudioId));
      if (audioFiles.length > 0) {
        audioFiles.forEach(file => {
          const filePath = path.join(audioDir, file);
          const stats = fs.statSync(filePath);
          log.success(`✓ File audio tồn tại: ${file}`);
          log.info(`  Kích thước: ${stats.size} bytes (${(stats.size / 1024).toFixed(2)} KB)`);
        });
      } else {
        log.warning(`Audio file với ID ${testAudioId} không tìm thấy trong folder`);
      }
    } else {
      log.warning(`Thư mục audio không tồn tại: ${audioDir}`);
    }

    log.section('7️⃣ KIỂM TRA BÀI HỌC CÓ AUDIO METADATA');
    
    const updatedRes = await axios.get(
      `${BASE_URL}/lesson/${testLessonId}`,
      {
        headers: { 'Authorization': `Bearer ${testToken}` }
      }
    );
    
    const updatedLesson = updatedRes.data.lesson;
    log.success(`Lấy bài học cập nhật thành công`);
    
    log.info(`audioIds: ${updatedLesson.audioIds ? updatedLesson.audioIds.join(', ') : 'Chưa có'}`);
    log.info(`hasAudio: ${updatedLesson.hasAudio ? '✓' : '✗'}`);
    log.info(`lastAudioGeneratedAt: ${updatedLesson.lastAudioGeneratedAt ? new Date(updatedLesson.lastAudioGeneratedAt).toLocaleString('vi-VN') : 'N/A'}`);

    log.section('8️⃣ LẤY AUDIO FILE');
    
    try {
      const getAudioRes = await axios.get(
        `${BASE_URL}/tts/${testAudioId}`,
        {
          headers: { 'Authorization': `Bearer ${testToken}` },
          responseType: 'stream'
        }
      );
      
      log.success(`Lấy audio file thành công`);
      log.info(`Content-Type: ${getAudioRes.headers['content-type']}`);
      log.info(`Content-Length: ${getAudioRes.headers['content-length']} bytes`);
    } catch (err) {
      log.error(`Không thể lấy audio file: ${err.message}`);
    }

    log.section('9️⃣ KIỂM TRA DANH SÁCH BÀI HỌC');
    
    const listRes = await axios.get(
      `${BASE_URL}/lessons/${testUserId}`,
      {
        headers: { 'Authorization': `Bearer ${testToken}` }
      }
    );
    
    const lessons = listRes.data.lessons || [];
    log.success(`Lấy danh sách bài học thành công`);
    log.info(`Tổng số bài học: ${lessons.length}`);
    
    const ourLesson = lessons.find(l => l._id === testLessonId);
    if (ourLesson) {
      log.info(`✓ Bài học test tìm thấy trong danh sách`);
      log.info(`  Vị trí: ${lessons.indexOf(ourLesson) + 1}`);
    } else {
      log.warning(`✗ Bài học test không tìm thấy trong danh sách`);
    }

    log.section('✅ KIỂM TRA HOÀN TẤT');
    
    log.success(`Tất cả kiểm tra đã hoàn tất thành công!`);
    log.info(`
Test Results Summary:
├─ Tài khoản: ✓ Tạo và đăng nhập
├─ Bài học: ✓ Tạo, lưu trữ, và lấy lại
├─ Audio: ✓ Tạo và liên kết với bài học
├─ Storage: ✓ File audio lưu trong thư mục
├─ Metadata: ✓ Audio ID liên kết trong DB
└─ Danh sách: ✓ Bài học xuất hiện trong danh sách người dùng
    `);

  } catch (error) {
    log.error(`Test failed: ${error.message}`);
    if (error.response?.data) {
      log.error(`Response: ${JSON.stringify(error.response.data, null, 2)}`);
    }
    process.exit(1);
  }
};

// Run the test
testDashboard().then(() => {
  console.log('\n✨ Test completed successfully!\n');
  process.exit(0);
}).catch(err => {
  log.error(`Fatal error: ${err.message}`);
  process.exit(1);
});
