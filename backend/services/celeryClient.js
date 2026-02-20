const axios = require('axios');

const celeryApi = axios.create({
  baseURL: process.env.CELERY_API_URL || 'http://localhost:8001',
  timeout: parseInt(process.env.CELERY_API_TIMEOUT_MS, 10) || 15000
});

exports.enqueueLessonTask = async (payload) => {
  const { data } = await celeryApi.post('/tasks/lesson', payload);
  return data;
};

exports.getTaskStatus = async (taskId) => {
  const { data } = await celeryApi.get(`/tasks/${taskId}`);
  return data;
};
