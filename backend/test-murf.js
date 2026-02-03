/**
 * Test Murf.ai TTS API với Audio Cache
 */
require('dotenv').config();
const murfService = require('./services/murfService');
const audioCache = require('./services/audioCacheService');

async function testTTSWithCache() {
  console.log('🎤 Testing TTS với Audio Cache...\n');
  
  const testText = "Xin chào! Đây là bài test audio cache. Khi bạn nghe lại đoạn này, audio sẽ được lấy từ cache.";
  
  console.log('📝 Text:', testText);
  console.log('📊 Text length:', testText.length, 'chars\n');
  
  // Lần 1 - Sẽ gọi API Murf
  console.log('========== LẦN 1 - Gọi API Murf ==========');
  const start1 = Date.now();
  try {
    const result1 = await murfService.generateSpeechBuffer(testText);
    const time1 = Date.now() - start1;
    console.log('✅ Thành công!');
    console.log('   Cached:', result1.cached ? 'YES (từ cache)' : 'NO (mới tạo)');
    console.log('   Duration:', result1.duration, 'seconds');
    console.log('   Buffer size:', (result1.audioBuffer.length / 1024).toFixed(1), 'KB');
    console.log('   Time:', time1, 'ms');
    console.log('   Cache key:', result1.cacheKey);
  } catch (error) {
    console.error('❌ Lỗi:', error.message);
    return;
  }
  
  // Lần 2 - Sẽ lấy từ cache
  console.log('\n========== LẦN 2 - Lấy từ Cache ==========');
  const start2 = Date.now();
  try {
    const result2 = await murfService.generateSpeechBuffer(testText);
    const time2 = Date.now() - start2;
    console.log('✅ Thành công!');
    console.log('   Cached:', result2.cached ? 'YES (từ cache)' : 'NO (mới tạo)');
    console.log('   Duration:', result2.duration, 'seconds');
    console.log('   Buffer size:', (result2.audioBuffer.length / 1024).toFixed(1), 'KB');
    console.log('   Time:', time2, 'ms');
    console.log('   Cache key:', result2.cacheKey);
  } catch (error) {
    console.error('❌ Lỗi:', error.message);
  }
  
  // Stats
  console.log('\n========== THỐNG KÊ CACHE ==========');
  const stats = await audioCache.getCacheStats();
  console.log('📊 Cache Stats:', stats);
}

testTTSWithCache();
