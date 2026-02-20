import React from 'react';
import { motion } from 'framer-motion';
import { LockClosedIcon } from '@heroicons/react/24/outline';
import { ACHIEVEMENTS, checkAchievementUnlock } from '../utils/engagement';

/**
 * Achievement Badges Component
 * Shows unlocked and locked achievements
 */
const AchievementBadges = ({ userStats }) => {
  const achievementsWithStatus = ACHIEVEMENTS.map(ach => ({
    ...ach,
    unlocked: checkAchievementUnlock(ach, userStats)
  }));

  const unlockedCount = achievementsWithStatus.filter(a => a.unlocked).length;
  const progress = ((unlockedCount / ACHIEVEMENTS.length) * 100).toFixed(0);

  return (
    <div className="bg-gray-900/50 border border-white/5 rounded-2xl p-6">
      {/* Header */}
      <div className="mb-6">
        <div className="flex items-center justify-between mb-3">
          <h3 className="text-xl font-bold text-white flex items-center gap-2">
            🏆 Huy hiệu thành tích
          </h3>
          <span className="text-sm font-medium text-purple-400">
            {unlockedCount}/{ACHIEVEMENTS.length}
          </span>
        </div>

        {/* Progress bar */}
        <div className="relative h-2 bg-white/10 rounded-full overflow-hidden">
          <motion.div
            initial={{ width: 0 }}
            animate={{ width: `${progress}%` }}
            transition={{ duration: 1, ease: "easeOut" }}
            className="absolute inset-y-0 left-0 bg-gradient-to-r from-purple-500 to-pink-500 rounded-full"
          />
        </div>
        <p className="text-xs text-gray-400 mt-2">
          {progress}% hoàn thành • Mở khóa thành tích mới bằng cách học tập đều đặn!
        </p>
      </div>

      {/* Badges grid */}
      <div className="grid grid-cols-4 md:grid-cols-4 gap-4">
        {achievementsWithStatus.map((achievement, index) => (
          <motion.div
            key={achievement.id}
            initial={{ opacity: 0, scale: 0.8 }}
            animate={{ opacity: 1, scale: 1 }}
            transition={{ delay: index * 0.05 }}
            whileHover={{ scale: achievement.unlocked ? 1.1 : 1.05 }}
            className={`relative group cursor-pointer ${
              achievement.unlocked ? '' : 'opacity-50'
            }`}
          >
            {/* Badge */}
            <div className={`aspect-square rounded-2xl border-2 flex items-center justify-center text-4xl transition-all duration-300 ${
              achievement.unlocked
                ? 'border-purple-500/50 bg-gradient-to-br from-purple-500/20 to-pink-500/20 shadow-lg shadow-purple-500/20'
                : 'border-white/10 bg-white/5 grayscale'
            }`}>
              {achievement.unlocked ? (
                achievement.icon
              ) : (
                <LockClosedIcon className="w-8 h-8 text-gray-600" />
              )}
            </div>

            {/* Tooltip */}
            <div className="absolute bottom-full left-1/2 -translate-x-1/2 mb-2 opacity-0 group-hover:opacity-100 transition-opacity pointer-events-none z-10">
              <div className="bg-gray-900 border border-white/10 rounded-xl p-3 shadow-2xl min-w-[200px]">
                <div className="flex items-center gap-2 mb-1">
                  <span className="text-2xl">{achievement.icon}</span>
                  <span className={`text-sm font-bold ${
                    achievement.unlocked ? 'text-purple-400' : 'text-gray-400'
                  }`}>
                    {achievement.title}
                  </span>
                </div>
                <p className="text-xs text-gray-400">
                  {achievement.description}
                </p>
                {achievement.unlocked && (
                  <div className="mt-2 text-xs text-green-400 flex items-center gap-1">
                    ✓ Đã mở khóa
                  </div>
                )}
              </div>
              {/* Arrow */}
              <div className="absolute top-full left-1/2 -translate-x-1/2 w-0 h-0 border-l-4 border-r-4 border-t-4 border-transparent border-t-gray-900" />
            </div>
          </motion.div>
        ))}
      </div>

      {/* Achievement hint */}
      {unlockedCount < ACHIEVEMENTS.length && (
        <div className="mt-6 p-4 bg-white/5 rounded-xl border border-white/10">
          <div className="flex items-start gap-3">
            <div className="text-2xl">💡</div>
            <div className="flex-1">
              <p className="text-sm text-gray-300 font-medium mb-1">
                Mẹo mở khóa thành tích
              </p>
              <p className="text-xs text-gray-400">
                Học đều đặn mỗi ngày, hoàn thành quiz và tương tác với AI để mở khóa thêm nhiều huy hiệu!
              </p>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default AchievementBadges;
