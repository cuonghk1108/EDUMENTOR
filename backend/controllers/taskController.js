const celeryClient = require('../services/celeryClient');

exports.queueLessonGeneration = async (req, res) => {
  try {
    const { text, title, subject, chapter } = req.body;
    const userId = req.userId;

    if (!text || !text.trim()) {
      return res.status(400).json({ error: 'Vui lòng cung cấp nội dung' });
    }

    const task = await celeryClient.enqueueLessonTask({
      userId,
      text,
      title,
      subject,
      chapter
    });

    return res.status(202).json({
      success: true,
      message: 'Đã đưa tác vụ vào hàng đợi',
      task
    });
  } catch (error) {
    console.error('Queue lesson task error:', error.message);
    const status = error.response?.status || 500;
    const message = error.response?.data?.error || error.message || 'Không thể enqueue task';
    return res.status(status).json({ error: message });
  }
};

exports.getTaskStatus = async (req, res) => {
  try {
    const { taskId } = req.params;
    const status = await celeryClient.getTaskStatus(taskId);

    return res.json({
      success: true,
      task: status
    });
  } catch (error) {
    console.error('Get task status error:', error.message);
    const statusCode = error.response?.status || 500;
    const message = error.response?.data?.error || error.message || 'Không thể lấy trạng thái task';
    return res.status(statusCode).json({ error: message });
  }
};
