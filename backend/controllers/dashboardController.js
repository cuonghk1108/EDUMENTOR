const { learningStatsService, lessonService, quizService, streakService, chatService } = require('../services/firebaseService');

/**
 * Get dashboard data for user
 */
exports.getDashboard = async (req, res) => {
  try {
    const { userId } = req.params;

    // Get learning stats
    const stats = await learningStatsService.getByUserId(userId);

    // Get streak data
    const streakData = await streakService.checkAndUpdateStreak(userId);

    // Get recent lessons
    const recentLessons = await lessonService.getByUserId(userId, 5);

    // Get recent quizzes with results
    const recentQuizzes = await quizService.getByUserId(userId, 5);
    
    // Get all quizzes for counting perfect scores
    const allQuizzes = await quizService.getByUserId(userId, 1000);
    
    // Count perfect scores (100%)
    const perfectScores = allQuizzes.filter(quiz => {
      if (!quiz.result) return false;
      const score = (quiz.result.correctAnswers / quiz.result.totalQuestions) * 100;
      return score === 100;
    }).length;
    
    // Count chat messages
    const chatHistory = await chatService.getByUserId(userId, 10000);
    const totalMessages = chatHistory.filter(msg => msg.role === 'user').length;
    
    // Track study time patterns (for early bird / night owl badges)
    const studyTimes = allQuizzes
      .filter(q => q.createdAt)
      .map(q => new Date(q.createdAt).getHours());
    
    const earlyMorningStudies = studyTimes.filter(hour => hour >= 5 && hour < 8).length;
    const lateNightStudies = studyTimes.filter(hour => hour >= 22 || hour < 5).length;

    // Calculate progress
    const completionRate = stats.totalLessons > 0
      ? Math.round((stats.completedLessons / stats.totalLessons) * 100)
      : 0;

    // Build dashboard response
    const dashboard = {
      overview: {
        totalLessons: stats.totalLessons,
        completedLessons: stats.completedLessons,
        completionRate,
        totalQuizzes: stats.totalQuizzes,
        averageScore: stats.averageScore,
        streakDays: streakData.currentStreak || 0,
        longestStreak: streakData.longestStreak || 0,
        totalStudyDays: streakData.totalStudyDays || 0
      },
      performance: {
        totalCorrect: stats.totalCorrect,
        totalQuestions: stats.totalQuestions,
        accuracy: stats.totalQuestions > 0
          ? Math.round((stats.totalCorrect / stats.totalQuestions) * 100)
          : 0
      },
      // Engagement metrics for gamification
      engagement: {
        totalMessages,
        perfectScores,
        earlyMorningStudies,
        lateNightStudies
      },
      weaknesses: stats.weakTopics || [],
      strengths: stats.strongTopics || [],
      recentActivity: {
        lessons: recentLessons.map(l => ({
          id: l.id,
          title: l.title,
          subject: l.subject,
          completed: l.completed,
          createdAt: l.createdAt
        })),
        quizzes: recentQuizzes.map(q => ({
          id: q.id,
          topic: q.topic,
          totalQuestions: q.totalQuestions,
          createdAt: q.createdAt
        }))
      },
      topicStats: stats.topicStats || {},
      lastActiveDate: stats.lastActiveDate,
      // Thêm streak data
      streak: {
        current: streakData.currentStreak,
        longest: streakData.longestStreak,
        totalDays: streakData.totalStudyDays,
        lastStudyDate: streakData.lastStudyDate
      }
    };

    res.json({
      success: true,
      dashboard
    });
  } catch (error) {
    console.error('Get dashboard error:', error);
    res.status(500).json({ error: error.message });
  }
};

/**
 * Get detailed analytics
 */
exports.getAnalytics = async (req, res) => {
  try {
    const { userId } = req.params;
    const { period } = req.query; // week, month, all

    const stats = await learningStatsService.getByUserId(userId);

    // Calculate analytics
    const analytics = {
      summary: {
        totalStudyTime: 0, // Would need to track this
        lessonsCompleted: stats.completedLessons,
        quizzesTaken: stats.totalQuizzes,
        averageScore: stats.averageScore
      },
      byTopic: Object.entries(stats.topicStats || {}).map(([topic, data]) => ({
        topic,
        attempts: data.attempts,
        accuracy: Math.round((data.correct / data.total) * 100),
        totalQuestions: data.total,
        correctAnswers: data.correct
      })),
      trends: {
        // Would need historical data for trends
        improving: stats.weakTopics.length < 3,
        recommendation: stats.weakTopics.length > 0
          ? `Tập trung vào: ${stats.weakTopics.map(t => t.name).join(', ')}`
          : 'Tiếp tục duy trì phong độ!'
      }
    };

    res.json({
      success: true,
      analytics
    });
  } catch (error) {
    console.error('Get analytics error:', error);
    res.status(500).json({ error: error.message });
  }
};

/**
 * Get learning stats
 */
exports.getLearningStats = async (req, res) => {
  try {
    const { userId } = req.params;

    const stats = await learningStatsService.getByUserId(userId);

    res.json({
      success: true,
      stats
    });
  } catch (error) {
    console.error('Get stats error:', error);
    res.status(500).json({ error: error.message });
  }
};
