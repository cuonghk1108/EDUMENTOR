import React from 'react';
import { useParams, Link } from 'react-router-dom';
import { useQuery } from 'react-query';
import { motion } from 'framer-motion';
import { quizAPI } from '../services/api';
import {
  CheckCircleIcon,
  XCircleIcon,
  ArrowLeftIcon,
  TrophyIcon,
  LightBulbIcon,
  SparklesIcon
} from '@heroicons/react/24/outline';

const QuizReview = () => {
  const { quizId } = useParams();

  const { data: quizData, isLoading, error } = useQuery(
    ['quiz-result', quizId],
    () => quizAPI.getResult(quizId).then(res => res.data.quiz),
    { enabled: !!quizId }
  );

  if (isLoading) {
    return (
      <div className="min-h-screen bg-gray-950 flex items-center justify-center">
        <div className="flex flex-col items-center gap-4">
          <div className="w-16 h-16 border-4 border-purple-500/30 border-t-purple-500 rounded-full animate-spin"></div>
          <p className="text-gray-400">Đang tải kết quả...</p>
        </div>
      </div>
    );
  }

  if (error || !quizData) {
    return (
      <div className="min-h-screen bg-gray-950 flex items-center justify-center">
        <div className="text-center p-8 bg-gray-900/50 backdrop-blur-xl rounded-2xl border border-white/10 max-w-md">
          <div className="w-16 h-16 bg-red-500/20 rounded-full flex items-center justify-center mx-auto mb-4">
            <XCircleIcon className="w-8 h-8 text-red-400" />
          </div>
          <p className="text-gray-400 mb-6">Không tìm thấy kết quả quiz</p>
          <Link 
            to="/quiz" 
            className="inline-flex items-center gap-2 px-6 py-3 bg-gradient-to-r from-purple-500 to-pink-500 text-white rounded-xl font-medium hover:shadow-lg hover:shadow-purple-500/25 transition-all"
          >
            Về danh sách quiz
          </Link>
        </div>
      </div>
    );
  }

  const { topic, questions, result, submittedAt } = quizData;
  const { score, correctAnswers, totalQuestions, results } = result;

  // Determine performance
  const getPerformance = () => {
    if (score >= 90) return { 
      text: 'Xuất sắc!', 
      emoji: '🏆', 
      gradient: 'from-yellow-500/20 to-orange-500/20',
      border: 'border-yellow-500/30',
      textColor: 'text-yellow-300'
    };
    if (score >= 70) return { 
      text: 'Tốt lắm!', 
      emoji: '👍', 
      gradient: 'from-green-500/20 to-emerald-500/20',
      border: 'border-green-500/30',
      textColor: 'text-green-300'
    };
    if (score >= 50) return { 
      text: 'Khá tốt!', 
      emoji: '💪', 
      gradient: 'from-blue-500/20 to-cyan-500/20',
      border: 'border-blue-500/30',
      textColor: 'text-blue-300'
    };
    return { 
      text: 'Cần cố gắng hơn!', 
      emoji: '📚', 
      gradient: 'from-orange-500/20 to-red-500/20',
      border: 'border-orange-500/30',
      textColor: 'text-orange-300'
    };
  };

  const performance = getPerformance();

  return (
    <div className="min-h-screen bg-gray-950 relative overflow-hidden">
      {/* Animated Background */}
      <div className="absolute inset-0 overflow-hidden pointer-events-none">
        <div className="absolute top-1/4 -left-20 w-96 h-96 bg-purple-500/10 rounded-full blur-3xl animate-pulse"></div>
        <div className="absolute bottom-1/4 -right-20 w-96 h-96 bg-pink-500/10 rounded-full blur-3xl animate-pulse" style={{ animationDelay: '1s' }}></div>
        <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[800px] h-[800px] bg-cyan-500/5 rounded-full blur-3xl"></div>
      </div>

      <div className="relative z-10 max-w-4xl mx-auto px-4 py-8">
        {/* Header */}
        <motion.div 
          initial={{ opacity: 0, y: -20 }}
          animate={{ opacity: 1, y: 0 }}
          className="mb-8"
        >
          <Link 
            to="/quiz" 
            className="inline-flex items-center gap-2 text-gray-400 hover:text-white transition-colors group"
          >
            <ArrowLeftIcon className="w-5 h-5 group-hover:-translate-x-1 transition-transform" />
            Quay lại danh sách Quiz
          </Link>
        </motion.div>

        {/* Result Summary */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.1 }}
          className={`relative p-8 rounded-2xl bg-gradient-to-br ${performance.gradient} backdrop-blur-xl border ${performance.border} mb-8 overflow-hidden`}
        >
          {/* Decorative sparkles */}
          <div className="absolute top-4 right-4 text-4xl opacity-30">{performance.emoji}</div>
          <div className="absolute bottom-4 left-4 text-2xl opacity-20">{performance.emoji}</div>
          
          <div className="relative z-10 flex flex-col md:flex-row items-center justify-between gap-6">
            <div className="flex items-center gap-4">
              <div className="text-6xl">{performance.emoji}</div>
              <div>
                <h1 className="text-2xl md:text-3xl font-bold text-white mb-1">{topic}</h1>
                <p className={`text-xl font-semibold ${performance.textColor}`}>{performance.text}</p>
                <p className="text-sm text-gray-400 mt-2">
                  📅 Làm ngày {new Date(submittedAt?.seconds * 1000 || submittedAt).toLocaleDateString('vi-VN')}
                </p>
              </div>
            </div>

            <div className="flex items-center gap-8">
              <div className="text-center">
                <div className="text-5xl font-bold bg-gradient-to-r from-purple-400 to-pink-400 bg-clip-text text-transparent">
                  {score}%
                </div>
                <p className="text-sm text-gray-400 mt-1">Điểm số</p>
              </div>
              <div className="w-px h-16 bg-white/10"></div>
              <div className="text-center">
                <div className="text-5xl font-bold text-green-400">{correctAnswers}</div>
                <p className="text-sm text-gray-400 mt-1">/{totalQuestions} câu đúng</p>
              </div>
            </div>
          </div>
        </motion.div>

        {/* Questions Review */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.2 }}
          className="space-y-6"
        >
          <h2 className="text-xl font-semibold text-white flex items-center gap-3">
            <div className="w-10 h-10 bg-gradient-to-br from-yellow-500 to-orange-500 rounded-xl flex items-center justify-center shadow-lg shadow-yellow-500/20">
              <LightBulbIcon className="w-5 h-5 text-white" />
            </div>
            Chi tiết bài làm
          </h2>

          {questions.map((question, index) => {
            const userResult = results.find(r => r.questionId === question.id) || results[index];
            const isCorrect = userResult?.isCorrect;

            return (
              <motion.div
                key={question.id}
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.1 + index * 0.05 }}
                className={`relative p-6 rounded-2xl bg-gray-900/50 backdrop-blur-xl border-l-4 border ${
                  isCorrect 
                    ? 'border-l-green-500 border-green-500/20' 
                    : 'border-l-red-500 border-red-500/20'
                }`}
              >
                {/* Question Header */}
                <div className="flex items-start justify-between mb-4">
                  <div className="flex items-center gap-3">
                    <span className={`w-10 h-10 rounded-xl flex items-center justify-center text-white text-sm font-bold shadow-lg ${
                      isCorrect 
                        ? 'bg-gradient-to-br from-green-500 to-emerald-500 shadow-green-500/25' 
                        : 'bg-gradient-to-br from-red-500 to-rose-500 shadow-red-500/25'
                    }`}>
                      {index + 1}
                    </span>
                    <span className={`px-3 py-1.5 rounded-lg text-xs font-medium border ${
                      question.difficulty === 'easy' 
                        ? 'bg-green-500/20 text-green-300 border-green-500/30' 
                        : question.difficulty === 'medium' 
                        ? 'bg-yellow-500/20 text-yellow-300 border-yellow-500/30' 
                        : 'bg-red-500/20 text-red-300 border-red-500/30'
                    }`}>
                      {question.difficulty === 'easy' ? '🟢 Dễ' : 
                       question.difficulty === 'medium' ? '🟡 Trung bình' : '🔴 Khó'}
                    </span>
                  </div>
                  {isCorrect ? (
                    <div className="flex items-center gap-2 text-green-400">
                      <CheckCircleIcon className="w-6 h-6" />
                      <span className="text-sm font-medium">Đúng</span>
                    </div>
                  ) : (
                    <div className="flex items-center gap-2 text-red-400">
                      <XCircleIcon className="w-6 h-6" />
                      <span className="text-sm font-medium">Sai</span>
                    </div>
                  )}
                </div>

                {/* Question Text */}
                <p className="text-white font-medium mb-5 text-lg">{question.question}</p>

                {/* Options */}
                <div className="space-y-3 mb-5">
                  {['A', 'B', 'C', 'D'].map((option) => {
                    const isUserAnswer = userResult?.userAnswer === option;
                    const isCorrectAnswer = question.answer === option;

                    let optionClass = 'bg-white/5 border-white/10 text-gray-300';
                    let badgeClass = 'bg-white/10 text-gray-400';
                    
                    if (isCorrectAnswer) {
                      optionClass = 'bg-green-500/20 border-green-500/40 text-green-200';
                      badgeClass = 'bg-gradient-to-br from-green-500 to-emerald-500 text-white';
                    } else if (isUserAnswer && !isCorrect) {
                      optionClass = 'bg-red-500/20 border-red-500/40 text-red-200';
                      badgeClass = 'bg-gradient-to-br from-red-500 to-rose-500 text-white';
                    }

                    return (
                      <div
                        key={option}
                        className={`p-4 rounded-xl border flex items-center gap-4 transition-all ${optionClass}`}
                      >
                        <span className={`w-8 h-8 rounded-lg flex items-center justify-center text-sm font-bold ${badgeClass}`}>
                          {option}
                        </span>
                        <span className="flex-1">{question[option]}</span>
                        {isCorrectAnswer && (
                          <CheckCircleIcon className="w-6 h-6 text-green-400 flex-shrink-0" />
                        )}
                        {isUserAnswer && !isCorrect && (
                          <XCircleIcon className="w-6 h-6 text-red-400 flex-shrink-0" />
                        )}
                      </div>
                    );
                  })}
                </div>

                {/* Explanation */}
                {question.explanation && (
                  <div className="p-4 bg-blue-500/10 border border-blue-500/20 rounded-xl">
                    <p className="text-sm font-medium text-blue-300 mb-2 flex items-center gap-2">
                      <SparklesIcon className="w-5 h-5" />
                      Giải thích:
                    </p>
                    <p className="text-gray-300 text-sm leading-relaxed">{question.explanation}</p>
                  </div>
                )}
              </motion.div>
            );
          })}
        </motion.div>

        {/* Actions */}
        <motion.div 
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.4 }}
          className="flex flex-col sm:flex-row gap-4 mt-10"
        >
          <Link 
            to="/quiz" 
            className="flex-1 flex items-center justify-center gap-2 px-6 py-4 bg-white/10 text-white rounded-xl font-medium border border-white/10 hover:bg-white/20 transition-all"
          >
            <ArrowLeftIcon className="w-5 h-5" />
            Về danh sách quiz
          </Link>
          <Link 
            to="/lessons" 
            className="flex-1 flex items-center justify-center gap-2 px-6 py-4 bg-gradient-to-r from-purple-500 to-pink-500 text-white rounded-xl font-medium hover:shadow-lg hover:shadow-purple-500/25 transition-all"
          >
            <TrophyIcon className="w-5 h-5" />
            Học bài khác
          </Link>
        </motion.div>
      </div>
    </div>
  );
};

export default QuizReview;
