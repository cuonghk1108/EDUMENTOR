const multer = require('multer');
const path = require('path');
const fs = require('fs');
const { v4: uuidv4 } = require('uuid');

// Ensure upload directory exists
const uploadDir = path.join(__dirname, '../uploads');
if (!fs.existsSync(uploadDir)) {
  fs.mkdirSync(uploadDir, { recursive: true });
}

// Configure storage
const storage = multer.diskStorage({
  destination: (req, file, cb) => {
    cb(null, uploadDir);
  },
  filename: (req, file, cb) => {
    // Generate unique filename
    const uniqueName = `${uuidv4()}${path.extname(file.originalname)}`;
    cb(null, uniqueName);
  }
});

// File filter
const fileFilter = (req, file, cb) => {
  // Allowed file types
  const allowedTypes = [
    'image/jpeg',
    'image/png',
    'image/gif',
    'image/bmp',
    'image/tiff',
    'image/x-tiff',
    'image/webp',
    'image/heic',
    'image/heif',
    'application/pdf',
    'application/x-pdf',
    'application/octet-stream'
  ];

  const allowedExts = [
    '.jpg', '.jpeg', '.png', '.gif', '.bmp', '.tif', '.tiff', '.webp', '.heic', '.heif', '.pdf'
  ];
  const fileExt = path.extname(file.originalname || '').toLowerCase();

  // Log file info for debugging (hữu ích khi debug qua tunnel)
  console.log('📁 Upload file:', {
    originalname: file.originalname,
    mimetype: file.mimetype,
    fieldname: file.fieldname
  });

  if (allowedTypes.includes(file.mimetype) || allowedExts.includes(fileExt)) {
    cb(null, true);
  } else {
    console.warn('❌ File type rejected:', file.mimetype);
    cb(new Error(`File type not allowed. Allowed extensions: ${allowedExts.join(', ')}`), false);
  }
};

// Configure multer với options tối ưu cho tunnel
const upload = multer({
  storage,
  fileFilter,
  limits: {
    fileSize: parseInt(process.env.MAX_FILE_SIZE) || 100 * 1024 * 1024, // 100MB per file
    files: 5, // Maximum 5 files
    fieldSize: 100 * 1024 * 1024, // 100MB field size
    fieldNameSize: 200, // field name length
  },
  // Preserve path (quan trọng cho tunnel)
  preservePath: true
});

// Custom middleware to check total size (500MB limit)
const uploadWithTotalSizeLimit = (fieldName, maxCount = 5) => {
  return (req, res, next) => {
    const maxTotalSize = 500 * 1024 * 1024; // 500MB total
    
    // Log request info để debug tunnel issues
    console.log('📤 Upload request:', {
      contentType: req.headers['content-type'],
      contentLength: req.headers['content-length'],
      fieldName,
      ip: req.ip || req.headers['x-forwarded-for'] || req.connection.remoteAddress
    });
    
    const uploadHandler = maxCount === 1 
      ? upload.single(fieldName) 
      : upload.array(fieldName, maxCount);
    
    uploadHandler(req, res, (err) => {
      if (err) {
        console.error('❌ Upload error:', err.message, err.code);
        
        if (err.code === 'LIMIT_FILE_SIZE') {
          return res.status(400).json({ error: 'File quá lớn. Tối đa 100MB mỗi file.' });
        }
        if (err.code === 'LIMIT_FILE_COUNT') {
          return res.status(400).json({ error: 'Tối đa 5 file được phép upload.' });
        }
        if (err.code === 'LIMIT_UNEXPECTED_FILE') {
          return res.status(400).json({ error: 'Tên field không đúng. Vui lòng kiểm tra lại.' });
        }
        // Lỗi chunked encoding qua tunnel
        if (err.message && err.message.includes('Unexpected end of form')) {
          return res.status(400).json({ 
            error: 'Lỗi upload file qua mạng. Vui lòng thử lại hoặc dùng file nhỏ hơn.',
            hint: 'Có thể do kết nối mạng không ổn định'
          });
        }
        return res.status(400).json({ error: err.message });
      }
      
      // Log thành công
      if (req.file) {
        console.log('✅ File uploaded:', req.file.originalname, `(${(req.file.size / 1024 / 1024).toFixed(2)} MB)`);
      }
      if (req.files && Array.isArray(req.files)) {
        console.log('✅ Files uploaded:', req.files.length, 'files');
      }
      
      // Check total size for multiple files
      if (req.files && Array.isArray(req.files)) {
        const totalSize = req.files.reduce((sum, file) => sum + file.size, 0);
        if (totalSize > maxTotalSize) {
          // Delete uploaded files
          req.files.forEach(file => {
            const fs = require('fs');
            fs.unlink(file.path, () => {});
          });
          return res.status(400).json({ error: 'Tổng dung lượng vượt quá 500MB.' });
        }
      }
      
      next();
    });
  };
};

module.exports = upload;
module.exports.uploadWithTotalSizeLimit = uploadWithTotalSizeLimit;
