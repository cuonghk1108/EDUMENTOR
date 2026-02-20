import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { motion } from 'framer-motion';
import { UserIcon, AcademicCapIcon, BuildingOfficeIcon } from '@heroicons/react/24/outline';
import toast from 'react-hot-toast';
import { useAuth } from '../context/AuthContext';

const CompleteProfile = () => {
  const navigate = useNavigate();
  const { user, completeProfile } = useAuth();
  
  const [formData, setFormData] = useState({
    name: user?.name || '',
    grade: '',
    school: ''
  });
  const [loading, setLoading] = useState(false);

  const gradeOptions = [
    '10', '11', '12'
  ];

  const handleChange = (e) => {
    setFormData({
      ...formData,
      [e.target.name]: e.target.value
    });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();

    if (!formData.name || !formData.grade || !formData.school) {
      toast.error('Vui lòng điền đầy đủ thông tin');
      return;
    }

    setLoading(true);
    try {
      const result = await completeProfile(formData);
      if (result.success) {
        toast.success('Hoàn thành! Chào mừng bạn đến với Edumentor 🎉');
        navigate('/dashboard');
      } else {
        toast.error(result.error || 'Không thể cập nhật thông tin');
      }
    } catch (error) {
      toast.error('Có lỗi xảy ra');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-gray-950 flex items-center justify-center p-4">
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.4 }}
        className="w-full max-w-md"
      >
        <div className="relative">
          <div className="absolute inset-0 bg-gradient-to-r from-primary-500/20 to-secondary-500/20 rounded-3xl blur-xl" />
          <div className="relative bg-gray-900/80 border border-white/10 rounded-3xl p-8 backdrop-blur-xl">
            <div className="text-center mb-8">
              <div className="relative w-16 h-16 bg-gradient-to-br from-primary-500 to-secondary-500 rounded-2xl flex items-center justify-center mx-auto mb-4">
                <AcademicCapIcon className="w-8 h-8 text-white" />
              </div>
              <h1 className="text-2xl font-bold text-white">Hoàn thành hồ sơ</h1>
              <p className="mt-2 text-gray-400 text-sm">Vui lòng cung cấp thêm thông tin để bắt đầu</p>
            </div>

            <form onSubmit={handleSubmit} className="space-y-5">
              <div>
                <label className="block text-sm font-medium text-gray-300 mb-2">
                  Họ và tên <span className="text-red-400">*</span>
                </label>
                <div className="relative">
                  <UserIcon className="w-5 h-5 text-gray-500 absolute left-4 top-1/2 -translate-y-1/2" />
                  <input
                    type="text"
                    name="name"
                    value={formData.name}
                    onChange={handleChange}
                    className="w-full bg-white/5 border border-white/10 rounded-xl pl-12 pr-4 py-3.5 text-white placeholder-gray-500 focus:outline-none focus:border-primary-500/50 focus:ring-2 focus:ring-primary-500/20 transition-all"
                    placeholder="Nguyễn Văn A"
                    required
                  />
                </div>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-300 mb-2">
                  Lớp <span className="text-red-400">*</span>
                </label>
                <div className="relative">
                  <AcademicCapIcon className="w-5 h-5 text-gray-500 absolute left-4 top-1/2 -translate-y-1/2" />
                  <select
                    name="grade"
                    value={formData.grade}
                    onChange={handleChange}
                    className="w-full bg-white/5 border border-white/10 rounded-xl pl-12 pr-4 py-3.5 text-white focus:outline-none focus:border-primary-500/50 focus:ring-2 focus:ring-primary-500/20 transition-all appearance-none cursor-pointer"
                    required
                  >
                    <option value="" className="bg-gray-900">Chọn lớp</option>
                    {gradeOptions.map(grade => (
                      <option key={grade} value={grade} className="bg-gray-900">
                        Lớp {grade}
                      </option>
                    ))}
                  </select>
                  <div className="absolute right-4 top-1/2 -translate-y-1/2 pointer-events-none">
                    <svg className="w-5 h-5 text-gray-500" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
                    </svg>
                  </div>
                </div>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-300 mb-2">
                  Trường <span className="text-red-400">*</span>
                </label>
                <div className="relative">
                  <BuildingOfficeIcon className="w-5 h-5 text-gray-500 absolute left-4 top-1/2 -translate-y-1/2" />
                  <input
                    type="text"
                    name="school"
                    value={formData.school}
                    onChange={handleChange}
                    className="w-full bg-white/5 border border-white/10 rounded-xl pl-12 pr-4 py-3.5 text-white placeholder-gray-500 focus:outline-none focus:border-primary-500/50 focus:ring-2 focus:ring-primary-500/20 transition-all"
                    placeholder="THPT Nguyễn Huệ"
                    required
                  />
                </div>
              </div>

              <button
                type="submit"
                disabled={loading}
                className="w-full py-3.5 bg-gradient-to-r from-primary-500 to-secondary-500 rounded-xl font-semibold text-white hover:shadow-lg hover:shadow-primary-500/25 transition-all disabled:opacity-50 disabled:cursor-not-allowed mt-6"
              >
                {loading ? 'Đang xử lý...' : 'Hoàn thành'}
              </button>
            </form>

            <p className="mt-6 text-center text-sm text-gray-500">
              Thông tin này giúp chúng tôi cá nhân hóa trải nghiệm học tập của bạn
            </p>
          </div>
        </div>
      </motion.div>
    </div>
  );
};

export default CompleteProfile;
