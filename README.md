# 🎓 GIA SƯ AI - Gia Sư Cá Nhân Thông Minh

<div align="center">

![Logo](./docs/images/logo.png)

**Nền tảng học tập thông minh dành cho học sinh THPT Việt Nam**

[![Made with React](https://img.shields.io/badge/Made%20with-React-61DAFB?style=for-the-badge&logo=react)](https://reactjs.org/)
[![Node.js](https://img.shields.io/badge/Node.js-339933?style=for-the-badge&logo=nodedotjs&logoColor=white)](https://nodejs.org/)
[![Firebase](https://img.shields.io/badge/Firebase-FFCA28?style=for-the-badge&logo=firebase&logoColor=black)](https://firebase.google.com/)
[![OpenAI](https://img.shields.io/badge/OpenAI-412991?style=for-the-badge&logo=openai&logoColor=white)](https://openai.com/)

</div>

---

## 📋 Mục Lục

1. [Giới Thiệu](#-giới-thiệu)
2. [Tính Năng](#-tính-năng)
3. [Kiến Trúc Hệ Thống](#-kiến-trúc-hệ-thống)
4. [Công Nghệ Sử Dụng](#-công-nghệ-sử-dụng)
5. [Cài Đặt](#-cài-đặt)
6. [Hướng Dẫn Sử Dụng](#-hướng-dẫn-sử-dụng)
7. [API Documentation](#-api-documentation)
8. [Điểm Sáng Cho Ban Giám Khảo](#-điểm-sáng-cho-ban-giám-khảo)

---

## 🎯 Giới Thiệu

**GIA SƯ AI** là nền tảng học tập thông minh, ứng dụng trí tuệ nhân tạo để hỗ trợ học sinh THPT Việt Nam học tập hiệu quả hơn. 

### Vấn Đề Giải Quyết

- 📚 Học sinh thiếu gia sư cá nhân hỗ trợ 24/7
- 📖 Sách giáo khoa khô khan, khó tiếp thu
- ❓ Không có ai giải đáp thắc mắc ngay lập tức
- 📊 Không biết điểm yếu của mình ở đâu
- 🗺️ Thiếu lộ trình học tập cá nhân hóa

### Giải Pháp

GIA SƯ AI chuyển đổi sách giáo khoa thành:
- ✨ Bài giảng dễ hiểu với ví dụ thực tế
- 🎯 Câu hỏi trắc nghiệm kiểm tra kiến thức
- 💬 Chatbot hỏi đáp 24/7
- 🔊 Bài giảng audio để học mọi lúc mọi nơi
- 📈 Dashboard theo dõi tiến độ và phân tích điểm yếu

---

## ✨ Tính Năng

### Core Features

| Tính năng | Mô tả |
|-----------|-------|
| 📤 Upload SGK | Tải lên PDF hoặc ảnh chụp sách giáo khoa |
| 🔍 OCR thông minh | Trích xuất văn bản từ ảnh với độ chính xác cao |
| 📝 Bài giảng AI | Chuyển nội dung thành bài giảng dễ hiểu |
| ❓ Quiz tự động | Sinh câu hỏi trắc nghiệm để ôn tập |
| 💬 Chat hỏi bài | Hỏi đáp với AI 24/7 |
| 🔊 Text-to-Speech | Nghe bài giảng bằng giọng nói tự nhiên |
| 📊 Dashboard | Theo dõi tiến độ học tập |
| 🗺️ Lộ trình học | Đề xuất học tập cá nhân hóa |

### Advanced Features

- 🧠 **Cá nhân hóa học tập**: AI phân tích năng lực và điều chỉnh nội dung
- 🔎 **Phát hiện lỗ hổng kiến thức**: Xác định điểm yếu qua lịch sử làm quiz
- 📈 **Phân tích học lực**: Thống kê chi tiết theo từng chủ đề
- 🎯 **Đề xuất thông minh**: Gợi ý bài học tiếp theo phù hợp

---

## 🏗️ Kiến Trúc Hệ Thống

```
┌─────────────────────────────────────────────────────────────────┐
│                         CLIENT (React)                          │
│  ┌──────────┬──────────┬──────────┬──────────┬──────────┐      │
│  │  Upload  │  Lesson  │   Quiz   │   Chat   │Dashboard │      │
│  └──────────┴──────────┴──────────┴──────────┴──────────┘      │
└─────────────────────────────────────────────────────────────────┘
                              │
                              ▼
┌─────────────────────────────────────────────────────────────────┐
│                    BACKEND API (Express.js)                     │
│  ┌──────────────────────────────────────────────────────────┐  │
│  │                        Routes                             │  │
│  │  /upload  /ocr  /lesson  /quiz  /chat  /tts  /dashboard  │  │
│  └──────────────────────────────────────────────────────────┘  │
│  ┌──────────────────────────────────────────────────────────┐  │
│  │                      Controllers                          │  │
│  └──────────────────────────────────────────────────────────┘  │
│  ┌──────────────────────────────────────────────────────────┐  │
│  │                       Services                            │  │
│  │    OpenAI    │    Firebase    │    OCR    │    TTS       │  │
│  └──────────────────────────────────────────────────────────┘  │
└─────────────────────────────────────────────────────────────────┘
                              │
                              ▼
┌─────────────────────────────────────────────────────────────────┐
│                      EXTERNAL SERVICES                          │
│  ┌──────────┐  ┌──────────┐  ┌──────────┐  ┌──────────┐       │
│  │ OpenAI   │  │ Firebase │  │Tesseract │  │ OpenAI   │       │
│  │ GPT-4    │  │ Firestore│  │   OCR    │  │   TTS    │       │
│  └──────────┘  └──────────┘  └──────────┘  └──────────┘       │
└─────────────────────────────────────────────────────────────────┘
```

### Clean Architecture

```
/frontend                 # React Application
  /src
    /components          # UI Components
    /pages              # Page Components
    /services           # API Services
    /hooks              # Custom Hooks
    /context            # React Context
    /utils              # Utilities

/backend                  # Express Server
  /routes               # API Routes
  /controllers          # Request Handlers
  /services             # Business Logic
  /utils                # Utilities
  /middleware           # Custom Middleware
```

---

## 🛠️ Công Nghệ Sử Dụng

### Frontend
- **React 18** - UI Library
- **TailwindCSS** - Styling
- **React Router** - Navigation
- **Axios** - HTTP Client
- **React Query** - Data Fetching
- **Framer Motion** - Animations

### Backend
- **Node.js** - Runtime
- **Express.js** - Web Framework
- **Multer** - File Upload
- **Tesseract.js** - OCR Engine
- **Firebase Admin** - Database

### AI & Services
- **OpenAI GPT-4** - AI Processing
- **OpenAI TTS** - Text-to-Speech
- **Firebase Firestore** - Database
- **Firebase Auth** - Authentication

---

## 🚀 Cài Đặt

### Yêu Cầu Hệ Thống

- Node.js >= 18.0.0
- npm >= 9.0.0
- Tài khoản Firebase
- OpenAI API Key

### Bước 1: Clone Repository

```bash
git clone https://github.com/your-repo/gia-su-ai.git
cd gia-su-ai
```

### Bước 2: Cài Đặt Dependencies

```bash
# Cài đặt backend
cd backend
npm install

# Cài đặt frontend
cd ../frontend
npm install
```

### Bước 3: Cấu Hình Environment

```bash
# Backend: Copy file .env mẫu
cd backend
cp .env.example .env

# Điền các thông tin cần thiết vào .env
```

### Bước 4: Cấu Hình Firebase

1. Tạo project trên [Firebase Console](https://console.firebase.google.com/)
2. Tạo Firestore Database
3. Tạo Service Account và download JSON key
4. Đặt file JSON vào `backend/config/firebase-admin.json`

### Bước 5: Chạy Ứng Dụng

```bash
# Terminal 1: Chạy backend
cd backend
npm run dev

# Terminal 2: Chạy frontend
cd frontend
npm start
```

### Bước 6: Truy Cập

- Frontend: http://localhost:3000
- Backend API: http://localhost:5000

---

## 📖 Hướng Dẫn Sử Dụng

### 1. Đăng Ký / Đăng Nhập

![Login](./docs/images/login.png)

### 2. Upload Sách Giáo Khoa

- Click "Upload SGK"
- Chọn file PDF hoặc ảnh chụp
- Đợi hệ thống xử lý OCR

### 3. Học Bài Giảng

- Xem bài giảng được AI tạo ra
- Nghe audio bài giảng
- Đánh dấu bài đã học

### 4. Làm Quiz

- Chọn bài quiz
- Trả lời các câu hỏi
- Xem kết quả và giải thích

### 5. Chat Hỏi Bài

- Đặt câu hỏi về bài học
- AI trả lời dựa trên nội dung đã học

### 6. Xem Dashboard

- Theo dõi tiến độ
- Xem phân tích điểm yếu
- Nhận đề xuất học tiếp

---

## 📚 API Documentation

### Endpoints

| Method | Endpoint | Mô tả |
|--------|----------|-------|
| POST | `/api/upload` | Upload file SGK |
| POST | `/api/ocr` | Trích xuất text từ ảnh |
| POST | `/api/lesson` | Tạo bài giảng từ nội dung |
| POST | `/api/quiz` | Sinh câu hỏi quiz |
| POST | `/api/chat` | Chat hỏi đáp |
| POST | `/api/tts` | Chuyển text thành audio |
| GET | `/api/dashboard/:userId` | Lấy thông tin dashboard |
| GET | `/api/roadmap/:userId` | Lấy lộ trình học |

### Chi Tiết API

Xem chi tiết tại [API Documentation](./docs/API.md)

---

## 🌟 Điểm Sáng Cho Ban Giám Khảo

### 1. 🎯 Giải Quyết Vấn Đề Thực Tế
- Đáp ứng nhu cầu học tập của hàng triệu học sinh THPT
- Giảm chi phí gia sư, tăng cơ hội tiếp cận giáo dục chất lượng

### 2. 🤖 Ứng Dụng AI Tiên Tiến
- Sử dụng GPT-4 cho chất lượng nội dung cao
- OCR chính xác với Tesseract.js
- TTS tự nhiên với OpenAI Whisper

### 3. 📱 Trải Nghiệm Người Dùng Tuyệt Vời
- UI/UX thân thiện, dễ sử dụng
- Responsive trên mọi thiết bị
- Animations mượt mà

### 4. 🏗️ Kiến Trúc Scalable
- Clean Architecture
- Microservices ready
- Dễ dàng mở rộng

### 5. 💡 Tính Năng Độc Đáo
- Cá nhân hóa học tập theo năng lực
- Phát hiện lỗ hổng kiến thức tự động
- Lộ trình học thông minh

### 6. 📈 Tiềm Năng Thương Mại Hóa
- Mô hình Freemium
- B2B cho trường học
- Subscription cho phụ huynh

---

## 🔮 Hướng Phát Triển

1. **Mobile App** - React Native
2. **Multiplayer Quiz** - Thi đua với bạn bè
3. **AI Tutor Voice** - Gia sư nói chuyện realtime
4. **VR/AR Learning** - Học trong môi trường ảo
5. **Parent Dashboard** - Phụ huynh theo dõi con

---

## 👥 Đội Ngũ Phát Triển

- **Product Manager**: Định hướng sản phẩm
- **UI/UX Designer**: Thiết kế trải nghiệm
- **Senior Fullstack Engineer**: Phát triển hệ thống
- **AI Engineer**: Tích hợp AI
- **Cloud Architect**: Thiết kế hạ tầng

---

## 📄 License

MIT License - Xem file [LICENSE](./LICENSE)

---

<div align="center">

**Made with ❤️ for Vietnamese Students**

[Website](https://giasuai.vn) • [Documentation](./docs) • [Report Bug](./issues)

</div>
