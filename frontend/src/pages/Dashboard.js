import React from 'react';
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
  FireIcon
} from '@heroicons/react/24/outline';
import { PieChart, Pie, Cell, ResponsiveContainer, BarChart, Bar, XAxis, YAxis, Tooltip } from 'recharts';

const Dashboard = () => {
  const { user } = useAuth();
  
  const { data, isLoading, error } = useQuery(
    ['dashboard', user?.id],
    () => dashboardAPI.get(user.id).then(res => res.data.dashboard),
    { enabled: !!user?.id }
  );

  if (isLoading) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="loading-dots text-primary-600">
          <span></span>
          <span></span>
          <span></span>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="text-center py-12">
        <p className="text-red-500">Lỗi tải dữ liệu. Vui lòng thử lại.</p>
      </div>
    );
  }

  // Default data if no data yet
  const dashboard = data || {
    overview: {
      totalLessons: 0,
      completedLessons: 0,
      completionRate: 0,
      totalQuizzes: 0,
      averageScore: 0,
      streakDays: 0
    },
    performance: {
      accuracy: 0
    },
    weaknesses: [],
    strengths: [],
    recentActivity: {
      lessons: [],
      quizzes: []
    }
  };

  const { overview, performance, weaknesses, strengths, recentActivity } = dashboard;

  // Chart data
  const performanceData = [
    { name: 'Đúng', value: performance.accuracy },
    { name: 'Sai', value: 100 - performance.accuracy }
  ];

  const COLORS = ['#22c55e', '#ef4444'];

  return (
    <div className="space-y-8">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-display font-bold text-gray-900">
            Xin chào, {user?.name?.split(' ').pop()}! 👋
          </h1>
          <p className="text-gray-600 mt-1">Hôm nay bạn muốn học gì?</p>
        </div>
        <Link to="/upload" className="btn-primary">
          Upload SGK mới
        </Link>
      </div>

      {/* Quick Stats */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.1 }}
          className="card"
        >
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-gray-500">Bài học</p>
              <p className="text-3xl font-bold text-gray-900 mt-1">
                {overview.completedLessons}/{overview.totalLessons}
              </p>
            </div>
            <div className="w-12 h-12 bg-primary-100 rounded-xl flex items-center justify-center">
              <BookOpenIcon className="w-6 h-6 text-primary-600" />
            </div>
          </div>
          <div className="mt-4">
            <div className="w-full bg-gray-200 rounded-full h-2">
              <div 
                className="bg-primary-600 h-2 rounded-full transition-all duration-500"
                style={{ width: `${overview.completionRate}%` }}
              />
            </div>
            <p className="text-xs text-gray-500 mt-1">{overview.completionRate}% hoàn thành</p>
          </div>
        </motion.div>

        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.2 }}
          className="card"
        >
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-gray-500">Quiz đã làm</p>
              <p className="text-3xl font-bold text-gray-900 mt-1">{overview.totalQuizzes}</p>
            </div>
            <div className="w-12 h-12 bg-secondary-100 rounded-xl flex items-center justify-center">
              <QuestionMarkCircleIcon className="w-6 h-6 text-secondary-600" />
            </div>
          </div>
          <div className="flex items-center gap-2 mt-4">
            <CheckCircleIcon className="w-4 h-4 text-green-500" />
            <p className="text-sm text-gray-600">Điểm TB: {overview.averageScore}%</p>
          </div>
        </motion.div>

        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.3 }}
          className="card"
        >
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-gray-500">Độ chính xác</p>
              <p className="text-3xl font-bold text-gray-900 mt-1">{performance.accuracy}%</p>
            </div>
            <div className="w-12 h-12 bg-green-100 rounded-xl flex items-center justify-center">
              <ChartBarIcon className="w-6 h-6 text-green-600" />
            </div>
          </div>
          <div className="flex items-center gap-2 mt-4">
            {performance.accuracy >= 70 ? (
              <>
                <ArrowTrendingUpIcon className="w-4 h-4 text-green-500" />
                <p className="text-sm text-green-600">Tốt lắm!</p>
              </>
            ) : (
              <>
                <ArrowTrendingDownIcon className="w-4 h-4 text-yellow-500" />
                <p className="text-sm text-yellow-600">Cần cải thiện</p>
              </>
            )}
          </div>
        </motion.div>

        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.4 }}
          className="card"
        >
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-gray-500">Streak</p>
              <p className="text-3xl font-bold text-gray-900 mt-1">{overview.streakDays} ngày</p>
            </div>
            <div className="w-12 h-12 bg-orange-100 rounded-xl flex items-center justify-center">
              <FireIcon className="w-6 h-6 text-orange-600" />
            </div>
          </div>
          <div className="flex items-center gap-2 mt-4">
            <span className="text-lg">🔥</span>
            <p className="text-sm text-gray-600">Tiếp tục cố gắng!</p>
          </div>
        </motion.div>
      </div>

      {/* Main Content */}
      <div className="grid lg:grid-cols-3 gap-8">
        {/* Performance Chart */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.5 }}
          className="card"
        >
          <h3 className="text-lg font-semibold text-gray-900 mb-4">Hiệu suất làm bài</h3>
          <div className="h-48">
            <ResponsiveContainer width="100%" height="100%">
              <PieChart>
                <Pie
                  data={performanceData}
                  cx="50%"
                  cy="50%"
                  innerRadius={50}
                  outerRadius={70}
                  dataKey="value"
                >
                  {performanceData.map((entry, index) => (
                    <Cell key={`cell-${index}`} fill={COLORS[index]} />
                  ))}
                </Pie>
              </PieChart>
            </ResponsiveContainer>
          </div>
          <div className="flex justify-center gap-6 mt-4">
            <div className="flex items-center gap-2">
              <div className="w-3 h-3 bg-green-500 rounded-full" />
              <span className="text-sm text-gray-600">Đúng: {performance.accuracy}%</span>
            </div>
            <div className="flex items-center gap-2">
              <div className="w-3 h-3 bg-red-500 rounded-full" />
              <span className="text-sm text-gray-600">Sai: {100 - performance.accuracy}%</span>
            </div>
          </div>
        </motion.div>

        {/* Weaknesses & Strengths */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.6 }}
          className="card"
        >
          <h3 className="text-lg font-semibold text-gray-900 mb-4">Phân tích năng lực</h3>
          
          {weaknesses.length > 0 ? (
            <div className="space-y-4">
              <div>
                <p className="text-sm font-medium text-red-600 mb-2 flex items-center gap-2">
                  <ArrowTrendingDownIcon className="w-4 h-4" />
                  Cần cải thiện
                </p>
                <div className="space-y-2">
                  {weaknesses.slice(0, 3).map((topic, index) => (
                    <div key={index} className="flex items-center justify-between">
                      <span className="text-sm text-gray-600">{topic.name}</span>
                      <span className="text-sm font-medium text-red-600">{topic.score}%</span>
                    </div>
                  ))}
                </div>
              </div>

              {strengths.length > 0 && (
                <div>
                  <p className="text-sm font-medium text-green-600 mb-2 flex items-center gap-2">
                    <ArrowTrendingUpIcon className="w-4 h-4" />
                    Điểm mạnh
                  </p>
                  <div className="space-y-2">
                    {strengths.slice(0, 3).map((topic, index) => (
                      <div key={index} className="flex items-center justify-between">
                        <span className="text-sm text-gray-600">{topic.name}</span>
                        <span className="text-sm font-medium text-green-600">{topic.score}%</span>
                      </div>
                    ))}
                  </div>
                </div>
              )}
            </div>
          ) : (
            <div className="flex flex-col items-center justify-center h-40 text-gray-500">
              <LightBulbIcon className="w-10 h-10 mb-2" />
              <p className="text-sm">Làm thêm quiz để xem phân tích</p>
            </div>
          )}

          <Link to="/roadmap" className="btn-outline w-full mt-4">
            Xem lộ trình học
          </Link>
        </motion.div>

        {/* Recent Activity */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.7 }}
          className="card"
        >
          <h3 className="text-lg font-semibold text-gray-900 mb-4">Hoạt động gần đây</h3>
          
          <div className="space-y-3">
            {recentActivity.lessons.length > 0 || recentActivity.quizzes.length > 0 ? (
              <>
                {recentActivity.lessons.slice(0, 3).map((lesson) => (
                  <Link
                    key={lesson.id}
                    to={`/lessons/${lesson.id}`}
                    className="flex items-center gap-3 p-3 rounded-lg hover:bg-gray-50 transition-colors"
                  >
                    <div className="w-8 h-8 bg-primary-100 rounded-lg flex items-center justify-center">
                      <BookOpenIcon className="w-4 h-4 text-primary-600" />
                    </div>
                    <div className="flex-1 min-w-0">
                      <p className="text-sm font-medium text-gray-900 truncate">{lesson.title}</p>
                      <p className="text-xs text-gray-500">{lesson.subject}</p>
                    </div>
                    {lesson.completed && (
                      <CheckCircleIcon className="w-5 h-5 text-green-500" />
                    )}
                  </Link>
                ))}

                {recentActivity.quizzes.slice(0, 2).map((quiz) => (
                  <Link
                    key={quiz.id}
                    to={`/quiz/${quiz.id}`}
                    className="flex items-center gap-3 p-3 rounded-lg hover:bg-gray-50 transition-colors"
                  >
                    <div className="w-8 h-8 bg-secondary-100 rounded-lg flex items-center justify-center">
                      <QuestionMarkCircleIcon className="w-4 h-4 text-secondary-600" />
                    </div>
                    <div className="flex-1 min-w-0">
                      <p className="text-sm font-medium text-gray-900 truncate">{quiz.topic}</p>
                      <p className="text-xs text-gray-500">{quiz.totalQuestions} câu hỏi</p>
                    </div>
                  </Link>
                ))}
              </>
            ) : (
              <div className="flex flex-col items-center justify-center h-40 text-gray-500">
                <BookOpenIcon className="w-10 h-10 mb-2" />
                <p className="text-sm text-center">Chưa có hoạt động nào<br />Bắt đầu học ngay!</p>
              </div>
            )}
          </div>

          <Link to="/lessons" className="btn-ghost w-full mt-4">
            Xem tất cả bài học
          </Link>
        </motion.div>
      </div>

      {/* Quick Actions */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.8 }}
        className="grid grid-cols-2 md:grid-cols-4 gap-4"
      >
        <Link to="/upload" className="card-hover text-center py-6">
          <div className="w-12 h-12 bg-primary-100 rounded-xl flex items-center justify-center mx-auto mb-3">
            <BookOpenIcon className="w-6 h-6 text-primary-600" />
          </div>
          <p className="font-medium text-gray-900">Upload SGK</p>
        </Link>

        <Link to="/quiz" className="card-hover text-center py-6">
          <div className="w-12 h-12 bg-secondary-100 rounded-xl flex items-center justify-center mx-auto mb-3">
            <QuestionMarkCircleIcon className="w-6 h-6 text-secondary-600" />
          </div>
          <p className="font-medium text-gray-900">Làm Quiz</p>
        </Link>

        <Link to="/chat" className="card-hover text-center py-6">
          <div className="w-12 h-12 bg-accent-100 rounded-xl flex items-center justify-center mx-auto mb-3">
            <LightBulbIcon className="w-6 h-6 text-accent-600" />
          </div>
          <p className="font-medium text-gray-900">Hỏi đáp AI</p>
        </Link>

        <Link to="/roadmap" className="card-hover text-center py-6">
          <div className="w-12 h-12 bg-orange-100 rounded-xl flex items-center justify-center mx-auto mb-3">
            <ChartBarIcon className="w-6 h-6 text-orange-600" />
          </div>
          <p className="font-medium text-gray-900">Lộ trình</p>
        </Link>
      </motion.div>
    </div>
  );
};

export default Dashboard;
