const aiService = require('../services/aiService');
const { quizService, learningStatsService, dailyStatsService } = require('../services/firebaseService');

/**
 * Generate quiz from text content (20 questions)
 */
exports.generateQuiz = async (req, res) => {
  try {
    const { text, topic, lessonId } = req.body;
    const userId = req.userId;

    if (!text) {
      return res.status(400).json({ error: 'Vui lòng cung cấp nội dung' });
    }

    if (text.trim().length < 20) {
      return res.status(400).json({ 
        error: 'Nội dung quá ngắn. Vui lòng cung cấp nội dung dài hơn 20 ký tự để tạo quiz.' 
      });
    }

    // Always generate 20 questions
    const questionCount = 20;

    // Generate quiz using AI
    const result = await aiService.generateQuiz(text, questionCount);

    if (!result.quiz || !result.quiz.questions) {
      return res.status(500).json({ 
        error: 'Lỗi tạo quiz: Không nhận được dữ liệu từ AI' 
      });
    }

    // Save quiz to database with regeneration tracking
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
      version: 1,
      totalRegenerations: 1,
      usage: result.usage
    });
  } catch (error) {
    console.error('Generate quiz error:', error);
    
    // Provide more specific error messages
    let errorMessage = error.message || 'Không thể tạo quiz';
    
    if (error.message.includes('Lỗi tạo quiz')) {
      errorMessage = error.message;
    } else if (error.message.includes('401')) {
      errorMessage = 'Lỗi xác thực API. Vui lòng kiểm tra cấu hình server.';
    } else if (error.message.includes('429')) {
      errorMessage = 'Quá nhiều request. Vui lòng thử lại sau vài giây.';
    }
    
    res.status(500).json({ error: errorMessage });
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

    // Track daily stats for engagement
    await dailyStatsService.incrementQuizzes(userId, score);

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

/**
 * Regenerate quiz with 20 new questions (different from previous versions)
 */
exports.regenerateQuiz = async (req, res) => {
  try {
    const { quizId, text } = req.body;
    const userId = req.userId;

    if (!quizId || !text) {
      return res.status(400).json({ error: 'Vui lòng cung cấp quizId và nội dung' });
    }

    if (text.trim().length < 20) {
      return res.status(400).json({ 
        error: 'Nội dung quá ngắn. Vui lòng cung cấp nội dung dài hơn 20 ký tự.' 
      });
    }

    // Get existing quiz
    const quiz = await quizService.getById(quizId);
    if (!quiz) {
      return res.status(404).json({ error: 'Không tìm thấy quiz' });
    }

    // Verify ownership
    if (quiz.userId !== userId) {
      return res.status(403).json({ error: 'Không có quyền truy cập quiz này' });
    }

    // Generate 20 new questions
    const result = await aiService.generateQuiz(text, 20);

    if (!result.quiz || !result.quiz.questions) {
      return res.status(500).json({ 
        error: 'Lỗi tạo quiz: Không nhận được dữ liệu từ AI' 
      });
    }

    // Get regeneration history to ensure uniqueness
    const history = await quizService.getRegenerationHistory(quizId);
    
    // Check if new questions are different from previous versions
    const newQuestionTexts = new Set(result.quiz.questions.map(q => q.question));
    let isDifferent = true;

    if (history && history.regenerations) {
      for (const regen of history.regenerations) {
        const oldQuestionTexts = new Set(regen.questions.map(q => q.question));
        const intersection = new Set([...newQuestionTexts].filter(x => oldQuestionTexts.has(x)));
        
        // If more than 30% of questions are the same, regenerate again
        if (intersection.size > result.quiz.questions.length * 0.3) {
          isDifferent = false;
          break;
        }
      }
    }

    // If questions are too similar to previous versions, try again
    if (!isDifferent) {
      const retryResult = await aiService.generateQuiz(
        `${text}\n\n[YÊU CẦU THÊM]: Tạo câu hỏi HOÀN TOÀN KHÁC với các câu hỏi trước đó, đặc biệt về cách phát biểu và nội dung cụ thể.`,
        20
      );
      if (retryResult.quiz && retryResult.quiz.questions) {
        result.quiz = retryResult.quiz;
      }
    }

    // Add new regeneration to quiz
    const updatedQuiz = await quizService.addRegeneration(quizId, result.quiz.questions);

    res.json({
      success: true,
      quiz: updatedQuiz,
      version: updatedQuiz.currentVersion,
      totalRegenerations: updatedQuiz.regenerations?.length || 1,
      message: `Tạo thành công ${result.quiz.questions.length} câu hỏi mới (phiên bản ${updatedQuiz.currentVersion})`,
      usage: result.usage
    });
  } catch (error) {
    console.error('Regenerate quiz error:', error);
    let errorMessage = error.message || 'Không thể tạo quiz mới';
    if (error.message.includes('Lỗi tạo quiz')) {
      errorMessage = error.message;
    }
    res.status(500).json({ error: errorMessage });
  }
};

/**
 * Get quiz regeneration history
 */
exports.getRegenerationHistory = async (req, res) => {
  try {
    const { quizId } = req.params;
    const userId = req.userId;

    // Get quiz and verify ownership
    const quiz = await quizService.getById(quizId);
    if (!quiz) {
      return res.status(404).json({ error: 'Không tìm thấy quiz' });
    }

    if (quiz.userId !== userId) {
      return res.status(403).json({ error: 'Không có quyền truy cập quiz này' });
    }

    const history = await quizService.getRegenerationHistory(quizId);

    res.json({
      success: true,
      history,
      currentVersion: quiz.currentVersion || 1
    });
  } catch (error) {
    console.error('Get regeneration history error:', error);
    res.status(500).json({ error: error.message });
  }
};

