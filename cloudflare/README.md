# Hướng dẫn Deploy với Cloudflare Tunnel

## Yêu cầu
- Tài khoản Cloudflare (miễn phí)
- Tên miền đã thêm vào Cloudflare
- Windows 10/11

## Các bước thực hiện

### Bước 1: Cài đặt Cloudflared
```powershell
winget install --id Cloudflare.cloudflared
```

### Bước 2: Đăng nhập Cloudflare
```powershell
cloudflared tunnel login
```
- Trình duyệt sẽ mở, chọn tên miền của bạn
- Sau khi xác thực, file credentials sẽ được lưu tại `C:\Users\YOUR_USERNAME\.cloudflared\`

### Bước 3: Tạo Tunnel
```powershell
cloudflared tunnel create edumentor
```
- Ghi lại **Tunnel ID** được hiển thị (dạng: `a1b2c3d4-xxxx-xxxx-xxxx-xxxxxxxxxxxx`)

### Bước 4: Cấu hình DNS
```powershell
# Trỏ domain chính
cloudflared tunnel route dns edumentor edumentor.io.vn

# Trỏ www
cloudflared tunnel route dns edumentor www.edumentor.io.vn
```

### Bước 5: Cấu hình Tunnel
1. Mở file `D:\AII\cloudflare\config-production.yml`
2. Thay đổi:
   - `TUNNEL_ID` → ID tunnel vừa tạo
   - `YOUR_USERNAME` → Tên user Windows của bạn

### Bước 6: Chạy dự án

**Cách 1: Chạy thủ công từng service**
```powershell
# Terminal 1 - Backend
cd D:\AII\backend
npm start

# Terminal 2 - Frontend
cd D:\AII\frontend
npm start

# Terminal 3 - Cloudflare Tunnel
cloudflared tunnel --config D:\AII\cloudflare\config-production.yml run edumentor
```

**Cách 2: Chạy tất cả bằng script**
```powershell
D:\AII\cloudflare\start-all.bat
```

## Cài đặt Tunnel như Windows Service (Chạy tự động)

```powershell
# Chạy với quyền Administrator
cloudflared service install
cloudflared service start
```

Hoặc cấu hình service thủ công:
```powershell
cloudflared tunnel --config D:\AII\cloudflare\config-production.yml run edumentor --install
```

## Kiểm tra Tunnel

```powershell
# Xem danh sách tunnel
cloudflared tunnel list

# Xem thông tin tunnel
cloudflared tunnel info edumentor

# Xem logs
cloudflared tunnel run edumentor --loglevel debug
```

## Cấu trúc

```
Internet
    │
    ▼
┌─────────────────────────┐
│   Cloudflare Edge       │
│   (SSL/CDN/Protection)  │
└───────────┬─────────────┘
            │
            ▼
┌─────────────────────────┐
│   Cloudflare Tunnel     │
│   (Encrypted Tunnel)    │
└───────────┬─────────────┘
            │
    ┌───────┴───────┐
    │               │
    ▼               ▼
┌────────┐    ┌──────────┐
│Backend │    │ Frontend │
│ :5000  │    │  :3000   │
└────────┘    └──────────┘
     Máy tính của bạn
```

## Ưu điểm của Cloudflare Tunnel

✅ Không cần mở port trên router
✅ Không cần IP tĩnh
✅ SSL/HTTPS miễn phí tự động
✅ DDoS Protection
✅ CDN toàn cầu
✅ Bảo mật cao (không expose IP thật)
✅ Miễn phí

## Lưu ý khi Production

1. **Frontend nên build trước:**
   ```powershell
   cd D:\AII\frontend
   npm run build
   npx serve -s build -l 3000
   ```

2. **Sử dụng PM2 cho Windows (optional):**
   ```powershell
   npm install -g pm2
   cd D:\AII\backend
   pm2 start server.js --name backend
   ```

3. **Cấu hình CORS trong backend** để chấp nhận domain mới:
   - Thêm domain vào biến môi trường `FRONTEND_URL`
