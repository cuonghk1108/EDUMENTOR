import os
from fastapi import FastAPI, HTTPException
from pydantic import BaseModel
from typing import Optional, Dict, Any
from dotenv import load_dotenv
from celery.result import AsyncResult

from celery_app import celery_app
from tasks import generate_lesson, process_file, extract_text_from_image, extract_text_from_pdf

load_dotenv()

app = FastAPI(title='Edumentor Celery API', version='1.0.0')


# =====================
# Request Models
# =====================

class LessonTaskPayload(BaseModel):
    userId: str
    text: str
    title: Optional[str] = None
    subject: Optional[str] = None
    chapter: Optional[str] = None


class FileData(BaseModel):
    file_id: str
    file_path: str
    file_name: str
    mime_type: str
    user_id: str
    file_type: str  # 'pdf', 'image', 'unknown'


class FileProcessingPayload(BaseModel):
    file_data: FileData
    task_id: Optional[str] = None


class OcrPayload(BaseModel):
    file_path: str
    file_id: str


class PdfPayload(BaseModel):
    file_path: str
    file_id: str


# =====================
# Health & Status
# =====================

@app.get('/health')
def health_check():
    return {'status': 'ok', 'service': 'celery-worker-api'}


# =====================
# Lesson Generation
# =====================

@app.post('/tasks/lesson')
def create_lesson_task(payload: LessonTaskPayload):
    """Create lesson generation task"""
    task = generate_lesson.delay(payload.model_dump())
    return {
        'success': True,
        'task_id': task.id,
        'state': 'PENDING',
    }


# =====================
# File Processing
# =====================

@app.post('/tasks/file')
def create_file_processing_task(payload: FileProcessingPayload):
    """Create file processing task (OCR, PDF extract, etc)"""
    task = process_file.delay(payload.file_data.model_dump())
    return {
        'success': True,
        'task_id': task.id,
        'state': 'PENDING',
    }


@app.post('/tasks/image-ocr')
def create_image_ocr_task(payload: OcrPayload):
    """Create image OCR task"""
    task = extract_text_from_image.delay(payload.file_path, payload.file_id)
    return {
        'success': True,
        'task_id': task.id,
        'state': 'PENDING',
    }


@app.post('/tasks/pdf-extract')
def create_pdf_extraction_task(payload: PdfPayload):
    """Create PDF extraction task"""
    task = extract_text_from_pdf.delay(payload.file_path, payload.file_id)
    return {
        'success': True,
        'task_id': task.id,
        'state': 'PENDING',
    }


# =====================
# Task Status & Control
# =====================

@app.get('/tasks/{task_id}')
def get_task_status(task_id: str):
    """Get task status by ID"""
    task_result = AsyncResult(task_id, app=celery_app)

    response = {
        'taskId': task_id,
        'state': task_result.state,
    }

    if task_result.state == 'SUCCESS':
        response['result'] = task_result.result
    elif task_result.state == 'FAILURE':
        response['error'] = str(task_result.result)
    elif task_result.state in ['PROCESSING', 'STARTED', 'RETRY']:
        # Include progress metadata if available
        response['meta'] = task_result.info if isinstance(task_result.info, dict) else {}

    return response


@app.post('/tasks/{task_id}/cancel')
def cancel_task(task_id: str):
    """Cancel a running task"""
    celery_app.control.revoke(task_id, terminate=True)
    return {
        'success': True,
        'message': f'Task {task_id} marked for termination',
        'task_id': task_id
    }


@app.get('/tasks')
def list_tasks(state: Optional[str] = None):
    """List active/pending tasks"""
    inspect = celery_app.control.inspect()
    
    response = {}
    if state is None or state == 'active':
        response['active'] = inspect.active() or {}
    if state is None or state == 'pending':
        response['pending'] = inspect.pending() or {}
    if state is None or state == 'scheduled':
        response['scheduled'] = inspect.scheduled() or {}

    return response


# =====================
# Worker Status
# =====================

@app.get('/stats')
def get_worker_stats():
    """Get worker statistics"""
    inspect = celery_app.control.inspect()
    return {
        'stats': inspect.stats() or {},
        'active_tasks': inspect.active() or {},
        'registered_tasks': inspect.registered() or {}
    }


if __name__ == '__main__':
    import uvicorn

    port = int(os.getenv('WORKER_API_PORT', '8001'))
    uvicorn.run(app, host='0.0.0.0', port=port)

