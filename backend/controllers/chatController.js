const aiService = require('../services/aiService');
const ocrService = require('../services/ocrService');
const { chatService, lessonService, dailyStatsService } = require('../services/firebaseService');
const path = require('path');
const fs = require('fs').promises;

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
    
    // Track daily stats for engagement
    await dailyStatsService.incrementChats(userId);

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
 * Send message with image to AI chat
 */
exports.sendMessageWithImage = async (req, res) => {
  try {
    const { message, lessonId } = req.body;
    const userId = req.userId;

    if (!req.file) {
      return res.status(400).json({ error: 'Vui lòng upload ảnh' });
    }

    console.log('📷 Processing chat with image:', req.file.path);

    // Save image to permanent location
    const chatImagesDir = path.join(__dirname, '../uploads/chat-images');
    await fs.mkdir(chatImagesDir, { recursive: true });
    
    const imageFileName = `${userId}_${Date.now()}${path.extname(req.file.originalname)}`;
    const permanentPath = path.join(chatImagesDir, imageFileName);
    
    // Copy file to permanent location
    await fs.copyFile(req.file.path, permanentPath);
    const imageUrl = `/uploads/chat-images/${imageFileName}`;

    // OCR the image
    const ocrResult = await ocrService.processImage(req.file.path);
    
    if (!ocrResult.text || ocrResult.text.length < 10) {
      return res.status(400).json({ 
        error: 'Không thể đọc nội dung từ ảnh. Vui lòng thử lại với ảnh rõ hơn.' 
      });
    }

    // Build the full message with OCR content
    const userQuestion = message || 'Giải bài tập này giúp em';
    const fullMessage = `${userQuestion}\n\n[NỘI DUNG BÀI TẬP TỪ ẢNH]:\n${ocrResult.text}`;

    // Get lesson context if provided
    let lessonContext = '';
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

    // Save user message with image URL
    const userMsg = await chatService.addMessage(userId, {
      role: 'user',
      content: `📷 ${userQuestion}`,
      hasImage: true,
      imageUrl: imageUrl,
      ocrText: ocrResult.text,
      lessonId: lessonId || null
    });

    // Generate AI response with specialized prompt for homework
    const homeworkPrompt = `Học sinh gửi ảnh bài tập và hỏi: "${userQuestion}"

Nội dung bài tập từ ảnh:
${ocrResult.text}

Hãy:
1. Xác định đây là bài tập môn gì
2. Giải chi tiết từng bước
3. Giải thích cách làm để học sinh hiểu
4. Nếu có công thức, viết rõ ràng`;

    const result = await aiService.chat(homeworkPrompt, lessonContext, formattedHistory);

    // Save AI response
    const aiMessage = await chatService.addMessage(userId, {
      role: 'assistant',
      content: result.response,
      lessonId: lessonId || null
    });

    res.json({
      success: true,
      message: aiMessage,
      userMessage: userMsg,
      imageUrl: imageUrl,
      ocrText: ocrResult.text,
      ocrConfidence: ocrResult.confidence,
      usage: result.usage
    });
  } catch (error) {
    console.error('Chat with image error:', error);
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
