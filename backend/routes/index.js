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
const customAIController = require('../controllers/customAIController');
const taskController = require('../controllers/taskController');
const redisController = require('../controllers/redisController');

// Import middleware
const upload = require('../middleware/upload');
const { uploadWithTotalSizeLimit } = require('../middleware/upload');
const { verifyToken } = require('../middleware/auth');
const { verifyAdmin } = require('../middleware/adminAuth');
const { verifyInternalToken } = require('../middleware/internalAuth');

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
router.post('/auth/google', authController.googleAuth);
router.post('/auth/forgot-password', authController.forgotPassword);
router.post('/auth/reset-password', authController.resetPassword);
router.post('/auth/complete-profile', verifyToken, authController.completeProfile);

// Internal routes for worker services
router.post('/internal/lesson/generate', verifyInternalToken, lessonController.generateLessonInternal);

// ============================================
// PROTECTED ROUTES (Require Authentication)
// ============================================

// File Upload
router.post('/upload', verifyToken, uploadWithTotalSizeLimit('file', 1), uploadController.uploadFile);
router.post('/upload/multiple', verifyToken, uploadWithTotalSizeLimit('files', 5), uploadController.uploadMultiple);

// OCR
router.post('/ocr', verifyToken, ocrController.processOCR);
router.post('/ocr/image', verifyToken, uploadWithTotalSizeLimit('image', 1), ocrController.processImageOCR);

// Process SGK - Upload + OCR + Generate Lesson in one step
router.post('/process-sgk', verifyToken, uploadWithTotalSizeLimit('file', 1), async (req, res) => {
  try {
    const ocrService = require('../services/ocrService');
    const aiService = require('../services/aiService');
    const { lessonService, learningStatsService } = require('../services/firebaseService');

    if (!req.file) {
      return res.status(400).json({ error: 'Không có file được upload' });
    }

    const { title, subject, chapter, customPrompt = '' } = req.body;
    const format = 'interactive-markdown';
    const userId = req.userId;

    console.log('📝 Process SGK - userId:', userId, 'title:', title, 'format:', format);
    if (customPrompt) {
      console.log('🎯 Custom prompt:', customPrompt.substring(0, 100) + '...');
    }

    // Step 1: OCR
    console.log('🔍 Step 1: Processing OCR...');
    const ocrResult = await ocrService.processFile(req.file.path);
    
    if (!ocrResult.text || ocrResult.text.length < 50) {
      return res.status(400).json({ 
        error: 'Không thể đọc nội dung từ file. Vui lòng thử lại với ảnh rõ hơn.' 
      });
    }

    // Combine OCR text with custom prompt if provided
    let textToProcess = ocrResult.text;
    if (customPrompt && customPrompt.trim()) {
      textToProcess = `[YÊU CẦU RIÊNG CỦA NGƯỜI DÙNG]: ${customPrompt.trim()}\n\n[NỘI DUNG SGK]:\n${ocrResult.text}`;
    }

    // Step 2: Generate lesson with AI
    console.log('✨ Step 2: Generating lesson with AI...');
    const options = {
      subject: subject || 'Chung',
      grade: 'THPT',
      customPrompt: customPrompt || ''
    };

    const lessonData = {};
    
    // Luôn generate Markdown tương tác: markdown content + structured JSON
    const markdownResult = await aiService.generateLesson(textToProcess, options);
    lessonData.content = markdownResult.content || '';

    try {
      const structuredResult = await aiService.generateLessonStructured(textToProcess, options);
      lessonData.structuredContent = structuredResult.lesson || null;
    } catch (structuredError) {
      console.warn('⚠️ Structured generation failed, fallback to markdown only:', structuredError.message);
      lessonData.structuredContent = null;
    }

    console.log('📝 Lesson data:', {
      format,
      hasContent: !!lessonData.content,
      hasStructured: !!lessonData.structuredContent
    });

    // Step 3: Save to database
    console.log('💾 Step 3: Saving to database...');
    const lesson = await lessonService.create({
      userId,
      title: title || 'Bài học mới',
      subject: subject || 'Chung',
      chapter: chapter || '',
      ...lessonData,
      sourceText: ocrResult.text.substring(0, 5000),
      customPrompt: customPrompt || '',
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
router.post('/lesson/queue', verifyToken, taskController.queueLessonGeneration);
router.post('/lesson/latex', verifyToken, lessonController.generateLessonLatex);
router.post('/lesson/json', verifyToken, lessonController.generateLessonStructured);
router.post('/lesson/complete', verifyToken, lessonController.generateLessonComplete);
router.post('/lesson/convert-latex', verifyToken, lessonController.convertToLatex);
router.post('/lesson/:lessonId/convert-latex', verifyToken, lessonController.convertToLatex);
router.post('/lesson/:lessonId/customize', verifyToken, lessonController.customizeLesson);
router.get('/tasks/:taskId', verifyToken, taskController.getTaskStatus);
router.delete('/tasks/:taskId', verifyToken, taskController.cancelTask);
router.get('/lessons/:userId', verifyToken, lessonController.getUserLessons);
router.get('/lesson/:lessonId', verifyToken, lessonController.getLessonById);
router.put('/lesson/:lessonId/complete', verifyToken, lessonController.markComplete);

// File Processing & Upload
router.get('/upload/status/:fileId', verifyToken, uploadController.getFileStatus);

// ============================================
// INTERNAL ROUTES (For Celery Worker)
// ============================================

router.post('/internal/file/process', verifyInternalToken, taskController.queueFileProcessing);
router.post('/internal/ocr/extract', verifyInternalToken, taskController.queueImageOcr);
router.post('/internal/pdf/extract', verifyInternalToken, taskController.queuePdfExtraction);

// Quiz
router.post('/quiz', verifyToken, quizController.generateQuiz);
router.post('/quiz/submit', verifyToken, quizController.submitQuiz);
router.post('/quiz/regenerate', verifyToken, quizController.regenerateQuiz);
router.get('/quizzes/:userId', verifyToken, quizController.getUserQuizzes);
router.get('/quiz/:quizId', verifyToken, quizController.getQuizById);
router.get('/quiz-history/:userId', verifyToken, quizController.getQuizHistory);
router.get('/quiz-result/:quizId', verifyToken, quizController.getQuizResult);
router.get('/quiz-regenerations/:quizId', verifyToken, quizController.getRegenerationHistory);

// Custom AI - Xử lý yêu cầu tùy chỉnh từ người dùng
router.post('/ai/custom', verifyToken, customAIController.processCustomRequest);

// Chat
router.post('/chat', verifyToken, chatController.sendMessage);
router.post('/chat/image', verifyToken, upload.single('image'), chatController.sendMessageWithImage);
router.get('/chat-history/:userId', verifyToken, chatController.getChatHistory);
router.delete('/chat-history/:userId', verifyToken, chatController.clearChatHistory);

// Text-to-Speech (Murf.ai API)
router.get('/tts/voices', verifyToken, ttsController.getVoices);
router.get('/tts/status', verifyToken, ttsController.checkStatus);
router.post('/tts', verifyToken, ttsController.generateAudio);
router.post('/tts/stream', verifyToken, ttsController.streamAudio);
router.post('/tts/read-aloud', verifyToken, ttsController.readAloud);
router.post('/tts/lesson', verifyToken, ttsController.convertLessonToSpeech);

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

router.get('/tts/:audioId', ttsController.getAudio); // Public access for audio files

// Redis API for authenticated users (scoped by userId)
router.get('/redis/health', verifyToken, redisController.health);
router.get('/redis/keys', verifyToken, redisController.listMyKeys);
router.post('/redis/set', verifyToken, redisController.setMyValue);
router.get('/redis/get/:key', verifyToken, redisController.getMyValue);
router.put('/redis/expire/:key', verifyToken, redisController.setMyExpire);
router.delete('/redis/key/:key', verifyToken, redisController.deleteMyKey);

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

// Avatar Upload
router.post('/profile/avatar', verifyToken, upload.single('avatar'), async (req, res) => {
  try {
    if (!req.file) {
      return res.status(400).json({ error: 'Không có file ảnh được upload' });
    }

    // Get file URL
    const avatarUrl = `/uploads/${req.file.filename}`;
    
    // Update user's avatar in database
    const { userService } = require('../services/firebaseService');
    const user = await userService.update(req.userId, { avatar: avatarUrl });
    
    // Remove password from response
    const { password: _, ...userWithoutPassword } = user;

    res.json({
      success: true,
      message: 'Upload ảnh đại diện thành công',
      avatarUrl,
      user: userWithoutPassword
    });
  } catch (error) {
    console.error('Avatar upload error:', error);
    res.status(500).json({ error: 'Lỗi upload ảnh đại diện' });
  }
});

// ==================== USER DATA MANAGEMENT ====================
const { 
  userSettingsService, 
  bookmarkService, 
  notesService, 
  studySessionService, 
  audioHistoryService,
  activityLogService,
  streakService,
  examSimulationService,
  parentReportService,
  studyGroupService
} = require('../services/firebaseService');

// ==================== STREAK API ====================
// Lấy streak hiện tại
router.get('/streak', verifyToken, async (req, res) => {
  try {
    const streak = await streakService.checkAndUpdateStreak(req.userId);
    res.json({ success: true, streak });
  } catch (error) {
    console.error('Get streak error:', error);
    res.status(500).json({ error: error.message });
  }
});

// Ghi nhận hoạt động học tập (tự động cập nhật streak)
router.post('/streak/record', verifyToken, async (req, res) => {
  try {
    const { activityType, minutes } = req.body;
    const streak = await streakService.recordStudyActivity(
      req.userId, 
      activityType || 'general', 
      minutes || 0
    );
    res.json({ success: true, streak });
  } catch (error) {
    console.error('Record activity error:', error);
    res.status(500).json({ error: error.message });
  }
});

// Lấy lịch sử học
router.get('/streak/history', verifyToken, async (req, res) => {
  try {
    const days = parseInt(req.query.days) || 30;
    const history = await streakService.getStudyHistory(req.userId, days);
    res.json({ success: true, history });
  } catch (error) {
    console.error('Get history error:', error);
    res.status(500).json({ error: error.message });
  }
});

// Lấy thống kê tuần
router.get('/streak/weekly', verifyToken, async (req, res) => {
  try {
    const weeklyStats = await streakService.getWeeklyStats(req.userId);
    const streak = await streakService.getByUserId(req.userId);
    res.json({ 
      success: true, 
      weeklyStats,
      currentStreak: streak.currentStreak,
      longestStreak: streak.longestStreak,
      totalStudyDays: streak.totalStudyDays
    });
  } catch (error) {
    console.error('Get weekly stats error:', error);
    res.status(500).json({ error: error.message });
  }
});

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
    let activity = await activityLogService.getRecentActivity(req.userId, days);
    // Hide admin-originated logs from a user's own activity view
    if (Array.isArray(activity)) {
      activity = activity.filter(a => !(a.actorIsAdmin && a.actorId === req.userId));
    }
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


// Exam Simulation
router.post('/exam-simulations', verifyToken, async (req, res) => {
  try {
    const attempt = await examSimulationService.createAttempt(req.userId, req.body);
    await activityLogService.log(req.userId, { action: 'exam_simulation_submit', targetId: attempt.id });
    res.json({ success: true, attempt });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

router.get('/exam-simulations', verifyToken, async (req, res) => {
  try {
    const limit = parseInt(req.query.limit) || 20;
    const attempts = await examSimulationService.getHistory(req.userId, limit);
    res.json({ success: true, attempts });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// Parent Report
router.post('/parent-report/generate', verifyToken, async (req, res) => {
  try {
    const report = await parentReportService.generateWeekly(req.userId);
    res.json({ success: true, report });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

router.get('/parent-report/:shareToken', async (req, res) => {
  try {
    const report = await parentReportService.getByToken(req.params.shareToken);
    if (!report) return res.status(404).json({ error: 'Không tìm thấy báo cáo' });
    res.json({ success: true, report });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// Study Groups
router.get('/study-groups', verifyToken, async (req, res) => {
  try {
    const groups = await studyGroupService.getAll(req.query.subject);
    res.json({ success: true, groups });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

router.post('/study-groups', verifyToken, async (req, res) => {
  try {
    const group = await studyGroupService.create(req.userId, req.body);
    await activityLogService.log(req.userId, { action: 'study_group_create', targetId: group.id });
    res.json({ success: true, group });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

router.post('/study-groups/:groupId/join', verifyToken, async (req, res) => {
  try {
    const group = await studyGroupService.join(req.params.groupId, req.userId);
    if (!group) return res.status(404).json({ error: 'Không tìm thấy nhóm học' });
    await activityLogService.log(req.userId, { action: 'study_group_join', targetId: req.params.groupId });
    res.json({ success: true, group });
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

// Advanced User Management
router.post('/admin/users/:userId/block', verifyToken, verifyAdmin, adminController.toggleBlockUser);
router.post('/admin/users/:userId/reset-password', verifyToken, verifyAdmin, adminController.resetUserPassword);
router.delete('/admin/users/:userId/data', verifyToken, verifyAdmin, adminController.deleteAllUserData);
router.get('/admin/users/:userId/activity', verifyToken, verifyAdmin, adminController.getUserActivityLog);
router.put('/admin/users/:userId/role', verifyToken, verifyAdmin, adminController.changeUserRole);

// Lesson Management
router.get('/admin/lessons', verifyToken, verifyAdmin, adminController.getLessons);
router.get('/admin/lessons/:lessonId', verifyToken, verifyAdmin, adminController.getLessonDetail);
router.delete('/admin/lessons/:lessonId', verifyToken, verifyAdmin, adminController.deleteLesson);

// Quiz Management
router.get('/admin/quizzes', verifyToken, verifyAdmin, adminController.getQuizzes);
router.delete('/admin/quizzes/:quizId', verifyToken, verifyAdmin, adminController.deleteQuiz);

// System Settings & Logs
router.get('/admin/settings', verifyToken, verifyAdmin, adminController.getSettings);
router.put('/admin/settings', verifyToken, verifyAdmin, adminController.updateSettings);
router.get('/admin/logs', verifyToken, verifyAdmin, adminController.getSystemLogs);
router.get('/admin/subjects', verifyToken, verifyAdmin, adminController.getSubjects);

// Chat Management
router.get('/admin/chats', verifyToken, verifyAdmin, adminController.getChats);
router.get('/admin/chats/:chatId', verifyToken, verifyAdmin, adminController.getChatDetail);
router.delete('/admin/chats/:chatId', verifyToken, verifyAdmin, adminController.deleteChat);
router.delete('/admin/chats/user/:userId', verifyToken, verifyAdmin, adminController.deleteUserChats);

// Roadmap Management
router.get('/admin/roadmaps', verifyToken, verifyAdmin, adminController.getRoadmaps);
router.delete('/admin/roadmaps/:roadmapId', verifyToken, verifyAdmin, adminController.deleteRoadmap);

// Database Management
router.post('/admin/database/clean', verifyToken, verifyAdmin, adminController.cleanDatabase);
router.get('/admin/database/stats', verifyToken, verifyAdmin, adminController.getDatabaseStats);

// Redis Management
router.get('/admin/redis/health', verifyToken, verifyAdmin, redisController.health);
router.get('/admin/redis/keys', verifyToken, verifyAdmin, redisController.listKeys);
router.post('/admin/redis/set', verifyToken, verifyAdmin, redisController.setValue);
router.get('/admin/redis/get/:key', verifyToken, verifyAdmin, redisController.getValue);
router.put('/admin/redis/expire/:key', verifyToken, verifyAdmin, redisController.setExpire);
router.delete('/admin/redis/key/:key', verifyToken, verifyAdmin, redisController.deleteKey);

module.exports = router;
