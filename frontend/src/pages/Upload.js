import React, { useState, useCallback } from 'react';
import { useNavigate } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';
import { useAuth } from '../context/AuthContext';
import { uploadAPI, ocrAPI, lessonAPI, quizAPI } from '../services/api';
import {
  CloudArrowUpIcon,
  DocumentIcon,
  PhotoIcon,
  XMarkIcon,
  SparklesIcon,
  CheckCircleIcon,
  ArrowPathIcon,
  TrashIcon,
  PlusIcon
} from '@heroicons/react/24/outline';
import toast from 'react-hot-toast';

const MAX_FILES = 10;
const MAX_FILE_SIZE = 10 * 1024 * 1024; // 10MB

const Upload = () => {
  const { user } = useAuth();
  const navigate = useNavigate();
  
  const [files, setFiles] = useState([]);
  const [uploading, setUploading] = useState(false);
  const [processing, setProcessing] = useState(false);
  const [step, setStep] = useState(1); // 1: upload, 2: processing, 3: done
  const [ocrText, setOcrText] = useState('');
  const [lessons, setLessons] = useState([]);
  const [uploadProgress, setUploadProgress] = useState({});
  const [currentFileIndex, setCurrentFileIndex] = useState(0);
  
  const [formData, setFormData] = useState({
    title: '',
    subject: 'Toán học',
    chapter: '',
    format: 'complete' // 'standard' | 'latex' | 'json' | 'complete'
  });

  // Handle file drop - now supports multiple files
  const handleDrop = useCallback((e) => {
    e.preventDefault();
    const droppedFiles = Array.from(e.dataTransfer.files);
    handleFilesSelect(droppedFiles);
  }, [files]);

  // Validate single file
  const validateFile = (file) => {
    const validTypes = ['application/pdf', 'image/jpeg', 'image/png', 'image/gif', 'image/webp'];
    if (!validTypes.includes(file.type)) {
      return { valid: false, error: `${file.name}: Chỉ hỗ trợ PDF và ảnh` };
    }
    if (file.size > MAX_FILE_SIZE) {
      return { valid: false, error: `${file.name}: Quá 10MB` };
    }
    return { valid: true };
  };

  // Handle multiple files select
  const handleFilesSelect = (selectedFiles) => {
    if (!selectedFiles || selectedFiles.length === 0) return;

    const remainingSlots = MAX_FILES - files.length;
    if (remainingSlots <= 0) {
      toast.error(`Tối đa ${MAX_FILES} file`);
      return;
    }

    const filesToAdd = selectedFiles.slice(0, remainingSlots);
    const validFiles = [];
    const errors = [];

    filesToAdd.forEach(file => {
      const validation = validateFile(file);
      if (validation.valid) {
        // Create preview for images
        const fileObj = {
          id: Date.now() + Math.random(),
          file: file,
          name: file.name,
          size: file.size,
          type: file.type,
          preview: null,
          status: 'pending' // pending, uploading, done, error
        };
        
        if (file.type.startsWith('image/')) {
          const reader = new FileReader();
          reader.onloadend = () => {
            setFiles(prev => prev.map(f => 
              f.id === fileObj.id ? { ...f, preview: reader.result } : f
            ));
          };
          reader.readAsDataURL(file);
        }
        
        validFiles.push(fileObj);
      } else {
        errors.push(validation.error);
      }
    });

    if (validFiles.length > 0) {
      setFiles(prev => [...prev, ...validFiles]);
      toast.success(`Đã thêm ${validFiles.length} file`);
    }

    if (errors.length > 0) {
      errors.forEach(err => toast.error(err));
    }

    if (selectedFiles.length > remainingSlots) {
      toast.error(`Chỉ thêm được ${remainingSlots} file (đã đạt giới hạn ${MAX_FILES})`);
    }
  };

  // Remove single file
  const removeFile = (fileId) => {
    setFiles(prev => prev.filter(f => f.id !== fileId));
  };

  // Clear all files
  const clearAllFiles = () => {
    if (files.length > 0 && window.confirm('Xóa tất cả file đã chọn?')) {
      setFiles([]);
      setUploadProgress({});
    }
  };

  // Format file size
  const formatSize = (bytes) => {
    if (bytes < 1024) return bytes + ' B';
    if (bytes < 1024 * 1024) return (bytes / 1024).toFixed(1) + ' KB';
    return (bytes / (1024 * 1024)).toFixed(2) + ' MB';
  };

  // Get total size
  const getTotalSize = () => {
    return files.reduce((sum, f) => sum + f.size, 0);
  };

  // Handle form change
  const handleChange = (e) => {
    setFormData({
      ...formData,
      [e.target.name]: e.target.value
    });
  };

  // Process multiple files
  const handleProcess = async () => {
    if (files.length === 0) {
      toast.error('Vui lòng chọn ít nhất 1 file');
      return;
    }

    if (!formData.title) {
      toast.error('Vui lòng nhập tiêu đề bài học');
      return;
    }

    setUploading(true);
    setProcessing(true);
    setStep(2);
    setLessons([]);
    setOcrText('');

    const formatLabel = {
      standard: 'bài giảng',
      latex: 'bài giảng LaTeX',
      json: 'bài giảng có cấu trúc',
      complete: 'bài giảng đầy đủ'
    }[formData.format] || 'bài giảng';

    const results = [];
    let allOcrText = '';

    try {
      for (let i = 0; i < files.length; i++) {
        const fileObj = files[i];
        setCurrentFileIndex(i);
        
        // Update file status
        setFiles(prev => prev.map((f, idx) => 
          idx === i ? { ...f, status: 'uploading' } : f
        ));
        setUploadProgress(prev => ({ ...prev, [fileObj.id]: 0 }));

        toast.loading(
          `Đang xử lý file ${i + 1}/${files.length}: ${fileObj.name}...`, 
          { id: 'process' }
        );

        try {
          const sgkFormData = new FormData();
          sgkFormData.append('file', fileObj.file);
          sgkFormData.append('title', files.length > 1 
            ? `${formData.title} - Phần ${i + 1}` 
            : formData.title
          );
          sgkFormData.append('subject', formData.subject);
          sgkFormData.append('chapter', formData.chapter);
          sgkFormData.append('format', formData.format);

          const result = await uploadAPI.processSGK(sgkFormData);
          
          results.push(result.data.lesson);
          allOcrText += result.data.ocrText + '\n\n';

          // Update file status to done
          setFiles(prev => prev.map((f, idx) => 
            idx === i ? { ...f, status: 'done' } : f
          ));
          setUploadProgress(prev => ({ ...prev, [fileObj.id]: 100 }));

        } catch (fileError) {
          console.error(`Error processing file ${fileObj.name}:`, fileError);
          setFiles(prev => prev.map((f, idx) => 
            idx === i ? { ...f, status: 'error' } : f
          ));
          toast.error(`Lỗi xử lý ${fileObj.name}`);
        }
      }

      toast.dismiss('process');

      if (results.length > 0) {
        setOcrText(allOcrText);
        setLessons(results);
        toast.success(`Xử lý thành công ${results.length}/${files.length} file!`);
        setStep(3);
      } else {
        toast.error('Không xử lý được file nào');
        setStep(1);
      }
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

  // Generate quiz from all lessons
  const handleGenerateQuiz = async () => {
    if (!ocrText) return;

    try {
      setProcessing(true);
      const quizRes = await quizAPI.generate({
        text: ocrText,
        count: Math.min(10, lessons.length * 5), // More questions for more files
        topic: formData.title,
        lessonId: lessons[0]?.id
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
          {/* File Limit Info */}
          <div className="flex items-center justify-between text-sm">
            <span className="text-gray-600">
              <span className="font-medium text-primary-600">{files.length}</span> / {MAX_FILES} file
            </span>
            {files.length > 0 && (
              <span className="text-gray-500">
                Tổng: {formatSize(getTotalSize())}
              </span>
            )}
          </div>

          {/* Drop Zone */}
          <div
            onDrop={handleDrop}
            onDragOver={(e) => e.preventDefault()}
            className={`border-2 border-dashed rounded-2xl p-8 text-center transition-all ${
              files.length > 0 
                ? 'border-primary-300 bg-primary-50' 
                : 'border-gray-300 hover:border-primary-400 hover:bg-gray-50'
            }`}
          >
            <CloudArrowUpIcon className="w-12 h-12 text-gray-400 mx-auto mb-3" />
            <p className="text-lg font-medium text-gray-700 mb-2">
              Kéo thả nhiều file vào đây
            </p>
            <p className="text-gray-500 mb-4">hoặc</p>
            <label className="btn-primary cursor-pointer">
              <PlusIcon className="w-5 h-5 mr-2" />
              Chọn file
              <input
                type="file"
                accept=".pdf,image/*"
                multiple
                onChange={(e) => handleFilesSelect(Array.from(e.target.files))}
                className="hidden"
              />
            </label>
            <p className="text-xs text-gray-400 mt-4">
              Hỗ trợ: PDF, JPG, PNG, GIF, WebP (Tối đa {MAX_FILES} file, mỗi file ≤ 10MB)
            </p>
          </div>

          {/* Selected Files List */}
          {files.length > 0 && (
            <div className="card">
              <div className="flex items-center justify-between mb-4">
                <h3 className="text-lg font-semibold text-gray-900">
                  File đã chọn ({files.length})
                </h3>
                <button
                  onClick={clearAllFiles}
                  className="text-sm text-red-600 hover:text-red-700 flex items-center gap-1"
                >
                  <TrashIcon className="w-4 h-4" />
                  Xóa tất cả
                </button>
              </div>
              
              <div className="space-y-3 max-h-64 overflow-y-auto">
                <AnimatePresence>
                  {files.map((fileObj, index) => (
                    <motion.div
                      key={fileObj.id}
                      initial={{ opacity: 0, x: -20 }}
                      animate={{ opacity: 1, x: 0 }}
                      exit={{ opacity: 0, x: 20 }}
                      className="flex items-center gap-3 p-3 bg-gray-50 rounded-xl group"
                    >
                      {/* Preview/Icon */}
                      <div className="flex-shrink-0 w-12 h-12 rounded-lg overflow-hidden bg-white border border-gray-200">
                        {fileObj.preview ? (
                          <img 
                            src={fileObj.preview} 
                            alt="Preview" 
                            className="w-full h-full object-cover"
                          />
                        ) : (
                          <div className="w-full h-full flex items-center justify-center">
                            {fileObj.type === 'application/pdf' ? (
                              <DocumentIcon className="w-6 h-6 text-red-500" />
                            ) : (
                              <PhotoIcon className="w-6 h-6 text-blue-500" />
                            )}
                          </div>
                        )}
                      </div>

                      {/* File Info */}
                      <div className="flex-1 min-w-0">
                        <p className="text-sm font-medium text-gray-900 truncate">
                          {fileObj.name}
                        </p>
                        <p className="text-xs text-gray-500">
                          {formatSize(fileObj.size)}
                        </p>
                      </div>

                      {/* Status Badge */}
                      <div className="flex-shrink-0">
                        {fileObj.status === 'done' && (
                          <span className="inline-flex items-center px-2 py-1 rounded-full text-xs font-medium bg-green-100 text-green-700">
                            <CheckCircleIcon className="w-3 h-3 mr-1" />
                            Xong
                          </span>
                        )}
                        {fileObj.status === 'uploading' && (
                          <span className="inline-flex items-center px-2 py-1 rounded-full text-xs font-medium bg-blue-100 text-blue-700">
                            <ArrowPathIcon className="w-3 h-3 mr-1 animate-spin" />
                            Đang xử lý
                          </span>
                        )}
                        {fileObj.status === 'error' && (
                          <span className="inline-flex items-center px-2 py-1 rounded-full text-xs font-medium bg-red-100 text-red-700">
                            <XMarkIcon className="w-3 h-3 mr-1" />
                            Lỗi
                          </span>
                        )}
                      </div>

                      {/* Remove Button */}
                      <button
                        onClick={() => removeFile(fileObj.id)}
                        className="flex-shrink-0 p-1.5 text-gray-400 hover:text-red-600 opacity-0 group-hover:opacity-100 transition-opacity"
                      >
                        <XMarkIcon className="w-5 h-5" />
                      </button>
                    </motion.div>
                  ))}
                </AnimatePresence>
              </div>
            </div>
          )}

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
            disabled={files.length === 0 || !formData.title}
            className="btn-primary w-full py-4 text-lg disabled:opacity-50 disabled:cursor-not-allowed"
          >
            <SparklesIcon className="w-5 h-5 mr-2" />
            {files.length > 1 
              ? `Xử lý ${files.length} file với AI` 
              : 'Bắt đầu xử lý với AI'
            }
          </button>
        </motion.div>
      )}

      {/* Step 2: Processing */}
      {step === 2 && (
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          className="card text-center py-12"
        >
          <ArrowPathIcon className="w-16 h-16 text-primary-600 mx-auto mb-6 animate-spin" />
          <h3 className="text-xl font-semibold text-gray-900 mb-2">
            Đang xử lý file {currentFileIndex + 1}/{files.length}...
          </h3>
          <p className="text-gray-600 mb-4">
            {files[currentFileIndex]?.name}
          </p>
          
          {/* Progress Bar */}
          <div className="max-w-md mx-auto">
            <div className="flex justify-between text-sm text-gray-500 mb-2">
              <span>Tiến độ</span>
              <span>{Math.round((currentFileIndex / files.length) * 100)}%</span>
            </div>
            <div className="h-2 bg-gray-200 rounded-full overflow-hidden">
              <motion.div 
                className="h-full bg-primary-600"
                initial={{ width: 0 }}
                animate={{ width: `${(currentFileIndex / files.length) * 100}%` }}
              />
            </div>
          </div>
          
          <p className="text-sm text-gray-400 mt-6">
            Quá trình này có thể mất {files.length * 1}-{files.length * 2} phút
          </p>
        </motion.div>
      )}

      {/* Step 3: Done */}
      {step === 3 && lessons.length > 0 && (
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="space-y-6"
        >
          <div className="card text-center py-8">
            <CheckCircleIcon className="w-16 h-16 text-green-500 mx-auto mb-4" />
            <h3 className="text-xl font-semibold text-gray-900 mb-2">
              Tạo {lessons.length} bài giảng thành công!
            </h3>
            <p className="text-gray-600">{formData.title}</p>
          </div>

          {/* Lessons List */}
          <div className="card">
            <h3 className="text-lg font-semibold text-gray-900 mb-4">Các bài giảng đã tạo</h3>
            <div className="space-y-3 max-h-64 overflow-y-auto">
              {lessons.map((lesson, index) => (
                <div 
                  key={lesson.id}
                  className="flex items-center justify-between p-3 bg-gray-50 rounded-xl hover:bg-gray-100 transition-colors"
                >
                  <div className="flex items-center gap-3">
                    <div className="w-8 h-8 rounded-full bg-primary-100 text-primary-600 flex items-center justify-center text-sm font-medium">
                      {index + 1}
                    </div>
                    <div>
                      <p className="font-medium text-gray-900">{lesson.title}</p>
                      <p className="text-xs text-gray-500">{lesson.subject}</p>
                    </div>
                  </div>
                  <button
                    onClick={() => navigate(`/lessons/${lesson.id}`)}
                    className="text-sm text-primary-600 hover:text-primary-700 font-medium"
                  >
                    Xem →
                  </button>
                </div>
              ))}
            </div>
          </div>

          {/* Preview first lesson */}
          <div className="card">
            <h3 className="text-lg font-semibold text-gray-900 mb-4">Xem trước bài giảng đầu tiên</h3>
            <div className="markdown-content max-h-48 overflow-y-auto prose prose-sm">
              {lessons[0]?.content?.slice(0, 500)}...
            </div>
          </div>

          {/* Actions */}
          <div className="grid md:grid-cols-2 gap-4">
            <button
              onClick={() => navigate(`/lessons/${lessons[0].id}`)}
              className="btn-primary py-4"
            >
              {lessons.length > 1 ? 'Xem bài giảng đầu tiên' : 'Xem bài giảng đầy đủ'}
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
              setFiles([]);
              setOcrText('');
              setLessons([]);
              setUploadProgress({});
              setFormData({ title: '', subject: 'Toán học', chapter: '', format: 'complete' });
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
