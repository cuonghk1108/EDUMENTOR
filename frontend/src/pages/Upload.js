import React, { useState, useCallback } from 'react';
import { useNavigate } from 'react-router-dom';
import { motion } from 'framer-motion';
import { useAuth } from '../context/AuthContext';
import { uploadAPI, ocrAPI, lessonAPI, quizAPI } from '../services/api';
import {
  CloudArrowUpIcon,
  DocumentIcon,
  PhotoIcon,
  XMarkIcon,
  SparklesIcon,
  CheckCircleIcon,
  ArrowPathIcon
} from '@heroicons/react/24/outline';
import toast from 'react-hot-toast';

const Upload = () => {
  const { user } = useAuth();
  const navigate = useNavigate();
  
  const [file, setFile] = useState(null);
  const [preview, setPreview] = useState(null);
  const [uploading, setUploading] = useState(false);
  const [processing, setProcessing] = useState(false);
  const [step, setStep] = useState(1); // 1: upload, 2: processing, 3: done
  const [ocrText, setOcrText] = useState('');
  const [lesson, setLesson] = useState(null);
  
  const [formData, setFormData] = useState({
    title: '',
    subject: 'Toán học',
    chapter: '',
    format: 'complete' // 'standard' | 'latex' | 'json' | 'complete'
  });

  // Handle file drop
  const handleDrop = useCallback((e) => {
    e.preventDefault();
    const droppedFile = e.dataTransfer.files[0];
    handleFileSelect(droppedFile);
  }, []);

  // Handle file select
  const handleFileSelect = (selectedFile) => {
    if (!selectedFile) return;

    const validTypes = ['application/pdf', 'image/jpeg', 'image/png', 'image/gif'];
    if (!validTypes.includes(selectedFile.type)) {
      toast.error('Chỉ hỗ trợ PDF và ảnh (JPG, PNG, GIF)');
      return;
    }

    if (selectedFile.size > 10 * 1024 * 1024) {
      toast.error('File quá lớn. Tối đa 10MB');
      return;
    }

    setFile(selectedFile);

    // Create preview for images
    if (selectedFile.type.startsWith('image/')) {
      const reader = new FileReader();
      reader.onloadend = () => setPreview(reader.result);
      reader.readAsDataURL(selectedFile);
    } else {
      setPreview(null);
    }
  };

  // Handle form change
  const handleChange = (e) => {
    setFormData({
      ...formData,
      [e.target.name]: e.target.value
    });
  };

  // Process file
  const handleProcess = async () => {
    if (!file) {
      toast.error('Vui lòng chọn file');
      return;
    }

    if (!formData.title) {
      toast.error('Vui lòng nhập tiêu đề bài học');
      return;
    }

    setUploading(true);
    setProcessing(true);
    setStep(2);

    try {
      // Process SGK - Upload + OCR + Generate Lesson in one API call
      const sgkFormData = new FormData();
      sgkFormData.append('file', file);
      sgkFormData.append('title', formData.title);
      sgkFormData.append('subject', formData.subject);
      sgkFormData.append('chapter', formData.chapter);
      sgkFormData.append('format', formData.format);
      
      const formatLabel = {
        standard: 'bài giảng',
        latex: 'bài giảng LaTeX',
        json: 'bài giảng có cấu trúc',
        complete: 'bài giảng đầy đủ'
      }[formData.format] || 'bài giảng';
      
      toast.loading(`Đang xử lý ${formatLabel}...`, { id: 'process' });
      
      const result = await uploadAPI.processSGK(sgkFormData);
      
      toast.dismiss('process');
      
      setOcrText(result.data.ocrText);
      setLesson(result.data.lesson);
      
      toast.success('Xử lý SGK thành công!');
      setStep(3);
    } catch (error) {
      console.error('Process error:', error);
      toast.dismiss('process');
      toast.error(error.response?.data?.error || 'Đã xảy ra lỗi');
      setStep(1);
    } finally {
      setUploading(false);
      setProcessing(false);
    }
  };

  // Generate quiz
  const handleGenerateQuiz = async () => {
    if (!ocrText) return;

    try {
      setProcessing(true);
      const quizRes = await quizAPI.generate({
        text: ocrText,
        count: 5,
        topic: formData.title,
        lessonId: lesson?.id
      });

      toast.success('Tạo quiz thành công!');
      navigate(`/quiz/${quizRes.data.quiz.id}`);
    } catch (error) {
      toast.error('Lỗi tạo quiz');
    } finally {
      setProcessing(false);
    }
  };

  const subjects = [
    'Toán học',
    'Vật lý',
    'Hóa học',
    'Sinh học',
    'Ngữ văn',
    'Tiếng Anh',
    'Lịch sử',
    'Địa lý',
    'GDCD',
    'Tin học'
  ];

  return (
    <div className="max-w-4xl mx-auto">
      {/* Header */}
      <div className="mb-8">
        <h1 className="text-3xl font-display font-bold text-gray-900">Upload Sách Giáo Khoa</h1>
        <p className="text-gray-600 mt-2">
          Tải lên PDF hoặc ảnh chụp SGK, AI sẽ chuyển thành bài giảng dễ hiểu
        </p>
      </div>

      {/* Progress Steps */}
      <div className="flex items-center justify-center mb-8">
        {[1, 2, 3].map((s) => (
          <React.Fragment key={s}>
            <div className={`flex items-center justify-center w-10 h-10 rounded-full font-medium ${
              step >= s 
                ? 'bg-primary-600 text-white' 
                : 'bg-gray-200 text-gray-500'
            }`}>
              {step > s ? <CheckCircleIcon className="w-6 h-6" /> : s}
            </div>
            {s < 3 && (
              <div className={`w-20 h-1 mx-2 rounded ${
                step > s ? 'bg-primary-600' : 'bg-gray-200'
              }`} />
            )}
          </React.Fragment>
        ))}
      </div>

      {/* Step 1: Upload */}
      {step === 1 && (
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="space-y-6"
        >
          {/* Drop Zone */}
          <div
            onDrop={handleDrop}
            onDragOver={(e) => e.preventDefault()}
            className={`border-2 border-dashed rounded-2xl p-12 text-center transition-all ${
              file 
                ? 'border-primary-300 bg-primary-50' 
                : 'border-gray-300 hover:border-primary-400 hover:bg-gray-50'
            }`}
          >
            {file ? (
              <div className="flex flex-col items-center">
                {preview ? (
                  <img src={preview} alt="Preview" className="max-h-48 rounded-lg mb-4" />
                ) : (
                  <DocumentIcon className="w-16 h-16 text-primary-600 mb-4" />
                )}
                <p className="text-lg font-medium text-gray-900">{file.name}</p>
                <p className="text-sm text-gray-500">{(file.size / 1024 / 1024).toFixed(2)} MB</p>
                <button
                  onClick={() => { setFile(null); setPreview(null); }}
                  className="mt-4 text-red-600 hover:text-red-700 flex items-center gap-1"
                >
                  <XMarkIcon className="w-4 h-4" />
                  Xóa file
                </button>
              </div>
            ) : (
              <>
                <CloudArrowUpIcon className="w-16 h-16 text-gray-400 mx-auto mb-4" />
                <p className="text-lg font-medium text-gray-700 mb-2">
                  Kéo thả file vào đây
                </p>
                <p className="text-gray-500 mb-4">hoặc</p>
                <label className="btn-primary cursor-pointer">
                  Chọn file
                  <input
                    type="file"
                    accept=".pdf,image/*"
                    onChange={(e) => handleFileSelect(e.target.files[0])}
                    className="hidden"
                  />
                </label>
                <p className="text-xs text-gray-400 mt-4">
                  Hỗ trợ: PDF, JPG, PNG, GIF (Tối đa 10MB)
                </p>
              </>
            )}
          </div>

          {/* Form */}
          <div className="card">
            <h3 className="text-lg font-semibold text-gray-900 mb-4">Thông tin bài học</h3>
            
            <div className="grid md:grid-cols-2 gap-4">
              <div className="md:col-span-2">
                <label className="label">Tiêu đề bài học *</label>
                <input
                  type="text"
                  name="title"
                  value={formData.title}
                  onChange={handleChange}
                  className="input"
                  placeholder="VD: Bài 1: Hàm số và đồ thị"
                />
              </div>

              <div>
                <label className="label">Môn học</label>
                <select
                  name="subject"
                  value={formData.subject}
                  onChange={handleChange}
                  className="input"
                >
                  {subjects.map(subject => (
                    <option key={subject} value={subject}>{subject}</option>
                  ))}
                </select>
              </div>

              <div>
                <label className="label">Chương</label>
                <input
                  type="text"
                  name="chapter"
                  value={formData.chapter}
                  onChange={handleChange}
                  className="input"
                  placeholder="VD: Chương 1"
                />
              </div>

              <div className="md:col-span-2">
                <label className="label">Định dạng bài giảng</label>
                <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
                  {[
                    { value: 'standard', label: 'Chuẩn', desc: 'Markdown đơn giản' },
                    { value: 'latex', label: 'LaTeX', desc: 'Công thức đẹp' },
                    { value: 'json', label: 'Cấu trúc', desc: 'Render tương tác' },
                    { value: 'complete', label: 'Đầy đủ', desc: 'Tất cả định dạng' }
                  ].map(opt => (
                    <label
                      key={opt.value}
                      className={`cursor-pointer p-3 rounded-xl border-2 transition-all ${
                        formData.format === opt.value
                          ? 'border-primary-500 bg-primary-50'
                          : 'border-gray-200 hover:border-primary-300'
                      }`}
                    >
                      <input
                        type="radio"
                        name="format"
                        value={opt.value}
                        checked={formData.format === opt.value}
                        onChange={handleChange}
                        className="sr-only"
                      />
                      <span className="block font-medium text-gray-900">{opt.label}</span>
                      <span className="text-xs text-gray-500">{opt.desc}</span>
                    </label>
                  ))}
                </div>
              </div>
            </div>
          </div>

          {/* Process Button */}
          <button
            onClick={handleProcess}
            disabled={!file || !formData.title}
            className="btn-primary w-full py-4 text-lg disabled:opacity-50 disabled:cursor-not-allowed"
          >
            <SparklesIcon className="w-5 h-5 mr-2" />
            Bắt đầu xử lý với AI
          </button>
        </motion.div>
      )}

      {/* Step 2: Processing */}
      {step === 2 && (
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          className="card text-center py-16"
        >
          <ArrowPathIcon className="w-16 h-16 text-primary-600 mx-auto mb-6 animate-spin" />
          <h3 className="text-xl font-semibold text-gray-900 mb-2">
            Đang xử lý...
          </h3>
          <p className="text-gray-600">
            {uploading && !processing && 'Đang upload file...'}
            {processing && 'AI đang phân tích và tạo bài giảng...'}
          </p>
          <p className="text-sm text-gray-400 mt-4">
            Quá trình này có thể mất 1-2 phút
          </p>
        </motion.div>
      )}

      {/* Step 3: Done */}
      {step === 3 && lesson && (
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="space-y-6"
        >
          <div className="card text-center py-8">
            <CheckCircleIcon className="w-16 h-16 text-green-500 mx-auto mb-4" />
            <h3 className="text-xl font-semibold text-gray-900 mb-2">
              Tạo bài giảng thành công!
            </h3>
            <p className="text-gray-600">{lesson.title}</p>
          </div>

          {/* Preview */}
          <div className="card">
            <h3 className="text-lg font-semibold text-gray-900 mb-4">Xem trước bài giảng</h3>
            <div className="markdown-content max-h-96 overflow-y-auto prose prose-sm">
              {lesson.content?.slice(0, 500)}...
            </div>
          </div>

          {/* Actions */}
          <div className="grid md:grid-cols-2 gap-4">
            <button
              onClick={() => navigate(`/lessons/${lesson.id}`)}
              className="btn-primary py-4"
            >
              Xem bài giảng đầy đủ
            </button>
            <button
              onClick={handleGenerateQuiz}
              disabled={processing}
              className="btn-secondary py-4 disabled:opacity-50"
            >
              {processing ? (
                <ArrowPathIcon className="w-5 h-5 animate-spin" />
              ) : (
                <>
                  <SparklesIcon className="w-5 h-5 mr-2" />
                  Tạo Quiz từ bài học
                </>
              )}
            </button>
          </div>

          {/* Upload More */}
          <button
            onClick={() => {
              setFile(null);
              setPreview(null);
              setOcrText('');
              setLesson(null);
              setFormData({ title: '', subject: 'Toán học', chapter: '' });
              setStep(1);
            }}
            className="btn-ghost w-full"
          >
            Upload thêm SGK khác
          </button>
        </motion.div>
      )}
    </div>
  );
};

export default Upload;
