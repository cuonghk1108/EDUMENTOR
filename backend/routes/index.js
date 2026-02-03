const express = require('express');
const router = express.Router();

// Import controllers
const uploadController = require('../controllers/uploadController');
const ocrController = require('../controllers/ocrController');
const lessonController = require('../controllers/lessonController');
const quizController = require('../controllers/quizController');
const chatController = require('../controllers/chatController');
const ttsController = require('../controllers/ttsController');
const dashboardController = require('../controllers/dashboardController');
const authController = require('../controllers/authController');
const roadmapController = require('../controllers/roadmapController');
const careerController = require('../controllers/careerController');
const adminController = require('../controllers/adminController');

// Import middleware
const upload = require('../middleware/upload');
const { verifyToken } = require('../middleware/auth');
const { verifyAdmin } = require('../middleware/adminAuth');

// ============================================
// PUBLIC ROUTES
// ============================================

// Health check
router.get('/health', (req, res) => {
  res.json({ status: 'ok', message: 'API đang hoạt động' });
});

// Auth routes
router.post('/auth/register', authController.register);
router.post('/auth/login', authController.login);
router.post('/auth/logout', authController.logout);

// ============================================
// PROTECTED ROUTES (Require Authentication)
// ============================================

// File Upload
router.post('/upload', verifyToken, upload.single('file'), uploadController.uploadFile);
router.post('/upload/multiple', verifyToken, upload.array('files', 10), uploadController.uploadMultiple);

// OCR
router.post('/ocr', verifyToken, ocrController.processOCR);
router.post('/ocr/image', verifyToken, upload.single('image'), ocrController.processImageOCR);

// Process SGK - Upload + OCR + Generate Lesson in one step
router.post('/process-sgk', verifyToken, upload.single('file'), async (req, res) => {
  try {
    const ocrService = require('../services/ocrService');
    const aiService = require('../services/aiService');
    const { lessonService, learningStatsService } = require('../services/firebaseService');

    if (!req.file) {
      return res.status(400).json({ error: 'Không có file được upload' });
    }

    const { title, subject, chapter, format = 'complete' } = req.body;
    const userId = req.userId;

    console.log('📝 Process SGK - userId:', userId, 'title:', title, 'format:', format);

    // Step 1: OCR
    console.log('🔍 Step 1: Processing OCR...');
    const ocrResult = await ocrService.processFile(req.file.path);
    
    if (!ocrResult.text || ocrResult.text.length < 50) {
      return res.status(400).json({ 
        error: 'Không thể đọc nội dung từ file. Vui lòng thử lại với ảnh rõ hơn.' 
      });
    }

    // Step 2: Generate lesson with AI
    console.log('✨ Step 2: Generating lesson with AI...');
    const options = {
      subject: subject || 'Chung',
      grade: 'THPT'
    };

    let lessonData = {};
    
    if (format === 'complete') {
      // Generate cả LaTeX và JSON structured
      const aiResult = await aiService.generateLessonComplete(ocrResult.text, options);
      console.log('📋 AI Result keys:', Object.keys(aiResult));
      lessonData = {
        content: aiResult.content || '',
        latexContent: aiResult.latexContent || '',
        structuredContent: aiResult.structuredContent || null
      };
      console.log('📝 Lesson data:', { hasContent: !!lessonData.content, hasLatex: !!lessonData.latexContent, hasStructured: !!lessonData.structuredContent });
    } else if (format === 'latex') {
      const aiResult = await aiService.generateLessonLatex(ocrResult.text, options);
      lessonData = {
        content: aiResult.content,
        latexContent: aiResult.latexContent
      };
    } else if (format === 'json') {
      const aiResult = await aiService.generateLessonStructured(ocrResult.text, options);
      lessonData = {
        content: '',
        structuredContent: aiResult.structuredContent
      };
    } else {
      const aiResult = await aiService.generateLesson(ocrResult.text, options);
      lessonData = {
        content: aiResult.content
      };
    }

    // Step 3: Save to database
    console.log('💾 Step 3: Saving to database...');
    const lesson = await lessonService.create({
      userId,
      title: title || 'Bài học mới',
      subject: subject || 'Chung',
      chapter: chapter || '',
      ...lessonData,
      sourceText: ocrResult.text.substring(0, 5000),
      ocrConfidence: ocrResult.confidence,
      completed: false
    });

    // Update stats
    await learningStatsService.incrementLessonCount(userId);

    res.json({
      success: true,
      message: 'Xử lý SGK thành công!',
      lesson: {
        ...lesson,
        ...lessonData
      },
      ocrText: ocrResult.text,
      ocrConfidence: ocrResult.confidence
    });

  } catch (error) {
    console.error('Process SGK error:', error);
    res.status(500).json({ error: error.message || 'Lỗi xử lý file' });
  }
});

// Lesson Generation
router.post('/lesson', verifyToken, lessonController.generateLesson);
router.post('/lesson/latex', verifyToken, lessonController.generateLessonLatex);
router.post('/lesson/json', verifyToken, lessonController.generateLessonStructured);
router.post('/lesson/complete', verifyToken, lessonController.generateLessonComplete);
router.post('/lesson/convert-latex', verifyToken, lessonController.convertToLatex);
router.post('/lesson/:lessonId/convert-latex', verifyToken, lessonController.convertToLatex);
router.get('/lessons/:userId', verifyToken, lessonController.getUserLessons);
router.get('/lesson/:lessonId', verifyToken, lessonController.getLessonById);
router.put('/lesson/:lessonId/complete', verifyToken, lessonController.markComplete);

// Quiz
router.post('/quiz', verifyToken, quizController.generateQuiz);
router.post('/quiz/submit', verifyToken, quizController.submitQuiz);
router.get('/quizzes/:userId', verifyToken, quizController.getUserQuizzes);
router.get('/quiz/:quizId', verifyToken, quizController.getQuizById);
router.get('/quiz-history/:userId', verifyToken, quizController.getQuizHistory);
router.get('/quiz-result/:quizId', verifyToken, quizController.getQuizResult);

// Chat
router.post('/chat', verifyToken, chatController.sendMessage);
router.get('/chat-history/:userId', verifyToken, chatController.getChatHistory);
router.delete('/chat-history/:userId', verifyToken, chatController.clearChatHistory);

// Text-to-Speech (Murf.ai API)
router.get('/tts/voices', verifyToken, ttsController.getVoices);
router.get('/tts/status', verifyToken, ttsController.checkStatus);
router.post('/tts', verifyToken, ttsController.generateAudio);
router.post('/tts/stream', verifyToken, ttsController.streamAudio);
router.post('/tts/read-aloud', verifyToken, ttsController.readAloud);
router.post('/tts/lesson', verifyToken, ttsController.convertLessonToSpeech);
router.get('/tts/:audioId', ttsController.getAudio); // Public access for audio files

// Audio Cache - Quản lý cache audio
router.get('/tts/cache/stats', verifyToken, async (req, res) => {
  try {
    const audioCache = require('../services/audioCacheService');
    const stats = await audioCache.getCacheStats();
    res.json({ success: true, stats });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

router.delete('/tts/cache/clean', verifyToken, async (req, res) => {
  try {
    const audioCache = require('../services/audioCacheService');
    const days = parseInt(req.query.days) || 30;
    const result = await audioCache.cleanOldCache(days);
    res.json({ success: true, ...result });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

router.get('/tts/cache/:hash', async (req, res) => {
  try {
    const audioCache = require('../services/audioCacheService');
    const result = await audioCache.getAudioByHash(req.params.hash);
    if (result.found) {
      res.sendFile(result.filePath);
    } else {
      res.status(404).json({ error: 'Audio not found in cache' });
    }
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// Dashboard & Analytics
router.get('/dashboard/:userId', verifyToken, dashboardController.getDashboard);
router.get('/analytics/:userId', verifyToken, dashboardController.getAnalytics);
router.get('/stats/:userId', verifyToken, dashboardController.getLearningStats);

// Roadmap & Recommendations
router.get('/roadmap/:userId', verifyToken, roadmapController.getRoadmap);
router.post('/roadmap/generate', verifyToken, roadmapController.generateRoadmap);
router.get('/recommendations/:userId', verifyToken, roadmapController.getRecommendations);
router.get('/weaknesses/:userId', verifyToken, roadmapController.analyzeWeaknesses);

// Study Plan - Lộ trình ôn thi TN THPT
router.post('/study-plan/analyze', verifyToken, roadmapController.analyzeWeakness);
router.post('/study-plan/generate', verifyToken, roadmapController.generateStudyPlan);
router.get('/study-plan/today', verifyToken, roadmapController.getTodaySchedule);
router.put('/study-plan/progress', verifyToken, roadmapController.updateProgress);
router.post('/study-plan/adjust', verifyToken, roadmapController.adjustPlan);
router.delete('/study-plan', verifyToken, roadmapController.deleteStudyPlan);

// Career - Hướng nghiệp
router.get('/career/khoi-thi', verifyToken, careerController.getKhoiThi);
router.get('/career/diem-chuan', verifyToken, careerController.getDiemChuan);
router.get('/career/nganh-nghe', verifyToken, careerController.getNganhNghe);
router.get('/career/xu-huong', verifyToken, careerController.getXuHuong);
router.get('/career/holland-test', verifyToken, careerController.getHollandTest);
router.post('/career/holland-result', verifyToken, careerController.analyzeHollandResult);
router.post('/career/advice', verifyToken, careerController.getCareerAdvice);
router.get('/career/find-schools', verifyToken, careerController.findMatchingSchools);
router.post('/career/compare', verifyToken, careerController.compareCarers);

// TTS - Text to Speech (Murf.ai)
router.get('/tts/voices', verifyToken, ttsController.getVoices);
router.post('/tts/generate', verifyToken, ttsController.generateAudio);
router.post('/tts/read-aloud', verifyToken, ttsController.readAloud);
router.post('/tts/lesson-audio', verifyToken, ttsController.convertLessonToSpeech);
router.get('/tts/status', verifyToken, ttsController.checkStatus);

// User Profile
router.get('/profile/:userId', verifyToken, authController.getProfile);
router.put('/profile/:userId', verifyToken, authController.updateProfile);

// ==================== USER DATA MANAGEMENT ====================
const { 
  userSettingsService, 
  bookmarkService, 
  notesService, 
  studySessionService, 
  audioHistoryService,
  activityLogService 
} = require('../services/firebaseService');

// User Settings
router.get('/settings', verifyToken, async (req, res) => {
  try {
    const settings = await userSettingsService.getByUserId(req.userId);
    res.json({ success: true, settings });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

router.put('/settings', verifyToken, async (req, res) => {
  try {
    const settings = await userSettingsService.update(req.userId, req.body);
    await activityLogService.log(req.userId, { action: 'settings_update', targetType: 'settings', details: req.body });
    res.json({ success: true, settings });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// Bookmarks
router.get('/bookmarks', verifyToken, async (req, res) => {
  try {
    const bookmarks = await bookmarkService.getByUserId(req.userId);
    res.json({ success: true, bookmarks });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

router.post('/bookmarks', verifyToken, async (req, res) => {
  try {
    const bookmark = await bookmarkService.create(req.userId, req.body);
    await activityLogService.log(req.userId, { 
      action: 'bookmark_add', 
      targetType: req.body.type, 
      targetId: req.body.targetId 
    });
    res.json({ success: true, bookmark });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

router.delete('/bookmarks/:bookmarkId', verifyToken, async (req, res) => {
  try {
    await bookmarkService.delete(req.params.bookmarkId);
    await activityLogService.log(req.userId, { action: 'bookmark_remove', targetId: req.params.bookmarkId });
    res.json({ success: true, deleted: true });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// Notes
router.get('/notes', verifyToken, async (req, res) => {
  try {
    const notes = await notesService.getByUserId(req.userId);
    res.json({ success: true, notes });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

router.get('/notes/lesson/:lessonId', verifyToken, async (req, res) => {
  try {
    const notes = await notesService.getByLessonId(req.userId, req.params.lessonId);
    res.json({ success: true, notes });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

router.post('/notes', verifyToken, async (req, res) => {
  try {
    const note = await notesService.create(req.userId, req.body);
    await activityLogService.log(req.userId, { 
      action: 'note_create', 
      targetType: 'note', 
      targetId: note.id,
      details: { lessonId: req.body.lessonId }
    });
    res.json({ success: true, note });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

router.put('/notes/:noteId', verifyToken, async (req, res) => {
  try {
    const note = await notesService.update(req.params.noteId, req.body.content);
    await activityLogService.log(req.userId, { action: 'note_update', targetType: 'note', targetId: req.params.noteId });
    res.json({ success: true, note });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

router.delete('/notes/:noteId', verifyToken, async (req, res) => {
  try {
    await notesService.delete(req.params.noteId);
    await activityLogService.log(req.userId, { action: 'note_delete', targetId: req.params.noteId });
    res.json({ success: true, deleted: true });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// Study Sessions
router.post('/study-session/start', verifyToken, async (req, res) => {
  try {
    const session = await studySessionService.start(req.userId, req.body);
    await activityLogService.log(req.userId, { 
      action: 'session_start', 
      targetType: req.body.type,
      targetId: req.body.lessonId || req.body.quizId
    });
    res.json({ success: true, session });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

router.post('/study-session/:sessionId/end', verifyToken, async (req, res) => {
  try {
    const session = await studySessionService.end(req.params.sessionId, req.body);
    await activityLogService.log(req.userId, { 
      action: 'session_end', 
      targetId: req.params.sessionId,
      details: { duration: session?.duration }
    });
    res.json({ success: true, session });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

router.get('/study-sessions', verifyToken, async (req, res) => {
  try {
    const sessions = await studySessionService.getByUserId(req.userId);
    res.json({ success: true, sessions });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

router.get('/study-sessions/today', verifyToken, async (req, res) => {
  try {
    const sessions = await studySessionService.getTodaySessions(req.userId);
    res.json({ success: true, sessions });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

router.get('/study-sessions/weekly', verifyToken, async (req, res) => {
  try {
    const stats = await studySessionService.getWeeklyStats(req.userId);
    res.json({ success: true, stats });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// Audio History
router.post('/audio-history', verifyToken, async (req, res) => {
  try {
    const record = await audioHistoryService.log(req.userId, req.body);
    res.json({ success: true, record });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

router.get('/audio-history', verifyToken, async (req, res) => {
  try {
    const history = await audioHistoryService.getByUserId(req.userId);
    const stats = await audioHistoryService.getStats(req.userId);
    res.json({ success: true, history, stats });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// Activity Log
router.get('/activity', verifyToken, async (req, res) => {
  try {
    const days = parseInt(req.query.days) || 7;
    const activity = await activityLogService.getRecentActivity(req.userId, days);
    res.json({ success: true, activity });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// Log any activity from frontend
router.post('/activity', verifyToken, async (req, res) => {
  try {
    const record = await activityLogService.log(req.userId, req.body);
    res.json({ success: true, record });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// ============================================
// ADMIN ROUTES (Require Admin Role)
// ============================================

// Dashboard
router.get('/admin/dashboard', verifyToken, verifyAdmin, adminController.getDashboardStats);
router.get('/admin/activity-timeline', verifyToken, verifyAdmin, adminController.getActivityTimeline);

// User Management
router.get('/admin/users', verifyToken, verifyAdmin, adminController.getUsers);
router.get('/admin/users/:userId', verifyToken, verifyAdmin, adminController.getUserDetails);
router.put('/admin/users/:userId', verifyToken, verifyAdmin, adminController.updateUser);
router.delete('/admin/users/:userId', verifyToken, verifyAdmin, adminController.deleteUser);

// Lesson Management
router.get('/admin/lessons', verifyToken, verifyAdmin, adminController.getLessons);
router.delete('/admin/lessons/:lessonId', verifyToken, verifyAdmin, adminController.deleteLesson);

// Quiz Management
router.get('/admin/quizzes', verifyToken, verifyAdmin, adminController.getQuizzes);
router.delete('/admin/quizzes/:quizId', verifyToken, verifyAdmin, adminController.deleteQuiz);

// System Settings & Logs
router.get('/admin/settings', verifyToken, verifyAdmin, adminController.getSettings);
router.get('/admin/logs', verifyToken, verifyAdmin, adminController.getSystemLogs);
router.get('/admin/subjects', verifyToken, verifyAdmin, adminController.getSubjects);

module.exports = router;
