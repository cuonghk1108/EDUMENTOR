import os
from fastapi import FastAPI, HTTPException
from pydantic import BaseModel
from dotenv import load_dotenv
from celery.result import AsyncResult

from celery_app import celery_app
from tasks import generate_lesson

load_dotenv()

app = FastAPI(title='Edumentor Celery API', version='1.0.0')


class LessonTaskPayload(BaseModel):
    userId: str
    text: str
    title: str | None = None
    subject: str | None = None
    chapter: str | None = None


@app.get('/health')
def health_check():
    return {'status': 'ok', 'service': 'celery-worker-api'}


@app.post('/tasks/lesson')
def create_lesson_task(payload: LessonTaskPayload):
    task = generate_lesson.delay(payload.model_dump())
    return {
        'success': True,
        'taskId': task.id,
        'state': 'PENDING',
    }


@app.get('/tasks/{task_id}')
def get_task_status(task_id: str):
    task_result = AsyncResult(task_id, app=celery_app)

    response = {
        'taskId': task_id,
        'state': task_result.state,
    }

    if task_result.state == 'SUCCESS':
        response['result'] = task_result.result
    elif task_result.state == 'FAILURE':
        response['error'] = str(task_result.result)

    return response


if __name__ == '__main__':
    import uvicorn

    port = int(os.getenv('WORKER_API_PORT', '8001'))
    uvicorn.run(app, host='0.0.0.0', port=port)
