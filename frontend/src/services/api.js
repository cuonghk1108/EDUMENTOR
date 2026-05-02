import axios from 'axios';
import { getApiBaseUrl } from '../utils/apiHelpers';

// Create axios instance
// Smart detection: use relative /api when served from same origin (production)
// or localhost:5000/api when running separately (development)
const defaultBaseUrl = getApiBaseUrl();

const api = axios.create({
  baseURL: defaultBaseUrl,
  timeout: 60000, // 60s timeout (mobile-friendly)
  headers: {
    'Content-Type': 'application/json',
  },
  withCredentials: true, // Enable credentials for CORS
  maxContentLength: Infinity,
  maxBodyLength: Infinity,
});

// Request interceptor
api.interceptors.request.use(
  (config) => {
    const token = localStorage.getItem('token');
    if (token) {
      config.headers.Authorization = `Bearer ${token}`;
    }

    if (config.data instanceof FormData) {
      delete config.headers['Content-Type'];
      delete config.headers['content-type'];
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
    timeout: 300000, // 5 minutes for large files
  }),
  uploadMultiple: (formData) => api.post('/upload/multiple', formData, {
    timeout: 300000, // 5 minutes for large files
  }),
  // Process SGK - Upload + OCR + Generate Lesson
  processSGK: (formData, config = {}) => api.post('/process-sgk', formData, {
    timeout: 900000, // 15 phút cho file lớn + OCR + AI processing
    maxContentLength: Infinity,
    maxBodyLength: Infinity,
    ...config,
    onUploadProgress: (progressEvent) => {
      const total = progressEvent.total || progressEvent.loaded || 1;
      const percentCompleted = Math.round((progressEvent.loaded * 100) / total);
      console.log('Upload progress:', percentCompleted + '%');
      config.onUploadProgress?.(progressEvent);
    },
  }),
};

// OCR
export const ocrAPI = {
  processFile: (filePath) => api.post('/ocr', { filePath }),
  processImage: (formData) => api.post('/ocr/image', formData, {
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
  // Customize lesson with custom prompt
  customize: (lessonId, data) => api.post(`/lesson/${lessonId}/customize`, data, { timeout: 120000 }),
  // Custom AI request
  customAI: (data) => api.post('/ai/custom', data, { timeout: 180000 }),
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
  sendMessageWithImage: (formData) => api.post('/chat/image', formData, {
    timeout: 120000,
  }),
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

// Streak - Đếm ngày học liên tiếp
export const streakAPI = {
  // Lấy streak hiện tại
  get: () => api.get('/streak'),
  // Ghi nhận hoạt động học tập
  record: (activityType, minutes = 0) => api.post('/streak/record', { activityType, minutes }),
  // Lấy lịch sử học
  getHistory: (days = 30) => api.get(`/streak/history?days=${days}`),
  // Lấy thống kê tuần
  getWeekly: () => api.get('/streak/weekly'),
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

export const examSimulationAPI = {
  submit: (data) => api.post('/exam-simulations', data),
  getHistory: (limit = 20) => api.get('/exam-simulations', { params: { limit } }),
};

export const parentReportAPI = {
  generate: () => api.post('/parent-report/generate'),
  getByToken: (shareToken) => api.get(`/parent-report/${shareToken}`),
};

export const studyGroupAPI = {
  getAll: (subject) => api.get('/study-groups', { params: { subject } }),
  create: (data) => api.post('/study-groups', data),
  join: (groupId) => api.post(`/study-groups/${groupId}/join`),
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
  
  // Advanced User Management
  blockUser: (userId, isBlocked) => api.post(`/admin/users/${userId}/block`, { isBlocked }),
  resetUserPassword: (userId, newPassword) => api.post(`/admin/users/${userId}/reset-password`, { newPassword }),
  deleteAllUserData: (userId) => api.delete(`/admin/users/${userId}/data`),
  getUserActivityLog: (userId, limit = 50) => api.get(`/admin/users/${userId}/activity?limit=${limit}`),
  changeUserRole: (userId, role) => api.put(`/admin/users/${userId}/role`, { role }),
  
  // Lessons
  getLessons: (params) => api.get('/admin/lessons', { params }),
  deleteLesson: (lessonId) => api.delete(`/admin/lessons/${lessonId}`),
  
  // Quizzes
  getQuizzes: (params) => api.get('/admin/quizzes', { params }),
  deleteQuiz: (quizId) => api.delete(`/admin/quizzes/${quizId}`),
  
  // Chats
  getChats: (params) => api.get('/admin/chats', { params }),
  deleteChat: (chatId) => api.delete(`/admin/chats/${chatId}`),
  deleteUserChats: (userId) => api.delete(`/admin/chats/user/${userId}`),
  
  // Roadmaps
  getRoadmaps: (params) => api.get('/admin/roadmaps', { params }),
  deleteRoadmap: (roadmapId) => api.delete(`/admin/roadmaps/${roadmapId}`),
  
  // Database
  getDatabaseStats: () => api.get('/admin/database/stats'),
  cleanDatabase: (days) => api.post('/admin/database/clean', { days }),
  
  // Settings & Logs
  getSettings: () => api.get('/admin/settings'),
  updateSettings: (settings) => api.put('/admin/settings', settings),
  getLogs: (params) => api.get('/admin/logs', { params }),
  getSubjects: () => api.get('/admin/subjects'),
};

export default api;
