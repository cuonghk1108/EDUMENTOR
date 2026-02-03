import React from 'react';
import { useLocation, Link, useParams } from 'react-router-dom';
import { motion } from 'framer-motion';
import {
  CheckCircleIcon,
  XCircleIcon,
  TrophyIcon,
  ArrowPathIcon,
  HomeIcon
} from '@heroicons/react/24/outline';

const QuizResult = () => {
  const { quizId } = useParams();
  const location = useLocation();
  const result = location.state?.result;

  if (!result) {
    return (
      <div className="text-center py-12">
        <p className="text-gray-500 mb-4">Không tìm thấy kết quả</p>
        <Link to="/quiz" className="btn-primary">
          Về danh sách quiz
        </Link>
      </div>
    );
  }

  const { correctAnswers, totalQuestions, score, results } = result;
  
  // Determine performance
  const getPerformance = () => {
    if (score >= 90) return { text: 'Xuất sắc!', emoji: '🏆', color: 'text-yellow-500' };
    if (score >= 70) return { text: 'Tốt lắm!', emoji: '👍', color: 'text-green-500' };
    if (score >= 50) return { text: 'Khá tốt!', emoji: '💪', color: 'text-blue-500' };
    return { text: 'Cần cố gắng hơn!', emoji: '📚', color: 'text-orange-500' };
  };

  const performance = getPerformance();

  return (
    <div className="max-w-3xl mx-auto">
      {/* Result Card */}
      <motion.div
        initial={{ opacity: 0, scale: 0.9 }}
        animate={{ opacity: 1, scale: 1 }}
        className="card text-center mb-8"
      >
        <div className="text-6xl mb-4">{performance.emoji}</div>
        
        <h1 className={`text-3xl font-display font-bold mb-2 ${performance.color}`}>
          {performance.text}
        </h1>

        <div className="flex items-center justify-center gap-8 my-8">
          <div>
            <div className="text-5xl font-bold text-gray-900">{score}%</div>
            <p className="text-gray-500 mt-1">Điểm số</p>
          </div>
          
          <div className="w-px h-16 bg-gray-200" />
          
          <div>
            <div className="text-5xl font-bold text-green-600">{correctAnswers}</div>
            <p className="text-gray-500 mt-1">/{totalQuestions} câu đúng</p>
          </div>
        </div>

        {/* Progress Ring */}
        <div className="relative w-40 h-40 mx-auto mb-6">
          <svg className="w-40 h-40 transform -rotate-90">
            <circle
              cx="80"
              cy="80"
              r="70"
              stroke="#e5e7eb"
              strokeWidth="12"
              fill="none"
            />
            <circle
              cx="80"
              cy="80"
              r="70"
              stroke={score >= 70 ? '#22c55e' : score >= 50 ? '#3b82f6' : '#f97316'}
              strokeWidth="12"
              fill="none"
              strokeLinecap="round"
              strokeDasharray={`${(score / 100) * 440} 440`}
              className="transition-all duration-1000"
            />
          </svg>
          <div className="absolute inset-0 flex items-center justify-center">
            <TrophyIcon className={`w-12 h-12 ${performance.color}`} />
          </div>
        </div>

        {/* Actions */}
        <div className="flex flex-wrap justify-center gap-4">
          <Link to={`/quiz/${quizId}`} className="btn-outline">
            <ArrowPathIcon className="w-5 h-5 mr-2" />
            Làm lại
          </Link>
          <Link to="/quiz" className="btn-primary">
            <HomeIcon className="w-5 h-5 mr-2" />
            Quiz khác
          </Link>
        </div>
      </motion.div>

      {/* Detailed Results */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.2 }}
        className="card"
      >
        <h2 className="text-xl font-semibold text-gray-900 mb-6">Chi tiết kết quả</h2>
        
        <div className="space-y-4">
          {results.map((item, index) => (
            <div
              key={index}
              className={`p-4 rounded-xl border-2 ${
                item.isCorrect 
                  ? 'border-green-200 bg-green-50' 
                  : 'border-red-200 bg-red-50'
              }`}
            >
              <div className="flex items-start gap-3">
                <div className={`w-8 h-8 rounded-full flex items-center justify-center flex-shrink-0 ${
                  item.isCorrect ? 'bg-green-500' : 'bg-red-500'
                }`}>
                  {item.isCorrect ? (
                    <CheckCircleIcon className="w-5 h-5 text-white" />
                  ) : (
                    <XCircleIcon className="w-5 h-5 text-white" />
                  )}
                </div>
                
                <div className="flex-1">
                  <p className="font-medium text-gray-900 mb-2">
                    Câu {index + 1}: {item.question}
                  </p>
                  
                  <div className="flex flex-wrap gap-4 text-sm">
                    <div>
                      <span className="text-gray-500">Bạn chọn: </span>
                      <span className={item.isCorrect ? 'text-green-700 font-medium' : 'text-red-700 font-medium'}>
                        {item.userAnswer || 'Không trả lời'}
                      </span>
                    </div>
                    
                    {!item.isCorrect && (
                      <div>
                        <span className="text-gray-500">Đáp án đúng: </span>
                        <span className="text-green-700 font-medium">{item.correctAnswer}</span>
                      </div>
                    )}
                  </div>

                  {item.explanation && (
                    <div className="mt-3 p-3 bg-white rounded-lg">
                      <p className="text-sm text-gray-600">
                        <span className="font-medium">Giải thích: </span>
                        {item.explanation}
                      </p>
                    </div>
                  )}
                </div>
              </div>
            </div>
          ))}
        </div>
      </motion.div>

      {/* Recommendations */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.4 }}
        className="card mt-6"
      >
        <h3 className="text-lg font-semibold text-gray-900 mb-4">Đề xuất tiếp theo</h3>
        
        <div className="grid md:grid-cols-2 gap-4">
          <Link to="/lessons" className="p-4 rounded-xl border-2 border-gray-200 hover:border-primary-300 hover:bg-primary-50 transition-all">
            <p className="font-medium text-gray-900">📚 Ôn lại bài học</p>
            <p className="text-sm text-gray-500 mt-1">Đọc lại nội dung để hiểu sâu hơn</p>
          </Link>
          
          <Link to="/chat" className="p-4 rounded-xl border-2 border-gray-200 hover:border-primary-300 hover:bg-primary-50 transition-all">
            <p className="font-medium text-gray-900">💬 Hỏi đáp AI</p>
            <p className="text-sm text-gray-500 mt-1">Hỏi những phần chưa hiểu</p>
          </Link>
        </div>
      </motion.div>
    </div>
  );
};

export default QuizResult;
