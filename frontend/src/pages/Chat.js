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
  AcademicCapIcon,
  BookOpenIcon,
  PhotoIcon,
  XMarkIcon
} from '@heroicons/react/24/outline';
import MathRenderer from '../components/MathRenderer';
import toast from 'react-hot-toast';

const Chat = () => {
  const { user } = useAuth();
  const queryClient = useQueryClient();
  const [message, setMessage] = useState('');
  const [selectedLesson, setSelectedLesson] = useState(null);
  const [localMessages, setLocalMessages] = useState([]);
  const [isWaitingResponse, setIsWaitingResponse] = useState(false);
  const [selectedImage, setSelectedImage] = useState(null);
  const [imagePreview, setImagePreview] = useState(null);
  const messagesEndRef = useRef(null);
  const fileInputRef = useRef(null);

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

  // Sync local messages with history, preserving imagePreview for temp messages
  useEffect(() => {
    setLocalMessages(prev => {
      // Keep temp messages with imagePreview that aren't in history yet
      const tempWithImages = prev.filter(m => m.id?.startsWith('temp-') && m.imagePreview);
      
      // Merge: history first, then any remaining temp messages with images
      const remainingTemp = tempWithImages.filter(t => {
        // Check if this temp message content exists in history
        return !history.some(h => h.content === t.content && h.role === 'user');
      });
      
      return [...history, ...remainingTemp];
    });
  }, [history]);

  // Send message mutation
  const sendMutation = useMutation(
    (data) => chatAPI.sendMessage(data),
    {
      onSuccess: () => {
        queryClient.invalidateQueries(['chat-history', user?.id]);
        setIsWaitingResponse(false);
      },
      onError: () => {
        toast.error('Lỗi gửi tin nhắn');
        setIsWaitingResponse(false);
      }
    }
  );

  // Send message with image mutation
  const sendImageMutation = useMutation(
    (formData) => chatAPI.sendMessageWithImage(formData),
    {
      onSuccess: () => {
        queryClient.invalidateQueries(['chat-history', user?.id]);
        setIsWaitingResponse(false);
      },
      onError: (error) => {
        toast.error(error.response?.data?.error || 'Lỗi xử lý ảnh');
        setIsWaitingResponse(false);
      }
    }
  );

  // Clear history mutation
  const clearMutation = useMutation(
    () => chatAPI.clearHistory(user.id),
    {
      onSuccess: () => {
        queryClient.invalidateQueries(['chat-history', user?.id]);
        setLocalMessages([]);
        toast.success('Đã xóa lịch sử chat');
      }
    }
  );

  // Auto scroll to bottom
  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [localMessages, isWaitingResponse]);

  // Handle image selection
  const handleImageSelect = (e) => {
    const file = e.target.files[0];
    if (file) {
      if (!file.type.startsWith('image/')) {
        toast.error('Vui lòng chọn file ảnh');
        return;
      }
      if (file.size > 10 * 1024 * 1024) {
        toast.error('Ảnh quá lớn (tối đa 10MB)');
        return;
      }
      setSelectedImage(file);
      setImagePreview(URL.createObjectURL(file));
    }
  };

  // Remove selected image
  const handleRemoveImage = () => {
    setSelectedImage(null);
    setImagePreview(null);
    if (fileInputRef.current) {
      fileInputRef.current.value = '';
    }
  };

  const handleSend = (e) => {
    e.preventDefault();
    if (isWaitingResponse) return;
    if (!message.trim() && !selectedImage) return;

    const userContent = selectedImage 
      ? `📷 ${message.trim() || 'Giải bài tập này giúp em'}`
      : message.trim();

    const userMessage = {
      id: `temp-${Date.now()}`,
      role: 'user',
      content: userContent,
      hasImage: !!selectedImage,
      imagePreview: imagePreview,
      timestamp: new Date().toISOString()
    };

    // Add user message immediately to local state
    setLocalMessages(prev => [...prev, userMessage]);
    setMessage('');
    setIsWaitingResponse(true);

    // Clear input preview but keep in message
    const imageToSend = selectedImage;
    setSelectedImage(null);
    setImagePreview(null);
    if (fileInputRef.current) {
      fileInputRef.current.value = '';
    }

    if (imageToSend) {
      // Send with image
      const formData = new FormData();
      formData.append('image', imageToSend);
      formData.append('message', message.trim() || 'Giải bài tập này giúp em');
      if (selectedLesson) {
        formData.append('lessonId', selectedLesson);
      }
      sendImageMutation.mutate(formData);
    } else {
      // Send text only
      sendMutation.mutate({
        message: message.trim(),
        lessonId: selectedLesson
      });
    }
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
    <div className="h-screen flex flex-col">
      {/* Header */}
      <div className="flex items-center justify-between p-4 border-b border-white/5">
        <div>
          <h1 className="text-xl font-display font-bold text-white flex items-center gap-3">
            <div className="w-9 h-9 bg-gradient-to-br from-cyan-500 to-blue-500 rounded-xl flex items-center justify-center">
              <SparklesIcon className="w-5 h-5 text-white" />
            </div>
            Hỏi đáp AI
          </h1>
        </div>
        
        <div className="flex items-center gap-3">
          {/* Lesson Selector */}
          <div className="relative">
            <BookOpenIcon className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-500" />
            <select
              value={selectedLesson || ''}
              onChange={(e) => setSelectedLesson(e.target.value || null)}
              className="pl-10 pr-4 py-2 bg-white/5 border border-white/10 rounded-xl text-white text-sm focus:outline-none focus:border-cyan-500/50 appearance-none cursor-pointer"
            >
              <option value="" className="bg-gray-900">Không chọn bài học</option>
              {lessons.map(lesson => (
                <option key={lesson.id} value={lesson.id} className="bg-gray-900">
                  {lesson.title}
                </option>
              ))}
            </select>
          </div>

          {localMessages.length > 0 && (
            <button
              onClick={handleClear}
              className="p-2 bg-red-500/10 border border-red-500/20 rounded-xl text-red-400 hover:bg-red-500/20 transition-colors"
            >
              <TrashIcon className="w-5 h-5" />
            </button>
          )}
        </div>
      </div>

      {/* Chat Area */}
      <div className="flex-1 overflow-hidden flex flex-col">
        {/* Messages */}
        <div className="flex-1 overflow-y-auto p-4 space-y-4 flex flex-col">
          {localMessages.length === 0 && !isLoading ? (
            <div className="flex-1 flex flex-col items-center justify-center text-center">
              <div className="w-20 h-20 bg-gradient-to-br from-cyan-500/20 to-blue-500/20 rounded-2xl flex items-center justify-center mb-4">
                <SparklesIcon className="w-10 h-10 text-cyan-400" />
              </div>
              <h3 className="text-xl font-semibold text-white mb-2">
                Xin chào! Tôi là Edumentor 🎓
              </h3>
              <p className="text-gray-400 max-w-md mb-6">
                Hãy hỏi tôi bất cứ điều gì về bài học. Tôi sẽ giải thích dễ hiểu nhất có thể!
              </p>
              
              {/* Quick Questions */}
              <div className="flex flex-wrap justify-center gap-2">
                {quickQuestions.map((q, i) => (
                  <button
                    key={i}
                    onClick={() => setMessage(q)}
                    className="px-4 py-2 bg-white/5 border border-white/10 hover:border-cyan-500/50 hover:bg-white/10 rounded-full text-sm text-gray-300 transition-all"
                  >
                    {q}
                  </button>
                ))}
              </div>
            </div>
          ) : (
            <>
              <div className="flex-1" />
              <AnimatePresence>
                {localMessages.map((msg, index) => (
                  <motion.div
                    key={msg.id || index}
                    initial={{ opacity: 0, y: 10 }}
                    animate={{ opacity: 1, y: 0 }}
                    exit={{ opacity: 0, y: -10 }}
                    className={`flex gap-3 ${
                      msg.role === 'user' ? 'flex-row-reverse' : ''
                    }`}
                  >
                    <div className={`w-10 h-10 rounded-xl flex items-center justify-center flex-shrink-0 ${
                      msg.role === 'user' 
                        ? 'bg-purple-500/20' 
                        : 'bg-gradient-to-br from-cyan-500 to-blue-500'
                    }`}>
                      {msg.role === 'user' ? (
                        <UserCircleIcon className="w-6 h-6 text-purple-400" />
                      ) : (
                        <AcademicCapIcon className="w-6 h-6 text-white" />
                      )}
                    </div>
                    
                    <div className={`max-w-[70%] p-4 rounded-2xl ${
                      msg.role === 'user'
                        ? 'bg-gradient-to-r from-purple-500 to-pink-500 text-white rounded-tr-sm'
                        : 'bg-white/5 border border-white/10 rounded-tl-sm'
                    }`}>
                      {msg.role === 'user' ? (
                        <div>
                          {/* Show image if exists */}
                          {(msg.imageUrl || msg.imagePreview) && (
                            <div className="mb-2">
                              <img 
                                src={msg.imagePreview || msg.imageUrl} 
                                alt="Bài tập" 
                                className="max-h-48 rounded-lg"
                              />
                            </div>
                          )}
                          <p>{msg.content}</p>
                        </div>
                      ) : (
                        <div className="markdown-content prose prose-sm max-w-none prose-p:text-gray-200 prose-headings:text-white prose-strong:text-white prose-code:text-cyan-400 prose-li:text-gray-200 prose-a:text-cyan-400">
                          <MathRenderer content={msg.content} className="prose-sm" />
                        </div>
                      )}
                    </div>
                  </motion.div>
                ))}
              </AnimatePresence>

              {/* Typing indicator */}
              {isWaitingResponse && (
                <motion.div
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 1 }}
                  className="flex gap-3"
                >
                  <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-cyan-500 to-blue-500 flex items-center justify-center">
                    <AcademicCapIcon className="w-6 h-6 text-white" />
                  </div>
                  <div className="bg-white/5 border border-white/10 rounded-2xl rounded-tl-sm p-4">
                    <div className="flex gap-1">
                      <motion.span
                        animate={{ opacity: [0.4, 1, 0.4] }}
                        transition={{ duration: 1, repeat: Infinity, delay: 0 }}
                        className="w-2 h-2 bg-cyan-400 rounded-full"
                      />
                      <motion.span
                        animate={{ opacity: [0.4, 1, 0.4] }}
                        transition={{ duration: 1, repeat: Infinity, delay: 0.2 }}
                        className="w-2 h-2 bg-cyan-400 rounded-full"
                      />
                      <motion.span
                        animate={{ opacity: [0.4, 1, 0.4] }}
                        transition={{ duration: 1, repeat: Infinity, delay: 0.4 }}
                        className="w-2 h-2 bg-cyan-400 rounded-full"
                      />
                    </div>
                  </div>
                </motion.div>
              )}

              <div ref={messagesEndRef} />
            </>
          )}
        </div>

        {/* Input Area */}
        <div className="border-t border-white/10 p-4 bg-gray-900/80">
          {/* Image Preview */}
          {imagePreview && (
            <div className="max-w-4xl mx-auto mb-3">
              <div className="relative inline-block">
                <img 
                  src={imagePreview} 
                  alt="Preview" 
                  className="max-h-32 rounded-lg border border-white/20"
                />
                <button
                  type="button"
                  onClick={handleRemoveImage}
                  className="absolute -top-2 -right-2 w-6 h-6 bg-red-500 rounded-full flex items-center justify-center hover:bg-red-600 transition-colors"
                >
                  <XMarkIcon className="w-4 h-4 text-white" />
                </button>
              </div>
              <p className="text-xs text-gray-400 mt-1">📷 Ảnh bài tập đã chọn</p>
            </div>
          )}

          <form onSubmit={handleSend} className="flex gap-3 max-w-4xl mx-auto">
            {/* Hidden file input */}
            <input
              type="file"
              ref={fileInputRef}
              onChange={handleImageSelect}
              accept="image/*"
              className="hidden"
            />
            
            {/* Image upload button */}
            <button
              type="button"
              onClick={() => fileInputRef.current?.click()}
              disabled={isWaitingResponse}
              className="px-4 py-3 bg-white/5 border border-white/10 rounded-xl text-gray-400 hover:text-cyan-400 hover:border-cyan-500/50 disabled:opacity-50 disabled:cursor-not-allowed transition-all"
              title="Upload ảnh bài tập"
            >
              <PhotoIcon className="w-5 h-5" />
            </button>

            <input
              type="text"
              value={message}
              onChange={(e) => setMessage(e.target.value)}
              placeholder={selectedImage ? "Hỏi về bài tập trong ảnh..." : "Nhập câu hỏi của bạn..."}
              className="flex-1 px-4 py-3 bg-white/5 border border-white/10 rounded-xl text-white placeholder-gray-500 focus:outline-none focus:border-cyan-500/50"
              disabled={isWaitingResponse}
            />
            <button
              type="submit"
              disabled={(!message.trim() && !selectedImage) || isWaitingResponse}
              className="px-6 py-3 bg-gradient-to-r from-cyan-500 to-blue-500 rounded-xl text-white font-medium disabled:opacity-50 disabled:cursor-not-allowed hover:shadow-lg hover:shadow-cyan-500/25 transition-all"
            >
              <PaperAirplaneIcon className="w-5 h-5" />
            </button>
          </form>
          
          {selectedLesson && (
            <p className="text-xs text-gray-500 mt-2 flex items-center justify-center gap-1">
              <BookOpenIcon className="w-4 h-4" />
              Đang hỏi trong ngữ cảnh: {lessons.find(l => l.id === selectedLesson)?.title}
            </p>
          )}
        </div>
      </div>
    </div>
  );
};

export default Chat;
