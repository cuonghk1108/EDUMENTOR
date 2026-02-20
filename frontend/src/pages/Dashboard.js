import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { useQuery } from 'react-query';
import { motion } from 'framer-motion';
import { useAuth } from '../context/AuthContext';
import { dashboardAPI } from '../services/api';
import {
  BookOpenIcon,
  CheckCircleIcon,
  QuestionMarkCircleIcon,
  ChartBarIcon,
  ArrowTrendingUpIcon,
  ArrowTrendingDownIcon,
  LightBulbIcon,
  FireIcon,
  RocketLaunchIcon,
  SparklesIcon,
  AcademicCapIcon,
  ChatBubbleLeftRightIcon,
  MapIcon,
  CloudArrowUpIcon,
  PlayCircleIcon,
  ClockIcon,
  BoltIcon
} from '@heroicons/react/24/outline';
import { ResponsiveContainer, AreaChart, Area, XAxis, YAxis, Tooltip, CartesianGrid } from 'recharts';
import DailyMissions from '../components/DailyMissions';
import AchievementBadges from '../components/AchievementBadges';
import WelcomeModal from '../components/WelcomeModal';

// Animated progress ring
const ProgressRing = ({ progress, size = 80, strokeWidth = 8, color = '#a855f7' }) => {
  const radius = (size - strokeWidth) / 2;
  const circumference = radius * 2 * Math.PI;
  const offset = circumference - (progress / 100) * circumference;

  return (
    <div className="relative" style={{ width: size, height: size }}>
      <svg className="transform -rotate-90" width={size} height={size}>
        <circle
          cx={size / 2}
          cy={size / 2}
          r={radius}
          stroke="rgba(255,255,255,0.1)"
          strokeWidth={strokeWidth}
          fill="none"
        />
        <motion.circle
          cx={size / 2}
          cy={size / 2}
          r={radius}
          stroke={color}
          strokeWidth={strokeWidth}
          fill="none"
          strokeLinecap="round"
          initial={{ strokeDashoffset: circumference }}
          animate={{ strokeDashoffset: offset }}
          transition={{ duration: 1.5, ease: "easeOut" }}
          style={{ strokeDasharray: circumference }}
        />
      </svg>
      <div className="absolute inset-0 flex items-center justify-center">
        <span className="text-xl font-bold text-white">{progress}%</span>
      </div>
    </div>
  );
};

// Quick action button
const QuickActionButton = ({ to, icon: Icon, label, gradient, delay }) => {
  return (
    <motion.div
      initial={{ opacity: 0, scale: 0.8 }}
      animate={{ opacity: 1, scale: 1 }}
      transition={{ delay, type: "spring", stiffness: 200 }}
      whileHover={{ scale: 1.05, y: -3 }}
      whileTap={{ scale: 0.95 }}
    >
      <Link
        to={to}
        className={`flex flex-col items-center gap-3 p-5 rounded-2xl bg-gradient-to-br ${gradient} 
          text-white shadow-lg hover:shadow-xl transition-all duration-300 btn-shine hover-glow-card`}
      >
        <div className="w-12 h-12 rounded-xl bg-white/20 backdrop-blur flex items-center justify-center">
          <Icon className="w-6 h-6" />
        </div>
        <span className="font-medium text-sm">{label}</span>
      </Link>
    </motion.div>
  );
};

const Dashboard = () => {
  const { user } = useAuth();
  const [currentTime, setCurrentTime] = useState(new Date());
  const [showWelcome, setShowWelcome] = useState(false);
  
  useEffect(() => {
    const timer = setInterval(() => setCurrentTime(new Date()), 60000);
    return () => clearInterval(timer);
  }, []);

  // Check if user should see welcome modal (new users only)
  useEffect(() => {
    const hasSeenWelcome = localStorage.getItem('hasSeenWelcome');
    if (!hasSeenWelcome) {
      setShowWelcome(true);
    }
  }, []);

  const handleCloseWelcome = () => {
    setShowWelcome(false);
    localStorage.setItem('hasSeenWelcome', 'true');
  };

  const getGreeting = () => {
    const hour = currentTime.getHours();
    if (hour < 12) return 'Chào buổi sáng';
    if (hour < 18) return 'Chào buổi chiều';
    return 'Chào buổi tối';
  };

  const quotes = [
    '"Học, học nữa, học mãi" - V.I. Lenin',
    '"Giáo dục là vũ khí mạnh nhất để thay đổi thế giới" - Nelson Mandela',
    '"Đầu tư vào kiến thức mang lại lợi nhuận tốt nhất" - Benjamin Franklin',
  ];
  const [quote] = useState(quotes[Math.floor(Math.random() * quotes.length)]);
  
  const { data, isLoading, error } = useQuery(
    ['dashboard', user?.id],
    () => dashboardAPI.get(user.id).then(res => res.data.dashboard),
    { enabled: !!user?.id }
  );

  if (isLoading) {
    return (
      <div className="flex flex-col items-center justify-center h-[60vh] gap-4">
        <motion.div
          animate={{ rotate: 360 }}
          transition={{ duration: 2, repeat: Infinity, ease: "linear" }}
          className="w-16 h-16 border-4 border-purple-500/20 border-t-purple-500 rounded-full"
        />
        <p className="text-gray-400 font-mono">Đang tải dữ liệu...</p>
      </div>
    );
  }

  if (error) {
    return (
      <div className="text-center py-12">
        <p className="text-red-400">Lỗi tải dữ liệu. Vui lòng thử lại.</p>
      </div>
    );
  }

  const dashboard = data || {
    overview: {
      totalLessons: 0,
      completedLessons: 0,
      completionRate: 0,
      totalQuizzes: 0,
      averageScore: 0,
      streakDays: 0
    },
    performance: { accuracy: 0 },
    engagement: {
      totalMessages: 0,
      perfectScores: 0,
      earlyMorningStudies: 0,
      lateNightStudies: 0
    },
    today: {
      lessonsCompleted: 0,
      quizzesCompleted: 0,
      chatMessages: 0,
      highestScore: 0
    },
    weaknesses: [],
    strengths: [],
    recentActivity: { lessons: [], quizzes: [] }
  };

  const { overview, performance, engagement, today, weaknesses, strengths, recentActivity } = dashboard;

  // Prepare user stats for engagement components
  const userStats = {
    // Overall stats for achievements
    completedLessons: overview.completedLessons,
    completedQuizzes: overview.totalQuizzes,
    streakDays: overview.streakDays,
    totalMessages: engagement?.totalMessages || 0,
    averageScore: overview.averageScore,
    perfectScores: engagement?.perfectScores || 0,
    earlyMorningStudies: engagement?.earlyMorningStudies || 0,
    lateNightStudies: engagement?.lateNightStudies || 0,
    // Today's stats for daily missions
    todayLessons: today?.lessonsCompleted || 0,
    todayQuizzes: today?.quizzesCompleted || 0,
    todayChats: today?.chatMessages || 0,
    highestScoreToday: today?.highestScore || 0,
    lastActivity: new Date().toISOString().split('T')[0] // Today's date
  };

  const weeklyData = [
    { name: 'T2', lessons: 2, quizzes: 1 },
    { name: 'T3', lessons: 3, quizzes: 2 },
    { name: 'T4', lessons: 1, quizzes: 0 },
    { name: 'T5', lessons: 4, quizzes: 3 },
    { name: 'T6', lessons: 2, quizzes: 1 },
    { name: 'T7', lessons: 5, quizzes: 2 },
    { name: 'CN', lessons: 3, quizzes: 1 },
  ];

  return (
    <div className="relative p-6 space-y-8 overflow-hidden">
      <div className="app-ambient-bg opacity-80" />

      {/* Hero Header */}
      <motion.div
        initial={{ opacity: 0, y: -20 }}
        animate={{ opacity: 1, y: 0 }}
        className="relative z-10 overflow-hidden rounded-3xl bg-gradient-to-br from-gray-900 via-purple-900/50 to-gray-900 p-8 border border-white/10 hover-glow-card"
      >
        {/* Animated grid */}
        <div className="absolute inset-0 opacity-10">
          <div className="absolute inset-0" style={{
            backgroundImage: `linear-gradient(rgba(255,255,255,.1) 1px, transparent 1px), 
                             linear-gradient(90deg, rgba(255,255,255,.1) 1px, transparent 1px)`,
            backgroundSize: '50px 50px'
          }} />
        </div>
        
        {/* Glow orbs */}
        <div className="absolute top-0 right-1/4 w-64 h-64 bg-purple-500/20 rounded-full blur-3xl" />
        <div className="absolute bottom-0 left-1/4 w-64 h-64 bg-pink-500/20 rounded-full blur-3xl" />

        <div className="relative z-10">
          <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-6">
            <div>
              <motion.div
                initial={{ opacity: 0, x: -20 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ delay: 0.2 }}
                className="flex items-center gap-2 text-purple-400 text-sm font-medium mb-2"
              >
                <SparklesIcon className="w-4 h-4" />
                <span>{currentTime.toLocaleDateString('vi-VN', { weekday: 'long', day: 'numeric', month: 'long' })}</span>
              </motion.div>
              
              <h1 className="text-3xl md:text-4xl font-display font-bold text-white mb-2">
                {getGreeting()}, <span className="text-transparent bg-clip-text bg-gradient-to-r from-purple-400 to-pink-400">{user?.name?.split(' ').pop()}</span>! 
                <motion.span
                  animate={{ rotate: [0, 20, 0] }}
                  transition={{ duration: 0.5, repeat: Infinity, repeatDelay: 2 }}
                  className="inline-block ml-2"
                >
                  👋
                </motion.span>
              </h1>
              
              <p className="text-gray-400 text-sm md:text-base italic">{quote}</p>
            </div>

            <motion.div
              initial={{ opacity: 0, scale: 0.8 }}
              animate={{ opacity: 1, scale: 1 }}
              transition={{ delay: 0.3, type: "spring" }}
            >
              <Link
                to="/upload"
                className="inline-flex items-center gap-2 px-6 py-3 bg-gradient-to-r from-purple-500 to-pink-500 
                  rounded-xl text-white font-medium hover:shadow-lg hover:shadow-purple-500/25 
                  transition-all duration-300 group"
              >
                <RocketLaunchIcon className="w-5 h-5 group-hover:animate-bounce" />
                <span>Bắt đầu học ngay</span>
              </Link>
            </motion.div>
          </div>

          {/* Mini Stats Row */}
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mt-8">
            {[
              { label: 'Bài học', value: overview.totalLessons, icon: BookOpenIcon, color: 'text-purple-400' },
              { label: 'Quiz', value: overview.totalQuizzes, icon: QuestionMarkCircleIcon, color: 'text-pink-400' },
              { label: 'Streak', value: `${overview.streakDays} ngày`, icon: FireIcon, color: 'text-orange-400', pulse: overview.streakDays > 0 },
              { label: 'Điểm TB', value: `${overview.averageScore}%`, icon: ChartBarIcon, color: 'text-green-400', pulse: overview.averageScore >= 80 },
            ].map((stat, index) => (
              <motion.div
                key={stat.label}
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.4 + index * 0.1 }}
                className="flex items-center gap-3 bg-white/5 backdrop-blur-sm rounded-xl p-3 border border-white/10"
              >
                <stat.icon className={`w-5 h-5 ${stat.color} ${stat.pulse ? 'xp-pulse' : ''}`} />
                <div>
                  <p className={`text-2xl font-bold text-white ${stat.pulse ? 'xp-pulse' : ''}`}>{stat.value}</p>
                  <p className="text-xs text-gray-400">{stat.label}</p>
                </div>
              </motion.div>
            ))}
          </div>
        </div>
      </motion.div>

      {/* Quick Actions Grid */}
      <div className="relative z-10">
        <motion.h2
          initial={{ opacity: 0, x: -20 }}
          animate={{ opacity: 1, x: 0 }}
          className="text-lg font-semibold text-white mb-4 flex items-center gap-2"
        >
          <BoltIcon className="w-5 h-5 text-yellow-400" />
          Truy cập nhanh
        </motion.h2>
        <div className="grid grid-cols-3 md:grid-cols-6 gap-4">
          <QuickActionButton to="/upload" icon={CloudArrowUpIcon} label="Upload SGK" gradient="from-purple-500 to-purple-600" delay={0.1} />
          <QuickActionButton to="/lessons" icon={BookOpenIcon} label="Bài học" gradient="from-pink-500 to-pink-600" delay={0.15} />
          <QuickActionButton to="/quiz" icon={QuestionMarkCircleIcon} label="Làm Quiz" gradient="from-violet-500 to-violet-600" delay={0.2} />
          <QuickActionButton to="/chat" icon={ChatBubbleLeftRightIcon} label="Hỏi đáp AI" gradient="from-cyan-500 to-cyan-600" delay={0.25} />
          <QuickActionButton to="/roadmap" icon={MapIcon} label="Lộ trình" gradient="from-orange-500 to-orange-600" delay={0.3} />
          <QuickActionButton to="/study-plan" icon={AcademicCapIcon} label="Ôn thi" gradient="from-green-500 to-green-600" delay={0.35} />
        </div>
      </div>

      {/* Engagement Section - Daily Missions & Achievements */}
      <div className="grid lg:grid-cols-2 gap-6 relative z-10">
        <motion.div
          initial={{ opacity: 0, x: -20 }}
          animate={{ opacity: 1, x: 0 }}
          transition={{ delay: 0.4 }}
        >
          <DailyMissions userStats={userStats} />
        </motion.div>
        <motion.div
          initial={{ opacity: 0, x: 20 }}
          animate={{ opacity: 1, x: 0 }}
          transition={{ delay: 0.5 }}
        >
          <AchievementBadges userStats={userStats} />
        </motion.div>
      </div>

      {/* Main Stats Grid */}
      <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-6">
        {/* Progress Card */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.2 }}
          className="bg-gray-900/50 border border-white/5 rounded-2xl p-6 hover:border-purple-500/30 transition-all"
        >
          <div className="flex items-center justify-between mb-4">
            <div>
              <p className="text-sm text-gray-400 font-medium">Tiến độ học</p>
              <p className="text-3xl font-bold text-white mt-1">
                {overview.completedLessons}/{overview.totalLessons}
              </p>
              <p className="text-xs text-purple-400 mt-1">bài đã hoàn thành</p>
            </div>
            <ProgressRing progress={overview.completionRate} color="#a855f7" />
          </div>
          <Link to="/lessons" className="text-sm text-purple-400 hover:text-purple-300 font-medium flex items-center gap-1">
            Xem chi tiết <PlayCircleIcon className="w-4 h-4" />
          </Link>
        </motion.div>

        {/* Quiz Performance */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.3 }}
          className="bg-gray-900/50 border border-white/5 rounded-2xl p-6 hover:border-pink-500/30 transition-all"
        >
          <div className="flex items-center justify-between mb-4">
            <div>
              <p className="text-sm text-gray-400 font-medium">Quiz đã làm</p>
              <p className="text-3xl font-bold text-white mt-1">{overview.totalQuizzes}</p>
              <p className="text-xs text-pink-400 mt-1">Điểm TB: {overview.averageScore}%</p>
            </div>
            <div className="w-14 h-14 rounded-2xl bg-gradient-to-br from-pink-500 to-pink-600 flex items-center justify-center shadow-lg shadow-pink-500/25">
              <QuestionMarkCircleIcon className="w-7 h-7 text-white" />
            </div>
          </div>
          <Link to="/quiz" className="text-sm text-pink-400 hover:text-pink-300 font-medium flex items-center gap-1">
            Làm quiz mới <PlayCircleIcon className="w-4 h-4" />
          </Link>
        </motion.div>

        {/* Accuracy */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.4 }}
          className="bg-gray-900/50 border border-white/5 rounded-2xl p-6 hover:border-green-500/30 transition-all"
        >
          <div className="flex items-center justify-between mb-4">
            <div>
              <p className="text-sm text-gray-400 font-medium">Độ chính xác</p>
              <p className="text-3xl font-bold text-white mt-1">{performance.accuracy}%</p>
              <div className="flex items-center gap-1 mt-1">
                {performance.accuracy >= 70 ? (
                  <>
                    <ArrowTrendingUpIcon className="w-4 h-4 text-green-400" />
                    <p className="text-xs text-green-400">Tốt lắm!</p>
                  </>
                ) : (
                  <>
                    <ArrowTrendingDownIcon className="w-4 h-4 text-yellow-400" />
                    <p className="text-xs text-yellow-400">Cần cải thiện</p>
                  </>
                )}
              </div>
            </div>
            <div className="w-14 h-14 rounded-2xl bg-gradient-to-br from-green-500 to-emerald-500 flex items-center justify-center shadow-lg shadow-green-500/25">
              <ChartBarIcon className="w-7 h-7 text-white" />
            </div>
          </div>
        </motion.div>

        {/* Streak */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.5 }}
          className="bg-gray-900/50 border border-white/5 rounded-2xl p-6 hover:border-orange-500/30 transition-all"
        >
          <div className="flex items-center justify-between mb-4">
            <div>
              <p className="text-sm text-gray-400 font-medium">Chuỗi học tập</p>
              <p className="text-3xl font-bold text-white mt-1">{overview.streakDays} ngày</p>
              <div className="flex items-center gap-1 mt-1">
                <motion.span
                  animate={{ scale: [1, 1.2, 1] }}
                  transition={{ duration: 0.5, repeat: Infinity, repeatDelay: 1 }}
                  className="text-lg"
                >
                  🔥
                </motion.span>
                <p className="text-xs text-orange-400">Tiếp tục cố gắng!</p>
              </div>
            </div>
            <div className="w-14 h-14 rounded-2xl bg-gradient-to-br from-orange-500 to-red-500 flex items-center justify-center shadow-lg shadow-orange-500/25">
              <FireIcon className="w-7 h-7 text-white" />
            </div>
          </div>
        </motion.div>
      </div>

      {/* Charts and Analysis Row */}
      <div className="grid lg:grid-cols-3 gap-6">
        {/* Weekly Progress Chart */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.6 }}
          className="lg:col-span-2 bg-gray-900/50 border border-white/5 rounded-2xl p-6"
        >
          <h3 className="text-lg font-semibold text-white mb-4 flex items-center gap-2">
            <ChartBarIcon className="w-5 h-5 text-cyan-400" />
            Tiến độ tuần này
          </h3>
          <div className="h-64">
            <ResponsiveContainer width="100%" height="100%">
              <AreaChart data={weeklyData}>
                <defs>
                  <linearGradient id="colorLessons" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="5%" stopColor="#a855f7" stopOpacity={0.3}/>
                    <stop offset="95%" stopColor="#a855f7" stopOpacity={0}/>
                  </linearGradient>
                  <linearGradient id="colorQuizzes" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="5%" stopColor="#22c55e" stopOpacity={0.3}/>
                    <stop offset="95%" stopColor="#22c55e" stopOpacity={0}/>
                  </linearGradient>
                </defs>
                <CartesianGrid strokeDasharray="3 3" stroke="rgba(255,255,255,0.1)" />
                <XAxis dataKey="name" tick={{ fill: '#9ca3af', fontSize: 12 }} />
                <YAxis tick={{ fill: '#9ca3af', fontSize: 12 }} />
                <Tooltip
                  contentStyle={{
                    backgroundColor: 'rgba(17,24,39,0.9)',
                    border: '1px solid rgba(255,255,255,0.1)',
                    borderRadius: '12px',
                    color: '#fff'
                  }}
                />
                <Area type="monotone" dataKey="lessons" stroke="#a855f7" strokeWidth={2} fillOpacity={1} fill="url(#colorLessons)" name="Bài học" />
                <Area type="monotone" dataKey="quizzes" stroke="#22c55e" strokeWidth={2} fillOpacity={1} fill="url(#colorQuizzes)" name="Quiz" />
              </AreaChart>
            </ResponsiveContainer>
          </div>
          <div className="flex justify-center gap-6 mt-4">
            <div className="flex items-center gap-2">
              <div className="w-3 h-3 bg-purple-500 rounded-full" />
              <span className="text-sm text-gray-400">Bài học</span>
            </div>
            <div className="flex items-center gap-2">
              <div className="w-3 h-3 bg-green-500 rounded-full" />
              <span className="text-sm text-gray-400">Quiz</span>
            </div>
          </div>
        </motion.div>

        {/* Strengths & Weaknesses */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.7 }}
          className="bg-gray-900/50 border border-white/5 rounded-2xl p-6"
        >
          <h3 className="text-lg font-semibold text-white mb-4 flex items-center gap-2">
            <LightBulbIcon className="w-5 h-5 text-yellow-400" />
            Phân tích năng lực
          </h3>
          
          {weaknesses.length > 0 || strengths.length > 0 ? (
            <div className="space-y-6">
              {weaknesses.length > 0 && (
                <div>
                  <p className="text-sm font-medium text-red-400 mb-3 flex items-center gap-2">
                    <ArrowTrendingDownIcon className="w-4 h-4" />
                    Cần cải thiện
                  </p>
                  <div className="space-y-3">
                    {weaknesses.slice(0, 3).map((topic, index) => (
                      <div key={index}>
                        <div className="flex items-center justify-between mb-1">
                          <span className="text-sm text-gray-300">{topic.name}</span>
                          <span className="text-sm font-medium text-red-400">{topic.score}%</span>
                        </div>
                        <div className="w-full bg-white/10 rounded-full h-2">
                          <motion.div 
                            initial={{ width: 0 }}
                            animate={{ width: `${topic.score}%` }}
                            transition={{ duration: 1, delay: 0.5 + index * 0.1 }}
                            className="bg-red-400 h-2 rounded-full"
                          />
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              )}

              {strengths.length > 0 && (
                <div>
                  <p className="text-sm font-medium text-green-400 mb-3 flex items-center gap-2">
                    <ArrowTrendingUpIcon className="w-4 h-4" />
                    Điểm mạnh
                  </p>
                  <div className="space-y-3">
                    {strengths.slice(0, 3).map((topic, index) => (
                      <div key={index}>
                        <div className="flex items-center justify-between mb-1">
                          <span className="text-sm text-gray-300">{topic.name}</span>
                          <span className="text-sm font-medium text-green-400">{topic.score}%</span>
                        </div>
                        <div className="w-full bg-white/10 rounded-full h-2">
                          <motion.div 
                            initial={{ width: 0 }}
                            animate={{ width: `${topic.score}%` }}
                            transition={{ duration: 1, delay: 0.5 + index * 0.1 }}
                            className="bg-green-400 h-2 rounded-full"
                          />
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              )}
            </div>
          ) : (
            <div className="flex flex-col items-center justify-center h-48 text-gray-500">
              <motion.div
                animate={{ scale: [1, 1.1, 1], rotate: [0, 5, -5, 0] }}
                transition={{ duration: 2, repeat: Infinity }}
              >
                <LightBulbIcon className="w-12 h-12 mb-3 text-yellow-400" />
              </motion.div>
              <p className="text-sm text-center text-gray-400">Làm thêm quiz để<br />xem phân tích chi tiết</p>
            </div>
          )}

          <Link 
            to="/roadmap" 
            className="w-full mt-4 px-4 py-2 bg-white/5 border border-white/10 rounded-xl text-gray-300 hover:bg-white/10 transition-colors flex items-center justify-center gap-2 text-sm"
          >
            <MapIcon className="w-4 h-4" />
            Xem lộ trình học
          </Link>
        </motion.div>
      </div>

      {/* Recent Activity */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.8 }}
        className="bg-gray-900/50 border border-white/5 rounded-2xl p-6"
      >
        <div className="flex items-center justify-between mb-6">
          <h3 className="text-lg font-semibold text-white flex items-center gap-2">
            <ClockIcon className="w-5 h-5 text-purple-400" />
            Hoạt động gần đây
          </h3>
          <Link to="/lessons" className="text-sm text-purple-400 hover:text-purple-300 font-medium">
            Xem tất cả →
          </Link>
        </div>
        
        <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-4">
          {recentActivity.lessons.length > 0 || recentActivity.quizzes.length > 0 ? (
            <>
              {recentActivity.lessons.slice(0, 3).map((lesson, index) => (
                <motion.div
                  key={lesson.id}
                  initial={{ opacity: 0, x: -20 }}
                  animate={{ opacity: 1, x: 0 }}
                  transition={{ delay: 0.9 + index * 0.1 }}
                >
                  <Link
                    to={`/lessons/${lesson.id}`}
                    className="flex items-center gap-4 p-4 rounded-xl bg-white/5 hover:bg-white/10 
                      border border-white/10 hover:border-purple-500/30 transition-all duration-300"
                  >
                    <div className="w-12 h-12 rounded-xl bg-gradient-to-br from-purple-500 to-pink-500 
                      flex items-center justify-center shadow-lg shadow-purple-500/25">
                      <BookOpenIcon className="w-6 h-6 text-white" />
                    </div>
                    <div className="flex-1 min-w-0">
                      <p className="font-medium text-white truncate">{lesson.title}</p>
                      <p className="text-sm text-gray-400">{lesson.subject}</p>
                    </div>
                    {lesson.completed && (
                      <CheckCircleIcon className="w-6 h-6 text-green-400 flex-shrink-0" />
                    )}
                  </Link>
                </motion.div>
              ))}

              {recentActivity.quizzes.slice(0, 2).map((quiz, index) => (
                <motion.div
                  key={quiz.id}
                  initial={{ opacity: 0, x: -20 }}
                  animate={{ opacity: 1, x: 0 }}
                  transition={{ delay: 1 + index * 0.1 }}
                >
                  <Link
                    to={`/quiz/${quiz.id}`}
                    className="flex items-center gap-4 p-4 rounded-xl bg-white/5 hover:bg-white/10 
                      border border-white/10 hover:border-pink-500/30 transition-all duration-300"
                  >
                    <div className="w-12 h-12 rounded-xl bg-gradient-to-br from-pink-500 to-rose-500 
                      flex items-center justify-center shadow-lg shadow-pink-500/25">
                      <QuestionMarkCircleIcon className="w-6 h-6 text-white" />
                    </div>
                    <div className="flex-1 min-w-0">
                      <p className="font-medium text-white truncate">{quiz.topic}</p>
                      <p className="text-sm text-gray-400">{quiz.totalQuestions} câu hỏi</p>
                    </div>
                  </Link>
                </motion.div>
              ))}
            </>
          ) : (
            <div className="col-span-full flex flex-col items-center justify-center py-12">
              <motion.div
                animate={{ y: [0, -10, 0] }}
                transition={{ duration: 2, repeat: Infinity }}
              >
                <RocketLaunchIcon className="w-16 h-16 mb-4 text-purple-400" />
              </motion.div>
              <p className="text-lg font-medium text-white mb-2">Chưa có hoạt động nào</p>
              <p className="text-sm text-gray-400 text-center mb-4">Hãy upload SGK và bắt đầu hành trình học tập!</p>
              <Link 
                to="/upload" 
                className="px-6 py-3 bg-gradient-to-r from-purple-500 to-pink-500 rounded-xl text-white font-medium hover:shadow-lg hover:shadow-purple-500/25 transition-all flex items-center gap-2"
              >
                <CloudArrowUpIcon className="w-5 h-5" />
                Upload SGK ngay
              </Link>
            </div>
          )}
        </div>
      </motion.div>

      {/* AI Tip */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 1.1 }}
        className="relative overflow-hidden rounded-2xl bg-gradient-to-r from-purple-600 via-pink-600 to-cyan-600 p-6"
      >
        <div className="absolute inset-0 opacity-20">
          <div className="absolute inset-0" style={{
            backgroundImage: `radial-gradient(circle at 20% 50%, rgba(255,255,255,0.3) 0%, transparent 50%),
                             radial-gradient(circle at 80% 50%, rgba(255,255,255,0.2) 0%, transparent 50%)`
          }} />
        </div>
        
        <div className="relative flex flex-col md:flex-row items-center gap-4">
          <motion.div
            animate={{ rotate: [0, 360] }}
            transition={{ duration: 20, repeat: Infinity, ease: "linear" }}
            className="w-14 h-14 rounded-2xl bg-white/20 backdrop-blur flex items-center justify-center flex-shrink-0"
          >
            <SparklesIcon className="w-7 h-7 text-white" />
          </motion.div>
          <div className="flex-1 text-center md:text-left">
            <p className="font-semibold text-lg text-white mb-1">💡 Mẹo học tập từ AI</p>
            <p className="text-white/80 text-sm">
              Ôn tập lại kiến thức đã học trong vòng 24 giờ sẽ giúp bạn ghi nhớ lâu hơn 80%. 
              Hãy dành 15-20 phút mỗi ngày để ôn lại bài nhé!
            </p>
          </div>
          <Link 
            to="/chat" 
            className="px-4 py-2 bg-white/20 backdrop-blur hover:bg-white/30 rounded-xl text-white font-medium transition-colors flex-shrink-0"
          >
            Hỏi AI
          </Link>
        </div>
      </motion.div>

      {/* Welcome Modal for new users */}
      <WelcomeModal isOpen={showWelcome} onClose={handleCloseWelcome} userName={user?.name} />
    </div>
  );
};

export default Dashboard;
