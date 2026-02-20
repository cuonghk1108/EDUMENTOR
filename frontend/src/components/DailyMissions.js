import React from 'react';
import { motion } from 'framer-motion';
import { CheckCircleIcon } from '@heroicons/react/24/solid';
import { DAILY_MISSIONS, checkMissionProgress } from '../utils/engagement';

/**
 * Daily Missions Component
 * Shows daily tasks for user engagement
 */
const DailyMissions = ({ userStats }) => {
  const missions = DAILY_MISSIONS.map(mission => ({
    ...mission,
    progress: checkMissionProgress(mission, userStats)
  }));

  const completedCount = missions.filter(m => m.progress.completed).length;
  const totalXP = missions.reduce((sum, m) => sum + (m.progress.completed ? m.xp : 0), 0);

  return (
    <div className="bg-gray-900/50 border border-white/5 rounded-2xl p-6">
      {/* Header */}
      <div className="flex items-center justify-between mb-6">
        <div>
          <h3 className="text-xl font-bold text-white flex items-center gap-2">
            🎯 Nhiệm vụ hôm nay
          </h3>
          <p className="text-sm text-gray-400 mt-1">
            Hoàn thành {completedCount}/{missions.length} nhiệm vụ • Kiếm được {totalXP} XP
          </p>
        </div>
        <motion.div
          className="text-4xl"
          animate={{ rotate: completedCount === missions.length ? [0, 15, -15, 0] : 0 }}
          transition={{ duration: 0.5 }}
        >
          {completedCount === missions.length ? '🎉' : '💪'}
        </motion.div>
      </div>

      {/* Missions list */}
      <div className="space-y-3">
        {missions.map((mission, index) => (
          <motion.div
            key={mission.id}
            initial={{ opacity: 0, x: -20 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ delay: index * 0.05 }}
            className={`relative overflow-hidden rounded-xl border transition-all duration-300 ${
              mission.progress.completed
                ? 'border-green-500/30 bg-green-500/10'
                : 'border-white/10 bg-white/5 hover:bg-white/10'
            }`}
          >
            {/* Progress bar background */}
            <div
              className="absolute inset-0 bg-gradient-to-r from-purple-500/20 to-pink-500/20 transition-all duration-500"
              style={{
                width: `${Math.min((mission.progress.current / mission.progress.target) * 100, 100)}%`
              }}
            />

            <div className="relative p-4 flex items-center gap-4">
              {/* Icon */}
              <div className={`text-3xl ${mission.progress.completed ? 'animate-bounce' : ''}`}>
                {mission.icon}
              </div>

              {/* Content */}
              <div className="flex-1 min-w-0">
                <div className="flex items-center gap-2 mb-1">
                  <h4 className="font-semibold text-white truncate">{mission.title}</h4>
                  {mission.progress.completed && (
                    <CheckCircleIcon className="w-5 h-5 text-green-400 flex-shrink-0" />
                  )}
                </div>
                <p className="text-sm text-gray-400">{mission.description}</p>
              </div>

              {/* Progress indicator */}
              <div className="flex flex-col items-end gap-1 flex-shrink-0">
                <div className={`px-3 py-1 rounded-full text-xs font-bold ${
                  mission.progress.completed
                    ? 'bg-green-500 text-white'
                    : 'bg-purple-500/20 text-purple-300'
                }`}>
                  {mission.progress.completed ? (
                    `+${mission.xp} XP`
                  ) : (
                    `${mission.progress.current}/${mission.progress.target}`
                  )}
                </div>
              </div>
            </div>
          </motion.div>
        ))}
      </div>

      {/* All completed message */}
      {completedCount === missions.length && (
        <motion.div
          initial={{ opacity: 0, scale: 0.9 }}
          animate={{ opacity: 1, scale: 1 }}
          className="mt-6 p-4 bg-gradient-to-r from-green-500/20 to-emerald-500/20 rounded-xl border border-green-500/30 text-center"
        >
          <div className="text-2xl mb-2">🌟</div>
          <p className="text-green-400 font-bold">
            Hoàn thành tất cả nhiệm vụ! Tuyệt vời!
          </p>
          <p className="text-sm text-gray-400 mt-1">
            Quay lại vào ngày mai để nhận nhiệm vụ mới
          </p>
        </motion.div>
      )}
    </div>
  );
};

export default DailyMissions;
