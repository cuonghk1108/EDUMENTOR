const Tesseract = require('tesseract.js');
const pdfParse = require('pdf-parse');
const fs = require('fs').promises;
const path = require('path');
const Jimp = require('jimp');
const { pdf2pic } = require('pdf2pic');

// ============================================
// OCR SERVICE
// ============================================

const OCR_MATH_SYMBOLS = [
  [/\u2264/g, '<='],
  [/\u2265/g, '>='],
  [/\u2260/g, '!='],
  [/\u2248/g, '\\approx'],
  [/\u00b1/g, '+/-'],
  [/\u00d7/g, '\\times'],
  [/\u00f7/g, '/'],
  [/\u00b7/g, '\\cdot'],
  [/\u221e/g, '\\infty'],
  [/\u2192/g, '->'],
  [/\u21d2/g, '=>'],
  [/\u00b0/g, '^\\circ'],
  [/\uf03d/g, '='],
  [/\uf02b/g, '+'],
  [/\uf02d/g, '-'],
  [/\uf0d7/g, '\\times'],
  [/\uf0b7/g, '\\cdot'],
  [/\uf0b0/g, '^\\circ'],
  [/\uf061/g, '\\alpha'],
  [/\uf062/g, '\\beta'],
  [/\uf071/g, '\\theta'],
  [/\uf070/g, '\\pi'],
  [/\uf0a2/g, "'"],
  [/\uf0de/g, '=>']
];

function normalizeOcrMathSymbols(text) {
  return OCR_MATH_SYMBOLS.reduce((value, [pattern, replacement]) => {
    return value.replace(pattern, ` ${replacement} `);
  }, String(text));
}

const ocrService = {
  async runTesseract(imagePath, language, config = {}) {
    return Tesseract.recognize(imagePath, language, {
      ...config,
      logger: (m) => {
        if (m.status === 'recognizing text') {
          console.log(`OCR Progress: ${Math.round(m.progress * 100)}%`);
        }
      }
    });
  },

  async createPreprocessedVariants(imagePath) {
    const variants = [{ name: 'original', path: imagePath, temp: false }];
    const tempDir = path.join(__dirname, '../uploads');

    try {
      const image = await Jimp.read(imagePath);
      image.background(0xffffffff);

      const enhancedPath = path.join(tempDir, `ocr_enhanced_${Date.now()}.png`);
      await image
        .clone()
        .greyscale()
        .normalize()
        .contrast(0.45)
        .convolute([
          [0, -1, 0],
          [-1, 5, -1],
          [0, -1, 0]
        ])
        .writeAsync(enhancedPath);

      variants.push({ name: 'enhanced', path: enhancedPath, temp: true });

      const width = image.bitmap.width;
      const height = image.bitmap.height;
      if (width < 1800 || height < 1800) {
        const upscalePath = path.join(tempDir, `ocr_upscale_${Date.now()}.png`);
        await image
          .clone()
          .greyscale()
          .normalize()
          .contrast(0.5)
          .resize(width * 2, height * 2, Jimp.RESIZE_BICUBIC)
          .writeAsync(upscalePath);

        variants.push({ name: 'upscale', path: upscalePath, temp: true });
      }

      const binaryPath = path.join(tempDir, `ocr_binary_${Date.now()}.png`);
      await image
        .clone()
        .greyscale()
        .normalize()
        .contrast(0.6)
        .threshold({ max: 180 })
        .writeAsync(binaryPath);

      variants.push({ name: 'binary', path: binaryPath, temp: true });
    } catch (error) {
      console.warn('⚠️ Không thể tiền xử lý ảnh, fallback ảnh gốc:', error.message);
    }

    return variants;
  },

  getOcrStrategies(language) {
    return [
      { name: 'balanced', language, config: { tessedit_pageseg_mode: 6, preserve_interword_spaces: '1' } },
      { name: 'auto-layout', language, config: { tessedit_pageseg_mode: 3, preserve_interword_spaces: '1' } },
      { name: 'sparse-text', language, config: { tessedit_pageseg_mode: 11 } },
      { name: 'single-column', language, config: { tessedit_pageseg_mode: 4, preserve_interword_spaces: '1' } }
    ];
  },

  scoreOcrResult(text, confidence) {
    const lengthScore = Math.min((text?.length || 0) / 20, 40);
    const confidenceScore = Number(confidence) || 0;
    return confidenceScore + lengthScore;
  },

  /**
   * Process image with Tesseract OCR
   * @param {string} imagePath - Path to image file
   * @param {string} language - OCR language (default: vie+eng for Vietnamese + English)
   */
  async processImage(imagePath, language = 'vie+eng') {
    try {
      console.log(`🔍 Processing OCR for: ${imagePath}`);

      const variants = await this.createPreprocessedVariants(imagePath);
      const strategies = this.getOcrStrategies(language);
      let best = null;

      for (const variant of variants) {
        for (const strategy of strategies) {
          try {
            console.log(`🧠 OCR strategy: ${variant.name} + ${strategy.name}`);
            const result = await this.runTesseract(variant.path, strategy.language, strategy.config);
            const rawText = result.data.text?.trim() || '';
            const cleanedText = this.cleanOCRText(rawText);
            const confidence = result.data.confidence || 0;
            const score = this.scoreOcrResult(cleanedText, confidence);

            if (!best || score > best.score) {
              best = {
                success: true,
                text: cleanedText,
                confidence,
                words: result.data.words?.length || 0,
                score,
                strategy: `${variant.name}:${strategy.name}`
              };
            }

            if (cleanedText.length > 200 && confidence >= 70) {
              break;
            }
          } catch (error) {
            console.warn(`⚠️ OCR failed at ${variant.name}:${strategy.name} -`, error.message);
          }
        }
      }

      await Promise.all(
        variants
          .filter((variant) => variant.temp)
          .map((variant) => fs.unlink(variant.path).catch(() => {}))
      );

      if (!best || !best.text) {
        throw new Error('Không thể đọc được nội dung rõ ràng từ ảnh. Vui lòng thử ảnh nét hơn hoặc ánh sáng tốt hơn.');
      }

      return {
        success: true,
        text: best.text,
        confidence: best.confidence,
        words: best.words,
        strategy: best.strategy
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
   * Convert PDF page to image using pdf2pic
   */
  async convertPdfPageToImage(pdfPath, pageNum) {
    try {
      const tempDir = path.join(__dirname, '../uploads/temp');
      await fs.mkdir(tempDir, { recursive: true });

      // Use pdf2pic to convert PDF to images
      const converter = pdf2pic({
        density: 200, // DPI for better OCR quality
        savename: `pdf_page_${Date.now()}_${pageNum}`,
        savedir: tempDir,
        format: 'png',
        width: 2000,
        height: 2000,
      });

      // Convert only specific page
      const result = await converter.convertPage(pdfPath, pageNum);
      return result;
    } catch (error) {
      console.error(`Error converting PDF page ${pageNum}:`, error);
      throw error;
    }
  },

  /**
   * Process PDF file - with automatic OCR fallback for scanned PDFs
   * @param {string} pdfPath - Path to PDF file
   */
  async processPDF(pdfPath) {
    try {
      console.log(`📄 Processing PDF: ${pdfPath}`);
      
      const dataBuffer = await fs.readFile(pdfPath);
      const data = await pdfParse(dataBuffer);

      let cleanedText = this.cleanOCRText(data.text);
      if (cleanedText.length < 120) {
        const vietnameseOnly = this.extractVietnameseText(cleanedText);
        if (vietnameseOnly.length > cleanedText.length) {
          cleanedText = vietnameseOnly;
        }
      }

      // If text is too short, this is likely a scanned PDF - automatically OCR it
      if (cleanedText.length < 40) {
        console.log(`⚠️  PDF không có text layer (${cleanedText.length} ký tự). Đang tự động chuyển đổi sang ảnh và OCR...`);
        
        try {
          const tempFiles = [];
          const allPagesText = [];
          
          // Process maximum 5 pages
          const maxPages = Math.min(data.numpages, 5);
          console.log(`📄 Sẽ xử lý ${maxPages} trang đầu tiên...`);
          
          for (let i = 1; i <= maxPages; i++) {
            console.log(`🔍 Đang xử lý trang ${i}/${maxPages}...`);
            
            try {
              // Convert PDF page to image
              const imageResult = await this.convertPdfPageToImage(pdfPath, i);
              const imagePath = typeof imageResult === 'string' ? imageResult : imageResult?.path;

              if (!imagePath) {
                throw new Error(`Khong tao duoc anh tu trang PDF ${i}`);
              }

              tempFiles.push(imagePath);
              
              // Run OCR on the image
              const ocrResult = await this.processImage(imagePath);
              
              if (ocrResult.text && ocrResult.text.length > 20) {
                allPagesText.push(`--- Trang ${i} ---\n${ocrResult.text}`);
                console.log(`✅ Trang ${i}: OCR thành công (${ocrResult.text.length} ký tự)`);
              } else {
                console.log(`⚠️  Trang ${i}: Không đọc được nội dung`);
              }
            } catch (pageError) {
              console.error(`❌ Lỗi xử lý trang ${i}:`, pageError.message);
            }
          }
          
          // Clean up temp files
          for (const tempFile of tempFiles) {
            try {
              await fs.unlink(tempFile);
            } catch (e) {
              // Ignore cleanup errors
            }
          }
          
          const combinedText = allPagesText.join('\n\n');
          
          if (combinedText.length < 40) {
            throw new Error('Không thể đọc được nội dung từ PDF scan. Vui lòng thử:\n1. Chụp ảnh rõ hơn từng trang\n2. Upload file ảnh JPG/PNG thay vì PDF\n3. Đảm bảo chữ trong ảnh rõ nét, không bị mờ');
          }
          
          console.log(`✅ OCR PDF scan hoàn tất! Tổng: ${combinedText.length} ký tự từ ${allPagesText.length} trang`);
          
          return {
            success: true,
            text: combinedText,
            pages: allPagesText.length,
            method: 'auto-ocr',
            info: { message: `PDF scan được tự động OCR (${allPagesText.length}/${data.numpages} trang)` }
          };
        } catch (ocrError) {
          console.error('❌ Lỗi OCR tự động:', ocrError);
          throw new Error(`Không thể OCR PDF scan: ${ocrError.message}`);
        }
      }

      // Text extraction successful
      return {
        success: true,
        text: cleanedText,
        pages: data.numpages,
        method: 'text-extraction',
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
    } else if (['.jpg', '.jpeg', '.png', '.gif', '.bmp', '.tiff', '.tif', '.webp', '.heic', '.heif'].includes(ext)) {
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

    return normalizeOcrMathSymbols(text)
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
