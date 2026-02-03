/**
 * TTS CONTROLLER - Text-to-Speech using Murf.ai API
 * Sử dụng Murf.ai để tạo audio tiếng Việt chất lượng cao
 * Tích hợp cache và lưu database
 */

const murfService = require('../services/murfService');
const audioCache = require('../services/audioCacheService');
const { audioHistoryService, lessonService } = require('../services/firebaseService');
const fs = require('fs').promises;
const path = require('path');
const { v4: uuidv4 } = require('uuid');

// Audio directory - sử dụng chung với cache
const audioDir = audioCache.AUDIO_DIR || path.join(__dirname, '../uploads/audio');
fs.mkdir(audioDir, { recursive: true }).catch(() => {});

/**
 * Get available Vietnamese voices
 */
exports.getVoices = async (req, res) => {
  try {
    const voices = await murfService.getVietnameseVoices();
    
    res.json({
      success: true,
      voices: voices,
      defaultVoice: murfService.DEFAULT_VOICE
    });
  } catch (error) {
    console.error('Get voices error:', error);
    res.status(500).json({ error: error.message });
  }
};

/**
 * Generate audio from text (Text-to-Speech)
 * Sử dụng Murf.ai Gen2 model + Cache
 */
exports.generateAudio = async (req, res) => {
  try {
    const { text, voiceId, style, speed, pitch, lessonId, sectionId } = req.body;
    const userId = req.userId;

    if (!text) {
      return res.status(400).json({ error: 'Vui lòng cung cấp nội dung' });
    }

    // Limit text length
    if (text.length > 10000) {
      return res.status(400).json({ 
        error: 'Nội dung quá dài. Tối đa 10,000 ký tự.' 
      });
    }

    console.log(`🎤 Generating TTS for user ${userId}, text length: ${text.length}`);

    // Generate audio using Murf API (with caching)
    const result = await murfService.generateSpeechBuffer(text, {
      voiceId: voiceId || murfService.DEFAULT_VOICE,
      style: style || 'Conversational',
      rate: parseInt(speed) || 5,
      pitch: parseInt(pitch) || 0,
      format: 'MP3',
      multiNativeLocale: 'vi-VN'
    });

    // Save audio file (nếu chưa được cache)
    let audioId = result.cacheKey;
    let filename = `${audioId}.wav`;
    let filePath = path.join(audioDir, filename);

    // Kiểm tra file đã tồn tại chưa
    try {
      await fs.access(filePath);
      console.log(`✅ Audio already cached: ${filename}`);
    } catch {
      // File chưa tồn tại, lưu mới
      await fs.writeFile(filePath, result.audioBuffer);
      console.log(`✅ Audio saved: ${filename}`);
    }

    // Log vào audio history
    await audioHistoryService.log(userId, {
      lessonId: lessonId || null,
      sectionId: sectionId || null,
      text: text.substring(0, 200),
      cacheKey: audioId,
      duration: result.duration
    });

    // Nếu có lessonId, lưu audioId vào lesson
    if (lessonId) {
      const lesson = await lessonService.getById(lessonId);
      if (lesson) {
        const audioIds = lesson.audioIds || [];
        const audioSections = lesson.audioSections || [];
        
        if (!audioIds.includes(audioId)) {
          audioIds.push(audioId);
        }
        
        // Nếu có sectionId, lưu vào audioSections
        if (sectionId) {
          // Remove old entry for this section if exists
          const filteredSections = audioSections.filter(s => s.sectionId !== sectionId);
          filteredSections.push({
            sectionId,
            audioId,
            url: `/api/tts/${audioId}`,
            duration: result.duration
          });
          
          await lessonService.update(lessonId, { 
            audioIds,
            audioSections: filteredSections,
            hasAudio: true,
            lastAudioGeneratedAt: new Date()
          });
        } else {
          await lessonService.update(lessonId, { 
            audioIds,
            hasAudio: true,
            lastAudioGeneratedAt: new Date()
          });
        }
      }
    }

    res.json({
      success: true,
      audio: {
        id: audioId,
        url: `/api/tts/${audioId}`,
        cacheUrl: `/api/tts/cache/${audioId}`,
        format: 'wav',
        duration: result.duration,
        size: result.audioBuffer.length,
        cached: result.cached || false
      }
    });
  } catch (error) {
    console.error('TTS error:', error);
    res.status(500).json({ error: error.message });
  }
};

/**
 * Get audio file - Hỗ trợ cả cache và file thường
 */
exports.getAudio = async (req, res) => {
  try {
    const { audioId } = req.params;
    
    // Sanitize audioId to prevent path traversal
    const sanitizedId = audioId.replace(/[^a-zA-Z0-9-]/g, '');
    
    // Thử tìm trong cache trước
    const cacheResult = await audioCache.getAudioByHash(sanitizedId);
    if (cacheResult.found) {
      return res.sendFile(cacheResult.filePath);
    }
    
    // Thử tìm file .wav
    let filePath = path.join(audioDir, `${sanitizedId}.wav`);
    try {
      await fs.access(filePath);
      return res.sendFile(filePath);
    } catch {}
    
    // Thử tìm file .mp3
    filePath = path.join(audioDir, `${sanitizedId}.mp3`);
    try {
      await fs.access(filePath);
      return res.sendFile(filePath);
    } catch {}

    return res.status(404).json({ error: 'Không tìm thấy file audio' });
  } catch (error) {
    console.error('Get audio error:', error);
    res.status(500).json({ error: error.message });
  }
};

/**
 * Stream audio generation (using Falcon model for low latency)
 */
exports.streamAudio = async (req, res) => {
  try {
    const { text, voiceId } = req.body;

    if (!text) {
      return res.status(400).json({ error: 'Vui lòng cung cấp nội dung' });
    }

    // Set headers for audio streaming
    res.set({
      'Content-Type': 'audio/pcm',
      'Transfer-Encoding': 'chunked',
      'Cache-Control': 'no-cache'
    });

    // Stream audio chunks
    const audioStream = murfService.streamSpeech(text, {
      voiceId: voiceId || murfService.DEFAULT_VOICE,
      format: 'PCM',
      multiNativeLocale: 'vi-VN'
    });

    for await (const chunk of audioStream) {
      res.write(chunk);
    }

    res.end();
  } catch (error) {
    console.error('Stream audio error:', error);
    if (!res.headersSent) {
      res.status(500).json({ error: error.message });
    } else {
      res.end();
    }
  }
};

/**
 * Convert lesson content to speech
 * Handles long text by splitting into chunks
 * Lưu vào database và liên kết với lesson
 */
exports.convertLessonToSpeech = async (req, res) => {
  try {
    const { lessonId, content, voiceId, sections } = req.body;
    const userId = req.userId;

    if (!content && !sections) {
      return res.status(400).json({ error: 'Vui lòng cung cấp nội dung bài học' });
    }

    console.log(`🎓 Converting lesson to speech for user ${userId}, lessonId: ${lessonId}`);

    const audioResults = [];

    // Nếu có sections (structured content), tạo audio cho từng section
    if (sections && Array.isArray(sections)) {
      for (const section of sections) {
        if (!section.text || section.text.length < 10) continue;
        
        const result = await murfService.generateSpeechBuffer(section.text, {
          voiceId: voiceId || murfService.DEFAULT_VOICE
        });

        const audioId = result.cacheKey;
        
        // Log audio history
        await audioHistoryService.log(userId, {
          lessonId,
          sectionId: section.id,
          sectionType: section.type,
          text: section.text.substring(0, 200),
          cacheKey: audioId,
          duration: result.duration
        });

        audioResults.push({
          sectionId: section.id,
          sectionType: section.type,
          audioId,
          url: `/api/tts/${audioId}`,
          duration: result.duration,
          cached: result.cached
        });
      }
    } else {
      // Tạo audio cho toàn bộ content
      const result = await murfService.generateSpeechBuffer(content, {
        voiceId: voiceId || murfService.DEFAULT_VOICE
      });

      const audioId = result.cacheKey;
      const filename = `lesson_${lessonId}_${audioId}.wav`;
      const filePath = path.join(audioDir, filename);
      
      // Lưu file nếu chưa tồn tại
      try {
        await fs.access(filePath);
      } catch {
        await fs.writeFile(filePath, result.audioBuffer);
      }

      // Log audio history
      await audioHistoryService.log(userId, {
        lessonId,
        sectionId: 'full',
        text: content.substring(0, 200),
        cacheKey: audioId,
        duration: result.duration
      });

      audioResults.push({
        sectionId: 'full',
        audioId,
        url: `/api/tts/${audioId}`,
        duration: result.duration,
        size: result.audioBuffer.length,
        cached: result.cached
      });
    }

    // Cập nhật lesson với thông tin audio
    if (lessonId) {
      const audioIds = audioResults.map(r => r.audioId);
      await lessonService.update(lessonId, { 
        audioIds,
        audioSections: audioResults,
        hasAudio: true,
        audioGeneratedAt: new Date()
      });
    }

    res.json({
      success: true,
      lessonId,
      audioCount: audioResults.length,
      audios: audioResults,
      totalDuration: audioResults.reduce((sum, a) => sum + (a.duration || 0), 0)
    });
  } catch (error) {
    console.error('Convert lesson error:', error);
    res.status(500).json({ error: error.message });
  }
};

/**
 * Check Murf API status
 */
exports.checkStatus = async (req, res) => {
  try {
    const status = await murfService.checkApiStatus();
    res.json(status);
  } catch (error) {
    console.error('Check status error:', error);
    res.status(500).json({ 
      success: false, 
      error: error.message 
    });
  }
};

/**
 * Read text aloud (simple endpoint for quick TTS)
 * Lưu cache và history
 */
exports.readAloud = async (req, res) => {
  try {
    const { text, lessonId, sectionId } = req.body;
    const userId = req.userId;

    if (!text || text.length === 0) {
      return res.status(400).json({ error: 'Vui lòng cung cấp văn bản' });
    }

    if (text.length > 5000) {
      return res.status(400).json({ error: 'Văn bản quá dài (tối đa 5000 ký tự)' });
    }

    // Generate speech (with caching)
    const result = await murfService.generateSpeechBuffer(text, {
      voiceId: murfService.DEFAULT_VOICE,
      format: 'MP3'
    });

    // Log audio history
    if (userId) {
      await audioHistoryService.log(userId, {
        lessonId: lessonId || null,
        sectionId: sectionId || null,
        text: text.substring(0, 200),
        cacheKey: result.cacheKey,
        duration: result.duration
      });
    }

    // Return audio directly
    res.set({
      'Content-Type': 'audio/wav',
      'Content-Length': result.audioBuffer.length,
      'Content-Disposition': 'inline; filename="speech.wav"',
      'X-Audio-Id': result.cacheKey,
      'X-Cached': result.cached ? 'true' : 'false'
    });

    res.send(result.audioBuffer);
  } catch (error) {
    console.error('Read aloud error:', error);
    res.status(500).json({ error: error.message });
  }
};
