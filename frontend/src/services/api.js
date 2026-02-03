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
  generate: (data) => api.post('/lesson', data, { timeout: 120000 }),
  // Tạo bài giảng LaTeX format
  generateLatex: (data) => api.post('/lesson/latex', data, { timeout: 120000 }),
  // Tạo bài giảng JSON structured format
  generateJson: (data) => api.post('/lesson/json', data, { timeout: 120000 }),
  // Tạo bài giảng đầy đủ (LaTeX + JSON)
  generateComplete: (data) => api.post('/lesson/complete', data, { timeout: 180000 }),
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

// TTS - Text-to-Speech using Murf.ai
export const ttsAPI = {
  // Get available Vietnamese voices
  getVoices: () => api.get('/tts/voices'),
  // Check API status
  checkStatus: () => api.get('/tts/status'),
  // Generate audio from text
  generate: (data) => api.post('/tts', data, { timeout: 60000 }),
  // Stream audio (real-time)
  stream: (data) => api.post('/tts/stream', data, { responseType: 'arraybuffer' }),
  // Quick read aloud (returns audio directly)
  readAloud: (text) => api.post('/tts/read-aloud', { text }, { 
    responseType: 'blob',
    timeout: 60000 
  }),
  // Convert lesson to speech
  convertLesson: (data) => api.post('/tts/lesson', data, { timeout: 180000 }),
  // Get audio file by ID
  getAudio: (audioId) => api.get(`/tts/${audioId}`, { responseType: 'blob' }),
  // Get audio URL
  getAudioUrl: (audioId) => `${api.defaults.baseURL}/tts/${audioId}`,
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

// Career - Hướng nghiệp
export const careerAPI = {
  // Lấy danh sách khối thi
  getKhoiThi: () => api.get('/career/khoi-thi'),
  // Lấy điểm chuẩn các trường (có filter)
  getDiemChuan: (params) => api.get('/career/diem-chuan', { params }),
  // Lấy thông tin ngành nghề
  getNganhNghe: (params) => api.get('/career/nganh-nghe', { params }),
  // Lấy xu hướng thị trường
  getXuHuong: () => api.get('/career/xu-huong'),
  // Lấy bài test Holland
  getHollandTest: () => api.get('/career/holland-test'),
  // Phân tích kết quả test Holland
  analyzeHolland: (data) => api.post('/career/holland-result', data),
  // Tư vấn hướng nghiệp bằng AI
  getAdvice: (data) => api.post('/career/advice', data, { timeout: 120000 }),
  // Tìm trường phù hợp theo điểm
  findSchools: (params) => api.get('/career/find-schools', { params }),
};

// ============================================
// USER DATA MANAGEMENT APIs
// ============================================

// User Settings - Cài đặt người dùng
export const settingsAPI = {
  get: () => api.get('/settings'),
  update: (data) => api.put('/settings', data),
};

// Bookmarks - Đánh dấu bài học/quiz
export const bookmarkAPI = {
  getAll: () => api.get('/bookmarks'),
  add: (data) => api.post('/bookmarks', data),
  remove: (bookmarkId) => api.delete(`/bookmarks/${bookmarkId}`),
};

// Notes - Ghi chú
export const notesAPI = {
  getAll: () => api.get('/notes'),
  getByLesson: (lessonId) => api.get(`/notes/lesson/${lessonId}`),
  create: (data) => api.post('/notes', data),
  update: (noteId, content) => api.put(`/notes/${noteId}`, { content }),
  delete: (noteId) => api.delete(`/notes/${noteId}`),
};

// Study Sessions - Phiên học tập
export const studySessionAPI = {
  start: (data) => api.post('/study-session/start', data),
  end: (sessionId, data) => api.post(`/study-session/${sessionId}/end`, data),
  getAll: () => api.get('/study-sessions'),
  getToday: () => api.get('/study-sessions/today'),
  getWeekly: () => api.get('/study-sessions/weekly'),
};

// Audio History - Lịch sử nghe audio
export const audioHistoryAPI = {
  log: (data) => api.post('/audio-history', data),
  get: () => api.get('/audio-history'),
};

// Activity Log - Nhật ký hoạt động
export const activityAPI = {
  getRecent: (days = 7) => api.get(`/activity?days=${days}`),
  log: (data) => api.post('/activity', data),
};

// ============================================
// ADMIN APIs
// ============================================

export const adminAPI = {
  // Dashboard
  getDashboardStats: () => api.get('/admin/dashboard'),
  getActivityTimeline: (days = 7) => api.get(`/admin/activity-timeline?days=${days}`),
  
  // Users
  getUsers: (params) => api.get('/admin/users', { params }),
  getUserDetails: (userId) => api.get(`/admin/users/${userId}`),
  updateUser: (userId, data) => api.put(`/admin/users/${userId}`, data),
  deleteUser: (userId) => api.delete(`/admin/users/${userId}`),
  
  // Lessons
  getLessons: (params) => api.get('/admin/lessons', { params }),
  deleteLesson: (lessonId) => api.delete(`/admin/lessons/${lessonId}`),
  
  // Quizzes
  getQuizzes: (params) => api.get('/admin/quizzes', { params }),
  deleteQuiz: (quizId) => api.delete(`/admin/quizzes/${quizId}`),
  
  // Settings & Logs
  getSettings: () => api.get('/admin/settings'),
  getLogs: (params) => api.get('/admin/logs', { params }),
  getSubjects: () => api.get('/admin/subjects'),
};

export default api;
