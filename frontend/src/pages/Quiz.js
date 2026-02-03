import React, { useState } from 'react';
import { Link } from 'react-router-dom';
import { useQuery } from 'react-query';
import { motion } from 'framer-motion';
import { useAuth } from '../context/AuthContext';
import { quizAPI } from '../services/api';
import {
  QuestionMarkCircleIcon,
  ClockIcon,
  CheckCircleIcon,
  PlayIcon,
  EyeIcon,
  TrophyIcon
} from '@heroicons/react/24/outline';

const Quiz = () => {
  const { user } = useAuth();
  const [activeTab, setActiveTab] = useState('available'); // 'available' | 'completed'

  const { data: quizzes = [], isLoading } = useQuery(
    ['quizzes', user?.id],
    () => quizAPI.getAll(user.id).then(res => res.data.quizzes),
    { enabled: !!user?.id }
  );

  const { data: historyData } = useQuery(
    ['quiz-history', user?.id],
    () => quizAPI.getHistory(user.id).then(res => res.data),
    { enabled: !!user?.id }
  );

  const history = historyData?.stats;
  const completedQuizzes = historyData?.quizzes || [];

  // Filter quizzes
  const availableQuizzes = quizzes.filter(q => !q.result);

  if (isLoading) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="loading-dots text-primary-600">
          <span></span>
          <span></span>
          <span></span>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-8">
      {/* Header */}
      <div>
        <h1 className="text-3xl font-display font-bold text-gray-900">Quiz & Kiểm tra</h1>
        <p className="text-gray-600 mt-1">Làm quiz để củng cố kiến thức</p>
      </div>

      {/* Stats */}
      {history && (
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            className="card"
          >
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-gray-500">Tổng quiz đã làm</p>
                <p className="text-3xl font-bold text-gray-900 mt-1">{history.totalQuizzes}</p>
              </div>
              <div className="w-12 h-12 bg-primary-100 rounded-xl flex items-center justify-center">
                <QuestionMarkCircleIcon className="w-6 h-6 text-primary-600" />
              </div>
            </div>
          </motion.div>

          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.1 }}
            className="card"
          >
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-gray-500">Điểm trung bình</p>
                <p className="text-3xl font-bold text-gray-900 mt-1">{history.averageScore}%</p>
              </div>
              <div className="w-12 h-12 bg-green-100 rounded-xl flex items-center justify-center">
                <CheckCircleIcon className="w-6 h-6 text-green-600" />
              </div>
            </div>
          </motion.div>

          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.2 }}
            className="card"
          >
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-gray-500">Tổng câu đúng</p>
                <p className="text-3xl font-bold text-gray-900 mt-1">
                  {history.totalCorrect}/{history.totalQuestions}
                </p>
              </div>
              <div className="w-12 h-12 bg-secondary-100 rounded-xl flex items-center justify-center">
                <CheckCircleIcon className="w-6 h-6 text-secondary-600" />
              </div>
            </div>
          </motion.div>
        </div>
      )}

      {/* Quiz List */}
      {/* Tabs */}
      <div className="flex gap-4 border-b border-gray-200">
        <button
          onClick={() => setActiveTab('available')}
          className={`pb-4 px-2 font-medium transition-colors ${
            activeTab === 'available'
              ? 'text-primary-600 border-b-2 border-primary-600'
              : 'text-gray-500 hover:text-gray-700'
          }`}
        >
          Quiz chưa làm ({availableQuizzes.length})
        </button>
        <button
          onClick={() => setActiveTab('completed')}
          className={`pb-4 px-2 font-medium transition-colors ${
            activeTab === 'completed'
              ? 'text-primary-600 border-b-2 border-primary-600'
              : 'text-gray-500 hover:text-gray-700'
          }`}
        >
          Đã làm ({completedQuizzes.length})
        </button>
      </div>

      {/* Available Quizzes */}
      {activeTab === 'available' && (
        availableQuizzes.length > 0 ? (
          <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
            {availableQuizzes.map((quiz, index) => (
              <motion.div
                key={quiz.id}
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: index * 0.05 }}
              >
                <Link
                  to={`/quiz/${quiz.id}`}
                  className="card-hover block"
                >
                  <div className="flex items-start justify-between mb-4">
                    <div className="w-12 h-12 bg-secondary-100 rounded-xl flex items-center justify-center">
                      <QuestionMarkCircleIcon className="w-6 h-6 text-secondary-600" />
                    </div>
                    <span className="badge-primary">{quiz.totalQuestions} câu</span>
                  </div>

                  <h3 className="text-lg font-semibold text-gray-900 mb-2">
                    {quiz.topic}
                  </h3>

                  <div className="flex items-center text-sm text-gray-500 gap-4">
                    <span className="flex items-center gap-1">
                      <ClockIcon className="w-4 h-4" />
                      {new Date(quiz.createdAt?.seconds * 1000 || quiz.createdAt).toLocaleDateString('vi-VN')}
                    </span>
                  </div>

                  <button className="btn-primary w-full mt-4">
                    <PlayIcon className="w-4 h-4 mr-2" />
                    Làm quiz
                  </button>
                </Link>
              </motion.div>
            ))}
          </div>
        ) : (
          <div className="card text-center py-16">
            <QuestionMarkCircleIcon className="w-16 h-16 text-gray-300 mx-auto mb-4" />
            <h3 className="text-lg font-medium text-gray-900 mb-2">Chưa có quiz nào</h3>
            <p className="text-gray-500 mb-6">
              Tạo quiz từ bài học để bắt đầu ôn tập
            </p>
            <Link to="/lessons" className="btn-primary">
              Đến danh sách bài học
            </Link>
          </div>
        )
      )}

      {/* Completed Quizzes */}
      {activeTab === 'completed' && (
        completedQuizzes.length > 0 ? (
          <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
            {completedQuizzes.map((quiz, index) => (
              <motion.div
                key={quiz.id}
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: index * 0.05 }}
              >
                <Link
                  to={`/quiz/${quiz.id}/review`}
                  className="card-hover block"
                >
                  <div className="flex items-start justify-between mb-4">
                    <div className={`w-12 h-12 rounded-xl flex items-center justify-center ${
                      quiz.result?.score >= 70 ? 'bg-green-100' : 'bg-orange-100'
                    }`}>
                      <TrophyIcon className={`w-6 h-6 ${
                        quiz.result?.score >= 70 ? 'text-green-600' : 'text-orange-600'
                      }`} />
                    </div>
                    <span className={`px-3 py-1 rounded-full text-sm font-medium ${
                      quiz.result?.score >= 70 
                        ? 'bg-green-100 text-green-700' 
                        : 'bg-orange-100 text-orange-700'
                    }`}>
                      {quiz.result?.score}%
                    </span>
                  </div>

                  <h3 className="text-lg font-semibold text-gray-900 mb-2">
                    {quiz.topic}
                  </h3>

                  <div className="flex items-center text-sm text-gray-500 gap-4 mb-2">
                    <span className="flex items-center gap-1">
                      <CheckCircleIcon className="w-4 h-4 text-green-500" />
                      {quiz.result?.correctAnswers}/{quiz.result?.totalQuestions} câu đúng
                    </span>
                  </div>

                  <div className="flex items-center text-sm text-gray-500">
                    <ClockIcon className="w-4 h-4 mr-1" />
                    {new Date(quiz.submittedAt?.seconds * 1000 || quiz.submittedAt).toLocaleDateString('vi-VN')}
                  </div>

                  <button className="btn-secondary w-full mt-4">
                    <EyeIcon className="w-4 h-4 mr-2" />
                    Xem lại bài làm
                  </button>
                </Link>
              </motion.div>
            ))}
          </div>
        ) : (
          <div className="card text-center py-16">
            <TrophyIcon className="w-16 h-16 text-gray-300 mx-auto mb-4" />
            <h3 className="text-lg font-medium text-gray-900 mb-2">Chưa có bài quiz nào đã làm</h3>
            <p className="text-gray-500 mb-6">
              Hoàn thành quiz để xem lại kết quả tại đây
            </p>
          </div>
        )
      )}
    </div>
  );
};

export default Quiz;
