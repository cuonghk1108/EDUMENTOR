import axios from 'axios';

// Create axios instance
const api = axios.create({
  baseURL: process.env.REACT_APP_API_URL || 'http://localhost:5000/api',
  timeout: 30000,
  headers: {
    'Content-Type': 'application/json',
  },
});

// Request interceptor
api.interceptors.request.use(
  (config) => {
    const token = localStorage.getItem('token');
    if (token) {
      config.headers.Authorization = `Bearer ${token}`;
    }
    return config;
  },
  (error) => {
    return Promise.reject(error);
  }
);

// Response interceptor
api.interceptors.response.use(
  (response) => response,
  (error) => {
    if (error.response?.status === 401) {
      // Token expired or invalid
      localStorage.removeItem('token');
      localStorage.removeItem('user');
      window.location.href = '/login';
    }
    return Promise.reject(error);
  }
);

// ============================================
// API FUNCTIONS
// ============================================

// Auth
export const authAPI = {
  login: (data) => api.post('/auth/login', data),
  register: (data) => api.post('/auth/register', data),
  logout: () => api.post('/auth/logout'),
  getProfile: (userId) => api.get(`/profile/${userId}`),
  updateProfile: (userId, data) => api.put(`/profile/${userId}`, data),
};

// Upload
export const uploadAPI = {
  uploadFile: (formData) => api.post('/upload', formData, {
    headers: { 'Content-Type': 'multipart/form-data' },
  }),
  uploadMultiple: (formData) => api.post('/upload/multiple', formData, {
    headers: { 'Content-Type': 'multipart/form-data' },
  }),
  // Process SGK - Upload + OCR + Generate Lesson
  processSGK: (formData) => api.post('/process-sgk', formData, {
    headers: { 'Content-Type': 'multipart/form-data' },
    timeout: 120000, // 2 minutes for AI processing
  }),
};

// OCR
export const ocrAPI = {
  processFile: (filePath) => api.post('/ocr', { filePath }),
  processImage: (formData) => api.post('/ocr/image', formData, {
    headers: { 'Content-Type': 'multipart/form-data' },
  }),
};

// Lessons
export const lessonAPI = {
  generate: (data) => api.post('/lesson', data),
  getAll: (userId) => api.get(`/lessons/${userId}`),
  getById: (lessonId) => api.get(`/lesson/${lessonId}`),
  markComplete: (lessonId) => api.put(`/lesson/${lessonId}/complete`),
};

// Quiz
export const quizAPI = {
  generate: (data) => api.post('/quiz', data),
  getAll: (userId) => api.get(`/quizzes/${userId}`),
  getById: (quizId) => api.get(`/quiz/${quizId}`),
  submit: (data) => api.post('/quiz/submit', data),
  getHistory: (userId) => api.get(`/quiz-history/${userId}`),
  getResult: (quizId) => api.get(`/quiz-result/${quizId}`),
};

// Chat
export const chatAPI = {
  sendMessage: (data) => api.post('/chat', data),
  getHistory: (userId) => api.get(`/chat-history/${userId}`),
  clearHistory: (userId) => api.delete(`/chat-history/${userId}`),
};

// TTS
export const ttsAPI = {
  generate: (data) => api.post('/tts', data),
  getAudio: (audioId) => api.get(`/tts/${audioId}`, { responseType: 'blob' }),
};

// Dashboard
export const dashboardAPI = {
  get: (userId) => api.get(`/dashboard/${userId}`),
  getAnalytics: (userId) => api.get(`/analytics/${userId}`),
  getStats: (userId) => api.get(`/stats/${userId}`),
};

// Roadmap
export const roadmapAPI = {
  get: (userId) => api.get(`/roadmap/${userId}`),
  generate: (data) => api.post('/roadmap/generate', data),
  getRecommendations: (userId) => api.get(`/recommendations/${userId}`),
  analyzeWeaknesses: (userId) => api.get(`/weaknesses/${userId}`),
};

// Study Plan - Lộ trình ôn thi TN THPT
export const studyPlanAPI = {
  // Phân tích điểm yếu từ kết quả thi thử
  analyzeWeakness: (data) => api.post('/study-plan/analyze', data, { timeout: 120000 }),
  // Tạo lộ trình ôn thi chi tiết theo ngày
  generate: (data) => api.post('/study-plan/generate', data, { timeout: 180000 }),
  // Lấy lịch học hôm nay
  getTodaySchedule: () => api.get('/study-plan/today'),
  // Cập nhật tiến độ học tập
  updateProgress: (data) => api.put('/study-plan/progress', data),
  // Điều chỉnh lộ trình dựa trên tiến độ
  adjustPlan: (data) => api.post('/study-plan/adjust', data, { timeout: 120000 }),
  // Xóa lộ trình
  delete: () => api.delete('/study-plan'),
};

export default api;
