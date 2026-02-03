import React, { useState } from 'react';
import { useParams, useNavigate, Link } from 'react-router-dom';
import { useQuery, useMutation } from 'react-query';
import { motion, AnimatePresence } from 'framer-motion';
import { quizAPI } from '../services/api';
import {
  ArrowLeftIcon,
  ArrowRightIcon,
  CheckCircleIcon,
  ClockIcon
} from '@heroicons/react/24/outline';
import toast from 'react-hot-toast';

const QuizTake = () => {
  const { quizId } = useParams();
  const navigate = useNavigate();

  const [currentQuestion, setCurrentQuestion] = useState(0);
  const [answers, setAnswers] = useState({});
  const [showResult, setShowResult] = useState(false);

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

    // Convert answers format
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
      <div className="flex items-center justify-center h-64">
        <div className="loading-dots text-primary-600">
          <span></span>
          <span></span>
          <span></span>
        </div>
      </div>
    );
  }

  if (error || !quiz) {
    return (
      <div className="text-center py-12">
        <p className="text-red-500 mb-4">Không tìm thấy quiz</p>
        <Link to="/quiz" className="btn-primary">
          Về danh sách quiz
        </Link>
      </div>
    );
  }

  const question = quiz.questions[currentQuestion];
  const progress = ((currentQuestion + 1) / quiz.questions.length) * 100;
  const answeredCount = Object.keys(answers).length;

  return (
    <div className="max-w-3xl mx-auto">
      {/* Header */}
      <div className="mb-8">
        <Link to="/quiz" className="inline-flex items-center text-gray-500 hover:text-gray-700 mb-4">
          <ArrowLeftIcon className="w-4 h-4 mr-1" />
          Quay lại
        </Link>
        
        <h1 className="text-2xl font-display font-bold text-gray-900">{quiz.topic}</h1>
        
        {/* Progress Bar */}
        <div className="mt-4">
          <div className="flex items-center justify-between text-sm text-gray-500 mb-2">
            <span>Câu {currentQuestion + 1}/{quiz.questions.length}</span>
            <span>{answeredCount} đã trả lời</span>
          </div>
          <div className="w-full bg-gray-200 rounded-full h-2">
            <div 
              className="bg-primary-600 h-2 rounded-full transition-all duration-300"
              style={{ width: `${progress}%` }}
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
          className="card"
        >
          {/* Question */}
          <div className="mb-6">
            <div className="flex items-center gap-2 mb-4">
              <span className={`badge ${
                question.difficulty === 'easy' ? 'badge-success' :
                question.difficulty === 'medium' ? 'badge-warning' :
                'badge-danger'
              }`}>
                {question.difficulty === 'easy' ? 'Dễ' :
                 question.difficulty === 'medium' ? 'Trung bình' : 'Khó'}
              </span>
            </div>
            
            <h2 className="text-xl font-medium text-gray-900">
              {question.question}
            </h2>
          </div>

          {/* Options */}
          <div className="space-y-3">
            {['A', 'B', 'C', 'D'].map((option) => (
              <button
                key={option}
                onClick={() => handleAnswer(option)}
                className={`w-full p-4 rounded-xl border-2 text-left transition-all ${
                  answers[currentQuestion] === option
                    ? 'border-primary-500 bg-primary-50 text-primary-700'
                    : 'border-gray-200 hover:border-gray-300 hover:bg-gray-50'
                }`}
              >
                <div className="flex items-start gap-3">
                  <span className={`w-8 h-8 rounded-full flex items-center justify-center font-medium flex-shrink-0 ${
                    answers[currentQuestion] === option
                      ? 'bg-primary-500 text-white'
                      : 'bg-gray-100 text-gray-600'
                  }`}>
                    {option}
                  </span>
                  <span className="pt-1">{question[option]}</span>
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
          className="btn-ghost disabled:opacity-50 disabled:cursor-not-allowed"
        >
          <ArrowLeftIcon className="w-5 h-5 mr-2" />
          Câu trước
        </button>

        {currentQuestion < quiz.questions.length - 1 ? (
          <button onClick={handleNext} className="btn-primary">
            Câu tiếp
            <ArrowRightIcon className="w-5 h-5 ml-2" />
          </button>
        ) : (
          <button
            onClick={handleSubmit}
            disabled={submitMutation.isLoading}
            className="btn-secondary"
          >
            {submitMutation.isLoading ? (
              <span className="loading-dots">
                <span></span>
                <span></span>
                <span></span>
              </span>
            ) : (
              <>
                <CheckCircleIcon className="w-5 h-5 mr-2" />
                Nộp bài
              </>
            )}
          </button>
        )}
      </div>

      {/* Question Navigator */}
      <div className="mt-8 card">
        <h3 className="text-sm font-medium text-gray-700 mb-3">Danh sách câu hỏi</h3>
        <div className="flex flex-wrap gap-2">
          {quiz.questions.map((_, index) => (
            <button
              key={index}
              onClick={() => setCurrentQuestion(index)}
              className={`w-10 h-10 rounded-lg font-medium transition-all ${
                currentQuestion === index
                  ? 'bg-primary-600 text-white'
                  : answers[index]
                    ? 'bg-green-100 text-green-700 border-2 border-green-300'
                    : 'bg-gray-100 text-gray-600 hover:bg-gray-200'
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
