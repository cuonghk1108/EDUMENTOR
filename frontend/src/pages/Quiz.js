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
  TrophyIcon,
  ChartBarIcon,
  SparklesIcon,
  BoltIcon
} from '@heroicons/react/24/outline';

const Quiz = () => {
  const { user } = useAuth();
  const [activeTab, setActiveTab] = useState('available');

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
  const availableQuizzes = quizzes.filter(q => !q.result);

  if (isLoading) {
    return (
      <div className="flex flex-col items-center justify-center h-[60vh] gap-4">
        <motion.div
          animate={{ rotate: 360 }}
          transition={{ duration: 2, repeat: Infinity, ease: "linear" }}
          className="w-16 h-16 border-4 border-purple-500/20 border-t-purple-500 rounded-full"
        />
        <p className="text-gray-400">Đang tải quiz...</p>
      </div>
    );
  }

  return (
    <div className="p-6 space-y-8">
      {/* Header */}
      <div>
        <h1 className="text-3xl font-display font-bold text-white flex items-center gap-3">
          <div className="w-10 h-10 bg-gradient-to-br from-purple-500 to-pink-500 rounded-xl flex items-center justify-center">
            <QuestionMarkCircleIcon className="w-6 h-6 text-white" />
          </div>
          Quiz & Kiểm tra
        </h1>
        <p className="text-gray-400 mt-2">Làm quiz để củng cố kiến thức</p>
      </div>

      {/* Stats Cards */}
      {history && (
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            className="relative bg-gray-900/50 border border-white/5 rounded-2xl p-6 overflow-hidden group hover:border-white/20 transition-all"
          >
            <div className="absolute inset-0 bg-gradient-to-r from-purple-500/10 to-pink-500/10 opacity-0 group-hover:opacity-100 transition-opacity" />
            <div className="relative flex items-center justify-between">
              <div>
                <p className="text-sm text-gray-400">Tổng quiz đã làm</p>
                <p className="text-3xl font-bold text-white mt-1">{history.totalQuizzes}</p>
              </div>
              <div className="w-14 h-14 bg-gradient-to-br from-purple-500 to-pink-500 rounded-xl flex items-center justify-center shadow-lg shadow-purple-500/25">
                <SparklesIcon className="w-7 h-7 text-white" />
              </div>
            </div>
          </motion.div>

          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.1 }}
            className="relative bg-gray-900/50 border border-white/5 rounded-2xl p-6 overflow-hidden group hover:border-white/20 transition-all"
          >
            <div className="absolute inset-0 bg-gradient-to-r from-green-500/10 to-emerald-500/10 opacity-0 group-hover:opacity-100 transition-opacity" />
            <div className="relative flex items-center justify-between">
              <div>
                <p className="text-sm text-gray-400">Điểm trung bình</p>
                <p className="text-3xl font-bold text-white mt-1">{history.averageScore}%</p>
              </div>
              <div className="w-14 h-14 bg-gradient-to-br from-green-500 to-emerald-500 rounded-xl flex items-center justify-center shadow-lg shadow-green-500/25">
                <ChartBarIcon className="w-7 h-7 text-white" />
              </div>
            </div>
          </motion.div>

          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.2 }}
            className="relative bg-gray-900/50 border border-white/5 rounded-2xl p-6 overflow-hidden group hover:border-white/20 transition-all"
          >
            <div className="absolute inset-0 bg-gradient-to-r from-cyan-500/10 to-blue-500/10 opacity-0 group-hover:opacity-100 transition-opacity" />
            <div className="relative flex items-center justify-between">
              <div>
                <p className="text-sm text-gray-400">Tổng câu đúng</p>
                <p className="text-3xl font-bold text-white mt-1">
                  {history.totalCorrect}<span className="text-gray-500 text-lg">/{history.totalQuestions}</span>
                </p>
              </div>
              <div className="w-14 h-14 bg-gradient-to-br from-cyan-500 to-blue-500 rounded-xl flex items-center justify-center shadow-lg shadow-cyan-500/25">
                <CheckCircleIcon className="w-7 h-7 text-white" />
              </div>
            </div>
          </motion.div>
        </div>
      )}

      {/* Tabs */}
      <div className="flex gap-2 p-1 bg-white/5 rounded-xl w-fit">
        <button
          onClick={() => setActiveTab('available')}
          className={`px-6 py-2.5 rounded-lg font-medium transition-all ${
            activeTab === 'available'
              ? 'bg-gradient-to-r from-purple-500 to-pink-500 text-white shadow-lg shadow-purple-500/25'
              : 'text-gray-400 hover:text-white'
          }`}
        >
          Chưa làm ({availableQuizzes.length})
        </button>
        <button
          onClick={() => setActiveTab('completed')}
          className={`px-6 py-2.5 rounded-lg font-medium transition-all ${
            activeTab === 'completed'
              ? 'bg-gradient-to-r from-purple-500 to-pink-500 text-white shadow-lg shadow-purple-500/25'
              : 'text-gray-400 hover:text-white'
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
                  className="group block h-full"
                >
                  <div className="h-full bg-gray-900/50 border border-white/5 rounded-2xl p-6 hover:border-purple-500/50 hover:bg-gray-900/80 transition-all duration-300">
                    <div className="flex items-start justify-between mb-4">
                      <div className="w-12 h-12 bg-gradient-to-br from-purple-500/20 to-pink-500/20 rounded-xl flex items-center justify-center">
                        <QuestionMarkCircleIcon className="w-6 h-6 text-purple-400" />
                      </div>
                      <span className="px-3 py-1 bg-purple-500/20 text-purple-400 text-xs font-medium rounded-full">
                        {quiz.totalQuestions} câu
                      </span>
                    </div>

                    <h3 className="text-lg font-semibold text-white mb-2 group-hover:text-purple-400 transition-colors">
                      {quiz.topic}
                    </h3>

                    <div className="flex items-center text-sm text-gray-500 gap-4 mb-4">
                      <span className="flex items-center gap-1">
                        <ClockIcon className="w-4 h-4" />
                        {new Date(quiz.createdAt?.seconds * 1000 || quiz.createdAt).toLocaleDateString('vi-VN')}
                      </span>
                    </div>

                    <button className="w-full py-3 bg-gradient-to-r from-purple-500 to-pink-500 rounded-xl font-medium text-white flex items-center justify-center gap-2 hover:shadow-lg hover:shadow-purple-500/25 transition-all">
                      <PlayIcon className="w-5 h-5" />
                      Làm quiz
                    </button>
                  </div>
                </Link>
              </motion.div>
            ))}
          </div>
        ) : (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            className="text-center py-16"
          >
            <div className="w-20 h-20 bg-white/5 rounded-full flex items-center justify-center mx-auto mb-4">
              <QuestionMarkCircleIcon className="w-10 h-10 text-gray-500" />
            </div>
            <h3 className="text-xl font-semibold text-white mb-2">Chưa có quiz nào</h3>
            <p className="text-gray-400 mb-6">Tạo quiz từ bài học để bắt đầu ôn tập</p>
            <Link
              to="/lessons"
              className="inline-flex items-center gap-2 px-6 py-3 bg-gradient-to-r from-purple-500 to-pink-500 rounded-xl font-semibold text-white hover:shadow-lg hover:shadow-purple-500/25 transition-all"
            >
              <BoltIcon className="w-5 h-5" />
              Đến danh sách bài học
            </Link>
          </motion.div>
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
                  className="group block h-full"
                >
                  <div className="h-full bg-gray-900/50 border border-white/5 rounded-2xl p-6 hover:border-white/20 hover:bg-gray-900/80 transition-all duration-300">
                    <div className="flex items-start justify-between mb-4">
                      <div className={`w-12 h-12 rounded-xl flex items-center justify-center ${
                        quiz.result?.score >= 70 
                          ? 'bg-gradient-to-br from-green-500/20 to-emerald-500/20' 
                          : 'bg-gradient-to-br from-orange-500/20 to-amber-500/20'
                      }`}>
                        <TrophyIcon className={`w-6 h-6 ${
                          quiz.result?.score >= 70 ? 'text-green-400' : 'text-orange-400'
                        }`} />
                      </div>
                      <span className={`px-3 py-1 rounded-full text-sm font-bold ${
                        quiz.result?.score >= 70 
                          ? 'bg-green-500/20 text-green-400' 
                          : 'bg-orange-500/20 text-orange-400'
                      }`}>
                        {quiz.result?.score}%
                      </span>
                    </div>

                    <h3 className="text-lg font-semibold text-white mb-2 group-hover:text-primary-400 transition-colors">
                      {quiz.topic}
                    </h3>

                    <div className="flex items-center text-sm text-gray-500 gap-4 mb-2">
                      <span className="flex items-center gap-1">
                        <CheckCircleIcon className="w-4 h-4 text-green-400" />
                        {quiz.result?.correctAnswers}/{quiz.result?.totalQuestions} câu đúng
                      </span>
                    </div>

                    <div className="flex items-center text-sm text-gray-500 mb-4">
                      <ClockIcon className="w-4 h-4 mr-1" />
                      {new Date(quiz.submittedAt?.seconds * 1000 || quiz.submittedAt).toLocaleDateString('vi-VN')}
                    </div>

                    <button className="w-full py-3 bg-white/5 border border-white/10 rounded-xl font-medium text-white flex items-center justify-center gap-2 hover:bg-white/10 transition-all">
                      <EyeIcon className="w-5 h-5" />
                      Xem lại bài làm
                    </button>
                  </div>
                </Link>
              </motion.div>
            ))}
          </div>
        ) : (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            className="text-center py-16"
          >
            <div className="w-20 h-20 bg-white/5 rounded-full flex items-center justify-center mx-auto mb-4">
              <TrophyIcon className="w-10 h-10 text-gray-500" />
            </div>
            <h3 className="text-xl font-semibold text-white mb-2">Chưa làm quiz nào</h3>
            <p className="text-gray-400">Hoàn thành quiz để xem lại kết quả tại đây</p>
          </motion.div>
        )
      )}
    </div>
  );
};

export default Quiz;
