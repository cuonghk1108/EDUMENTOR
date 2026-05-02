import React, { useEffect, useState } from 'react';
import { useLocation, Link, useParams } from 'react-router-dom';
import { motion } from 'framer-motion';
import {
  CheckCircleIcon,
  XCircleIcon,
  TrophyIcon,
  ArrowPathIcon,
  HomeIcon,
  BookOpenIcon,
  SparklesIcon
} from '@heroicons/react/24/outline';
import { celebrateQuizComplete, animateValue } from '../utils/gamification';
import MathRenderer from '../components/MathRenderer';

const QuizResult = () => {
  const { quizId } = useParams();
  const location = useLocation();
  const result = location.state?.result;
  const [animatedScore, setAnimatedScore] = useState(0);
  const [animatedCorrect, setAnimatedCorrect] = useState(0);

  // Trigger confetti on mount
  useEffect(() => {
    if (result?.score) {
      // Slight delay for dramatic effect
      const timer = setTimeout(() => {
        celebrateQuizComplete(result.score);
      }, 600);
      return () => clearTimeout(timer);
    }
  }, [result]);

  // Animate score count-up
  useEffect(() => {
    if (result?.score) {
      animateValue(0, result.score, 1200, setAnimatedScore);
    }
    if (result?.correctAnswers) {
      animateValue(0, result.correctAnswers, 1000, setAnimatedCorrect);
    }
  }, [result]);

  if (!result) {
    return (
      <div className="text-center py-16">
        <div className="w-20 h-20 bg-gray-800/50 rounded-full flex items-center justify-center mx-auto mb-4">
          <TrophyIcon className="w-10 h-10 text-gray-500" />
        </div>
        <p className="text-gray-400 mb-6">Không tìm thấy kết quả</p>
        <Link 
          to="/quiz" 
          className="inline-flex items-center gap-2 px-6 py-3 bg-gradient-to-r from-purple-500 to-pink-500 rounded-xl font-semibold text-white"
        >
          Về danh sách quiz
        </Link>
      </div>
    );
  }

  const { totalQuestions, score, results } = result;
  
  // Determine performance
  const getPerformance = () => {
    if (score >= 90) return { text: 'Xuất sắc!', emoji: '🏆', color: 'text-yellow-400', gradient: 'from-yellow-500 to-amber-500' };
    if (score >= 70) return { text: 'Tốt lắm!', emoji: '👍', color: 'text-green-400', gradient: 'from-green-500 to-emerald-500' };
    if (score >= 50) return { text: 'Khá tốt!', emoji: '💪', color: 'text-blue-400', gradient: 'from-blue-500 to-cyan-500' };
    return { text: 'Cần cố gắng hơn!', emoji: '📚', color: 'text-orange-400', gradient: 'from-orange-500 to-red-500' };
  };

  const performance = getPerformance();

  return (
    <div className="max-w-3xl mx-auto p-6">
      {/* Result Card */}
      <motion.div
        initial={{ opacity: 0, scale: 0.9 }}
        animate={{ opacity: 1, scale: 1 }}
        className="bg-gray-900/50 border border-white/5 rounded-2xl p-8 text-center mb-8"
      >
        <motion.div 
          initial={{ scale: 0 }}
          animate={{ scale: 1 }}
          transition={{ delay: 0.2, type: "spring" }}
          className="text-6xl mb-4"
        >
          {performance.emoji}
        </motion.div>
        
        <h1 className={`text-3xl font-display font-bold mb-2 ${performance.color}`}>
          {performance.text}
        </h1>

        <div className="flex items-center justify-center gap-8 my-8">
          <div>
            <motion.div 
              className="text-5xl font-bold text-white xp-pulse-once"
              key={animatedScore}
            >
              {animatedScore}%
            </motion.div>
            <p className="text-gray-500 mt-1">Điểm số</p>
          </div>
          
          <div className="w-px h-16 bg-white/10" />
          
          <div>
            <motion.div 
              className="text-5xl font-bold text-green-400 xp-pulse-once"
              key={animatedCorrect}
            >
              {animatedCorrect}
            </motion.div>
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
              stroke="rgba(255,255,255,0.1)"
              strokeWidth="12"
              fill="none"
            />
            <motion.circle
              cx="80"
              cy="80"
              r="70"
              stroke={score >= 70 ? '#22c55e' : score >= 50 ? '#3b82f6' : '#f97316'}
              strokeWidth="12"
              fill="none"
              strokeLinecap="round"
              initial={{ strokeDasharray: "0 440" }}
              animate={{ strokeDasharray: `${(score / 100) * 440} 440` }}
              transition={{ duration: 1, delay: 0.3 }}
            />
          </svg>
          <div className="absolute inset-0 flex items-center justify-center">
            <div className={`w-16 h-16 bg-gradient-to-br ${performance.gradient} rounded-full flex items-center justify-center shadow-lg`}>
              <TrophyIcon className="w-8 h-8 text-white" />
            </div>
          </div>
        </div>

        {/* Actions */}
        <div className="flex flex-wrap justify-center gap-4">
          <Link 
            to={`/quiz/${quizId}`} 
            className="px-6 py-3 bg-white/5 border border-white/10 rounded-xl text-gray-300 hover:bg-white/10 transition-colors flex items-center gap-2"
          >
            <ArrowPathIcon className="w-5 h-5" />
            Làm lại
          </Link>
          <Link 
            to="/quiz" 
            className="px-6 py-3 bg-gradient-to-r from-purple-500 to-pink-500 rounded-xl font-medium text-white hover:shadow-lg hover:shadow-purple-500/25 transition-all flex items-center gap-2"
          >
            <HomeIcon className="w-5 h-5" />
            Quiz khác
          </Link>
        </div>
      </motion.div>

      {/* Detailed Results */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.2 }}
        className="bg-gray-900/50 border border-white/5 rounded-2xl p-6"
      >
        <h2 className="text-xl font-semibold text-white mb-6">Chi tiết kết quả</h2>
        
        <div className="space-y-4">
          {results.map((item, index) => (
            <motion.div
              key={index}
              initial={{ opacity: 0, x: -20 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ delay: 0.3 + index * 0.05 }}
              className={`p-4 rounded-xl border ${
                item.isCorrect 
                  ? 'border-green-500/30 bg-green-500/10' 
                  : 'border-red-500/30 bg-red-500/10'
              }`}
            >
              <div className="flex items-start gap-3">
                <div className={`w-8 h-8 rounded-lg flex items-center justify-center flex-shrink-0 ${
                  item.isCorrect ? 'bg-green-500' : 'bg-red-500'
                }`}>
                  {item.isCorrect ? (
                    <CheckCircleIcon className="w-5 h-5 text-white" />
                  ) : (
                    <XCircleIcon className="w-5 h-5 text-white" />
                  )}
                </div>
                
                <div className="flex-1">
                  <div className="font-medium text-white mb-2">
                    <span>Câu {index + 1}: </span>
                    <MathRenderer content={item.question} className="prose-sm" />
                  </div>
                  
                  <div className="flex flex-wrap gap-4 text-sm">
                    <div>
                      <span className="text-gray-500">Bạn chọn: </span>
                      <span className={item.isCorrect ? 'text-green-400 font-medium' : 'text-red-400 font-medium'}>
                        {item.userAnswer || 'Không trả lời'}
                      </span>
                    </div>
                    
                    {!item.isCorrect && (
                      <div>
                        <span className="text-gray-500">Đáp án đúng: </span>
                        <span className="text-green-400 font-medium">{item.correctAnswer}</span>
                      </div>
                    )}
                  </div>

                  {item.explanation && (
                    <div className="mt-3 p-3 bg-white/5 rounded-lg">
                      <div className="text-sm text-gray-300">
                        <span className="font-medium text-white">Giải thích: </span>
                        <MathRenderer content={item.explanation} className="prose-sm" />
                      </div>
                    </div>
                  )}
                </div>
              </div>
            </motion.div>
          ))}
        </div>
      </motion.div>

      {/* Recommendations */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.4 }}
        className="bg-gray-900/50 border border-white/5 rounded-2xl p-6 mt-6"
      >
        <h3 className="text-lg font-semibold text-white mb-4">Đề xuất tiếp theo</h3>
        
        <div className="grid md:grid-cols-2 gap-4">
          <Link 
            to="/lessons" 
            className="group p-4 rounded-xl border border-white/10 hover:border-purple-500/50 hover:bg-white/5 transition-all"
          >
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 bg-purple-500/20 rounded-xl flex items-center justify-center">
                <BookOpenIcon className="w-5 h-5 text-purple-400" />
              </div>
              <div>
                <p className="font-medium text-white group-hover:text-purple-400 transition-colors">📚 Ôn lại bài học</p>
                <p className="text-sm text-gray-500 mt-0.5">Đọc lại nội dung để hiểu sâu hơn</p>
              </div>
            </div>
          </Link>
          
          <Link 
            to="/chat" 
            className="group p-4 rounded-xl border border-white/10 hover:border-cyan-500/50 hover:bg-white/5 transition-all"
          >
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 bg-cyan-500/20 rounded-xl flex items-center justify-center">
                <SparklesIcon className="w-5 h-5 text-cyan-400" />
              </div>
              <div>
                <p className="font-medium text-white group-hover:text-cyan-400 transition-colors">💬 Hỏi đáp AI</p>
                <p className="text-sm text-gray-500 mt-0.5">Hỏi những phần chưa hiểu</p>
              </div>
            </div>
          </Link>
        </div>
      </motion.div>
    </div>
  );
};

export default QuizResult;
