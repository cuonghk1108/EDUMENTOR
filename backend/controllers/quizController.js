const aiService = require('../services/aiService');
const { quizService, learningStatsService } = require('../services/firebaseService');

/**
 * Generate quiz from text content
 */
exports.generateQuiz = async (req, res) => {
  try {
    const { text, count, topic, lessonId } = req.body;
    const userId = req.userId;

    if (!text) {
      return res.status(400).json({ error: 'Vui lòng cung cấp nội dung' });
    }

    const questionCount = parseInt(count) || 5;

    // Generate quiz using AI
    const result = await aiService.generateQuiz(text, questionCount);

    // Save quiz to database
    const quizData = {
      userId,
      lessonId: lessonId || null,
      topic: result.quiz.topic || topic || 'Chung',
      questions: result.quiz.questions,
      totalQuestions: result.quiz.questions.length,
      createdAt: new Date()
    };

    const savedQuiz = await quizService.create(quizData);

    res.json({
      success: true,
      quiz: savedQuiz,
      usage: result.usage
    });
  } catch (error) {
    console.error('Generate quiz error:', error);
    res.status(500).json({ error: error.message });
  }
};

/**
 * Submit quiz answers
 */
exports.submitQuiz = async (req, res) => {
  try {
    const { quizId, answers } = req.body;
    const userId = req.userId;

    if (!quizId || !answers) {
      return res.status(400).json({ error: 'Vui lòng cung cấp đầy đủ thông tin' });
    }

    // Get quiz
    const quiz = await quizService.getById(quizId);
    if (!quiz) {
      return res.status(404).json({ error: 'Không tìm thấy bài quiz' });
    }

    // Calculate score
    let correctAnswers = 0;
    const results = quiz.questions.map((question, index) => {
      const userAnswer = answers[index] || answers[question.id];
      const isCorrect = userAnswer === question.answer;
      if (isCorrect) correctAnswers++;

      return {
        questionId: question.id,
        question: question.question,
        userAnswer,
        correctAnswer: question.answer,
        isCorrect,
        explanation: question.explanation
      };
    });

    const totalQuestions = quiz.questions.length;
    const score = Math.round((correctAnswers / totalQuestions) * 100);

    const quizResult = {
      quizId,
      correctAnswers,
      totalQuestions,
      score,
      topic: quiz.topic,
      results,
      submittedAt: new Date()
    };

    // Save result
    await quizService.saveResult(quizId, userId, quizResult);

    res.json({
      success: true,
      result: quizResult
    });
  } catch (error) {
    console.error('Submit quiz error:', error);
    res.status(500).json({ error: error.message });
  }
};

/**
 * Get user's quizzes
 */
exports.getUserQuizzes = async (req, res) => {
  try {
    const { userId } = req.params;
    const limit = parseInt(req.query.limit) || 50;

    const quizzes = await quizService.getByUserId(userId, limit);

    res.json({
      success: true,
      quizzes,
      count: quizzes.length
    });
  } catch (error) {
    console.error('Get quizzes error:', error);
    res.status(500).json({ error: error.message });
  }
};

/**
 * Get quiz by ID
 */
exports.getQuizById = async (req, res) => {
  try {
    const { quizId } = req.params;

    const quiz = await quizService.getById(quizId);

    if (!quiz) {
      return res.status(404).json({ error: 'Không tìm thấy quiz' });
    }

    // Remove answers if not submitted yet
    const quizWithoutAnswers = {
      ...quiz,
      questions: quiz.questions.map(q => ({
        id: q.id,
        question: q.question,
        A: q.A,
        B: q.B,
        C: q.C,
        D: q.D,
        difficulty: q.difficulty
      }))
    };

    res.json({
      success: true,
      quiz: quizWithoutAnswers
    });
  } catch (error) {
    console.error('Get quiz error:', error);
    res.status(500).json({ error: error.message });
  }
};

/**
 * Get quiz history for user
 */
exports.getQuizHistory = async (req, res) => {
  try {
    const { userId } = req.params;

    // Get completed quizzes with results
    const completedQuizzes = await quizService.getCompletedQuizzes(userId);

    // Get stats
    const stats = await learningStatsService.getByUserId(userId);

    res.json({
      success: true,
      quizzes: completedQuizzes,
      stats: {
        totalQuizzes: stats.totalQuizzes,
        averageScore: stats.averageScore,
        totalCorrect: stats.totalCorrect,
        totalQuestions: stats.totalQuestions,
        topicStats: stats.topicStats
      }
    });
  } catch (error) {
    console.error('Get quiz history error:', error);
    res.status(500).json({ error: error.message });
  }
};

/**
 * Get quiz result for review (with answers)
 */
exports.getQuizResult = async (req, res) => {
  try {
    const { quizId } = req.params;

    const quiz = await quizService.getQuizForReview(quizId);

    if (!quiz) {
      return res.status(404).json({ error: 'Không tìm thấy quiz' });
    }

    if (!quiz.result) {
      return res.status(400).json({ error: 'Quiz chưa được làm' });
    }

    res.json({
      success: true,
      quiz: {
        id: quiz.id,
        topic: quiz.topic,
        questions: quiz.questions,
        result: quiz.result,
        submittedAt: quiz.submittedAt
      }
    });
  } catch (error) {
    console.error('Get quiz result error:', error);
    res.status(500).json({ error: error.message });
  }
};
