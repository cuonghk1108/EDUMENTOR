const ocrService = require('../services/ocrService');
const path = require('path');

/**
 * Process OCR from uploaded file path
 */
exports.processOCR = async (req, res) => {
  try {
    const { filePath, language } = req.body;

    if (!filePath) {
      return res.status(400).json({ error: 'Vui lòng cung cấp đường dẫn file' });
    }

    // Process file based on type
    const result = await ocrService.processFile(filePath);

    // Chunk text for AI processing
    const chunks = ocrService.chunkText(result.text);

    res.json({
      success: true,
      text: result.text,
      chunks,
      confidence: result.confidence,
      pages: result.pages
    });
  } catch (error) {
    console.error('OCR error:', error);
    res.status(500).json({ error: error.message });
  }
};

/**
 * Process OCR from uploaded image
 */
exports.processImageOCR = async (req, res) => {
  try {
    if (!req.file) {
      return res.status(400).json({ error: 'Không có ảnh được upload' });
    }

    const language = req.body.language || 'vie+eng';
    const result = await ocrService.processImage(req.file.path, language);

    // Chunk text for AI processing
    const chunks = ocrService.chunkText(result.text);

    res.json({
      success: true,
      text: result.text,
      chunks,
      confidence: result.confidence,
      words: result.words,
      file: {
        originalName: req.file.originalname,
        path: req.file.path
      }
    });
  } catch (error) {
    console.error('Image OCR error:', error);
    res.status(500).json({ error: error.message });
  }
};

/**
 * Process base64 image OCR
 */
exports.processBase64OCR = async (req, res) => {
  try {
    const { image, language } = req.body;

    if (!image) {
      return res.status(400).json({ error: 'Vui lòng cung cấp ảnh base64' });
    }

    const result = await ocrService.processBase64Image(image, language || 'vie+eng');

    res.json({
      success: true,
      text: result.text,
      confidence: result.confidence
    });
  } catch (error) {
    console.error('Base64 OCR error:', error);
    res.status(500).json({ error: error.message });
  }
};
