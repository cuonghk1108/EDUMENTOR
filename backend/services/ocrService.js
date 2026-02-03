const Tesseract = require('tesseract.js');
const pdfParse = require('pdf-parse');
const fs = require('fs').promises;
const path = require('path');

// ============================================
// OCR SERVICE
// ============================================

const ocrService = {
  /**
   * Process image with Tesseract OCR
   * @param {string} imagePath - Path to image file
   * @param {string} language - OCR language (default: vie+eng for Vietnamese + English)
   */
  async processImage(imagePath, language = 'vie+eng') {
    try {
      console.log(`🔍 Processing OCR for: ${imagePath}`);
      
      const result = await Tesseract.recognize(imagePath, language, {
        logger: (m) => {
          if (m.status === 'recognizing text') {
            console.log(`OCR Progress: ${Math.round(m.progress * 100)}%`);
          }
        }
      });

      const text = result.data.text.trim();
      
      // Clean up the text
      const cleanedText = this.cleanOCRText(text);
      
      return {
        success: true,
        text: cleanedText,
        confidence: result.data.confidence,
        words: result.data.words?.length || 0
      };
    } catch (error) {
      console.error('OCR Error:', error);
      throw new Error(`Lỗi OCR: ${error.message}`);
    }
  },

  /**
   * Process multiple images
   * @param {string[]} imagePaths - Array of image paths
   */
  async processMultipleImages(imagePaths, language = 'vie+eng') {
    const results = [];
    
    for (let i = 0; i < imagePaths.length; i++) {
      console.log(`Processing image ${i + 1}/${imagePaths.length}`);
      const result = await this.processImage(imagePaths[i], language);
      results.push({
        page: i + 1,
        ...result
      });
    }

    // Combine all text
    const combinedText = results.map(r => r.text).join('\n\n---\n\n');
    const avgConfidence = results.reduce((sum, r) => sum + r.confidence, 0) / results.length;

    return {
      success: true,
      pages: results,
      combinedText,
      averageConfidence: avgConfidence
    };
  },

  /**
   * Process PDF file
   * @param {string} pdfPath - Path to PDF file
   */
  async processPDF(pdfPath) {
    try {
      console.log(`📄 Processing PDF: ${pdfPath}`);
      
      const dataBuffer = await fs.readFile(pdfPath);
      const data = await pdfParse(dataBuffer);

      const cleanedText = this.cleanOCRText(data.text);

      return {
        success: true,
        text: cleanedText,
        pages: data.numpages,
        info: data.info
      };
    } catch (error) {
      console.error('PDF Parse Error:', error);
      throw new Error(`Lỗi đọc PDF: ${error.message}`);
    }
  },

  /**
   * Process any file (auto-detect type)
   * @param {string} filePath - Path to file
   */
  async processFile(filePath) {
    const ext = path.extname(filePath).toLowerCase();

    if (ext === '.pdf') {
      return this.processPDF(filePath);
    } else if (['.jpg', '.jpeg', '.png', '.gif', '.bmp', '.tiff'].includes(ext)) {
      return this.processImage(filePath);
    } else {
      throw new Error(`Định dạng file không được hỗ trợ: ${ext}`);
    }
  },

  /**
   * Process base64 image
   * @param {string} base64Data - Base64 encoded image data
   */
  async processBase64Image(base64Data, language = 'vie+eng') {
    try {
      // Remove data URL prefix if present
      const base64 = base64Data.replace(/^data:image\/\w+;base64,/, '');
      const buffer = Buffer.from(base64, 'base64');
      
      // Create temp file
      const tempPath = path.join(__dirname, '../uploads', `temp_${Date.now()}.png`);
      await fs.writeFile(tempPath, buffer);

      try {
        const result = await this.processImage(tempPath, language);
        return result;
      } finally {
        // Clean up temp file
        await fs.unlink(tempPath).catch(() => {});
      }
    } catch (error) {
      console.error('Base64 OCR Error:', error);
      throw new Error(`Lỗi xử lý ảnh: ${error.message}`);
    }
  },

  /**
   * Clean and normalize OCR text
   * @param {string} text - Raw OCR text
   */
  cleanOCRText(text) {
    if (!text) return '';

    return text
      // Remove excessive whitespace
      .replace(/\s+/g, ' ')
      // Fix common OCR errors for Vietnamese
      .replace(/\s+([.,;:!?])/g, '$1')
      // Remove page numbers
      .replace(/\b\d+\s*$/gm, '')
      // Fix spacing after periods
      .replace(/\.([A-ZĐ])/g, '. $1')
      // Remove null characters
      .replace(/\x00/g, '')
      // Normalize line breaks
      .replace(/(\r\n|\r)/g, '\n')
      // Remove excessive line breaks
      .replace(/\n{3,}/g, '\n\n')
      // Trim
      .trim();
  },

  /**
   * Chunk text into smaller parts for AI processing
   * @param {string} text - Full text content
   * @param {number} maxChunkSize - Maximum size of each chunk
   * @param {number} overlap - Overlap between chunks
   */
  chunkText(text, maxChunkSize = 3000, overlap = 200) {
    if (!text || text.length <= maxChunkSize) {
      return [text];
    }

    const chunks = [];
    let startIndex = 0;

    while (startIndex < text.length) {
      let endIndex = Math.min(startIndex + maxChunkSize, text.length);
      
      // Try to end at a sentence boundary
      if (endIndex < text.length) {
        const lastPeriod = text.lastIndexOf('.', endIndex);
        const lastNewline = text.lastIndexOf('\n', endIndex);
        const breakPoint = Math.max(lastPeriod, lastNewline);
        
        if (breakPoint > startIndex + maxChunkSize * 0.5) {
          endIndex = breakPoint + 1;
        }
      }

      chunks.push(text.slice(startIndex, endIndex).trim());
      startIndex = endIndex - overlap;
    }

    return chunks;
  },

  /**
   * Extract Vietnamese text specifically
   * @param {string} text - Raw text
   */
  extractVietnameseText(text) {
    // Vietnamese character regex
    const vietnameseRegex = /[àáạảãâầấậẩẫăằắặẳẵèéẹẻẽêềếệểễìíịỉĩòóọỏõôồốộổỗơờớợởỡùúụủũưừứựửữỳýỵỷỹđÀÁẠẢÃÂẦẤẬẨẪĂẰẮẶẲẴÈÉẸẺẼÊỀẾỆỂỄÌÍỊỈĨÒÓỌỎÕÔỒỐỘỔỖƠỜỚỢỞỠÙÚỤỦŨƯỪỨỰỬỮỲÝỴỶỸĐa-zA-Z0-9\s.,;:!?()\-"']/g;
    
    const matches = text.match(vietnameseRegex);
    return matches ? matches.join('') : '';
  }
};

module.exports = ocrService;
