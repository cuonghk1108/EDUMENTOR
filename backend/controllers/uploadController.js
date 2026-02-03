const path = require('path');
const fs = require('fs').promises;
const { v4: uuidv4 } = require('uuid');

/**
 * Upload file handler
 */
exports.uploadFile = async (req, res) => {
  try {
    if (!req.file) {
      return res.status(400).json({ error: 'Không có file được upload' });
    }

    const fileInfo = {
      id: uuidv4(),
      originalName: req.file.originalname,
      filename: req.file.filename,
      path: req.file.path,
      mimetype: req.file.mimetype,
      size: req.file.size,
      uploadedAt: new Date().toISOString(),
      userId: req.userId
    };

    res.json({
      success: true,
      message: 'Upload file thành công',
      file: fileInfo
    });
  } catch (error) {
    console.error('Upload error:', error);
    res.status(500).json({ error: 'Lỗi upload file' });
  }
};

/**
 * Upload multiple files handler
 */
exports.uploadMultiple = async (req, res) => {
  try {
    if (!req.files || req.files.length === 0) {
      return res.status(400).json({ error: 'Không có file được upload' });
    }

    const files = req.files.map(file => ({
      id: uuidv4(),
      originalName: file.originalname,
      filename: file.filename,
      path: file.path,
      mimetype: file.mimetype,
      size: file.size,
      uploadedAt: new Date().toISOString(),
      userId: req.userId
    }));

    res.json({
      success: true,
      message: `Upload ${files.length} files thành công`,
      files
    });
  } catch (error) {
    console.error('Upload multiple error:', error);
    res.status(500).json({ error: 'Lỗi upload files' });
  }
};

/**
 * Delete file handler
 */
exports.deleteFile = async (req, res) => {
  try {
    const { filename } = req.params;
    const filePath = path.join(__dirname, '../uploads', filename);

    await fs.unlink(filePath);

    res.json({
      success: true,
      message: 'Xóa file thành công'
    });
  } catch (error) {
    console.error('Delete file error:', error);
    res.status(500).json({ error: 'Lỗi xóa file' });
  }
};
