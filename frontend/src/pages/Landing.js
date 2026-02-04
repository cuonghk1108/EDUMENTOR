import React from 'react';
import { Link } from 'react-router-dom';
import { motion } from 'framer-motion';
import { 
  AcademicCapIcon,
  BookOpenIcon,
  ChatBubbleLeftRightIcon,
  ChartBarIcon,
  CloudArrowUpIcon,
  LightBulbIcon,
  SpeakerWaveIcon,
  SparklesIcon,
  CheckCircleIcon,
  ArrowRightIcon
} from '@heroicons/react/24/outline';

const Landing = () => {
  const features = [
    {
      icon: CloudArrowUpIcon,
      title: 'Upload SGK',
      description: 'Tải lên PDF hoặc ảnh chụp sách giáo khoa'
    },
    {
      icon: SparklesIcon,
      title: 'AI Tạo Bài Giảng',
      description: 'Chuyển nội dung thành bài giảng dễ hiểu'
    },
    {
      icon: BookOpenIcon,
      title: 'Quiz Tự Động',
      description: 'Sinh câu hỏi trắc nghiệm để ôn tập'
    },
    {
      icon: ChatBubbleLeftRightIcon,
      title: 'Chat Hỏi Bài',
      description: 'Hỏi đáp với AI 24/7'
    },
    {
      icon: SpeakerWaveIcon,
      title: 'Audio Bài Giảng',
      description: 'Nghe bài giảng mọi lúc mọi nơi'
    },
    {
      icon: ChartBarIcon,
      title: 'Theo Dõi Tiến Độ',
      description: 'Dashboard phân tích điểm mạnh yếu'
    }
  ];

  const benefits = [
    'Học 24/7 không giới hạn',
    'AI cá nhân hóa theo năng lực',
    'Phát hiện lỗ hổng kiến thức',
    'Lộ trình học thông minh',
    'Tiết kiệm chi phí gia sư',
    'Tăng hiệu quả học tập 40%'
  ];

  return (
    <div className="min-h-screen bg-white">
      {/* Header */}
      <header className="fixed top-0 left-0 right-0 bg-white/80 backdrop-blur-md z-50 border-b border-gray-100">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex items-center justify-between h-16">
            <div className="flex items-center gap-2">
              <div className="w-10 h-10 bg-gradient-primary rounded-xl flex items-center justify-center">
                <AcademicCapIcon className="w-6 h-6 text-white" />
              </div>
              <span className="font-display font-bold text-xl">Edumentor</span>
            </div>
            
            <div className="flex items-center gap-4">
              <Link to="/login" className="btn-ghost">
                Đăng nhập
              </Link>
              <Link to="/register" className="btn-primary">
                Bắt đầu miễn phí
              </Link>
            </div>
          </div>
        </div>
      </header>

      {/* Hero Section */}
      <section className="pt-32 pb-20 bg-gradient-hero text-white overflow-hidden">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="grid lg:grid-cols-2 gap-12 items-center">
            <motion.div
              initial={{ opacity: 0, x: -50 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ duration: 0.8 }}
            >
              <span className="inline-flex items-center gap-2 px-4 py-2 bg-white/10 rounded-full text-sm mb-6">
                <SparklesIcon className="w-4 h-4" />
                Ứng dụng AI tiên tiến nhất
              </span>
              
              <h1 className="text-4xl sm:text-5xl lg:text-6xl font-display font-bold leading-tight mb-6">
                Edumentor<br />
                <span className="text-primary-200">Thông Minh</span><br />
                Cho Học Sinh THPT
              </h1>
              
              <p className="text-lg text-primary-100 mb-8 max-w-lg">
                Chuyển sách giáo khoa thành bài giảng dễ hiểu, sinh quiz tự động, 
                chat hỏi bài 24/7. Học thông minh hơn với AI.
              </p>
              
              <div className="flex flex-wrap gap-4">
                <Link to="/register" className="btn bg-white text-primary-700 hover:bg-primary-50 px-8 py-3 text-lg">
                  Bắt đầu học ngay
                  <ArrowRightIcon className="w-5 h-5 ml-2" />
                </Link>
                <a href="#features" className="btn border-2 border-white/30 text-white hover:bg-white/10 px-8 py-3 text-lg">
                  Tìm hiểu thêm
                </a>
              </div>
            </motion.div>

            <motion.div
              initial={{ opacity: 0, x: 50 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ duration: 0.8, delay: 0.2 }}
              className="relative hidden lg:block"
            >
              <div className="relative">
                {/* Floating cards */}
                <div className="absolute -top-4 -left-4 bg-white rounded-xl shadow-lg p-4 animate-bounce-slow">
                  <div className="flex items-center gap-3">
                    <div className="w-10 h-10 bg-green-100 rounded-lg flex items-center justify-center">
                      <CheckCircleIcon className="w-6 h-6 text-green-600" />
                    </div>
                    <div>
                      <p className="text-sm font-medium text-gray-900">Quiz hoàn thành</p>
                      <p className="text-xs text-gray-500">Điểm: 90/100</p>
                    </div>
                  </div>
                </div>

                <div className="absolute -bottom-4 -right-4 bg-white rounded-xl shadow-lg p-4 animate-bounce-slow animation-delay-200">
                  <div className="flex items-center gap-3">
                    <div className="w-10 h-10 bg-primary-100 rounded-lg flex items-center justify-center">
                      <LightBulbIcon className="w-6 h-6 text-primary-600" />
                    </div>
                    <div>
                      <p className="text-sm font-medium text-gray-900">AI gợi ý</p>
                      <p className="text-xs text-gray-500">Ôn lại Hóa học</p>
                    </div>
                  </div>
                </div>

                {/* Main illustration placeholder */}
                <div className="bg-white/10 rounded-2xl p-8 backdrop-blur-sm">
                  <div className="aspect-square bg-gradient-to-br from-white/20 to-white/5 rounded-xl flex items-center justify-center">
                    <AcademicCapIcon className="w-32 h-32 text-white/50" />
                  </div>
                </div>
              </div>
            </motion.div>
          </div>
        </div>
      </section>

      {/* Features Section */}
      <section id="features" className="py-20 bg-gray-50">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-16">
            <h2 className="text-3xl sm:text-4xl font-display font-bold text-gray-900 mb-4">
              Tính năng <span className="text-gradient">thông minh</span>
            </h2>
            <p className="text-lg text-gray-600 max-w-2xl mx-auto">
              Tất cả những gì bạn cần để học hiệu quả hơn
            </p>
          </div>

          <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-8">
            {features.map((feature, index) => (
              <motion.div
                key={feature.title}
                initial={{ opacity: 0, y: 20 }}
                whileInView={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.5, delay: index * 0.1 }}
                viewport={{ once: true }}
                className="card-hover"
              >
                <div className="w-12 h-12 bg-primary-100 rounded-xl flex items-center justify-center mb-4">
                  <feature.icon className="w-6 h-6 text-primary-600" />
                </div>
                <h3 className="text-xl font-semibold text-gray-900 mb-2">
                  {feature.title}
                </h3>
                <p className="text-gray-600">
                  {feature.description}
                </p>
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      {/* Benefits Section */}
      <section className="py-20">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="grid lg:grid-cols-2 gap-16 items-center">
            <div>
              <h2 className="text-3xl sm:text-4xl font-display font-bold text-gray-900 mb-6">
                Tại sao chọn <span className="text-gradient">Edumentor</span>?
              </h2>
              <p className="text-lg text-gray-600 mb-8">
                Nền tảng học tập được thiết kế riêng cho học sinh THPT Việt Nam, 
                với công nghệ AI tiên tiến nhất.
              </p>
              
              <div className="grid sm:grid-cols-2 gap-4">
                {benefits.map((benefit, index) => (
                  <motion.div
                    key={index}
                    initial={{ opacity: 0, x: -20 }}
                    whileInView={{ opacity: 1, x: 0 }}
                    transition={{ duration: 0.5, delay: index * 0.1 }}
                    viewport={{ once: true }}
                    className="flex items-center gap-3"
                  >
                    <CheckCircleIcon className="w-6 h-6 text-green-500 flex-shrink-0" />
                    <span className="text-gray-700">{benefit}</span>
                  </motion.div>
                ))}
              </div>
            </div>

            <div className="relative">
              <div className="bg-gradient-to-br from-primary-500 to-accent-500 rounded-2xl p-8 text-white">
                <div className="text-center">
                  <p className="text-6xl font-bold mb-2">40%</p>
                  <p className="text-xl">Tăng hiệu quả học tập</p>
                </div>
                <div className="grid grid-cols-2 gap-4 mt-8">
                  <div className="bg-white/10 rounded-lg p-4 text-center">
                    <p className="text-2xl font-bold">10K+</p>
                    <p className="text-sm text-primary-100">Học sinh</p>
                  </div>
                  <div className="bg-white/10 rounded-lg p-4 text-center">
                    <p className="text-2xl font-bold">50K+</p>
                    <p className="text-sm text-primary-100">Bài học</p>
                  </div>
                  <div className="bg-white/10 rounded-lg p-4 text-center">
                    <p className="text-2xl font-bold">100K+</p>
                    <p className="text-sm text-primary-100">Câu hỏi</p>
                  </div>
                  <div className="bg-white/10 rounded-lg p-4 text-center">
                    <p className="text-2xl font-bold">4.9⭐</p>
                    <p className="text-sm text-primary-100">Đánh giá</p>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* CTA Section */}
      <section className="py-20 bg-gradient-hero text-white">
        <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.8 }}
            viewport={{ once: true }}
          >
            <h2 className="text-3xl sm:text-4xl font-display font-bold mb-6">
              Sẵn sàng học thông minh hơn?
            </h2>
            <p className="text-lg text-primary-100 mb-8">
              Đăng ký miễn phí và trải nghiệm Edumentor ngay hôm nay
            </p>
            <Link to="/register" className="btn bg-white text-primary-700 hover:bg-primary-50 px-8 py-4 text-lg">
              Bắt đầu miễn phí
              <ArrowRightIcon className="w-5 h-5 ml-2 inline" />
            </Link>
          </motion.div>
        </div>
      </section>

      {/* Footer */}
      <footer className="bg-gray-900 text-gray-400 py-12">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex flex-col md:flex-row items-center justify-between">
            <div className="flex items-center gap-2 mb-4 md:mb-0">
              <div className="w-8 h-8 bg-primary-600 rounded-lg flex items-center justify-center">
                <AcademicCapIcon className="w-5 h-5 text-white" />
              </div>
              <span className="font-display font-bold text-white">Edumentor</span>
            </div>
            <p className="text-sm">
              © 2026 Edumentor. Made with ❤️ for Vietnamese Students.
            </p>
          </div>
        </div>
      </footer>
    </div>
  );
};

export default Landing;
