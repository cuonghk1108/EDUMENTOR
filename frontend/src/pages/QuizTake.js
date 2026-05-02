import React, { useState } from 'react';
import { useParams, useNavigate, Link } from 'react-router-dom';
import { useQuery, useMutation } from 'react-query';
import { motion, AnimatePresence } from 'framer-motion';
import { quizAPI, streakAPI } from '../services/api';
import {
  ArrowLeftIcon,
  ArrowRightIcon,
  CheckCircleIcon,
  ClockIcon,
  QuestionMarkCircleIcon,
  ExclamationTriangleIcon
} from '@heroicons/react/24/outline';
import MathRenderer from '../components/MathRenderer';
import toast from 'react-hot-toast';

const QuizTake = () => {
  const { quizId } = useParams();
  const navigate = useNavigate();

  const [currentQuestion, setCurrentQuestion] = useState(0);
  const [answers, setAnswers] = useState({});

  // Fetch quiz
  const { data: quiz, isLoading, error } = useQuery(
    ['quiz', quizId],
    () => quizAPI.getById(quizId).then(res => res.data.quiz),
    { enabled: !!quizId }
  );

  // Submit mutation
  const submitMutation = useMutation(
    (data) => quizAPI.submit(data),
    {
      onSuccess: (data) => {
        streakAPI.record('quiz_complete', 10).catch(err => {
          console.log('Streak record failed:', err);
        });
        navigate(`/quiz/${quizId}/result`, { state: { result: data.data.result } });
      },
      onError: () => {
        toast.error('Lỗi nộp bài');
      }
    }
  );

  const handleAnswer = (answer) => {
    setAnswers({
      ...answers,
      [currentQuestion]: answer
    });
  };

  const handleNext = () => {
    if (currentQuestion < quiz.questions.length - 1) {
      setCurrentQuestion(currentQuestion + 1);
    }
  };

  const handlePrev = () => {
    if (currentQuestion > 0) {
      setCurrentQuestion(currentQuestion - 1);
    }
  };

  const handleSubmit = () => {
    const unanswered = quiz.questions.length - Object.keys(answers).length;
    
    if (unanswered > 0) {
      const confirm = window.confirm(
        `Bạn còn ${unanswered} câu chưa trả lời. Bạn có chắc muốn nộp bài?`
      );
      if (!confirm) return;
    }

    const formattedAnswers = {};
    quiz.questions.forEach((q, index) => {
      formattedAnswers[index] = answers[index] || null;
    });

    submitMutation.mutate({
      quizId,
      answers: formattedAnswers
    });
  };

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

  if (error || !quiz) {
    return (
      <div className="text-center py-16">
        <div className="w-20 h-20 bg-red-500/20 rounded-full flex items-center justify-center mx-auto mb-4">
          <ExclamationTriangleIcon className="w-10 h-10 text-red-400" />
        </div>
        <p className="text-red-400 mb-4 text-lg">Không tìm thấy quiz</p>
        <Link 
          to="/quiz" 
          className="inline-flex items-center gap-2 px-6 py-3 bg-gradient-to-r from-purple-500 to-pink-500 rounded-xl font-semibold text-white"
        >
          Về danh sách quiz
        </Link>
      </div>
    );
  }

  const question = quiz.questions[currentQuestion];
  const progress = ((currentQuestion + 1) / quiz.questions.length) * 100;
  const answeredCount = Object.keys(answers).length;

  const getDifficultyStyle = (difficulty) => {
    switch(difficulty) {
      case 'easy': return 'bg-green-500/20 text-green-400';
      case 'medium': return 'bg-yellow-500/20 text-yellow-400';
      case 'hard': return 'bg-red-500/20 text-red-400';
      default: return 'bg-gray-500/20 text-gray-400';
    }
  };

  const getDifficultyText = (difficulty) => {
    switch(difficulty) {
      case 'easy': return 'Dễ';
      case 'medium': return 'Trung bình';
      case 'hard': return 'Khó';
      default: return difficulty;
    }
  };

  return (
    <div className="max-w-3xl mx-auto p-6">
      {/* Header */}
      <div className="mb-8">
        <Link 
          to="/quiz" 
          className="inline-flex items-center text-gray-400 hover:text-white transition-colors mb-4"
        >
          <ArrowLeftIcon className="w-4 h-4 mr-2" />
          Quay lại
        </Link>
        
        <h1 className="text-2xl font-display font-bold text-white flex items-center gap-3">
          <div className="w-10 h-10 bg-gradient-to-br from-purple-500 to-pink-500 rounded-xl flex items-center justify-center">
            <QuestionMarkCircleIcon className="w-6 h-6 text-white" />
          </div>
          {quiz.topic}
        </h1>
        
        {/* Progress Bar */}
        <div className="mt-6">
          <div className="flex items-center justify-between text-sm text-gray-400 mb-2">
            <span>Câu {currentQuestion + 1}/{quiz.questions.length}</span>
            <span className="text-green-400">{answeredCount} đã trả lời</span>
          </div>
          <div className="w-full bg-white/10 rounded-full h-2 overflow-hidden">
            <motion.div 
              className="bg-gradient-to-r from-purple-500 to-pink-500 h-2 rounded-full"
              initial={{ width: 0 }}
              animate={{ width: `${progress}%` }}
              transition={{ duration: 0.3 }}
            />
          </div>
        </div>
      </div>

      {/* Question Card */}
      <AnimatePresence mode="wait">
        <motion.div
          key={currentQuestion}
          initial={{ opacity: 0, x: 20 }}
          animate={{ opacity: 1, x: 0 }}
          exit={{ opacity: 0, x: -20 }}
          transition={{ duration: 0.2 }}
          className="bg-gray-900/50 border border-white/5 rounded-2xl p-6"
        >
          {/* Question */}
          <div className="mb-6">
            <div className="flex items-center gap-2 mb-4">
              <span className={`px-3 py-1 rounded-full text-xs font-medium ${getDifficultyStyle(question.difficulty)}`}>
                {getDifficultyText(question.difficulty)}
              </span>
            </div>
            
            <div className="text-xl font-medium text-white">
              <MathRenderer content={question.question} className="prose-xl" />
            </div>
          </div>

          {/* Options */}
          <div className="space-y-3">
            {['A', 'B', 'C', 'D'].map((option) => (
              <button
                key={option}
                onClick={() => handleAnswer(option)}
                className={`w-full p-4 rounded-xl border-2 text-left transition-all ${
                  answers[currentQuestion] === option
                    ? 'border-purple-500 bg-purple-500/20 text-white'
                    : 'border-white/10 hover:border-white/30 hover:bg-white/5 text-gray-300'
                }`}
              >
                <div className="flex items-start gap-3">
                  <span className={`w-8 h-8 rounded-lg flex items-center justify-center font-medium flex-shrink-0 ${
                    answers[currentQuestion] === option
                      ? 'bg-purple-500 text-white'
                      : 'bg-white/10 text-gray-400'
                  }`}>
                    {option}
                  </span>
                  <div className="pt-1 flex-1">
                    <MathRenderer content={question[option]} className="prose-sm" />
                  </div>
                </div>
              </button>
            ))}
          </div>
        </motion.div>
      </AnimatePresence>

      {/* Navigation */}
      <div className="mt-8 flex items-center justify-between">
        <button
          onClick={handlePrev}
          disabled={currentQuestion === 0}
          className="px-5 py-2.5 flex items-center gap-2 text-gray-400 hover:text-white disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
        >
          <ArrowLeftIcon className="w-5 h-5" />
          Câu trước
        </button>

        {currentQuestion < quiz.questions.length - 1 ? (
          <button 
            onClick={handleNext} 
            className="px-6 py-2.5 bg-gradient-to-r from-purple-500 to-pink-500 rounded-xl font-medium text-white flex items-center gap-2 hover:shadow-lg hover:shadow-purple-500/25 transition-all"
          >
            Câu tiếp
            <ArrowRightIcon className="w-5 h-5" />
          </button>
        ) : (
          <button
            onClick={handleSubmit}
            disabled={submitMutation.isLoading}
            className="px-6 py-2.5 bg-gradient-to-r from-green-500 to-emerald-500 rounded-xl font-medium text-white flex items-center gap-2 hover:shadow-lg hover:shadow-green-500/25 transition-all disabled:opacity-50"
          >
            {submitMutation.isLoading ? (
              <span className="flex items-center gap-2">
                <motion.span
                  animate={{ rotate: 360 }}
                  transition={{ duration: 1, repeat: Infinity, ease: "linear" }}
                  className="w-5 h-5 border-2 border-white/30 border-t-white rounded-full"
                />
                Đang nộp...
              </span>
            ) : (
              <>
                <CheckCircleIcon className="w-5 h-5" />
                Nộp bài
              </>
            )}
          </button>
        )}
      </div>

      {/* Question Navigator */}
      <div className="mt-8 bg-gray-900/50 border border-white/5 rounded-2xl p-6">
        <h3 className="text-sm font-medium text-gray-400 mb-4">Danh sách câu hỏi</h3>
        <div className="flex flex-wrap gap-2">
          {quiz.questions.map((_, index) => (
            <button
              key={index}
              onClick={() => setCurrentQuestion(index)}
              className={`w-10 h-10 rounded-lg font-medium transition-all ${
                currentQuestion === index
                  ? 'bg-gradient-to-r from-purple-500 to-pink-500 text-white shadow-lg shadow-purple-500/25'
                  : answers[index]
                    ? 'bg-green-500/20 text-green-400 border border-green-500/50'
                    : 'bg-white/5 text-gray-400 hover:bg-white/10 border border-white/10'
              }`}
            >
              {index + 1}
            </button>
          ))}
        </div>
      </div>
    </div>
  );
};

export default QuizTake;
