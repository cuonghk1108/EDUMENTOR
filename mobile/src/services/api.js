/**
 * EduMentor AI - API Service
 * Connect to backend API
 */

import axios from 'axios';
import AsyncStorage from '@react-native-async-storage/async-storage';

// API Configuration
const API_BASE_URL = __DEV__ 
  ? 'http://localhost:5000/api'
  : 'https://api.edumentor.io.vn/api';

// Create axios instance
const api = axios.create({
  baseURL: API_BASE_URL,
  timeout: 30000,
  headers: {
    'Content-Type': 'application/json',
  },
});

// Request interceptor - add auth token
api.interceptors.request.use(
  async (config) => {
    const token = await AsyncStorage.getItem('authToken');
    if (token) {
      config.headers.Authorization = `Bearer ${token}`;
    }
    return config;
  },
  (error) => {
    return Promise.reject(error);
  }
);

// Response interceptor - handle errors
api.interceptors.response.use(
  (response) => response,
  async (error) => {
    if (error.response?.status === 401) {
      // Token expired - clear and redirect to login
      await AsyncStorage.removeItem('authToken');
      // Navigation will be handled by auth context
    }
    return Promise.reject(error);
  }
);

// Auth APIs
export const authAPI = {
  login: (email, password) => 
    api.post('/auth/login', { email, password }),
  
  register: (data) => 
    api.post('/auth/register', data),
  
  logout: () => 
    api.post('/auth/logout'),
  
  getProfile: () => 
    api.get('/auth/profile'),
  
  updateProfile: (data) => 
    api.put('/auth/profile', data),
};

// Lessons APIs
export const lessonsAPI = {
  getAll: (params) => 
    api.get('/lessons', { params }),
  
  getById: (id) => 
    api.get(`/lessons/${id}`),
  
  create: (data) => 
    api.post('/lessons', data),
  
  update: (id, data) => 
    api.put(`/lessons/${id}`, data),
  
  delete: (id) => 
    api.delete(`/lessons/${id}`),
};

// Quiz APIs
export const quizAPI = {
  getAll: (params) => 
    api.get('/quiz', { params }),
  
  getById: (id) => 
    api.get(`/quiz/${id}`),
  
  generate: (lessonId) => 
    api.post('/quiz/generate', { lessonId }),
  
  submit: (quizId, answers) => 
    api.post(`/quiz/${quizId}/submit`, { answers }),
  
  getResults: (quizId) => 
    api.get(`/quiz/${quizId}/results`),
};

// Upload APIs
export const uploadAPI = {
  uploadDocument: (formData, onProgress) => 
    api.post('/upload', formData, {
      headers: { 'Content-Type': 'multipart/form-data' },
      onUploadProgress: (progressEvent) => {
        const progress = Math.round((progressEvent.loaded * 100) / progressEvent.total);
        onProgress?.(progress);
      },
    }),
  
  getUploads: () => 
    api.get('/upload/list'),
};

// Chat APIs  
export const chatAPI = {
  sendMessage: (message, lessonId = null) => 
    api.post('/chat', { message, lessonId }),
  
  getHistory: (lessonId = null) => 
    api.get('/chat/history', { params: { lessonId } }),
};

// Dashboard APIs
export const dashboardAPI = {
  getStats: () => 
    api.get('/dashboard/stats'),
  
  getProgress: (period = 'week') => 
    api.get('/dashboard/progress', { params: { period } }),
  
  getWeakPoints: () => 
    api.get('/dashboard/weak-points'),
};

// TTS APIs
export const ttsAPI = {
  generateAudio: (text, lessonId) => 
    api.post('/tts/generate', { text, lessonId }),
  
  getAudioUrl: (lessonId) => 
    `${API_BASE_URL}/tts/audio/${lessonId}`,
};

export default api;
