const axios = require('axios');

const celeryApi = axios.create({
  baseURL: process.env.CELERY_API_URL || 'http://localhost:8001',
  timeout: parseInt(process.env.CELERY_API_TIMEOUT_MS, 10) || 15000
});

/**
 * Enqueue lesson generation task
 */
exports.enqueueLessonTask = async (payload) => {
  try {
    const { data } = await celeryApi.post('/tasks/lesson', payload);
    return data;
  } catch (error) {
    console.error('❌ Failed to enqueue lesson task:', error.message);
    throw error;
  }
};

/**
 * Enqueue file processing task (OCR, PDF extract, etc)
 */
exports.enqueueFileProcessingTask = async (fileData) => {
  try {
    const { data } = await celeryApi.post('/tasks/file', fileData);
    return data;
  } catch (error) {
    console.error('❌ Failed to enqueue file processing task:', error.message);
    throw error;
  }
};

/**
 * Enqueue image OCR task
 */
exports.enqueueImageOcrTask = async (filePath, fileId) => {
  try {
    const { data } = await celeryApi.post('/tasks/image-ocr', {
      file_path: filePath,
      file_id: fileId
    });
    return data;
  } catch (error) {
    console.error('❌ Failed to enqueue image OCR task:', error.message);
    throw error;
  }
};

/**
 * Enqueue PDF extraction task
 */
exports.enqueuePdfExtractionTask = async (filePath, fileId) => {
  try {
    const { data } = await celeryApi.post('/tasks/pdf-extract', {
      file_path: filePath,
      file_id: fileId
    });
    return data;
  } catch (error) {
    console.error('❌ Failed to enqueue PDF extraction task:', error.message);
    throw error;
  }
};

/**
 * Get task status
 */
exports.getTaskStatus = async (taskId) => {
  try {
    const { data } = await celeryApi.get(`/tasks/${taskId}`);
    return data;
  } catch (error) {
    console.error('❌ Failed to get task status:', error.message);
    throw error;
  }
};

/**
 * Cancel task
 */
exports.cancelTask = async (taskId) => {
  try {
    const { data } = await celeryApi.post(`/tasks/${taskId}/cancel`);
    return data;
  } catch (error) {
    console.error('❌ Failed to cancel task:', error.message);
    throw error;
  }
};
