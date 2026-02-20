const celeryClient = require('../services/celeryClient');
const path = require('path');

exports.queueLessonGeneration = async (req, res) => {
  try {
    const { text, title, subject, chapter } = req.body;
    const userId = req.userId;

    if (!text || !text.trim()) {
      return res.status(400).json({ error: 'Vui lòng cung cấp nội dung' });
    }

    const task = await celeryClient.enqueueLessonTask({
      userId,
      text,
      title,
      subject,
      chapter
    });

    return res.status(202).json({
      success: true,
      message: 'Đã đưa tác vụ vào hàng đợi',
      task
    });
  } catch (error) {
    console.error('Queue lesson task error:', error.message);
    const status = error.response?.status || 500;
    const message = error.response?.data?.error || error.message || 'Không thể enqueue task';
    return res.status(status).json({ error: message });
  }
};

/**
 * Queue file processing task
 * Internal endpoint được gọi bởi Celery
 */
exports.queueFileProcessing = async (req, res) => {
  try {
    const { file_data } = req.body;

    if (!file_data || !file_data.file_path) {
      return res.status(400).json({ error: 'File data không hợp lệ' });
    }

    const task = await celeryClient.enqueueFileProcessingTask(file_data);

    return res.status(202).json({
      success: true,
      message: 'File đang được xử lý',
      task
    });
  } catch (error) {
    console.error('❌ Queue file processing error:', error.message);
    const status = error.response?.status || 500;
    const message = error.response?.data?.error || error.message || 'Không thể enqueue task';
    return res.status(status).json({ error: message });
  }
};

/**
 * Queue image OCR task
 */
exports.queueImageOcr = async (req, res) => {
  try {
    const { file_path, file_id } = req.body;

    if (!file_path || !file_id) {
      return res.status(400).json({ error: 'File path hoặc ID không hợp lệ' });
    }

    const task = await celeryClient.enqueueImageOcrTask(file_path, file_id);

    return res.status(202).json({
      success: true,
      message: 'Đang trích xuất text từ hình ảnh',
      task
    });
  } catch (error) {
    console.error('❌ Queue image OCR error:', error.message);
    const status = error.response?.status || 500;
    const message = error.response?.data?.error || error.message || 'OCR task failed';
    return res.status(status).json({ error: message });
  }
};

/**
 * Queue PDF extraction task
 */
exports.queuePdfExtraction = async (req, res) => {
  try {
    const { file_path, file_id } = req.body;

    if (!file_path || !file_id) {
      return res.status(400).json({ error: 'File path hoặc ID không hợp lệ' });
    }

    const task = await celeryClient.enqueuePdfExtractionTask(file_path, file_id);

    return res.status(202).json({
      success: true,
      message: 'Đang trích xuất nội dung từ PDF',
      task
    });
  } catch (error) {
    console.error('❌ Queue PDF extraction error:', error.message);
    const status = error.response?.status || 500;
    const message = error.response?.data?.error || error.message || 'PDF extraction failed';
    return res.status(status).json({ error: message });
  }
};

exports.getTaskStatus = async (req, res) => {
  try {
    const { taskId } = req.params;
    const status = await celeryClient.getTaskStatus(taskId);

    return res.json({
      success: true,
      task: status
    });
  } catch (error) {
    console.error('Get task status error:', error.message);
    const statusCode = error.response?.status || 500;
    const message = error.response?.data?.error || error.message || 'Không thể lấy trạng thái task';
    return res.status(statusCode).json({ error: message });
  }
};

/**
 * Cancel task
 */
exports.cancelTask = async (req, res) => {
  try {
    const { taskId } = req.params;
    const result = await celeryClient.cancelTask(taskId);

    return res.json({
      success: true,
      message: 'Task đã bị hủy',
      result
    });
  } catch (error) {
    console.error('Cancel task error:', error.message);
    const statusCode = error.response?.status || 500;
    const message = error.response?.data?.error || error.message || 'Không thể hủy task';
    return res.status(statusCode).json({ error: message });
  }
};
