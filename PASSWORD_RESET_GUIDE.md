# 🔐 Password Reset Feature - Complete Guide

## Tổng quan

Hệ thống đặt lại mật khẩu đã được triển khai đầy đủ với các tính năng:
- ✅ Email tự động gửi link đặt lại mật khẩu
- ✅ Token bảo mật (SHA256 hash, hết hạn sau 15 phút)
- ✅ UI sang trọng với dark luxury tech theme
- ✅ Hoạt động trên cả localhost và Cloudflare Tunnel (https://edumentor.io.vn)

## Cấu hình Email SMTP

File: `backend/.env`

```env
# SMTP Configuration
SMTP_HOST=smtp.gmail.com
SMTP_PORT=587
SMTP_SECURE=false
SMTP_USER=edumentor.hk@gmail.com
SMTP_PASS=skev nuek kjzv ubmm
MAIL_FROM=edumentor.hk@gmail.com

# Frontend URL (for password reset links)
FRONTEND_APP_URL=https://edumentor.io.vn
```

**Lưu ý:** `SMTP_PASS` là **Google App Password**, không phải mật khẩu thông thường.

## Cách sử dụng

### 1. User quên mật khẩu

1. Truy cập trang Login
2. Click vào link **"Quên mật khẩu?"**
3. Nhập email đã đăng ký
4. Click **"Gửi liên kết"**
5. Kiểm tra email (kể cả thư mục spam)

### 2. Nhận email và đặt lại mật khẩu

1. Mở email từ **EDUMENTOR** (tiêu đề: "✨ EDUMENTOR | Đặt lại mật khẩu an toàn")
2. Click nút **"🔐 Đặt lại mật khẩu ngay"** (màu gradient xanh-tím-hồng)
3. Trang reset password sẽ mở với form:
   - Hiển thị email đang đặt lại
   - Nhập mật khẩu mới (tối thiểu 6 ký tự)
   - Xác nhận mật khẩu mới
4. Click **"Cập nhật mật khẩu"**
5. Thấy thông báo thành công → Redirect về trang Login
6. Đăng nhập với mật khẩu mới

### 3. Lưu ý

- **Thời gian hiệu lực:** Link chỉ hoạt động trong **15 phút**
- **Mỗi email:** Chỉ có thể yêu cầu đặt lại mật khẩu khi email tồn tại trong hệ thống
- **Bảo mật:** Token được hash SHA256, không lưu plain text
- **Email không tồn tại:** Hệ thống vẫn trả về thông báo chung (security by obscurity)

## Kiểm tra hệ thống

### Test email sending

```bash
cd backend
node test-email-send.js
```

Sẽ gửi email test đến `edumentor.hk@gmail.com`.

### Test API forgot-password

```bash
curl -X POST http://localhost:5000/api/auth/forgot-password \
  -H "Content-Type: application/json" \
  -H "x-forwarded-proto: https" \
  -H "x-forwarded-host: edumentor.io.vn" \
  -d '{"email":"admin@edumentor.io.vn"}'
```

### Test API reset-password

```bash
curl -X POST http://localhost:5000/api/auth/reset-password \
  -H "Content-Type: application/json" \
  -d '{
    "email":"admin@edumentor.io.vn",
    "token":"YOUR_TOKEN_FROM_EMAIL",
    "password":"NewPassword123!"
  }'
```

## Troubleshooting

### Email không gửi được

**Lỗi:** `535 Authentication failed`

**Giải pháp:**
1. Kiểm tra `SMTP_USER` có đúng email Gmail
2. Kiểm tra `SMTP_PASS` là **App Password** (16 ký tự, không có khoảng trắng)
3. Bật **2-Step Verification** trên Google Account
4. Tạo App Password mới tại: https://myaccount.google.com/apppasswords

### Link không hoạt động

**Vấn đề:** Click link từ email nhưng không đổi được mật khẩu

**Nguyên nhân & Giải pháp:**

| Nguyên nhân | Giải pháp |
|-------------|-----------|
| Token hết hạn (>15 phút) | Yêu cầu reset lại từ trang Forgot Password |
| Server chưa rebuild frontend | Chạy `npm run build` trong folder frontend |
| CORS issue | Kiểm tra server có serve frontend build |
| Server không chạy | Khởi động: `cd backend && node server.js` |

### Token không hợp lệ

**Lỗi:** `Token đặt lại mật khẩu không hợp lệ`

**Nguyên nhân:**
- Token bị copy sai (thiếu ký tự)
- Token đã được sử dụng (mỗi token chỉ dùng 1 lần)
- Yêu cầu reset nhiều lần → token cũ bị ghi đè

**Giải pháp:** Yêu cầu reset password mới, sử dụng link/token mới nhất trong email.

## API Endpoints

### POST /api/auth/forgot-password

Request:
```json
{
  "email": "user@example.com"
}
```

Response (200):
```json
{
  "success": true,
  "message": "Nếu email tồn tại trong hệ thống, chúng tôi đã gửi liên kết đặt lại mật khẩu."
}
```

### POST /api/auth/reset-password

Request:
```json
{
  "email": "user@example.com",
  "token": "64_character_hex_token",
  "password": "NewSecurePassword123!"
}
```

Response (200):
```json
{
  "success": true,
  "message": "Đặt lại mật khẩu thành công. Bạn có thể đăng nhập lại."
}
```

Error (400):
```json
{
  "error": "Token đặt lại mật khẩu không hợp lệ hoặc đã hết hạn"
}
```

## Files đã triển khai

### Backend
- `backend/controllers/authController.js` - Logic forgot/reset password
- `backend/services/emailService.js` - SMTP service với luxury email template
- `backend/routes/index.js` - API routes
- `backend/.env` - SMTP configuration

### Frontend
- `frontend/src/pages/ForgotPassword.js` - UI yêu cầu reset
- `frontend/src/pages/ResetPassword.js` - UI đặt mật khẩu mới
- `frontend/src/App.js` - Route configuration

## Email Template Design

Email sử dụng **dark luxury tech theme**:
- Background: Dark gradient với radial glow effects
- Button: Multi-layer gradient (cyan → blue → purple → pink)
- Glass morphism panels
- Security badges
- Responsive design
- Fallback plain text version

## Security Features

1. **Token Hashing:** Raw token không bao giờ lưu database (chỉ lưu SHA256 hash)
2. **Time-based Expiry:** Token tự động hết hạn sau 15 phút
3. **One-time Use:** Token bị xóa sau khi dùng thành công
4. **Email Obfuscation:** Không tiết lộ email có tồn tại hay không
5. **HTTPS Only:** Production link luôn dùng HTTPS
6. **Rate Limiting:** Server có rate limit protection

## Deployment Checklist

- [x] Frontend build với latest code
- [x] Backend có file .env với SMTP credentials
- [x] FRONTEND_APP_URL trỏ đúng domain production
- [x] Server khởi động không lỗi
- [x] Test gửi email thật thành công
- [x] Test click link từ email hoạt động
- [x] Test reset password và login thành công

## Support

Nếu gặp vấn đề khi sử dụng tính năng này:
- Email: edumentor.hk@gmail.com
- Check backend logs: `backend/server.js` terminal output
- Xem database: Chạy script `backend/list-users.js`
