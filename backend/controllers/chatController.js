const aiService = require('../services/aiService');
const { chatService, lessonService } = require('../services/firebaseService');

/**
 * Send message to AI chat
 */
exports.sendMessage = async (req, res) => {
  try {
    const { message, lessonId, context } = req.body;
    const userId = req.userId;

    if (!message) {
      return res.status(400).json({ error: 'Vui lòng nhập tin nhắn' });
    }

    // Get lesson context if provided
    let lessonContext = context || '';
    if (lessonId) {
      const lesson = await lessonService.getById(lessonId);
      if (lesson) {
        lessonContext = lesson.originalText || lesson.content;
      }
    }

    // Get chat history
    const history = await chatService.getHistory(userId, 10);
    const formattedHistory = history.map(msg => ({
      role: msg.role,
      content: msg.content
    }));

    // Save user message
    await chatService.addMessage(userId, {
      role: 'user',
      content: message,
      lessonId: lessonId || null
    });

    // Generate AI response
    const result = await aiService.chat(message, lessonContext, formattedHistory);

    // Save AI response
    const aiMessage = await chatService.addMessage(userId, {
      role: 'assistant',
      content: result.response,
      lessonId: lessonId || null
    });

    res.json({
      success: true,
      message: aiMessage,
      usage: result.usage
    });
  } catch (error) {
    console.error('Chat error:', error);
    res.status(500).json({ error: error.message });
  }
};

/**
 * Get chat history
 */
exports.getChatHistory = async (req, res) => {
  try {
    const { userId } = req.params;
    const limit = parseInt(req.query.limit) || 50;

    const history = await chatService.getHistory(userId, limit);

    res.json({
      success: true,
      history,
      count: history.length
    });
  } catch (error) {
    console.error('Get chat history error:', error);
    res.status(500).json({ error: error.message });
  }
};

/**
 * Clear chat history
 */
exports.clearChatHistory = async (req, res) => {
  try {
    const { userId } = req.params;

    const result = await chatService.clearHistory(userId);

    res.json({
      success: true,
      message: `Đã xóa ${result.deleted} tin nhắn`
    });
  } catch (error) {
    console.error('Clear chat history error:', error);
    res.status(500).json({ error: error.message });
  }
};
