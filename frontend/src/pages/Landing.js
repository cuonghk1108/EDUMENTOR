import React, { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import { motion } from 'framer-motion';
import { useAuth } from '../context/AuthContext';
import { getResourceUrl } from '../utils/apiHelpers';
import { 
  AcademicCapIcon,
  BookOpenIcon,
  ChatBubbleLeftRightIcon,
  ChartBarIcon,
  CloudArrowUpIcon,
  QuestionMarkCircleIcon,
  LightBulbIcon,
  SpeakerWaveIcon,
  SparklesIcon,
  CheckCircleIcon,
  ArrowRightIcon,
  CpuChipIcon,
  BeakerIcon,
  CalculatorIcon,
  GlobeAltIcon,
  DocumentTextIcon,
  PlayCircleIcon,
  RocketLaunchIcon,
  BoltIcon,
  CircleStackIcon,
  CommandLineIcon,
  CubeTransparentIcon,
  FireIcon
} from '@heroicons/react/24/outline';

// Animated code lines for tech effect
const CodeLines = () => {
  const lines = [
    'const knowledge = await AI.analyze(textbook);',
    'const lesson = AI.generateLesson(knowledge);',
    'const quiz = AI.createQuiz(lesson, 10);',
    'await student.learn(lesson);',
    'const score = await quiz.evaluate();',
    'AI.suggestNextTopic(score);'
  ];
  
  return (
    <div className="font-mono text-xs sm:text-sm space-y-2 text-left">
      {lines.map((line, i) => (
        <motion.div
          key={i}
          initial={{ opacity: 0, x: -20 }}
          animate={{ opacity: 1, x: 0 }}
          transition={{ delay: i * 0.2, duration: 0.5 }}
          className="flex items-center gap-2"
        >
          <span className="text-primary-400">{i + 1}</span>
          <span className="text-gray-300">{line}</span>
        </motion.div>
      ))}
    </div>
  );
};

// Animated grid background
const TechGrid = () => (
  <div className="absolute inset-0 overflow-hidden pointer-events-none">
    <div className="absolute inset-0" style={{
      backgroundImage: `
        linear-gradient(rgba(34, 211, 238, 0.08) 1px, transparent 1px),
        linear-gradient(90deg, rgba(99, 102, 241, 0.08) 1px, transparent 1px)
      `,
      backgroundSize: '56px 56px',
      maskImage: 'linear-gradient(to bottom, transparent, black 12%, black 78%, transparent)'
    }} />
    <div className="absolute inset-0 bg-[linear-gradient(115deg,rgba(14,165,233,0.12),transparent_24%,rgba(16,185,129,0.08)_48%,transparent_72%)]" />
    <motion.div
      className="absolute left-0 right-0 top-1/4 h-px bg-gradient-to-r from-transparent via-cyan-300/40 to-transparent"
      animate={{ y: [0, 260, 0], opacity: [0.15, 0.65, 0.15] }}
      transition={{ duration: 9, repeat: Infinity, ease: "easeInOut" }}
    />
  </div>
);

// Floating tech icons
const FloatingIcons = () => {
  const icons = [
    { Icon: CpuChipIcon, x: '10%', y: '20%', delay: 0 },
    { Icon: BeakerIcon, x: '85%', y: '15%', delay: 0.5 },
    { Icon: CalculatorIcon, x: '5%', y: '70%', delay: 1 },
    { Icon: GlobeAltIcon, x: '90%', y: '60%', delay: 1.5 },
    { Icon: DocumentTextIcon, x: '15%', y: '45%', delay: 2 },
    { Icon: CircleStackIcon, x: '80%', y: '80%', delay: 2.5 },
  ];

  return (
    <div className="absolute inset-0 overflow-hidden pointer-events-none">
      {icons.map(({ Icon, x, y, delay }, i) => (
        <motion.div
          key={i}
          className="absolute"
          style={{ left: x, top: y }}
          animate={{ 
            y: [0, -15, 0],
            rotate: [0, 5, -5, 0]
          }}
          transition={{ 
            duration: 4 + i * 0.5,
            repeat: Infinity,
            delay 
          }}
        >
          <Icon className="w-8 h-8 text-primary-300/30" />
        </motion.div>
      ))}
    </div>
  );
};

const LearningCockpit = () => {
  const pipeline = [
    { icon: CloudArrowUpIcon, label: 'Upload SGK', detail: 'PDF, ảnh, tài liệu' },
    { icon: SparklesIcon, label: 'AI tóm tắt', detail: 'Ý chính và ví dụ' },
    { icon: QuestionMarkCircleIcon, label: 'Quiz thích ứng', detail: 'Luyện đúng điểm yếu' },
  ];

  return (
    <div className="relative">
      <div className="absolute -inset-px rounded-3xl bg-gradient-to-br from-cyan-400/30 via-primary-500/20 to-emerald-400/20" />
      <div className="relative overflow-hidden rounded-3xl border border-white/10 bg-slate-950/85 shadow-2xl shadow-cyan-950/40 backdrop-blur-xl">
        <div className="absolute inset-0 opacity-20" style={{
          backgroundImage: `linear-gradient(rgba(255,255,255,.08) 1px, transparent 1px),
            linear-gradient(90deg, rgba(255,255,255,.08) 1px, transparent 1px)`,
          backgroundSize: '38px 38px'
        }} />
        <div className="relative border-b border-white/10 px-5 py-4">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-xs font-semibold uppercase tracking-[0.22em] text-cyan-300">AI Learning Cockpit</p>
              <h2 className="mt-1 text-xl font-bold text-white">Học đúng trọng tâm ngay từ trang đầu</h2>
            </div>
            <div className="flex items-center gap-2 rounded-full border border-emerald-400/30 bg-emerald-400/10 px-3 py-1 text-xs font-medium text-emerald-200">
              <span className="h-2 w-2 rounded-full bg-emerald-300" />
              Online
            </div>
          </div>
        </div>

        <div className="relative grid gap-4 p-5">
          <div className="grid grid-cols-3 gap-3">
            {[
              { label: 'Tiến độ', value: '72%', tone: 'text-cyan-300' },
              { label: 'Mục tiêu hôm nay', value: '25 phút', tone: 'text-emerald-300' },
              { label: 'Sẵn sàng quiz', value: '8 câu', tone: 'text-amber-300' },
            ].map((item) => (
              <div key={item.label} className="rounded-2xl border border-white/10 bg-white/[0.04] p-3">
                <p className="text-[11px] text-gray-400">{item.label}</p>
                <p className={`mt-1 text-lg font-bold ${item.tone}`}>{item.value}</p>
              </div>
            ))}
          </div>

          <div className="rounded-2xl border border-cyan-300/20 bg-cyan-300/[0.06] p-4">
            <div className="flex items-start gap-3">
              <div className="flex h-11 w-11 shrink-0 items-center justify-center rounded-xl bg-cyan-400/15 text-cyan-200">
                <BookOpenIcon className="h-6 w-6" />
              </div>
              <div className="min-w-0 flex-1">
                <div className="flex items-center justify-between gap-3">
                  <p className="font-semibold text-white">Bài tiếp theo: Hàm số bậc hai</p>
                  <span className="rounded-full bg-white/10 px-2 py-1 text-[11px] text-gray-300">12 phút</span>
                </div>
                <p className="mt-1 text-sm text-gray-400">AI chia bài thành từng ý nhỏ, có ví dụ và câu hỏi kiểm tra nhanh.</p>
                <div className="mt-4 h-2 overflow-hidden rounded-full bg-white/10">
                  <motion.div
                    className="h-full rounded-full bg-gradient-to-r from-cyan-300 to-emerald-300"
                    initial={{ width: '12%' }}
                    animate={{ width: '72%' }}
                    transition={{ duration: 1.2, delay: 0.5 }}
                  />
                </div>
              </div>
            </div>
          </div>

          <div className="grid gap-3">
            {pipeline.map((step, index) => (
              <motion.div
                key={step.label}
                initial={{ opacity: 0, x: 20 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ delay: 0.45 + index * 0.12 }}
                className="flex items-center gap-3 rounded-2xl border border-white/10 bg-white/[0.035] p-3"
              >
                <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-white/10 text-cyan-200">
                  <step.icon className="h-5 w-5" />
                </div>
                <div className="flex-1">
                  <p className="text-sm font-semibold text-white">{step.label}</p>
                  <p className="text-xs text-gray-400">{step.detail}</p>
                </div>
                <CheckCircleIcon className="h-5 w-5 text-emerald-300" />
              </motion.div>
            ))}
          </div>

          <div className="rounded-2xl border border-white/10 bg-slate-900/80 p-4">
            <div className="flex items-start gap-3">
              <div className="flex h-9 w-9 items-center justify-center rounded-xl bg-primary-400/15 text-primary-200">
                <LightBulbIcon className="h-5 w-5" />
              </div>
              <div>
                <p className="text-sm font-semibold text-white">Gợi ý từ AI Tutor</p>
                <p className="mt-1 text-sm text-gray-400">Bạn đang yếu phần đồ thị. Hãy học 1 ví dụ trực quan rồi làm 5 câu kiểm tra.</p>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

// Stats counter animation
const AnimatedNumber = ({ value, suffix = '' }) => {
  const [count, setCount] = useState(0);
  
  useEffect(() => {
    const duration = 2000;
    const steps = 60;
    const increment = value / steps;
    let current = 0;
    
    const timer = setInterval(() => {
      current += increment;
      if (current >= value) {
        setCount(value);
        clearInterval(timer);
      } else {
        setCount(Math.floor(current));
      }
    }, duration / steps);
    
    return () => clearInterval(timer);
  }, [value]);
  
  return <span>{count.toLocaleString()}{suffix}</span>;
};

const Landing = () => {
  const { user, isAuthenticated } = useAuth();

  const features = [
    {
      icon: CloudArrowUpIcon,
      title: 'Upload SGK',
      description: 'AI nhận diện và phân tích nội dung từ PDF, ảnh chụp sách giáo khoa với độ chính xác cao',
      color: 'from-blue-500 to-cyan-500',
      tech: 'OCR + NLP'
    },
    {
      icon: SparklesIcon,
      title: 'AI Tạo Bài Giảng',
      description: 'Biến đổi nội dung khô khan thành bài giảng sinh động, dễ hiểu với ví dụ minh họa',
      color: 'from-purple-500 to-pink-500',
      tech: 'GPT-4 Turbo'
    },
    {
      icon: BookOpenIcon,
      title: 'Quiz Thông Minh',
      description: 'Tự động sinh câu hỏi đa dạng, phân tích kết quả và gợi ý ôn tập thông minh',
      color: 'from-green-500 to-emerald-500',
      tech: 'Adaptive Testing'
    },
    {
      icon: ChatBubbleLeftRightIcon,
      title: 'AI Tutor 24/7',
      description: 'Trợ lý học tập AI sẵn sàng giải đáp mọi thắc mắc, hỗ trợ làm bài tập',
      color: 'from-orange-500 to-amber-500',
      tech: 'RAG System'
    },
    {
      icon: SpeakerWaveIcon,
      title: 'Text-to-Speech',
      description: 'Chuyển bài giảng thành audio chất lượng cao, học tập mọi lúc mọi nơi',
      color: 'from-red-500 to-rose-500',
      tech: 'Neural TTS'
    },
    {
      icon: ChartBarIcon,
      title: 'Analytics Dashboard',
      description: 'Theo dõi tiến độ, phân tích điểm mạnh yếu, đề xuất lộ trình học tập tối ưu',
      color: 'from-indigo-500 to-violet-500',
      tech: 'ML Analytics'
    }
  ];

  const benefits = [
    { icon: BoltIcon, text: 'Học nhanh hơn 40%', desc: 'Với AI cá nhân hóa' },
    { icon: CpuChipIcon, text: 'AI tiên tiến nhất', desc: 'GPT-4, Claude AI' },
    { icon: FireIcon, text: 'Streak động lực', desc: 'Gamification thông minh' },
    { icon: RocketLaunchIcon, text: 'Lộ trình thông minh', desc: 'Adaptive learning' },
    { icon: CircleStackIcon, text: 'Phát hiện lỗ hổng', desc: 'Knowledge gap analysis' },
    { icon: CommandLineIcon, text: 'Học mọi môn', desc: 'Toán, Lý, Hóa, Anh...' }
  ];

  const techStack = [
    { name: 'React', desc: 'Frontend' },
    { name: 'Node.js', desc: 'Backend' },
    { name: 'GPT-4', desc: 'AI Core' },
    { name: 'TensorFlow', desc: 'ML' },
  ];

  return (
    <div className="app-shell text-white overflow-hidden">
      {/* Header */}
      <header className="fixed left-0 right-0 top-0 z-50 border-b border-white/10 bg-slate-950/75 backdrop-blur-2xl">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex items-center justify-between h-16">
            <div className="flex items-center gap-3">
              <div className="relative">
                <div className="absolute inset-0 bg-primary-500 rounded-xl blur-lg opacity-50" />
                <div className="relative w-10 h-10 bg-gradient-to-br from-primary-500 to-secondary-500 rounded-xl flex items-center justify-center">
                  <AcademicCapIcon className="w-6 h-6 text-white" />
                </div>
              </div>
              <div>
                <span className="font-display font-bold text-xl text-white">Edumentor</span>
                <span className="hidden sm:inline text-xs text-primary-400 ml-2">AI Learning</span>
              </div>
            </div>
            
            <div className="flex items-center gap-4">
              {isAuthenticated ? (
                <div className="flex items-center gap-3">
                  <Link to="/dashboard" className="text-gray-400 hover:text-white transition-colors">
                    Dashboard
                  </Link>
                  <Link to="/profile" className="flex items-center gap-2 px-3 py-2 rounded-xl bg-white/5 hover:bg-white/10 transition-colors">
                    {user?.avatar ? (
                      <img
                        src={getResourceUrl(user.avatar)}
                        alt="Avatar"
                        className="w-8 h-8 rounded-full object-cover ring-2 ring-primary-500/50"
                      />
                    ) : (
                      <div className="w-8 h-8 bg-gradient-to-br from-primary-500 to-secondary-500 rounded-full flex items-center justify-center">
                        <span className="text-sm font-bold text-white">
                          {user?.name?.charAt(0)?.toUpperCase() || 'U'}
                        </span>
                      </div>
                    )}
                    <span className="hidden sm:block font-medium text-white">
                      {user?.name?.split(' ').pop()}
                    </span>
                  </Link>
                </div>
              ) : (
                <>
                  <Link to="/login" className="text-gray-400 hover:text-white transition-colors">
                    Đăng nhập
                  </Link>
                  <Link to="/register" className="px-4 py-2 bg-gradient-to-r from-primary-500 to-secondary-500 rounded-lg font-medium hover:opacity-90 transition-opacity">
                    Bắt đầu miễn phí
                  </Link>
                </>
              )}
            </div>
          </div>
        </div>
      </header>

      {/* Hero Section */}
      <section className="relative flex min-h-screen items-center pb-20 pt-28">
        <TechGrid />
        <FloatingIcons />
        <div className="twinkle-stars opacity-40" />
        
        <div className="relative max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="grid lg:grid-cols-2 gap-12 items-center">
            <motion.div
              initial={{ opacity: 0, y: 30 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.8 }}
            >
              {/* Badge */}
              <motion.div
                initial={{ opacity: 0, scale: 0.8 }}
                animate={{ opacity: 1, scale: 1 }}
                transition={{ delay: 0.2 }}
                className="inline-flex items-center gap-2 px-4 py-2 bg-white/5 border border-white/10 rounded-full text-sm mb-6 backdrop-blur-sm"
              >
                <span className="flex h-2 w-2 relative">
                  <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-green-400 opacity-75"></span>
                  <span className="relative inline-flex rounded-full h-2 w-2 bg-green-500"></span>
                </span>
                <span className="text-gray-300">Powered by GPT-4 & Claude AI</span>
              </motion.div>
              
              <h1 className="text-4xl sm:text-5xl lg:text-6xl font-display font-bold leading-tight mb-6">
                <span className="text-white">Học Thông Minh</span>
                <br />
                <span className="text-transparent bg-clip-text bg-gradient-to-r from-primary-400 via-secondary-400 to-accent-400">
                  Với Trí Tuệ Nhân Tạo
                </span>
              </h1>
              
              <p className="text-lg text-gray-400 mb-8 max-w-lg leading-relaxed">
                Nền tảng học tập AI tiên tiến nhất dành cho học sinh THPT Việt Nam. 
                Biến sách giáo khoa thành kiến thức dễ hiểu, ôn tập thông minh với quiz AI, 
                và có trợ lý học tập 24/7.
              </p>
              
              <div className="flex flex-wrap gap-4 mb-8">
                <Link 
                  to="/register" 
                  className="group relative px-8 py-4 bg-gradient-to-r from-primary-500 to-secondary-500 rounded-xl font-semibold text-lg overflow-hidden btn-shine hover-glow-card"
                >
                  <span className="relative z-10 flex items-center gap-2">
                    <RocketLaunchIcon className="w-5 h-5 group-hover:animate-bounce" />
                    Bắt đầu học ngay
                  </span>
                  <div className="absolute inset-0 bg-gradient-to-r from-secondary-500 to-accent-500 opacity-0 group-hover:opacity-100 transition-opacity" />
                </Link>
                <a 
                  href="#features" 
                  className="px-8 py-4 border border-white/20 rounded-xl font-semibold text-lg hover:bg-white/5 transition-colors flex items-center gap-2 hover-glow-card"
                >
                  <PlayCircleIcon className="w-5 h-5" />
                  Xem demo
                </a>
              </div>

              {/* Tech stack badges */}
              <div className="flex items-center gap-4 flex-wrap">
                <span className="text-xs text-gray-500 uppercase tracking-wider">Tech Stack:</span>
                {techStack.map((tech, i) => (
                  <div key={i} className="px-3 py-1 bg-white/5 border border-white/10 rounded-lg text-xs">
                    <span className="text-white font-medium">{tech.name}</span>
                    <span className="text-gray-500 ml-1">• {tech.desc}</span>
                  </div>
                ))}
              </div>
            </motion.div>

            {/* Right side - Learning cockpit */}
            <motion.div
              initial={{ opacity: 0, x: 50 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ duration: 0.8, delay: 0.3 }}
              className="relative hidden lg:block"
            >
              <LearningCockpit />
              <div className="hidden">
                <div className="absolute inset-0 bg-gradient-to-r from-primary-500/20 to-secondary-500/20 rounded-2xl blur-2xl" />
                <div className="relative bg-gray-900/80 border border-white/10 rounded-2xl overflow-hidden backdrop-blur-xl hover-glow-card">
                  {/* Terminal header */}
                  <div className="flex items-center gap-2 px-4 py-3 bg-black/40 border-b border-white/5">
                    <div className="flex gap-2">
                      <div className="w-3 h-3 rounded-full bg-red-500" />
                      <div className="w-3 h-3 rounded-full bg-yellow-500" />
                      <div className="w-3 h-3 rounded-full bg-green-500" />
                    </div>
                    <span className="text-gray-500 text-sm ml-2 font-mono">edumentor-ai.js</span>
                  </div>
                  
                  {/* Code content */}
                  <div className="p-6">
                    <CodeLines />
                  </div>
                  
                  {/* Output section */}
                  <div className="px-6 pb-6">
                    <div className="bg-black/40 rounded-lg p-4 border border-green-500/20">
                      <div className="flex items-center gap-2 text-green-400 text-sm font-mono">
                        <CheckCircleIcon className="w-4 h-4" />
                        <span>AI Analysis Complete!</span>
                      </div>
                      <div className="mt-2 text-xs text-gray-500 font-mono">
                        → Generated: 1 lesson, 10 quiz questions
                        <br />
                        → Estimated study time: 25 minutes
                      </div>
                    </div>
                  </div>
                </div>

                {/* Floating notification cards */}
                <motion.div
                  animate={{ y: [0, -10, 0] }}
                  transition={{ duration: 3, repeat: Infinity }}
                  className="absolute -top-4 -left-4 bg-gray-900/90 border border-white/10 rounded-xl p-4 backdrop-blur-xl hover-glow-card"
                >
                  <div className="flex items-center gap-3">
                    <div className="w-10 h-10 bg-gradient-to-br from-green-500 to-emerald-500 rounded-lg flex items-center justify-center">
                      <CheckCircleIcon className="w-5 h-5 text-white" />
                    </div>
                    <div>
                      <p className="text-sm font-medium text-white">Quiz hoàn thành!</p>
                      <p className="text-xs text-gray-400">Điểm: 9/10 • 2 phút</p>
                    </div>
                  </div>
                </motion.div>

                <motion.div
                  animate={{ y: [0, 10, 0] }}
                  transition={{ duration: 4, repeat: Infinity }}
                  className="absolute -bottom-4 -right-4 bg-gray-900/90 border border-white/10 rounded-xl p-4 backdrop-blur-xl hover-glow-card"
                >
                  <div className="flex items-center gap-3">
                    <div className="w-10 h-10 bg-gradient-to-br from-primary-500 to-secondary-500 rounded-lg flex items-center justify-center">
                      <LightBulbIcon className="w-5 h-5 text-white" />
                    </div>
                    <div>
                      <p className="text-sm font-medium text-white">AI gợi ý</p>
                      <p className="text-xs text-gray-400">Ôn lại: Phương trình bậc 2</p>
                    </div>
                  </div>
                </motion.div>
              </div>
            </motion.div>
          </div>
        </div>
      </section>

      {/* Stats Section */}
      <section className="relative py-16 border-y border-white/5">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="grid grid-cols-2 md:grid-cols-4 gap-8">
            {[
              { value: 10000, suffix: '+', label: 'Học sinh', icon: AcademicCapIcon },
              { value: 50000, suffix: '+', label: 'Bài học', icon: BookOpenIcon },
              { value: 100000, suffix: '+', label: 'Câu hỏi AI', icon: SparklesIcon },
              { value: 98, suffix: '%', label: 'Hài lòng', icon: FireIcon },
            ].map((stat, i) => (
              <motion.div
                key={i}
                initial={{ opacity: 0, y: 20 }}
                whileInView={{ opacity: 1, y: 0 }}
                transition={{ delay: i * 0.1 }}
                viewport={{ once: true }}
                className="text-center"
              >
                <stat.icon className="w-8 h-8 text-primary-400 mx-auto mb-3" />
                <p className="text-3xl sm:text-4xl font-bold text-white mb-1">
                  <AnimatedNumber value={stat.value} suffix={stat.suffix} />
                </p>
                <p className="text-gray-500">{stat.label}</p>
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      {/* Features Section */}
      <section id="features" className="relative py-24">
        <TechGrid />
        
        <div className="relative max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            className="text-center mb-16"
          >
            <span className="inline-flex items-center gap-2 px-4 py-2 bg-primary-500/10 border border-primary-500/20 rounded-full text-sm text-primary-400 mb-4">
              <CubeTransparentIcon className="w-4 h-4" />
              Tính năng
            </span>
            <h2 className="text-3xl sm:text-4xl font-display font-bold text-white mb-4">
              Công nghệ <span className="text-transparent bg-clip-text bg-gradient-to-r from-primary-400 to-secondary-400">AI tiên tiến</span>
            </h2>
            <p className="text-lg text-gray-400 max-w-2xl mx-auto">
              Tích hợp các mô hình AI hàng đầu thế giới để mang lại trải nghiệm học tập tốt nhất
            </p>
          </motion.div>

          <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
            {features.map((feature, index) => (
              <motion.div
                key={feature.title}
                initial={{ opacity: 0, y: 20 }}
                whileInView={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.5, delay: index * 0.1 }}
                viewport={{ once: true }}
                className="group relative"
              >
                <div className="absolute inset-0 bg-gradient-to-r opacity-0 group-hover:opacity-100 transition-opacity duration-500 rounded-2xl blur-xl"
                  style={{ backgroundImage: `linear-gradient(to right, var(--tw-gradient-stops))` }} />
                
                <div className="relative h-full bg-gray-900/50 border border-white/5 rounded-2xl p-6 hover:border-white/20 transition-all duration-300 backdrop-blur-sm hover-glow-card">
                  <div className={`w-14 h-14 bg-gradient-to-br ${feature.color} rounded-xl flex items-center justify-center mb-4 group-hover:scale-110 transition-transform`}>
                    <feature.icon className="w-7 h-7 text-white" />
                  </div>
                  
                  <div className="flex items-center gap-2 mb-2">
                    <h3 className="text-xl font-semibold text-white">
                      {feature.title}
                    </h3>
                    <span className="px-2 py-0.5 bg-white/5 rounded text-xs text-gray-400 font-mono">
                      {feature.tech}
                    </span>
                  </div>
                  
                  <p className="text-gray-400 leading-relaxed">
                    {feature.description}
                  </p>
                </div>
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      {/* Benefits Section */}
      <section className="relative py-24 bg-gradient-to-b from-gray-950 via-gray-900 to-gray-950">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="grid lg:grid-cols-2 gap-16 items-center">
            <motion.div
              initial={{ opacity: 0, x: -30 }}
              whileInView={{ opacity: 1, x: 0 }}
              viewport={{ once: true }}
            >
              <span className="inline-flex items-center gap-2 px-4 py-2 bg-secondary-500/10 border border-secondary-500/20 rounded-full text-sm text-secondary-400 mb-4">
                <BoltIcon className="w-4 h-4" />
                Lợi ích
              </span>
              <h2 className="text-3xl sm:text-4xl font-display font-bold text-white mb-6">
                Tại sao chọn <span className="text-transparent bg-clip-text bg-gradient-to-r from-secondary-400 to-accent-400">Edumentor</span>?
              </h2>
              <p className="text-lg text-gray-400 mb-8">
                Nền tảng học tập được thiết kế riêng cho học sinh Việt Nam, 
                kết hợp công nghệ AI tiên tiến nhất với phương pháp học tập khoa học.
              </p>
              
              <div className="grid sm:grid-cols-2 gap-4">
                {benefits.map((benefit, index) => (
                  <motion.div
                    key={index}
                    initial={{ opacity: 0, y: 10 }}
                    whileInView={{ opacity: 1, y: 0 }}
                    transition={{ delay: index * 0.1 }}
                    viewport={{ once: true }}
                    className="flex items-start gap-3 p-4 bg-white/5 border border-white/5 rounded-xl hover:border-white/20 transition-colors hover-glow-card"
                  >
                    <div className="w-10 h-10 bg-gradient-to-br from-primary-500/20 to-secondary-500/20 rounded-lg flex items-center justify-center flex-shrink-0">
                      <benefit.icon className="w-5 h-5 text-primary-400" />
                    </div>
                    <div>
                      <p className="font-medium text-white">{benefit.text}</p>
                      <p className="text-sm text-gray-500">{benefit.desc}</p>
                    </div>
                  </motion.div>
                ))}
              </div>
            </motion.div>

            {/* Stats card */}
            <motion.div
              initial={{ opacity: 0, x: 30 }}
              whileInView={{ opacity: 1, x: 0 }}
              viewport={{ once: true }}
              className="relative"
            >
              <div className="absolute inset-0 bg-gradient-to-r from-primary-500/20 to-secondary-500/20 rounded-3xl blur-2xl" />
              <div className="relative bg-gradient-to-br from-gray-900 to-gray-800 border border-white/10 rounded-3xl p-8 overflow-hidden">
                {/* Background pattern */}
                <div className="absolute inset-0 opacity-10" style={{
                  backgroundImage: `radial-gradient(circle at 2px 2px, white 1px, transparent 0)`,
                  backgroundSize: '20px 20px'
                }} />
                
                <div className="relative text-center mb-8">
                  <motion.p
                    initial={{ scale: 0.5 }}
                    whileInView={{ scale: 1 }}
                    viewport={{ once: true }}
                    className="text-7xl font-bold text-transparent bg-clip-text bg-gradient-to-r from-primary-400 via-secondary-400 to-accent-400 mb-2"
                  >
                    40%
                  </motion.p>
                  <p className="text-xl text-white">Tăng hiệu quả học tập</p>
                  <p className="text-gray-500">So với phương pháp truyền thống</p>
                </div>
                
                <div className="grid grid-cols-2 gap-4">
                  {[
                    { value: '10K+', label: 'Học sinh tin dùng', icon: AcademicCapIcon },
                    { value: '50K+', label: 'Bài học AI', icon: BookOpenIcon },
                    { value: '100K+', label: 'Quiz đã làm', icon: SparklesIcon },
                    { value: '4.9⭐', label: 'Đánh giá TB', icon: FireIcon },
                  ].map((item, i) => (
                    <div key={i} className="bg-white/5 border border-white/5 rounded-xl p-4 text-center hover:bg-white/10 transition-colors hover-glow-card">
                      <item.icon className="w-6 h-6 text-primary-400 mx-auto mb-2" />
                      <p className="text-2xl font-bold text-white">{item.value}</p>
                      <p className="text-xs text-gray-500">{item.label}</p>
                    </div>
                  ))}
                </div>
              </div>
            </motion.div>
          </div>
        </div>
      </section>

      {/* CTA Section */}
      <section className="relative py-24 overflow-hidden">
        <div className="absolute inset-0 bg-gradient-to-r from-primary-600/20 via-secondary-600/20 to-accent-600/20" />
        <TechGrid />
        
        <div className="relative max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
          <motion.div
            initial={{ opacity: 0, y: 30 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
          >
            <div className="inline-flex items-center justify-center w-20 h-20 bg-gradient-to-br from-primary-500 to-secondary-500 rounded-2xl mb-8">
              <RocketLaunchIcon className="w-10 h-10 text-white" />
            </div>
            
            <h2 className="text-3xl sm:text-4xl lg:text-5xl font-display font-bold text-white mb-6">
              Sẵn sàng <span className="text-transparent bg-clip-text bg-gradient-to-r from-primary-400 to-secondary-400">nâng cấp</span> việc học?
            </h2>
            <p className="text-lg text-gray-400 mb-8 max-w-2xl mx-auto">
              Tham gia cùng hơn 10,000 học sinh đang sử dụng AI để học tập hiệu quả hơn mỗi ngày
            </p>
            
            <div className="flex flex-wrap justify-center gap-4">
              <Link 
                to="/register" 
                className="group px-8 py-4 bg-gradient-to-r from-primary-500 to-secondary-500 rounded-xl font-semibold text-lg hover:shadow-lg hover:shadow-primary-500/25 transition-all btn-shine hover-glow-card"
              >
                <span className="flex items-center gap-2">
                  Bắt đầu miễn phí
                  <ArrowRightIcon className="w-5 h-5 group-hover:translate-x-1 transition-transform" />
                </span>
              </Link>
              <Link 
                to="/login" 
                className="px-8 py-4 border border-white/20 rounded-xl font-semibold text-lg hover:bg-white/5 transition-colors"
              >
                Đã có tài khoản?
              </Link>
            </div>

            {/* Trust badges */}
            <div className="mt-12 flex items-center justify-center gap-8 text-gray-500 flex-wrap">
              <div className="flex items-center gap-2">
                <CheckCircleIcon className="w-5 h-5 text-green-500" />
                <span className="text-sm">Miễn phí hoàn toàn</span>
              </div>
              <div className="flex items-center gap-2">
                <CheckCircleIcon className="w-5 h-5 text-green-500" />
                <span className="text-sm">Không cần thẻ</span>
              </div>
              <div className="flex items-center gap-2">
                <CheckCircleIcon className="w-5 h-5 text-green-500" />
                <span className="text-sm">Hỗ trợ 24/7</span>
              </div>
            </div>
          </motion.div>
        </div>
      </section>

      {/* Footer */}
      <footer className="bg-black border-t border-white/5 py-12">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex flex-col md:flex-row items-center justify-between gap-6">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 bg-gradient-to-br from-primary-500 to-secondary-500 rounded-xl flex items-center justify-center">
                <AcademicCapIcon className="w-6 h-6 text-white" />
              </div>
              <div>
                <span className="font-display font-bold text-white">Edumentor</span>
                <p className="text-xs text-gray-500">AI-Powered Learning Platform</p>
              </div>
            </div>
            
            <div className="flex items-center gap-6 text-sm text-gray-500">
              <span>© 2026 Edumentor</span>
              <span>•</span>
              <span>Made with ❤️ & AI for Vietnamese Students</span>
              <span>•</span>
              <span>Code by <span className="text-primary-400 font-medium">Cuongdev1108</span></span>
            </div>
          </div>
        </div>
      </footer>
    </div>
  );
};

export default Landing;
