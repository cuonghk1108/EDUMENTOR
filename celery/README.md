# Celery Worker Service

Service này cung cấp hàng đợi tác vụ nền bằng Celery + Redis cho backend Node.js.

## Yêu cầu

- Python 3.10+
- Redis server

## Cài đặt

```bash
cd celery
python -m venv .venv
.venv\Scripts\activate
pip install -r requirements.txt
copy .env.example .env
```

## Chạy service

Terminal 1 (API cho backend Node gọi enqueue/poll):

```bash
cd celery
.venv\Scripts\activate
uvicorn worker_api:app --host 0.0.0.0 --port 8001 --reload
```

Terminal 2 (Celery worker xử lý job):

```bash
cd celery
.venv\Scripts\activate
celery -A celery_app.celery_app worker --loglevel=info --pool=solo
```

## Luồng xử lý

1. Node gọi `POST /tasks/lesson` để enqueue.
2. Celery worker nhận job và gọi endpoint nội bộ Node.
3. Node xử lý AI + lưu DB.
4. Frontend/backend poll `GET /tasks/{taskId}` để lấy trạng thái.
