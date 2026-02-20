# Celery File Processing - Hướng Dẫn

## 📋 Tổng Quan

Hệ thống EDUMENTOR sử dụng **Celery + Redis** để xử lý file upload **asynchronously**. Khi user upload file, backend sẽ:

1. Lưu file vào disk
2. Enqueue task xử lý file
3. Trả về task ID cho client
4. Celery Worker xử lý OCR/PDF extraction
5. Lưu kết quả vào database
6. Client có thể track progress qua task status

---

## 🏗 Kiến Trúc

```
Frontend (Browser)
      ↓ Upload file
      ↓
Backend API (Node.js)
      ├── 1. Lưu file vào disk
      ├── 2. Enqueue Celery task
      └── 3. Trả về task_id
            ↓
        Redis (Message Broker)
            ↓
        Celery Worker (Python)
            ├── 4. OCR image
            ├── 5. Extract PDF
            └── 6. Lưu kết quả
                 ↓
            Backend Database (NeDB)
                 ↓
        Frontend polls task status
```

---

## 🔄 Flow Chi Tiết

### 1. Frontend Upload File

**Request:**
```javascript
POST /api/upload
Content-Type: multipart/form-data

File: [binary file data]
Authorization: Bearer [token]
```

**Response (202 Accepted):**
```json
{
  "success": true,
  "message": "Upload file thành công - Đang xử lý file",
  "file": {
    "id": "uuid-here",
    "originalName": "lesson-math.pdf",
    "filename": "unique-name.pdf",
    "path": "./uploads/unique-name.pdf",
    "mimetype": "application/pdf",
    "size": 2048000,
    "uploadedAt": "2026-02-20T10:30:00Z",
    "userId": "user-id",
    "status": "processing",
    "processingTaskId": "task-uuid"
  },
  "task_id": "task-uuid"
}
```

### 2. Backend Enqueue Task

**uploadController.js:**
```javascript
// File type detection
const isPdf = mimeType === 'application/pdf';
const isImage = mimeType.startsWith('image/');

// Prepare file data
const fileData = {
  file_id: fileId,
  file_path: req.file.path,
  file_name: req.file.originalname,
  mime_type: req.file.mimetype,
  user_id: req.userId,
  file_type: isPdf ? 'pdf' : (isImage ? 'image' : 'unknown')
};

// Enqueue task to Celery (via worker API)
const taskResponse = await celeryClient.enqueueFileProcessingTask(fileData);
const taskId = taskResponse.task_id;
```

### 3. Celery Worker Process

**celery/tasks.py:**

#### Task: `process_file`
```python
@celery_app.task(bind=True, name='tasks.process_file')
def process_file(self, file_data):
    """Main file processing orchestrator"""
    # 1. Parse file type
    # 2. Call appropriate internal API
    # 3. Return extracted content
```

#### Task: `extract_text_from_image`
```python
@celery_app.task(bind=True, name='tasks.extract_text_from_image')
def extract_text_from_image(self, file_path, file_id):
    """OCR image using Tesseract"""
    # 1. Read image
    # 2. Run Tesseract OCR
    # 3. POST result to Backend API
    # 4. Update file status
```

#### Task: `extract_text_from_pdf`
```python
@celery_app.task(bind=True, name='tasks.extract_text_from_pdf')
def extract_text_from_pdf(self, file_path, file_id):
    """Extract text from PDF"""
    # 1. Parse PDF pages
    # 2. Extract text & images
    # 3. Preserve formatting
    # 4. POST result to Backend API
```

### 4. Internal API Processing

**Backend receives callback from Celery:**

```
POST /api/internal/file/process
{
  "file_data": { ... },
  "task_id": "celery-task-id"
}
```

**Backend routes** (protected by `verifyInternalToken`):
- `POST /api/internal/file/process` → taskController.queueFileProcessing
- `POST /api/internal/ocr/extract` → taskController.queueImageOcr
- `POST /api/internal/pdf/extract` → taskController.queuePdfExtraction

### 5. Frontend Track Progress

**Client polls task status:**
```javascript
GET /api/tasks/[task_id]
Authorization: Bearer [token]
```

**Response:**
```json
{
  "success": true,
  "task": {
    "id": "task-uuid",
    "status": "SUCCESS|PROCESSING|FAILURE",
    "result": { 
      "extracted_text": "...",
      "document_type": "pdf|image",
      "pages": 10
    },
    "meta": {
      "current": "Extracting page 3/10",
      "total": 100,
      "error": null
    }
  }
}
```

---

## 📁 File Structure

```
backend/
├── controllers/
│   ├── uploadController.js       ← Enqueue file processing
│   ├── taskController.js         ← Handle task requests
│   └── ocrController.js          ← OCR processing
│
├── services/
│   └── celeryClient.js           ← Communication with Celery
│
├── middleware/
│   ├── upload.js                 ← Multer config
│   ├── auth.js                   ← JWT verification
│   └── internalAuth.js           ← Internal token verification
│
└── routes/
    └── index.js                  ← API endpoints

celery/
├── tasks.py                      ← Celery tasks
├── celery_app.py                 ← Celery config
├── worker_api.py                 ← FastAPI server for tasks
└── requirements.txt
```

---

## 🚀 Cài Đặt & Chạy

### 1. Install Dependencies

**Backend:**
```bash
cd backend
npm install
# Already installed: axios (for HTTP calls)
```

**Celery Worker:**
```bash
cd celery
python -m venv .venv
.venv\Scripts\activate
pip install -r requirements.txt
```

### 2. Configure Environment

**backend/.env:**
```env
CELERY_API_URL=http://localhost:8001
INTERNAL_API_TOKEN=your_super_secret_token_here
REQUEST_TIMEOUT_SECONDS=120
```

**celery/.env:**
```env
REDIS_URL=redis://localhost:6379/0
BACKEND_INTERNAL_URL=http://localhost:5000/api/internal
INTERNAL_API_TOKEN=your_super_secret_token_here
REQUEST_TIMEOUT_SECONDS=120
```

### 3. Start Services

**Terminal 1 - Backend:**
```bash
cd backend
npm start
# API running at http://localhost:5000
```

**Terminal 2 - Celery Worker API:**
```bash
cd celery
.venv\Scripts\activate
python -m uvicorn worker_api:app --host 0.0.0.0 --port 8001
```

**Terminal 3 - Celery Worker:**
```bash
cd celery
.venv\Scripts\activate
python -m celery -A celery_app.celery_app worker --loglevel=info --pool=solo
```

**Terminal 4 - Redis (if not using Redis Cloud):**
```bash
redis-server
```

---

## 🧪 Testing

### Test Upload & Processing

```bash
$file = Get-Item "C:\path\to\image.jpg"
$form = @{
    file = $file
}

$response = Invoke-RestMethod `
    -Uri 'http://localhost:5000/api/upload' `
    -Method POST `
    -Form $form `
    -Headers @{
        Authorization = "Bearer $token"
    }

$taskId = $response.task_id
Write-Host "Task ID: $taskId"

# Poll status
$status = Invoke-RestMethod `
    -Uri "http://localhost:5000/api/tasks/$taskId" `
    -Headers @{
        Authorization = "Bearer $token"
    }

$status | ConvertTo-Json
```

---

## 🎯 Supported File Types

### Images
- JPEG, PNG, GIF, BMP, TIFF, WebP, HEIC
- OCR using Tesseract.js (Node.js) or pytesseract (Python)

### PDF
- Text extraction
- Math formula preservation
- Page-by-page processing

### Future Support
- Word documents (.docx)
- Excel spreadsheets (.xlsx)
- PowerPoint presentations (.pptx)

---

## 📊 Task States

```
PENDING → RECEIVED → STARTED → PROGRESS → SUCCESS/FAILURE
   ↓          ↓         ↓         ↓             ↓
Not yet   Received   Started  Processing   Done/Error
queued    by worker   task    (track %)
```

**Status Examples:**
- `PENDING`: Task in queue, not started
- `RECEIVED`: Worker received task
- `STARTED`: Worker started processing
- `PROCESSING`: 30% done (meta: {current: "...", total: 100})
- `SUCCESS`: Completed, result available
- `FAILURE`: Error occurred, check meta.error

---

## 🔒 Security

### Token Verification

**Frontend to Backend:**
```
POST /api/upload
Authorization: Bearer [JWT_TOKEN]
```
→ Verified by `verifyToken` middleware

**Backend to Celery:**
```
POST /api/internal/file/process
X-Internal-Token: [INTERNAL_API_TOKEN]
```
→ Verified by `verifyInternalToken` middleware

### File Validation

```javascript
// Whitelist allowed types
const allowedTypes = [
  'image/jpeg', 'image/png', 'image/gif',
  'application/pdf'
];

const allowedExts = [
  '.jpg', '.jpeg', '.png', '.gif', '.pdf'
];

// File size limits
MAX_FILE_SIZE = 100MB (per file)
MAX_TOTAL_SIZE = 500MB (total upload)
```

---

## 🐛 Troubleshooting

### Redis Connection Error
```
Error: connect ECONNREFUSED 127.0.0.1:6379
```
**Solution:** Start Redis or use Redis Cloud
```bash
REDIS_URL=redis://default:password@host:port rediscloud.com
```

### Celery Task Not Processing
**Check:**
1. Worker is running: `celery -A celery_app inspect active`
2. Tasks queued: `celery -A celery_app inspect active_queues`
3. Worker logs for errors

### Internal Token Mismatch
```
Error: Invalid internal token
```
**Solution:** Ensure `INTERNAL_API_TOKEN` is same in backend & celery `.env`

### File Not Found
```
Error: File ./uploads/xxx.pdf not found
```
**Solution:** Check `UPLOAD_DIR` path exists and file was saved correctly

---

## 📈 Performance Tips

1. **Use Redis Cloud** for production (not local Redis)
2. **Increase worker pool** for high volume:
   ```bash
   celery -A celery_app worker -c 4 --pool=prefork
   ```
3. **Cache OCR results** for duplicate files
4. **Compress extracted text** before storage
5. **Implement result expiration** (30 days default)

---

## 📚 References

- [Celery Documentation](https://docs.celeryproject.io/)
- [Redis Documentation](https://redis.io/docs/)
- [Tesseract.js](https://github.com/naptha/tesseract.js)
- [PDF.js](https://mozilla.github.io/pdf.js/)

---

## ✅ Checklist - Before Production

- [ ] Redis deployed & accessible
- [ ] Celery workers running
- [ ] Internal token configured & same in both services
- [ ] UPLOAD_DIR has write permissions
- [ ] File size limits set appropriately
- [ ] OCR language packs installed (Vietnamese)
- [ ] Error handling & logging enabled
- [ ] Task result expiration configured
- [ ] Monitoring & alerting setup

---

*Last Updated: February 20, 2026*
