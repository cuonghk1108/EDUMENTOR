import React from 'react';
import { Routes, Route, Navigate } from 'react-router-dom';
import { motion, useReducedMotion } from 'framer-motion';
import { useAuth } from './context/AuthContext';

// Layout
import Layout from './components/Layout';

// Pages
import Landing from './pages/Landing';
import Login from './pages/Login';
import Register from './pages/Register';
import ForgotPassword from './pages/ForgotPassword';
import ResetPassword from './pages/ResetPassword';
import CompleteProfile from './pages/CompleteProfile';
import Dashboard from './pages/Dashboard';
import Upload from './pages/Upload';
import Lessons from './pages/Lessons';
import LessonView from './pages/LessonView';
import Quiz from './pages/Quiz';
import QuizTake from './pages/QuizTake';
import QuizResult from './pages/QuizResult';
import QuizReview from './pages/QuizReview';
import Chat from './pages/Chat';
import Roadmap from './pages/Roadmap';
import StudyPlan from './pages/StudyPlan';
import Career from './pages/Career';
import Profile from './pages/Profile';
import Admin from './pages/Admin';

// Protected Route Component
const ProtectedRoute = ({ children }) => {
  const { user, loading } = useAuth();
  
  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="loading-dots text-primary-600">
          <span></span>
          <span></span>
          <span></span>
        </div>
      </div>
    );
  }
  
  if (!user) {
    return <Navigate to="/login" replace />;
  }
  
  // Check if user needs to complete profile
  const needsProfileCompletion = localStorage.getItem('needsProfileCompletion') === 'true';
  const currentPath = window.location.pathname;
  
  if (needsProfileCompletion && currentPath !== '/complete-profile') {
    return <Navigate to="/complete-profile" replace />;
  }
  
  return children;
};

// Public Route Component (redirect if logged in)
const PublicRoute = ({ children }) => {
  const { user, loading } = useAuth();
  
  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="loading-dots text-primary-600">
          <span></span>
          <span></span>
          <span></span>
        </div>
      </div>
    );
  }
  
  if (user) {
    return <Navigate to="/dashboard" replace />;
  }
  
  return children;
};

const PageTransition = ({ children }) => {
  const shouldReduceMotion = useReducedMotion();

  if (shouldReduceMotion) {
    return children;
  }

  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      transition={{ duration: 0.2, ease: 'easeOut' }}
    >
      {children}
    </motion.div>
  );
};

function App() {
  return (
    <Routes>
      {/* Public routes */}
      <Route path="/" element={<PageTransition><Landing /></PageTransition>} />
      <Route path="/login" element={
        <PublicRoute>
          <PageTransition><Login /></PageTransition>
        </PublicRoute>
      } />
      <Route path="/register" element={
        <PublicRoute>
          <PageTransition><Register /></PageTransition>
        </PublicRoute>
      } />
      <Route path="/forgot-password" element={
        <PublicRoute>
          <PageTransition><ForgotPassword /></PageTransition>
        </PublicRoute>
      } />
      <Route path="/reset-password" element={
        <PublicRoute>
          <PageTransition><ResetPassword /></PageTransition>
        </PublicRoute>
      } />
      <Route path="/complete-profile" element={
        <ProtectedRoute>
          <PageTransition><CompleteProfile /></PageTransition>
        </ProtectedRoute>
      } />
      
      {/* Protected routes */}
      <Route path="/" element={
        <ProtectedRoute>
          <Layout />
        </ProtectedRoute>
      }>
        <Route path="dashboard" element={<Dashboard />} />
        <Route path="upload" element={<Upload />} />
        <Route path="lessons" element={<Lessons />} />
        <Route path="lessons/:lessonId" element={<LessonView />} />
        <Route path="quiz" element={<Quiz />} />
        <Route path="quiz/:quizId" element={<QuizTake />} />
        <Route path="quiz/:quizId/result" element={<QuizResult />} />
        <Route path="quiz/:quizId/review" element={<QuizReview />} />
        <Route path="chat" element={<Chat />} />
        <Route path="roadmap" element={<Roadmap />} />
        <Route path="study-plan" element={<StudyPlan />} />
        <Route path="career" element={<Career />} />
        <Route path="profile" element={<Profile />} />
        <Route path="admin" element={<Admin />} />
      </Route>
      
      {/* 404 */}
      <Route path="*" element={
        <PageTransition>
          <div className="min-h-screen flex items-center justify-center">
            <div className="text-center">
              <h1 className="text-6xl font-bold text-gray-300">404</h1>
              <p className="text-gray-500 mt-4">Trang không tồn tại</p>
              <a href="/" className="btn-primary mt-6 inline-block">
                Về trang chủ
              </a>
            </div>
          </div>
        </PageTransition>
      } />
    </Routes>
  );
}

export default App;
