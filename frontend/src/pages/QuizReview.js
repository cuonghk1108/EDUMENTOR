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
  LightBulbIcon
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
      <div className="flex items-center justify-center h-64">
        <div className="loading-dots text-primary-600">
          <span></span>
          <span></span>
          <span></span>
        </div>
      </div>
    );
  }

  if (error || !quizData) {
    return (
      <div className="text-center py-12">
        <p className="text-gray-500 mb-4">Không tìm thấy kết quả quiz</p>
        <Link to="/quiz" className="btn-primary">
          Về danh sách quiz
        </Link>
      </div>
    );
  }

  const { topic, questions, result, submittedAt } = quizData;
  const { score, correctAnswers, totalQuestions, results } = result;

  // Determine performance
  const getPerformance = () => {
    if (score >= 90) return { text: 'Xuất sắc!', emoji: '🏆', color: 'text-yellow-500', bg: 'bg-yellow-50' };
    if (score >= 70) return { text: 'Tốt lắm!', emoji: '👍', color: 'text-green-500', bg: 'bg-green-50' };
    if (score >= 50) return { text: 'Khá tốt!', emoji: '💪', color: 'text-blue-500', bg: 'bg-blue-50' };
    return { text: 'Cần cố gắng hơn!', emoji: '📚', color: 'text-orange-500', bg: 'bg-orange-50' };
  };

  const performance = getPerformance();

  return (
    <div className="max-w-4xl mx-auto">
      {/* Header */}
      <div className="mb-6">
        <Link to="/quiz" className="inline-flex items-center text-gray-600 hover:text-gray-900 mb-4">
          <ArrowLeftIcon className="w-4 h-4 mr-2" />
          Quay lại danh sách Quiz
        </Link>
      </div>

      {/* Result Summary */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        className={`card mb-8 ${performance.bg}`}
      >
        <div className="flex flex-col md:flex-row items-center justify-between gap-6">
          <div className="flex items-center gap-4">
            <div className="text-5xl">{performance.emoji}</div>
            <div>
              <h1 className="text-2xl font-bold text-gray-900">{topic}</h1>
              <p className={`text-lg font-medium ${performance.color}`}>{performance.text}</p>
              <p className="text-sm text-gray-500 mt-1">
                Làm ngày {new Date(submittedAt?.seconds * 1000 || submittedAt).toLocaleDateString('vi-VN')}
              </p>
            </div>
          </div>

          <div className="flex items-center gap-8">
            <div className="text-center">
              <div className="text-4xl font-bold text-gray-900">{score}%</div>
              <p className="text-sm text-gray-500">Điểm số</p>
            </div>
            <div className="text-center">
              <div className="text-4xl font-bold text-green-600">{correctAnswers}</div>
              <p className="text-sm text-gray-500">/{totalQuestions} câu đúng</p>
            </div>
          </div>
        </div>
      </motion.div>

      {/* Questions Review */}
      <div className="space-y-6">
        <h2 className="text-xl font-semibold text-gray-900 flex items-center gap-2">
          <LightBulbIcon className="w-6 h-6 text-yellow-500" />
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
              transition={{ delay: index * 0.05 }}
              className={`card border-l-4 ${
                isCorrect ? 'border-l-green-500' : 'border-l-red-500'
              }`}
            >
              {/* Question Header */}
              <div className="flex items-start justify-between mb-4">
                <div className="flex items-center gap-3">
                  <span className={`w-8 h-8 rounded-full flex items-center justify-center text-white text-sm font-medium ${
                    isCorrect ? 'bg-green-500' : 'bg-red-500'
                  }`}>
                    {index + 1}
                  </span>
                  <span className={`px-2 py-1 rounded text-xs font-medium ${
                    question.difficulty === 'easy' ? 'bg-green-100 text-green-700' :
                    question.difficulty === 'medium' ? 'bg-yellow-100 text-yellow-700' :
                    'bg-red-100 text-red-700'
                  }`}>
                    {question.difficulty === 'easy' ? 'Dễ' : 
                     question.difficulty === 'medium' ? 'Trung bình' : 'Khó'}
                  </span>
                </div>
                {isCorrect ? (
                  <CheckCircleIcon className="w-6 h-6 text-green-500" />
                ) : (
                  <XCircleIcon className="w-6 h-6 text-red-500" />
                )}
              </div>

              {/* Question Text */}
              <p className="text-gray-900 font-medium mb-4">{question.question}</p>

              {/* Options */}
              <div className="space-y-2 mb-4">
                {['A', 'B', 'C', 'D'].map((option) => {
                  const isUserAnswer = userResult?.userAnswer === option;
                  const isCorrectAnswer = question.answer === option;

                  let optionClass = 'bg-gray-50 border-gray-200';
                  if (isCorrectAnswer) {
                    optionClass = 'bg-green-50 border-green-500 text-green-800';
                  } else if (isUserAnswer && !isCorrect) {
                    optionClass = 'bg-red-50 border-red-500 text-red-800';
                  }

                  return (
                    <div
                      key={option}
                      className={`p-3 rounded-lg border-2 flex items-center gap-3 ${optionClass}`}
                    >
                      <span className={`w-6 h-6 rounded-full flex items-center justify-center text-sm font-medium ${
                        isCorrectAnswer ? 'bg-green-500 text-white' :
                        isUserAnswer && !isCorrect ? 'bg-red-500 text-white' :
                        'bg-gray-300 text-gray-600'
                      }`}>
                        {option}
                      </span>
                      <span>{question[option]}</span>
                      {isCorrectAnswer && (
                        <CheckCircleIcon className="w-5 h-5 text-green-500 ml-auto" />
                      )}
                      {isUserAnswer && !isCorrect && (
                        <XCircleIcon className="w-5 h-5 text-red-500 ml-auto" />
                      )}
                    </div>
                  );
                })}
              </div>

              {/* Explanation */}
              {question.explanation && (
                <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
                  <p className="text-sm font-medium text-blue-800 mb-1">💡 Giải thích:</p>
                  <p className="text-sm text-blue-700">{question.explanation}</p>
                </div>
              )}
            </motion.div>
          );
        })}
      </div>

      {/* Actions */}
      <div className="flex flex-col sm:flex-row gap-4 mt-8">
        <Link to="/quiz" className="btn-secondary flex-1 justify-center">
          <ArrowLeftIcon className="w-4 h-4 mr-2" />
          Về danh sách quiz
        </Link>
        <Link to="/lessons" className="btn-primary flex-1 justify-center">
          <TrophyIcon className="w-4 h-4 mr-2" />
          Học bài khác
        </Link>
      </div>
    </div>
  );
};

export default QuizReview;
