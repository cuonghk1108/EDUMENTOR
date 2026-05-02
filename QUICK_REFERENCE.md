# Quick Reference Guide - Lesson Creation System

## Key Concepts at a Glance

### The 4 Main Components

| Component | Purpose | Provider | Key Files |
|-----------|---------|----------|-----------|
| **Lesson Generation** | Create educational content from text | xAI (Grok-3) | lessonController.js, aiService.js |
| **Audio Synthesis** | Convert lesson text to speech | Murf.ai | ttsController.js, murfService.js |
| **Caching Layer** | Reuse generated audio to save API calls | NeDB + Disk | audioCacheService.js |
| **Database Persistence** | Store lessons, audio metadata, user stats | NeDB | firebaseService.js |

---

## API Endpoints - Quick Reference

### Lesson Creation
```
POST /lesson
POST /lesson/latex
POST /lesson/json
POST /lesson/complete
POST /process-sgk          ← (3-in-1: Upload + OCR + Generate)
POST /lesson/:lessonId/customize
```

### Lesson Retrieval
```
GET /lessons/:userId       ← All user lessons
GET /lesson/:lessonId      ← Single lesson
PUT /lesson/:lessonId/complete
```

### Audio Generation
```
POST /tts                  ← Generate audio from text
POST /tts/lesson           ← Convert lesson to speech
GET /tts/:audioId          ← Download audio file
GET /tts/voices            ← List available voices
```

### Cache Management
```
GET /tts/cache/stats       ← Cache statistics
DELETE /tts/cache/clean    ← Clean old files (>30 days)
GET /tts/cache/:hash       ← Get cached audio
```

---

## Data Structures

### Lesson Object
```javascript
{
  _id: string,           // Generated ID
  userId: string,        // Owner
  title: string,         // Lesson title
  subject: string,       // Subject area
  chapter: string,       // Chapter/Unit
  content: string,       // Main content (markdown/latex)
  structuredContent: {},  // Alternative: JSON format
  audioIds: [string],    // Links to audio files
  audioSections: [{      // Per-section audio
    sectionId: string,
    audioId: string,
    url: string,
    duration: number
  }],
  hasAudio: boolean,
  completed: boolean,
  completedAt: Date,
  createdAt: Date,
  updatedAt: Date
}
```

### Audio Cache Entry
```javascript
{
  _id: string,
  textHash: string,      // MD5 hash (unique key)
  filePath: string,      // Disk location
  fileName: string,      // e.g., "abc123def.wav"
  duration: number,      // Seconds
  voiceConfig: {         // Voice settings
    voiceId: string,
    style: string,
    rate: number
  },
  fileSize: number,      // Bytes
  useCount: number,      // Times reused
  lastUsed: Date,
  createdAt: Date
}
```

---

## Common Workflows

### Workflow 1: Text → Lesson → Audio
```
1. User provides text
   ↓
2. POST /lesson
   → AI generates markdown + structured JSON
   ↓
3. Lesson stored in DB
   ↓
4. User requests audio: POST /tts
   → Audio generated and cached
   ↓
5. User downloads: GET /tts/{audioId}
```

### Workflow 2: File Upload → OCR → Lesson → Audio
```
1. User uploads textbook image
   ↓
2. POST /process-sgk
   → Step 1: File validation
   → Step 2: OCR extraction (Tesseract)
   → Step 3: AI lesson generation
   ↓
3. Lesson with OCR data stored in DB
   ↓
4. Follow Workflow 1 for audio
```

### Workflow 3: Audio Cache Hit (Fast Path)
```
1. User requests audio: POST /tts with same text
   ↓
2. MD5 hash calculated
   ↓
3. Cache lookup in audioDb
   ↓
4. If found:
   - Verify file exists on disk
   - Return cached audio (<100ms)
   - Update lastUsed, useCount
   ↓
5. If not found:
   - Generate new audio (5-15s)
   - Save to cache
   - Return audio
```

---

## Error Handling Quick Guide

| Error | Cause | Fix |
|-------|-------|-----|
| 400 - "Vui lòng cung cấp nội dung" | Missing text field | Add `text` in request body |
| 400 - "Nội dung quá dài" | Text > 10,000 chars | Shorten text or use POST /tts/lesson for structured |
| 400 - "Không thể đọc nội dung từ file" | OCR failed | Use clearer image, check confidence |
| 401 - Unauthorized | Missing/invalid token | Include valid JWT in Authorization header |
| 403 - "Không có quyền truy cập" | Wrong userId | Ensure user owns the lesson |
| 404 - "Không tìm thấy bài học" | Lesson doesn't exist | Check lessonId is correct |

---

## Performance Tips

### For Lesson Generation
- **Markdown only**: Fastest (~3-8 sec)
- **With structured JSON**: Slower (~6-15 sec), but interactive
- **LaTeX format**: Good for math (~8-12 sec)
- **Complete both**: Most thorough (~12-20 sec)

### For Audio Generation
- **First generation**: 5-15 seconds (API call to Murf)
- **Cached audio**: <100ms (reads from disk)
- **Long text**: 30-60 seconds (splits into chunks, 500ms delay between)
- **Strategy**: Cache hits reduce API costs significantly

### For OCR (SGK Processing)
- **Total time**: 5-25 seconds
- **Bottleneck**: OCR extraction (2-10s) + AI generation (3-15s)
- **Tip**: Ensure good image quality for faster OCR

---

## Database Queries (NeDB)

### Find lessons by user
```javascript
db.lessons.find({ userId: "user123" })
```

### Find cached audio by text hash
```javascript
db.audioDb.findOne({ textHash: "abc123def456" })
```

### Find audio history for user
```javascript
db.audioHistory.find({ userId: "user123" })
  .sort({ playedAt: -1 })
  .limit(100)
```

### Update lesson with audio metadata
```javascript
db.lessons.update(
  { _id: "lesson123" },
  { $set: { audioIds: [...], hasAudio: true } }
)
```

---

## Configuration

### Required Environment Variables
```bash
# AI Service (xAI/Grok)
XAI_API_KEY=your_xai_api_key

# TTS Service (Murf.ai)
MURF_API_KEY=your_murf_api_key
```

### Optional Environment Variables
```bash
# AI Model selection
XAI_MODEL=grok-3

# Database location
DB_PATH=./backend/database/data

# TTS configuration
OPENAI_TTS_MODEL=tts-1
OPENAI_TTS_VOICE=nova
```

---

## Files to Know

| File | Purpose |
|------|---------|
| `lessonController.js` | Handles lesson creation/retrieval endpoints |
| `ttsController.js` | Handles audio generation endpoints |
| `aiService.js` | Interfaces with xAI/Grok for content generation |
| `murfService.js` | Interfaces with Murf.ai for text-to-speech |
| `audioCacheService.js` | Manages audio caching (NeDB + disk) |
| `firebaseService.js` | Database operations (lessonService, learning stats, etc.) |
| `routes/index.js` | API endpoint definitions |

---

## Debugging Tips

### Check if audio is cached
```javascript
// Query audio_cache.db for the text hash
const hash = crypto.createHash('md5')
  .update(JSON.stringify({
    text: yourText.toLowerCase(),
    voiceId: 'en-US-natalie',
    style: 'Conversational',
    rate: 5
  }))
  .digest('hex');

const cached = await audioDb.findOne({ textHash: hash });
```

### Verify file exists
```javascript
// Check if audio file exists on disk
const fs = require('fs').promises;
try {
  await fs.access(`/uploads/audio/${hash}.wav`);
  console.log('File exists');
} catch {
  console.log('File missing - cache entry orphaned');
}
```

### Monitor cache hit rate
```javascript
// Call GET /tts/cache/stats to see cache performance
GET /api/tts/cache/stats
// Returns: {stats: {totalEntries, totalSize, hitRate}}
```

### Check lesson audio links
```javascript
// Verify lesson has audio metadata
const lesson = await lessonService.getById(lessonId);
console.log(lesson.audioIds);        // Array of audio IDs
console.log(lesson.audioSections);   // Per-section audio
console.log(lesson.hasAudio);        // Boolean
```

---

## Common Customizations

### Add a new voice
1. Edit `murfService.js` - Add to `VIETNAMESE_VOICES` object
2. Voice must be compatible with Murf.ai API
3. Update default voice if needed

### Change AI model
1. Edit `aiService.js` or `.env`
2. Set `XAI_MODEL=your-model-name`
3. Update system prompts if model has different capabilities

### Modify cache cleanup policy
1. Edit route in `routes/index.js` line ~225
2. Change days parameter: `DELETE /tts/cache/clean?days=60`
3. Update `audioCacheService.cleanOldCache()` logic

### Add custom validation
1. Edit controller before calling service
2. Example: Check userId against lesson ownership
3. Return 403 if unauthorized

---

## Statistics & Monitoring

### Learning Stats Updated On:
- Lesson creation: `totalLessons++`
- Lesson completion: `completedLessons++`, set `completedAt`
- Quiz completion: `averageScore` calculated

### Audio Cache Tracked By:
- `useCount`: Times reused from cache
- `lastUsed`: Last access timestamp
- Cache hit rate: hits / (hits + misses)

### Activity Logging:
- Every lesson creation logged
- Every audio generation logged
- Every completion logged
- Enables user engagement analytics

---

## Troubleshooting Checklist

- [ ] User authenticated (valid JWT token)?
- [ ] Text provided and not empty?
- [ ] Text under 10,000 chars for TTS?
- [ ] API keys configured (.env file)?
- [ ] Disk space available for audio files?
- [ ] Database tables initialized?
- [ ] Lesson exists and userId matches?
- [ ] Audio file actually on disk?
- [ ] OCR confidence > threshold?
- [ ] Tesseract training data files present?

---

## Links & References

- **Backend Controllers**: `backend/controllers/`
- **Services**: `backend/services/`
- **Database Schema**: `backend/database/data/`
- **Uploads**: `backend/uploads/audio/`
- **Documentation**: See `LESSON_CREATION_FLOW.md` for detailed flows
