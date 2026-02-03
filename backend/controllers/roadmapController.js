const aiService = require('../services/aiService');
const { roadmapService, quizService, learningStatsService } = require('../services/firebaseService');

/**
 * Get roadmap for user
 */
exports.getRoadmap = async (req, res) => {
  try {
    const { userId } = req.params;

    let roadmap = await roadmapService.getByUserId(userId);

    if (!roadmap) {
      return res.json({
        success: true,
        roadmap: null,
        message: 'Chưa có lộ trình. Hãy tạo lộ trình mới!'
      });
    }

    res.json({
      success: true,
      roadmap
    });
  } catch (error) {
    console.error('Get roadmap error:', error);
    res.status(500).json({ error: error.message });
  }
};

/**
 * Generate personalized learning roadmap
 */
exports.generateRoadmap = async (req, res) => {
  try {
    const { grade, subjects, goals, studyTime } = req.body;
    const userId = req.userId;

    if (!grade || !subjects || !goals) {
      return res.status(400).json({ 
        error: 'Vui lòng cung cấp đầy đủ thông tin (khối lớp, môn học, mục tiêu)' 
      });
    }

    // Get user's learning stats for personalization
    const stats = await learningStatsService.getByUserId(userId);

    // Prepare student info for AI
    const studentInfo = {
      grade,
      subjects: Array.isArray(subjects) ? subjects : [subjects],
      goals: Array.isArray(goals) ? goals : [goals],
      weaknesses: stats.weakTopics?.map(t => t.name) || [],
      strengths: stats.strongTopics?.map(t => t.name) || [],
      studyTime: studyTime || '2 giờ'
    };

    // Generate roadmap using AI
    const result = await aiService.generateRoadmap(studentInfo);

    // Save roadmap
    const roadmapData = {
      ...result.roadmap,
      studentInfo,
      generatedAt: new Date()
    };

    await roadmapService.create(userId, roadmapData);

    res.json({
      success: true,
      roadmap: roadmapData,
      usage: result.usage
    });
  } catch (error) {
    console.error('Generate roadmap error:', error);
    res.status(500).json({ error: error.message });
  }
};

/**
 * Phân tích điểm yếu từ kết quả thi thử
 */
exports.analyzeWeakness = async (req, res) => {
  try {
    const userId = req.userId;
    const { examResults, wrongAnswers } = req.body;

    // Nếu không có dữ liệu input, lấy từ lịch sử quiz
    let resultsToAnalyze = examResults;
    let wrongToAnalyze = wrongAnswers;

    if (!examResults) {
      // Lấy tất cả quiz đã làm
      const completedQuizzes = await quizService.getCompletedQuizzes(userId, 20);
      
      if (completedQuizzes.length === 0) {
        return res.status(400).json({ 
          error: 'Chưa có bài thi thử nào. Hãy làm quiz trước để phân tích.' 
        });
      }

      // Tổng hợp kết quả
      resultsToAnalyze = {
        totalQuizzes: completedQuizzes.length,
        quizzes: completedQuizzes.map(q => ({
          topic: q.topic,
          score: q.result?.score,
          correctAnswers: q.result?.correctAnswers,
          totalQuestions: q.result?.totalQuestions,
          date: q.submittedAt
        }))
      };

      // Tổng hợp các câu sai
      wrongToAnalyze = [];
      completedQuizzes.forEach(quiz => {
        if (quiz.result?.results) {
          quiz.result.results.forEach(r => {
            if (!r.isCorrect) {
              wrongToAnalyze.push({
                topic: quiz.topic,
                question: r.question,
                userAnswer: r.userAnswer,
                correctAnswer: r.correctAnswer,
                explanation: r.explanation
              });
            }
          });
        }
      });
    }

    console.log('📊 Analyzing weakness for user:', userId);
    console.log('   Total quizzes:', resultsToAnalyze.totalQuizzes || resultsToAnalyze.length);
    console.log('   Wrong answers:', wrongToAnalyze.length);

    // Gọi AI phân tích
    const result = await aiService.analyzeExamResults(resultsToAnalyze, wrongToAnalyze);

    // Lưu kết quả phân tích
    await roadmapService.saveWeaknessAnalysis(userId, result.analysis);

    res.json({
      success: true,
      analysis: result.analysis,
      usage: result.usage
    });
  } catch (error) {
    console.error('Analyze weakness error:', error);
    res.status(500).json({ error: error.message });
  }
};

/**
 * Tạo lộ trình ôn thi cá nhân hóa chi tiết theo ngày
 */
exports.generateStudyPlan = async (req, res) => {
  try {
    const userId = req.userId;
    const { 
      name,
      grade,
      subjects,
      examDate,
      studyHoursPerDay,
      studyTimeSlots,
      targetScores,
      useExistingAnalysis 
    } = req.body;

    // Lấy phân tích điểm yếu
    let weaknessAnalysis;
    
    if (useExistingAnalysis !== false) {
      const existingRoadmap = await roadmapService.getByUserId(userId);
      weaknessAnalysis = existingRoadmap?.weaknessAnalysis;
    }

    if (!weaknessAnalysis) {
      // Tự động phân tích từ quiz history
      const completedQuizzes = await quizService.getCompletedQuizzes(userId, 20);
      
      if (completedQuizzes.length > 0) {
        const examResults = {
          totalQuizzes: completedQuizzes.length,
          quizzes: completedQuizzes.map(q => ({
            topic: q.topic,
            score: q.result?.score,
            correctAnswers: q.result?.correctAnswers,
            totalQuestions: q.result?.totalQuestions
          }))
        };

        const wrongAnswers = [];
        completedQuizzes.forEach(quiz => {
          if (quiz.result?.results) {
            quiz.result.results.forEach(r => {
              if (!r.isCorrect) {
                wrongAnswers.push({
                  topic: quiz.topic,
                  question: r.question,
                  userAnswer: r.userAnswer,
                  correctAnswer: r.correctAnswer
                });
              }
            });
          }
        });

        const analysisResult = await aiService.analyzeExamResults(examResults, wrongAnswers);
        weaknessAnalysis = analysisResult.analysis;
      } else {
        weaknessAnalysis = {
          overallAssessment: { summary: 'Chưa có dữ liệu thi thử' },
          weaknessAnalysis: [],
          improvementPriority: []
        };
      }
    }

    // Tính số ngày còn lại
    const exam = examDate ? new Date(examDate) : new Date(Date.now() + 30 * 24 * 60 * 60 * 1000);
    const daysRemaining = Math.ceil((exam - new Date()) / (24 * 60 * 60 * 1000));

    const studentInfo = {
      name: name || 'Học sinh',
      grade: grade || '12',
      subjects: subjects || ['Toán', 'Ngữ văn', 'Tiếng Anh'],
      examDate: exam.toLocaleDateString('vi-VN'),
      daysRemaining: Math.max(daysRemaining, 7),
      studyHoursPerDay: studyHoursPerDay || 4,
      studyTimeSlots: studyTimeSlots || '7:00-11:00, 14:00-17:00, 19:00-21:00',
      targetScores: targetScores || {}
    };

    console.log('📅 Generating study plan for user:', userId);
    console.log('   Days remaining:', studentInfo.daysRemaining);
    console.log('   Subjects:', studentInfo.subjects);

    // Gọi AI tạo lộ trình
    const result = await aiService.generateStudyPlan(studentInfo, weaknessAnalysis);

    // Lưu lộ trình
    const roadmap = await roadmapService.createOrUpdate(userId, {
      studentInfo,
      weaknessAnalysis,
      studyPlan: result.studyPlan,
      progress: {
        currentDay: 1,
        completedSessions: [],
        completedDays: [],
        testResults: []
      },
      status: 'active'
    });

    res.json({
      success: true,
      roadmap,
      studyPlan: result.studyPlan,
      usage: result.usage
    });
  } catch (error) {
    console.error('Generate study plan error:', error);
    res.status(500).json({ error: error.message });
  }
};

/**
 * Cập nhật tiến độ học tập
 */
exports.updateProgress = async (req, res) => {
  try {
    const userId = req.userId;
    const { dayNumber, sessionIndex, completed, notes, testResult } = req.body;

    const roadmap = await roadmapService.getByUserId(userId);
    
    if (!roadmap) {
      return res.status(404).json({ error: 'Không tìm thấy lộ trình' });
    }

    // Cập nhật progress
    const progress = roadmap.progress || {
      currentDay: 1,
      completedSessions: [],
      completedDays: [],
      testResults: []
    };

    // Đánh dấu session hoàn thành
    if (completed && dayNumber && sessionIndex !== undefined) {
      const sessionKey = `${dayNumber}-${sessionIndex}`;
      if (!progress.completedSessions.includes(sessionKey)) {
        progress.completedSessions.push(sessionKey);
      }

      // Kiểm tra nếu tất cả sessions trong ngày đã hoàn thành
      const dailyPlan = roadmap.studyPlan?.dailyPlan?.find(d => d.day === dayNumber);
      if (dailyPlan) {
        const totalSessions = dailyPlan.sessions?.length || 0;
        const completedInDay = progress.completedSessions.filter(s => s.startsWith(`${dayNumber}-`)).length;
        
        if (completedInDay >= totalSessions && !progress.completedDays.includes(dayNumber)) {
          progress.completedDays.push(dayNumber);
        }
      }
    }

    // Lưu kết quả test nếu có
    if (testResult) {
      progress.testResults.push({
        day: dayNumber,
        ...testResult,
        date: new Date()
      });
    }

    // Cập nhật current day
    if (progress.completedDays.length > 0) {
      progress.currentDay = Math.max(...progress.completedDays) + 1;
    }

    // Lưu lại
    await roadmapService.updateProgress(userId, progress, notes);

    res.json({
      success: true,
      progress,
      message: 'Cập nhật tiến độ thành công'
    });
  } catch (error) {
    console.error('Update progress error:', error);
    res.status(500).json({ error: error.message });
  }
};

/**
 * Điều chỉnh lộ trình dựa trên tiến độ
 */
exports.adjustPlan = async (req, res) => {
  try {
    const userId = req.userId;
    const { feedback } = req.body;

    const roadmap = await roadmapService.getByUserId(userId);
    
    if (!roadmap) {
      return res.status(404).json({ error: 'Không tìm thấy lộ trình' });
    }

    const progress = roadmap.progress || {};
    
    // Xác định các mục chưa hoàn thành
    const incompleteItems = [];
    const completedItems = [];
    
    if (roadmap.studyPlan?.dailyPlan) {
      roadmap.studyPlan.dailyPlan.forEach(day => {
        if (day.day <= progress.currentDay) {
          day.sessions?.forEach((session, idx) => {
            const sessionKey = `${day.day}-${idx}`;
            if (progress.completedSessions?.includes(sessionKey)) {
              completedItems.push({
                day: day.day,
                session: session.topic,
                subject: session.subject
              });
            } else {
              incompleteItems.push({
                day: day.day,
                session: session.topic,
                subject: session.subject
              });
            }
          });
        }
      });
    }

    console.log('🔄 Adjusting plan for user:', userId);
    console.log('   Completed items:', completedItems.length);
    console.log('   Incomplete items:', incompleteItems.length);

    // Gọi AI điều chỉnh
    const result = await aiService.updateStudyPlan(
      roadmap.studyPlan,
      {
        currentDay: progress.currentDay,
        completedItems,
        incompleteItems,
        testResults: progress.testResults || []
      },
      feedback
    );

    // Lưu lại plan mới
    await roadmapService.updatePlan(userId, result.updatedPlan);

    res.json({
      success: true,
      assessment: result.updatedPlan.progressAssessment,
      adjustments: result.updatedPlan.adjustments,
      recommendations: result.updatedPlan.newRecommendations,
      encouragement: result.updatedPlan.encouragement,
      usage: result.usage
    });
  } catch (error) {
    console.error('Adjust plan error:', error);
    res.status(500).json({ error: error.message });
  }
};

/**
 * Lấy lịch học hôm nay
 */
exports.getTodaySchedule = async (req, res) => {
  try {
    const userId = req.userId;
    const roadmap = await roadmapService.getByUserId(userId);

    if (!roadmap || !roadmap.studyPlan) {
      return res.json({
        success: true,
        schedule: null,
        message: 'Chưa có lộ trình'
      });
    }

    const currentDay = roadmap.progress?.currentDay || 1;
    const todayPlan = roadmap.studyPlan.dailyPlan?.find(d => d.day === currentDay);

    if (!todayPlan) {
      return res.json({
        success: true,
        schedule: null,
        message: 'Không có lịch học cho hôm nay'
      });
    }

    // Đánh dấu sessions đã hoàn thành
    const completedSessions = roadmap.progress?.completedSessions || [];
    const scheduleWithProgress = {
      ...todayPlan,
      sessions: todayPlan.sessions?.map((session, idx) => ({
        ...session,
        completed: completedSessions.includes(`${currentDay}-${idx}`)
      }))
    };

    res.json({
      success: true,
      schedule: scheduleWithProgress,
      currentDay,
      totalDays: roadmap.studyPlan.planInfo?.totalDays || roadmap.studyPlan.dailyPlan?.length
    });
  } catch (error) {
    console.error('Get today schedule error:', error);
    res.status(500).json({ error: error.message });
  }
};

/**
 * Xóa lộ trình hiện tại
 */
exports.deleteStudyPlan = async (req, res) => {
  try {
    const userId = req.userId;
    await roadmapService.delete(userId);

    res.json({
      success: true,
      message: 'Đã xóa lộ trình'
    });
  } catch (error) {
    console.error('Delete study plan error:', error);
    res.status(500).json({ error: error.message });
  }
};

/**
 * Get recommendations based on learning history
 */
exports.getRecommendations = async (req, res) => {
  try {
    const { userId } = req.params;

    // Get learning stats
    const stats = await learningStatsService.getByUserId(userId);

    // Build recommendations
    const recommendations = [];

    // Based on weak topics
    if (stats.weakTopics && stats.weakTopics.length > 0) {
      stats.weakTopics.forEach(topic => {
        recommendations.push({
          type: 'weakness',
          priority: 'high',
          topic: topic.name,
          currentScore: topic.score,
          message: `Bạn cần ôn lại "${topic.name}" - điểm hiện tại: ${topic.score}%`,
          action: 'Làm thêm quiz và đọc lại bài giảng'
        });
      });
    }

    // Based on completion rate
    const completionRate = stats.totalLessons > 0
      ? (stats.completedLessons / stats.totalLessons) * 100
      : 0;

    if (completionRate < 50) {
      recommendations.push({
        type: 'completion',
        priority: 'medium',
        message: `Bạn mới hoàn thành ${Math.round(completionRate)}% bài học`,
        action: 'Hãy cố gắng hoàn thành thêm các bài học còn lại'
      });
    }

    // Based on average score
    if (stats.averageScore < 70) {
      recommendations.push({
        type: 'performance',
        priority: 'high',
        message: `Điểm trung bình ${stats.averageScore}% - cần cải thiện`,
        action: 'Ôn tập kỹ lý thuyết trước khi làm quiz'
      });
    }

    // Encouragement for strong topics
    if (stats.strongTopics && stats.strongTopics.length > 0) {
      recommendations.push({
        type: 'strength',
        priority: 'low',
        message: `Bạn giỏi ở: ${stats.strongTopics.map(t => t.name).join(', ')}`,
        action: 'Tiếp tục phát huy! Có thể thử các bài khó hơn.'
      });
    }

    res.json({
      success: true,
      recommendations,
      summary: {
        totalRecommendations: recommendations.length,
        highPriority: recommendations.filter(r => r.priority === 'high').length,
        overallProgress: {
          lessonsCompleted: stats.completedLessons,
          totalLessons: stats.totalLessons,
          averageQuizScore: stats.averageScore
        }
      }
    });
  } catch (error) {
    console.error('Get recommendations error:', error);
    res.status(500).json({ error: error.message });
  }
};

/**
 * Analyze weaknesses in depth using AI
 */
exports.analyzeWeaknesses = async (req, res) => {
  try {
    const { userId } = req.params;

    // Get learning stats
    const stats = await learningStatsService.getByUserId(userId);

    // Prepare data for AI analysis
    const learningData = {
      totalQuizzes: stats.totalQuizzes,
      averageScore: stats.averageScore,
      topicStats: stats.topicStats,
      weakTopics: stats.weakTopics,
      strongTopics: stats.strongTopics,
      totalLessons: stats.totalLessons,
      completedLessons: stats.completedLessons
    };

    // Use AI to analyze
    const result = await aiService.analyzeWeaknesses(learningData);

    res.json({
      success: true,
      analysis: result.analysis,
      usage: result.usage
    });
  } catch (error) {
    console.error('Analyze weaknesses error:', error);
    res.status(500).json({ error: error.message });
  }
};
