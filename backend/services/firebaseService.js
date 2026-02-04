/**
 * Database Service - NeDB Local NoSQL
 * All data persisted to disk in /data/ folder
 * 
 * EDUMENTOR - Backend Database Service
 */

const Datastore = require('nedb-promises');
const path = require('path');
const fs = require('fs');

// Create data directory
const dataDir = path.join(__dirname, '../database/data');
if (!fs.existsSync(dataDir)) {
  fs.mkdirSync(dataDir, { recursive: true });
}

// Initialize all databases
const db = {
  users: Datastore.create({ filename: path.join(dataDir, 'users.db'), autoload: true }),
  lessons: Datastore.create({ filename: path.join(dataDir, 'lessons.db'), autoload: true }),
  quizzes: Datastore.create({ filename: path.join(dataDir, 'quizzes.db'), autoload: true }),
  chatHistory: Datastore.create({ filename: path.join(dataDir, 'chat_history.db'), autoload: true }),
  learningStats: Datastore.create({ filename: path.join(dataDir, 'learning_stats.db'), autoload: true }),
  roadmaps: Datastore.create({ filename: path.join(dataDir, 'roadmaps.db'), autoload: true }),
  // New databases for complete data tracking
  userSettings: Datastore.create({ filename: path.join(dataDir, 'user_settings.db'), autoload: true }),
  bookmarks: Datastore.create({ filename: path.join(dataDir, 'bookmarks.db'), autoload: true }),
  notes: Datastore.create({ filename: path.join(dataDir, 'notes.db'), autoload: true }),
  studySessions: Datastore.create({ filename: path.join(dataDir, 'study_sessions.db'), autoload: true }),
  audioHistory: Datastore.create({ filename: path.join(dataDir, 'audio_history.db'), autoload: true }),
  activityLog: Datastore.create({ filename: path.join(dataDir, 'activity_log.db'), autoload: true }),
};

// Create indexes
db.users.ensureIndex({ fieldName: 'email', unique: true });
db.lessons.ensureIndex({ fieldName: 'userId' });
db.quizzes.ensureIndex({ fieldName: 'userId' });
db.chatHistory.ensureIndex({ fieldName: 'userId' });
db.learningStats.ensureIndex({ fieldName: 'userId', unique: true });
db.roadmaps.ensureIndex({ fieldName: 'userId', unique: true });
db.userSettings.ensureIndex({ fieldName: 'userId', unique: true });
db.bookmarks.ensureIndex({ fieldName: 'userId' });
db.notes.ensureIndex({ fieldName: 'userId' });
db.studySessions.ensureIndex({ fieldName: 'userId' });
db.audioHistory.ensureIndex({ fieldName: 'userId' });
db.activityLog.ensureIndex({ fieldName: 'userId' });

console.log('💾 Database initialized - Data stored in:', dataDir);

// ==================== USER SERVICE ====================
const userService = {
  async create(userData) {
    const doc = await db.users.insert({
      ...userData,
      createdAt: new Date(),
      updatedAt: new Date()
    });
    return { id: doc._id, ...doc };
  },

  async getById(userId) {
    const doc = await db.users.findOne({ _id: userId });
    return doc ? { id: doc._id, ...doc } : null;
  },

  async getByEmail(email) {
    const doc = await db.users.findOne({ email });
    return doc ? { id: doc._id, ...doc } : null;
  },

  async update(userId, data) {
    await db.users.update({ _id: userId }, { $set: { ...data, updatedAt: new Date() } });
    return this.getById(userId);
  },

  async getAll() {
    const docs = await db.users.find({});
    return docs.map(doc => ({ id: doc._id, ...doc }));
  },

  async delete(userId) {
    await db.users.remove({ _id: userId });
    return { deleted: true };
  }
};

// ==================== LESSON SERVICE ====================
const lessonService = {
  async create(lessonData) {
    console.log('📚 Creating lesson:', { userId: lessonData.userId, title: lessonData.title });
    const doc = await db.lessons.insert({
      ...lessonData,
      createdAt: new Date(),
      updatedAt: new Date()
    });
    console.log('✅ Lesson created with ID:', doc._id);
    return { id: doc._id, ...doc };
  },

  async getById(lessonId) {
    const doc = await db.lessons.findOne({ _id: lessonId });
    return doc ? { id: doc._id, ...doc } : null;
  },

  async getByUserId(userId, limit = 50) {
    console.log('📖 Fetching lessons for userId:', userId);
    const docs = await db.lessons.find({ userId }).sort({ createdAt: -1 }).limit(limit);
    console.log('   Found', docs.length, 'lessons');
    return docs.map(doc => ({ id: doc._id, ...doc }));
  },

  async update(lessonId, data) {
    await db.lessons.update({ _id: lessonId }, { $set: { ...data, updatedAt: new Date() } });
    return this.getById(lessonId);
  },

  async markComplete(lessonId) {
    return this.update(lessonId, { completed: true, completedAt: new Date() });
  },

  async delete(lessonId) {
    await db.lessons.remove({ _id: lessonId });
    return { deleted: true };
  },

  async getAll() {
    const docs = await db.lessons.find({});
    return docs.map(doc => ({ id: doc._id, ...doc }));
  }
};

// ==================== QUIZ SERVICE ====================
const quizService = {
  async create(quizData) {
    const doc = await db.quizzes.insert({ ...quizData, createdAt: new Date() });
    return { id: doc._id, ...doc };
  },

  async getById(quizId) {
    const doc = await db.quizzes.findOne({ _id: quizId });
    return doc ? { id: doc._id, ...doc } : null;
  },

  async getByUserId(userId, limit = 50) {
    const docs = await db.quizzes.find({ userId }).sort({ createdAt: -1 }).limit(limit);
    return docs.map(doc => ({ id: doc._id, ...doc }));
  },

  async update(quizId, data) {
    await db.quizzes.update({ _id: quizId }, { $set: data });
    return this.getById(quizId);
  },

  async saveResult(quizId, userId, result) {
    await this.update(quizId, { result, submittedAt: new Date() });
    await learningStatsService.updateFromQuiz(userId, result);
    return result;
  },

  // Get completed quizzes with results
  async getCompletedQuizzes(userId, limit = 50) {
    const docs = await db.quizzes.find({ 
      userId, 
      result: { $exists: true } 
    }).sort({ submittedAt: -1 }).limit(limit);
    return docs.map(doc => ({ id: doc._id, ...doc }));
  },

  // Get quiz with full details (including answers) for review
  async getQuizForReview(quizId) {
    const doc = await db.quizzes.findOne({ _id: quizId });
    return doc ? { id: doc._id, ...doc } : null;
  },

  async getAll() {
    const docs = await db.quizzes.find({});
    return docs.map(doc => ({ id: doc._id, ...doc }));
  },

  async delete(quizId) {
    await db.quizzes.remove({ _id: quizId });
    return { deleted: true };
  }
};

// ==================== CHAT SERVICE ====================
const chatService = {
  async addMessage(userId, message) {
    const doc = await db.chatHistory.insert({ userId, ...message, createdAt: new Date() });
    return { id: doc._id, ...doc };
  },

  async getHistory(userId, limit = 50) {
    const docs = await db.chatHistory.find({ userId }).sort({ createdAt: 1 }).limit(limit);
    return docs.map(doc => ({ id: doc._id, ...doc }));
  },

  async clearHistory(userId) {
    const count = await db.chatHistory.remove({ userId }, { multi: true });
    return { deleted: count };
  },

  async getAll() {
    const docs = await db.chatHistory.find({});
    return docs.map(doc => ({ id: doc._id, ...doc }));
  }
};

// ==================== LEARNING STATS SERVICE ====================
const learningStatsService = {
  getInitialStats(userId) {
    return {
      userId,
      totalLessons: 0,
      completedLessons: 0,
      totalQuizzes: 0,
      averageScore: 0,
      totalCorrect: 0,
      totalQuestions: 0,
      topicStats: {},
      weakTopics: [],
      strongTopics: [],
      streakDays: 0,
      lastActiveDate: null,
      createdAt: new Date()
    };
  },

  async getByUserId(userId) {
    let doc = await db.learningStats.findOne({ userId });
    if (!doc) {
      doc = await db.learningStats.insert(this.getInitialStats(userId));
    }
    return { id: doc._id, ...doc };
  },

  async updateFromQuiz(userId, quizResult) {
    const stats = await this.getByUserId(userId);
    
    const newTotalQuizzes = (stats.totalQuizzes || 0) + 1;
    const newTotalCorrect = (stats.totalCorrect || 0) + (quizResult.correctAnswers || 0);
    const newTotalQuestions = (stats.totalQuestions || 0) + (quizResult.totalQuestions || 0);
    const newAverageScore = newTotalQuestions > 0 ? Math.round((newTotalCorrect / newTotalQuestions) * 100) : 0;

    const topicStats = stats.topicStats || {};
    const topic = quizResult.topic || quizResult.subject || 'general';
    
    if (!topicStats[topic]) topicStats[topic] = { total: 0, correct: 0, attempts: 0 };
    topicStats[topic].total += quizResult.totalQuestions || 0;
    topicStats[topic].correct += quizResult.correctAnswers || 0;
    topicStats[topic].attempts += 1;

    const { weakTopics, strongTopics } = this.analyzeTopics(topicStats);

    await db.learningStats.update({ userId }, { $set: {
      totalQuizzes: newTotalQuizzes,
      totalCorrect: newTotalCorrect,
      totalQuestions: newTotalQuestions,
      averageScore: newAverageScore,
      topicStats, weakTopics, strongTopics,
      lastActiveDate: new Date(),
      updatedAt: new Date()
    }});

    return this.getByUserId(userId);
  },

  analyzeTopics(topicStats) {
    const topics = Object.entries(topicStats).map(([name, data]) => ({
      name,
      score: data.total > 0 ? Math.round((data.correct / data.total) * 100) : 0,
      attempts: data.attempts
    }));
    topics.sort((a, b) => a.score - b.score);
    return {
      weakTopics: topics.filter(t => t.score < 60).slice(0, 5),
      strongTopics: topics.filter(t => t.score >= 80).slice(-5).reverse()
    };
  },

  async incrementLessonCount(userId, completed = false) {
    const stats = await this.getByUserId(userId);
    const updateData = { totalLessons: (stats.totalLessons || 0) + 1, updatedAt: new Date() };
    if (completed) updateData.completedLessons = (stats.completedLessons || 0) + 1;
    await db.learningStats.update({ userId }, { $set: updateData });
    return this.getByUserId(userId);
  },

  async addStudyTime(userId, minutes) {
    const stats = await this.getByUserId(userId);
    const today = new Date().toISOString().split('T')[0];
    
    // Update daily study time
    const dailyStudy = stats.dailyStudy || {};
    dailyStudy[today] = (dailyStudy[today] || 0) + minutes;
    
    // Calculate streak
    let streakDays = stats.streakDays || 0;
    const lastDate = stats.lastActiveDate ? new Date(stats.lastActiveDate).toISOString().split('T')[0] : null;
    
    if (lastDate !== today) {
      const yesterday = new Date();
      yesterday.setDate(yesterday.getDate() - 1);
      const yesterdayStr = yesterday.toISOString().split('T')[0];
      
      if (lastDate === yesterdayStr) {
        streakDays += 1;
      } else if (lastDate !== today) {
        streakDays = 1; // Reset streak
      }
    }
    
    await db.learningStats.update({ userId }, { 
      $set: { 
        totalStudyMinutes: (stats.totalStudyMinutes || 0) + minutes,
        dailyStudy,
        streakDays,
        lastActiveDate: new Date(),
        updatedAt: new Date()
      } 
    });
    
    return this.getByUserId(userId);
  }
};

// ==================== ROADMAP SERVICE ====================
const roadmapService = {
  async create(userId, roadmapData) {
    await db.roadmaps.remove({ userId });
    const doc = await db.roadmaps.insert({
      userId,
      ...roadmapData,
      createdAt: new Date(),
      updatedAt: new Date()
    });
    return { id: doc._id, ...doc };
  },

  async getByUserId(userId) {
    const doc = await db.roadmaps.findOne({ userId });
    return doc ? { id: doc._id, ...doc } : null;
  },

  async update(userId, data) {
    await db.roadmaps.update({ userId }, { $set: { ...data, updatedAt: new Date() } });
    return this.getByUserId(userId);
  },

  // Tạo hoặc cập nhật lộ trình ôn thi
  async createOrUpdate(userId, roadmapData) {
    const existing = await this.getByUserId(userId);
    if (existing) {
      return this.update(userId, roadmapData);
    }
    return this.create(userId, roadmapData);
  },

  // Lưu kết quả phân tích điểm yếu
  async saveWeaknessAnalysis(userId, analysis) {
    const existing = await this.getByUserId(userId);
    if (existing) {
      return this.update(userId, { weaknessAnalysis: analysis });
    }
    return this.create(userId, { weaknessAnalysis: analysis });
  },

  // Cập nhật tiến độ học tập
  async updateProgress(userId, progress, notes) {
    const data = { progress, updatedAt: new Date() };
    if (notes) data.progressNotes = notes;
    await db.roadmaps.update({ userId }, { $set: data });
    return this.getByUserId(userId);
  },

  // Cập nhật kế hoạch học tập
  async updatePlan(userId, updatedPlan) {
    // Merge the updated plan with existing study plan
    const existing = await this.getByUserId(userId);
    if (!existing) return null;

    const newStudyPlan = {
      ...existing.studyPlan,
      ...updatedPlan
    };

    await db.roadmaps.update({ userId }, { 
      $set: { 
        studyPlan: newStudyPlan,
        lastAdjustedAt: new Date(),
        updatedAt: new Date()
      } 
    });
    return this.getByUserId(userId);
  },

  // Xóa lộ trình
  async delete(userId) {
    await db.roadmaps.remove({ userId });
    return { deleted: true };
  }
};

// ==================== USER SETTINGS SERVICE ====================
const userSettingsService = {
  getDefaultSettings() {
    return {
      theme: 'light',
      fontSize: 'medium',
      voiceId: 'en-US-natalie',
      autoPlayAudio: false,
      notificationsEnabled: true,
      dailyGoal: 30, // minutes
      preferredSubjects: [],
      language: 'vi'
    };
  },

  async getByUserId(userId) {
    let doc = await db.userSettings.findOne({ userId });
    if (!doc) {
      doc = await db.userSettings.insert({
        userId,
        ...this.getDefaultSettings(),
        createdAt: new Date()
      });
    }
    return { id: doc._id, ...doc };
  },

  async update(userId, settings) {
    const existing = await this.getByUserId(userId);
    await db.userSettings.update({ userId }, { 
      $set: { ...settings, updatedAt: new Date() } 
    });
    return this.getByUserId(userId);
  }
};

// ==================== BOOKMARK SERVICE ====================
const bookmarkService = {
  async create(userId, bookmark) {
    const doc = await db.bookmarks.insert({
      userId,
      type: bookmark.type, // 'lesson', 'quiz', 'topic'
      targetId: bookmark.targetId,
      title: bookmark.title,
      notes: bookmark.notes || '',
      createdAt: new Date()
    });
    return { id: doc._id, ...doc };
  },

  async getByUserId(userId) {
    const docs = await db.bookmarks.find({ userId }).sort({ createdAt: -1 });
    return docs.map(doc => ({ id: doc._id, ...doc }));
  },

  async delete(bookmarkId) {
    await db.bookmarks.remove({ _id: bookmarkId });
    return { deleted: true };
  },

  async exists(userId, targetId, type) {
    const doc = await db.bookmarks.findOne({ userId, targetId, type });
    return !!doc;
  }
};

// ==================== NOTES SERVICE ====================
const notesService = {
  async create(userId, note) {
    const doc = await db.notes.insert({
      userId,
      lessonId: note.lessonId,
      content: note.content,
      position: note.position || null, // { section, paragraph }
      highlightedText: note.highlightedText || '',
      createdAt: new Date(),
      updatedAt: new Date()
    });
    return { id: doc._id, ...doc };
  },

  async getByUserId(userId) {
    const docs = await db.notes.find({ userId }).sort({ createdAt: -1 });
    return docs.map(doc => ({ id: doc._id, ...doc }));
  },

  async getByLessonId(userId, lessonId) {
    const docs = await db.notes.find({ userId, lessonId }).sort({ createdAt: 1 });
    return docs.map(doc => ({ id: doc._id, ...doc }));
  },

  async update(noteId, content) {
    await db.notes.update({ _id: noteId }, { 
      $set: { content, updatedAt: new Date() } 
    });
    const doc = await db.notes.findOne({ _id: noteId });
    return { id: doc._id, ...doc };
  },

  async delete(noteId) {
    await db.notes.remove({ _id: noteId });
    return { deleted: true };
  }
};

// ==================== STUDY SESSION SERVICE ====================
const studySessionService = {
  async start(userId, sessionData) {
    const doc = await db.studySessions.insert({
      userId,
      lessonId: sessionData.lessonId,
      quizId: sessionData.quizId,
      type: sessionData.type, // 'lesson', 'quiz', 'review', 'practice'
      subject: sessionData.subject,
      startTime: new Date(),
      endTime: null,
      duration: 0,
      progress: 0,
      completed: false
    });
    return { id: doc._id, ...doc };
  },

  async end(sessionId, data = {}) {
    const session = await db.studySessions.findOne({ _id: sessionId });
    if (!session) return null;
    
    const endTime = new Date();
    const duration = Math.round((endTime - new Date(session.startTime)) / 1000 / 60); // minutes
    
    await db.studySessions.update({ _id: sessionId }, { 
      $set: { 
        endTime,
        duration,
        progress: data.progress || 100,
        completed: data.completed !== false,
        ...data
      } 
    });
    
    // Update daily stats
    await learningStatsService.addStudyTime(session.userId, duration);
    
    const doc = await db.studySessions.findOne({ _id: sessionId });
    return { id: doc._id, ...doc };
  },

  async getByUserId(userId, limit = 50) {
    const docs = await db.studySessions.find({ userId })
      .sort({ startTime: -1 })
      .limit(limit);
    return docs.map(doc => ({ id: doc._id, ...doc }));
  },

  async getTodaySessions(userId) {
    const today = new Date();
    today.setHours(0, 0, 0, 0);
    const docs = await db.studySessions.find({ 
      userId, 
      startTime: { $gte: today } 
    });
    return docs.map(doc => ({ id: doc._id, ...doc }));
  },

  async getWeeklyStats(userId) {
    const weekAgo = new Date();
    weekAgo.setDate(weekAgo.getDate() - 7);
    const docs = await db.studySessions.find({ 
      userId, 
      startTime: { $gte: weekAgo } 
    });
    
    // Group by date
    const dailyStats = {};
    docs.forEach(doc => {
      const date = new Date(doc.startTime).toISOString().split('T')[0];
      if (!dailyStats[date]) {
        dailyStats[date] = { totalMinutes: 0, sessions: 0 };
      }
      dailyStats[date].totalMinutes += doc.duration || 0;
      dailyStats[date].sessions += 1;
    });
    
    return dailyStats;
  }
};

// ==================== AUDIO HISTORY SERVICE ====================
const audioHistoryService = {
  async log(userId, audioData) {
    const doc = await db.audioHistory.insert({
      userId,
      lessonId: audioData.lessonId,
      sectionId: audioData.sectionId,
      text: audioData.text?.substring(0, 200), // First 200 chars
      cacheKey: audioData.cacheKey,
      duration: audioData.duration,
      playedAt: new Date()
    });
    return { id: doc._id, ...doc };
  },

  async getByUserId(userId, limit = 100) {
    const docs = await db.audioHistory.find({ userId })
      .sort({ playedAt: -1 })
      .limit(limit);
    return docs.map(doc => ({ id: doc._id, ...doc }));
  },

  async getStats(userId) {
    const docs = await db.audioHistory.find({ userId });
    const totalPlays = docs.length;
    const totalDuration = docs.reduce((sum, d) => sum + (d.duration || 0), 0);
    return { totalPlays, totalDuration };
  }
};

// ==================== ACTIVITY LOG SERVICE ====================
const activityLogService = {
  async log(userId, activity) {
    const doc = await db.activityLog.insert({
      userId,
      action: activity.action, // 'lesson_view', 'quiz_submit', 'bookmark_add', etc.
      targetType: activity.targetType, // 'lesson', 'quiz', 'note', etc.
      targetId: activity.targetId,
      details: activity.details || {},
      timestamp: new Date()
    });
    return { id: doc._id, ...doc };
  },

  async getByUserId(userId, limit = 100) {
    const docs = await db.activityLog.find({ userId })
      .sort({ timestamp: -1 })
      .limit(limit);
    return docs.map(doc => ({ id: doc._id, ...doc }));
  },

  async getRecentActivity(userId, days = 7) {
    const since = new Date();
    since.setDate(since.getDate() - days);
    const docs = await db.activityLog.find({ 
      userId, 
      timestamp: { $gte: since } 
    }).sort({ timestamp: -1 });
    return docs.map(doc => ({ id: doc._id, ...doc }));
  },

  async getAll() {
    const docs = await db.activityLog.find({});
    return docs.map(doc => ({ id: doc._id, ...doc }));
  }
};

module.exports = {
  db,
  userService,
  lessonService,
  quizService,
  chatService,
  chatHistoryService: chatService, // Alias for admin controller
  learningStatsService,
  roadmapService,
  userSettingsService,
  bookmarkService,
  notesService,
  studySessionService,
  audioHistoryService,
  activityLogService
};
