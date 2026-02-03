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

/**
 * Generate lesson in LaTeX format
 */
exports.generateLessonLatex = async (req, res) => {
  try {
    const { text, title, subject, chapter } = req.body;
    const userId = req.userId;

    if (!text) {
      return res.status(400).json({ error: 'Vui lòng cung cấp nội dung' });
    }

    // Generate LaTeX lesson using AI
    const result = await aiService.generateLessonLatex(text);

    // Save lesson to database
    const lessonData = {
      userId,
      title: title || 'Bài học LaTeX',
      subject: subject || 'Toán',
      chapter: chapter || '',
      originalText: text,
      content: result.content,
      format: 'latex',
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
      format: 'latex',
      isComplete: result.isComplete,
      usage: result.usage
    });
  } catch (error) {
    console.error('Generate LaTeX lesson error:', error);
    res.status(500).json({ error: error.message });
  }
};

/**
 * Convert existing lesson to LaTeX format
 */
exports.convertToLatex = async (req, res) => {
  try {
    const { lessonId } = req.params;
    const { content } = req.body;

    let textToConvert = content;

    // If lessonId provided, get lesson content
    if (lessonId && !content) {
      const lesson = await lessonService.getById(lessonId);
      if (!lesson) {
        return res.status(404).json({ error: 'Không tìm thấy bài học' });
      }
      textToConvert = lesson.content;
    }

    if (!textToConvert) {
      return res.status(400).json({ error: 'Vui lòng cung cấp nội dung cần chuyển đổi' });
    }

    const result = await aiService.convertToLatex(textToConvert);

    res.json({
      success: true,
      latex: result.content,
      usage: result.usage
    });
  } catch (error) {
    console.error('Convert to LaTeX error:', error);
    res.status(500).json({ error: error.message });
  }
};

/**
 * Generate lesson in structured JSON format
 */
exports.generateLessonStructured = async (req, res) => {
  try {
    const { text, title, subject, chapter } = req.body;
    const userId = req.userId;

    if (!text) {
      return res.status(400).json({ error: 'Vui lòng cung cấp nội dung' });
    }

    // Generate structured JSON lesson
    const result = await aiService.generateLessonStructured(text);

    // Save lesson to database
    const lessonData = {
      userId,
      title: result.lesson.title || title || 'Bài học',
      subject: result.lesson.subject || subject || 'Toán',
      chapter: result.lesson.chapter || chapter || '',
      originalText: text,
      content: JSON.stringify(result.lesson),
      structuredContent: result.lesson,
      format: 'json',
      completed: false,
      createdAt: new Date()
    };

    const savedLesson = await lessonService.create(lessonData);

    // Update learning stats
    await learningStatsService.incrementLessonCount(userId);

    res.json({
      success: true,
      lesson: savedLesson,
      structured: result.lesson,
      format: 'json',
      usage: result.usage
    });
  } catch (error) {
    console.error('Generate structured lesson error:', error);
    res.status(500).json({ error: error.message });
  }
};

/**
 * Generate lesson in both LaTeX and JSON formats
 */
exports.generateLessonComplete = async (req, res) => {
  try {
    const { text, title, subject, chapter } = req.body;
    const userId = req.userId;

    if (!text) {
      return res.status(400).json({ error: 'Vui lòng cung cấp nội dung' });
    }

    // Generate both formats
    const result = await aiService.generateLessonComplete(text);

    // Save lesson to database with both formats
    const lessonData = {
      userId,
      title: result.json.title || title || 'Bài học',
      subject: result.json.subject || subject || 'Toán',
      chapter: result.json.chapter || chapter || '',
      originalText: text,
      content: result.latex,
      structuredContent: result.json,
      latexContent: result.latex,
      format: 'complete',
      completed: false,
      createdAt: new Date()
    };

    const savedLesson = await lessonService.create(lessonData);

    // Update learning stats
    await learningStatsService.incrementLessonCount(userId);

    res.json({
      success: true,
      lesson: savedLesson,
      latex: result.latex,
      json: result.json,
      usage: result.usage
    });
  } catch (error) {
    console.error('Generate complete lesson error:', error);
    res.status(500).json({ error: error.message });
  }
};
