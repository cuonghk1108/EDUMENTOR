import React from 'react';
import { Link } from 'react-router-dom';
import { useQuery } from 'react-query';
import { motion } from 'framer-motion';
import { useAuth } from '../context/AuthContext';
import { lessonAPI } from '../services/api';
import {
  BookOpenIcon,
  CheckCircleIcon,
  ClockIcon,
  MagnifyingGlassIcon,
  FunnelIcon
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

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <h1 className="text-3xl font-display font-bold text-gray-900">Bài học của tôi</h1>
          <p className="text-gray-600 mt-1">{lessons.length} bài học</p>
        </div>
        <Link to="/upload" className="btn-primary">
          Thêm bài học mới
        </Link>
      </div>

      {/* Search & Filter */}
      <div className="flex flex-col md:flex-row gap-4">
        <div className="relative flex-1">
          <MagnifyingGlassIcon className="w-5 h-5 text-gray-400 absolute left-3 top-1/2 -translate-y-1/2" />
          <input
            type="text"
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            placeholder="Tìm kiếm bài học..."
            className="input pl-10"
          />
        </div>
        <div className="relative">
          <FunnelIcon className="w-5 h-5 text-gray-400 absolute left-3 top-1/2 -translate-y-1/2" />
          <select
            value={filterSubject}
            onChange={(e) => setFilterSubject(e.target.value)}
            className="input pl-10 pr-8 appearance-none bg-white"
          >
            <option value="all">Tất cả môn học</option>
            {subjects.map(subject => (
              <option key={subject} value={subject}>{subject}</option>
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
                className="card-hover block h-full"
              >
                <div className="flex items-start justify-between mb-4">
                  <div className="w-12 h-12 bg-primary-100 rounded-xl flex items-center justify-center">
                    <BookOpenIcon className="w-6 h-6 text-primary-600" />
                  </div>
                  {lesson.completed ? (
                    <span className="badge-success">
                      <CheckCircleIcon className="w-3 h-3 mr-1" />
                      Hoàn thành
                    </span>
                  ) : (
                    <span className="badge-warning">
                      <ClockIcon className="w-3 h-3 mr-1" />
                      Đang học
                    </span>
                  )}
                </div>

                <h3 className="text-lg font-semibold text-gray-900 mb-2 line-clamp-2">
                  {lesson.title}
                </h3>
                
                <div className="flex items-center gap-2 text-sm text-gray-500 mb-3">
                  <span className="badge-primary">{lesson.subject}</span>
                  {lesson.chapter && (
                    <span className="text-gray-400">• {lesson.chapter}</span>
                  )}
                </div>

                <p className="text-sm text-gray-600 line-clamp-2">
                  {lesson.content?.replace(/[#*_]/g, '').slice(0, 100)}...
                </p>

                <div className="mt-4 pt-4 border-t border-gray-100 flex items-center justify-between text-xs text-gray-400">
                  <span>
                    {new Date(lesson.createdAt?.seconds * 1000 || lesson.createdAt).toLocaleDateString('vi-VN')}
                  </span>
                  {lesson.audioGenerated && (
                    <span className="flex items-center gap-1">
                      🔊 Audio
                    </span>
                  )}
                </div>
              </Link>
            </motion.div>
          ))}
        </div>
      ) : (
        <div className="card text-center py-16">
          <BookOpenIcon className="w-16 h-16 text-gray-300 mx-auto mb-4" />
          <h3 className="text-lg font-medium text-gray-900 mb-2">
            {searchTerm || filterSubject !== 'all' 
              ? 'Không tìm thấy bài học' 
              : 'Chưa có bài học nào'}
          </h3>
          <p className="text-gray-500 mb-6">
            {searchTerm || filterSubject !== 'all'
              ? 'Thử tìm kiếm với từ khóa khác'
              : 'Upload sách giáo khoa để bắt đầu học'}
          </p>
          {!searchTerm && filterSubject === 'all' && (
            <Link to="/upload" className="btn-primary">
              Upload SGK ngay
            </Link>
          )}
        </div>
      )}
    </div>
  );
};

export default Lessons;
