const path = require('path');
const fs = require('fs').promises;
const { v4: uuidv4 } = require('uuid');
const celeryClient = require('../services/celeryClient');

/**
 * Upload file handler
 * File sẽ được xử lý asynchronously qua Celery
 */
exports.uploadFile = async (req, res) => {
  try {
    if (!req.file) {
      return res.status(400).json({ error: 'Không có file được upload' });
    }

    const fileId = uuidv4();
    const fileInfo = {
      id: fileId,
      originalName: req.file.originalname,
      filename: req.file.filename,
      path: req.file.path,
      mimetype: req.file.mimetype,
      size: req.file.size,
      uploadedAt: new Date().toISOString(),
      userId: req.userId,
      status: 'uploaded', // will be updated to 'processing', 'completed', or 'failed'
      processingTaskId: null
    };

    // Xác định loại file
    const ext = path.extname(req.file.originalname).toLowerCase();
    const mimeType = req.file.mimetype;
    const isImage = mimeType.startsWith('image/');
    const isPdf = mimeType === 'application/pdf' || ext === '.pdf';

    let taskId = null;

    // Enqueue processing task nếu có Celery
    if (process.env.CELERY_API_URL) {
      try {
        const fileData = {
          file_id: fileId,
          file_path: req.file.path,
          file_name: req.file.originalname,
          mime_type: req.file.mimetype,
          user_id: req.userId,
          file_type: isPdf ? 'pdf' : (isImage ? 'image' : 'unknown')
        };

        const taskResponse = await celeryClient.enqueueFileProcessingTask(fileData);
        taskId = taskResponse.task_id;
        fileInfo.processingTaskId = taskId;
        fileInfo.status = 'processing';

        console.log(`✅ File upload enqueued for processing. Task ID: ${taskId}`);
      } catch (celeryError) {
        console.warn('⚠️ Failed to enqueue file processing task:', celeryError.message);
        // Không fail request, chỉ log warning
        fileInfo.status = 'uploaded'; // Mark as uploaded nhưng không process
      }
    } else {
      console.warn('⚠️ CELERY_API_URL not configured - file processing disabled');
      fileInfo.status = 'uploaded';
    }

    res.json({
      success: true,
      message: 'Upload file thành công' + (taskId ? ' - Đang xử lý file' : ''),
      file: fileInfo,
      task_id: taskId // Client có thể dùng để track progress
    });
  } catch (error) {
    console.error('❌ Upload error:', error);
    res.status(500).json({ error: 'Lỗi upload file', details: error.message });
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

    const files = [];
    const tasksToProcess = [];

    for (const file of req.files) {
      const fileId = uuidv4();
      const ext = path.extname(file.originalname).toLowerCase();
      const isPdf = file.mimetype === 'application/pdf' || ext === '.pdf';
      const isImage = file.mimetype.startsWith('image/');

      const fileInfo = {
        id: fileId,
        originalName: file.originalname,
        filename: file.filename,
        path: file.path,
        mimetype: file.mimetype,
        size: file.size,
        uploadedAt: new Date().toISOString(),
        userId: req.userId,
        status: 'uploaded',
        processingTaskId: null
      };

      // Enqueue processing task
      if (process.env.CELERY_API_URL) {
        try {
          const fileData = {
            file_id: fileId,
            file_path: file.path,
            file_name: file.originalname,
            mime_type: file.mimetype,
            user_id: req.userId,
            file_type: isPdf ? 'pdf' : (isImage ? 'image' : 'unknown')
          };

          const taskResponse = await celeryClient.enqueueFileProcessingTask(fileData);
          fileInfo.processingTaskId = taskResponse.task_id;
          fileInfo.status = 'processing';
          tasksToProcess.push(taskResponse.task_id);
        } catch (celeryError) {
          console.warn(`⚠️ Failed to enqueue file ${file.originalname}:`, celeryError.message);
        }
      }

      files.push(fileInfo);
    }

    console.log(`✅ uploaded ${files.length} files. Processing tasks: ${tasksToProcess.length}`);

    res.json({
      success: true,
      message: `Upload ${files.length} files thành công` + 
               (tasksToProcess.length > 0 ? ` - Đang xử lý ${tasksToProcess.length} file` : ''),
      files,
      task_ids: tasksToProcess
    });
  } catch (error) {
    console.error('❌ Upload multiple error:', error);
    res.status(500).json({ error: 'Lỗi upload files', details: error.message });
  }
};

/**
 * Get file processing status
 */
exports.getFileStatus = async (req, res) => {
  try {
    const { fileId } = req.params;

    // TODO: Implement database lookup to get file info and task status
    // For now, just return fileId
    res.json({
      fileId,
      message: 'Feature coming soon'
    });
  } catch (error) {
    console.error('❌ Get file status error:', error);
    res.status(500).json({ error: 'Lỗi lấy status file' });
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
    console.error('❌ Delete file error:', error);
    res.status(500).json({ error: 'Lỗi xóa file' });
  }
};
