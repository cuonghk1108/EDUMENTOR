# Hướng Dẫn: Khắc Phục Lỗi Tạo Quiz

## ❌ Các Lỗi Được Phát Hiện và Khắc Phục

### 1. **Lỗi JSON Parsing** 
- **Vấn đề**: Nếu API xAI (Grok) trả về text kèm theo JSON hoặc JSON không hợp lệ, hàm `JSON.parse()` sẽ fail
- **Khắc Phục**: 
  - Thêm try-catch nested để tìm JSON object trong response
  - Regex pattern `\{[\s\S]*\}` để extract JSON từ text

### 2. **Thiếu Validation Input**
- **Vấn đề**: Không kiểm tra nội dung text trước khi gửi lên AI
- **Khắc Phục**:
  - Kiểm tra text có ít nhất 10-20 ký tự
  - Trim whitespace trước khi validate

### 3. **Không Validate Response Structure**
- **Vấn đề**: Response từ AI không được validate nên có thể thiếu các fields bắt buộc
- **Khắc Phục**:
  - Check `quiz.questions` có tồn tại và là array
  - Check mỗi question có đủ fields: `question`, `answer`, `A`, `B`, `C`, `D`
  - Check `answer` chỉ là A/B/C/D

### 4. **Prompt Ambiguous**
- **Vấn đề**: Prompt không rõ ràng, có thể làm AI trả về kết quả không đúng format
- **Khắc Phục**:
  - Thêm rõ ràng "CHỈ TRẢ VỀ JSON, KHÔNG CÓ TEXT KHÁC"
  - Spec rõ format của answer field (chỉ A/B/C/D)
  - Thêm ví dụ cụ thể

### 5. **Error Messages Không Cụ Thể**
- **Vấn đề**: Frontend chỉ show "Lỗi tạo quiz" generic, không giúp user hiểu vấn đề
- **Khắc Phục**:
  - Backend trả về error messages cụ thể
  - Frontend show error message từ server
  - Thêm logging để debug

### 6. **Missing Alternative Text Fields**
- **Vấn đề**: Frontend dùng `lesson.originalText` nhưng có thể dùng `sourceText` từ OCR
- **Khắc Phục**:
  - Fallback chain: `lesson.originalText || lesson.sourceText || lesson.content`

## 📝 Các File Được Sửa Đổi

### Backend
1. **`backend/services/aiService.js`** (dòng 903-976)
   - Cải thiện JSON parsing với regex fallback
   - Thêm validation cho input text
   - Validate response structure
   - Cập nhật prompt template

2. **`backend/controllers/quizController.js`** (dòng 6-46, 255-281)
   - Thêm validation text length
   - Cải thiện error handling
   - Thêm specific error messages
   - Validate response structure

### Frontend
1. **`frontend/src/pages/LessonView.js`** (dòng 75-96)
   - Thêm validation text length
   - Fallback để dùng `sourceText`
   - Show actual error message từ server
   - Thêm logging

2. **`frontend/src/pages/Upload.js`** (dòng 309-330)
   - Thêm validation text length
   - Show actual error message
   - Thêm console.error für debugging

## 🔧 Các Cải Thiện Chi Tiết

### aiService.js - generateQuiz

```javascript
// Thêm validation input
if (!text || text.trim().length < 10) {
  throw new Error('Nội dung quá ngắn...');
}

// Improve JSON parsing
let quiz;
try {
  quiz = JSON.parse(content);
} catch (parseError) {
  // Try to extract JSON if there's extra text
  const jsonMatch = content.match(/\{[\s\S]*\}/);
  if (jsonMatch) {
    quiz = JSON.parse(jsonMatch[0]);
  } else {
    throw new Error(`Cannot parse JSON: ${content.substring(0, 100)}...`);
  }
}

// Validate structure
if (!quiz.questions || !Array.isArray(quiz.questions)) {
  throw new Error('Response khong co mang questions');
}
```

### Prompt Template

```javascript
// Rõ ràng hơn về format
ĐỊNH DẠNG OUTPUT (CHỈ TRẢ VỀ JSON, KHÔNG CÓ TEXT KHÁC):
{
  "topic": "...",
  "questions": [
    {
      "id": 1,
      "question": "...",
      "A": "...",
      "B": "...",
      "C": "...",
      "D": "...",
      "answer": "A",  // <- Chỉ A/B/C/D
      "explanation": "...",
      "difficulty": "easy"
    }
  ]
}
```

## ✅ Cách Test

### 1. Test Backend API Direct

```bash
# Tạo user mới
curl -X POST http://localhost:5000/api/auth/register \
  -H "Content-Type: application/json" \
  -d '{
    "email": "test@example.com",
    "password": "Test@123456",
    "name": "Test",
    "grade": "12",
    "school": "Test"
  }'

# Login
curl -X POST http://localhost:5000/api/auth/login \
  -H "Content-Type: application/json" \
  -d '{
    "email": "test@example.com",
    "password": "Test@123456"
  }'

# Tạo quiz (dùng token từ login response)
curl -X POST http://localhost:5000/api/quiz \
  -H "Content-Type: application/json" \
  -H "Authorization: Bearer YOUR_TOKEN" \
  -d '{
    "text": "Lịch sử Việt Nam bao gồm nhiều giai đoạn phát triển...",
    "topic": "Lịch sử"
  }'
```

### 2. Test Frontend
- Vào Upload page, upload file PDF/ảnh
- Click "Tạo Quiz"
- Nếu lỗi, check browser console để thấy error message cụ thể

### 3. Debug Checklist
- ✅ Check XAI_API_KEY có được set trong `.env`
- ✅ Check text content không trống
- ✅ Check AI response format
- ✅ Check error message trong server logs

## ⚙️ Requirements

### Environment Variables
```
XAI_API_KEY=your_xai_api_key
XAI_MODEL=grok-3
```

### Minimal Content Length
- Minimum 10 ký tự để tạo quiz
- Recommend ít nhất 50-100 ký tự để có câu hỏi chất lượng

## 🚀 Deployment

1. Deploy code từ branch này
2. Verify `.env` có `XAI_API_KEY`
3. Restart server
4. Test tạo quiz từ UI hoặc API

## 📊 Monitoring

Server logs sẽ show:
```
Generate quiz error: [error details]
Error details: [API error if any]
```

Frontend console sẽ show:
```
Quiz generation error: [error object]
```

## 🎯 Expected Behavior

### Success Case
1. User click "Tạo Quiz"
2. Frontend validate text length
3. Send to backend
4. Backend generate 20 questions
5. Show success toast và redirect to quiz

### Error Cases
- **Text quá ngắn**: "Nội dung quá ngắn..."
- **API key lỗi**: "Lỗi xác thực API..."
- **Rate limiting**: "Quá nhiều request..."
- **JSON invalid**: "Không thể parse JSON..."

## 📞 Troubleshooting

| Lỗi | Nguyên nhân | Giải pháp |
|-----|-----------|----------|
| "Nội dung quá ngắn" | Text < 10-20 ký tự | Upload file dài hơn |
| "Lỗi xác thực API" | XAI_API_KEY lỗi | Check .env |
| "Quá nhiều request" | Rate limit | Đợi vài giây rồi thử lại |
| "Không thể tạo quiz" | Lỗi trên server | Check server logs |

