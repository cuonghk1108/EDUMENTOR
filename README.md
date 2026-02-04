# 🎓 EDUMENTOR - Nền Tảng Học Tập Thông Minh

<div align="center">

**Gia sư AI cá nhân hóa dành cho học sinh THPT Việt Nam**

[![React](https://img.shields.io/badge/React-18.x-61DAFB?style=for-the-badge&logo=react&logoColor=white)](https://reactjs.org/)
[![Node.js](https://img.shields.io/badge/Node.js-18.x-339933?style=for-the-badge&logo=nodedotjs&logoColor=white)](https://nodejs.org/)
[![TailwindCSS](https://img.shields.io/badge/TailwindCSS-3.x-06B6D4?style=for-the-badge&logo=tailwindcss&logoColor=white)](https://tailwindcss.com/)
[![Grok AI](https://img.shields.io/badge/Grok_AI-xAI-000000?style=for-the-badge&logo=x&logoColor=white)](https://x.ai/)
[![Murf.ai](https://img.shields.io/badge/Murf.ai-TTS-FF6B6B?style=for-the-badge)](https://murf.ai/)
[![Cloudflare](https://img.shields.io/badge/Cloudflare-Tunnel-F38020?style=for-the-badge&logo=cloudflare&logoColor=white)](https://www.cloudflare.com/)

**🚀 Version 1.0.0 | 📅 2026 | 👨‍💻 cuonghk1108**

🔗 **Live Demo:** [https://edumentor.io.vn](https://edumentor.io.vn)

[Tính năng](#-tính-năng-chính) • [Cài đặt](#-cài-đặt) • [Cloudflare Tunnel](#-cloudflare-tunnel-setup) • [API](#-api-documentation) • [Đóng góp](#-đóng-góp)

</div>

---

## 📋 Mục Lục

- [Giới thiệu](#-giới-thiệu)
- [Tính năng chính](#-tính-năng-chính)
- [Demo](#-demo)
**cuonghk1108**

[![GitHub](https://img.shields.io/badge/GitHub-cuonghk1108-181717?style=for-the-badge&logo=github)](https://github.com/cuonghk1108)
[![Repository](https://img.shields.io/badge/Repo-AI--Tutor-blue?style=for-the-badge&logo=github)](https://github.com/cuonghk1108/AI-Tutor)
  - [Local Development](#local-development)
  - [Cloudflare Tunnel Setup](#-cloudflare-tunnel-setup)
- [Cấu trúc thư mục](#-cấu-trúc-thư-mục)
- [Hướng dẫn sử dụng](#-hướng-dẫn-sử-dụng)
- [API Documentation](#-api-documentation)
- [Biến môi trường](#️-biến-môi-trường)
- [Scripts](#-scripts)
- [Admin Setup](#-admin-setup)
- [Đóng góp](#-đóng-góp)
- [Bản quyền](#-bản-quyền)

---

## 🎯 Giới Thiệu

**EDUMENTOR** là nền tảng học tập thông minh, ứng dụng trí tuệ nhân tạo tiên tiến nhất để hỗ trợ học sinh THPT Việt Nam học tập hiệu quả hơn. Hệ thống chuyển đổi sách giáo khoa thành bài giảng tương tác với audio, quiz tự động và chatbot hỏi đáp 24/7.

### 🔥 Vấn Đề Giải Quyết

| Vấn đề | Giải pháp của EDUMENTOR |
|--------|-------------------------|
| 📚 Sách giáo khoa khô khan | Bài giảng sinh động với LaTeX, ví dụ thực tế |
| 👨‍🏫 Thiếu gia sư cá nhân | AI hỗ trợ học tập 24/7 |
| ❓ Không ai giải đáp thắc mắc | Chatbot thông minh trả lời mọi câu hỏi |
| 📊 Không biết điểm yếu | Dashboard phân tích chi tiết |
| 🗺️ Thiếu lộ trình học | Roadmap cá nhân hóa theo từng học sinh |
| 🔇 Học thụ động | Audio bài giảng - học mọi lúc mọi nơi |
| 🎯 Không có định hướng nghề | Hướng nghiệp + Điểm chuẩn 2025 |

---

## ✨ Tính Năng Chính

### 📤 1. Upload & OCR Sách Giáo Khoa
- Upload ảnh/PDF sách giáo khoa
- OCR nhận diện văn bản tiếng Việt chính xác cao
- Hỗ trợ công thức toán học phức tạp

### 📖 2. Tạo Bài Giảng AI
- **3 định dạng output:**
  - 📝 Markdown - Đơn giản, dễ đọc
  - 🔬 LaTeX - Công thức toán học chuyên nghiệp
  - 📊 JSON Structured - Bài giảng có cấu trúc đầy đủ
- Ví dụ minh họa thực tế
- Bài tập tự luyện với đáp án
- Tóm tắt và lỗi thường gặp

### 🔊 3. Text-to-Speech (Murf.ai)
- Giọng đọc tự nhiên với Murf.ai Gen2
- Hỗ trợ tiếng Việt qua MultiNative
- Cache audio thông minh - không tạo lại audio đã có
- Audio theo từng section của bài học

### 📝 4. Quiz Tự Động
- Tự động tạo quiz từ nội dung bài học
- Nhiều mức độ: Dễ - Trung bình - Khó
- Giải thích chi tiết cho mỗi câu trả lời
- Thống kê kết quả và phân tích điểm yếu

### 💬 5. Chatbot Hỏi Đáp 24/7
- Trả lời mọi thắc mắc về bài học
- Context-aware - hiểu ngữ cảnh cuộc trò chuyện
- Hỗ trợ giải bài tập step-by-step
- Lưu lịch sử chat

### 🗺️ 6. Lộ Trình Học Tập
- Roadmap cá nhân hóa theo mục tiêu
- Theo dõi tiến độ realtime
- Đề xuất bài học tiếp theo
- Streak học tập - động lực mỗi ngày

### 🎯 7. Hướng Nghiệp
- Điểm chuẩn 2025 các trường đại học
- Tra cứu theo khối thi mới (GDPT 2018)
- Gợi ý ngành nghề theo sở thích
- Xu hướng lao động và mức lương

### 🛠️ 8. Admin Panel
- Dashboard thống kê tổng quan
- Quản lý người dùng (CRUD)
- Quản lý bài học và quiz
- Nhật ký hoạt động hệ thống

---

## 🖥️ Demo

### Trang chủ
```
┌─────────────────────────────────────────┐
│  🎓 EDUMENTOR                       [Login]│
├─────────────────────────────────────────┤
│                                         │
│   Học thông minh hơn với AI             │
│   ─────────────────────────             │
│   Upload SGK → Bài giảng → Quiz → Audio │
│                                         │
│         [Bắt đầu ngay] [Tìm hiểu]       │
│                                         │
└─────────────────────────────────────────┘
```

### Dashboard
```
┌─────────────────────────────────────────┐
│  📊 Dashboard                           │
├──────────┬──────────┬──────────┬────────┤
│ 📚 12    │ ✅ 8     │ 📝 25    │ 🔥 5   │
│ Bài học  │ Hoàn thành│ Quiz    │ Streak │
├──────────┴──────────┴──────────┴────────┤
│  📈 Tiến độ học tập                     │
│  ████████████░░░░░░░░ 65%               │
├─────────────────────────────────────────┤
│  🎯 Điểm yếu cần cải thiện              │
│  • Hình học không gian (45%)            │
│  • Tích phân (52%)                      │
└─────────────────────────────────────────┘
```

---

## 🏗️ Kiến Trúc Hệ Thống

```
┌─────────────────────────────────────────────────────────────┐
│                        FRONTEND                              │
│  ┌─────────────────────────────────────────────────────┐    │
│  │  React 18 + TailwindCSS + Framer Motion             │    │
│  │  ├── Pages (Dashboard, Upload, Lessons, Quiz, Chat) │    │
│  │  ├── Components (StructuredLesson, KaTeX, Audio)    │    │
│  │  └── Context (Auth, Theme)                          │    │
│  └─────────────────────────────────────────────────────┘    │
│                           │                                  │
│                     REST API (Axios)                         │
│                           │                                  │
└───────────────────────────┼─────────────────────────────────┘
                            │
┌───────────────────────────┼─────────────────────────────────┐
│                        BACKEND                               │
│  ┌─────────────────────────────────────────────────────┐    │
│  │  Express.js + Node.js 18                            │    │
│  │  ├── Controllers (lesson, quiz, chat, tts, admin)   │    │
│  │  ├── Services (AI, OCR, Murf TTS, Cache)            │    │
│  │  ├── Middleware (Auth, Admin, Upload)               │    │
│  │  └── Routes (API endpoints)                         │    │
│  └─────────────────────────────────────────────────────┘    │
│                           │                                  │
│              ┌────────────┼────────────┐                    │
│              │            │            │                    │
│         ┌────▼────┐  ┌────▼────┐  ┌────▼────┐              │
│         │  NeDB   │  │ Grok AI │  │ Murf.ai │              │
│         │ (Local) │  │  (xAI)  │  │  (TTS)  │              │
│         └─────────┘  └─────────┘  └─────────┘              │
│                                                             │
└─────────────────────────────────────────────────────────────┘
```

---

## 🛠️ Công Nghệ Sử Dụng

### Frontend
| Công nghệ | Version | Mô tả |
|-----------|---------|-------|
| React | 18.x | UI Library |
| TailwindCSS | 3.x | Utility-first CSS |
| Framer Motion | 10.x | Animations |
| React Query | 3.x | Data fetching & caching |
| React Router | 6.x | Routing |
| React KaTeX | 3.x | LaTeX rendering |
| React Hot Toast | 2.x | Notifications |
| Heroicons | 2.x | Icons |
| Axios | 1.x | HTTP client |

### Backend
| Công nghệ | Version | Mô tả |
|-----------|---------|-------|
| Node.js | 18.x | Runtime |
| Express.js | 4.x | Web framework |
| NeDB | 1.x | NoSQL database (local) |
| Multer | 1.x | File upload |
| Tesseract.js | 5.x | OCR |
| JWT | 9.x | Authentication |
| bcrypt | 5.x | Password hashing |
| crypto | - | Hash & encryption |

### AI & External Services
| Service | Mô tả |
|---------|-------|
| Grok AI (xAI) | LLM cho tạo bài giảng, quiz, chat |
| Murf.ai | Text-to-Speech với giọng tự nhiên |
| Tesseract | OCR nhận diện văn bản |

---

## 📦 Cài Đặt

### Yêu cầu hệ thống
- Node.js 18.x trở lên
- npm 9.x trở lên
- Git
- (Tùy chọn) Cloudflared CLI để chạy Cloudflare Tunnel

### Local Development

#### Bước 1: Clone repository
```bash
git clone https://github.com/cuonghk1108/AI-Tutor.git
cd AI-Tutor
```

#### Bước 2: Cài đặt Backend
```bash
cd backend
npm install
```

#### Bước 3: Cấu hình môi trường Backend
```bash
cp .env.example .env
```

Chỉnh sửa file `.env`:
```env
PORT=5000
NODE_ENV=development

# JWT Authentication
JWT_SECRET=your_super_secret_jwt_key_here

# Grok AI (xAI)
XAI_API_KEY=your_xai_api_key_here
XAI_MODEL=grok-beta

# Murf.ai TTS
MURF_API_KEY=your_murf_api_key_here

# CORS Settings (cho Cloudflare Tunnel)
FRONTEND_URL=http://localhost:3000
PRODUCTION_URL=https://edumentor.io.vn
```

#### Bước 4: Cài đặt Frontend
```bash
cd ../frontend
npm install
```

#### Bước 5: Khởi động ứng dụng

**Cách 1: Sử dụng script (Windows)**
```bash
# Ở thư mục gốc
start.bat
```

**Cách 2: Khởi động thủ công**
```bash
# Terminal 1 - Backend
cd backend
npm start

# Terminal 2 - Frontend
cd frontend
npm start
```

#### Bước 6: Truy cập ứng dụng
- 🌐 Frontend: http://localhost:3000
- 🔌 Backend API: http://localhost:5000
- 👨‍💼 Admin Panel: http://localhost:3000/admin

---

## 🌐 Cloudflare Tunnel Setup

Để expose ứng dụng ra internet với domain `edumentor.io.vn`:

### 1️⃣ Cài đặt Cloudflared

**Windows:**
```powershell
# Download từ: https://github.com/cloudflare/cloudflared/releases
# Hoặc dùng winget
winget install --id Cloudflare.cloudflared
```

**macOS:**
```bash
brew install cloudflare/cloudflare/cloudflared
```

**Linux:**
```bash
wget https://github.com/cloudflare/cloudflared/releases/latest/download/cloudflared-linux-amd64.deb
sudo dpkg -i cloudflared-linux-amd64.deb
```

### 2️⃣ Đăng nhập Cloudflare
```bash
cloudflared tunnel login
```

### 3️⃣ Tạo Tunnel (đã tạo sẵn)
```bash
cloudflared tunnel create edumentor
```

### 4️⃣ Cấu hình DNS
Thêm DNS record cho domain:
```bash
cloudflared tunnel route dns edumentor edumentor.io.vn
cloudflared tunnel route dns edumentor api.edumentor.io.vn
```

### 5️⃣ Chạy Tunnel

**Cách 1: Sử dụng script (Windows)**
```bash
cd cloudflare
.\start-all.bat
```

**Cách 2: Khởi động riêng lẻ**
```bash
# Terminal 1 - Backend
cd backend && npm start

# Terminal 2 - Frontend  
cd frontend && npm start

# Terminal 3 - Cloudflare Tunnel
cloudflared tunnel --config D:\AII\cloudflare\config.yml run
```

### 6️⃣ Truy cập qua domain
- 🌍 Public URL: https://edumentor.io.vn
- 🔌 API: https://api.edumentor.io.vn

### Cấu hình Tunnel (cloudflare/config.yml)
```yaml
tunnel: 4f14b42d-2572-4678-91e9-f370e686f49e
credentials-file: C:\Users\XC\.cloudflared\4f14b42d-2572-4678-91e9-f370e686f49e.json

ingress:
  - hostname: edumentor.io.vn
    service: http://localhost:3000
  
  - hostname: api.edumentor.io.vn
    service: http://localhost:5000
  
  - service: http_status:404
```

### Production Mode (Path-based routing)
File `cloudflare/config-production.yml`:
```yaml
ingress:
  # API routes
  - hostname: edumentor.io.vn
    path: /api/*
    service: http://localhost:5000
  
  # Frontend
  - hostname: edumentor.io.vn
    service: http://localhost:3000
  
  - service: http_status:404
```

---

## 📁 Cấu Trúc Thư Mục

```
edumentor/
├── 📂 backend/
│   ├── 📂 controllers/          # Route handlers
│   │   ├── adminController.js   # Admin CRUD operations
│   │   ├── authController.js    # Authentication
│   │   ├── careerController.js  # Career guidance
│   │   ├── chatController.js    # AI Chatbot
│   │   ├── dashboardController.js # User dashboard stats
│   │   ├── lessonController.js  # Lesson CRUD
│   │   ├── ocrController.js     # OCR processing
│   │   ├── quizController.js    # Quiz generation
│   │   ├── roadmapController.js # Learning roadmap
│   │   ├── ttsController.js     # Text-to-Speech
│   │   └── uploadController.js  # File upload
│   │
│   ├── 📂 data/
│   │   └── careerData.js        # Career & university data
│   │
│   ├── 📂 database/
│   │   └── 📂 data/             # NeDB database files
│   │       ├── users.db
│   │       ├── lessons.db
│   │       ├── quizzes.db
│   │       ├── chat_history.db
│   │       └── ...
│   │
│   ├── 📂 middleware/
│   │   ├── adminAuth.js         # Admin authorization
│   │   ├── auth.js              # JWT verification
│   │   └── upload.js            # Multer config
│   │
│   ├── 📂 routes/
│   │   └── index.js             # All API routes
│   │
│   ├── 📂 services/
│   │   ├── aiService.js         # Grok AI integration
│   │   ├── audioCacheService.js # Audio caching
│   │   ├── firebaseService.js   # Database services (NeDB)
│   │   ├── murfService.js       # Murf.ai TTS
│   │   └── ocrService.js        # Tesseract OCR
│   │
│   ├── 📂 uploads/
│   │   └── 📂 audio/            # Generated audio files
│   │
│   ├── .env                     # Environment variables
│   ├── .env.example             # Environment template
│   ├── create-admin.js          # Admin account creator
│   ├── package.json
│   ├── server.js                # Entry point
│   └── set-admin.js             # Set user as admin
│
├── 📂 cloudflare/               # Cloudflare Tunnel configs
│   ├── config.yml               # Tunnel config (dev)
│   ├── config-production.yml    # Production config
│   ├── setup-tunnel.bat         # Setup script
│   ├── start-all.bat            # Start all services
│   ├── start-production.bat     # Start with production config
│   ├── stop-all.bat             # Stop all services
│   └── README.md                # Tunnel documentation
│
├── 📂 frontend/
│   ├── 📂 public/
│   │   └── index.html
│   │
│   ├── 📂 src/
│   │   ├── 📂 components/
│   │   │   ├── Layout.js        # Main layout with sidebar
│   │   │   └── StructuredLesson.js # Lesson renderer
│   │   │
│   │   ├── 📂 context/
│   │   │   └── AuthContext.js   # Authentication state
│   │   │
│   │   ├── 📂 pages/
│   │   │   ├── Admin.js         # Admin panel
│   │   │   ├── Career.js        # Career guidance
│   │   │   ├── Chat.js          # AI Chatbot
│   │   │   ├── Dashboard.js     # Main dashboard
│   │   │   ├── Lessons.js       # Lesson list
│   │   │   ├── LessonView.js    # Lesson detail
│   │   │   ├── Login.js         # Login page
│   │   │   ├── Quiz.js          # Quiz list
│   │   │   ├── QuizTake.js      # Take quiz
│   │   │   ├── Roadmap.js       # Learning roadmap
│   │   │   └── Upload.js        # Upload SGK
│   │   │
│   │   ├── 📂 services/
│   │   │   └── api.js           # Axios API client
│   │   │
│   │   ├── App.js               # App router
│   │   ├── index.js             # Entry point
│   │   └── index.css            # Global styles
│   │
│   └── package.json
│
├── start.bat                    # Windows startup script
├── stop.bat                     # Windows stop script
├── run.bat                      # Quick start (all services)
├── LICENSE                      # MIT License
└── README.md                    # This file
```

---

## 📖 Hướng Dẫn Sử Dụng

### 1️⃣ Đăng ký / Đăng nhập
1. Truy cập http://localhost:3000
2. Click "Đăng ký" để tạo tài khoản mới
3. Nhập email, mật khẩu và tên
4. Đăng nhập với thông tin đã tạo

### 2️⃣ Upload Sách Giáo Khoa
1. Vào menu "Upload SGK"
2. Kéo thả hoặc click để chọn file ảnh/PDF
3. Chọn môn học và định dạng output
4. Click "Tạo bài giảng"

### 3️⃣ Học bài giảng
1. Vào menu "Bài học"
2. Chọn bài học muốn học
3. Đọc nội dung hoặc nghe audio
4. Click vào icon 🔊 để nghe từng phần

### 4️⃣ Làm Quiz
1. Trong trang bài học, click "Tạo Quiz"
2. Hoặc vào menu "Quiz" để xem danh sách
3. Làm bài và xem kết quả chi tiết

### 5️⃣ Hỏi đáp AI
1. Vào menu "Hỏi đáp"
2. Gõ câu hỏi về bài học
3. AI sẽ trả lời và giải thích

### 6️⃣ Xem hướng nghiệp
1. Vào menu "Hướng nghiệp"
2. Tra cứu điểm chuẩn các trường
3. Xem gợi ý ngành nghề

### 7️⃣ Quản trị (Admin)
1. Đăng nhập với tài khoản admin
2. Click "Quản trị" trong sidebar
3. Quản lý users, lessons, quizzes

**Tạo admin mới:**
```bash
cd backend
node create-admin.js
```

Hoặc set user hiện có thành admin:
```bash
node set-admin.js your-email@example.com
```

---

## 👨‍💼 Admin Setup

### Tạo tài khoản Admin đầu tiên

**Cách 1: Tự động tạo admin mới**
```bash
cd backend
node create-admin.js
```

Thông tin mặc định:
- Email: `admin@edumentor.io.vn`
- Password: `Admin@123456`

**Cách 2: Set user hiện có thành admin**
```bash
cd backend
node set-admin.js user@example.com
```

### Đăng nhập Admin
1. Truy cập: http://localhost:3000/login
2. Đăng nhập với tài khoản admin
3. Vào Admin Panel: http://localhost:3000/admin

### Tính năng Admin Panel
- 📊 Dashboard thống kê tổng quan
- 👥 Quản lý người dùng (xem, xóa, cấp quyền)
- 📚 Quản lý bài học và nội dung
- 📝 Quản lý quiz
- 📈 Thống kê chi tiết và báo cáo

---

## 📚 API Documentation

### Base URL
```
http://localhost:5000/api
```

### Authentication
Sử dụng JWT Bearer Token trong header:
```
Authorization: Bearer <token>
```

### Endpoints

#### Auth
| Method | Endpoint | Mô tả |
|--------|----------|-------|
| POST | `/auth/register` | Đăng ký tài khoản |
| POST | `/auth/login` | Đăng nhập |
| POST | `/auth/logout` | Đăng xuất |

#### Lessons
| Method | Endpoint | Mô tả |
|--------|----------|-------|
| GET | `/lessons` | Lấy danh sách bài học |
| GET | `/lessons/:id` | Lấy chi tiết bài học |
| POST | `/lessons` | Tạo bài học mới |
| PUT | `/lessons/:id` | Cập nhật bài học |
| DELETE | `/lessons/:id` | Xóa bài học |
| POST | `/lessons/:id/complete` | Đánh dấu hoàn thành |

#### Quiz
| Method | Endpoint | Mô tả |
|--------|----------|-------|
| GET | `/quiz` | Lấy danh sách quiz |
| GET | `/quiz/:id` | Lấy chi tiết quiz |
| POST | `/quiz/generate` | Tạo quiz từ text |
| POST | `/quiz/:id/submit` | Nộp bài quiz |

#### Chat
| Method | Endpoint | Mô tả |
|--------|----------|-------|
| POST | `/chat` | Gửi tin nhắn |
| GET | `/chat/history` | Lấy lịch sử chat |
| DELETE | `/chat/history` | Xóa lịch sử |

#### TTS (Text-to-Speech)
| Method | Endpoint | Mô tả |
|--------|----------|-------|
| POST | `/tts` | Tạo audio từ text |
| GET | `/tts/:audioId` | Lấy file audio |
| POST | `/tts/lesson` | Tạo audio cho bài học |

#### Career
| Method | Endpoint | Mô tả |
|--------|----------|-------|
| GET | `/career/khoi-thi` | Lấy danh sách khối thi |
| GET | `/career/diem-chuan` | Tra cứu điểm chuẩn |
| GET | `/career/nganh-nghe` | Danh sách ngành nghề |
| POST | `/career/suggest` | Gợi ý trường/ngành |

#### Admin
| Method | Endpoint | Mô tả |
|--------|----------|-------|
| GET | `/admin/dashboard` | Thống kê tổng quan |
| GET | `/admin/users` | Quản lý users |
| GET | `/admin/lessons` | Quản lý bài học |
| GET | `/admin/quizzes` | Quản lý quiz |
| DELETE | `/admin/users/:id` | Xóa user |

---

## ⚙️ Biến Môi Trường

### Backend (.env)
```env
# Server Configuration
PORT=5000
NODE_ENV=development

# JWT Authentication
JWT_SECRET=your_super_secret_jwt_key_here
JWT_EXPIRES_IN=7d

# Grok AI (xAI) - https://console.x.ai/
XAI_API_KEY=your_xai_api_key_here
XAI_MODEL=grok-beta

# OpenAI (Backup) - https://platform.openai.com/
OPENAI_API_KEY=your_openai_api_key_here

# Murf.ai TTS - https://murf.ai/api/dashboard
MURF_API_KEY=your_murf_api_key_here

# CORS Configuration
FRONTEND_URL=http://localhost:3000
PRODUCTION_URL=https://edumentor.io.vn

# File Upload
MAX_FILE_SIZE=10485760
UPLOAD_DIR=./uploads

# Rate Limiting
RATE_LIMIT_WINDOW_MS=900000
RATE_LIMIT_MAX=100

# OCR Settings (Optional)
TESSERACT_LANG=vie
```

### Frontend (.env)
```env
REACT_APP_API_URL=http://localhost:5000/api
REACT_APP_ENV=development
```

### Cloudflare Tunnel
Credentials file: `C:\Users\<USER>\.cloudflared\<TUNNEL_ID>.json`

---

## 📜 Scripts

### Backend
```bash
npm start              # Khởi động server (port 5000)
npm run dev            # Khởi động với nodemon (auto-reload)
node create-admin.js   # Tạo tài khoản admin mới
node set-admin.js <email>  # Set user thành admin
```

### Frontend
```bash
npm start              # Khởi động development server (port 3000)
npm run build          # Build production
npm test               # Chạy tests
npm run eject          # Eject CRA config (cẩn thận!)
```

### All-in-One Scripts (Windows)

**Khởi động cơ bản:**
```bash
start.bat              # Backend + Frontend
```

**Khởi động với Cloudflare Tunnel:**
```bash
# Development mode (2 domains riêng biệt)
cd cloudflare
.\start-all.bat        # Backend + Frontend + Tunnel

# Production mode (1 domain với path routing)
.\start-production.bat
```

**Dừng tất cả:**
```bash
stop.bat               # Dừng Node.js processes
cd cloudflare
.\stop-all.bat         # Dừng tất cả services
```

---

## 🤝 Đóng Góp

Chúng tôi rất hoan nghênh mọi đóng góp! 

### Cách đóng góp
1. Fork repository
2. Tạo branch mới (`git checkout -b feature/AmazingFeature`)
3. Commit changes (`git commit -m 'Add some AmazingFeature'`)
4. Push to branch (`git push origin feature/AmazingFeature`)
5. Mở Pull Request

### Báo lỗi
Vui lòng tạo issue với:
- Mô tả lỗi chi tiết
- Các bước tái hiện
- Screenshots (nếu có)
- Môi trường (OS, Node version, Browser)

---

## 📊 Roadmap


## 📊 Roadmap

### Đã hoàn thành ✅
- [x] Upload & OCR sách giáo khoa
- [x] Tạo bài giảng AI (Markdown/LaTeX/JSON)
- [x] Text-to-Speech với Murf.ai
- [x] Quiz tự động với phân tích chi tiết
- [x] Chatbot hỏi đáp 24/7
- [x] Hướng nghiệp & Điểm chuẩn 2025
- [x] Admin Panel đầy đủ
- [x] Cloudflare Tunnel integration
- [x] CORS support cho production
- [x] Audio caching & optimization

### Đang phát triển 🔄
- [ ] Mobile App (React Native)
- [ ] Offline mode với Service Worker
- [ ] Progressive Web App (PWA)
- [ ] Multiplayer quiz realtime
- [ ] Gamification (achievements, leaderboard)

### Kế hoạch tương lai 🔮
- [ ] Parent dashboard & monitoring
- [ ] Integration với Google Classroom
- [ ] Video lessons support
- [ ] Live tutoring sessions
- [ ] AI voice chatbot (speech-to-speech)
- [ ] Personalized learning path AI
- [ ] Collaborative study rooms
- [ ] Export lessons to PDF/ePub
---

## 📄 Bản Quyền

```
MIT License

Copyright (c) 2026 cuongdev1108

Permission is hereby granted, free of charge, to any person obtaining a copy
of this software and associated documentation files (the "Software"), to deal
in the Software without restriction, including without limitation the rights
to use, copy, modify, merge, publish, distribute, sublicense, and/or sell
copies of the Software, and to permit persons to whom the Software is
furnished to do so, subject to the following conditions:

The above copyright notice and this permission notice shall be included in all
copies or substantial portions of the Software.

THE SOFTWARE IS PROVIDED "AS IS", WITHOUT WARRANTY OF ANY KIND, EXPRESS OR
IMPLIED, INCLUDING BUT NOT LIMITED TO THE WARRANTIES OF MERCHANTABILITY,
FITNESS FOR A PARTICULAR PURPOSE AND NONINFRINGEMENT. IN NO EVENT SHALL THE
AUTHORS OR COPYRIGHT HOLDERS BE LIABLE FOR ANY CLAIM, DAMAGES OR OTHER
LIABILITY, WHETHER IN AN ACTION OF CONTRACT, TORT OR OTHERWISE, ARISING FROM,
OUT OF OR IN CONNECTION WITH THE SOFTWARE OR THE USE OR OTHER DEALINGS IN THE
SOFTWARE.
```

---

## 👨‍💻 Tác Giả

<div align="center">

**cuongdev1108**

[![GitHub](https://img.shields.io/badge/GitHub-cuongdev1108-181717?style=for-the-badge&logo=github)](https://github.com/cuongdev1108)

*Phát triển với ❤️ tại Việt Nam - 2026*

</div>

---

<div align="center">

### ⭐ Nếu dự án này hữu ích, hãy cho một star nhé!

**EDUMENTOR** - *Học thông minh hơn với AI*

</div>
