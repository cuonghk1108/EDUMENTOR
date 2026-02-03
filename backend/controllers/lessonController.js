const aiService = require('../services/aiService');
const { lessonService, learningStatsService } = require('../services/firebaseService');

/**
 * Generate lesson from text content
 */
exports.generateLesson = async (req, res) => {
  try {
    const { text, title, subject, chapter } = req.body;
    const userId = req.userId;

    if (!text) {
      return res.status(400).json({ error: 'Vui lòng cung cấp nội dung' });
    }

    // Generate lesson using AI
    const result = await aiService.generateLesson(text);

    // Save lesson to database
    const lessonData = {
      userId,
      title: title || 'Bài học mới',
      subject: subject || 'Chung',
      chapter: chapter || '',
      originalText: text,
      content: result.content,
      completed: false,
      audioGenerated: false,
      createdAt: new Date()
    };

    const savedLesson = await lessonService.create(lessonData);

    // Update learning stats
    await learningStatsService.incrementLessonCount(userId);

    res.json({
      success: true,
      lesson: savedLesson,
      usage: result.usage
    });
  } catch (error) {
    console.error('Generate lesson error:', error);
    res.status(500).json({ error: error.message });
  }
};

/**
 * Get user's lessons
 */
exports.getUserLessons = async (req, res) => {
  try {
    const { userId } = req.params;
    const limit = parseInt(req.query.limit) || 50;

    const lessons = await lessonService.getByUserId(userId, limit);

    res.json({
      success: true,
      lessons,
      count: lessons.length
    });
  } catch (error) {
    console.error('Get lessons error:', error);
    res.status(500).json({ error: error.message });
  }
};

/**
 * Get lesson by ID
 */
exports.getLessonById = async (req, res) => {
  try {
    const { lessonId } = req.params;

    const lesson = await lessonService.getById(lessonId);

    if (!lesson) {
      return res.status(404).json({ error: 'Không tìm thấy bài học' });
    }

    res.json({
      success: true,
      lesson
    });
  } catch (error) {
    console.error('Get lesson error:', error);
    res.status(500).json({ error: error.message });
  }
};

/**
 * Mark lesson as complete
 */
exports.markComplete = async (req, res) => {
  try {
    const { lessonId } = req.params;
    const userId = req.userId;

    const lesson = await lessonService.markComplete(lessonId);

    // Update stats
    await learningStatsService.incrementLessonCount(userId, true);

    res.json({
      success: true,
      lesson
    });
  } catch (error) {
    console.error('Mark complete error:', error);
    res.status(500).json({ error: error.message });
  }
};
