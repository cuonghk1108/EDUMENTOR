import os
import requests
import json
from dotenv import load_dotenv
from celery_app import celery_app

load_dotenv()

BACKEND_URL = os.getenv('BACKEND_INTERNAL_URL', 'http://localhost:5000/api/internal')
INTERNAL_TOKEN = os.getenv('INTERNAL_API_TOKEN', '')
REQUEST_TIMEOUT = int(os.getenv('REQUEST_TIMEOUT_SECONDS', '120'))

# Headers dùng chung
headers = {
    'Content-Type': 'application/json',
    'X-Internal-Token': INTERNAL_TOKEN,
}


@celery_app.task(bind=True, name='tasks.generate_lesson')
def generate_lesson(self, payload):
    """Generate lesson từ content sử dụng AI"""
    try:
        internal_url = f'{BACKEND_URL}/lesson/generate'
        response = requests.post(internal_url, json=payload, headers=headers, timeout=REQUEST_TIMEOUT)
        
        if response.status_code >= 400:
            raise Exception(f'Backend error ({response.status_code}): {response.text[:500]}')
        
        return response.json()
    except Exception as e:
        self.update_state(state='FAILURE', meta={'error': str(e)})
        raise


@celery_app.task(bind=True, name='tasks.process_file')
def process_file(self, file_data):
    """
    Xử lý file upload (OCR, parsing PDF, etc)
    
    file_data = {
        'file_id': str,
        'file_path': str,
        'file_name': str,
        'mime_type': str,
        'user_id': str,
        'file_type': 'pdf' | 'image' -> xác định cách xử lý
    }
    """
    try:
        self.update_state(state='PROCESSING', meta={'current': 'Processing file...', 'total': 100})
        
        internal_url = f'{BACKEND_URL}/file/process'
        payload = {
            'file_data': file_data,
            'task_id': self.request.id
        }
        
        response = requests.post(internal_url, json=payload, headers=headers, timeout=REQUEST_TIMEOUT)
        
        if response.status_code >= 400:
            raise Exception(f'File processing error ({response.status_code}): {response.text[:500]}')
        
        result = response.json()
        
        self.update_state(state='SUCCESS', meta={'result': result})
        return result
        
    except Exception as e:
        error_msg = f'File processing failed: {str(e)}'
        print(f'❌ Task error: {error_msg}')
        self.update_state(state='FAILURE', meta={'error': error_msg})
        raise


@celery_app.task(bind=True, name='tasks.extract_text_from_image')
def extract_text_from_image(self, file_path, file_id):
    """
    Extract text từ hình ảnh sử dụng OCR
    
    Args:
        file_path: Đường dẫn file hình ảnh
        file_id: ID của file để lưu kết quả
    """
    try:
        internal_url = f'{BACKEND_URL}/ocr/extract'
        payload = {
            'file_path': file_path,
            'file_id': file_id,
            'task_id': self.request.id
        }
        
        response = requests.post(internal_url, json=payload, headers=headers, timeout=REQUEST_TIMEOUT)
        
        if response.status_code >= 400:
            raise Exception(f'OCR error ({response.status_code}): {response.text[:500]}')
        
        return response.json()
        
    except Exception as e:
        self.update_state(state='FAILURE', meta={'error': str(e)})
        raise


@celery_app.task(bind=True, name='tasks.extract_text_from_pdf')
def extract_text_from_pdf(self, file_path, file_id):
    """
    Extract text từ PDF với xử lý công thức toán học
    
    Args:
        file_path: Đường dẫn file PDF
        file_id: ID của file để lưu kết quả
    """
    try:
        internal_url = f'{BACKEND_URL}/pdf/extract'
        payload = {
            'file_path': file_path,
            'file_id': file_id,
            'task_id': self.request.id
        }
        
        response = requests.post(internal_url, json=payload, headers=headers, timeout=REQUEST_TIMEOUT)
        
        if response.status_code >= 400:
            raise Exception(f'PDF extraction error ({response.status_code}): {response.text[:500]}')
        
        return response.json()
        
    except Exception as e:
        self.update_state(state='FAILURE', meta={'error': str(e)})
        raise
