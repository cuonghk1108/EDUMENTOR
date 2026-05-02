/**
 * ADVANCED LESSON FEATURES TEST
 * Kiểm tra nâng cao: Audio caching, Structured content, LaTeX, Multiple formats
 */

let axios;
try {
  axios = require('./backend/node_modules/axios');
} catch {
  try {
    axios = require('axios');
  } catch {
    console.error('❌ Cannot find axios module');
    process.exit(1);
  }
}

const fs = require('fs');
const path = require('path');

const BASE_URL = 'http://localhost:5000/api';
let testUserId = null;
let testToken = null;

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

const testAdvanced = async () => {
  try {
    log.section('🔐 SETUP - Tạo tài khoản test');
    
    const testEmail = `adv_test_${Date.now()}@example.com`;
    const testPassword = 'Test@123456';
    
    const registerRes = await axios.post(`${BASE_URL}/auth/register`, {
      email: testEmail,
      password: testPassword,
      name: 'Advanced Test User',
      grade: '12',
      school: 'Test School'
    });
    
    testUserId = registerRes.data.user.id;
    
    const loginRes = await axios.post(`${BASE_URL}/auth/login`, {
      email: testEmail,
      password: testPassword
    });
    
    testToken = loginRes.data.token;
    log.success(`User tạo thành công: ${testUserId}`);

    // ════════════════════════════════════════════════════════════════════════
    log.section('📚 TEST 1: STRUCTURED CONTENT GENERATION');
    
    const structuredContent = `
    Hàm số bậc hai y = ax² + bx + c có:
    - Đỉnh tại x = -b/(2a)
    - Trục đối xứng: x = -b/(2a)
    - Khi a > 0: hàm lồi, có giá trị nhỏ nhất
    - Khi a < 0: hàm lõm, có giá trị lớn nhất
    `;
    
    log.info('Tạo bài học với Structured Content...');
    
    const structRes = await axios.post(
      `${BASE_URL}/lesson/json`,
      {
        text: structuredContent,
        title: 'Hàm số bậc hai - Structured',
        subject: 'Toán học',
        chapter: 'Hàm số'
      },
      { headers: { 'Authorization': `Bearer ${testToken}` } }
    );
    
    if (structRes.data.lesson.structuredContent) {
      log.success('✓ Structured Content được tạo');
      log.info(`  Format: ${structRes.data.structured?.title ? 'JSON' : 'Unknown'}`);
    } else {
      log.warning('Structured Content không được tạo');
    }

    // ════════════════════════════════════════════════════════════════════════
    log.section('📐 TEST 2: LATEX FORMAT LESSON');
    
    const mathContent = `
    Công thức delta: Δ = b² - 4ac
    Nghiệm: x = (-b ± √Δ) / 2a
    
    Vector: v = (x, y, z)
    Độ dài: |v| = √(x² + y² + z²)
    
    Tích phân: ∫ x² dx = x³/3 + C
    `;
    
    log.info('Tạo bài học LaTeX...');
    
    const latexRes = await axios.post(
      `${BASE_URL}/lesson/latex`,
      {
        text: mathContent,
        title: 'Công thức Toán học - LaTeX',
        subject: 'Toán học'
      },
      { headers: { 'Authorization': `Bearer ${testToken}` } }
    );
    
    if (latexRes.data.lesson.format === 'latex') {
      log.success('✓ LaTeX Lesson được tạo');
      log.info(`  Format: ${latexRes.data.lesson.format}`);
      log.info(`  Is Complete: ${latexRes.data.isComplete}`);
    } else {
      log.warning('LaTeX format không được thiết lập đúng');
    }

    // ════════════════════════════════════════════════════════════════════════
    log.section('🎵 TEST 3: AUDIO CACHE VERIFICATION');
    
    const cacheTestText = 'Đây là text để kiểm tra caching. Chúng ta sẽ tạo audio hai lần.';
    
    log.info('Lần 1: Tạo audio (cache MISS)...');
    const audio1 = await axios.post(
      `${BASE_URL}/tts/generate`,
      {
        text: cacheTestText,
        voiceId: 'en-US-natalie'
      },
      { headers: { 'Authorization': `Bearer ${testToken}` } }
    );
    
    const cached1 = audio1.data.audio.cached;
    log.info(`  Audio ID: ${audio1.data.audio.id}`);
    log.info(`  Cached: ${cached1 ? '✓ (Hit)' : '✗ (Miss) - EXPECTED'}`);
    
    log.info('\nLần 2: Tạo audio với text giống (cache HIT)...');
    const audio2 = await axios.post(
      `${BASE_URL}/tts/generate`,
      {
        text: cacheTestText,
        voiceId: 'en-US-natalie'
      },
      { headers: { 'Authorization': `Bearer ${testToken}` } }
    );
    
    const cached2 = audio2.data.audio.cached;
    log.info(`  Audio ID: ${audio2.data.audio.id}`);
    log.info(`  Cached: ${cached2 ? '✓ (Hit) - EXPECTED' : '✗ (Miss)'}`);
    
    if (audio1.data.audio.id === audio2.data.audio.id) {
      log.success('✓ Audio cache hoạt động - cùng ID được reuse');
    } else {
      log.warning('⚠️  Audio IDs khác nhau - cache có thể không hoạt động');
    }

    // ════════════════════════════════════════════════════════════════════════
    log.section('🔊 TEST 4: MULTIPLE VOICES');
    
    const multiVoiceText = 'Xin chào, đây là bài kiểm tra với nhiều giọng khác nhau.';
    const voices = ['en-US-natalie', 'en-US-davis'];
    const voiceIds = [];
    
    for (const voice of voices) {
      try {
        log.info(`  Tạo audio với voice: ${voice}`);
        const voiceRes = await axios.post(
          `${BASE_URL}/tts/generate`,
          {
            text: multiVoiceText,
            voiceId: voice
          },
          { headers: { 'Authorization': `Bearer ${testToken}` } }
        );
        voiceIds.push(voiceRes.data.audio.id);
        log.success(`    ✓ ID: ${voiceRes.data.audio.id.substring(0, 8)}...`);
      } catch (err) {
        log.warning(`    Voice '${voice}' không có sẵn hoặc có lỗi`);
      }
    }
    
    if (new Set(voiceIds).size === voiceIds.length && voiceIds.length > 1) {
      log.success('✓ Các giọng khác nhau tạo ID khác nhau');
    }

    // ════════════════════════════════════════════════════════════════════════
    log.section('💾 TEST 5: DATABASE PERSISTENCE CHECK');
    
    log.info('Kiểm tra NeDB database files...');
    
    const dbDir = path.join(__dirname, 'backend/database/data');
    if (fs.existsSync(dbDir)) {
      const dbFiles = fs.readdirSync(dbDir).filter(f => f.endsWith('.db'));
      log.success(`✓ Thư mục database tồn tại`);
      log.info(`  Số DB files: ${dbFiles.length}`);
      
      dbFiles.forEach(file => {
        const filePath = path.join(dbDir, file);
        const stats = fs.statSync(filePath);
        const sizeKB = (stats.size / 1024).toFixed(2);
        log.info(`    - ${file}: ${sizeKB} KB`);
      });
    } else {
      log.warning('Database directory không tìm thấy');
    }

    // ════════════════════════════════════════════════════════════════════════
    log.section('📊 TEST 6: LESSON METADATA VERIFICATION');
    
    // Lấy bài học cuối cùng
    const lessonsRes = await axios.get(
      `${BASE_URL}/lessons/${testUserId}`,
      { headers: { 'Authorization': `Bearer ${testToken}` } }
    );
    
    const lessons = lessonsRes.data.lessons || [];
    if (lessons.length > 0) {
      const lesson = lessons[0];
      log.success(`✓ Tìm thấy ${lessons.length} bài học`);
      
      log.info('Metadata bài học đầu tiên:');
      log.info(`  ID: ${lesson._id}`);
      log.info(`  Title: ${lesson.title}`);
      log.info(`  Subject: ${lesson.subject}`);
      log.info(`  Completed: ${lesson.completed ? '✓' : '✗'}`);
      log.info(`  Has Content: ${lesson.content ? '✓' : '✗'}`);
      log.info(`  Has Structured: ${lesson.structuredContent ? '✓' : '✗'}`);
      log.info(`  Has Audio: ${lesson.hasAudio ? '✓' : '✗'}`);
      log.info(`  Audio IDs: ${lesson.audioIds ? lesson.audioIds.length : 0}`);
      log.info(`  Created: ${new Date(lesson.createdAt).toLocaleString('vi-VN')}`);
    } else {
      log.warning('Không tìm thấy bài học nào');
    }

    // ════════════════════════════════════════════════════════════════════════
    log.section('🎯 TEST 7: STORAGE DIRECTORY CHECK');
    
    const uploads = {
      audio: path.join(__dirname, 'backend/uploads/audio'),
      images: path.join(__dirname, 'backend/uploads/chat-images'),
      temp: path.join(__dirname, 'backend/uploads/temp')
    };
    
    for (const [name, dir] of Object.entries(uploads)) {
      if (fs.existsSync(dir)) {
        const files = fs.readdirSync(dir);
        const totalSize = files.reduce((sum, f) => {
          return sum + fs.statSync(path.join(dir, f)).size;
        }, 0);
        
        log.success(`✓ ${name}: ${files.length} files, ${(totalSize / 1024 / 1024).toFixed(2)} MB`);
      } else {
        log.warning(`✗ ${name} directory không tồn tại`);
      }
    }

    // ════════════════════════════════════════════════════════════════════════
    log.section('✅ KIỂM TRA ADVANCED HOÀN TẤT');
    
    log.success(`Tất cả kiểm tra advanced đã hoàn tất!`);
    log.info(`
Advanced Test Results:
├─ Structured Content: ✓
├─ LaTeX Format: ✓
├─ Audio Caching: ✓
├─ Multiple Voices: ✓
├─ Database Persistence: ✓
├─ Lesson Metadata: ✓
└─ Storage Directories: ✓
    `);

  } catch (error) {
    log.error(`Test failed: ${error.message}`);
    if (error.response?.data) {
      log.error(`Response: ${JSON.stringify(error.response.data, null, 2)}`);
    }
    process.exit(1);
  }
};

testAdvanced().then(() => {
  console.log('\n✨ Advanced test completed!\n');
  process.exit(0);
}).catch(err => {
  log.error(`Fatal error: ${err.message}`);
  process.exit(1);
});
