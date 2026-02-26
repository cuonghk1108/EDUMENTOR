# 🎮 Hệ Thống Tương Tác Người Dùng (Engagement System)

## 📋 Tổng quan

Hệ thống gamification và tương tác người dùng đã được thêm vảo EduMentor để tăng động lực học tập và giữ chân người dùng. Hệ thống bao gồm:

✅ **Nhiệm vụ hàng ngày** (Daily Missions)
✅ **Huy hiệu thành tích** (Achievement Badges)  
✅ **Modal chào mừng** (Welcome Modal)
✅ **XP và điểm thưởng** (XP & Rewards System)

---

## 🎯 1. Nhiệm vụ Hàng ngày (Daily Missions)

### Vị trí hiển thị
- Dashboard trang chủ (hàng trên, bên trái)
- Hiện ngay sau phần "Truy cập nhanh"

### Các nhiệm vụ
| Icon | Nhiệm vụ | Mục tiêu | XP |
|------|----------|----------|-----|
| 📚 | Hoàn thành bài học | 3 bài | 50 XP |
| ✅ | Làm quiz | 2 quiz | 30 XP |
| 🔥 | Duy trì chuỗi học tập | 1 ngày | 100 XP |
| 💬 | Trò chuyện với AI | 5 tin nhắn | 40 XP |
| 🌟 | Đạt điểm cao | ≥80% điểm quiz | 150 XP |

### Tính năng
- ✅ Progress bar thời gian thực
- ✅ Màu xanh khi hoàn thành + biểu tượng ✓
- ✅ Emoji động khi hoàn thành tất cả (🎉)
- ✅ Hiển thị tổng số XP kiếm được trong ngày
- ✅ Hoạt ảnh fade-in từng nhiệm vụ

---

## 🏆 2. Huy hiệu Thành tích (Achievement Badges)

### Vị trí hiển thị
- Dashboard trang chủ (hàng trên, bên phải)
- Grid 4 cột trên desktop, responsive trên mobile

### Các huy hiệu

| Icon | Tên | Điều kiện mở khóa |
|------|-----|-------------------|
| 📖 | Học viên mới | Hoàn thành bài học đầu tiên |
| 🔥 | Người kiên trì | Duy trì chuỗi 7 ngày |
| ⭐ | Chuyên gia | Duy trì chuỗi 30 ngày |
| 🎯 | Bậc thầy quiz | Làm 50+ quiz |
| 💯 | Điểm hoàn hảo | Đạt 100% ít nhất 1 quiz |
| 🌅 | Chim sớm | Học trước 8:00 sáng |
| 🌙 | Cú đêm | Học sau 22:00 |
| 💬 | Người trò chuyện | Gửi 100+ tin nhắn AI |

### Tính năng
- ✅ Progress bar tổng thể (X/8 huy hiệu)
- ✅ Màu sắc gradient cho huy hiệu đã mở
- ✅ Grayscale + icon khóa 🔒 cho huy hiệu chưa mở
- ✅ Tooltip hiện chi tiết khi hover
- ✅ Animation scale khi hover
- ✅ Mẹo mở khóa ở cuối card

---

## 👋 3. Modal Chào mừng (Welcome Modal)

### Khi nào hiện?
- ✅ Người dùng mới đăng nhập lần đầu
- ✅ Chỉ hiện 1 lần (lưu trong localStorage: `hasSeenWelcome`)

### Nội dung
1. **Lời chào cá nhân hóa**: "Chào mừng [Tên]! 🎉"
2. **Câu trích dẫn động lực**: Random từ 8 câu trích dẫn nổi tiếng
3. **3 tính năng chính**:
   - 📚 Học bài với AI
   - 🎯 Hoàn thành nhiệm vụ
   - 🏆 Mở khóa huy hiệu
4. **Call-to-Action**: "Bắt đầu học ngay! 🚀"

### Thiết kế
- Background gradient (purple/pink)
- Animated orbs floating
- Framer Motion animations (scale, opacity)
- Blur backdrop
- Click ngoài modal hoặc nút X để đóng

---

## 📊 4. Tích hợp Dashboard

### Các file đã sửa đổi

```
frontend/src/
├── components/
│   ├── DailyMissions.js        ⭐ NEW
│   ├── AchievementBadges.js    ⭐ NEW  
│   └── WelcomeModal.js         ⭐ NEW
├── utils/
│   └── engagement.js           ⭐ NEW
└── pages/
    └── Dashboard.js            ✏️ MODIFIED
```

### Dashboard.js Changes

**Imports mới:**
```javascript
import DailyMissions from '../components/DailyMissions';
import AchievementBadges from '../components/AchievementBadges';
import WelcomeModal from '../components/WelcomeModal';
```

**State mới:**
```javascript
const [showWelcome, setShowWelcome] = useState(false);
```

**UserStats object:**
```javascript
const userStats = {
  completedLessons: overview.completedLessons,
  completedQuizzes: overview.totalQuizzes,
  streakDays: overview.streakDays,
  totalMessages: 0, // TODO: track from chat
  averageScore: overview.averageScore,
  perfectScores: 0, // TODO: track perfect scores
  lastActivity: new Date().toISOString().split('T')[0]
};
```

**Vị trí components:**
```jsx
{/* Sau Quick Actions, trước Main Stats */}
<div className="grid lg:grid-cols-2 gap-6">
  <DailyMissions userStats={userStats} />
  <AchievementBadges userStats={userStats} />
</div>

{/* Cuối Dashboard */}
<WelcomeModal isOpen={showWelcome} onClose={handleCloseWelcome} userName={user?.name} />
```

---

## 🔧 5. Backend Integration

### Đã thêm vào Dashboard API

```javascript
// backend/controllers/dashboardController.js
const dashboard = {
  // ... existing fields
  engagement: {
    totalMessages: 123,        // Số tin nhắn với AI
    perfectScores: 5,          // Số quiz đạt 100%
    earlyMorningStudies: 12,   // Số lần học sáng sớm (5-8h)
    lateNightStudies: 8        // Số lần học đêm khuya (22h+)
  }
};
```

### Cách tính các metrics

**totalMessages**: Đếm từ `chatHistory` collection
```javascript
const chatHistory = await chatService.getByUserId(userId, 10000);
const totalMessages = chatHistory.filter(msg => msg.role === 'user').length;
```

**perfectScores**: Đếm quiz có điểm 100%
```javascript
const allQuizzes = await quizService.getByUserId(userId, 1000);
const perfectScores = allQuizzes.filter(quiz => {
  if (!quiz.result) return false;
  const score = (quiz.result.correctAnswers / quiz.result.totalQuestions) * 100;
  return score === 100;
}).length;
```

**earlyMorningStudies**: Đếm hoạt động 5-8h sáng
```javascript
const studyTimes = allQuizzes
  .filter(q => q.createdAt)
  .map(q => new Date(q.createdAt).getHours());
const earlyMorningStudies = studyTimes.filter(hour => hour >= 5 && hour < 8).length;
```

**lateNightStudies**: Đếm hoạt động 22h+ hoặc trước 5h
```javascript
const lateNightStudies = studyTimes.filter(hour => hour >= 22 || hour < 5).length;
```

### Frontend Integration

**Dashboard.js** lấy dữ liệu từ API:
```javascript
const { overview, performance, engagement, weaknesses, strengths, recentActivity } = dashboard;

const userStats = {
  completedLessons: overview.completedLessons,
  completedQuizzes: overview.totalQuizzes,
  streakDays: overview.streakDays,
  totalMessages: engagement?.totalMessages || 0,      // ✅ Đồng bộ
  averageScore: overview.averageScore,
  perfectScores: engagement?.perfectScores || 0,      // ✅ Đồng bộ
  earlyMorningStudies: engagement?.earlyMorningStudies || 0,  // ✅ Đồng bộ
  lateNightStudies: engagement?.lateNightStudies || 0,        // ✅ Đồng bộ
  lastActivity: new Date().toISOString().split('T')[0]
};
```

### Achievement Unlock Conditions

**engagement.js** sử dụng userStats:
```javascript
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
    return (userStats.perfectScores || 0) > 0;  // ✅ Đồng bộ
  }
  if (unlockCondition.chats) {
    return (userStats.totalMessages || 0) >= unlockCondition.chats;  // ✅ Đồng bộ
  }
  if (unlockCondition.earlyBird) {
    return (userStats.earlyMorningStudies || 0) > 0;  // ✅ Đồng bộ
  }
  if (unlockCondition.nightOwl) {
    return (userStats.lateNightStudies || 0) > 0;  // ✅ Đồng bộ
  }
  
  return false;
};
```

---

## 🔧 6. Cấu hình và Tùy chỉnh

### Thêm nhiệm vụ mới

Edit `frontend/src/utils/engagement.js`:

```javascript
export const DAILY_MISSIONS = [
  {
    id: 'new-mission',
    title: 'Tên nhiệm vụ',
    description: 'Mô tả',
    icon: '📱',
    target: 5,
    xp: 60,
    checkProgress: (userStats) => userStats.customMetric || 0
  },
  // ... existing missions
];
```

### Thêm huy hiệu mới

```javascript
export const ACHIEVEMENTS = [
  {
    id: 'new-badge',
    title: 'Tên huy hiệu',
    description: 'Mô tả điều kiện',
    icon: '🎖️',
    condition: (userStats) => userStats.customCondition >= 10
  },
  // ... existing badges
];
```

### Thêm câu trích dẫn

```javascript
export const MOTIVATIONAL_TIPS = [
  {
    text: 'Câu trích dẫn mới',
    author: 'Tác giả',
    icon: '💡'
  },
  // ... existing tips
];
```

---

## 📈 6. Hiệu suất (Performance)

### Bundle size impact
- **Before**: 497.25 kB (main.js)
- **After**: 500.74 kB (main.js)
- **Increase**: +3.49 kB (~0.7%)

### Optimizations
✅ Lazy evaluation of conditions
✅ Memoized progress calculations
✅ localStorage caching (welcome modal)
✅ CSS animations over JS where possible
✅ Framer Motion với `layoutId` reuse

---

## 🎨 7. Animations & UX

### Framer Motion
- `initial/animate/exit` states
- Spring physics: `damping: 25, stiffness: 300`
- Staggered children delays (0.05s intervals)
- Scale on hover/tap: `whileHover={{ scale: 1.05 }}`

### CSS
- Gradient backgrounds: `from-purple-500 to-pink-500`
- Progress bars: animated width transitions
- Pulse animations: `xp-pulse` class
- Glow effects: `shadow-lg shadow-purple-500/25`

### Emojis
- Animated emojis khi hoàn thành (🎉)
- Fire emoji pulse cho streak (🔥)
- Waving hand cho greeting (👋)

---

## 📱 8. Responsive Design

### Desktop (≥1024px)
- Grid 2 cột (Daily Missions | Achievements)
- 4 cột cho badges grid
- Full tooltips on hover

### Tablet (768-1023px)
- Stack vertically
- 4 cột cho badges
- Touch-friendly tap areas

### Mobile (<768px)
- Single column layout
- 4 cột cho badges (smaller icons)
- Modal full-screen with padding

---

## 🚀 9. Next Steps (TODO)

### Backend tracking
- [ ] Track `totalMessages` from chat history  
- [ ] Track `perfectScores` count from quiz results
- [ ] Store daily mission completion in DB
- [ ] Store achievement unlock dates
- [ ] API endpoint: `GET /api/engagement/stats/:userId`
- [ ] API endpoint: `POST /api/engagement/complete-mission`

### Frontend enhancements
- [ ] Push notifications khi unlock achievement
- [ ] Confetti animation khi mở huy hiệu mới
- [ ] Leaderboard (top users by XP)
- [ ] Weekly/monthly XP charts
- [ ] "Share achievement" social buttons
- [ ] Avatar badge display (show best 3 badges)

### Analytics
- [ ] Track engagement metrics (mission completion rate)
- [ ] A/B test different XP values
- [ ] Monitor retention increase

---

## 🧪 10. Testing

### Manual testing checklist

Dashboard load:
- [ ] DailyMissions renders correctly
- [ ] AchievementBadges renders correctly
- [ ] Mission progress shows current values
- [ ] Badges show locked/unlocked states

Welcome modal:
- [ ] Shows on first visit
- [ ] Doesn't show on subsequent visits
- [ ] Closes on X click
- [ ] Closes on outside click
- [ ] localStorage `hasSeenWelcome` is set

Animations:
- [ ] Stagger effect on mount
- [ ] Progress bars animate smoothly
- [ ] Hover effects work
- [ ] Modal transitions smooth

Responsive:
- [ ] Looks good on mobile
- [ ] Tooltips work on touch
- [ ] Grid adapts properly

---

## 🐛 11. Known Issues & Fixes

### Issue: Welcome modal prop mismatch
**Fixed**: Changed from conditional render to `isOpen` prop

### Issue: Unused imports warnings
**Fixed**: Removed `triggerConfetti` and `useEffect` unused imports

### Issue: userStats missing data
**Workaround**: Using 0 for `totalMessages` and `perfectScores` until backend tracking added

---

## 📞 12. Support

Nếu có vấn đề:
1. Check console for errors
2. Clear localStorage: `localStorage.clear()`
3. Check that user data loads: `console.log(userStats)`
4. Verify engagement.js functions: `checkMissionProgress()`, `checkAchievementUnlock()`

---

## ✨ Chúc học vui! 🚀
