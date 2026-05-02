import React from 'react';
import { Link } from 'react-router-dom';
import { useQuery } from 'react-query';
import { motion } from 'framer-motion';
import { useAuth } from '../context/AuthContext';
import { lessonAPI } from '../services/api';
import { stripLatexForPlainText } from '../utils/latex';
import {
  BookOpenIcon,
  CheckCircleIcon,
  ClockIcon,
  MagnifyingGlassIcon,
  FunnelIcon,
  PlusIcon,
  SparklesIcon,
  DocumentTextIcon,
  ArrowRightIcon
} from '@heroicons/react/24/outline';

const Lessons = () => {
  const { user } = useAuth();
  const [searchTerm, setSearchTerm] = React.useState('');
  const [filterSubject, setFilterSubject] = React.useState('all');

  const { data: lessons = [], isLoading } = useQuery(
    ['lessons', user?.id],
    () => lessonAPI.getAll(user.id).then(res => res.data.lessons),
    { enabled: !!user?.id }
  );

  // Get unique subjects
  const subjects = [...new Set(lessons.map(l => l.subject))];

  // Filter lessons
  const filteredLessons = lessons.filter(lesson => {
    const matchSearch = lesson.title?.toLowerCase().includes(searchTerm.toLowerCase()) ||
                       lesson.subject?.toLowerCase().includes(searchTerm.toLowerCase());
    const matchSubject = filterSubject === 'all' || lesson.subject === filterSubject;
    return matchSearch && matchSubject;
  });

  const subjectColors = {
    'Toán học': 'from-blue-500 to-cyan-500',
    'Vật lý': 'from-purple-500 to-pink-500',
    'Hóa học': 'from-green-500 to-emerald-500',
    'Sinh học': 'from-lime-500 to-green-500',
    'Ngữ văn': 'from-orange-500 to-amber-500',
    'Tiếng Anh': 'from-red-500 to-rose-500',
    'Lịch sử': 'from-yellow-500 to-orange-500',
    'Địa lý': 'from-teal-500 to-cyan-500',
    'default': 'from-primary-500 to-secondary-500'
  };

  const getSubjectColor = (subject) => subjectColors[subject] || subjectColors.default;

  if (isLoading) {
    return (
      <div className="flex flex-col items-center justify-center h-[60vh] gap-4">
        <motion.div
          animate={{ rotate: 360 }}
          transition={{ duration: 2, repeat: Infinity, ease: "linear" }}
          className="w-16 h-16 border-4 border-primary-500/20 border-t-primary-500 rounded-full"
        />
        <p className="text-gray-400">Đang tải bài học...</p>
      </div>
    );
  }

  return (
    <div className="p-6 space-y-6">
      {/* Header */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <h1 className="text-3xl font-display font-bold text-white flex items-center gap-3">
            <div className="w-10 h-10 bg-gradient-to-br from-primary-500 to-secondary-500 rounded-xl flex items-center justify-center">
              <BookOpenIcon className="w-6 h-6 text-white" />
            </div>
            Bài học của tôi
          </h1>
          <p className="text-gray-400 mt-2">
            {lessons.length} bài học • {lessons.filter(l => l.completed).length} đã hoàn thành
          </p>
        </div>
        <Link 
          to="/upload" 
          className="inline-flex items-center gap-2 px-6 py-3 bg-gradient-to-r from-primary-500 to-secondary-500 rounded-xl font-semibold text-white hover:shadow-lg hover:shadow-primary-500/25 transition-all"
        >
          <PlusIcon className="w-5 h-5" />
          Thêm bài học
        </Link>
      </div>

      {/* Search & Filter */}
      <div className="flex flex-col md:flex-row gap-4">
        <div className="relative flex-1">
          <MagnifyingGlassIcon className="w-5 h-5 text-gray-500 absolute left-4 top-1/2 -translate-y-1/2" />
          <input
            type="text"
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            placeholder="Tìm kiếm bài học..."
            className="w-full bg-white/5 border border-white/10 rounded-xl pl-12 pr-4 py-3 text-white placeholder-gray-500 focus:outline-none focus:border-primary-500/50 focus:ring-2 focus:ring-primary-500/20 transition-all"
          />
        </div>
        <div className="relative">
          <FunnelIcon className="w-5 h-5 text-gray-500 absolute left-4 top-1/2 -translate-y-1/2" />
          <select
            value={filterSubject}
            onChange={(e) => setFilterSubject(e.target.value)}
            className="w-full md:w-48 bg-white/5 border border-white/10 rounded-xl pl-12 pr-4 py-3 text-white focus:outline-none focus:border-primary-500/50 focus:ring-2 focus:ring-primary-500/20 transition-all appearance-none"
          >
            <option value="all" className="bg-gray-900">Tất cả môn học</option>
            {subjects.map(subject => (
              <option key={subject} value={subject} className="bg-gray-900">{subject}</option>
            ))}
          </select>
        </div>
      </div>

      {/* Lessons Grid */}
      {filteredLessons.length > 0 ? (
        <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
          {filteredLessons.map((lesson, index) => (
            <motion.div
              key={lesson.id}
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: index * 0.05 }}
            >
              <Link
                to={`/lessons/${lesson.id}`}
                className="group block h-full"
              >
                <div className="h-full bg-gray-900/50 border border-white/5 rounded-2xl p-6 hover:border-white/20 hover:bg-gray-900/80 transition-all duration-300">
                  {/* Subject badge */}
                  <div className="flex items-center justify-between mb-4">
                    <span className={`px-3 py-1 bg-gradient-to-r ${getSubjectColor(lesson.subject)} text-white text-xs font-medium rounded-full`}>
                      {lesson.subject || 'Chưa phân loại'}
                    </span>
                    {lesson.completed && (
                      <div className="flex items-center gap-1 text-green-400">
                        <CheckCircleIcon className="w-5 h-5" />
                      </div>
                    )}
                  </div>

                  {/* Title */}
                  <h3 className="text-lg font-semibold text-white mb-2 line-clamp-2 group-hover:text-primary-400 transition-colors">
                    {lesson.title}
                  </h3>

                  {/* Preview */}
                  <p className="text-sm text-gray-400 line-clamp-2 mb-4">
                    {stripLatexForPlainText(lesson.content || '').slice(0, 100)}...
                  </p>

                  {/* Meta */}
                  <div className="flex items-center justify-between text-sm">
                    <div className="flex items-center gap-4 text-gray-500">
                      <span className="flex items-center gap-1">
                        <ClockIcon className="w-4 h-4" />
                        {new Date(lesson.createdAt).toLocaleDateString('vi-VN')}
                      </span>
                      {lesson.chapter && (
                        <span className="flex items-center gap-1">
                          <DocumentTextIcon className="w-4 h-4" />
                          {lesson.chapter}
                        </span>
                      )}
                    </div>
                    <ArrowRightIcon className="w-4 h-4 text-gray-500 group-hover:text-primary-400 group-hover:translate-x-1 transition-all" />
                  </div>

                  {/* Has audio indicator */}
                  {lesson.hasAudio && (
                    <div className="mt-4 pt-4 border-t border-white/5">
                      <span className="inline-flex items-center gap-2 text-xs text-cyan-400">
                        <SparklesIcon className="w-4 h-4" />
                        Có audio bài giảng
                      </span>
                    </div>
                  )}
                </div>
              </Link>
            </motion.div>
          ))}
        </div>
      ) : (
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          className="text-center py-16"
        >
          <div className="w-20 h-20 bg-white/5 rounded-full flex items-center justify-center mx-auto mb-4">
            <BookOpenIcon className="w-10 h-10 text-gray-500" />
          </div>
          <h3 className="text-xl font-semibold text-white mb-2">
            {searchTerm || filterSubject !== 'all' ? 'Không tìm thấy bài học' : 'Chưa có bài học nào'}
          </h3>
          <p className="text-gray-400 mb-6">
            {searchTerm || filterSubject !== 'all' 
              ? 'Thử tìm kiếm với từ khóa khác' 
              : 'Bắt đầu bằng cách upload sách giáo khoa'}
          </p>
          <Link
            to="/upload"
            className="inline-flex items-center gap-2 px-6 py-3 bg-gradient-to-r from-primary-500 to-secondary-500 rounded-xl font-semibold text-white hover:shadow-lg hover:shadow-primary-500/25 transition-all"
          >
            <PlusIcon className="w-5 h-5" />
            Upload SGK
          </Link>
        </motion.div>
      )}
    </div>
  );
};

export default Lessons;
