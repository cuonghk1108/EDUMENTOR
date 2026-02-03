/**
 * Database Service - NeDB Local NoSQL
 * All data persisted to disk in /data/ folder
 * 
 * GIA SƯ AI - Backend Database Service
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
};

// Create indexes
db.users.ensureIndex({ fieldName: 'email', unique: true });
db.lessons.ensureIndex({ fieldName: 'userId' });
db.quizzes.ensureIndex({ fieldName: 'userId' });
db.chatHistory.ensureIndex({ fieldName: 'userId' });
db.learningStats.ensureIndex({ fieldName: 'userId', unique: true });
db.roadmaps.ensureIndex({ fieldName: 'userId', unique: true });

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

module.exports = {
  db,
  userService,
  lessonService,
  quizService,
  chatService,
  learningStatsService,
  roadmapService
};
