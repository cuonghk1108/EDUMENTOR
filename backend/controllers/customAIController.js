const aiService = require('../services/aiService');

/**
 * Custom AI - Process user requests with custom prompts
 * POST /api/ai/custom
 */
const processCustomRequest = async (req, res) => {
  try {
    const { prompt, outputType = 'lesson', outputFormat = 'markdown' } = req.body;

    if (!prompt || !prompt.trim()) {
      return res.status(400).json({
        success: false,
        message: 'Vui lòng nhập yêu cầu'
      });
    }

    // Call AI service to process the custom request
    const result = await aiService.generateWithCustomPrompt(
      prompt,
      outputType,
      outputFormat
    );

    res.json({
      success: true,
      content: result.content,
      format: outputFormat,
      type: outputType
    });
  } catch (error) {
    console.error('Custom AI Error:', error);
    res.status(500).json({
      success: false,
      message: error.message || 'Lỗi xử lý yêu cầu'
    });
  }
};

module.exports = {
  processCustomRequest
};
