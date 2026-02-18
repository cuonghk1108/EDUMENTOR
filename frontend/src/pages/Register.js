import React, { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { motion } from 'framer-motion';
import { useAuth } from '../context/AuthContext';
import { useGoogleLogin } from '@react-oauth/google';
import { 
  AcademicCapIcon, 
  EnvelopeIcon, 
  LockClosedIcon,
  UserIcon,
  BuildingLibraryIcon,
  EyeIcon,
  EyeSlashIcon,
  CheckCircleIcon,
  RocketLaunchIcon
} from '@heroicons/react/24/outline';
import toast from 'react-hot-toast';

// Google Icon Component
const GoogleIcon = () => (
  <svg className="w-5 h-5" viewBox="0 0 24 24">
    <path
      fill="#4285F4"
      d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z"
    />
    <path
      fill="#34A853"
      d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z"
    />
    <path
      fill="#FBBC05"
      d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z"
    />
    <path
      fill="#EA4335"
      d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z"
    />
  </svg>
);

// Tech grid background
const TechGrid = () => (
  <div className="absolute inset-0 overflow-hidden pointer-events-none">
    <div className="absolute inset-0" style={{
      backgroundImage: `
        linear-gradient(rgba(99, 102, 241, 0.03) 1px, transparent 1px),
        linear-gradient(90deg, rgba(99, 102, 241, 0.03) 1px, transparent 1px)
      `,
      backgroundSize: '60px 60px'
    }} />
    <div className="absolute top-20 left-10 w-72 h-72 bg-primary-500/10 rounded-full blur-3xl animate-pulse" />
    <div className="absolute bottom-20 right-10 w-96 h-96 bg-secondary-500/10 rounded-full blur-3xl animate-pulse" />
    <div className="absolute top-1/2 left-1/3 w-64 h-64 bg-accent-500/5 rounded-full blur-3xl animate-pulse" />
  </div>
);

const Register = () => {
  const [formData, setFormData] = useState({
    name: '',
    email: '',
    password: '',
    confirmPassword: '',
    grade: '',
    school: ''
  });
  const [showPassword, setShowPassword] = useState(false);
  const [loading, setLoading] = useState(false);
  const [googleLoading, setGoogleLoading] = useState(false);
  const { register, googleLogin } = useAuth();
  const navigate = useNavigate();

  // Custom Google Login
  const handleGoogleRegister = useGoogleLogin({
    onSuccess: async (tokenResponse) => {
      setGoogleLoading(true);
      try {
        // Get user info from Google
        const userInfoResponse = await fetch('https://www.googleapis.com/oauth2/v3/userinfo', {
          headers: { Authorization: `Bearer ${tokenResponse.access_token}` }
        });
        const userInfo = await userInfoResponse.json();
        
        const result = await googleLogin(tokenResponse.access_token, userInfo);
        
        if (result.success) {
          toast.success('Đăng ký Google thành công!');
          navigate('/dashboard');
        } else {
          toast.error(result.error);
        }
      } catch (error) {
        toast.error('Đăng ký Google thất bại');
      }
      setGoogleLoading(false);
    },
    onError: () => {
      toast.error('Đăng ký Google thất bại');
    }
  });

  const handleChange = (e) => {
    setFormData({
      ...formData,
      [e.target.name]: e.target.value
    });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    
    const { name, email, password, confirmPassword, grade, school } = formData;

    if (!name || !email || !password) {
      toast.error('Vui lòng điền đầy đủ thông tin bắt buộc');
      return;
    }

    if (password !== confirmPassword) {
      toast.error('Mật khẩu xác nhận không khớp');
      return;
    }

    if (password.length < 6) {
      toast.error('Mật khẩu phải có ít nhất 6 ký tự');
      return;
    }

    setLoading(true);
    const result = await register({ name, email, password, grade, school });
    setLoading(false);

    if (result.success) {
      toast.success('Đăng ký thành công!');
      navigate('/dashboard');
    } else {
      toast.error(result.error);
    }
  };

  const grades = ['Lớp 10', 'Lớp 11', 'Lớp 12'];

  const benefits = [
    'AI tạo bài giảng từ SGK',
    'Quiz thông minh tự động',
    'Trợ lý học tập 24/7',
    'Theo dõi tiến độ chi tiết'
  ];

  return (
    <div className="min-h-screen bg-gray-950 flex items-center justify-center p-4 relative">
      <TechGrid />
      
      <div className="w-full max-w-5xl relative z-10 grid lg:grid-cols-2 gap-8 items-center">
        {/* Left side - Benefits */}
        <motion.div
          initial={{ opacity: 0, x: -30 }}
          animate={{ opacity: 1, x: 0 }}
          transition={{ duration: 0.6 }}
          className="hidden lg:block"
        >
          <div className="mb-8">
            <h1 className="text-4xl font-display font-bold text-white mb-4">
              Bắt đầu hành trình <br />
              <span className="text-transparent bg-clip-text bg-gradient-to-r from-primary-400 to-secondary-400">
                học tập thông minh
              </span>
            </h1>
            <p className="text-lg text-gray-400">
              Tham gia cùng hơn 10,000 học sinh đang sử dụng AI để học hiệu quả hơn mỗi ngày.
            </p>
          </div>

          <div className="space-y-4">
            {benefits.map((benefit, i) => (
              <motion.div
                key={i}
                initial={{ opacity: 0, x: -20 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ delay: 0.3 + i * 0.1 }}
                className="flex items-center gap-3 p-4 bg-white/5 border border-white/5 rounded-xl"
              >
                <div className="w-10 h-10 bg-gradient-to-br from-primary-500/20 to-secondary-500/20 rounded-lg flex items-center justify-center">
                  <CheckCircleIcon className="w-5 h-5 text-primary-400" />
                </div>
                <span className="text-gray-300">{benefit}</span>
              </motion.div>
            ))}
          </div>
        </motion.div>

        {/* Right side - Form */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5 }}
        >
          <div className="relative">
            <div className="absolute inset-0 bg-gradient-to-r from-primary-500/20 to-secondary-500/20 rounded-3xl blur-xl" />
            <div className="relative bg-gray-900/80 border border-white/10 rounded-3xl p-8 backdrop-blur-xl">
              {/* Logo */}
              <div className="text-center mb-6">
                <Link to="/" className="inline-flex items-center gap-3">
                  <div className="relative">
                    <div className="absolute inset-0 bg-primary-500 rounded-xl blur-lg opacity-50" />
                    <div className="relative w-10 h-10 bg-gradient-to-br from-primary-500 to-secondary-500 rounded-xl flex items-center justify-center">
                      <AcademicCapIcon className="w-6 h-6 text-white" />
                    </div>
                  </div>
                  <span className="font-display font-bold text-xl text-white">Edumentor</span>
                </Link>
                <h2 className="mt-4 text-xl font-bold text-white">Tạo tài khoản mới</h2>
              </div>

              {/* Google Register Button */}
              <motion.button
                type="button"
                onClick={() => handleGoogleRegister()}
                disabled={googleLoading}
                whileHover={{ scale: 1.02 }}
                whileTap={{ scale: 0.98 }}
                className="w-full py-3.5 bg-white hover:bg-gray-100 rounded-xl font-medium text-gray-800 transition-all disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-3 mb-4 shadow-lg shadow-white/10"
              >
                {googleLoading ? (
                  <>
                    <div className="w-5 h-5 border-2 border-gray-300 border-t-gray-600 rounded-full animate-spin" />
                    <span>Đang xử lý...</span>
                  </>
                ) : (
                  <>
                    <GoogleIcon />
                    <span>Đăng ký với Google</span>
                  </>
                )}
              </motion.button>

              {/* Divider */}
              <div className="relative my-4">
                <div className="absolute inset-0 flex items-center">
                  <div className="w-full border-t border-white/10"></div>
                </div>
                <div className="relative flex justify-center text-sm">
                  <span className="px-4 bg-gray-900/80 text-gray-500">hoặc đăng ký bằng email</span>
                </div>
              </div>

              {/* Form */}
              <form onSubmit={handleSubmit} className="space-y-4">
                <div>
                  <label className="block text-sm font-medium text-gray-300 mb-1.5">Họ và tên *</label>
                  <div className="relative">
                    <UserIcon className="w-5 h-5 text-gray-500 absolute left-4 top-1/2 -translate-y-1/2" />
                    <input
                      type="text"
                      name="name"
                      value={formData.name}
                      onChange={handleChange}
                      className="w-full bg-white/5 border border-white/10 rounded-xl pl-12 pr-4 py-3 text-white placeholder-gray-500 focus:outline-none focus:border-primary-500/50 focus:ring-2 focus:ring-primary-500/20 transition-all"
                      placeholder="Nguyễn Văn A"
                    />
                  </div>
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-300 mb-1.5">Email *</label>
                  <div className="relative">
                    <EnvelopeIcon className="w-5 h-5 text-gray-500 absolute left-4 top-1/2 -translate-y-1/2" />
                    <input
                      type="email"
                      name="email"
                      value={formData.email}
                      onChange={handleChange}
                      className="w-full bg-white/5 border border-white/10 rounded-xl pl-12 pr-4 py-3 text-white placeholder-gray-500 focus:outline-none focus:border-primary-500/50 focus:ring-2 focus:ring-primary-500/20 transition-all"
                      placeholder="email@example.com"
                    />
                  </div>
                </div>

                <div className="grid grid-cols-2 gap-3">
                  <div>
                    <label className="block text-sm font-medium text-gray-300 mb-1.5">Mật khẩu *</label>
                    <div className="relative">
                      <LockClosedIcon className="w-5 h-5 text-gray-500 absolute left-4 top-1/2 -translate-y-1/2" />
                      <input
                        type={showPassword ? 'text' : 'password'}
                        name="password"
                        value={formData.password}
                        onChange={handleChange}
                        className="w-full bg-white/5 border border-white/10 rounded-xl pl-12 pr-4 py-3 text-white placeholder-gray-500 focus:outline-none focus:border-primary-500/50 focus:ring-2 focus:ring-primary-500/20 transition-all"
                        placeholder="••••••"
                      />
                    </div>
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-300 mb-1.5">Xác nhận *</label>
                    <div className="relative">
                      <LockClosedIcon className="w-5 h-5 text-gray-500 absolute left-4 top-1/2 -translate-y-1/2" />
                      <input
                        type={showPassword ? 'text' : 'password'}
                        name="confirmPassword"
                        value={formData.confirmPassword}
                        onChange={handleChange}
                        className="w-full bg-white/5 border border-white/10 rounded-xl pl-12 pr-10 py-3 text-white placeholder-gray-500 focus:outline-none focus:border-primary-500/50 focus:ring-2 focus:ring-primary-500/20 transition-all"
                        placeholder="••••••"
                      />
                      <button
                        type="button"
                        onClick={() => setShowPassword(!showPassword)}
                        className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-500 hover:text-gray-300"
                      >
                        {showPassword ? <EyeSlashIcon className="w-4 h-4" /> : <EyeIcon className="w-4 h-4" />}
                      </button>
                    </div>
                  </div>
                </div>

                <div className="grid grid-cols-2 gap-3">
                  <div>
                    <label className="block text-sm font-medium text-gray-300 mb-1.5">Lớp</label>
                    <div className="relative">
                      <AcademicCapIcon className="w-5 h-5 text-gray-500 absolute left-4 top-1/2 -translate-y-1/2" />
                      <select
                        name="grade"
                        value={formData.grade}
                        onChange={handleChange}
                        className="w-full bg-white/5 border border-white/10 rounded-xl pl-12 pr-4 py-3 text-white focus:outline-none focus:border-primary-500/50 focus:ring-2 focus:ring-primary-500/20 transition-all appearance-none"
                      >
                        <option value="" className="bg-gray-900">Chọn lớp</option>
                        {grades.map(g => (
                          <option key={g} value={g} className="bg-gray-900">{g}</option>
                        ))}
                      </select>
                    </div>
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-300 mb-1.5">Trường</label>
                    <div className="relative">
                      <BuildingLibraryIcon className="w-5 h-5 text-gray-500 absolute left-4 top-1/2 -translate-y-1/2" />
                      <input
                        type="text"
                        name="school"
                        value={formData.school}
                        onChange={handleChange}
                        className="w-full bg-white/5 border border-white/10 rounded-xl pl-12 pr-4 py-3 text-white placeholder-gray-500 focus:outline-none focus:border-primary-500/50 focus:ring-2 focus:ring-primary-500/20 transition-all"
                        placeholder="THPT ABC"
                      />
                    </div>
                  </div>
                </div>

                <button
                  type="submit"
                  disabled={loading}
                  className="w-full py-4 bg-gradient-to-r from-primary-500 to-secondary-500 rounded-xl font-semibold text-white hover:shadow-lg hover:shadow-primary-500/25 transition-all disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2 mt-6"
                >
                  {loading ? (
                    <div className="flex items-center gap-2">
                      <div className="w-5 h-5 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                      <span>Đang đăng ký...</span>
                    </div>
                  ) : (
                    <>
                      <RocketLaunchIcon className="w-5 h-5" />
                      <span>Tạo tài khoản</span>
                    </>
                  )}
                </button>
              </form>

              {/* Login link */}
              <p className="mt-6 text-center text-gray-400">
                Đã có tài khoản?{' '}
                <Link to="/login" className="text-primary-400 hover:text-primary-300 font-medium transition-colors">
                  Đăng nhập
                </Link>
              </p>
            </div>
          </div>
        </motion.div>
      </div>
    </div>
  );
};

export default Register;
