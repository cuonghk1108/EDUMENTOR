# 🚀 EDUMENTOR - HƯỚNG DẪN SETUP & CLOUDFLARE TUNNEL

## ✅ TẠI SAO ĐỂ HOÀN TẤT

### 1️⃣ Kiểm Tra Cài Đặt
```powershell
node --version        # v22.15.0+ ✓
python --version      # 3.11+ ✓  
cloudflared --version # 2025.9.1+ ✓
```

### 2️⃣ Dependencies Đã Cài
- ✅ Backend npm packages (Express, Firebase, OpenAI, etc.)
- ✅ Frontend npm packages (React 18, Tailwind, etc.)
- ✅ Python Celery packages (Async tasks)
- ✅ Cloudflared tunnel: **edumentor** (ID: `e4a9918c-81a4-48aa-a25e-3ef3e2a5788d`)

### 3️⃣ Environment Files Đã Tạo
- ✅ `backend/.env` - Có API keys, JWT, Firebase config
- ✅ `frontend/.env.local` - Google OAuth & API endpoints
- ✅ `cloudflare/config-production.yml` - Tunnel config (cập nhật tunnel ID)

---

## 🌐 CLOUDFLARE TUNNEL CONFIGURATION

### Current Setup
| Config | Value |
|--------|-------|
| **Domain** | edumentor.io.vn |
| **Tunnel Name** | edumentor |
| **Tunnel ID** | e4a9918c-81a4-48aa-a25e-3ef3e2a5788d |
| **Credentials** | C:\Users\XC\.cloudflared\ |

### Cloudflare Routing
```yaml
edumentor.io.vn/api/*      → Backend (localhost:5000)
edumentor.io.vn/audio/*    → Backend (localhost:5000)
edumentor.io.vn/uploads/*  → Backend (localhost:5000)
edumentor.io.vn/*          → Frontend React (localhost:5000)
www.edumentor.io.vn        → Frontend (redirect)
```

### Kiểm Tra Tunnel Status
```powershell
cloudflared tunnel list        # Liệt kê tất cả tunnels
cloudflared tunnel info edumentor  # Chi tiết tunnel
cloudflared tunnel delete edumentor # Xóa tunnel (nếu cần)
```

---

## ⚡ CHẠY DỰ ÁN

### Cách 1: Tất Cả Services Cùng Lúc (Khuyên Dùng)
```powershell
D:\AII\start.bat
```
Sẽ khởi động:
- 🖥️ Backend (Port 5000) - Node.js server
- 🌐 Cloudflare Tunnel (edumentor.io.vn)
- 🐍 Celery API (Port 8001) - Task queue
- 🔄 Celery Worker - Process async tasks
- (Optional) Redis (Port 6379) - Cache

### Cách 2: Từng Service Riêng (Debugging)
```powershell
# Terminal 1 - Backend
cd D:\AII\backend
npm start
# Localhost: http://localhost:5000

# Terminal 2 - Cloudflare Tunnel
cloudflared tunnel --config D:\AII\cloudflare\config-production.yml run edumentor
# Production: https://edumentor.io.vn

# Terminal 3 - Celery Worker (optional)
cd D:\AII\celery
python -m celery -A celery_app.celery_app worker --loglevel=info --pool=solo

# Terminal 4 - Celery API (optional)
cd D:\AII\celery
python -m uvicorn worker_api:app --host 0.0.0.0 --port 8001
```

---

## 🔧 CẤU HÌNH CLOUDFLARE DNS

### Nếu Chưa Cấu Hình Domain (⚠️ CẦN THỰC HIỆN)

1. **Đăng Nhập Cloudflare Dashboard**
   - https://dash.cloudflare.com
   - Tài khoản: [Your Cloudflare Account]

2. **Cấu Hình DNS cho edumentor.io.vn**
   ```powershell
   # Trỏ domain chính
   cloudflared tunnel route dns edumentor edumentor.io.vn
   
   # Trỏ www subdomain
   cloudflared tunnel route dns edumentor www.edumentor.io.vn
   ```

3. **Hoặc Manual trong Dashboard Cloudflare**
   - Vào Domain Settings
   - Thêm CNAME record:
     ```
     Name: edumentor
     Target: e4a9918c-81a4-48aa-a25e-3ef3e2a5788d.cfargotunnel.com
     ```

### Kiểm Tra DNS
```powershell
nslookup edumentor.io.vn
# Phải trỏ về Cloudflare nameserver
```

---

## 🔐 SECURITY & BEST PRACTICES

### 1. Protect API Keys
- ⚠️ Đừng commit `.env` vào Git
- 🔒 Lưu API keys trong secure vault
- 🔄 Rotate keys định kỳ

### 2. Cloudflare Security
```yaml
# config-production.yml settings:
disableChunkedEncoding: true  # Fix file upload
connectTimeout: 300s          # Long timeout cho large files
noTLSVerify: false           # Enable HTTPS validation
```

### 3. Rate Limiting (Backend)
```env
RATE_LIMIT_MAX=100           # 100 requests
RATE_LIMIT_WINDOW=15         # per 15 minutes
ADMIN_RATE_LIMIT_MAX=1000    # Admin more lenient
```

---

## 📊 MONITORING & DEBUGGING

### Check Tunnel Status
```powershell
# Live logs
cloudflared tunnel run edumentor --loglevel debug

# Kiểm tra connection
cloudflared tunnel info edumentor
```

### Backend Logs
```powershell
cd D:\AII\backend
npm start
# Xem logs tại console
```

### Test API
```powershell
# Test localhost
curl http://localhost:5000/health

# Test via tunnel
curl https://edumentor.io.vn/health
```

---

## 🚨 TROUBLESHOOTING

### Tunnel không connect
```powershell
# 1. Kiểm tra credentials
cloudflared tunnel login
# Điều này sẽ mở browser để authenticate

# 2. Xóa tunnel cũ
cloudflared tunnel delete edumentor

# 3. Tạo tunnel mới
cloudflared tunnel create edumentor

# 4. Update config-production.yml với Tunnel ID mới
```

### Port đang sử dụng
```powershell
# Kiểm tra port 5000
netstat -ano | findstr :5000

# Kill process (nếu cần)
taskkill /PID <PID> /F
```

### Frontend không load
```powershell
# 1. Rebuild frontend
cd D:\AII\frontend
npm run build

# 2. Clear browser cache (Ctrl+Shift+Del)

# 3. Kiểm tra .env.local có API_URL đúng
```

---

## 📚 FILE LOCATIONS

```
D:\AII\
├── backend/
│   ├── .env                    # ← API Keys, JWT, Firebase
│   └── server.js               # ← Main server (Port 5000)
├── frontend/
│   ├── .env.local              # ← Google OAuth, API URL
│   └── src/                    # ← React app
├── celery/
│   ├── celery_app.py
│   ├── worker_api.py           # ← Celery API (Port 8001)
│   └── requirements.txt        # ← Python deps
├── cloudflare/
│   ├── config-production.yml   # ← ⭐ Tunnel config (IMPORTANT)
│   └── README.md
├── start.bat                   # ← 🚀 Run everything
└── setup_new_machine.bat       # ← Setup script
```

---

## ✨ NEXT STEPS

1. ✅ Run `D:\AII\start.bat` để khởi động tất cả services
2. ✅ Kiểm tra http://localhost:5000 (Development)
3. ✅ Kiểm tra https://edumentor.io.vn (Production via Tunnel)
4. ✅ Test API endpoints
5. 📊 Monitor performance & logs

---

## 📞 SUPPORT

- 🐛 Issues: Check logs in terminal windows
- 🔧 Config: Update `backend/.env` & `cloudflare/config-production.yml`
- 🌐 Domain: edumentor.io.vn
- 📧 Contact: edumentor.hk@gmail.com

---

**Last Updated:** 2026-04-29 | Version 1.1.0
