const { learningStatsService, lessonService, quizService } = require('../services/firebaseService');

/**
 * Get dashboard data for user
 */
exports.getDashboard = async (req, res) => {
  try {
    const { userId } = req.params;

    // Get learning stats
    const stats = await learningStatsService.getByUserId(userId);

    // Get recent lessons
    const recentLessons = await lessonService.getByUserId(userId, 5);

    // Get recent quizzes
    const recentQuizzes = await quizService.getByUserId(userId, 5);

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
        streakDays: stats.streakDays || 0
      },
      performance: {
        totalCorrect: stats.totalCorrect,
        totalQuestions: stats.totalQuestions,
        accuracy: stats.totalQuestions > 0
          ? Math.round((stats.totalCorrect / stats.totalQuestions) * 100)
          : 0
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
      lastActiveDate: stats.lastActiveDate
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
