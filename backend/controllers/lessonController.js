const aiService = require('../services/aiService');
const { lessonService, learningStatsService, dailyStatsService } = require('../services/firebaseService');

const generateLessonForUser = async ({ userId, text, title, subject, chapter }) => {
  // Generate both markdown and structured content
  const markdownResult = await aiService.generateLesson(text);

  let structuredContent = null;
  try {
    const structuredResult = await aiService.generateLessonStructured(text);
    structuredContent = structuredResult.lesson;
  } catch (structuredError) {
    console.warn('⚠️ Structured generation failed, fallback to markdown only:', structuredError.message);
  }

  const lessonData = {
    userId,
    title: title || 'Bài học mới',
    subject: subject || 'Chung',
    chapter: chapter || '',
    originalText: text,
    content: markdownResult.content,
    structuredContent: structuredContent,
    completed: false,
    audioGenerated: false,
    createdAt: new Date()
  };

  const savedLesson = await lessonService.create(lessonData);
  await learningStatsService.incrementLessonCount(userId);

  return {
    lesson: savedLesson,
    usage: markdownResult.usage
  };
};

const normalizeCompleteLessonResult = (result) => {
  const structuredContent = result.structuredContent || result.json || null;
  const content = result.content || result.markdown || result.latex || result.latexContent || '';
  const latexContent = result.latexContent || result.latex || null;

  return {
    content,
    structuredContent,
    latexContent,
    usage: result.usage
  };
};

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

    const generated = await generateLessonForUser({ userId, text, title, subject, chapter });

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

exports.generateLessonInternal = async (req, res) => {
  try {
    const { userId, text, title, subject, chapter } = req.body;

    if (!userId) {
      return res.status(400).json({ error: 'Thiếu userId' });
    }

    if (!text || !text.trim()) {
      return res.status(400).json({ error: 'Vui lòng cung cấp nội dung' });
    }

    const generated = await generateLessonForUser({ userId, text, title, subject, chapter });

    return res.json({
      success: true,
      lesson: generated.lesson,
      usage: generated.usage
    });
  } catch (error) {
    console.error('Generate lesson internal error:', error);
    return res.status(500).json({ error: error.message });
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
    
    // Track daily stats for engagement
    await dailyStatsService.incrementLessons(userId);

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
    const normalized = normalizeCompleteLessonResult(result);
    result.json = normalized.structuredContent || {};
    result.latex = normalized.latexContent || normalized.content;

    // Save lesson to database with both formats
    const lessonData = {
      userId,
      title: result.json.title || title || 'Bài học',
      subject: result.json.subject || subject || 'Toán',
      chapter: result.json.chapter || chapter || '',
      originalText: text,
      content: normalized.content,
      structuredContent: normalized.structuredContent,
      latexContent: normalized.latexContent,
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
      content: normalized.content,
      latex: normalized.latexContent,
      json: normalized.structuredContent,
      usage: normalized.usage
    });
  } catch (error) {
    console.error('Generate complete lesson error:', error);
    res.status(500).json({ error: error.message });
  }
};

/**
 * Customize lesson with user's custom prompt
 */
exports.customizeLesson = async (req, res) => {
  try {
    const { lessonId } = req.params;
    const { customPrompt } = req.body;
    const userId = req.userId;

    if (!customPrompt) {
      return res.status(400).json({ error: 'Vui lòng cung cấp yêu cầu' });
    }

    // Get lesson from database
    const lesson = await lessonService.getById(lessonId);

    if (!lesson) {
      return res.status(404).json({ error: 'Không tìm thấy bài học' });
    }

    if (lesson.userId !== userId) {
      return res.status(403).json({ error: 'Không có quyền truy cập' });
    }

    // Generate customized lesson based on original text + custom prompt
    const originalText = lesson.originalText || lesson.content;
    const customPromptFull = `${originalText}\n\n[YÊU CẦU THÊM]: ${customPrompt}`;

    // Generate new lesson with custom prompt
    const result = await aiService.generateLessonComplete(customPromptFull);
    const normalized = normalizeCompleteLessonResult(result);

    // Update lesson with new content
    const updatedLesson = await lessonService.update(lessonId, {
      content: normalized.content,
      structuredContent: normalized.structuredContent,
      latexContent: normalized.latexContent,
      audioGenerated: false,
      hasAudio: false,
      customPrompt: customPrompt,
      lastCustomizedAt: new Date()
    });

    res.json({
      success: true,
      lesson: updatedLesson,
      message: 'Bài giảng đã được cập nhật theo yêu cầu của bạn'
    });
  } catch (error) {
    console.error('Customize lesson error:', error);
    res.status(500).json({ error: error.message });
  }
};
