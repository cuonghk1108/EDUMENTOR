import React, { useState } from 'react';
import { motion } from 'framer-motion';
import {
  XMarkIcon,
  SparklesIcon,
  ArrowPathIcon
} from '@heroicons/react/24/outline';
import toast from 'react-hot-toast';

const CustomizePromptModal = ({ isOpen, onClose, onSubmit, isLoading, lessonTitle }) => {
  const [prompt, setPrompt] = useState('');

  const handleSubmit = async () => {
    if (!prompt.trim()) {
      toast.error('Vui lòng nhập yêu cầu');
      return;
    }

    await onSubmit(prompt);
    setPrompt('');
  };

  const suggestions = [
    '📖 Giải thích chi tiết hơn, thêm ví dụ thực tế',
    '🔬 Giải thích lý thuyết, bằng chứng khoa học',
    '⚡ Giải thích cách làm nhanh, trick làm bài',
    '❓ Giải thích các lỗi sai thường gặp',
    '🎯 Tóm tắt ngắn gọn, yếu tố chính',
    '📊 Thêm bảng, sơ đồ, hình vẽ minh họa',
    '🗣️ Dùng ngôn ngữ đơn giản, dễ hiểu hơn',
    '🔗 Liên hệ với bài học trước, sau'
  ];

  if (!isOpen) return null;

  return (
    <>
      {/* Overlay */}
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        exit={{ opacity: 0 }}
        onClick={onClose}
        className="fixed inset-0 bg-black/50 z-40"
      />

      {/* Modal */}
      <motion.div
        initial={{ opacity: 0, scale: 0.95, y: 20 }}
        animate={{ opacity: 1, scale: 1, y: 0 }}
        exit={{ opacity: 0, scale: 0.95, y: 20 }}
        className="fixed inset-0 z-50 flex items-center justify-center p-4"
      >
        <div className="bg-white rounded-2xl shadow-xl max-w-2xl w-full max-h-[90vh] overflow-y-auto">
          {/* Header */}
          <div className="sticky top-0 bg-white border-b border-gray-200 p-6 flex items-center justify-between">
            <div>
              <h2 className="text-2xl font-bold text-gray-900 flex items-center gap-2">
                <SparklesIcon className="w-6 h-6 text-primary-600" />
                Yêu cầu dạy thêm
              </h2>
              <p className="text-sm text-gray-500 mt-1">
                Yêu cầu AI giảng dạy bài "{lessonTitle}" theo cách của bạn
              </p>
            </div>
            <button
              onClick={onClose}
              className="p-2 rounded-lg text-gray-400 hover:bg-gray-100"
            >
              <XMarkIcon className="w-6 h-6" />
            </button>
          </div>

          {/* Content */}
          <div className="p-6 space-y-6">
            {/* Input */}
            <div>
              <label className="label mb-3">Yêu cầu của bạn *</label>
              <textarea
                value={prompt}
                onChange={(e) => setPrompt(e.target.value)}
                placeholder="VD: Giải thích chi tiết hơn, thêm ví dụ thực tế về...
Hoặc: Dạy cách làm nhanh, có trick gì không?
Hoặc: Tôi không hiểu phần này, có cách giải thích khác không?"
                className="w-full border border-gray-300 rounded-lg p-4 focus:outline-none focus:ring-2 focus:ring-primary-500 resize-none h-32"
              />
              <p className="text-xs text-gray-500 mt-2">
                Càng chi tiết, AI sẽ dạy càng phù hợp với nhu cầu của bạn
              </p>
            </div>

            {/* Suggestions */}
            <div>
              <p className="text-sm font-medium text-gray-700 mb-3">💡 Gợi ý:</p>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-2">
                {suggestions.map((suggestion, index) => (
                  <button
                    key={index}
                    onClick={() => setPrompt(suggestion)}
                    className="text-left p-3 bg-gray-50 hover:bg-primary-50 rounded-lg transition-colors border border-gray-200 hover:border-primary-300"
                  >
                    <p className="text-sm text-gray-700 hover:text-primary-700">
                      {suggestion}
                    </p>
                  </button>
                ))}
              </div>
            </div>

            {/* Info */}
            <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
              <p className="text-sm text-blue-800">
                <span className="font-medium">ℹ️ Lưu ý:</span> AI sẽ tạo một phiên bản mới của bài giảng theo yêu cầu của bạn. Quá trình này có thể mất 30-60 giây.
              </p>
            </div>
          </div>

          {/* Footer */}
          <div className="sticky bottom-0 bg-gray-50 border-t border-gray-200 p-6 flex gap-3 justify-end">
            <button
              onClick={onClose}
              disabled={isLoading}
              className="btn-ghost disabled:opacity-50"
            >
              Huỷ
            </button>
            <button
              onClick={handleSubmit}
              disabled={isLoading || !prompt.trim()}
              className="btn-primary disabled:opacity-50 disabled:cursor-not-allowed flex items-center gap-2"
            >
              {isLoading ? (
                <>
                  <ArrowPathIcon className="w-5 h-5 animate-spin" />
                  Đang xử lý...
                </>
              ) : (
                <>
                  <SparklesIcon className="w-5 h-5" />
                  Tạo bài giảng mới
                </>
              )}
            </button>
          </div>
        </div>
      </motion.div>
    </>
  );
};

export default CustomizePromptModal;
