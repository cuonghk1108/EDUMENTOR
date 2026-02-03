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

// Import middleware
const upload = require('../middleware/upload');
const { verifyToken } = require('../middleware/auth');

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

    const { title, subject, chapter } = req.body;
    const userId = req.userId;

    console.log('📝 Process SGK - userId:', userId, 'title:', title);

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
    const aiResult = await aiService.generateLesson(ocrResult.text, {
      subject: subject || 'Chung',
      grade: 'THPT'
    });

    // Step 3: Save to database
    console.log('💾 Step 3: Saving to database...');
    console.log('   Lesson data:', { userId, title, subject, chapter });
    const lesson = await lessonService.create({
      userId,
      title: title || 'Bài học mới',
      subject: subject || 'Chung',
      chapter: chapter || '',
      content: aiResult.content,
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
        content: aiResult.content
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

// Text-to-Speech
router.post('/tts', verifyToken, ttsController.generateAudio);
router.get('/tts/:audioId', verifyToken, ttsController.getAudio);

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

// User Profile
router.get('/profile/:userId', verifyToken, authController.getProfile);
router.put('/profile/:userId', verifyToken, authController.updateProfile);

module.exports = router;
