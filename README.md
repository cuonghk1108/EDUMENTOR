﻿# 🎓 EDUMENTOR - Nền Tảng Học Tập AI Toàn Diện

<div align="center">

**Gia sư AI cá nhân hóa dành cho học sinh THPT Việt Nam**

[![React](https://img.shields.io/badge/React-18.x-61DAFB?style=for-the-badge&logo=react&logoColor=white)](https://reactjs.org/)
[![Node.js](https://img.shields.io/badge/Node.js-18.x-339933?style=for-the-badge&logo=nodedotjs&logoColor=white)](https://nodejs.org/)
[![TailwindCSS](https://img.shields.io/badge/TailwindCSS-3.x-06B6D4?style=for-the-badge&logo=tailwindcss&logoColor=white)](https://tailwindcss.com/)
[![Grok AI](https://img.shields.io/badge/Grok_AI-xAI-000000?style=for-the-badge&logo=x&logoColor=white)](https://x.ai/)
[![Google OAuth](https://img.shields.io/badge/Google-OAuth-4285F4?style=for-the-badge&logo=google&logoColor=white)](https://console.cloud.google.com/)
[![Cloudflare](https://img.shields.io/badge/Cloudflare-Tunnel-F38020?style=for-the-badge&logo=cloudflare&logoColor=white)](https://www.cloudflare.com/)

**🚀 Version 1.1.0 (Unified) · 📅 2026 · 👨‍💻 cuongdev1108**

🔗 **Live:** https://edumentor.io.vn

[Tính năng](#-tính-năng-chính) · [Cài đặt](#-cài-đặt) · [Google OAuth](#-thiết-lập-google-oauth) · [Cloudflare Tunnel](#-cloudflare-tunnel-setup) · [API](#-api-documentation)

</div>

---

## 📋 Mục Lục

- [Giới thiệu](#-giới-thiệu)
- [Tính năng chính](#-tính-năng-chính)
- [Công nghệ sử dụng](#-công-nghệ-sử-dụng)
- [Kiến trúc hệ thống](#-kiến-trúc-hệ-thống)
- [Cài đặt](#-cài-đặt)
  - [Local development](#local-development)
  - [Production (Unified server)](#production-unified-server)
- [Biến môi trường](#️-biến-môi-trường)
- [Thiết lập Google OAuth](#-thiết-lập-google-oauth)
- [Cloudflare Tunnel Setup](#-cloudflare-tunnel-setup)
- [API Documentation](#-api-documentation)
- [Cấu trúc thư mục](#-cấu-trúc-thư-mục)
- [Admin Setup](#-admin-setup)
- [Roadmap](#-roadmap)
- [Bản quyền](#-bản-quyền)

---

## 🎯 Giới Thiệu

**EDUMENTOR** là nền tảng học tập thông minh "tất-cả-trong-một" dành cho học sinh THPT Việt Nam, sử dụng Grok AI để:

- Chuyển đổi sách giáo khoa thành **bài giảng tương tác** (Markdown / LaTeX / JSON có cấu trúc).
- Tự động tạo **quiz trắc nghiệm** kèm giải thích chi tiết.
- Tạo **audio bài giảng** chất lượng cao với Murf.ai.
- Cung cấp **chatbot hỏi đáp 24/7** về kiến thức trong chương trình.
- Gợi ý **lộ trình học tập & hướng nghiệp** cá nhân hóa.

---

## ✨ Tính Năng Chính

### 🔐 Xác Thực & Tài Khoản

- Đăng ký / đăng nhập bằng email + mật khẩu (JWT).
- **Đăng nhập Google (Google OAuth)**:
  - Đăng nhập một chạm qua tài khoản Google.
  - Đồng bộ tên, email, avatar về tài khoản EDUMENTOR.
  - Hoạt động trên cả localhost và domain production.

### 📤 Upload & OCR

- Upload ảnh hoặc PDF sách giáo khoa.
- OCR tiếng Việt, hỗ trợ công thức Toán học.
- Chuẩn hóa nội dung để dùng cho tạo bài giảng & quiz.

### 📖 Bài Giảng AI

- Tạo bài giảng tự động bằng Grok AI.
- Hỗ trợ nhiều định dạng:
  - Markdown đọc dễ.
  - LaTeX hiển thị bằng Math renderer.
  - JSON có cấu trúc cho component StructuredLesson.
- Tóm tắt, ví dụ minh họa, lỗi thường gặp.

### 📝 Quiz & Đánh Giá

- Sinh quiz tự động từ bài giảng.
- Nhiều mức độ khó, nhiều dạng câu hỏi.
- Giải thích chi tiết cho từng câu.
- Phân tích kết quả, gợi ý điểm yếu cần cải thiện.

### 🔊 Text-to-Speech (Murf.ai)

- Tạo audio cho toàn bài hoặc từng section.
- Giọng đọc tự nhiên (MultiNative / Gen2).
- Cơ chế cache audio để tiết kiệm chi phí.

### 💬 Chatbot Hỏi Đáp

- Chatbot AI dùng Grok để giải thích kiến thức.
- Hiểu ngữ cảnh cuộc trò chuyện.
- Hỗ trợ giải bài tập từng bước (step-by-step).

### 🗺️ Lộ Trình & Hướng Nghiệp

- Lộ trình học tập theo mục tiêu (môn, điểm mong muốn).
- Tra cứu điểm chuẩn Đại học 2025.
- Gợi ý ngành nghề theo sở thích và năng lực.

---

## 🛠 Công Nghệ Sử Dụng

### Frontend (web)

- React 18, React Router 6.
- TailwindCSS.
- React Query, Axios.
- @react-oauth/google (Google OAuth).
- React Hot Toast, Heroicons.

### Backend

- Node.js 18, Express.js.
- NeDB (database file-based nhẹ).
- JWT, bcrypt.
- Multer (upload), Tesseract.js (OCR).

### AI & Dịch Vụ Ngoài

- Grok AI (xAI) – tạo bài giảng, quiz, chatbot.
- Murf.ai – Text-to-Speech.
- Cloudflare Tunnel – expose server ra internet.

### Mobile (đang phát triển)

- React Native (Expo) trong thư mục `mobile/`.
- Dùng chung API với backend hiện tại.

---

## 🏗 Kiến Trúc Hệ Thống

### Dev Mode (2 server)

- Frontend: React dev server (`frontend`, port 3000).
- Backend: Express server (`backend`, port 5000).
- Frontend gọi API qua `http://localhost:5000/api`.

### Production (Unified Server)

- `frontend` được build vào `frontend/build`.
- `backend/server.js`:
  - Serve toàn bộ file tĩnh từ `frontend/build`.
  - Tất cả route không phải `/api/*` trả về `index.html` (SPA routing).
  - API chạy dưới prefix `/api`.
- Chỉ cần mở **một port**: 5000.

Sơ đồ đơn giản:

```text
Browser ──► Cloudflare Tunnel (edumentor.io.vn) ──► Backend (port 5000)
                                 ├── Serve React build
                                 └── /api/... (REST API)
```

---

## 📦 Cài Đặt

### Yêu cầu

- Node.js ≥ 18
- npm ≥ 9
- Windows (các script .bat tối ưu cho Windows)

### Local Development

1. Clone repo:

   ```bash
   git clone https://github.com/cuongdev1108/AI-Tutor.git
   cd AI-Tutor
   ```

2. Cài đặt backend:

   ```bash
   cd backend
   npm install
   ```

3. Cài đặt frontend:

   ```bash
   cd ../frontend
   npm install
   ```

4. Tạo file môi trường từ template (backend):

   ```bash
   cd ../backend
   copy .env.example .env   # hoặc tự tạo nếu chưa có
   ```

5. Chạy dev (2 cửa sổ riêng):

   ```bash
   # Terminal 1 - backend
   cd backend
   npm start

   # Terminal 2 - frontend
   cd frontend
   npm start
   ```

### Production (Unified Server)

1. Build frontend:

   ```bash
   cd frontend
   npm run build
   ```

2. Chạy backend serve luôn frontend build:

   ```bash
   cd ../backend
   npm start
   ```

3. Truy cập:

- Web + API: http://localhost:5000

Nếu dùng Cloudflare Tunnel, port 5000 sẽ được map ra domain.

---

## ⚙️ Biến Môi Trường

### Backend – `backend/.env`

```env
PORT=5000
NODE_ENV=development

# JWT
JWT_SECRET=your_super_secret_jwt_key
JWT_EXPIRES_IN=7d

# Grok AI (xAI)
XAI_API_KEY=your_xai_api_key
XAI_MODEL=grok-beta

# Murf.ai
MURF_API_KEY=your_murf_api_key

# Google OAuth (phải trùng với frontend)
GOOGLE_CLIENT_ID=your_google_client_id.apps.googleusercontent.com

# CORS
FRONTEND_URL=http://localhost:3000
PRODUCTION_URL=https://edumentor.io.vn

# Upload
UPLOAD_DIR=./uploads
MAX_FILE_SIZE=10485760
```

### Frontend – `frontend/.env`

```env
# Dev: gọi trực tiếp server backend
REACT_APP_API_URL=http://localhost:5000/api

# Production (qua unified backend / Cloudflare)
# Có thể set thành /api để relative theo domain
# REACT_APP_API_URL=/api

# Google OAuth
REACT_APP_GOOGLE_CLIENT_ID=your_google_client_id.apps.googleusercontent.com
```

---

## 🔐 Thiết Lập Google OAuth

1. Vào Google Cloud Console → APIs & Services → Credentials.
2. Tạo **OAuth 2.0 Client ID** loại **Web application**.
3. Phần **Authorized JavaScript origins**:
   - `http://localhost:3000` (dev frontend)
   - `http://localhost:5000` (unified local)
   - `https://edumentor.io.vn` (production)
4. Phần **Authorized redirect URIs**:
   - Có thể dùng cùng origin, vì thư viện @react-oauth/google dùng popup/redirect nội bộ.
5. Copy **Client ID** dán vào:
   - Backend: biến `GOOGLE_CLIENT_ID`.
   - Frontend: biến `REACT_APP_GOOGLE_CLIENT_ID`.
6. Build lại frontend (`npm run build`) nếu chạy production.

---

## 🌐 Cloudflare Tunnel Setup

Ví dụ cấu hình tối giản để expose unified backend (port 5000):

```yaml
tunnel: <YOUR_TUNNEL_ID>
credentials-file: C:\Users\<USER>\.cloudflared\<TUNNEL_ID>.json

ingress:
  - hostname: edumentor.io.vn
    service: http://localhost:5000

  - service: http_status:404
```

Chạy:

```bash
cloudflared tunnel --config cloudflare/config.yml run
```

Lúc này toàn bộ web + API đều qua https://edumentor.io.vn.

---

## 📚 API Documentation

Base URL (dev): `http://localhost:5000/api`

Sử dụng JWT Bearer trong header:

```http
Authorization: Bearer <token>
```

### Auth

- `POST /auth/register` – Đăng ký.
- `POST /auth/login` – Đăng nhập.
- `POST /auth/google` – Đăng nhập / đăng ký bằng Google.

### Lessons

- `GET /lessons` – Danh sách bài học.
- `GET /lessons/:id` – Chi tiết bài học.
- `POST /lessons` – Tạo bài học.

### Quiz

- `POST /quiz/generate` – Sinh quiz từ nội dung.
- `POST /quiz/:id/submit` – Nộp bài, chấm điểm.

### Chat

- `POST /chat` – Gửi câu hỏi cho chatbot.

### TTS

- `POST /tts` – Tạo audio từ text.

### Career

- `GET /career/diem-chuan` – Tra cứu điểm chuẩn.

*(Xem chi tiết thêm trong mã nguồn controllers nếu cần.)*

---

## 📁 Cấu Trúc Thư Mục

```text
.
├── backend/
│   ├── controllers/
│   ├── routes/
│   ├── services/
│   ├── middleware/
│   ├── database/
│   ├── uploads/
│   ├── server.js
│   └── .env
│
├── frontend/
│   ├── public/
│   ├── src/
│   │   ├── pages/
│   │   ├── components/
│   │   ├── context/
│   │   ├── services/
│   │   ├── App.js
│   │   └── index.js
│   └── .env
│
├── mobile/        # Ứng dụng React Native (đang phát triển)
├── cloudflare/    # Cấu hình tunnel
└── README.md
```

---

## 👨‍💼 Admin Setup

Tạo tài khoản admin đầu tiên:

```bash
cd backend
node create-admin.js
```

Mặc định:

- Email: `admin@edumentor.io.vn`
- Password: `Admin@123456`

Sau đó đăng nhập và truy cập `/admin` trên web.

---

## 📊 Roadmap

### Đã hoàn thành

- [x] OCR + bài giảng AI từ SGK.
- [x] Quiz tự động + phân tích kết quả.
- [x] TTS với Murf.ai + cache audio.
- [x] Chatbot hỏi đáp 24/7.
- [x] Đăng nhập Google OAuth.
- [x] Hợp nhất backend + frontend (unified server).
- [x] Cloudflare Tunnel + domain edumentor.io.vn.

### Đang phát triển

- [ ] Ứng dụng mobile (React Native).
- [ ] Gamification (badge, streak, leaderboard).
- [ ] PWA & offline mode.

---

## 📄 Bản Quyền

MIT License © 2026 **cuongdev1108**

Được phép sử dụng, sửa đổi, phân phối cho mục đích học tập và phát triển sản phẩm, với điều kiện giữ lại thông tin bản quyền.

---

<div align="center">

**EDUMENTOR – Học thông minh hơn với AI**

Nếu dự án hữu ích, hãy cho một ⭐ để ủng hộ.

</div>
