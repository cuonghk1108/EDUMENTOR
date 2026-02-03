import React, { useState } from 'react';
import { useQuery, useMutation, useQueryClient } from 'react-query';
import { motion, AnimatePresence } from 'framer-motion';
import { adminAPI } from '../services/api';
import { useAuth } from '../context/AuthContext';
import { Link } from 'react-router-dom';
import toast from 'react-hot-toast';
import {
  ChartBarIcon,
  UsersIcon,
  BookOpenIcon,
  ClipboardDocumentListIcon,
  Cog6ToothIcon,
  ArrowTrendingUpIcon,
  ArrowTrendingDownIcon,
  MagnifyingGlassIcon,
  TrashIcon,
  EyeIcon,
  PencilIcon,
  XMarkIcon,
  CheckIcon,
  ExclamationTriangleIcon,
  ArrowPathIcon,
  ChatBubbleLeftRightIcon,
  ServerIcon,
  ClockIcon,
  UserGroupIcon
} from '@heroicons/react/24/outline';

// Tab Components
const tabs = [
  { id: 'dashboard', name: 'Tổng quan', icon: ChartBarIcon },
  { id: 'users', name: 'Người dùng', icon: UsersIcon },
  { id: 'lessons', name: 'Bài học', icon: BookOpenIcon },
  { id: 'quizzes', name: 'Quiz', icon: ClipboardDocumentListIcon },
  { id: 'settings', name: 'Cài đặt', icon: Cog6ToothIcon },
];

// Stat Card Component
const StatCard = ({ title, value, change, changeType, icon: Icon, color }) => {
  const colorClasses = {
    blue: 'bg-blue-50 text-blue-600 border-blue-200',
    green: 'bg-green-50 text-green-600 border-green-200',
    purple: 'bg-purple-50 text-purple-600 border-purple-200',
    orange: 'bg-orange-50 text-orange-600 border-orange-200',
    red: 'bg-red-50 text-red-600 border-red-200',
  };

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      className={`p-6 rounded-xl border ${colorClasses[color]} transition-all hover:shadow-lg`}
    >
      <div className="flex items-center justify-between mb-4">
        <Icon className="w-8 h-8" />
        {change !== undefined && (
          <span className={`flex items-center text-sm font-medium ${
            changeType === 'up' ? 'text-green-600' : 'text-red-600'
          }`}>
            {changeType === 'up' ? (
              <ArrowTrendingUpIcon className="w-4 h-4 mr-1" />
            ) : (
              <ArrowTrendingDownIcon className="w-4 h-4 mr-1" />
            )}
            {change}%
          </span>
        )}
      </div>
      <h3 className="text-3xl font-bold text-gray-900">{value}</h3>
      <p className="text-sm text-gray-600 mt-1">{title}</p>
    </motion.div>
  );
};

// Dashboard Tab
const DashboardTab = () => {
  const { data, isLoading, error } = useQuery('adminDashboard', adminAPI.getDashboardStats);
  const { data: timeline } = useQuery('adminTimeline', () => adminAPI.getActivityTimeline(7));

  if (isLoading) return <LoadingSpinner />;
  if (error) return <ErrorMessage message={error.message} />;

  const stats = data?.data?.stats;

  return (
    <div className="space-y-6">
      {/* Stats Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        <StatCard
          title="Tổng người dùng"
          value={stats?.users?.total || 0}
          change={stats?.users?.growth}
          changeType={stats?.users?.growth > 0 ? 'up' : 'down'}
          icon={UsersIcon}
          color="blue"
        />
        <StatCard
          title="Người dùng hoạt động"
          value={stats?.users?.active || 0}
          icon={UserGroupIcon}
          color="green"
        />
        <StatCard
          title="Tổng bài học"
          value={stats?.lessons?.total || 0}
          icon={BookOpenIcon}
          color="purple"
        />
        <StatCard
          title="Tổng Quiz"
          value={stats?.quizzes?.total || 0}
          icon={ClipboardDocumentListIcon}
          color="orange"
        />
      </div>

      {/* Second Row */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <StatCard
          title="Quiz đã hoàn thành"
          value={stats?.quizzes?.completed || 0}
          icon={CheckIcon}
          color="green"
        />
        <StatCard
          title="Điểm trung bình"
          value={`${stats?.quizzes?.avgScore || 0}%`}
          icon={ChartBarIcon}
          color="blue"
        />
        <StatCard
          title="Tin nhắn chat"
          value={stats?.chats?.total || 0}
          icon={ChatBubbleLeftRightIcon}
          color="purple"
        />
      </div>

      {/* Activity Timeline */}
      <div className="bg-white rounded-xl shadow-sm p-6 border border-gray-200">
        <h3 className="text-lg font-semibold text-gray-900 mb-4">Hoạt động 7 ngày qua</h3>
        <div className="grid grid-cols-7 gap-4">
          {timeline?.data?.timeline?.map((day, index) => (
            <div key={day.date} className="text-center">
              <div className="text-xs text-gray-500 mb-2">
                {new Date(day.date).toLocaleDateString('vi-VN', { weekday: 'short' })}
              </div>
              <div className="space-y-2">
                <div className="h-20 bg-gray-100 rounded-lg relative overflow-hidden">
                  <div 
                    className="absolute bottom-0 left-0 right-0 bg-blue-500 transition-all"
                    style={{ height: `${Math.min(100, (day.lessons + day.quizzes + day.users) * 10)}%` }}
                  />
                </div>
                <div className="text-xs text-gray-600">
                  {day.lessons + day.quizzes + day.users}
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* Lessons by Subject */}
      <div className="bg-white rounded-xl shadow-sm p-6 border border-gray-200">
        <h3 className="text-lg font-semibold text-gray-900 mb-4">Bài học theo môn</h3>
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
          {Object.entries(stats?.lessons?.bySubject || {}).map(([subject, count]) => (
            <div key={subject} className="p-4 bg-gray-50 rounded-lg">
              <div className="text-2xl font-bold text-gray-900">{count}</div>
              <div className="text-sm text-gray-600">{subject}</div>
            </div>
          ))}
        </div>
      </div>

      {/* System Health */}
      <div className="bg-white rounded-xl shadow-sm p-6 border border-gray-200">
        <h3 className="text-lg font-semibold text-gray-900 mb-4 flex items-center gap-2">
          <ServerIcon className="w-5 h-5" />
          Trạng thái hệ thống
        </h3>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          <div className="p-4 bg-green-50 rounded-lg border border-green-200">
            <div className="flex items-center gap-2">
              <div className="w-3 h-3 bg-green-500 rounded-full animate-pulse" />
              <span className="font-medium text-green-700">Hoạt động bình thường</span>
            </div>
          </div>
          <div className="p-4 bg-gray-50 rounded-lg">
            <div className="text-sm text-gray-600">Uptime</div>
            <div className="font-semibold text-gray-900">
              {Math.floor((stats?.systemHealth?.uptime || 0) / 3600)}h {Math.floor(((stats?.systemHealth?.uptime || 0) % 3600) / 60)}m
            </div>
          </div>
          <div className="p-4 bg-gray-50 rounded-lg">
            <div className="text-sm text-gray-600">Memory</div>
            <div className="font-semibold text-gray-900">
              {Math.round((stats?.systemHealth?.memoryUsage?.heapUsed || 0) / 1024 / 1024)} MB
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

// Users Tab
const UsersTab = () => {
  const queryClient = useQueryClient();
  const [search, setSearch] = useState('');
  const [page, setPage] = useState(1);
  const [selectedUser, setSelectedUser] = useState(null);
  const [showDeleteModal, setShowDeleteModal] = useState(false);

  const { data, isLoading, error } = useQuery(
    ['adminUsers', { page, search }],
    () => adminAPI.getUsers({ page, limit: 20, search }),
    { keepPreviousData: true }
  );

  const { data: userDetails, isLoading: detailsLoading } = useQuery(
    ['adminUserDetails', selectedUser],
    () => adminAPI.getUserDetails(selectedUser),
    { enabled: !!selectedUser }
  );

  const deleteMutation = useMutation(adminAPI.deleteUser, {
    onSuccess: () => {
      toast.success('Đã xóa người dùng');
      queryClient.invalidateQueries('adminUsers');
      setShowDeleteModal(false);
    },
    onError: (error) => {
      toast.error(error.response?.data?.error || 'Lỗi xóa người dùng');
    }
  });

  const updateMutation = useMutation(
    ({ userId, data }) => adminAPI.updateUser(userId, data),
    {
      onSuccess: () => {
        toast.success('Cập nhật thành công');
        queryClient.invalidateQueries('adminUsers');
        queryClient.invalidateQueries(['adminUserDetails', selectedUser]);
      }
    }
  );

  if (isLoading) return <LoadingSpinner />;
  if (error) return <ErrorMessage message={error.message} />;

  const users = data?.data?.users || [];
  const pagination = data?.data?.pagination;

  return (
    <div className="space-y-6">
      {/* Search */}
      <div className="flex items-center gap-4">
        <div className="relative flex-1 max-w-md">
          <MagnifyingGlassIcon className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400" />
          <input
            type="text"
            placeholder="Tìm kiếm người dùng..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-500"
          />
        </div>
        <span className="text-sm text-gray-500">
          {pagination?.total || 0} người dùng
        </span>
      </div>

      {/* Users Table */}
      <div className="bg-white rounded-xl shadow-sm border border-gray-200 overflow-hidden">
        <table className="w-full">
          <thead className="bg-gray-50">
            <tr>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Người dùng</th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Role</th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Bài học</th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Quiz</th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Điểm TB</th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Ngày tạo</th>
              <th className="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase">Thao tác</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-gray-200">
            {users.map((user) => (
              <tr key={user._id} className="hover:bg-gray-50">
                <td className="px-6 py-4">
                  <div>
                    <div className="font-medium text-gray-900">{user.name}</div>
                    <div className="text-sm text-gray-500">{user.email}</div>
                  </div>
                </td>
                <td className="px-6 py-4">
                  <span className={`px-2 py-1 rounded-full text-xs font-medium ${
                    user.role === 'admin' 
                      ? 'bg-red-100 text-red-700' 
                      : 'bg-gray-100 text-gray-700'
                  }`}>
                    {user.role || 'user'}
                  </span>
                </td>
                <td className="px-6 py-4 text-gray-900">{user.stats?.lessonsCount || 0}</td>
                <td className="px-6 py-4 text-gray-900">{user.stats?.quizzesCount || 0}</td>
                <td className="px-6 py-4 text-gray-900">{user.stats?.avgScore || 0}%</td>
                <td className="px-6 py-4 text-sm text-gray-500">
                  {new Date(user.createdAt).toLocaleDateString('vi-VN')}
                </td>
                <td className="px-6 py-4 text-right">
                  <div className="flex items-center justify-end gap-2">
                    <button
                      onClick={() => setSelectedUser(user._id)}
                      className="p-2 text-gray-400 hover:text-blue-600 transition-colors"
                      title="Xem chi tiết"
                    >
                      <EyeIcon className="w-5 h-5" />
                    </button>
                    {user.role !== 'admin' && (
                      <button
                        onClick={() => {
                          setSelectedUser(user._id);
                          setShowDeleteModal(true);
                        }}
                        className="p-2 text-gray-400 hover:text-red-600 transition-colors"
                        title="Xóa"
                      >
                        <TrashIcon className="w-5 h-5" />
                      </button>
                    )}
                  </div>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      {/* Pagination */}
      {pagination && pagination.pages > 1 && (
        <div className="flex items-center justify-center gap-2">
          <button
            onClick={() => setPage(p => Math.max(1, p - 1))}
            disabled={page === 1}
            className="px-4 py-2 border border-gray-300 rounded-lg disabled:opacity-50"
          >
            Trước
          </button>
          <span className="text-sm text-gray-600">
            Trang {page} / {pagination.pages}
          </span>
          <button
            onClick={() => setPage(p => Math.min(pagination.pages, p + 1))}
            disabled={page === pagination.pages}
            className="px-4 py-2 border border-gray-300 rounded-lg disabled:opacity-50"
          >
            Sau
          </button>
        </div>
      )}

      {/* User Details Modal */}
      <AnimatePresence>
        {selectedUser && !showDeleteModal && (
          <UserDetailsModal
            userId={selectedUser}
            userDetails={userDetails?.data}
            isLoading={detailsLoading}
            onClose={() => setSelectedUser(null)}
            onUpdate={(data) => updateMutation.mutate({ userId: selectedUser, data })}
          />
        )}
      </AnimatePresence>

      {/* Delete Confirmation Modal */}
      <AnimatePresence>
        {showDeleteModal && (
          <DeleteModal
            title="Xóa người dùng"
            message="Bạn có chắc muốn xóa người dùng này? Hành động này không thể hoàn tác."
            onConfirm={() => deleteMutation.mutate(selectedUser)}
            onCancel={() => {
              setShowDeleteModal(false);
              setSelectedUser(null);
            }}
            isLoading={deleteMutation.isLoading}
          />
        )}
      </AnimatePresence>
    </div>
  );
};

// User Details Modal
const UserDetailsModal = ({ userId, userDetails, isLoading, onClose, onUpdate }) => {
  const [editMode, setEditMode] = useState(false);
  const [formData, setFormData] = useState({
    name: '',
    email: '',
    role: 'user',
    isBlocked: false
  });

  React.useEffect(() => {
    if (userDetails?.user) {
      setFormData({
        name: userDetails.user.name || '',
        email: userDetails.user.email || '',
        role: userDetails.user.role || 'user',
        isBlocked: userDetails.user.isBlocked || false
      });
    }
  }, [userDetails]);

  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
      className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4"
      onClick={onClose}
    >
      <motion.div
        initial={{ scale: 0.95 }}
        animate={{ scale: 1 }}
        exit={{ scale: 0.95 }}
        className="bg-white rounded-xl shadow-xl max-w-2xl w-full max-h-[90vh] overflow-y-auto"
        onClick={(e) => e.stopPropagation()}
      >
        <div className="p-6 border-b border-gray-200 flex items-center justify-between">
          <h3 className="text-xl font-semibold text-gray-900">Chi tiết người dùng</h3>
          <button onClick={onClose} className="p-2 hover:bg-gray-100 rounded-lg">
            <XMarkIcon className="w-5 h-5" />
          </button>
        </div>

        {isLoading ? (
          <div className="p-6">
            <LoadingSpinner />
          </div>
        ) : (
          <div className="p-6 space-y-6">
            {/* User Info */}
            {editMode ? (
              <div className="space-y-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Tên</label>
                  <input
                    type="text"
                    value={formData.name}
                    onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                    className="w-full px-4 py-2 border border-gray-300 rounded-lg"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Email</label>
                  <input
                    type="email"
                    value={formData.email}
                    onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                    className="w-full px-4 py-2 border border-gray-300 rounded-lg"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Role</label>
                  <select
                    value={formData.role}
                    onChange={(e) => setFormData({ ...formData, role: e.target.value })}
                    className="w-full px-4 py-2 border border-gray-300 rounded-lg"
                  >
                    <option value="user">User</option>
                    <option value="admin">Admin</option>
                  </select>
                </div>
                <div className="flex items-center gap-2">
                  <input
                    type="checkbox"
                    id="isBlocked"
                    checked={formData.isBlocked}
                    onChange={(e) => setFormData({ ...formData, isBlocked: e.target.checked })}
                  />
                  <label htmlFor="isBlocked" className="text-sm text-gray-700">Chặn người dùng</label>
                </div>
                <div className="flex gap-2">
                  <button
                    onClick={() => {
                      onUpdate(formData);
                      setEditMode(false);
                    }}
                    className="px-4 py-2 bg-primary-600 text-white rounded-lg hover:bg-primary-700"
                  >
                    Lưu
                  </button>
                  <button
                    onClick={() => setEditMode(false)}
                    className="px-4 py-2 bg-gray-200 text-gray-700 rounded-lg hover:bg-gray-300"
                  >
                    Hủy
                  </button>
                </div>
              </div>
            ) : (
              <div className="flex items-start justify-between">
                <div>
                  <h4 className="text-lg font-semibold text-gray-900">{userDetails?.user?.name}</h4>
                  <p className="text-gray-500">{userDetails?.user?.email}</p>
                  <div className="flex gap-2 mt-2">
                    <span className={`px-2 py-1 rounded-full text-xs font-medium ${
                      userDetails?.user?.role === 'admin' 
                        ? 'bg-red-100 text-red-700' 
                        : 'bg-gray-100 text-gray-700'
                    }`}>
                      {userDetails?.user?.role || 'user'}
                    </span>
                    {userDetails?.user?.isBlocked && (
                      <span className="px-2 py-1 rounded-full text-xs font-medium bg-red-100 text-red-700">
                        Đã chặn
                      </span>
                    )}
                  </div>
                </div>
                <button
                  onClick={() => setEditMode(true)}
                  className="p-2 hover:bg-gray-100 rounded-lg"
                >
                  <PencilIcon className="w-5 h-5" />
                </button>
              </div>
            )}

            {/* Stats */}
            <div className="grid grid-cols-4 gap-4">
              <div className="p-4 bg-blue-50 rounded-lg text-center">
                <div className="text-2xl font-bold text-blue-600">{userDetails?.stats?.totalLessons || 0}</div>
                <div className="text-xs text-gray-600">Bài học</div>
              </div>
              <div className="p-4 bg-green-50 rounded-lg text-center">
                <div className="text-2xl font-bold text-green-600">{userDetails?.stats?.completedLessons || 0}</div>
                <div className="text-xs text-gray-600">Hoàn thành</div>
              </div>
              <div className="p-4 bg-purple-50 rounded-lg text-center">
                <div className="text-2xl font-bold text-purple-600">{userDetails?.stats?.totalQuizzes || 0}</div>
                <div className="text-xs text-gray-600">Quiz</div>
              </div>
              <div className="p-4 bg-orange-50 rounded-lg text-center">
                <div className="text-2xl font-bold text-orange-600">{userDetails?.stats?.avgScore || 0}%</div>
                <div className="text-xs text-gray-600">Điểm TB</div>
              </div>
            </div>

            {/* Recent Lessons */}
            {userDetails?.lessons?.length > 0 && (
              <div>
                <h5 className="font-medium text-gray-900 mb-2">Bài học gần đây</h5>
                <div className="space-y-2">
                  {userDetails.lessons.slice(0, 5).map((lesson) => (
                    <div key={lesson._id} className="p-3 bg-gray-50 rounded-lg">
                      <div className="font-medium text-gray-900">{lesson.title}</div>
                      <div className="text-sm text-gray-500">{lesson.subject}</div>
                    </div>
                  ))}
                </div>
              </div>
            )}
          </div>
        )}
      </motion.div>
    </motion.div>
  );
};

// Lessons Tab
const LessonsTab = () => {
  const queryClient = useQueryClient();
  const [search, setSearch] = useState('');
  const [subject, setSubject] = useState('');
  const [page, setPage] = useState(1);
  const [deleteTarget, setDeleteTarget] = useState(null);

  const { data, isLoading, error } = useQuery(
    ['adminLessons', { page, search, subject }],
    () => adminAPI.getLessons({ page, limit: 20, search, subject }),
    { keepPreviousData: true }
  );

  const { data: subjects } = useQuery('adminSubjects', adminAPI.getSubjects);

  const deleteMutation = useMutation(adminAPI.deleteLesson, {
    onSuccess: () => {
      toast.success('Đã xóa bài học');
      queryClient.invalidateQueries('adminLessons');
      setDeleteTarget(null);
    },
    onError: (error) => {
      toast.error(error.response?.data?.error || 'Lỗi xóa bài học');
    }
  });

  if (isLoading) return <LoadingSpinner />;
  if (error) return <ErrorMessage message={error.message} />;

  const lessons = data?.data?.lessons || [];
  const pagination = data?.data?.pagination;

  return (
    <div className="space-y-6">
      {/* Filters */}
      <div className="flex items-center gap-4 flex-wrap">
        <div className="relative flex-1 max-w-md">
          <MagnifyingGlassIcon className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400" />
          <input
            type="text"
            placeholder="Tìm kiếm bài học..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-500"
          />
        </div>
        <select
          value={subject}
          onChange={(e) => setSubject(e.target.value)}
          className="px-4 py-2 border border-gray-300 rounded-lg"
        >
          <option value="">Tất cả môn</option>
          {subjects?.data?.subjects?.map((s) => (
            <option key={s} value={s}>{s}</option>
          ))}
        </select>
        <span className="text-sm text-gray-500">
          {pagination?.total || 0} bài học
        </span>
      </div>

      {/* Lessons Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
        {lessons.map((lesson) => (
          <motion.div
            key={lesson._id}
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            className="bg-white rounded-xl shadow-sm border border-gray-200 p-4 hover:shadow-md transition-shadow"
          >
            <div className="flex items-start justify-between mb-3">
              <span className="px-2 py-1 bg-primary-100 text-primary-700 rounded-full text-xs font-medium">
                {lesson.subject || 'Chung'}
              </span>
              <button
                onClick={() => setDeleteTarget(lesson)}
                className="p-1 text-gray-400 hover:text-red-600 transition-colors"
              >
                <TrashIcon className="w-5 h-5" />
              </button>
            </div>
            <h4 className="font-semibold text-gray-900 mb-2 line-clamp-2">{lesson.title}</h4>
            <p className="text-sm text-gray-500 line-clamp-2 mb-3">
              {lesson.content?.substring(0, 100)}...
            </p>
            <div className="flex items-center justify-between text-xs text-gray-500">
              <span>{lesson.creator?.name || 'Ẩn danh'}</span>
              <span>{new Date(lesson.createdAt).toLocaleDateString('vi-VN')}</span>
            </div>
            <div className="flex gap-2 mt-3">
              {lesson.hasAudio && (
                <span className="px-2 py-1 bg-green-100 text-green-700 rounded-full text-xs">
                  🔊 Audio
                </span>
              )}
              {lesson.completed && (
                <span className="px-2 py-1 bg-blue-100 text-blue-700 rounded-full text-xs">
                  ✓ Hoàn thành
                </span>
              )}
            </div>
          </motion.div>
        ))}
      </div>

      {/* Pagination */}
      {pagination && pagination.pages > 1 && (
        <div className="flex items-center justify-center gap-2">
          <button
            onClick={() => setPage(p => Math.max(1, p - 1))}
            disabled={page === 1}
            className="px-4 py-2 border border-gray-300 rounded-lg disabled:opacity-50"
          >
            Trước
          </button>
          <span className="text-sm text-gray-600">
            Trang {page} / {pagination.pages}
          </span>
          <button
            onClick={() => setPage(p => Math.min(pagination.pages, p + 1))}
            disabled={page === pagination.pages}
            className="px-4 py-2 border border-gray-300 rounded-lg disabled:opacity-50"
          >
            Sau
          </button>
        </div>
      )}

      {/* Delete Modal */}
      <AnimatePresence>
        {deleteTarget && (
          <DeleteModal
            title="Xóa bài học"
            message={`Bạn có chắc muốn xóa bài học "${deleteTarget.title}"?`}
            onConfirm={() => deleteMutation.mutate(deleteTarget._id)}
            onCancel={() => setDeleteTarget(null)}
            isLoading={deleteMutation.isLoading}
          />
        )}
      </AnimatePresence>
    </div>
  );
};

// Quizzes Tab
const QuizzesTab = () => {
  const queryClient = useQueryClient();
  const [search, setSearch] = useState('');
  const [page, setPage] = useState(1);
  const [deleteTarget, setDeleteTarget] = useState(null);

  const { data, isLoading, error } = useQuery(
    ['adminQuizzes', { page, search }],
    () => adminAPI.getQuizzes({ page, limit: 20, search }),
    { keepPreviousData: true }
  );

  const deleteMutation = useMutation(adminAPI.deleteQuiz, {
    onSuccess: () => {
      toast.success('Đã xóa quiz');
      queryClient.invalidateQueries('adminQuizzes');
      setDeleteTarget(null);
    },
    onError: (error) => {
      toast.error(error.response?.data?.error || 'Lỗi xóa quiz');
    }
  });

  if (isLoading) return <LoadingSpinner />;
  if (error) return <ErrorMessage message={error.message} />;

  const quizzes = data?.data?.quizzes || [];
  const pagination = data?.data?.pagination;

  return (
    <div className="space-y-6">
      {/* Search */}
      <div className="flex items-center gap-4">
        <div className="relative flex-1 max-w-md">
          <MagnifyingGlassIcon className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400" />
          <input
            type="text"
            placeholder="Tìm kiếm quiz..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-500"
          />
        </div>
        <span className="text-sm text-gray-500">
          {pagination?.total || 0} quiz
        </span>
      </div>

      {/* Quizzes Table */}
      <div className="bg-white rounded-xl shadow-sm border border-gray-200 overflow-hidden">
        <table className="w-full">
          <thead className="bg-gray-50">
            <tr>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Chủ đề</th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Số câu</th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Điểm</th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Trạng thái</th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Người tạo</th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Ngày tạo</th>
              <th className="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase">Thao tác</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-gray-200">
            {quizzes.map((quiz) => (
              <tr key={quiz._id} className="hover:bg-gray-50">
                <td className="px-6 py-4">
                  <div className="font-medium text-gray-900">{quiz.topic || quiz.title || 'Quiz'}</div>
                </td>
                <td className="px-6 py-4 text-gray-900">{quiz.questions?.length || 0}</td>
                <td className="px-6 py-4">
                  {quiz.score !== undefined ? (
                    <span className={`font-medium ${quiz.score >= 80 ? 'text-green-600' : quiz.score >= 50 ? 'text-yellow-600' : 'text-red-600'}`}>
                      {quiz.score}%
                    </span>
                  ) : '-'}
                </td>
                <td className="px-6 py-4">
                  <span className={`px-2 py-1 rounded-full text-xs font-medium ${
                    quiz.completed 
                      ? 'bg-green-100 text-green-700' 
                      : 'bg-gray-100 text-gray-700'
                  }`}>
                    {quiz.completed ? 'Đã làm' : 'Chưa làm'}
                  </span>
                </td>
                <td className="px-6 py-4 text-sm text-gray-500">
                  {quiz.creator?.name || 'Ẩn danh'}
                </td>
                <td className="px-6 py-4 text-sm text-gray-500">
                  {new Date(quiz.createdAt).toLocaleDateString('vi-VN')}
                </td>
                <td className="px-6 py-4 text-right">
                  <button
                    onClick={() => setDeleteTarget(quiz)}
                    className="p-2 text-gray-400 hover:text-red-600 transition-colors"
                    title="Xóa"
                  >
                    <TrashIcon className="w-5 h-5" />
                  </button>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      {/* Pagination */}
      {pagination && pagination.pages > 1 && (
        <div className="flex items-center justify-center gap-2">
          <button
            onClick={() => setPage(p => Math.max(1, p - 1))}
            disabled={page === 1}
            className="px-4 py-2 border border-gray-300 rounded-lg disabled:opacity-50"
          >
            Trước
          </button>
          <span className="text-sm text-gray-600">
            Trang {page} / {pagination.pages}
          </span>
          <button
            onClick={() => setPage(p => Math.min(pagination.pages, p + 1))}
            disabled={page === pagination.pages}
            className="px-4 py-2 border border-gray-300 rounded-lg disabled:opacity-50"
          >
            Sau
          </button>
        </div>
      )}

      {/* Delete Modal */}
      <AnimatePresence>
        {deleteTarget && (
          <DeleteModal
            title="Xóa quiz"
            message={`Bạn có chắc muốn xóa quiz "${deleteTarget.topic || 'này'}"?`}
            onConfirm={() => deleteMutation.mutate(deleteTarget._id)}
            onCancel={() => setDeleteTarget(null)}
            isLoading={deleteMutation.isLoading}
          />
        )}
      </AnimatePresence>
    </div>
  );
};

// Settings Tab
const SettingsTab = () => {
  const { data, isLoading } = useQuery('adminSettings', adminAPI.getSettings);
  const { data: logs } = useQuery('adminLogs', () => adminAPI.getLogs({ limit: 20 }));

  if (isLoading) return <LoadingSpinner />;

  const settings = data?.data?.settings;

  return (
    <div className="space-y-6">
      {/* System Settings */}
      <div className="bg-white rounded-xl shadow-sm p-6 border border-gray-200">
        <h3 className="text-lg font-semibold text-gray-900 mb-4">Cài đặt hệ thống</h3>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Tên website</label>
            <input
              type="text"
              value={settings?.siteName || ''}
              disabled
              className="w-full px-4 py-2 border border-gray-300 rounded-lg bg-gray-50"
            />
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">AI Model</label>
            <input
              type="text"
              value={settings?.aiModel || ''}
              disabled
              className="w-full px-4 py-2 border border-gray-300 rounded-lg bg-gray-50"
            />
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Max Upload Size</label>
            <input
              type="text"
              value={`${(settings?.maxUploadSize || 0) / 1024 / 1024} MB`}
              disabled
              className="w-full px-4 py-2 border border-gray-300 rounded-lg bg-gray-50"
            />
          </div>
        </div>
      </div>

      {/* Features */}
      <div className="bg-white rounded-xl shadow-sm p-6 border border-gray-200">
        <h3 className="text-lg font-semibold text-gray-900 mb-4">Tính năng</h3>
        <div className="grid grid-cols-2 md:grid-cols-3 gap-4">
          {Object.entries(settings?.features || {}).map(([feature, enabled]) => (
            <div key={feature} className="flex items-center gap-3 p-3 bg-gray-50 rounded-lg">
              <div className={`w-3 h-3 rounded-full ${enabled ? 'bg-green-500' : 'bg-gray-300'}`} />
              <span className="capitalize">{feature}</span>
            </div>
          ))}
        </div>
      </div>

      {/* Activity Logs */}
      <div className="bg-white rounded-xl shadow-sm p-6 border border-gray-200">
        <h3 className="text-lg font-semibold text-gray-900 mb-4">Nhật ký hoạt động</h3>
        <div className="space-y-3 max-h-96 overflow-y-auto">
          {logs?.data?.logs?.map((log) => (
            <div key={log._id} className="flex items-center gap-4 p-3 bg-gray-50 rounded-lg">
              <ClockIcon className="w-5 h-5 text-gray-400 flex-shrink-0" />
              <div className="flex-1">
                <p className="text-sm text-gray-900">{log.type}</p>
                <p className="text-xs text-gray-500">
                  {new Date(log.createdAt).toLocaleString('vi-VN')}
                </p>
              </div>
            </div>
          ))}
          {!logs?.data?.logs?.length && (
            <p className="text-center text-gray-500 py-4">Chưa có hoạt động nào</p>
          )}
        </div>
      </div>
    </div>
  );
};

// Delete Modal
const DeleteModal = ({ title, message, onConfirm, onCancel, isLoading }) => (
  <motion.div
    initial={{ opacity: 0 }}
    animate={{ opacity: 1 }}
    exit={{ opacity: 0 }}
    className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4"
    onClick={onCancel}
  >
    <motion.div
      initial={{ scale: 0.95 }}
      animate={{ scale: 1 }}
      exit={{ scale: 0.95 }}
      className="bg-white rounded-xl shadow-xl max-w-md w-full p-6"
      onClick={(e) => e.stopPropagation()}
    >
      <div className="flex items-center gap-4 mb-4">
        <div className="w-12 h-12 bg-red-100 rounded-full flex items-center justify-center">
          <ExclamationTriangleIcon className="w-6 h-6 text-red-600" />
        </div>
        <div>
          <h3 className="text-lg font-semibold text-gray-900">{title}</h3>
          <p className="text-sm text-gray-500">{message}</p>
        </div>
      </div>
      <div className="flex justify-end gap-3">
        <button
          onClick={onCancel}
          disabled={isLoading}
          className="px-4 py-2 bg-gray-200 text-gray-700 rounded-lg hover:bg-gray-300"
        >
          Hủy
        </button>
        <button
          onClick={onConfirm}
          disabled={isLoading}
          className="px-4 py-2 bg-red-600 text-white rounded-lg hover:bg-red-700 flex items-center gap-2"
        >
          {isLoading && <ArrowPathIcon className="w-4 h-4 animate-spin" />}
          Xóa
        </button>
      </div>
    </motion.div>
  </motion.div>
);

// Loading Spinner
const LoadingSpinner = () => (
  <div className="flex items-center justify-center py-12">
    <ArrowPathIcon className="w-8 h-8 text-primary-600 animate-spin" />
  </div>
);

// Error Message
const ErrorMessage = ({ message }) => (
  <div className="p-4 bg-red-50 text-red-700 rounded-lg">
    <p>Lỗi: {message}</p>
  </div>
);

// Main Admin Page
const Admin = () => {
  const { user } = useAuth();
  const [activeTab, setActiveTab] = useState('dashboard');

  // Check if user is admin
  if (!user || user.role !== 'admin') {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-50">
        <div className="text-center p-8 bg-white rounded-xl shadow-lg max-w-md">
          <ExclamationTriangleIcon className="w-16 h-16 text-red-500 mx-auto mb-4" />
          <h1 className="text-2xl font-bold text-gray-900 mb-2">Truy cập bị từ chối</h1>
          <p className="text-gray-600 mb-4">
            Bạn không có quyền truy cập trang quản trị.
          </p>
          <Link to="/dashboard" className="btn-primary">
            Về trang chủ
          </Link>
        </div>
      </div>
    );
  }

  const renderTab = () => {
    switch (activeTab) {
      case 'dashboard':
        return <DashboardTab />;
      case 'users':
        return <UsersTab />;
      case 'lessons':
        return <LessonsTab />;
      case 'quizzes':
        return <QuizzesTab />;
      case 'settings':
        return <SettingsTab />;
      default:
        return <DashboardTab />;
    }
  };

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <header className="bg-white border-b border-gray-200 sticky top-0 z-40">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex items-center justify-between h-16">
            <div className="flex items-center gap-4">
              <Link to="/dashboard" className="text-gray-500 hover:text-gray-700">
                ← Quay lại
              </Link>
              <h1 className="text-xl font-bold text-gray-900">
                🛠️ Admin Panel
              </h1>
            </div>
            <div className="flex items-center gap-4">
              <span className="text-sm text-gray-500">
                Xin chào, <span className="font-medium text-gray-900">{user.name}</span>
              </span>
            </div>
          </div>
        </div>
      </header>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Tabs */}
        <div className="flex gap-2 mb-8 overflow-x-auto pb-2">
          {tabs.map((tab) => (
            <button
              key={tab.id}
              onClick={() => setActiveTab(tab.id)}
              className={`flex items-center gap-2 px-4 py-2 rounded-lg font-medium transition-colors whitespace-nowrap ${
                activeTab === tab.id
                  ? 'bg-primary-600 text-white'
                  : 'bg-white text-gray-600 hover:bg-gray-100 border border-gray-200'
              }`}
            >
              <tab.icon className="w-5 h-5" />
              {tab.name}
            </button>
          ))}
        </div>

        {/* Tab Content */}
        <AnimatePresence mode="wait">
          <motion.div
            key={activeTab}
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -20 }}
            transition={{ duration: 0.2 }}
          >
            {renderTab()}
          </motion.div>
        </AnimatePresence>
      </div>
    </div>
  );
};

export default Admin;
