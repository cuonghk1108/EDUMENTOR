import React, { useState } from 'react';
import { motion } from 'framer-motion';
import { lessonAPI } from '../services/api';
import {
  SparklesIcon,
  ArrowPathIcon,
  CheckCircleIcon,
  DocumentPlusIcon
} from '@heroicons/react/24/outline';
import toast from 'react-hot-toast';

const CustomAI = () => {
  const [inputType, setInputType] = useState('prompt'); // 'prompt' | 'lesson'
  const [step, setStep] = useState(1); // 1: input, 2: processing, 3: result
  const [loading, setLoading] = useState(false);
  const [result, setResult] = useState(null);
  const [outputFormat, setOutputFormat] = useState('markdown'); // 'markdown' | 'latex' | 'json'
  
  // Form data
  const [formData, setFormData] = useState({
    prompt: '',
    context: '',
    outputType: 'lesson' // 'lesson' | 'quiz' | 'note' | 'summary'
  });

  // Template prompts
  const templates = [
    {
      title: '📖 Dạy chi tiết với ví dụ',
      prompt: 'Giải thích chủ đề này một cách chi tiết, dễ hiểu với nhiều ví dụ thực tế cụ thể. Thêm hình ảnh minh họa, sơ đồ tư duy.',
      icon: '📖'
    },
    {
      title: '⚡ Cách làm nhanh & trick',
      prompt: 'Hãy dạy cách làm nhanh, các trick, shortcut, mẹo làm bài tập hiệu quả cho chủ đề này. Bỏ lý thuyết dài dòng.',
      icon: '⚡'
    },
    {
      title: '❓ Lỗi sai thường gặp',
      prompt: 'Liệt kê và giải thích các lỗi sai thường gặp khi làm bài về chủ đề này. Đưa ra cách tránh từng lỗi.',
      icon: '❓'
    },
    {
      title: '🔬 Lý thuyết + Chứng minh',
      prompt: 'Giải thích lý thuyết chi tiết, chứng minh các định lý, công thức. Phù hợp cho những ai muốn hiểu sâu.',
      icon: '🔬'
    },
    {
      title: '🎯 Tóm tắt ngắn gọn',
      prompt: 'Tóm tắt chủ đề này một cách ngắn gọn, chỉ giữ lại những ý chính, công thức cần nhớ. Dạng note học tập.',
      icon: '🎯'
    },
    {
      title: '🗣️ Ngôn ngữ đơn giản',
      prompt: 'Giải thích chủ đề này bằng ngôn ngữ rất đơn giản, dễ hiểu nhất có thể. Giống như giải thích cho một đứa trẻ.',
      icon: '🗣️'
    },
    {
      title: '📊 Có bảng & sơ đồ',
      prompt: 'Tạo bảng so sánh, sơ đồ tư duy, biểu đồ để minh họa chủ đề. Dùng Markdown table format.',
      icon: '📊'
    },
    {
      title: '🔗 Liên hệ kiến thức',
      prompt: 'Giải thích chủ đề này và liên hệ với các kiến thức liên quan từ các chương khác. Giúp hiểu mối liên hệ.',
      icon: '🔗'
    }
  ];

  const handleTemplateClick = (template) => {
    setFormData(prev => ({
      ...prev,
      prompt: template.prompt
    }));
  };

  const handleProcess = async () => {
    if (!formData.prompt.trim()) {
      toast.error('Vui lòng nhập yêu cầu hoặc chọn template');
      return;
    }

    if (!formData.context.trim() && inputType === 'lesson') {
      toast.error('Vui lòng nhập nội dung để AI xử lý');
      return;
    }

    setLoading(true);
    setStep(2);

    try {
      const fullPrompt = formData.context 
        ? `[NỘI DUNG CẦN XỬ LÝ]:\n${formData.context}\n\n[YÊU CẦU]:\n${formData.prompt}`
        : formData.prompt;

      toast.loading('AI đang xử lý yêu cầu của bạn...', { id: 'process' });

      // Call AI service via API
      const response = await lessonAPI.customAI({
        prompt: fullPrompt,
        outputType: formData.outputType,
        outputFormat: outputFormat
      });
      const data = response.data;
      toast.dismiss('process');
      setResult({
        content: data.content,
        format: outputFormat,
        timestamp: new Date().toLocaleString('vi-VN')
      });
      setStep(3);
      toast.success('Xử lý thành công!');
    } catch (error) {
      console.error('Process error:', error);
      toast.dismiss('process');
      toast.error(error.message || 'Lỗi xử lý yêu cầu');
      setStep(1);
    } finally {
      setLoading(false);
    }
  };

  const handleCopy = () => {
    navigator.clipboard.writeText(result.content);
    toast.success('Đã copy!');
  };

  const handleDownload = () => {
    const element = document.createElement('a');
    const file = new Blob([result.content], { type: 'text/plain' });
    element.href = URL.createObjectURL(file);
    element.download = `custom-ai-${Date.now()}.txt`;
    document.body.appendChild(element);
    element.click();
    document.body.removeChild(element);
    toast.success('Đã tải xuống!');
  };

  return (
    <div className="max-w-4xl mx-auto">
      {/* Header */}
      <div className="mb-8">
        <h1 className="text-3xl font-display font-bold text-gray-900 flex items-center gap-2">
          <SparklesIcon className="w-8 h-8 text-primary-600" />
          Tùy chỉnh AI
        </h1>
        <p className="text-gray-600 mt-2">
          Nhập yêu cầu riêng của bạn, AI sẽ xử lý theo đúng nhu cầu
        </p>
      </div>

      {/* Step 1: Input */}
      {step === 1 && (
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="space-y-6"
        >
          {/* Input Type */}
          <div className="card">
            <h3 className="text-lg font-semibold text-gray-900 mb-4">Loại yêu cầu</h3>
            <div className="grid md:grid-cols-2 gap-3">
              {[
                { value: 'prompt', label: 'Chỉ nhập yêu cầu', desc: 'AI sẽ tạo nội dung từ yêu cầu của bạn' },
                { value: 'lesson', label: 'Yêu cầu cho nội dung', desc: 'Cung cấp nội dung + yêu cầu cách dạy' }
              ].map(opt => (
                <label
                  key={opt.value}
                  className={`cursor-pointer p-4 rounded-xl border-2 transition-all ${
                    inputType === opt.value
                      ? 'border-primary-500 bg-primary-50'
                      : 'border-gray-200 hover:border-primary-300'
                  }`}
                >
                  <input
                    type="radio"
                    name="inputType"
                    value={opt.value}
                    checked={inputType === opt.value}
                    onChange={(e) => setInputType(e.target.value)}
                    className="sr-only"
                  />
                  <span className="font-medium text-gray-900">{opt.label}</span>
                  <p className="text-sm text-gray-600 mt-1">{opt.desc}</p>
                </label>
              ))}
            </div>
          </div>

          {/* Input Area */}
          <div className="card space-y-4">
            {inputType === 'lesson' && (
              <>
                <div>
                  <label className="label">Nội dung cần xử lý *</label>
                  <textarea
                    value={formData.context}
                    onChange={(e) => setFormData({ ...formData, context: e.target.value })}
                    placeholder="Dán nội dung SGK, bài viết, hoặc bất kỳ văn bản nào cần xử lý..."
                    className="input h-32 resize-none"
                  />
                  <p className="text-xs text-gray-500 mt-2">
                    {formData.context.length} ký tự
                  </p>
                </div>
              </>
            )}

            <div>
              <label className="label">Yêu cầu của bạn *</label>
              <textarea
                value={formData.prompt}
                onChange={(e) => setFormData({ ...formData, prompt: e.target.value })}
                placeholder="Nhập yêu cầu chi tiết của bạn, hoặc chọn template dưới đây..."
                className="input h-32 resize-none"
              />
              <p className="text-xs text-gray-500 mt-2">
                {formData.prompt.length} ký tự
              </p>
            </div>

            {/* Output Type */}
            <div>
              <label className="label">Muốn AI tạo gì?</label>
              <select
                value={formData.outputType}
                onChange={(e) => setFormData({ ...formData, outputType: e.target.value })}
                className="input"
              >
                <option value="lesson">📚 Bài giảng chi tiết</option>
                <option value="quiz">❓ Bộ câu hỏi quiz</option>
                <option value="note">📝 Note học tập</option>
                <option value="summary">📋 Tóm tắt</option>
              </select>
            </div>

            {/* Output Format */}
            <div>
              <label className="label">Định dạng xuất</label>
              <div className="flex gap-2">
                {[
                  { value: 'markdown', label: 'Markdown', icon: '📄' },
                  { value: 'latex', label: 'LaTeX', icon: '∑' },
                  { value: 'json', label: 'JSON', icon: '{}' }
                ].map(fmt => (
                  <button
                    key={fmt.value}
                    onClick={() => setOutputFormat(fmt.value)}
                    className={`px-4 py-2 rounded-lg border-2 transition-all ${
                      outputFormat === fmt.value
                        ? 'border-primary-500 bg-primary-50'
                        : 'border-gray-200 hover:border-primary-300'
                    }`}
                  >
                    {fmt.icon} {fmt.label}
                  </button>
                ))}
              </div>
            </div>
          </div>

          {/* Templates */}
          <div className="card">
            <h3 className="text-lg font-semibold text-gray-900 mb-4">💡 Template yêu cầu nhanh</h3>
            <div className="grid md:grid-cols-2 gap-2">
              {templates.map((template, idx) => (
                <button
                  key={idx}
                  onClick={() => handleTemplateClick(template)}
                  className="text-left p-3 bg-gray-50 hover:bg-primary-50 rounded-lg transition-colors border border-gray-200 hover:border-primary-300"
                >
                  <p className="font-medium text-gray-900">{template.title}</p>
                  <p className="text-xs text-gray-500 mt-1">{template.prompt.slice(0, 50)}...</p>
                </button>
              ))}
            </div>
          </div>

          {/* Submit Button */}
          <button
            onClick={handleProcess}
            disabled={loading}
            className="btn-primary w-full py-4 text-lg disabled:opacity-50"
          >
            {loading ? (
              <>
                <ArrowPathIcon className="w-5 h-5 mr-2 animate-spin" />
                Đang xử lý...
              </>
            ) : (
              <>
                <SparklesIcon className="w-5 h-5 mr-2" />
                Xử lý với AI
              </>
            )}
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
            AI đang xử lý yêu cầu...
          </h3>
          <p className="text-gray-600">
            Vui lòng chờ, quá trình này có thể mất 30-60 giây
          </p>
        </motion.div>
      )}

      {/* Step 3: Result */}
      {step === 3 && result && (
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="space-y-6"
        >
          <div className="card text-center py-6 bg-green-50 border border-green-200">
            <CheckCircleIcon className="w-12 h-12 text-green-500 mx-auto mb-3" />
            <h3 className="text-lg font-semibold text-gray-900">
              Xử lý thành công!
            </h3>
            <p className="text-sm text-gray-600">
              Kết quả được tạo lúc: {result.timestamp}
            </p>
          </div>

          {/* Result Content */}
          <div className="card">
            <div className="flex items-center justify-between mb-4">
              <h3 className="text-lg font-semibold text-gray-900">Kết quả</h3>
              <div className="flex gap-2">
                <button
                  onClick={handleCopy}
                  className="btn-ghost text-sm"
                >
                  📋 Copy
                </button>
                <button
                  onClick={handleDownload}
                  className="btn-ghost text-sm"
                >
                  ⬇️ Tải xuống
                </button>
              </div>
            </div>

            {result.format === 'markdown' ? (
              <div className="markdown-content max-h-96 overflow-y-auto prose prose-sm">
                {result.content}
              </div>
            ) : (
              <pre className="bg-gray-900 text-gray-100 p-4 rounded-lg overflow-x-auto text-sm font-mono whitespace-pre-wrap max-h-96 overflow-y-auto">
                {result.content}
              </pre>
            )}
          </div>

          {/* Action Buttons */}
          <div className="flex gap-3">
            <button
              onClick={() => {
                setStep(1);
                setResult(null);
              }}
              className="btn-outline flex-1"
            >
              <DocumentPlusIcon className="w-5 h-5 mr-2" />
              Tạo yêu cầu mới
            </button>
            <button
              onClick={() => {
                setFormData({ prompt: '', context: '', outputType: 'lesson' });
                setStep(1);
                setResult(null);
              }}
              className="btn-primary flex-1"
            >
              <SparklesIcon className="w-5 h-5 mr-2" />
              Tùy chỉnh lại
            </button>
          </div>
        </motion.div>
      )}
    </div>
  );
};

export default CustomAI;
