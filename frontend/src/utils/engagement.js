/**
 * Engagement Features - Daily Missions, Achievements, Motivational System
 * Tăng động lực học tập cho học sinh
 */

// Daily Missions Configuration
export const DAILY_MISSIONS = [
  {
    id: 'complete_1_lesson',
    title: 'Hoàn thành 1 bài học',
    description: 'Học ít nhất 1 bài hôm nay',
    icon: '📚',
    xp: 50,
    target: 1,
    type: 'lessons'
  },
  {
    id: 'complete_3_quizzes',
    title: 'Làm 3 bài quiz',
    description: 'Làm 3 quiz trong ngày hôm nay',
    icon: '✅',
    xp: 100,
    target: 3,
    type: 'quizzes'
  },
  {
    id: 'maintain_streak',
    title: 'Duy trì streak',
    description: 'Giữ chuỗi học tập liên tục',
    icon: '🔥',
    xp: 30,
    target: 1,
    type: 'streak'
  },
  {
    id: 'chat_with_ai',
    title: 'Hỏi AI 5 câu',
    description: 'Gửi 5 tin nhắn với AI hôm nay',
    icon: '💬',
    xp: 40,
    target: 5,
    type: 'chat'
  },
  {
    id: 'score_above_80',
    title: 'Đạt điểm ≥80%',
    description: 'Đạt điểm cao trong quiz hôm nay',
    icon: '⭐',
    xp: 150,
    target: 80,
    type: 'score'
  }
];

// Achievement Badges
export const ACHIEVEMENTS = [
  {
    id: 'first_lesson',
    title: 'Khởi đầu',
    description: 'Hoàn thành bài học đầu tiên',
    icon: '🎓',
    unlockCondition: { lessons: 1 }
  },
  {
    id: 'streak_7',
    title: 'Tuần hoàn hảo',
    description: 'Học liên tục 7 ngày',
    icon: '🔥',
    unlockCondition: { streak: 7 }
  },
  {
    id: 'streak_30',
    title: 'Kiên trì tháng',
    description: 'Học liên tục 30 ngày',
    icon: '💎',
    unlockCondition: { streak: 30 }
  },
  {
    id: 'quiz_master',
    title: 'Quiz Master',
    description: 'Hoàn thành 50 quiz',
    icon: '🏆',
    unlockCondition: { quizzes: 50 }
  },
  {
    id: 'perfect_score',
    title: 'Hoàn hảo',
    description: 'Đạt 100% trong quiz',
    icon: '⭐',
    unlockCondition: { perfectScore: true }
  },
  {
    id: 'chat_enthusiast',
    title: 'Tò mò',
    description: 'Hỏi AI 100 câu',
    icon: '💭',
    unlockCondition: { chats: 100 }
  },
  {
    id: 'early_bird',
    title: 'Chim sớm',
    description: 'Học trước 7 giờ sáng',
    icon: '🌅',
    unlockCondition: { earlyBird: true }
  },
  {
    id: 'night_owl',
    title: 'Cú đêm',
    description: 'Học sau 11 giờ đêm',
    icon: '🦉',
    unlockCondition: { nightOwl: true }
  }
];

// Motivational Tips (rotate randomly)
export const MOTIVATIONAL_TIPS = [
  {
    text: '"Thành công là tổng của những nỗ lực nhỏ lặp đi lặp lại mỗi ngày"',
    author: 'Robert Collier',
    icon: '💪'
  },
  {
    text: '"Học hỏi không bao giờ là quá muộn"',
    author: 'Malcolm X',
    icon: '📖'
  },
  {
    text: '"Giáo dục là vũ khí mạnh nhất để thay đổi thế giới"',
    author: 'Nelson Mandela',
    icon: '🌍'
  },
  {
    text: '"Mỗi ngày học một điều mới là đầu tư tốt nhất cho tương lai"',
    author: 'Edumentor',
    icon: '💡'
  },
  {
    text: '"Thất bại là cơ hội để bắt đầu lại một cách thông minh hơn"',
    author: 'Henry Ford',
    icon: '🚀'
  },
  {
    text: '"Kiên trì là chìa khóa của mọi thành công"',
    author: 'Benjamin Franklin',
    icon: '🔑'
  },
  {
    text: '"Hãy học như thể bạn sẽ sống mãi"',
    author: 'Mahatma Gandhi',
    icon: '✨'
  },
  {
    text: '"Tri thức là kho báu duy nhất không ai có thể lấy đi"',
    author: 'Ngạn ngữ Việt',
    icon: '💎'
  }
];

/**
 * Check mission progress
 * Uses daily stats for accurate tracking
 */
export const checkMissionProgress = (mission, userStats) => {
  const { type, target } = mission;
  
  switch (type) {
    case 'lessons':
      // Check today's completed lessons
      return {
        current: userStats.todayLessons || 0,
        target,
        completed: (userStats.todayLessons || 0) >= target
      };
    case 'quizzes':
      // Check today's completed quizzes
      return {
        current: userStats.todayQuizzes || 0,
        target,
        completed: (userStats.todayQuizzes || 0) >= target
      };
    case 'streak':
      // Check current streak
      return {
        current: userStats.streakDays || 0,
        target,
        completed: (userStats.streakDays || 0) >= 1
      };
    case 'chat':
      // Check today's messages
      return {
        current: userStats.todayChats || 0,
        target,
        completed: (userStats.todayChats || 0) >= target
      };
    case 'score':
      // Check today's highest score
      return {
        current: userStats.highestScoreToday || 0,
        target,
        completed: (userStats.highestScoreToday || 0) >= target
      };
    default:
      return { current: 0, target, completed: false };
  }
};

/**
 * Check if achievement is unlocked
 */
export const checkAchievementUnlock = (achievement, userStats) => {
  const { unlockCondition } = achievement;
  
  if (unlockCondition.lessons) {
    return (userStats.completedLessons || 0) >= unlockCondition.lessons;
  }
  if (unlockCondition.streak) {
    return (userStats.streakDays || 0) >= unlockCondition.streak;
  }
  if (unlockCondition.quizzes) {
    return (userStats.completedQuizzes || 0) >= unlockCondition.quizzes;
  }
  if (unlockCondition.perfectScore) {
    return (userStats.perfectScores || 0) > 0;
  }
  if (unlockCondition.chats) {
    return (userStats.totalMessages || 0) >= unlockCondition.chats;
  }
  if (unlockCondition.earlyBird) {
    return (userStats.earlyMorningStudies || 0) > 0;
  }
  if (unlockCondition.nightOwl) {
    return (userStats.lateNightStudies || 0) > 0;
  }
  
  return false;
};

/**
 * Get random motivational tip
 */
export const getRandomTip = () => {
  return MOTIVATIONAL_TIPS[Math.floor(Math.random() * MOTIVATIONAL_TIPS.length)];
};

/**
 * Calculate total XP earned today
 */
export const calculateTodayXP = (userStats) => {
  let xp = 0;
  
  DAILY_MISSIONS.forEach(mission => {
    const progress = checkMissionProgress(mission, userStats);
    if (progress.completed) {
      xp += mission.xp;
    }
  });
  
  return xp;
};

/**
 * Get newly unlocked achievements
 */
export const getNewlyUnlockedAchievements = (userStats, previousUnlocked = []) => {
  const currentUnlocked = ACHIEVEMENTS.filter(ach => 
    checkAchievementUnlock(ach, userStats)
  ).map(ach => ach.id);
  
  return ACHIEVEMENTS.filter(ach => 
    currentUnlocked.includes(ach.id) && !previousUnlocked.includes(ach.id)
  );
};
