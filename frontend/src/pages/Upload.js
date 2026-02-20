import React, { useState, useCallback } from 'react';
import { useNavigate } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';
import { useAuth } from '../context/AuthContext';
import { uploadAPI, lessonAPI, quizAPI, streakAPI } from '../services/api';
import CustomizePromptModal from '../components/CustomizePromptModal';
import {
  CloudArrowUpIcon,
  DocumentIcon,
  PhotoIcon,
  XMarkIcon,
  SparklesIcon,
  CheckCircleIcon,
  ArrowPathIcon,
  TrashIcon,
  PlusIcon,
  PencilIcon
} from '@heroicons/react/24/outline';
import toast from 'react-hot-toast';

const MAX_FILES = 5;
const MAX_FILE_SIZE = 100 * 1024 * 1024; // 100MB per file
const MAX_TOTAL_SIZE = 500 * 1024 * 1024; // 500MB total

const Upload = () => {
  const { user } = useAuth();
  const navigate = useNavigate();
  
  const [files, setFiles] = useState([]);
  const [uploading, setUploading] = useState(false);
  const [processing, setProcessing] = useState(false);
  const [step, setStep] = useState(1);
  const [ocrText, setOcrText] = useState('');
  const [lessons, setLessons] = useState([]);
  const [uploadProgress, setUploadProgress] = useState({});
  const [currentFileIndex, setCurrentFileIndex] = useState(0);
  const [isCustomizeModalOpen, setIsCustomizeModalOpen] = useState(false);
  const [isRefiningLessons, setIsRefiningLessons] = useState(false);
  
  const [formData, setFormData] = useState({
    title: '',
    subject: 'Toán học',
    chapter: '',
    format: 'interactive-markdown',
    customPrompt: ''
  });

  const handleDrop = useCallback((e) => {
    e.preventDefault();
    const droppedFiles = Array.from(e.dataTransfer.files);
    handleFilesSelect(droppedFiles);
  }, [files]);

  const validateFile = (file, currentTotalSize = 0) => {
    const validTypes = ['application/pdf', 'image/jpeg', 'image/png', 'image/gif', 'image/webp'];
    if (!validTypes.includes(file.type)) {
      return { valid: false, error: `${file.name}: Chỉ hỗ trợ PDF và ảnh` };
    }
    if (file.size > MAX_FILE_SIZE) {
      return { valid: false, error: `${file.name}: Quá 100MB` };
    }
    if (currentTotalSize + file.size > MAX_TOTAL_SIZE) {
      return { valid: false, error: `${file.name}: Vượt quá tổng dung lượng 100MB` };
    }
    // Cảnh báo file lớn (>50MB) có thể gặp lỗi qua mạng
    if (file.size > 50 * 1024 * 1024) {
      return { valid: true, warning: `${file.name}: File >50MB có thể upload chậm hoặc lỗi qua mạng` };
    }
    return { valid: true };
  };

  const handleFilesSelect = (selectedFiles) => {
    if (!selectedFiles || selectedFiles.length === 0) return;

    const remainingSlots = MAX_FILES - files.length;
    if (remainingSlots <= 0) {
      toast.error(`Tối đa ${MAX_FILES} file`);
      return;
    }

    const currentTotal = getTotalSize();
    if (currentTotal >= MAX_TOTAL_SIZE) {
      toast.error('Đã đạt giới hạn dung lượng 100MB');
      return;
    }

    const filesToAdd = selectedFiles.slice(0, remainingSlots);
    const validFiles = [];
    const errors = [];
    const warnings = [];
    let runningTotal = currentTotal;

    filesToAdd.forEach(file => {
      const validation = validateFile(file, runningTotal);
      if (validation.valid) {
        runningTotal += file.size;
        if (validation.warning) {
          warnings.push(validation.warning);
        }
        const fileObj = {
          id: Date.now() + Math.random(),
          file: file,
          name: file.name,
          size: file.size,
          type: file.type,
          preview: null,
          status: 'pending'
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

    if (warnings.length > 0) {
      warnings.forEach(warn => toast(warn, { icon: '⚠️', duration: 5000 }));
    }

    if (errors.length > 0) {
      errors.forEach(err => toast.error(err));
    }

    if (selectedFiles.length > remainingSlots) {
      toast.error(`Chỉ thêm được ${remainingSlots} file (đã đạt giới hạn ${MAX_FILES})`);
    }
  };

  const removeFile = (fileId) => {
    setFiles(prev => prev.filter(f => f.id !== fileId));
  };

  const clearAllFiles = () => {
    if (files.length > 0 && window.confirm('Xóa tất cả file đã chọn?')) {
      setFiles([]);
      setUploadProgress({});
    }
  };

  const formatSize = (bytes) => {
    if (bytes < 1024) return bytes + ' B';
    if (bytes < 1024 * 1024) return (bytes / 1024).toFixed(1) + ' KB';
    return (bytes / (1024 * 1024)).toFixed(2) + ' MB';
  };

  const getTotalSize = () => {
    return files.reduce((sum, f) => sum + f.size, 0);
  };

  const handleChange = (e) => {
    setFormData({
      ...formData,
      [e.target.name]: e.target.value
    });
  };

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

    const results = [];
    let allOcrText = '';

    try {
      for (let i = 0; i < files.length; i++) {
        const fileObj = files[i];
        setCurrentFileIndex(i);
        
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
          if (formData.customPrompt.trim()) {
            sgkFormData.append('customPrompt', formData.customPrompt);
          }

          // Upload 1 lần
          const result = await uploadAPI.processSGK(sgkFormData);
          
          results.push(result.data.lesson);
          allOcrText += result.data.ocrText + '\n\n';

          setFiles(prev => prev.map((f, idx) => 
            idx === i ? { ...f, status: 'done' } : f
          ));
          setUploadProgress(prev => ({ ...prev, [fileObj.id]: 100 }));

        } catch (fileError) {
          console.error(`Error processing file ${fileObj.name}:`, fileError);
          setFiles(prev => prev.map((f, idx) => 
            idx === i ? { ...f, status: 'error' } : f
          ));
          
          // Hiển thị lỗi chi tiết hơn
          let errorMsg = `Lỗi xử lý ${fileObj.name}`;
          if (fileError.response?.data?.error) {
            errorMsg = fileError.response.data.error;
          } else if (fileError.code === 'ECONNABORTED') {
            errorMsg = `File ${fileObj.name} quá lớn hoặc kết nối chậm. Vui lòng thử file nhỏ hơn (<50MB).`;
          } else if (fileError.message?.includes('Network Error')) {
            errorMsg = `Lỗi mạng khi upload ${fileObj.name}. File lớn (>50MB) có thể không upload được qua mạng. Thử chia nhỏ file.`;
          }
          toast.error(errorMsg);
        }
      }

      toast.dismiss('process');

      if (results.length > 0) {
        setOcrText(allOcrText);
        setLessons(results);
        toast.success(`Xử lý thành công ${results.length}/${files.length} file!`);
        setStep(3);
        
        streakAPI.record('upload_lesson', 15).catch(err => {
          console.log('Streak record failed:', err);
        });
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

  const handleRefineLessons = async (customPrompt) => {
    setIsRefiningLessons(true);
    setIsCustomizeModalOpen(false);

    try {
      toast.loading('Đang cải thiện bài giảng theo yêu cầu của bạn...', { id: 'refine' });

      const refinedLessons = [];
      for (let i = 0; i < lessons.length; i++) {
        try {
          const response = await lessonAPI.customize(lessons[i].id, { 
            customPrompt: customPrompt 
          });
          refinedLessons.push(response.data.lesson);
        } catch (error) {
          console.error(`Error refining lesson ${i}:`, error);
          refinedLessons.push(lessons[i]);
        }
      }

      toast.dismiss('refine');
      setLessons(refinedLessons);
      toast.success('Bài giảng đã được cải thiện theo yêu cầu!');
    } catch (error) {
      console.error('Refine error:', error);
      toast.dismiss('refine');
      toast.error('Lỗi cải thiện bài giảng');
    } finally {
      setIsRefiningLessons(false);
    }
  };

  const handleGenerateQuiz = async () => {
    if (!ocrText) return;

    try {
      setProcessing(true);
      const quizRes = await quizAPI.generate({
        text: ocrText,
        count: Math.min(10, lessons.length * 5),
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
    'Toán học', 'Vật lý', 'Hóa học', 'Sinh học', 'Ngữ văn',
    'Tiếng Anh', 'Lịch sử', 'Địa lý', 'GDCD', 'Tin học'
  ];

  return (
    <div className="max-w-4xl mx-auto p-6">
      {/* Header */}
      <div className="mb-8">
        <h1 className="text-3xl font-display font-bold text-white flex items-center gap-3">
          <div className="w-10 h-10 bg-gradient-to-br from-orange-500 to-red-500 rounded-xl flex items-center justify-center">
            <CloudArrowUpIcon className="w-6 h-6 text-white" />
          </div>
          Upload Sách Giáo Khoa
        </h1>
        <p className="text-gray-400 mt-2">
          Tải lên PDF hoặc ảnh chụp SGK, AI sẽ chuyển thành bài giảng dễ hiểu
        </p>
      </div>

      {/* Progress Steps */}
      <div className="flex items-center justify-center mb-8">
        {[1, 2, 3].map((s) => (
          <React.Fragment key={s}>
            <div className={`flex items-center justify-center w-10 h-10 rounded-xl font-medium transition-all ${
              step >= s 
                ? 'bg-gradient-to-r from-orange-500 to-red-500 text-white shadow-lg shadow-orange-500/25' 
                : 'bg-white/5 text-gray-500'
            }`}>
              {step > s ? <CheckCircleIcon className="w-6 h-6" /> : s}
            </div>
            {s < 3 && (
              <div className={`w-20 h-1 mx-2 rounded ${
                step > s ? 'bg-gradient-to-r from-orange-500 to-red-500' : 'bg-white/10'
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
            <span className="text-gray-400">
              <span className="font-medium text-orange-400">{files.length}</span> / {MAX_FILES} file
            </span>
            <span className={`${getTotalSize() > MAX_TOTAL_SIZE * 0.8 ? 'text-orange-400' : 'text-gray-500'}`}>
              Dung lượng: <span className="font-medium">{formatSize(getTotalSize())}</span> / 100MB
            </span>
          </div>

          {/* Drop Zone */}
          <div
            onDrop={handleDrop}
            onDragOver={(e) => e.preventDefault()}
            className={`border-2 border-dashed rounded-2xl p-8 text-center transition-all ${
              files.length > 0 
                ? 'border-orange-500/50 bg-orange-500/10' 
                : 'border-white/20 hover:border-orange-500/50 hover:bg-white/5'
            }`}
          >
            <CloudArrowUpIcon className="w-12 h-12 text-gray-500 mx-auto mb-3" />
            <p className="text-lg font-medium text-white mb-2">
              Kéo thả nhiều file vào đây
            </p>
            <p className="text-gray-500 mb-4">hoặc</p>
            <label className="inline-flex items-center gap-2 px-6 py-3 bg-gradient-to-r from-orange-500 to-red-500 rounded-xl font-medium text-white cursor-pointer hover:shadow-lg hover:shadow-orange-500/25 transition-all">
              <PlusIcon className="w-5 h-5" />
              Chọn file
              <input
                type="file"
                accept=".pdf,image/*"
                multiple
                onChange={(e) => handleFilesSelect(Array.from(e.target.files))}
                className="hidden"
              />
            </label>
            <p className="text-xs text-gray-500 mt-4">
              Hỗ trợ: PDF, JPG, PNG, GIF, WebP (Tối đa 5 file, mỗi file ≤ 100MB)
            </p>
          </div>

          {/* Selected Files List */}
          {files.length > 0 && (
            <div className="bg-gray-900/50 border border-white/5 rounded-2xl p-6">
              <div className="flex items-center justify-between mb-4">
                <h3 className="text-lg font-semibold text-white">
                  File đã chọn ({files.length})
                </h3>
                <button
                  onClick={clearAllFiles}
                  className="text-sm text-red-400 hover:text-red-300 flex items-center gap-1"
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
                      className="flex items-center gap-3 p-3 bg-white/5 rounded-xl group"
                    >
                      <div className="flex-shrink-0 w-12 h-12 rounded-lg overflow-hidden bg-gray-800 border border-white/10">
                        {fileObj.preview ? (
                          <img 
                            src={fileObj.preview} 
                            alt="Preview" 
                            className="w-full h-full object-cover"
                          />
                        ) : (
                          <div className="w-full h-full flex items-center justify-center">
                            {fileObj.type === 'application/pdf' ? (
                              <DocumentIcon className="w-6 h-6 text-red-400" />
                            ) : (
                              <PhotoIcon className="w-6 h-6 text-blue-400" />
                            )}
                          </div>
                        )}
                      </div>

                      <div className="flex-1 min-w-0">
                        <p className="text-sm font-medium text-white truncate">
                          {fileObj.name}
                        </p>
                        <p className="text-xs text-gray-500">
                          {formatSize(fileObj.size)}
                        </p>
                      </div>

                      <div className="flex-shrink-0">
                        {fileObj.status === 'done' && (
                          <span className="inline-flex items-center px-2 py-1 rounded-full text-xs font-medium bg-green-500/20 text-green-400">
                            <CheckCircleIcon className="w-3 h-3 mr-1" />
                            Xong
                          </span>
                        )}
                        {fileObj.status === 'uploading' && (
                          <span className="inline-flex items-center px-2 py-1 rounded-full text-xs font-medium bg-blue-500/20 text-blue-400">
                            <ArrowPathIcon className="w-3 h-3 mr-1 animate-spin" />
                            Đang xử lý
                          </span>
                        )}
                        {fileObj.status === 'error' && (
                          <span className="inline-flex items-center px-2 py-1 rounded-full text-xs font-medium bg-red-500/20 text-red-400">
                            <XMarkIcon className="w-3 h-3 mr-1" />
                            Lỗi
                          </span>
                        )}
                      </div>

                      <button
                        onClick={() => removeFile(fileObj.id)}
                        className="flex-shrink-0 p-1.5 text-gray-500 hover:text-red-400 opacity-0 group-hover:opacity-100 transition-all"
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
          <div className="bg-gray-900/50 border border-white/5 rounded-2xl p-6">
            <h3 className="text-lg font-semibold text-white mb-4">Thông tin bài học</h3>
            
            <div className="grid md:grid-cols-2 gap-4">
              <div className="md:col-span-2">
                <label className="block text-sm font-medium text-gray-300 mb-2">Tiêu đề bài học *</label>
                <input
                  type="text"
                  name="title"
                  value={formData.title}
                  onChange={handleChange}
                  className="w-full px-4 py-3 bg-white/5 border border-white/10 rounded-xl text-white placeholder-gray-500 focus:outline-none focus:border-orange-500/50"
                  placeholder="VD: Bài 1: Hàm số và đồ thị"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-300 mb-2">Môn học</label>
                <select
                  name="subject"
                  value={formData.subject}
                  onChange={handleChange}
                  className="w-full px-4 py-3 bg-white/5 border border-white/10 rounded-xl text-white focus:outline-none focus:border-orange-500/50"
                >
                  {subjects.map(subject => (
                    <option key={subject} value={subject} className="bg-gray-900">{subject}</option>
                  ))}
                </select>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-300 mb-2">Chương</label>
                <input
                  type="text"
                  name="chapter"
                  value={formData.chapter}
                  onChange={handleChange}
                  className="w-full px-4 py-3 bg-white/5 border border-white/10 rounded-xl text-white placeholder-gray-500 focus:outline-none focus:border-orange-500/50"
                  placeholder="VD: Chương 1"
                />
              </div>

              {/* Custom Prompt */}
              <div className="md:col-span-2">
                <label className="block text-sm font-medium text-gray-300 mb-2 flex items-center gap-2">
                  <SparklesIcon className="w-4 h-4 text-orange-400" />
                  Yêu cầu tùy chỉnh AI (tùy chọn)
                </label>
                <textarea
                  name="customPrompt"
                  value={formData.customPrompt}
                  onChange={handleChange}
                  className="w-full px-4 py-3 bg-white/5 border border-white/10 rounded-xl text-white placeholder-gray-500 focus:outline-none focus:border-orange-500/50 h-24 resize-none"
                  placeholder="VD: Giải thích chi tiết hơn, thêm nhiều ví dụ, dùng ngôn ngữ đơn giản..."
                />
                <p className="text-xs text-gray-500 mt-1">
                  💡 Bạn có thể yêu cầu AI dạy theo cách riêng của bạn
                </p>
                
                {/* Quick suggestions */}
                <div className="flex flex-wrap gap-2 mt-2">
                  {[
                    { label: '📖 Chi tiết + ví dụ', prompt: 'Giải thích chi tiết với nhiều ví dụ thực tế, dễ hiểu' },
                    { label: '⚡ Cách làm nhanh', prompt: 'Dạy cách làm nhanh, các trick và mẹo làm bài hiệu quả' },
                    { label: '❓ Lỗi thường gặp', prompt: 'Liệt kê và giải thích các lỗi sai thường gặp, cách tránh' },
                    { label: '🗣️ Đơn giản hóa', prompt: 'Dùng ngôn ngữ rất đơn giản, dễ hiểu như giải thích cho người mới' }
                  ].map((suggestion, idx) => (
                    <button
                      key={idx}
                      type="button"
                      onClick={() => setFormData(prev => ({ ...prev, customPrompt: suggestion.prompt }))}
                      className="text-xs px-3 py-1.5 bg-white/5 border border-white/10 hover:border-orange-500/50 text-gray-400 hover:text-orange-400 rounded-full transition-all"
                    >
                      {suggestion.label}
                    </button>
                  ))}
                </div>
              </div>

              {/* Output Mode */}
              <div className="md:col-span-2">
                <label className="block text-sm font-medium text-gray-300 mb-2">Định dạng bài giảng</label>
                <div className="p-3 rounded-xl border border-orange-500/30 bg-orange-500/10 text-sm">
                  <span className="font-medium text-orange-300">Markdown tương tác</span>
                  <span className="text-gray-400"> — hệ thống tự động xuất đúng một định dạng (không xuất LaTeX).</span>
                </div>
              </div>
            </div>
          </div>

          {/* Process Button */}
          <button
            onClick={handleProcess}
            disabled={files.length === 0 || !formData.title}
            className="w-full py-4 bg-gradient-to-r from-orange-500 to-red-500 rounded-xl font-medium text-white text-lg disabled:opacity-50 disabled:cursor-not-allowed hover:shadow-lg hover:shadow-orange-500/25 transition-all flex items-center justify-center gap-2"
          >
            <SparklesIcon className="w-5 h-5" />
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
          className="bg-gray-900/50 border border-white/5 rounded-2xl text-center py-16"
        >
          <motion.div
            animate={{ rotate: 360 }}
            transition={{ duration: 2, repeat: Infinity, ease: "linear" }}
            className="w-16 h-16 border-4 border-orange-500/20 border-t-orange-500 rounded-full mx-auto mb-6"
          />
          <h3 className="text-xl font-semibold text-white mb-2">
            Đang xử lý file {currentFileIndex + 1}/{files.length}...
          </h3>
          <p className="text-gray-400 mb-6">
            {files[currentFileIndex]?.name}
          </p>
          
          {/* Progress Bar */}
          <div className="max-w-md mx-auto px-8">
            <div className="flex justify-between text-sm text-gray-500 mb-2">
              <span>Tiến độ</span>
              <span>{Math.round((currentFileIndex / files.length) * 100)}%</span>
            </div>
            <div className="h-2 bg-white/10 rounded-full overflow-hidden">
              <motion.div 
                className="h-full bg-gradient-to-r from-orange-500 to-red-500"
                initial={{ width: 0 }}
                animate={{ width: `${(currentFileIndex / files.length) * 100}%` }}
              />
            </div>
          </div>
          
          <p className="text-sm text-gray-500 mt-6">
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
          <div className="bg-gray-900/50 border border-white/5 rounded-2xl text-center py-8">
            <div className="w-16 h-16 bg-gradient-to-br from-green-500 to-emerald-500 rounded-full flex items-center justify-center mx-auto mb-4">
              <CheckCircleIcon className="w-8 h-8 text-white" />
            </div>
            <h3 className="text-xl font-semibold text-white mb-2">
              Tạo {lessons.length} bài giảng thành công!
            </h3>
            <p className="text-gray-400">{formData.title}</p>
          </div>

          {/* Lessons List */}
          <div className="bg-gray-900/50 border border-white/5 rounded-2xl p-6">
            <h3 className="text-lg font-semibold text-white mb-4">Các bài giảng đã tạo</h3>
            <div className="space-y-3 max-h-64 overflow-y-auto">
              {lessons.map((lesson, index) => (
                <div 
                  key={lesson.id}
                  className="flex items-center justify-between p-4 bg-white/5 rounded-xl hover:bg-white/10 transition-colors"
                >
                  <div className="flex items-center gap-3">
                    <div className="w-8 h-8 rounded-lg bg-orange-500/20 text-orange-400 flex items-center justify-center text-sm font-medium">
                      {index + 1}
                    </div>
                    <div>
                      <p className="font-medium text-white">{lesson.title}</p>
                      <p className="text-xs text-gray-500">{lesson.subject}</p>
                    </div>
                  </div>
                  <button
                    onClick={() => navigate(`/lessons/${lesson.id}`)}
                    className="text-sm text-orange-400 hover:text-orange-300 font-medium"
                  >
                    Xem →
                  </button>
                </div>
              ))}
            </div>
          </div>

          {/* Preview */}
          <div className="bg-gray-900/50 border border-white/5 rounded-2xl p-6">
            <div className="flex items-center justify-between mb-4">
              <h3 className="text-lg font-semibold text-white">Xem trước bài giảng đầu tiên</h3>
              <button
                onClick={() => setIsCustomizeModalOpen(true)}
                disabled={isRefiningLessons}
                className="px-4 py-2 bg-white/5 border border-white/10 rounded-xl text-sm text-gray-300 hover:bg-white/10 transition-colors flex items-center gap-2 disabled:opacity-50"
              >
                {isRefiningLessons ? (
                  <>
                    <ArrowPathIcon className="w-4 h-4 animate-spin" />
                    Đang cải thiện...
                  </>
                ) : (
                  <>
                    <PencilIcon className="w-4 h-4" />
                    Yêu cầu dạy thêm
                  </>
                )}
              </button>
            </div>
            <div className="markdown-content max-h-48 overflow-y-auto prose prose-invert prose-sm">
              {lessons[0]?.content?.slice(0, 500)}...
            </div>
          </div>

          {/* Actions */}
          <div className="grid md:grid-cols-2 gap-4">
            <button
              onClick={() => navigate(`/lessons/${lessons[0].id}`)}
              className="py-4 bg-gradient-to-r from-orange-500 to-red-500 rounded-xl font-medium text-white hover:shadow-lg hover:shadow-orange-500/25 transition-all"
            >
              {lessons.length > 1 ? 'Xem bài giảng đầu tiên' : 'Xem bài giảng đầy đủ'}
            </button>
            <button
              onClick={handleGenerateQuiz}
              disabled={processing}
              className="py-4 bg-gradient-to-r from-purple-500 to-pink-500 rounded-xl font-medium text-white hover:shadow-lg hover:shadow-purple-500/25 transition-all disabled:opacity-50 flex items-center justify-center gap-2"
            >
              {processing ? (
                <ArrowPathIcon className="w-5 h-5 animate-spin" />
              ) : (
                <>
                  <SparklesIcon className="w-5 h-5" />
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
              setFormData({ title: '', subject: 'Toán học', chapter: '', format: 'complete', customPrompt: '' });
              setStep(1);
            }}
            className="w-full py-3 bg-white/5 border border-white/10 rounded-xl text-gray-300 hover:bg-white/10 transition-colors"
          >
            Upload thêm SGK khác
          </button>

          {/* Customize Modal */}
          <CustomizePromptModal
            isOpen={isCustomizeModalOpen}
            onClose={() => setIsCustomizeModalOpen(false)}
            onSubmit={handleRefineLessons}
            isLoading={isRefiningLessons}
            lessonTitle={formData.title || `${lessons.length} bài giảng`}
          />
        </motion.div>
      )}
    </div>
  );
};

export default Upload;
