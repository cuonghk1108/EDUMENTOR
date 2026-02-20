import React, { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { XMarkIcon, SparklesIcon } from '@heroicons/react/24/outline';
import { getRandomTip } from '../utils/engagement';

/**
 * Welcome Modal for first-time users
 * Shows onboarding and motivational message
 */
const WelcomeModal = ({ isOpen, onClose, userName }) => {
  const [tip] = useState(getRandomTip());
  
  if (!isOpen) return null;

  return (
    <AnimatePresence>
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        exit={{ opacity: 0 }}
        className="fixed inset-0 bg-black/60 backdrop-blur-sm z-50 flex items-center justify-center p-4"
        onClick={onClose}
      >
        <motion.div
          initial={{ scale: 0.9, opacity: 0, y: 20 }}
          animate={{ scale: 1, opacity: 1, y: 0 }}
          exit={{ scale: 0.9, opacity: 0, y: 20 }}
          transition={{ type: "spring", damping: 25, stiffness: 300 }}
          className="bg-gradient-to-br from-gray-900 via-purple-900/50 to-gray-900 rounded-3xl max-w-2xl w-full relative overflow-hidden border border-white/10"
          onClick={(e) => e.stopPropagation()}
        >
          {/* Animated background */}
          <div className="absolute inset-0 opacity-30">
            <div className="absolute top-0 left-1/4 w-96 h-96 bg-purple-500/30 rounded-full blur-3xl animate-pulse" />
            <div className="absolute bottom-0 right-1/4 w-96 h-96 bg-pink-500/30 rounded-full blur-3xl animate-pulse" style={{ animationDelay: '1s' }} />
          </div>

          {/* Close button */}
          <button
            onClick={onClose}
            className="absolute top-4 right-4 p-2 rounded-xl bg-white/5 hover:bg-white/10 transition-colors z-10"
          >
            <XMarkIcon className="w-5 h-5 text-gray-400" />
          </button>

          {/* Content */}
          <div className="relative p-8 text-center">
            {/* Icon */}
            <motion.div
              initial={{ scale: 0 }}
              animate={{ scale: 1 }}
              transition={{ delay: 0.2, type: "spring" }}
              className="w-24 h-24 mx-auto mb-6 bg-gradient-to-br from-purple-500 to-pink-500 rounded-full flex items-center justify-center shadow-2xl shadow-purple-500/50"
            >
              <SparklesIcon className="w-12 h-12 text-white" />
            </motion.div>

            {/* Greeting */}
            <motion.h1
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.3 }}
              className="text-3xl font-display font-bold text-white mb-3"
            >
              Chào mừng đến Edumentor! 🎉
            </motion.h1>

            <motion.p
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.4 }}
              className="text-xl text-purple-300 mb-6"
            >
              Xin chào <span className="font-bold text-transparent bg-clip-text bg-gradient-to-r from-purple-400 to-pink-400">{userName}</span>!
            </motion.p>

            {/* Motivational tip */}
            <motion.div
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.5 }}
              className="bg-white/5 backdrop-blur-sm rounded-2xl p-6 mb-8 border border-white/10"
            >
              <div className="text-5xl mb-4">{tip.icon}</div>
              <p className="text-lg text-gray-200 italic mb-2">
                {tip.text}
              </p>
              <p className="text-sm text-purple-400">— {tip.author}</p>
            </motion.div>

            {/* Features highlight */}
            <motion.div
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.6 }}
              className="grid grid-cols-3 gap-4 mb-8"
            >
              {[
                { icon: '📚', text: 'Học thông minh' },
                { icon: '🎯', text: 'Nhiệm vụ hàng ngày' },
                { icon: '🏆', text: 'Huy hiệu thành tích' }
              ].map((item, index) => (
                <div key={index} className="flex flex-col items-center gap-2">
                  <div className="text-3xl">{item.icon}</div>
                  <p className="text-sm text-gray-300">{item.text}</p>
                </div>
              ))}
            </motion.div>

            {/* CTA */}
            <motion.button
              initial={{ opacity: 0, scale: 0.9 }}
              animate={{ opacity: 1, scale: 1 }}
              transition={{ delay: 0.7, type: "spring" }}
              whileHover={{ scale: 1.05 }}
              whileTap={{ scale: 0.95 }}
              onClick={onClose}
              className="px-8 py-4 bg-gradient-to-r from-purple-500 to-pink-500 rounded-xl text-white font-bold text-lg shadow-2xl shadow-purple-500/50 hover:shadow-purple-500/70 transition-shadow"
            >
              Bắt đầu học ngay! 🚀
            </motion.button>
          </div>
        </motion.div>
      </motion.div>
    </AnimatePresence>
  );
};

export default WelcomeModal;
