# 📱 EduMentor AI - Mobile App

Ứng dụng di động React Native + Expo cho nền tảng học tập thông minh EduMentor AI.

## ✨ Tính năng

### 🎯 Core Features
- **Splash Screen** - Animation mượt mà với branding
- **Authentication** - Đăng nhập/Đăng ký với validation
- **Home Dashboard** - Tổng quan tiến độ học tập
- **Lessons** - Danh sách bài học với filter theo môn
- **Lesson Detail** - Nội dung bài học với Math rendering, Audio TTS
- **Quiz** - Làm bài kiểm tra với timer, progress tracking
- **Chat AI** - Trò chuyện với AI hỗ trợ học tập
- **Upload** - Tải PDF/ảnh để AI phân tích
- **Profile** - Quản lý tài khoản, cài đặt

### 🎨 UI/UX Highlights
- **Mobile First Design** - Tối ưu cho màn hình nhỏ
- **Smooth Animations** - react-native-reanimated
- **Bottom Tab Navigation** - Điều hướng trực quan
- **Dark/Light Mode Ready** - Theme system linh hoạt
- **Gesture Support** - Swipe, pull-to-refresh

## 🚀 Quick Start

### Prerequisites
```bash
node >= 18.x
npm >= 9.x
Expo CLI
```

### Installation
```bash
# Di chuyển vào thư mục mobile
cd mobile

# Cài đặt dependencies
npm install

# Chạy development server
npx expo start
```

### Run on Device
```bash
# iOS Simulator
npx expo run:ios

# Android Emulator  
npx expo run:android

# Physical device (scan QR code)
npx expo start --tunnel
```

## 📁 Project Structure

```
mobile/
├── App.js                    # Entry point
├── app.json                  # Expo config
├── package.json              # Dependencies
├── babel.config.js           # Babel config
├── src/
│   ├── components/           # Reusable components
│   │   ├── Button.js
│   │   ├── Card.js
│   │   ├── Input.js
│   │   ├── Header.js
│   │   └── index.js
│   ├── context/              # React Context
│   │   └── AuthContext.js
│   ├── navigation/           # Navigation config
│   │   └── index.js
│   ├── screens/              # App screens
│   │   ├── auth/
│   │   │   ├── SplashScreen.js
│   │   │   ├── LoginScreen.js
│   │   │   └── RegisterScreen.js
│   │   ├── main/
│   │   │   ├── HomeScreen.js
│   │   │   ├── DashboardScreen.js
│   │   │   ├── UploadScreen.js
│   │   │   ├── LessonsScreen.js
│   │   │   ├── LessonDetailScreen.js
│   │   │   ├── QuizTakeScreen.js
│   │   │   ├── QuizResultScreen.js
│   │   │   ├── ChatScreen.js
│   │   │   └── ProfileScreen.js
│   │   └── index.js
│   ├── services/             # API services
│   │   └── api.js
│   └── theme/                # Design system
│       └── index.js
```

## 🎨 Theme System

### Colors
```javascript
Colors = {
  primary: '#2563eb',      // Blue
  secondary: '#7c3aed',    // Purple
  accent: '#ec4899',       // Pink
  success: '#10b981',      // Green
  warning: '#f59e0b',      // Orange
  error: '#ef4444',        // Red
  background: '#f8fafc',
  surface: '#ffffff',
  textPrimary: '#1e293b',
  textSecondary: '#64748b',
}
```

### Typography
```javascript
FontSize = {
  xs: 12,
  sm: 14,
  md: 16,
  lg: 18,
  xl: 20,
  xxl: 24,
  xxxl: 32,
}
```

### Spacing
```javascript
Spacing = {
  xs: 4,
  sm: 8,
  md: 12,
  lg: 16,
  xl: 24,
  xxl: 32,
}
```

## 📱 Screens Overview

### Auth Flow
1. **Splash** → Logo animation → Check auth
2. **Login** → Email/Password form
3. **Register** → Full registration form

### Main Flow
1. **Home** → Dashboard, Quick actions, Recent lessons
2. **Lessons** → Categories, List, Search
3. **Lesson Detail** → Content, Audio, Quiz
4. **Quiz** → Timer, Questions, Submit
5. **Quiz Result** → Score, Review, Share
6. **Upload** → Pick file, Progress, AI processing
7. **Chat** → AI conversation
8. **Dashboard** → Stats, Charts, Weak points
9. **Profile** → Settings, Account, Logout

## 🔗 API Integration

### Base URLs
```javascript
// Development
http://localhost:5000/api

// Production
https://api.edumentor.io.vn/api
```

### Endpoints Used
- `POST /auth/login`
- `POST /auth/register`
- `GET /lessons`
- `GET /lessons/:id`
- `POST /quiz/submit`
- `POST /chat`
- `POST /upload`
- `GET /dashboard/stats`

## 📦 Key Dependencies

```json
{
  "expo": "~52.0.0",
  "@react-navigation/native": "^6.x",
  "@react-navigation/native-stack": "^6.x",
  "@react-navigation/bottom-tabs": "^6.x",
  "react-native-reanimated": "~3.16.0",
  "react-native-gesture-handler": "~2.20.0",
  "react-native-safe-area-context": "~4.12.0",
  "expo-linear-gradient": "~14.0.0",
  "expo-av": "~15.0.0",
  "expo-document-picker": "~13.0.0",
  "expo-image-picker": "~16.0.0",
  "@expo/vector-icons": "^14.0.0",
  "axios": "^1.6.0",
  "@react-native-async-storage/async-storage": "^1.21.0"
}
```

## 🔧 Development Tips

### Hot Reload
```bash
# Shake device or press 'R' in terminal
```

### Debug
```bash
# Open React Native Debugger
npx expo start --dev-client
```

### Build for Production
```bash
# Build APK
eas build -p android --profile preview

# Build iOS
eas build -p ios --profile preview
```

## 🐛 Troubleshooting

### Common Issues

1. **Metro bundler error**
   ```bash
   npx expo start -c  # Clear cache
   ```

2. **Dependencies mismatch**
   ```bash
   npx expo install --fix
   ```

3. **iOS pods error**
   ```bash
   cd ios && pod install --repo-update
   ```

## 📄 License

MIT License - EduMentor AI Team

---

**Happy Coding! 🚀**
