/**
 * Admin Controller
 * Quản lý toàn bộ hệ thống: Users, Lessons, Quizzes, Analytics, Settings
 */

const { 
  userService, 
  lessonService, 
  quizService, 
  learningStatsService,
  chatHistoryService,
  activityLogService,
  audioHistoryService,
  roadmapService
} = require('../services/firebaseService');

// ============================================
// DASHBOARD STATS
// ============================================

/**
 * Get admin dashboard overview stats
 */
exports.getDashboardStats = async (req, res) => {
  try {
    // Get all counts
    const [users, lessons, quizzes, chats] = await Promise.all([
      userService.getAll(),
      lessonService.getAll(),
      quizService.getAll(),
      chatHistoryService.getAll()
    ]);

    // Calculate stats
    const totalUsers = users.length;
    const activeUsers = users.filter(u => {
      const lastActive = new Date(u.lastLoginAt || u.createdAt);
      const weekAgo = new Date(Date.now() - 7 * 24 * 60 * 60 * 1000);
      return lastActive > weekAgo;
    }).length;

    const totalLessons = lessons.length;
    const totalQuizzes = quizzes.length;
    const totalChats = chats.length;

    // Calculate growth (compare to last week)
    const weekAgo = new Date(Date.now() - 7 * 24 * 60 * 60 * 1000);
    const newUsersThisWeek = users.filter(u => new Date(u.createdAt) > weekAgo).length;
    const newLessonsThisWeek = lessons.filter(l => new Date(l.createdAt) > weekAgo).length;

    // Quiz stats
    const completedQuizzes = quizzes.filter(q => q.completed).length;
    const avgScore = quizzes.length > 0 
      ? Math.round(quizzes.reduce((sum, q) => sum + (q.score || 0), 0) / quizzes.length)
      : 0;

    // Lessons by subject
    const lessonsBySubject = lessons.reduce((acc, l) => {
      const subject = l.subject || 'Khác';
      acc[subject] = (acc[subject] || 0) + 1;
      return acc;
    }, {});

    // Recent activity (last 24h)
    const dayAgo = new Date(Date.now() - 24 * 60 * 60 * 1000);
    const recentLessons = lessons.filter(l => new Date(l.createdAt) > dayAgo).length;
    const recentQuizzes = quizzes.filter(q => new Date(q.createdAt) > dayAgo).length;

    res.json({
      success: true,
      stats: {
        users: {
          total: totalUsers,
          active: activeUsers,
          newThisWeek: newUsersThisWeek,
          growth: totalUsers > 0 ? Math.round((newUsersThisWeek / totalUsers) * 100) : 0
        },
        lessons: {
          total: totalLessons,
          newThisWeek: newLessonsThisWeek,
          recentDay: recentLessons,
          bySubject: lessonsBySubject
        },
        quizzes: {
          total: totalQuizzes,
          completed: completedQuizzes,
          avgScore,
          recentDay: recentQuizzes
        },
        chats: {
          total: totalChats
        },
        systemHealth: {
          status: 'healthy',
          uptime: process.uptime(),
          memoryUsage: process.memoryUsage()
        }
      }
    });
  } catch (error) {
    console.error('Admin dashboard error:', error);
    res.status(500).json({ error: error.message });
  }
};

/**
 * Get activity timeline
 */
exports.getActivityTimeline = async (req, res) => {
  try {
    const { days = 7 } = req.query;
    const startDate = new Date(Date.now() - days * 24 * 60 * 60 * 1000);

    const [lessons, quizzes, users] = await Promise.all([
      lessonService.getAll(),
      quizService.getAll(),
      userService.getAll()
    ]);

    // Group by date
    const timeline = {};
    for (let i = 0; i < days; i++) {
      const date = new Date(Date.now() - i * 24 * 60 * 60 * 1000);
      const dateStr = date.toISOString().split('T')[0];
      timeline[dateStr] = { lessons: 0, quizzes: 0, users: 0 };
    }

    lessons.forEach(l => {
      const dateStr = new Date(l.createdAt).toISOString().split('T')[0];
      if (timeline[dateStr]) timeline[dateStr].lessons++;
    });

    quizzes.forEach(q => {
      const dateStr = new Date(q.createdAt).toISOString().split('T')[0];
      if (timeline[dateStr]) timeline[dateStr].quizzes++;
    });

    users.forEach(u => {
      const dateStr = new Date(u.createdAt).toISOString().split('T')[0];
      if (timeline[dateStr]) timeline[dateStr].users++;
    });

    res.json({
      success: true,
      timeline: Object.entries(timeline).map(([date, data]) => ({
        date,
        ...data
      })).reverse()
    });
  } catch (error) {
    console.error('Activity timeline error:', error);
    res.status(500).json({ error: error.message });
  }
};

// ============================================
// USER MANAGEMENT
// ============================================

/**
 * Get all users with pagination
 */
exports.getUsers = async (req, res) => {
  try {
    const { page = 1, limit = 20, search = '', role = '' } = req.query;
    
    let users = await userService.getAll();
    
    // Filter by search
    if (search) {
      const searchLower = search.toLowerCase();
      users = users.filter(u => 
        u.name?.toLowerCase().includes(searchLower) ||
        u.email?.toLowerCase().includes(searchLower)
      );
    }
    
    // Filter by role
    if (role) {
      users = users.filter(u => u.role === role);
    }
    
    // Sort by creation date (newest first)
    users.sort((a, b) => new Date(b.createdAt) - new Date(a.createdAt));
    
    // Paginate
    const total = users.length;
    const startIndex = (page - 1) * limit;
    const paginatedUsers = users.slice(startIndex, startIndex + parseInt(limit));

    // Get user stats
    const usersWithStats = await Promise.all(paginatedUsers.map(async (user) => {
      const [lessons, quizzes] = await Promise.all([
        lessonService.getByUserId(user._id),
        quizService.getByUserId(user._id)
      ]);
      
      return {
        ...user,
        password: undefined, // Remove password
        stats: {
          lessonsCount: lessons.length,
          quizzesCount: quizzes.length,
          avgScore: quizzes.length > 0 
            ? Math.round(quizzes.reduce((sum, q) => sum + (q.score || 0), 0) / quizzes.length)
            : 0
        }
      };
    }));

    res.json({
      success: true,
      users: usersWithStats,
      pagination: {
        page: parseInt(page),
        limit: parseInt(limit),
        total,
        pages: Math.ceil(total / limit)
      }
    });
  } catch (error) {
    console.error('Get users error:', error);
    res.status(500).json({ error: error.message });
  }
};

/**
 * Get user details
 */
exports.getUserDetails = async (req, res) => {
  try {
    const { userId } = req.params;
    
    const user = await userService.getById(userId);
    if (!user) {
      return res.status(404).json({ error: 'Không tìm thấy người dùng' });
    }

    // Get user's data
    const [lessons, quizzes, chats, activity] = await Promise.all([
      lessonService.getByUserId(userId),
      quizService.getByUserId(userId),
      chatHistoryService.getByUserId(userId, 10),
      activityLogService.getByUserId(userId, 20)
    ]);

    res.json({
      success: true,
      user: {
        ...user,
        password: undefined
      },
      lessons,
      quizzes,
      recentChats: chats,
      recentActivity: activity,
      stats: {
        totalLessons: lessons.length,
        completedLessons: lessons.filter(l => l.completed).length,
        totalQuizzes: quizzes.length,
        avgScore: quizzes.length > 0
          ? Math.round(quizzes.reduce((sum, q) => sum + (q.score || 0), 0) / quizzes.length)
          : 0
      }
    });
  } catch (error) {
    console.error('Get user details error:', error);
    res.status(500).json({ error: error.message });
  }
};

/**
 * Update user (admin can change role, status)
 */
exports.updateUser = async (req, res) => {
  try {
    const { userId } = req.params;
    const { name, email, role, status, isBlocked } = req.body;

    const user = await userService.getById(userId);
    if (!user) {
      return res.status(404).json({ error: 'Không tìm thấy người dùng' });
    }

    const updates = {};
    if (name) updates.name = name;
    if (email) updates.email = email;
    if (role) updates.role = role;
    if (status !== undefined) updates.status = status;
    if (isBlocked !== undefined) updates.isBlocked = isBlocked;
    updates.updatedAt = new Date();

    await userService.update(userId, updates);

    // Log activity
    await activityLogService.log(req.userId, {
      type: 'admin_update_user',
      targetUserId: userId,
      changes: updates
    });

    res.json({
      success: true,
      message: 'Cập nhật người dùng thành công'
    });
  } catch (error) {
    console.error('Update user error:', error);
    res.status(500).json({ error: error.message });
  }
};

/**
 * Delete user
 */
exports.deleteUser = async (req, res) => {
  try {
    const { userId } = req.params;

    const user = await userService.getById(userId);
    if (!user) {
      return res.status(404).json({ error: 'Không tìm thấy người dùng' });
    }

    // Prevent deleting admin
    if (user.role === 'admin') {
      return res.status(403).json({ error: 'Không thể xóa tài khoản admin' });
    }

    await userService.delete(userId);

    // Log activity
    await activityLogService.log(req.userId, {
      type: 'admin_delete_user',
      targetUserId: userId,
      userName: user.name
    });

    res.json({
      success: true,
      message: 'Xóa người dùng thành công'
    });
  } catch (error) {
    console.error('Delete user error:', error);
    res.status(500).json({ error: error.message });
  }
};

/**
 * Block/Unblock user
 */
exports.toggleBlockUser = async (req, res) => {
  try {
    const { userId } = req.params;
    const { isBlocked } = req.body;

    const user = await userService.getById(userId);
    if (!user) {
      return res.status(404).json({ error: 'Không tìm thấy người dùng' });
    }

    if (user.role === 'admin') {
      return res.status(403).json({ error: 'Không thể block admin' });
    }

    await userService.update(userId, { 
      isBlocked,
      blockedAt: isBlocked ? new Date() : null 
    });

    await activityLogService.log(req.userId, {
      type: isBlocked ? 'admin_block_user' : 'admin_unblock_user',
      targetUserId: userId
    });

    res.json({
      success: true,
      message: isBlocked ? 'Đã chặn người dùng' : 'Đã bỏ chặn người dùng'
    });
  } catch (error) {
    console.error('Toggle block user error:', error);
    res.status(500).json({ error: error.message });
  }
};

/**
 * Reset user password (admin generates new password)
 */
exports.resetUserPassword = async (req, res) => {
  try {
    const { userId } = req.params;
    const { newPassword } = req.body;

    if (!newPassword || newPassword.length < 6) {
      return res.status(400).json({ error: 'Mật khẩu phải có ít nhất 6 ký tự' });
    }

    const user = await userService.getById(userId);
    if (!user) {
      return res.status(404).json({ error: 'Không tìm thấy người dùng' });
    }

    const bcrypt = require('bcrypt');
    const hashedPassword = await bcrypt.hash(newPassword, 10);

    await userService.update(userId, { 
      password: hashedPassword,
      passwordChangedAt: new Date()
    });

    await activityLogService.log(req.userId, {
      type: 'admin_reset_user_password',
      targetUserId: userId
    });

    res.json({
      success: true,
      message: 'Đã reset mật khẩu người dùng',
      newPassword // Send back to admin
    });
  } catch (error) {
    console.error('Reset user password error:', error);
    res.status(500).json({ error: error.message });
  }
};

/**
 * Delete all user data (lessons, quizzes, chats, roadmaps)
 */
exports.deleteAllUserData = async (req, res) => {
  try {
    const { userId } = req.params;

    const user = await userService.getById(userId);
    if (!user) {
      return res.status(404).json({ error: 'Không tìm thấy người dùng' });
    }

    // Get all user data
    const [lessons, quizzes, chats, roadmaps, stats] = await Promise.all([
      lessonService.getByUserId(userId),
      quizService.getByUserId(userId),
      chatHistoryService.getByUserId(userId),
      roadmapService.getByUserId(userId),
      learningStatsService.getByUserId(userId)
    ]);

    // Delete all data
    await Promise.all([
      ...lessons.map(l => lessonService.delete(l.id)),
      ...quizzes.map(q => quizService.delete(q.id)),
      ...chats.map(c => chatHistoryService.delete(c.id)),
      ...roadmaps.map(r => roadmapService.delete(r.id)),
      stats?.id ? learningStatsService.delete(stats.id) : Promise.resolve()
    ]);

    const totalDeleted = lessons.length + quizzes.length + chats.length + roadmaps.length;

    await activityLogService.log(req.userId, {
      type: 'admin_delete_all_user_data',
      targetUserId: userId,
      deletedCount: totalDeleted
    });

    res.json({
      success: true,
      message: 'Đã xóa toàn bộ dữ liệu người dùng',
      deleted: {
        lessons: lessons.length,
        quizzes: quizzes.length,
        chats: chats.length,
        roadmaps: roadmaps.length,
        total: totalDeleted
      }
    });
  } catch (error) {
    console.error('Delete all user data error:', error);
    res.status(500).json({ error: error.message });
  }
};

/**
 * Get user activity log
 */
exports.getUserActivityLog = async (req, res) => {
  try {
    const { userId } = req.params;
    const { limit = 50 } = req.query;

    const user = await userService.getById(userId);
    if (!user) {
      return res.status(404).json({ error: 'Không tìm thấy người dùng' });
    }

    let logs = await activityLogService.getAll();
    logs = logs.filter(l => l.userId === userId);
    logs.sort((a, b) => new Date(b.createdAt) - new Date(a.createdAt));
    logs = logs.slice(0, parseInt(limit));

    res.json({
      success: true,
      logs,
      total: logs.length
    });
  } catch (error) {
    console.error('Get user activity log error:', error);
    res.status(500).json({ error: error.message });
  }
};

/**
 * Change user role (user <-> admin)
 */
exports.changeUserRole = async (req, res) => {
  try {
    const { userId } = req.params;
    const { role } = req.body;

    if (!['user', 'admin'].includes(role)) {
      return res.status(400).json({ error: 'Role không hợp lệ' });
    }

    const user = await userService.getById(userId);
    if (!user) {
      return res.status(404).json({ error: 'Không tìm thấy người dùng' });
    }

    await userService.update(userId, { 
      role,
      roleChangedAt: new Date()
    });

    await activityLogService.log(req.userId, {
      type: 'admin_change_user_role',
      targetUserId: userId,
      oldRole: user.role,
      newRole: role
    });

    res.json({
      success: true,
      message: `Đã thay đổi role thành ${role}`
    });
  } catch (error) {
    console.error('Change user role error:', error);
    res.status(500).json({ error: error.message });
  }
};

// ============================================
// LESSON MANAGEMENT
// ============================================

/**
 * Get all lessons with pagination
 */
exports.getLessons = async (req, res) => {
  try {
    const { page = 1, limit = 20, search = '', subject = '' } = req.query;
    
    let lessons = await lessonService.getAll();
    
    // Filter by search
    if (search) {
      const searchLower = search.toLowerCase();
      lessons = lessons.filter(l => 
        l.title?.toLowerCase().includes(searchLower) ||
        l.content?.toLowerCase().includes(searchLower)
      );
    }
    
    // Filter by subject
    if (subject) {
      lessons = lessons.filter(l => l.subject === subject);
    }
    
    // Sort by creation date (newest first)
    lessons.sort((a, b) => new Date(b.createdAt) - new Date(a.createdAt));
    
    // Paginate
    const total = lessons.length;
    const startIndex = (page - 1) * limit;
    const paginatedLessons = lessons.slice(startIndex, startIndex + parseInt(limit));

    // Get creator info
    const lessonsWithCreator = await Promise.all(paginatedLessons.map(async (lesson) => {
      const creator = lesson.userId ? await userService.getById(lesson.userId) : null;
      return {
        ...lesson,
        creator: creator ? { name: creator.name, email: creator.email } : null
      };
    }));

    res.json({
      success: true,
      lessons: lessonsWithCreator,
      pagination: {
        page: parseInt(page),
        limit: parseInt(limit),
        total,
        pages: Math.ceil(total / limit)
      }
    });
  } catch (error) {
    console.error('Get lessons error:', error);
    res.status(500).json({ error: error.message });
  }
};

/**
 * Delete lesson
 */
exports.deleteLesson = async (req, res) => {
  try {
    const { lessonId } = req.params;

    const lesson = await lessonService.getById(lessonId);
    if (!lesson) {
      return res.status(404).json({ error: 'Không tìm thấy bài học' });
    }

    await lessonService.delete(lessonId);

    // Log activity
    await activityLogService.log(req.userId, {
      type: 'admin_delete_lesson',
      lessonId,
      lessonTitle: lesson.title
    });

    res.json({
      success: true,
      message: 'Xóa bài học thành công'
    });
  } catch (error) {
    console.error('Delete lesson error:', error);
    res.status(500).json({ error: error.message });
  }
};

// ============================================
// QUIZ MANAGEMENT
// ============================================

/**
 * Get all quizzes with pagination
 */
exports.getQuizzes = async (req, res) => {
  try {
    const { page = 1, limit = 20, search = '' } = req.query;
    
    let quizzes = await quizService.getAll();
    
    // Filter by search
    if (search) {
      const searchLower = search.toLowerCase();
      quizzes = quizzes.filter(q => 
        q.topic?.toLowerCase().includes(searchLower) ||
        q.title?.toLowerCase().includes(searchLower)
      );
    }
    
    // Sort by creation date (newest first)
    quizzes.sort((a, b) => new Date(b.createdAt) - new Date(a.createdAt));
    
    // Paginate
    const total = quizzes.length;
    const startIndex = (page - 1) * limit;
    const paginatedQuizzes = quizzes.slice(startIndex, startIndex + parseInt(limit));

    // Get creator info
    const quizzesWithCreator = await Promise.all(paginatedQuizzes.map(async (quiz) => {
      const creator = quiz.userId ? await userService.getById(quiz.userId) : null;
      return {
        ...quiz,
        creator: creator ? { name: creator.name, email: creator.email } : null
      };
    }));

    res.json({
      success: true,
      quizzes: quizzesWithCreator,
      pagination: {
        page: parseInt(page),
        limit: parseInt(limit),
        total,
        pages: Math.ceil(total / limit)
      }
    });
  } catch (error) {
    console.error('Get quizzes error:', error);
    res.status(500).json({ error: error.message });
  }
};

/**
 * Delete quiz
 */
exports.deleteQuiz = async (req, res) => {
  try {
    const { quizId } = req.params;

    const quiz = await quizService.getById(quizId);
    if (!quiz) {
      return res.status(404).json({ error: 'Không tìm thấy quiz' });
    }

    await quizService.delete(quizId);

    // Log activity
    await activityLogService.log(req.userId, {
      type: 'admin_delete_quiz',
      quizId,
      quizTopic: quiz.topic
    });

    res.json({
      success: true,
      message: 'Xóa quiz thành công'
    });
  } catch (error) {
    console.error('Delete quiz error:', error);
    res.status(500).json({ error: error.message });
  }
};

// ============================================
// SYSTEM SETTINGS
// ============================================

/**
 * Get system settings
 */
exports.getSettings = async (req, res) => {
  try {
    // Return system settings (can be stored in a separate db or config)
    const settings = {
      siteName: 'EDUMENTOR',
      siteDescription: 'Nền tảng học tập thông minh với AI',
      maxUploadSize: 50 * 1024 * 1024, // 50MB
      allowedFileTypes: ['image/png', 'image/jpeg', 'image/webp', 'application/pdf'],
      ttsEnabled: true,
      aiModel: 'grok-3',
      features: {
        lessons: true,
        quiz: true,
        chat: true,
        roadmap: true,
        tts: true,
        career: true
      },
      maintenance: false
    };

    res.json({
      success: true,
      settings
    });
  } catch (error) {
    console.error('Get settings error:', error);
    res.status(500).json({ error: error.message });
  }
};

/**
 * Get system logs
 */
exports.getSystemLogs = async (req, res) => {
  try {
    const { page = 1, limit = 50, type = '' } = req.query;

    // Get all activity logs
    let logs = await activityLogService.getAll();

    // Filter by type
    if (type) {
      logs = logs.filter(l => l.type === type);
    }

    // Sort by date (newest first)
    logs.sort((a, b) => new Date(b.createdAt) - new Date(a.createdAt));

    // Paginate
    const total = logs.length;
    const startIndex = (page - 1) * limit;
    const paginatedLogs = logs.slice(startIndex, startIndex + parseInt(limit));

    res.json({
      success: true,
      logs: paginatedLogs,
      pagination: {
        page: parseInt(page),
        limit: parseInt(limit),
        total,
        pages: Math.ceil(total / limit)
      }
    });
  } catch (error) {
    console.error('Get system logs error:', error);
    res.status(500).json({ error: error.message });
  }
};

/**
 * Get subjects list
 */
exports.getSubjects = async (req, res) => {
  try {
    const lessons = await lessonService.getAll();
    const subjects = [...new Set(lessons.map(l => l.subject).filter(Boolean))];
    
    res.json({
      success: true,
      subjects
    });
  } catch (error) {
    console.error('Get subjects error:', error);
    res.status(500).json({ error: error.message });
  }
};

// ============================================
// CHAT HISTORY MANAGEMENT
// ============================================

/**
 * Get all chat histories
 */
exports.getChats = async (req, res) => {
  try {
    const { page = 1, limit = 50, userId = '' } = req.query;

    let chats = await chatHistoryService.getAll();

    // Filter by userId if provided
    if (userId) {
      chats = chats.filter(c => c.userId === userId);
    }

    // Sort by date (newest first)
    chats.sort((a, b) => new Date(b.createdAt) - new Date(a.createdAt));

    // Get user info for each chat
    const chatsWithUsers = await Promise.all(chats.map(async (chat) => {
      const user = await userService.getById(chat.userId);
      return {
        ...chat,
        userName: user?.name || 'Unknown',
        userEmail: user?.email || 'N/A'
      };
    }));

    // Paginate
    const total = chatsWithUsers.length;
    const startIndex = (page - 1) * limit;
    const paginatedChats = chatsWithUsers.slice(startIndex, startIndex + parseInt(limit));

    res.json({
      success: true,
      chats: paginatedChats,
      pagination: {
        page: parseInt(page),
        limit: parseInt(limit),
        total,
        pages: Math.ceil(total / limit)
      }
    });
  } catch (error) {
    console.error('Get chats error:', error);
    res.status(500).json({ error: error.message });
  }
};

/**
 * Delete a chat
 */
exports.deleteChat = async (req, res) => {
  try {
    const { chatId } = req.params;
    await chatHistoryService.delete(chatId);
    
    res.json({
      success: true,
      message: 'Chat deleted successfully'
    });
  } catch (error) {
    console.error('Delete chat error:', error);
    res.status(500).json({ error: error.message });
  }
};

/**
 * Delete all chats of a user
 */
exports.deleteUserChats = async (req, res) => {
  try {
    const { userId } = req.params;
    const chats = await chatHistoryService.getByUserId(userId);
    
    await Promise.all(chats.map(chat => chatHistoryService.delete(chat.id)));
    
    res.json({
      success: true,
      message: `Deleted ${chats.length} chats`,
      count: chats.length
    });
  } catch (error) {
    console.error('Delete user chats error:', error);
    res.status(500).json({ error: error.message });
  }
};

// ============================================
// ROADMAP MANAGEMENT
// ============================================

/**
 * Get all roadmaps
 */
exports.getRoadmaps = async (req, res) => {
  try {
    const { page = 1, limit = 50, userId = '' } = req.query;

    let roadmaps = await roadmapService.getAll();

    // Filter by userId if provided
    if (userId) {
      roadmaps = roadmaps.filter(r => r.userId === userId);
    }

    // Sort by date (newest first)
    roadmaps.sort((a, b) => new Date(b.createdAt) - new Date(a.createdAt));

    // Get user info for each roadmap
    const roadmapsWithUsers = await Promise.all(roadmaps.map(async (roadmap) => {
      const user = await userService.getById(roadmap.userId);
      return {
        ...roadmap,
        userName: user?.name || 'Unknown',
        userEmail: user?.email || 'N/A'
      };
    }));

    // Paginate
    const total = roadmapsWithUsers.length;
    const startIndex = (page - 1) * limit;
    const paginatedRoadmaps = roadmapsWithUsers.slice(startIndex, startIndex + parseInt(limit));

    res.json({
      success: true,
      roadmaps: paginatedRoadmaps,
      pagination: {
        page: parseInt(page),
        limit: parseInt(limit),
        total,
        pages: Math.ceil(total / limit)
      }
    });
  } catch (error) {
    console.error('Get roadmaps error:', error);
    res.status(500).json({ error: error.message });
  }
};

/**
 * Delete a roadmap
 */
exports.deleteRoadmap = async (req, res) => {
  try {
    const { roadmapId } = req.params;
    await roadmapService.delete(roadmapId);
    
    res.json({
      success: true,
      message: 'Roadmap deleted successfully'
    });
  } catch (error) {
    console.error('Delete roadmap error:', error);
    res.status(500).json({ error: error.message });
  }
};

// ============================================
// DATABASE MANAGEMENT
// ============================================

/**
 * Clean old data
 */
exports.cleanDatabase = async (req, res) => {
  try {
    const { days = 90 } = req.body; // Delete data older than X days
    const cutoffDate = new Date(Date.now() - days * 24 * 60 * 60 * 1000);

    let deletedCount = 0;

    // Clean old activity logs
    const logs = await activityLogService.getAll();
    const oldLogs = logs.filter(l => new Date(l.createdAt) < cutoffDate);
    await Promise.all(oldLogs.map(l => activityLogService.delete(l.id)));
    deletedCount += oldLogs.length;

    // Clean old audio history (optional, chỉ xóa những thất bại)
    const audioHistory = await audioHistoryService.getAll();
    const failedAudio = audioHistory.filter(a => a.status === 'failed' && new Date(a.createdAt) < cutoffDate);
    await Promise.all(failedAudio.map(a => audioHistoryService.delete(a.id)));
    deletedCount += failedAudio.length;

    res.json({
      success: true,
      message: `Cleaned ${deletedCount} old records`,
      deletedCount
    });
  } catch (error) {
    console.error('Clean database error:', error);
    res.status(500).json({ error: error.message });
  }
};

/**
 * Get database stats
 */
exports.getDatabaseStats = async (req, res) => {
  try {
    const [users, lessons, quizzes, chats, roadmaps, logs, audioHistory, learningStats] = await Promise.all([
      userService.getAll(),
      lessonService.getAll(),
      quizService.getAll(),
      chatHistoryService.getAll(),
      roadmapService.getAll(),
      activityLogService.getAll(),
      audioHistoryService.getAll(),
      learningStatsService.getAll()
    ]);

    const stats = {
      collections: {
        users: users.length,
        lessons: lessons.length,
        quizzes: quizzes.length,
        chats: chats.length,
        roadmaps: roadmaps.length,
        activityLogs: logs.length,
        audioHistory: audioHistory.length,
        learningStats: learningStats.length
      },
      memory: process.memoryUsage(),
      uptime: process.uptime()
    };

    res.json({
      success: true,
      stats
    });
  } catch (error) {
    console.error('Get database stats error:', error);
    res.status(500).json({ error: error.message });
  }
};

// ============================================
// SYSTEM SETTINGS
// ============================================

/**
 * Update system settings
 */
exports.updateSettings = async (req, res) => {
  try {
    const settings = req.body;
    
    // In production, save to database
    // For now, just return success
    res.json({
      success: true,
      message: 'Settings updated successfully',
      settings
    });
  } catch (error) {
    console.error('Update settings error:', error);
    res.status(500).json({ error: error.message });
  }
};
