/**
 * MURF.AI TTS SERVICE
 * Text-to-Speech service using Murf.ai API
 * Hỗ trợ tiếng Việt qua MultiNative feature (Gen2 model)
 * Có cache để tái sử dụng audio
 */

const axios = require('axios');
const path = require('path');
const fs = require('fs').promises;
const audioCache = require('./audioCacheService');

// Murf API Configuration
const MURF_API_KEY = process.env.MURF_API_KEY || '';
const MURF_BASE_URL = 'https://api.murf.ai';
const MURF_GLOBAL_STREAM_URL = 'https://global.api.murf.ai/v1/speech/stream';

// Vietnamese-compatible voices (using MultiNative feature)
// These voices support vi-VN through multiNativeLocale
const VIETNAMESE_VOICES = {
  'Natalie': {
    id: 'en-US-natalie',
    name: 'Natalie',
    gender: 'Female',
    description: 'Giọng nữ tự nhiên, phù hợp cho giảng dạy',
    locale: 'en-US',
    style: 'Conversational',
    multiNativeLocale: 'vi-VN'
  },
  'Clint': {
    id: 'en-US-clint',
    name: 'Clint',
    gender: 'Male',
    description: 'Giọng nam trầm ấm, chuyên nghiệp',
    locale: 'en-US',
    style: 'Conversational',
    multiNativeLocale: 'vi-VN'
  },
  'Julia': {
    id: 'en-US-julia',
    name: 'Julia',
    gender: 'Female',
    description: 'Giọng nữ nhẹ nhàng, thân thiện',
    locale: 'en-US',
    style: 'Conversational',
    multiNativeLocale: 'vi-VN'
  },
  'Ken': {
    id: 'en-US-ken',
    name: 'Ken',
    gender: 'Male',
    description: 'Giọng nam năng động, rõ ràng',
    locale: 'en-US',
    style: 'Conversational',
    multiNativeLocale: 'vi-VN'
  }
};

// Default Vietnamese voice
const DEFAULT_VOICE = 'en-US-natalie';

/**
 * Calculate audio duration from WAV buffer
 * @param {Buffer} audioBuffer - WAV audio buffer
 * @returns {number} Duration in seconds
 */
function calculateAudioDuration(audioBuffer) {
  if (!audioBuffer || audioBuffer.length < 44) {
    return 0; // Invalid WAV file
  }

  try {
    // WAV header structure (little-endian)
    const sampleRate = audioBuffer.readUInt32LE(24);
    const bitsPerSample = audioBuffer.readUInt16LE(34);
    const dataSize = audioBuffer.readUInt32LE(40);
    
    if (sampleRate === 0) {
      return 0;
    }
    
    const bytesPerSample = bitsPerSample / 8;
    const channels = audioBuffer.readUInt16LE(22);
    const numSamples = dataSize / (bytesPerSample * channels);
    const duration = Math.round((numSamples / sampleRate) * 10) / 10;
    
    console.log(`📊 Audio duration: ${duration}s`);
    return duration;
  } catch (error) {
    console.error('Error calculating audio duration:', error.message);
    return 0;
  }
}

/**
 * Validate voice ID
 * @param {string} voiceId - Voice ID to validate
 * @returns {boolean} True if voice is valid
 */
function isValidVoiceId(voiceId) {
  const validIds = Object.values(VIETNAMESE_VOICES).map(v => v.id);
  return validIds.includes(voiceId);
}

/**
 * Get list of available Vietnamese voices
 */
async function getVietnameseVoices() {
  try {
    // Return MultiNative-compatible voices for Vietnamese
    // These are English voices that support Vietnamese through multiNativeLocale
    return Object.values(VIETNAMESE_VOICES);
  } catch (error) {
    console.error('Error fetching voices:', error.message);
    // Return predefined voices on error
    return Object.values(VIETNAMESE_VOICES);
  }
}

/**
 * Clean text for TTS - remove emojis and special characters
 * @param {string} text - Text to clean
 */
function cleanTextForTTS(text) {
  return text
    // Remove emojis
    .replace(/[\u{1F600}-\u{1F64F}]/gu, '') // Emoticons
    .replace(/[\u{1F300}-\u{1F5FF}]/gu, '') // Misc Symbols and Pictographs
    .replace(/[\u{1F680}-\u{1F6FF}]/gu, '') // Transport and Map
    .replace(/[\u{1F1E0}-\u{1F1FF}]/gu, '') // Flags
    .replace(/[\u{2600}-\u{26FF}]/gu, '')   // Misc symbols
    .replace(/[\u{2700}-\u{27BF}]/gu, '')   // Dingbats
    .replace(/[\u{FE00}-\u{FE0F}]/gu, '')   // Variation Selectors
    .replace(/[\u{1F900}-\u{1F9FF}]/gu, '') // Supplemental Symbols
    .replace(/[\u{1FA00}-\u{1FA6F}]/gu, '') // Chess Symbols
    .replace(/[\u{1FA70}-\u{1FAFF}]/gu, '') // Symbols and Pictographs Extended-A
    // Remove mathematical symbols that might cause issues
    .replace(/[≤≥≦≧≠±×÷√∞∑∏∫]/g, (match) => {
      const replacements = {
        '≤': ' nhỏ hơn hoặc bằng ',
        '≥': ' lớn hơn hoặc bằng ',
        '≦': ' nhỏ hơn hoặc bằng ',
        '≧': ' lớn hơn hoặc bằng ',
        '≠': ' khác ',
        '±': ' cộng trừ ',
        '×': ' nhân ',
        '÷': ' chia ',
        '√': ' căn ',
        '∞': ' vô cực ',
        '∑': ' tổng ',
        '∏': ' tích ',
        '∫': ' tích phân '
      };
      return replacements[match] || match;
    })
    // Clean up multiple spaces and newlines
    .replace(/\n+/g, '. ')
    .replace(/\s+/g, ' ')
    .trim();
}

/**
 * Generate speech using Murf API (Non-streaming)
 * @param {string} text - Text to convert to speech
 * @param {object} options - TTS options
 */
async function generateSpeech(text, options = {}) {
  const {
    voiceId = DEFAULT_VOICE,
    style = 'Conversational',
    format = 'MP3',
    sampleRate = 24000,
    rate = 5, // Speech rate (0-10, default 5)
    pitch = 0,
    encodeAsBase64 = false,
    multiNativeLocale = 'vi-VN' // Vietnamese through MultiNative
  } = options;

  if (!MURF_API_KEY) {
    throw new Error('MURF_API_KEY chưa được cấu hình. Vui lòng thêm API key vào file .env');
  }

  // Clean text before sending to API
  const cleanedText = cleanTextForTTS(text);
  console.log(`📝 Original text: ${text.length} chars, Cleaned: ${cleanedText.length} chars`);

  // Build request body according to Murf API spec
  const requestBody = {
    voiceId: voiceId,
    style: style,
    text: cleanedText,
    rate: rate,
    multiNativeLocale: multiNativeLocale // Enable Vietnamese pronunciation
  };

  // Add optional parameters if not default
  if (format !== 'MP3') requestBody.format = format;
  if (sampleRate !== 24000) requestBody.sampleRate = sampleRate;
  if (pitch !== 0) requestBody.pitch = pitch;
  if (encodeAsBase64) requestBody.encodeAsBase64 = true;

  console.log('Murf TTS Request:', JSON.stringify(requestBody, null, 2));

  try {
    const response = await axios.post(
      `${MURF_BASE_URL}/v1/speech/generate`,
      requestBody,
      {
        headers: {
          'api-key': MURF_API_KEY,
          'Content-Type': 'application/json'
        },
        timeout: 60000 // 60 second timeout
      }
    );

    if (encodeAsBase64) {
      // Return base64 encoded audio
      return {
        success: true,
        encodedAudio: response.data.encodedAudio,
        format: format.toLowerCase(),
        duration: response.data.audioDuration
      };
    }

    // Return audio file URL
    return {
      success: true,
      audioFile: response.data.audioFile,
      format: format.toLowerCase(),
      duration: response.data.audioDuration,
      audioLengthInSeconds: response.data.audioLengthInSeconds
    };
  } catch (error) {
    console.error('Murf API Error:', error.response?.data || error.message);
    throw new Error(
      error.response?.data?.errorMessage || 
      error.response?.data?.error ||
      'Lỗi khi tạo audio từ Murf API'
    );
  }
}

/**
 * Generate speech directly (without cleaning - text should already be cleaned)
 * Used internally after text has been cleaned and split
 */
async function generateSpeechDirect(cleanedText, options = {}) {
  const {
    voiceId = DEFAULT_VOICE,
    style = 'Conversational',
    format = 'MP3',
    sampleRate = 24000,
    rate = 5,
    pitch = 0,
    encodeAsBase64 = false,
    multiNativeLocale = 'vi-VN'
  } = options;

  if (!MURF_API_KEY) {
    throw new Error('MURF_API_KEY chưa được cấu hình');
  }

  // Build request body according to Murf API spec
  const requestBody = {
    voiceId: voiceId,
    style: style,
    text: cleanedText,
    rate: rate,
    multiNativeLocale: multiNativeLocale
  };

  // Add optional parameters
  if (encodeAsBase64) requestBody.encodeAsBase64 = true;

  console.log(`🎤 Murf API call: ${cleanedText.length} chars, voice: ${voiceId}`);

  try {
    const response = await axios.post(
      `${MURF_BASE_URL}/v1/speech/generate`,
      requestBody,
      {
        headers: {
          'api-key': MURF_API_KEY,
          'Content-Type': 'application/json'
        },
        timeout: 60000
      }
    );

    return {
      success: true,
      encodedAudio: response.data.encodedAudio,
      audioFile: response.data.audioFile,
      format: format.toLowerCase(),
      duration: response.data.audioDuration
    };
  } catch (error) {
    console.error('Murf API Error:', error.response?.data || error.message);
    throw new Error(
      error.response?.data?.errorMessage || 
      'Lỗi khi tạo audio từ Murf API'
    );
  }
}

// Maximum text length for Murf API
const MAX_TEXT_LENGTH = 2500; // Reduced to account for text expansion after cleaning

/**
 * Generate speech and download to buffer
 * Automatically splits long text into chunks
 * WITH CACHING - Kiểm tra cache trước khi gọi API
 * @param {string} text - Text to convert
 * @param {object} options - TTS options
 */
async function generateSpeechBuffer(text, options = {}) {
  try {
    // IMPORTANT: Clean text FIRST, then check length and split if needed
    const cleanedText = cleanTextForTTS(text);
    console.log(`📝 Original: ${text.length} chars → Cleaned: ${cleanedText.length} chars`);

    // Voice config for cache key
    const voiceConfig = {
      voiceId: options.voiceId || DEFAULT_VOICE,
      style: options.style || 'Conversational',
      rate: options.rate || 5,
      multiNativeLocale: options.multiNativeLocale || 'vi-VN'
    };

    // ========== CHECK CACHE FIRST ==========
    const cacheResult = await audioCache.getCachedAudio(cleanedText, voiceConfig);
    
    if (cacheResult.hit) {
      // Cache HIT - Đọc file từ cache
      console.log('✅ Using cached audio:', cacheResult.textHash.substring(0, 8));
      const audioBuffer = await fs.readFile(cacheResult.filePath);
      return {
        success: true,
        audioBuffer: audioBuffer,
        format: cacheResult.format || 'mp3',
        duration: cacheResult.duration,
        cached: true,
        cacheKey: cacheResult.textHash
      };
    }

    // ========== CACHE MISS - Generate new audio ==========
    console.log('🔄 Cache miss, generating new audio...');

    let audioBuffer;
    let duration = 0;
    let outputFormat = (options.format || 'MP3').toLowerCase();

    // Validate voice ID before generating
    const voiceId = options.voiceId || DEFAULT_VOICE;
    if (!isValidVoiceId(voiceId)) {
      throw new Error(`Invalid voice ID: ${voiceId}. Available voices: ${Object.values(VIETNAMESE_VOICES).map(v => v.id).join(', ')}`);
    }

    // If cleaned text is short enough, generate directly
    if (cleanedText.length <= MAX_TEXT_LENGTH) {
      const result = await generateSpeechDirect(cleanedText, {
        ...options,
        encodeAsBase64: true
      });

      if (result.encodedAudio) {
        audioBuffer = Buffer.from(result.encodedAudio, 'base64');
        outputFormat = result.format || outputFormat;
        duration = result.duration || calculateAudioDuration(audioBuffer);
      } else if (result.audioFile) {
        const audioResponse = await axios.get(result.audioFile, {
          responseType: 'arraybuffer',
          timeout: 30000
        });
        audioBuffer = Buffer.from(audioResponse.data);
        outputFormat = result.format || outputFormat;
        duration = result.duration || calculateAudioDuration(audioBuffer);
      } else {
        throw new Error('Không nhận được dữ liệu audio');
      }
    } else {
      // Split CLEANED text into chunks and generate audio for each
      console.log(`📝 Cleaned text too long (${cleanedText.length} chars), splitting into chunks...`);
      const chunks = splitTextIntoChunks(cleanedText, MAX_TEXT_LENGTH - 100);
      const audioBuffers = [];

      for (let i = 0; i < chunks.length; i++) {
        console.log(`🎤 Processing chunk ${i + 1}/${chunks.length} (${chunks[i].length} chars)`);
        
        const result = await generateSpeechDirect(chunks[i], {
          ...options,
          encodeAsBase64: true
        });

        if (result.encodedAudio) {
          const chunkBuffer = Buffer.from(result.encodedAudio, 'base64');
          audioBuffers.push(chunkBuffer);
          outputFormat = result.format || outputFormat;
          duration += result.duration || calculateAudioDuration(chunkBuffer);
        }
      
        // Small delay between chunks to avoid rate limiting
        if (i < chunks.length - 1) {
          await new Promise(resolve => setTimeout(resolve, 500));
        }
      }

      // Concatenate all audio buffers
      audioBuffer = Buffer.concat(audioBuffers);
      console.log(`✅ Combined ${chunks.length} chunks into ${audioBuffer.length} bytes, total duration: ${duration}s`);
    }

    // ========== SAVE TO CACHE ==========
    const cacheKey = cacheResult.textHash || audioCache.createCacheKey(cleanedText, voiceConfig);
    await audioCache.saveAudioCache(cleanedText, audioBuffer, {
      format: outputFormat,
      duration: duration,
      voiceConfig: voiceConfig
    });

    return {
      success: true,
      audioBuffer: audioBuffer,
      format: outputFormat,
      duration: duration,
      cached: false,
      cacheKey: cacheKey
    };
  } catch (error) {
    console.error('Generate speech buffer error:', error);
    throw error;
  }
}

/**
 * Generate speech using Gen2 streaming API (low latency)
 * @param {string} text - Text to convert
 * @param {object} options - TTS options
 */
async function* streamSpeech(text, options = {}) {
  const {
    voiceId = DEFAULT_VOICE,
    format = 'PCM',
    sampleRate = 24000,
    multiNativeLocale = 'vi-VN',
    style = 'Conversational'
  } = options;

  if (!MURF_API_KEY) {
    throw new Error('MURF_API_KEY chưa được cấu hình');
  }

  try {
    const response = await axios.post(
      MURF_GLOBAL_STREAM_URL,
      {
        text: text,
        voiceId: voiceId,
        model: 'GEN2',
        style: style,
        multiNativeLocale: multiNativeLocale,
        sampleRate: sampleRate,
        format: format
      },
      {
        headers: {
          'api-key': MURF_API_KEY,
          'Content-Type': 'application/json'
        },
        responseType: 'stream',
        timeout: 120000
      }
    );

    // Yield chunks as they come
    for await (const chunk of response.data) {
      yield chunk;
    }
  } catch (error) {
    console.error('Murf Stream Error:', error.response?.data || error.message);
    throw new Error('Lỗi khi streaming audio từ Murf API');
  }
}

/**
 * Check API status and credits
 */
async function checkApiStatus() {
  try {
    if (!MURF_API_KEY) {
      return {
        success: false,
        error: 'API key chưa được cấu hình'
      };
    }

    // Try to get voices as a health check
    const response = await axios.get(`${MURF_BASE_URL}/v1/speech/voices`, {
      headers: {
        'api-key': MURF_API_KEY
      },
      params: {
        model: 'GEN2'
      },
      timeout: 10000
    });

    return {
      success: true,
      voicesAvailable: response.data.length,
      message: 'Murf API đang hoạt động'
    };
  } catch (error) {
    return {
      success: false,
      error: error.response?.data?.message || error.message
    };
  }
}

/**
 * Convert lesson content to speech
 * Break down long text into manageable chunks
 */
async function convertLessonToSpeech(content, options = {}) {
  const {
    voiceId = DEFAULT_VOICE,
    maxChunkLength = 4000
  } = options;

  // Split content into chunks
  const chunks = splitTextIntoChunks(content, maxChunkLength);
  const audioBuffers = [];

  for (const chunk of chunks) {
    const result = await generateSpeechBuffer(chunk, {
      voiceId,
      format: 'MP3'
    });
    audioBuffers.push(result.audioBuffer);
  }

  // Concatenate all buffers
  const combinedBuffer = Buffer.concat(audioBuffers);

  return {
    success: true,
    audioBuffer: combinedBuffer,
    format: 'mp3',
    chunks: chunks.length
  };
}

/**
 * Split text into chunks respecting sentence boundaries
 */
function splitTextIntoChunks(text, maxLength = 4000) {
  const chunks = [];
  const sentences = text.split(/(?<=[.!?])\s+/);
  let currentChunk = '';

  for (const sentence of sentences) {
    if (currentChunk.length + sentence.length <= maxLength) {
      currentChunk += (currentChunk ? ' ' : '') + sentence;
    } else {
      if (currentChunk) {
        chunks.push(currentChunk);
      }
      currentChunk = sentence;
    }
  }

  if (currentChunk) {
    chunks.push(currentChunk);
  }

  return chunks;
}

module.exports = {
  getVietnameseVoices,
  generateSpeech,
  generateSpeechBuffer,
  streamSpeech,
  checkApiStatus,
  convertLessonToSpeech,
  calculateAudioDuration,
  isValidVoiceId,
  VIETNAMESE_VOICES,
  DEFAULT_VOICE
};
