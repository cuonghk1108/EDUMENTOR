/**
 * AUDIO CACHE SERVICE
 * Lưu trữ và tái sử dụng audio TTS
 */

const Datastore = require('nedb-promises');
const crypto = require('crypto');
const path = require('path');
const fs = require('fs').promises;

// Database cho audio cache
const audioDb = Datastore.create({
  filename: path.join(__dirname, '../database/data/audio_cache.db'),
  autoload: true
});

// Tạo index cho textHash để tìm kiếm nhanh
audioDb.ensureIndex({ fieldName: 'textHash', unique: true });

// Thư mục lưu file audio
const AUDIO_DIR = path.join(__dirname, '../uploads/audio');

// Đảm bảo thư mục tồn tại
async function ensureAudioDir() {
  try {
    await fs.mkdir(AUDIO_DIR, { recursive: true });
  } catch (error) {
    // Ignore if exists
  }
}

/**
 * Tạo hash từ text và voice config để làm key cache
 */
function createCacheKey(text, voiceConfig = {}) {
  const keyData = JSON.stringify({
    text: text.trim().toLowerCase(),
    voiceId: voiceConfig.voiceId || 'en-US-natalie',
    style: voiceConfig.style || 'Conversational',
    rate: voiceConfig.rate || 5,
    multiNativeLocale: voiceConfig.multiNativeLocale || 'vi-VN'
  });
  return crypto.createHash('md5').update(keyData).digest('hex');
}

/**
 * Kiểm tra xem audio đã được cache chưa
 */
async function getCachedAudio(text, voiceConfig = {}) {
  try {
    const textHash = createCacheKey(text, voiceConfig);
    const cached = await audioDb.findOne({ textHash });
    
    if (cached) {
      // Kiểm tra file còn tồn tại không
      if (cached.filePath) {
        try {
          await fs.access(cached.filePath);
          console.log('🎵 Audio cache HIT:', textHash.substring(0, 8));
          
          // Cập nhật lastUsed
          await audioDb.update(
            { _id: cached._id },
            { $set: { lastUsed: new Date(), useCount: (cached.useCount || 0) + 1 } }
          );
          
          return {
            hit: true,
            filePath: cached.filePath,
            audioUrl: cached.audioUrl,
            duration: cached.duration,
            textHash
          };
        } catch {
          // File không còn, xóa cache entry
          await audioDb.remove({ _id: cached._id });
        }
      }
    }
    
    console.log('🎵 Audio cache MISS:', textHash.substring(0, 8));
    return { hit: false, textHash };
  } catch (error) {
    console.error('Get cached audio error:', error);
    return { hit: false };
  }
}

/**
 * Lưu audio vào cache
 */
async function saveAudioCache(text, audioBuffer, metadata = {}) {
  try {
    await ensureAudioDir();
    
    const textHash = createCacheKey(text, metadata.voiceConfig);
    const fileName = `${textHash}.${metadata.format || 'wav'}`;
    const filePath = path.join(AUDIO_DIR, fileName);
    
    // Lưu file audio
    await fs.writeFile(filePath, audioBuffer);
    
    // Lưu metadata vào database
    const cacheEntry = {
      textHash,
      text: text.substring(0, 500), // Lưu 500 ký tự đầu để debug
      textLength: text.length,
      filePath,
      fileName,
      audioUrl: metadata.audioUrl || null,
      duration: metadata.duration || null,
      format: metadata.format || 'wav',
      voiceConfig: metadata.voiceConfig || {},
      fileSize: audioBuffer.length,
      createdAt: new Date(),
      lastUsed: new Date(),
      useCount: 1
    };
    
    // Upsert - update nếu tồn tại, insert nếu chưa có
    await audioDb.update(
      { textHash },
      cacheEntry,
      { upsert: true }
    );
    
    console.log('💾 Audio cached:', textHash.substring(0, 8), '| Size:', (audioBuffer.length / 1024).toFixed(1), 'KB');
    
    return {
      success: true,
      filePath,
      fileName,
      textHash
    };
  } catch (error) {
    console.error('Save audio cache error:', error);
    return { success: false, error: error.message };
  }
}

/**
 * Lấy audio file path từ hash
 */
async function getAudioByHash(textHash) {
  try {
    const cached = await audioDb.findOne({ textHash });
    if (cached && cached.filePath) {
      await fs.access(cached.filePath);
      return {
        found: true,
        filePath: cached.filePath,
        duration: cached.duration,
        format: cached.format
      };
    }
    return { found: false };
  } catch (error) {
    return { found: false };
  }
}

/**
 * Lấy thống kê cache
 */
async function getCacheStats() {
  try {
    const allCache = await audioDb.find({});
    const totalSize = allCache.reduce((sum, c) => sum + (c.fileSize || 0), 0);
    const totalUses = allCache.reduce((sum, c) => sum + (c.useCount || 0), 0);
    
    return {
      totalEntries: allCache.length,
      totalSizeMB: (totalSize / 1024 / 1024).toFixed(2),
      totalUses,
      savedApiCalls: totalUses - allCache.length // Số lần tiết kiệm API call
    };
  } catch (error) {
    return { error: error.message };
  }
}

/**
 * Xóa cache cũ (older than days)
 */
async function cleanOldCache(days = 30) {
  try {
    const cutoffDate = new Date();
    cutoffDate.setDate(cutoffDate.getDate() - days);
    
    const oldEntries = await audioDb.find({
      lastUsed: { $lt: cutoffDate }
    });
    
    // Xóa files
    for (const entry of oldEntries) {
      try {
        if (entry.filePath) {
          await fs.unlink(entry.filePath);
        }
      } catch {
        // File might not exist
      }
    }
    
    // Xóa database entries
    const removed = await audioDb.remove(
      { lastUsed: { $lt: cutoffDate } },
      { multi: true }
    );
    
    console.log(`🧹 Cleaned ${removed} old cache entries`);
    return { removed };
  } catch (error) {
    console.error('Clean cache error:', error);
    return { error: error.message };
  }
}

module.exports = {
  getCachedAudio,
  saveAudioCache,
  getAudioByHash,
  getCacheStats,
  cleanOldCache,
  createCacheKey,
  AUDIO_DIR
};
