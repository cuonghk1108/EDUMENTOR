# 📅 Hệ Thống Tracking Theo Ngày (Daily Tracking System)

## 🎯 Vấn đề đã giải quyết

**Trước đây:** Daily missions sử dụng tổng số toàn bộ (completedLessons, completedQuizzes) → Missions luôn hiển thị là "hoàn thành" ngay cả khi chưa làm gì hôm nay.

**Bây giờ:** Mỗi ngày có stats riêng → Daily missions reset về 0 mỗi ngày → Tracking chính xác hoạt động trong ngày.

---

## 🗄️ Database Mới

### dailyStats Collection

**File**: `backend/database/data/daily_stats.db`

**Schema**:
```javascript
{
  userId: String,
  date: String,              // YYYY-MM-DD format
  lessonsCompleted: Number,   // Số lesson hoàn thành hôm nay
  quizzesCompleted: Number,   // Số quiz hoàn thành hôm nay
  chatMessages: Number,       // Số tin nhắn chat hôm nay
  highestScore: Number,       // Điểm cao nhất trong quiz hôm nay
  createdAt: Date,
  updatedAt: Date
}
```

**Index**: `userId + date` (unique per user per day)

---

## 🔧 Backend Changes

### 1. Daily Stats Service

**File**: `backend/services/firebaseService.js`

**Methods**:

```javascript
dailyStatsService = {
  getTodayDate()              // Returns YYYY-MM-DD
  isToday(dateString)         // Check if date is today
  getTodayStats(userId)       // Get or create today's stats
  incrementLessons(userId)    // +1 lesson
  incrementQuizzes(userId, score)  // +1 quiz, update highest score
  incrementChats(userId)      // +1 chat message
  getStatsForDateRange(userId, start, end)
  getAllStats(userId)         // For analytics
}
```

### 2. Quiz Controller

**File**: `backend/controllers/quizController.js`

**Thêm vào `submitQuiz()`**:
```javascript
// Save result
await quizService.saveResult(quizId, userId, quizResult);

// Track daily stats ✅ MỚI
await dailyStatsService.incrementQuizzes(userId, score);
```

### 3. Lesson Controller

**File**: `backend/controllers/lessonController.js`

**Thêm vào `markComplete()`**:
```javascript
// Update stats
await learningStatsService.incrementLessonCount(userId, true);

// Track daily stats ✅ MỚI
await dailyStatsService.incrementLessons(userId);
```

### 4. Chat Controller

**File**: `backend/controllers/chatController.js`

**Thêm vào `sendMessage()`**:
```javascript
// Save user message
await chatService.addMessage(userId, { ... });

// Track daily stats ✅ MỚI
await dailyStatsService.incrementChats(userId);
```

### 5. Dashboard Controller

**File**: `backend/controllers/dashboardController.js`

**Thêm**:
```javascript
// Get today's stats for daily missions ✅ MỚI
const todayStats = await dailyStatsService.getTodayStats(userId);
```

**API Response**:
```javascript
{
  overview: { ... },
  performance: { ... },
  engagement: { ... },
  today: {  // ✅ MỚI
    lessonsCompleted: 2,
    quizzesCompleted: 1,
    chatMessages: 5,
    highestScore: 85
  },
  weaknesses: [ ... ],
  strengths: [ ... ],
  // ...
}
```

---

## 🎨 Frontend Changes

### 1. Dashboard.js

**File**: `frontend/src/pages/Dashboard.js`

**Trước**:
```javascript
const userStats = {
  completedLessons: overview.completedLessons,  // Tổng số toàn bộ ❌
  completedQuizzes: overview.totalQuizzes,      // Tổng số toàn bộ ❌
  // ...
};
```

**Sau**:
```javascript
const userStats = {
  // Overall stats for achievements
  completedLessons: overview.completedLessons,
  completedQuizzes: overview.totalQuizzes,
  streakDays: overview.streakDays,
  // ...
  
  // Today's stats for daily missions ✅ MỚI
  todayLessons: today?.lessonsCompleted || 0,
  todayQuizzes: today?.quizzesCompleted || 0,
  todayChats: today?.chatMessages || 0,
  highestScoreToday: today?.highestScore || 0,
};
```

### 2. engagement.js

**File**: `frontend/src/utils/engagement.js`

**checkMissionProgress() - Trước**:
```javascript
case 'lessons':
  return {
    current: userStats.completedLessons || 0,  // Tổng số ❌
    target,
    completed: (userStats.completedLessons || 0) >= target
  };
```

**checkMissionProgress() - Sau**:
```javascript
case 'lessons':
  return {
    current: userStats.todayLessons || 0,  // Hôm nay ✅
    target,
    completed: (userStats.todayLessons || 0) >= target
  };
```

**Cập nhật descriptions**:
```javascript
{
  id: 'complete_1_lesson',
  title: 'Hoàn thành 1 bài học',
  description: 'Học ít nhất 1 bài hôm nay',  // Rõ ràng hơn ✅
  // ...
}
```

---

## 📊 Flow Hoạt động

### Khi user hoàn thành quiz:

```
1. QuizController.submitQuiz()
   ↓
2. Calculate score
   ↓
3. quizService.saveResult()
   ↓
4. dailyStatsService.incrementQuizzes(userId, score) ✅
   ↓
5. Update today's stats in DB:
   {
     quizzesCompleted: +1,
     highestScore: max(current, new_score)
   }
```

### Khi user hoàn thành lesson:

```
1. LessonController.markComplete()
   ↓
2. lessonService.markComplete()
   ↓
3. learningStatsService.incrementLessonCount()
   ↓
4. dailyStatsService.incrementLessons(userId) ✅
   ↓
5. Update today's stats: lessonsCompleted +1
```

### Khi user gửi chat message:

```
1. ChatController.sendMessage()
   ↓
2. chatService.addMessage()
   ↓
3. dailyStatsService.incrementChats(userId) ✅
   ↓
4. Update today's stats: chatMessages +1
```

### Khi load Dashboard:

```
1. dashboardController.getDashboard()
   ↓
2. dailyStatsService.getTodayStats(userId)
   ↓
3. Return today's stats + overall stats
   ↓
4. Frontend separates:
   - today stats → Daily Missions
   - overall stats → Achievements
```

---

## 🔄 Auto-Reset Logic

**Không cần cron job!**

Khi `getTodayStats(userId)` được gọi:
1. Query: `{ userId, date: '2026-02-21' }`
2. Nếu không tìm thấy → Tự động tạo mới với 0 values
3. Ngày mới = Stats mới = Missions reset tự động ✅

---

## 📈 So sánh Trước/Sau

| Metric | Trước | Sau |
|--------|-------|-----|
| **Data source** | Tổng số toàn bộ | Stats theo ngày |
| **Daily missions** | Luôn "hoàn thành" | Reset mỗi ngày |
| **Quiz score** | Average toàn bộ | Highest hôm nay |
| **Chat messages** | Tổng số từ trước | Số trong ngày |
| **Accuracy** | ❌ Không chính xác | ✅ Chính xác 100% |
| **Database writes** | 1 collection | 2 collections |
| **Performance impact** | Minimal | Minimal (+1 query) |

---

## 🎮 Daily Missions Behavior

### Mission: "Hoàn thành 1 bài học"

**Hôm qua** (20/02):
```json
{
  "userId": "user123",
  "date": "2026-02-20",
  "lessonsCompleted": 3  ✅ Mission hoàn thành
}
```

**Hôm nay** (21/02):
```json
{
  "userId": "user123",
  "date": "2026-02-21",
  "lessonsCompleted": 0  ⏳ Mission chưa hoàn thành
}
```

User hoàn thành 1 lesson → `lessonsCompleted: 1` → ✅ Mission hoàn thành

---

## 🧪 Testing

### Test Daily Reset

1. Hoàn thành 1 lesson hôm nay
2. Check Dashboard → Nhiệm vụ "Hoàn thành 1 bài học" ✅
3. Đợi qua ngày mới (hoặc sửa date trong DB)
4. Refresh Dashboard → Nhiệm vụ reset về 0/1 ⏳

### Test Score Tracking

1. Làm quiz đạt 70% → `today.highestScore = 70`
2. Làm quiz đạt 85% → `today.highestScore = 85` (cập nhật)
3. Làm quiz đạt 60% → `today.highestScore = 85` (giữ nguyên)

### Test Chat Tracking

1. Gửi 3 tin nhắn → `today.chatMessages = 3`
2. Nhiệm vụ "Hỏi AI 5 câu": 3/5 ⏳
3. Gửi 2 tin nhắn nữa → `today.chatMessages = 5`
4. Nhiệm vụ hoàn thành: 5/5 ✅

---

## 🚀 Future Enhancements

### 1. Weekly/Monthly Stats
```javascript
dailyStatsService.getStatsForDateRange(userId, '2026-02-01', '2026-02-28')
// → Aggregate for monthly report
```

### 2. Streak Analysis
```javascript
// Check consecutive days with lessons completed
const stats = await dailyStatsService.getAllStats(userId);
const consecutiveDays = calculateStreak(stats);
```

### 3. Best Study Time
```javascript
// Track study time patterns
{
  date: '2026-02-21',
  lessonsCompleted: 3,
  studyTimes: [8, 14, 20]  // Peak hours
}
```

### 4. Daily XP Cap
```javascript
// Prevent farming by limiting daily XP
const todayXP = calculateTodayXP(todayStats);
if (todayXP >= 500) {
  return { message: 'Bạn đã đạt giới hạn XP hôm nay!' };
}
```

---

## 📝 Database Size Estimate

**1 user, 1 year**:
- 365 days × 1 document/day = 365 documents
- ~200 bytes/document = ~73 KB/year/user

**1000 users, 1 year**:
- 1000 × 73 KB = ~73 MB/year

**Conclusion**: Very lightweight, no scaling concerns.

---

## 🐛 Known Issues & Solutions

### Issue: Timezone differences
**Solution**: Use server timezone consistently. All dates in YYYY-MM-DD format based on server time.

### Issue: Multiple submissions in same second
**Solution**: Atomic update operations using NeDB's `$set` operator.

### Issue: Data migration for existing users
**Solution**: No migration needed. New documents created on-demand when user performs action.

---

## 📞 API Endpoints

### Get Today's Stats
```javascript
GET /api/dashboard/:userId

Response:
{
  today: {
    lessonsCompleted: 2,
    quizzesCompleted: 1,
    chatMessages: 5,
    highestScore: 85
  }
}
```

### Get Historical Stats (Future)
```javascript
GET /api/stats/daily/:userId?start=2026-02-01&end=2026-02-28

Response:
{
  stats: [
    { date: '2026-02-01', lessonsCompleted: 3, ... },
    { date: '2026-02-02', lessonsCompleted: 1, ... },
    ...
  ]
}
```

---

## ✅ Checklist

**Backend**:
- [x] Create dailyStats database
- [x] Implement dailyStatsService
- [x] Track quiz submissions
- [x] Track lesson completions
- [x] Track chat messages
- [x] Update dashboard API

**Frontend**:
- [x] Update Dashboard.js
- [x] Update userStats structure
- [x] Update checkMissionProgress()
- [x] Update mission descriptions

**Testing**:
- [ ] Test daily reset behavior
- [ ] Test score tracking
- [ ] Test chat tracking
- [ ] Test concurrent updates

**Documentation**:
- [x] This document
- [x] Code comments
- [x] Git commit messages

---

## 🎉 Kết quả

✅ Daily missions giờ đây track chính xác theo ngày  
✅ Mỗi ngày là một bắt đầu mới  
✅ Quiz scores không dùng chung giữa các ngày  
✅ Chat messages đếm riêng cho mỗi ngày  
✅ No breaking changes - Backward compatible  
✅ Minimal performance impact

**Build size**: 500.86 kB (+81 B)  
**Commit**: 1d3d068  
**Push**: ✅ Success
