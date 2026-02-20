# 🎓 Google OAuth với Complete Profile Flow

## Tính năng mới

Khi người dùng đăng ký bằng Google lần đầu tiên, họ sẽ được yêu cầu điền thông tin bổ sung:
- **Họ và tên** (tự điền)
- **Lớp** (chọn từ dropdown: 10, 11, 12)
- **Trường** (tự điền)

## Luồng hoạt động

### 1. User đăng ký/đăng nhập Google lần đầu

```
User click "Đăng nhập bằng Google"
    ↓
Google OAuth popup
    ↓
User chọn tài khoản Google
    ↓
Backend tạo user mới (nếu chưa tồn tại)
    ↓
Backend trả về: { success: true, user, token, needsProfileCompletion: true }
    ↓
Frontend redirect đến /complete-profile
```

### 2. User điền thông tin

```
Trang Complete Profile hiển thị form:
├── Họ và tên (*)
├── Lớp (*) - Dropdown: 10, 11, 12
└── Trường (*)
    ↓
User điền đầy đủ và nhấn "Hoàn thành"
    ↓
POST /api/auth/complete-profile
    ↓
Backend cập nhật user với thông tin mới
    ↓
Frontend xóa flag needsProfileCompletion
    ↓
Redirect đến /dashboard
```

### 3. User đã có thông tin đầy đủ

```
User click "Đăng nhập bằng Google"
    ↓
Google OAuth popup
    ↓
Backend trả về: { success: true, user, token, needsProfileCompletion: false }
    ↓
Frontend redirect trực tiếp đến /dashboard
```

## Files đã triển khai

### Backend

**backend/controllers/authController.js**
- Method `googleAuth()`: Thêm flag `needsProfileCompletion` trong response
  - `needsProfileCompletion = true` nếu user chưa có `grade` hoặc `school`
  - `needsProfileCompletion = false` nếu user đã đầy đủ thông tin

- Method `completeProfile()`: Endpoint mới để cập nhật profile
  - Protected route (yêu cầu token)
  - Validate: name, grade, school phải có giá trị
  - Cập nhật user trong database
  - Trả về user đã cập nhật

**backend/routes/index.js**
```javascript
router.post('/auth/complete-profile', verifyToken, authController.completeProfile);
```

### Frontend

**frontend/src/pages/CompleteProfile.js**
- Form đẹp với dark tech theme
- 3 fields: name (text), grade (dropdown), school (text)
- Validation: Tất cả fields bắt buộc
- Call API `/auth/complete-profile` khi submit
- Redirect đến dashboard sau khi thành công

**frontend/src/context/AuthContext.js**
- Method `googleLogin()`: Parse `needsProfileCompletion` từ response
  - Lưu flag vào localStorage nếu cần complete profile
  - Return `needsProfileCompletion` cho caller

- Method `completeProfile()`: API call mới
  - POST `/auth/complete-profile` với name, grade, school
  - Cập nhật user state
  - Xóa flag `needsProfileCompletion` sau khi thành công

**frontend/src/pages/Login.js**
- Sửa `handleGoogleLogin()`: Check `needsProfileCompletion`
  - Nếu `true`: redirect đến `/complete-profile`
  - Nếu `false`: redirect đến `/dashboard`

**frontend/src/App.js**
- Thêm route `/complete-profile` (protected)
- Sửa `ProtectedRoute`: Auto-redirect đến `/complete-profile` nếu:
  - User đã login
  - Flag `needsProfileCompletion` tồn tại trong localStorage
  - Đang không ở trang `/complete-profile`

## API Endpoints

### POST /api/auth/google

**Request:**
```json
{
  "credential": "google_id_token",
  // OR
  "accessToken": "google_access_token",
  "userInfo": {
    "email": "user@gmail.com",
    "name": "User Name",
    "picture": "https://...",
    "sub": "google_user_id"
  }
}
```

**Response (User mới):**
```json
{
  "success": true,
  "message": "Đăng ký Google thành công",
  "user": {
    "id": "abc123",
    "email": "user@gmail.com",
    "name": "User Name",
    "grade": "",
    "school": "",
    "avatar": "https://...",
    "googleId": "google_user_id"
  },
  "token": "jwt_token",
  "needsProfileCompletion": true
}
```

**Response (User đã có thông tin):**
```json
{
  "success": true,
  "message": "Đăng nhập Google thành công",
  "user": {
    "id": "abc123",
    "email": "user@gmail.com",
    "name": "User Name",
    "grade": "11",
    "school": "THPT Nguyễn Huệ",
    "avatar": "https://...",
    "googleId": "google_user_id"
  },
  "token": "jwt_token",
  "needsProfileCompletion": false
}
```

### POST /api/auth/complete-profile

**Headers:**
```
Authorization: Bearer {token}
```

**Request:**
```json
{
  "name": "Nguyễn Văn A",
  "grade": "11",
  "school": "THPT Nguyễn Huệ"
}
```

**Response:**
```json
{
  "success": true,
  "message": "Cập nhật thông tin thành công",
  "user": {
    "id": "abc123",
    "email": "user@gmail.com",
    "name": "Nguyễn Văn A",
    "grade": "11",
    "school": "THPT Nguyễn Huệ",
    "avatar": "https://...",
    "googleId": "google_user_id"
  }
}
```

**Error (400):**
```json
{
  "error": "Vui lòng điền đầy đủ thông tin (tên, lớp, trường)"
}
```

## Testing

### 1. Test với Google OAuth mới

1. Truy cập http://localhost:5000/login
2. Click "Đăng nhập bằng Google"
3. Chọn tài khoản Google chưa từng đăng ký
4. **Expect:** Redirect đến `/complete-profile`
5. Điền thông tin: Tên, Lớp (chọn dropdown), Trường
6. Click "Hoàn thành"
7. **Expect:** Toast success, redirect đến `/dashboard`
8. Refresh page → Vẫn ở dashboard (không redirect về complete-profile)

### 2. Test với Google OAuth đã có thông tin

1. Đăng xuất
2. Click "Đăng nhập bằng Google"
3. Chọn tài khoản Google đã có đầy đủ thông tin
4. **Expect:** Redirect trực tiếp đến `/dashboard` (skip complete-profile)

### 3. Test protection

1. Đăng nhập Google lần đầu (needsProfileCompletion = true)
2. Thử manually navigate đến `/dashboard` (via URL)
3. **Expect:** Auto-redirect về `/complete-profile`
4. Hoàn thành profile
5. Thử navigate đến `/dashboard`
6. **Expect:** Vào được dashboard bình thường

## UI Design

**CompleteProfile page:**
- Background: Dark gradient (gray-950) với tech grid
- Form: Glass morphism card với border gradient
- Icon: UserIcon (name), AcademicCapIcon (grade), BuildingOfficeIcon (school)
- Button: Gradient primary → secondary
- Responsive: Mobile-friendly
- Validation: Real-time feedback với toast

## Security

- ✅ Complete profile endpoint requires authentication (verifyToken)
- ✅ Flag `needsProfileCompletion` không bypass protected routes
- ✅ User không thể access dashboard khi chưa complete profile
- ✅ Validation ở cả frontend và backend

## Future Enhancements

- [ ] Thêm nhiều lựa chọn lớp (10-12 + các chương trình khác)
- [ ] Auto-complete cho tên trường từ database
- [ ] Upload avatar trong complete profile
- [ ] Chọn sở thích/môn học yêu thích
- [ ] Email verification sau khi complete profile
