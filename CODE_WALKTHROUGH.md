# Code Walkthrough - Implementation Details

## Table of Contents
1. [Lesson Controller - Core Logic](#lesson-controller)
2. [TTS Controller - Audio Generation](#tts-controller)
3. [Murf Service - API Integration](#murf-service)
4. [Audio Cache Service - Caching Logic](#audio-cache-service)
5. [Firebase Service - Database Operations](#firebase-service)

---

## Lesson Controller

### File: `backend/controllers/lessonController.js`

#### Core Function: `generateLessonForUser()`

This is the heart of lesson creation. All lesson endpoints funnel through this function.

```javascript
// Lines 4-33
const generateLessonForUser = async ({ userId, text, title, subject, chapter }) => {
  // STEP 1: Generate markdown content from text
  // This calls the AI service to convert input text into a structured markdown lesson
  const markdownResult = await aiService.generateLesson(text);
  
  // STEP 2: Try to generate structured JSON (but fallback if fails)
  let structuredContent = null;
  try {
    // Structured content is better for interactive lessons, but it's optional
    const structuredResult = await aiService.generateLessonStructured(text);
    structuredContent = structuredResult.lesson;
  } catch (structuredError) {
    // Important: Catch error and continue instead of crashing
    // This ensures lessons are ALWAYS created even if structured generation fails
    console.warn('⚠️ Structured generation failed, fallback to markdown only:', 
                 structuredError.message);
  }
  
  // STEP 3: Build the lesson data object
  const lessonData = {
    userId,
    title: title || 'Bài học mới',        // Default title if not provided
    subject: subject || 'Chung',           // Default subject
    chapter: chapter || '',                // Empty chapter is OK
    originalText: text,                    // Store original for reference/customization
    content: markdownResult.content,       // The generated markdown
    structuredContent: structuredContent,  // JSON structure (null if generation failed)
    completed: false,                      // Not completed yet
    audioGenerated: false,                 // Audio not generated yet
    createdAt: new Date()
  };
  
  // STEP 4: Save to database
  const savedLesson = await lessonService.create(lessonData);
  
  // STEP 5: Update user's learning statistics
  // This increments their lesson count and may update streak
  await learningStatsService.incrementLessonCount(userId);
  
  return {
    lesson: savedLesson,
    usage: markdownResult.usage  // Token usage info for cost tracking
  };
};
```

**Key Points:**
- **Defensive Programming**: Structured content failure doesn't crash lesson creation
- **Fallback Design**: Always returns a lesson with at least markdown content
- **Stats Tracking**: Automatically updates user learning stats
- **Cost Transparency**: Returns API usage information

---

#### Endpoint: `POST /lesson`

```javascript
// Lines 41-60
exports.generateLesson = async (req, res) => {
  try {
    // Extract from request body
    const { text, title, subject, chapter } = req.body;
    const userId = req.userId;  // From JWT token
    
    // INPUT VALIDATION: Text is required
    if (!text) {
      return res.status(400).json({ error: 'Vui lòng cung cấp nội dung' });
    }
    
    // CALL CORE LOGIC
    const generated = await generateLessonForUser({ userId, text, title, subject, chapter });
    
    // RETURN RESPONSE
    res.json({
      success: true,
      lesson: generated.lesson,
      usage: generated.usage
    });
  } catch (error) {
    console.error('Generate lesson error:', error);
    res.status(500).json({ error: error.message });
  }
};
```

**Error Handling:**
- 400: Missing required `text` field
- 500: Unexpected error (AI service down, DB error, etc.)

---

#### Endpoint: `POST /lesson/json` - Structured Format

```javascript
// Lines 244-282
exports.generateLessonStructured = async (req, res) => {
  try {
    const { text, title, subject, chapter } = req.body;
    const userId = req.userId;
    
    if (!text) {
      return res.status(400).json({ error: 'Vui lòng cung cấp nội dung' });
    }
    
    // Generate structured JSON format
    const result = await aiService.generateLessonStructured(text);
    
    // Save with explicit format marker
    const lessonData = {
      userId,
      title: result.lesson.title || title || 'Bài học',
      subject: result.lesson.subject || subject || 'Toán',
      chapter: result.lesson.chapter || chapter || '',
      originalText: text,
      content: JSON.stringify(result.lesson),      // Store as string
      structuredContent: result.lesson,             // Also store parsed object
      format: 'json',                               // Mark format
      completed: false,
      createdAt: new Date()
    };
    
    const savedLesson = await lessonService.create(lessonData);
    await learningStatsService.incrementLessonCount(userId);
    
    res.json({
      success: true,
      lesson: savedLesson,
      structured: result.lesson,  // Return both
      format: 'json',
      usage: result.usage
    });
  } catch (error) {
    console.error('Generate structured lesson error:', error);
    res.status(500).json({ error: error.message });
  }
};
```

**Why dual storage?**
- `content`: JSON string (for compatibility)
- `structuredContent`: Parsed object (for direct use in frontend)

---

#### Endpoint: `POST /process-sgk` - 3-in-1 Flow

```javascript
// Lines 61-159 (partial)
router.post('/process-sgk', verifyToken, uploadWithTotalSizeLimit('file', 1), async (req, res) => {
  try {
    const ocrService = require('../services/ocrService');
    const aiService = require('../services/aiService');
    const { lessonService, learningStatsService } = require('../services/firebaseService');
    
    // === STEP 1: VALIDATE FILE ===
    if (!req.file) {
      return res.status(400).json({ error: 'Không có file được upload' });
    }
    
    const { title, subject, chapter, customPrompt = '' } = req.body;
    const userId = req.userId;
    
    console.log('📝 Process SGK - userId:', userId, 'title:', title);
    
    // === STEP 2: OCR PROCESSING ===
    console.log('🔍 Step 1: Processing OCR...');
    const ocrResult = await ocrService.processFile(req.file.path);
    
    // === VALIDATION: Check OCR quality ===
    if (!ocrResult.text || ocrResult.text.length < 50) {
      return res.status(400).json({ 
        error: 'Không thể đọc nội dung từ file. Vui lòng thử lại với ảnh rõ hơn.' 
      });
    }
    
    // === STEP 3: PREPARE TEXT FOR AI ===
    let textToProcess = ocrResult.text;
    if (customPrompt && customPrompt.trim()) {
      // Combine user's custom request with OCR text
      textToProcess = `[YÊU CẦU RIÊNG CỦA NGƯỜI DÙNG]: ${customPrompt.trim()}\n\n[NỘI DUNG SGK]:\n${ocrResult.text}`;
    }
    
    // === STEP 4: DUAL AI GENERATION ===
    console.log('✨ Step 2: Generating lesson with AI...');
    
    const lessonData = {};
    
    // Always generate markdown (main format)
    const markdownResult = await aiService.generateLesson(textToProcess);
    lessonData.content = markdownResult.content || '';
    
    // Try to generate structured (but don't fail if it doesn't work)
    try {
      const structuredResult = await aiService.generateLessonStructured(textToProcess);
      lessonData.structuredContent = structuredResult.lesson || null;
    } catch (structuredError) {
      console.warn('⚠️ Structured generation failed, fallback to markdown only:', 
                   structuredError.message);
      lessonData.structuredContent = null;
    }
    
    // === STEP 5: SAVE TO DATABASE ===
    console.log('💾 Step 3: Saving to database...');
    const lesson = await lessonService.create({
      userId,
      title: title || 'Bài học mới',
      subject: subject || 'Chung',
      chapter: chapter || '',
      ...lessonData,
      sourceText: ocrResult.text.substring(0, 5000),  // Store original OCR
      customPrompt: customPrompt || '',
      ocrConfidence: ocrResult.confidence,
      completed: false
    });
    
    // === STEP 6: UPDATE STATS ===
    await learningStatsService.incrementLessonCount(userId);
    
    // === RETURN RESPONSE ===
    res.json({
      success: true,
      message: 'Xử lý SGK thành công!',
      lesson: { ...lesson, ...lessonData },
      ocrText: ocrResult.text,
      ocrConfidence: ocrResult.confidence
    });
    
  } catch (error) {
    console.error('Process SGK error:', error);
    res.status(500).json({ error: error.message || 'Lỗi xử lý file' });
  }
});
```

**Design Pattern**: Request → OCR → Text Prep → AI Generation → DB Save → Response

**Logging**: Notice the console.log statements - they help trace execution in production

---

## TTS Controller

### File: `backend/controllers/ttsController.js`

#### Endpoint: `POST /tts` - Generate Audio

```javascript
// Lines 25-102
exports.generateAudio = async (req, res) => {
  try {
    const { text, voiceId, style, speed, pitch, lessonId, sectionId } = req.body;
    const userId = req.userId;
    
    // === VALIDATION ===
    if (!text) {
      return res.status(400).json({ error: 'Vui lòng cung cấp nội dung' });
    }
    
    // IMPORTANT: Limit text length for Murf API
    if (text.length > 10000) {
      return res.status(400).json({ 
        error: 'Nội dung quá dài. Tối đa 10,000 ký tự.' 
      });
    }
    
    console.log(`🎤 Generating TTS for user ${userId}, text length: ${text.length}`);
    
    // === CALL TTS SERVICE ===
    // This handles caching internally
    const result = await murfService.generateSpeechBuffer(text, {
      voiceId: voiceId || murfService.DEFAULT_VOICE,  // en-US-natalie
      style: style || 'Conversational',
      rate: parseInt(speed) || 5,
      pitch: parseInt(pitch) || 0,
      format: 'MP3',
      multiNativeLocale: 'vi-VN'  // Force Vietnamese
    });
    
    // === EXTRACT METADATA ===
    let audioId = result.cacheKey;  // MD5 hash from cache service
    let filename = `${audioId}.wav`;
    let filePath = path.join(audioDir, filename);
    
    // === CHECK IF FILE ALREADY EXISTS ===
    // This handles cases where generation was cached
    try {
      await fs.access(filePath);
      console.log(`✅ Audio already cached: ${filename}`);
    } catch {
      // File doesn't exist yet, save it
      await fs.writeFile(filePath, result.audioBuffer);
      console.log(`✅ Audio saved: ${filename}`);
    }
    
    // === LOG TO AUDIO HISTORY ===
    // This tracks when audio was generated/played
    await audioHistoryService.log(userId, {
      lessonId: lessonId || null,
      sectionId: sectionId || null,
      text: text.substring(0, 200),
      cacheKey: audioId,
      duration: result.duration
    });
    
    // === OPTIONAL: LINK TO LESSON ===
    // If user provided a lessonId, update the lesson with audio metadata
    if (lessonId) {
      const lesson = await lessonService.getById(lessonId);
      if (lesson) {
        const audioIds = lesson.audioIds || [];
        const audioSections = lesson.audioSections || [];
        
        // Add this audio to lesson's audio list (avoid duplicates)
        if (!audioIds.includes(audioId)) {
          audioIds.push(audioId);
        }
        
        // If user specified a section, track which section has which audio
        if (sectionId) {
          // Remove old mapping for this section
          const filteredSections = audioSections.filter(s => s.sectionId !== sectionId);
          
          // Add new mapping
          filteredSections.push({
            sectionId,
            audioId,
            url: `/api/tts/${audioId}`,
            duration: result.duration
          });
          
          // Update lesson in database
          await lessonService.update(lessonId, { 
            audioIds,
            audioSections: filteredSections,
            hasAudio: true,
            lastAudioGeneratedAt: new Date()
          });
        } else {
          // No specific section, just mark lesson has audio
          await lessonService.update(lessonId, { 
            audioIds,
            hasAudio: true,
            lastAudioGeneratedAt: new Date()
          });
        }
      }
    }
    
    // === RETURN RESPONSE ===
    res.json({
      success: true,
      audio: {
        id: audioId,
        url: `/api/tts/${audioId}`,                // For downloading
        cacheUrl: `/api/tts/cache/${audioId}`,    // Direct cache access
        format: 'wav',
        duration: result.duration,                 // Seconds
        size: result.audioBuffer.length,          // Bytes
        cached: result.cached || false            // Did it come from cache?
      }
    });
    
  } catch (error) {
    console.error('TTS error:', error);
    res.status(500).json({ error: error.message });
  }
};
```

**Key Design Decisions:**
1. **Cache Handling**: Done by murfService, not here
2. **Lesson Linking**: Optional - can generate audio without lessonId
3. **Section Mapping**: Tracks which audio goes with which section
4. **Error Handling**: Returns error messages, doesn't crash

---

#### Endpoint: `GET /tts/:audioId` - Retrieve Audio

```javascript
// Lines 127-157
exports.getAudio = async (req, res) => {
  try {
    const { audioId } = req.params;
    
    // === SECURITY: SANITIZE INPUT ===
    // Remove any characters that could be used for path traversal
    // e.g., "../../../etc/passwd" becomes "etcpasswd"
    const sanitizedId = audioId.replace(/[^a-zA-Z0-9-]/g, '');
    
    // === ATTEMPT 1: Check cache database ===
    // The cache service maintains an index for fast lookups
    const cacheResult = await audioCache.getAudioByHash(sanitizedId);
    if (cacheResult.found) {
      return res.sendFile(cacheResult.filePath);
    }
    
    // === ATTEMPT 2: Look for .wav file ===
    let filePath = path.join(audioDir, `${sanitizedId}.wav`);
    try {
      await fs.access(filePath);
      return res.sendFile(filePath);
    } catch {}
    
    // === ATTEMPT 3: Look for .mp3 file ===
    // Some older audio might be in MP3 format
    filePath = path.join(audioDir, `${sanitizedId}.mp3`);
    try {
      await fs.access(filePath);
      return res.sendFile(filePath);
    } catch {}
    
    // === NOT FOUND ===
    return res.status(404).json({ error: 'Không tìm thấy file audio' });
    
  } catch (error) {
    console.error('Get audio error:', error);
    res.status(500).json({ error: error.message });
  }
};
```

**Security Note**: The sanitization step prevents **path traversal attacks**
- Malicious input: `../../../etc/passwd`
- After sanitization: `etcpasswd`
- Result: Safe file lookup

---

#### Endpoint: `POST /tts/lesson` - Convert Lesson to Speech

```javascript
// Lines 180-245
exports.convertLessonToSpeech = async (req, res) => {
  try {
    const { lessonId, content, voiceId, sections } = req.body;
    const userId = req.userId;
    
    // === VALIDATION ===
    if (!content && !sections) {
      return res.status(400).json({ error: 'Vui lòng cung cấp nội dung bài học' });
    }
    
    console.log(`🎓 Converting lesson to speech for user ${userId}, lessonId: ${lessonId}`);
    
    const audioResults = [];
    
    // === CASE 1: STRUCTURED CONTENT (Multiple sections) ===
    if (sections && Array.isArray(sections)) {
      for (const section of sections) {
        // Skip empty sections
        if (!section.text || section.text.length < 10) continue;
        
        console.log(`🎤 Processing section: ${section.type}`);
        
        // Generate audio for this section
        const result = await murfService.generateSpeechBuffer(section.text, {
          voiceId: voiceId || murfService.DEFAULT_VOICE
        });
        
        const audioId = result.cacheKey;
        
        // === LOG USAGE ===
        await audioHistoryService.log(userId, {
          lessonId,
          sectionId: section.id,
          sectionType: section.type,
          text: section.text.substring(0, 200),
          cacheKey: audioId,
          duration: result.duration
        });
        
        // === TRACK RESULT ===
        audioResults.push({
          sectionId: section.id,
          sectionType: section.type,
          audioId,
          url: `/api/tts/${audioId}`,
          duration: result.duration,
          cached: result.cached
        });
      }
    } 
    // === CASE 2: FULL CONTENT (Single audio) ===
    else {
      const result = await murfService.generateSpeechBuffer(content, {
        voiceId: voiceId || murfService.DEFAULT_VOICE
      });
      
      const audioId = result.cacheKey;
      const filename = `lesson_${lessonId}_${audioId}.wav`;
      const filePath = path.join(audioDir, filename);
      
      // Save file if not already cached
      try {
        await fs.access(filePath);
      } catch {
        await fs.writeFile(filePath, result.audioBuffer);
      }
      
      // Log usage
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
        cached: result.cached
      });
    }
    
    // === UPDATE LESSON (only if sections provided) ===
    // This links the audio back to the lesson
    if (sections) {
      await lessonService.update(lessonId, {
        audioSections: audioResults,
        hasAudio: true,
        lastAudioGeneratedAt: new Date()
      });
    }
    
    // === RETURN RESPONSE ===
    res.json({
      success: true,
      audios: audioResults,
      totalDuration: audioResults.reduce((sum, a) => sum + (a.duration || 0), 0),
      message: `Generated ${audioResults.length} audio sections`
    });
    
  } catch (error) {
    console.error('TTS lesson error:', error);
    res.status(500).json({ error: error.message });
  }
};
```

**Design Pattern**: 
- Handle both structured (sections) and unstructured (full content) inputs
- Generate audio for each section independently
- Track which section has which audio
- Return complete mapping for frontend

---

## Murf Service

### File: `backend/services/murfService.js`

#### Text Cleaning Function

```javascript
// Lines 79-114
function cleanTextForTTS(text) {
  return text
    // === REMOVE EMOJIS ===
    // These cause TTS API errors, so we remove them preemptively
    .replace(/[\u{1F600}-\u{1F64F}]/gu, '') // Emoticons
    .replace(/[\u{1F300}-\u{1F5FF}]/gu, '') // Misc Symbols
    .replace(/[\u{1F680}-\u{1F6FF}]/gu, '') // Transport and Map
    .replace(/[\u{1F1E0}-\u{1F1FF}]/gu, '') // Flags
    .replace(/[\u{2600}-\u{26FF}]/gu, '')   // Misc symbols
    .replace(/[\u{2700}-\u{27BF}]/gu, '')   // Dingbats
    .replace(/[\u{FE00}-\u{FE0F}]/gu, '')   // Variation Selectors
    .replace(/[\u{1F900}-\u{1F9FF}]/gu, '') // Supplemental Symbols
    .replace(/[\u{1FA00}-\u{1FA6F}]/gu, '') // Chess Symbols
    .replace(/[\u{1FA70}-\u{1FAFF}]/gu, '') // Symbols Extended-A
    
    // === REPLACE MATHEMATICAL SYMBOLS ===
    // Murf TTS doesn't understand math symbols, so convert to words
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
    
    // === CLEAN UP WHITESPACE ===
    // TTS API doesn't like multiple newlines or spaces
    .replace(/\n+/g, '. ')         // Convert newlines to periods
    .replace(/\s+/g, ' ')          // Collapse multiple spaces
    .trim();                        // Remove leading/trailing whitespace
}
```

**Why This Matters:**
- Emojis cause TTS API to crash or return garbled audio
- Math symbols need to be spelled out for natural-sounding speech
- The AI-generated lessons often contain these, so preprocessing is essential

---

#### Main Generation Function: `generateSpeechBuffer()`

```javascript
// Lines 176-265
async function generateSpeechBuffer(text, options = {}) {
  try {
    // === STEP 1: CLEAN TEXT ===
    const cleanedText = cleanTextForTTS(text);
    console.log(`📝 Original: ${text.length} chars → Cleaned: ${cleanedText.length} chars`);
    
    // === STEP 2: BUILD VOICE CONFIG ===
    // This config is used to calculate cache key
    const voiceConfig = {
      voiceId: options.voiceId || DEFAULT_VOICE,
      style: options.style || 'Conversational',
      rate: options.rate || 5,
      multiNativeLocale: options.multiNativeLocale || 'vi-VN'
    };
    
    // === STEP 3: CHECK CACHE ===
    // Before calling expensive Murf API, check if we've already generated this
    const cacheResult = await audioCache.getCachedAudio(cleanedText, voiceConfig);
    
    if (cacheResult.hit) {
      // ✅ CACHE HIT - Return immediately
      console.log('✅ Using cached audio:', cacheResult.textHash.substring(0, 8));
      const audioBuffer = await fs.readFile(cacheResult.filePath);
      return {
        success: true,
        audioBuffer: audioBuffer,
        format: 'wav',
        duration: cacheResult.duration,
        cached: true,                    // Flag that this came from cache
        cacheKey: cacheResult.textHash
      };
    }
    
    // ❌ CACHE MISS - Generate new audio
    console.log('🔄 Cache miss, generating new audio...');
    
    let audioBuffer;
    let duration = 0;
    
    // === STEP 4A: SHORT TEXT ===
    // If text is short enough, generate in one API call
    if (cleanedText.length <= MAX_TEXT_LENGTH) {
      const result = await generateSpeechDirect(cleanedText, {
        ...options,
        encodeAsBase64: true  // Request base64 for easier handling
      });
      
      if (result.encodedAudio) {
        // Decode base64 to buffer
        audioBuffer = Buffer.from(result.encodedAudio, 'base64');
        duration = result.duration || 0;
      } else if (result.audioFile) {
        // Some versions return URL instead
        const audioResponse = await axios.get(result.audioFile, {
          responseType: 'arraybuffer',
          timeout: 30000
        });
        audioBuffer = Buffer.from(audioResponse.data);
        duration = result.duration || 0;
      } else {
        throw new Error('Không nhận được dữ liệu audio');
      }
    } 
    // === STEP 4B: LONG TEXT ===
    // Split into chunks and generate separately
    else {
      console.log(`📝 Cleaned text too long (${cleanedText.length} chars), splitting into chunks...`);
      
      // Split text intelligently (on sentence boundaries)
      const chunks = splitTextIntoChunks(cleanedText, MAX_TEXT_LENGTH - 100);
      const audioBuffers = [];
      
      for (let i = 0; i < chunks.length; i++) {
        console.log(`🎤 Processing chunk ${i + 1}/${chunks.length} (${chunks[i].length} chars)`);
        
        const result = await generateSpeechDirect(chunks[i], {
          ...options,
          encodeAsBase64: true
        });
        
        if (result.encodedAudio) {
          audioBuffers.push(Buffer.from(result.encodedAudio, 'base64'));
          duration += result.duration || 0;
        }
        
        // IMPORTANT: Delay between chunks to avoid rate limiting
        if (i < chunks.length - 1) {
          await new Promise(resolve => setTimeout(resolve, 500));
        }
      }
      
      // Concatenate all chunks into one audio file
      audioBuffer = Buffer.concat(audioBuffers);
      console.log(`✅ Combined ${chunks.length} chunks into ${audioBuffer.length} bytes`);
    }
    
    // === STEP 5: SAVE TO CACHE ===
    // Now that we have the audio, cache it for future reuse
    const cacheKey = cacheResult.textHash || audioCache.createCacheKey(cleanedText, voiceConfig);
    await audioCache.saveAudioCache(cleanedText, audioBuffer, {
      format: 'wav',
      duration: duration,
      voiceConfig: voiceConfig
    });
    
    return {
      success: true,
      audioBuffer: audioBuffer,
      format: 'wav',
      duration: duration,
      cached: false,                 // Flag that this is newly generated
      cacheKey: cacheKey
    };
    
  } catch (error) {
    console.error('Generate speech buffer error:', error);
    throw error;  // Propagate error to caller
  }
}
```

**Algorithm Overview:**
```
1. Clean text (remove emojis, replace math symbols)
2. Calculate cache key (MD5 hash of text + voice config)
3. Check if this exact combination was already generated
   - If YES: Return cached audio (<100ms)
   - If NO: Continue to step 4
4. Generate new audio
   - If short (≤2500 chars): Single API call
   - If long: Split into chunks + multiple API calls
5. Save to cache for future use
6. Return with `cached` flag for tracking
```

**Performance Impact:**
- First request: 5-15 seconds (API call)
- Subsequent requests with same text: <100ms (cache hit)
- Long text (chunks): 30-60 seconds (multiple API calls with delays)

---

## Audio Cache Service

### File: `backend/services/audioCacheService.js`

#### Cache Key Generation

```javascript
// Lines 19-32
function createCacheKey(text, voiceConfig = {}) {
  // === BUILD KEY FROM MULTIPLE FACTORS ===
  // The same text with different voice should create different audio
  const keyData = JSON.stringify({
    text: text.trim().toLowerCase(),  // Normalize text
    voiceId: voiceConfig.voiceId || 'en-US-natalie',
    style: voiceConfig.style || 'Conversational',
    rate: voiceConfig.rate || 5,
    multiNativeLocale: voiceConfig.multiNativeLocale || 'vi-VN'
  });
  
  // === CREATE MD5 HASH ===
  // Deterministic: Same input always creates same hash
  return crypto.createHash('md5').update(keyData).digest('hex');
}
```

**Why MD5?**
- Fast computation
- Deterministic (same input = same output)
- Short enough for filenames
- Good enough for non-security purposes

**Example:**
- Text: "Phương trình bậc hai" + Voice: Natalie → `abc123def456`
- Text: "Phương trình bậc hai" + Voice: Clint → `xyz789def111` (different!)
- Same text + same voice always = same hash

---

#### Cache Hit Check

```javascript
// Lines 48-81
async function getCachedAudio(text, voiceConfig = {}) {
  try {
    // === CALCULATE KEY ===
    const textHash = createCacheKey(text, voiceConfig);
    
    // === LOOKUP IN DATABASE ===
    // NeDB has index on textHash, so this is fast
    const cached = await audioDb.findOne({ textHash });
    
    if (cached) {
      // === VERIFY FILE ACTUALLY EXISTS ===
      // Sometimes files get deleted but DB entries remain
      if (cached.filePath) {
        try {
          await fs.access(cached.filePath);  // Throws if file doesn't exist
          
          console.log('🎵 Audio cache HIT:', textHash.substring(0, 8));
          
          // === UPDATE USAGE STATS ===
          // Track how often this audio is reused
          await audioDb.update(
            { _id: cached._id },
            { 
              $set: { 
                lastUsed: new Date(),
                useCount: (cached.useCount || 0) + 1  // Increment reuse count
              } 
            }
          );
          
          // === RETURN CACHE HIT ===
          return {
            hit: true,
            filePath: cached.filePath,
            audioUrl: cached.audioUrl,
            duration: cached.duration,
            textHash
          };
        } catch {
          // File deleted but DB entry exists - clean up
          await audioDb.remove({ _id: cached._id });
          return { hit: false, textHash };
        }
      }
    }
    
    console.log('🎵 Audio cache MISS:', textHash.substring(0, 8));
    return { hit: false, textHash };
    
  } catch (error) {
    console.error('Get cached audio error:', error);
    return { hit: false };  // Treat as miss on error
  }
}
```

**Key Design Pattern:**
- Graceful handling of missing files (cleanup orphaned DB entries)
- Usage tracking (for cache effectiveness metrics)
- Deterministic hash (same request = same key)

---

#### Cache Write

```javascript
// Lines 97-147
async function saveAudioCache(text, audioBuffer, metadata = {}) {
  try {
    // === ENSURE DIRECTORY EXISTS ===
    // Create uploads/audio folder if it doesn't exist
    await ensureAudioDir();
    
    // === CALCULATE CACHE KEY ===
    const textHash = createCacheKey(text, metadata.voiceConfig);
    
    // === BUILD FILENAME ===
    const fileName = `${textHash}.${metadata.format || 'wav'}`;
    const filePath = path.join(AUDIO_DIR, fileName);
    
    // === SAVE FILE TO DISK ===
    // audioBuffer is a Node.js Buffer object
    await fs.writeFile(filePath, audioBuffer);
    
    // === BUILD DATABASE ENTRY ===
    const cacheEntry = {
      textHash,                                      // Unique key
      text: text.substring(0, 500),                 // Store first 500 chars for debugging
      textLength: text.length,                      // How long was original?
      filePath,                                     // Where is it on disk?
      fileName,                                     // What's the filename?
      audioUrl: metadata.audioUrl || null,          // Optional: Remote URL
      duration: metadata.duration || null,          // Length in seconds
      format: metadata.format || 'wav',             // File format
      voiceConfig: metadata.voiceConfig || {},      // What voice was used?
      fileSize: audioBuffer.length,                 // Size in bytes
      createdAt: new Date(),                        // When was it created?
      lastUsed: new Date(),                         // Track usage
      useCount: 1                                   // Start at 1 (we're using it now)
    };
    
    // === UPSERT TO DATABASE ===
    // Update if exists, insert if new
    // This is safe for race conditions (multiple requests for same text)
    await audioDb.update(
      { textHash },
      cacheEntry,
      { upsert: true }  // Important: upsert = insert or update
    );
    
    console.log('💾 Audio cached:', textHash.substring(0, 8), 
                '| Size:', (audioBuffer.length / 1024).toFixed(1), 'KB');
    
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
```

**Race Condition Safety:**
- Two requests for same text arrive simultaneously
- Both calculate same hash, both call saveAudioCache
- First one writes file + DB entry
- Second one uses upsert → overwrites with same data (safe!)
- Result: Only one file on disk, both requests get it

---

## Firebase Service (Database Operations)

### File: `backend/services/firebaseService.js`

#### Lesson Service

```javascript
// Lines 145-188 (simplified)
const lessonService = {
  async create(lessonData) {
    console.log('📚 Creating lesson:', { 
      userId: lessonData.userId, 
      title: lessonData.title 
    });
    
    // === ADD TIMESTAMPS ===
    const doc = await db.lessons.insert({
      ...lessonData,
      createdAt: new Date(),
      updatedAt: new Date()
    });
    
    console.log('✅ Lesson created with ID:', doc._id);
    
    // === RETURN WITH ID ===
    return { id: doc._id, ...doc };
  },
  
  async getById(lessonId) {
    // === SINGLE LOOKUP ===
    const doc = await db.lessons.findOne({ _id: lessonId });
    return doc ? { id: doc._id, ...doc } : null;
  },
  
  async getByUserId(userId, limit = 50) {
    console.log('📖 Fetching lessons for userId:', userId);
    
    // === QUERY + SORT + LIMIT ===
    // Sorted by newest first
    const docs = await db.lessons.find({ userId })
      .sort({ createdAt: -1 })  // Newest first
      .limit(limit);
    
    console.log('   Found', docs.length, 'lessons');
    return docs.map(doc => ({ id: doc._id, ...doc }));
  },
  
  async update(lessonId, data) {
    // === UPDATE FIELDS + TIMESTAMP ===
    await db.lessons.update(
      { _id: lessonId },
      { 
        $set: { 
          ...data,
          updatedAt: new Date()  // Auto-update timestamp
        } 
      }
    );
    return this.getById(lessonId);
  },
  
  async markComplete(lessonId) {
    // === HELPER: Mark as completed ===
    return this.update(lessonId, { 
      completed: true, 
      completedAt: new Date() 
    });
  }
};
```

**NeDB Query Syntax:**
- `find()` - Returns query object
- `.sort({field: -1})` - Sort descending (-1) or ascending (1)
- `.limit(n)` - Limit results
- `findOne()` - Returns single document or null
- `update({query}, {update})` - Modify documents
- `$set` - Operator to set fields
- `upsert: true` - Insert if not found

---

#### Learning Stats Service

```javascript
// Lines 315-350 (simplified)
const learningStatsService = {
  async incrementLessonCount(userId, completed = false) {
    // === GET CURRENT STATS ===
    const stats = await this.getByUserId(userId);
    
    // === BUILD UPDATE ===
    const updateData = { 
      totalLessons: (stats.totalLessons || 0) + 1,  // Increment counter
      updatedAt: new Date()
    };
    
    // === IF COMPLETED, INCREMENT COMPLETED COUNT ===
    if (completed) {
      updateData.completedLessons = (stats.completedLessons || 0) + 1;
    }
    
    // === PERSIST ===
    await db.learningStats.update({ userId }, { $set: updateData });
    
    return this.getByUserId(userId);
  }
};
```

**Pattern: Read-Modify-Write**
1. Read current value
2. Increment/modify
3. Write back
4. Return updated

**Why not use atomic operators?**
NeDB doesn't support `$inc` efficiently, so we read-modify-write.

---

#### Audio History Service

```javascript
// Lines 724-757
const audioHistoryService = {
  async log(userId, audioData) {
    // === INSERT RECORD ===
    const doc = await db.audioHistory.insert({
      userId,
      lessonId: audioData.lessonId,
      sectionId: audioData.sectionId,
      text: audioData.text?.substring(0, 200),     // Limit for storage
      cacheKey: audioData.cacheKey,
      duration: audioData.duration,
      playedAt: new Date()
    });
    
    return { id: doc._id, ...doc };
  },
  
  async getByUserId(userId, limit = 100) {
    // === FETCH HISTORY ===
    const docs = await db.audioHistory.find({ userId })
      .sort({ playedAt: -1 })  // Most recent first
      .limit(limit);
    
    return docs.map(doc => ({ id: doc._id, ...doc }));
  },
  
  async getStats(userId) {
    // === AGGREGATE STATS ===
    const docs = await db.audioHistory.find({ userId });
    
    const totalPlays = docs.length;
    const totalDuration = docs.reduce((sum, d) => sum + (d.duration || 0), 0);
    
    return { totalPlays, totalDuration };
  }
};
```

**Use Case:** Track when audio was played for analytics
- Helps understand which lessons are most used
- Tracks learning activity
- Enables engagement metrics

---

## Summary

This codebase follows several key patterns:

1. **Separation of Concerns**: Controllers → Services → Database
2. **Fallback Design**: If structured generation fails, use markdown
3. **Caching Strategy**: Check cache before expensive API calls
4. **Error Handling**: Log errors, return meaningful messages
5. **Graceful Degradation**: Lessons work without audio, audio works without sections
6. **Usage Tracking**: Log everything for analytics
7. **Security**: Sanitize inputs, prevent path traversal

The entire system is designed to be **resilient** (works with partial failures) and **efficient** (caches aggressively).
