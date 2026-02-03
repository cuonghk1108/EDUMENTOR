import React, { useState, useRef, useEffect } from 'react';
import { useQuery, useMutation, useQueryClient } from 'react-query';
import { motion, AnimatePresence } from 'framer-motion';
import { useAuth } from '../context/AuthContext';
import { chatAPI, lessonAPI } from '../services/api';
import {
  PaperAirplaneIcon,
  TrashIcon,
  SparklesIcon,
  UserCircleIcon,
  AcademicCapIcon
} from '@heroicons/react/24/outline';
import ReactMarkdown from 'react-markdown';
import toast from 'react-hot-toast';

const Chat = () => {
  const { user } = useAuth();
  const queryClient = useQueryClient();
  const [message, setMessage] = useState('');
  const [selectedLesson, setSelectedLesson] = useState(null);
  const messagesEndRef = useRef(null);

  // Fetch chat history
  const { data: history = [], isLoading } = useQuery(
    ['chat-history', user?.id],
    () => chatAPI.getHistory(user.id).then(res => res.data.history),
    { enabled: !!user?.id }
  );

  // Fetch user lessons for context
  const { data: lessons = [] } = useQuery(
    ['lessons', user?.id],
    () => lessonAPI.getAll(user.id).then(res => res.data.lessons),
    { enabled: !!user?.id }
  );

  // Send message mutation
  const sendMutation = useMutation(
    (data) => chatAPI.sendMessage(data),
    {
      onSuccess: () => {
        queryClient.invalidateQueries(['chat-history', user?.id]);
        setMessage('');
      },
      onError: () => {
        toast.error('Lỗi gửi tin nhắn');
      }
    }
  );

  // Clear history mutation
  const clearMutation = useMutation(
    () => chatAPI.clearHistory(user.id),
    {
      onSuccess: () => {
        queryClient.invalidateQueries(['chat-history', user?.id]);
        toast.success('Đã xóa lịch sử chat');
      }
    }
  );

  // Auto scroll to bottom
  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [history]);

  const handleSend = (e) => {
    e.preventDefault();
    if (!message.trim() || sendMutation.isLoading) return;

    sendMutation.mutate({
      message: message.trim(),
      lessonId: selectedLesson
    });
  };

  const handleClear = () => {
    if (window.confirm('Bạn có chắc muốn xóa toàn bộ lịch sử chat?')) {
      clearMutation.mutate();
    }
  };

  // Quick questions
  const quickQuestions = [
    'Giải thích lại phần này cho em',
    'Cho em một ví dụ',
    'Tóm tắt bài học này',
    'Có mẹo gì để nhớ bài không?'
  ];

  return (
    <div className="h-[calc(100vh-8rem)] flex flex-col">
      {/* Header */}
      <div className="flex items-center justify-between mb-4">
        <div>
          <h1 className="text-2xl font-display font-bold text-gray-900">Hỏi đáp AI</h1>
          <p className="text-gray-600 text-sm">Hỏi bất kỳ điều gì về bài học</p>
        </div>
        
        <div className="flex items-center gap-3">
          {/* Lesson Selector */}
          <select
            value={selectedLesson || ''}
            onChange={(e) => setSelectedLesson(e.target.value || null)}
            className="input text-sm py-2"
          >
            <option value="">Không chọn bài học</option>
            {lessons.map(lesson => (
              <option key={lesson.id} value={lesson.id}>
                {lesson.title}
              </option>
            ))}
          </select>

          {history.length > 0 && (
            <button
              onClick={handleClear}
              className="btn-ghost text-red-600 hover:bg-red-50"
            >
              <TrashIcon className="w-5 h-5" />
            </button>
          )}
        </div>
      </div>

      {/* Chat Area */}
      <div className="flex-1 card overflow-hidden flex flex-col">
        {/* Messages */}
        <div className="flex-1 overflow-y-auto p-4 space-y-4">
          {history.length === 0 && !isLoading ? (
            <div className="flex flex-col items-center justify-center h-full text-center">
              <div className="w-20 h-20 bg-primary-100 rounded-full flex items-center justify-center mb-4">
                <SparklesIcon className="w-10 h-10 text-primary-600" />
              </div>
              <h3 className="text-lg font-medium text-gray-900 mb-2">
                Xin chào! Tôi là Gia sư AI 🎓
              </h3>
              <p className="text-gray-500 max-w-md mb-6">
                Hãy hỏi tôi bất cứ điều gì về bài học. Tôi sẽ giải thích dễ hiểu nhất có thể!
              </p>
              
              {/* Quick Questions */}
              <div className="flex flex-wrap justify-center gap-2">
                {quickQuestions.map((q, i) => (
                  <button
                    key={i}
                    onClick={() => setMessage(q)}
                    className="px-4 py-2 bg-gray-100 hover:bg-gray-200 rounded-full text-sm text-gray-700 transition-colors"
                  >
                    {q}
                  </button>
                ))}
              </div>
            </div>
          ) : (
            <>
              <AnimatePresence>
                {history.map((msg, index) => (
                  <motion.div
                    key={msg.id || index}
                    initial={{ opacity: 0, y: 10 }}
                    animate={{ opacity: 1, y: 0 }}
                    exit={{ opacity: 0, y: -10 }}
                    className={`flex gap-3 ${
                      msg.role === 'user' ? 'flex-row-reverse' : ''
                    }`}
                  >
                    <div className={`w-10 h-10 rounded-full flex items-center justify-center flex-shrink-0 ${
                      msg.role === 'user' 
                        ? 'bg-primary-100' 
                        : 'bg-gradient-primary'
                    }`}>
                      {msg.role === 'user' ? (
                        <UserCircleIcon className="w-6 h-6 text-primary-600" />
                      ) : (
                        <AcademicCapIcon className="w-6 h-6 text-white" />
                      )}
                    </div>
                    
                    <div className={`max-w-[70%] p-4 rounded-2xl ${
                      msg.role === 'user'
                        ? 'bg-primary-600 text-white rounded-tr-sm'
                        : 'bg-gray-100 text-gray-900 rounded-tl-sm'
                    }`}>
                      {msg.role === 'user' ? (
                        <p>{msg.content}</p>
                      ) : (
                        <div className="markdown-content prose prose-sm max-w-none">
                          <ReactMarkdown>{msg.content}</ReactMarkdown>
                        </div>
                      )}
                    </div>
                  </motion.div>
                ))}
              </AnimatePresence>

              {/* Typing indicator */}
              {sendMutation.isLoading && (
                <motion.div
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 1 }}
                  className="flex gap-3"
                >
                  <div className="w-10 h-10 rounded-full bg-gradient-primary flex items-center justify-center">
                    <AcademicCapIcon className="w-6 h-6 text-white" />
                  </div>
                  <div className="bg-gray-100 rounded-2xl rounded-tl-sm p-4">
                    <div className="loading-dots text-gray-500">
                      <span></span>
                      <span></span>
                      <span></span>
                    </div>
                  </div>
                </motion.div>
              )}

              <div ref={messagesEndRef} />
            </>
          )}
        </div>

        {/* Input Area */}
        <div className="border-t border-gray-100 p-4">
          <form onSubmit={handleSend} className="flex gap-3">
            <input
              type="text"
              value={message}
              onChange={(e) => setMessage(e.target.value)}
              placeholder="Nhập câu hỏi của bạn..."
              className="input flex-1"
              disabled={sendMutation.isLoading}
            />
            <button
              type="submit"
              disabled={!message.trim() || sendMutation.isLoading}
              className="btn-primary px-6 disabled:opacity-50 disabled:cursor-not-allowed"
            >
              <PaperAirplaneIcon className="w-5 h-5" />
            </button>
          </form>
          
          {selectedLesson && (
            <p className="text-xs text-gray-400 mt-2">
              Đang hỏi trong ngữ cảnh: {lessons.find(l => l.id === selectedLesson)?.title}
            </p>
          )}
        </div>
      </div>
    </div>
  );
};

export default Chat;
