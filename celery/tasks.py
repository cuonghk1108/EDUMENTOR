import os
import requests
from dotenv import load_dotenv

from celery_app import celery_app

load_dotenv()


@celery_app.task(bind=True, name='tasks.generate_lesson')
def generate_lesson(self, payload):
    internal_url = os.getenv('BACKEND_INTERNAL_URL', 'http://localhost:5000/api/internal/lesson/generate')
    internal_token = os.getenv('INTERNAL_API_TOKEN', '')
    timeout_seconds = int(os.getenv('REQUEST_TIMEOUT_SECONDS', '120'))

    headers = {
        'Content-Type': 'application/json',
        'X-Internal-Token': internal_token,
    }

    response = requests.post(internal_url, json=payload, headers=headers, timeout=timeout_seconds)

    if response.status_code >= 400:
        raise Exception(f'Internal backend error ({response.status_code}): {response.text[:500]}')

    return response.json()
