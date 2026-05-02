import React, { useState } from 'react';
import { useQuery, useMutation, useQueryClient } from 'react-query';
import { motion, AnimatePresence } from 'framer-motion';
import { adminAPI } from '../services/api';
import { useAuth } from '../context/AuthContext';
import { Link } from 'react-router-dom';
import { stripLatexForPlainText } from '../utils/latex';
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
  UserGroupIcon,
  SparklesIcon,
  ShieldCheckIcon,
  MapIcon,
  DocumentTextIcon,
  CircleStackIcon
} from '@heroicons/react/24/outline';

// Tab Components
const tabs = [
  { id: 'dashboard', name: 'Tổng quan', icon: ChartBarIcon },
  { id: 'users', name: 'Người dùng', icon: UsersIcon },
  { id: 'lessons', name: 'Bài học', icon: BookOpenIcon },
  { id: 'quizzes', name: 'Quiz', icon: ClipboardDocumentListIcon },
  { id: 'chats', name: 'Chat History', icon: ChatBubbleLeftRightIcon },
  { id: 'roadmaps', name: 'Roadmaps', icon: MapIcon },
  { id: 'logs', name: 'System Logs', icon: DocumentTextIcon },
  { id: 'database', name: 'Database', icon: CircleStackIcon },
  { id: 'settings', name: 'Cài đặt', icon: Cog6ToothIcon },
];

// Stat Card Component - Dark Theme
const StatCard = ({ title, value, change, changeType, icon: Icon, color }) => {
  const colorClasses = {
    blue: 'from-blue-500/20 to-cyan-500/20 border-blue-500/30 text-blue-400',
    green: 'from-green-500/20 to-emerald-500/20 border-green-500/30 text-green-400',
    purple: 'from-purple-500/20 to-pink-500/20 border-purple-500/30 text-purple-400',
    orange: 'from-orange-500/20 to-amber-500/20 border-orange-500/30 text-orange-400',
    red: 'from-red-500/20 to-rose-500/20 border-red-500/30 text-red-400',
    cyan: 'from-cyan-500/20 to-teal-500/20 border-cyan-500/30 text-cyan-400',
  };

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      className={`p-6 rounded-2xl bg-gradient-to-br ${colorClasses[color]} border backdrop-blur-xl transition-all hover:scale-[1.02]`}
    >
      <div className="flex items-center justify-between mb-4">
        <div className={`w-12 h-12 rounded-xl bg-white/10 flex items-center justify-center`}>
          <Icon className="w-6 h-6" />
        </div>
        {change !== undefined && (
          <span className={`flex items-center text-sm font-medium px-2 py-1 rounded-lg ${
            changeType === 'up' 
              ? 'bg-green-500/20 text-green-400' 
              : 'bg-red-500/20 text-red-400'
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
      <h3 className="text-3xl font-bold text-white">{value}</h3>
      <p className="text-sm text-gray-400 mt-1">{title}</p>
    </motion.div>
  );
};

// Dashboard Tab - Dark Theme
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
          color="cyan"
        />
        <StatCard
          title="Tin nhắn chat"
          value={stats?.chats?.total || 0}
          icon={ChatBubbleLeftRightIcon}
          color="purple"
        />
      </div>

      {/* Activity Timeline */}
      <div className="bg-gray-900/50 backdrop-blur-xl rounded-2xl p-6 border border-white/10">
        <h3 className="text-lg font-semibold text-white mb-6 flex items-center gap-2">
          <SparklesIcon className="w-5 h-5 text-purple-400" />
          Hoạt động 7 ngày qua
        </h3>
        <div className="grid grid-cols-7 gap-4">
          {timeline?.data?.timeline?.map((day, index) => (
            <div key={day.date} className="text-center">
              <div className="text-xs text-gray-500 mb-3">
                {new Date(day.date).toLocaleDateString('vi-VN', { weekday: 'short' })}
              </div>
              <div className="space-y-2">
                <div className="h-24 bg-white/5 rounded-xl relative overflow-hidden border border-white/5">
                  <motion.div 
                    initial={{ height: 0 }}
                    animate={{ height: `${Math.min(100, (day.lessons + day.quizzes + day.users) * 10)}%` }}
                    transition={{ delay: index * 0.1, duration: 0.5 }}
                    className="absolute bottom-0 left-0 right-0 bg-gradient-to-t from-purple-500 to-pink-500 rounded-b-lg"
                  />
                </div>
                <div className="text-sm text-gray-300 font-medium">
                  {day.lessons + day.quizzes + day.users}
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* Lessons by Subject */}
      <div className="bg-gray-900/50 backdrop-blur-xl rounded-2xl p-6 border border-white/10">
        <h3 className="text-lg font-semibold text-white mb-6 flex items-center gap-2">
          <BookOpenIcon className="w-5 h-5 text-cyan-400" />
          Bài học theo môn
        </h3>
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
          {Object.entries(stats?.lessons?.bySubject || {}).map(([subject, count]) => (
            <div key={subject} className="p-4 bg-white/5 rounded-xl border border-white/10 hover:border-purple-500/30 transition-colors">
              <div className="text-2xl font-bold text-white">{count}</div>
              <div className="text-sm text-gray-400">{subject}</div>
            </div>
          ))}
        </div>
      </div>

      {/* System Health */}
      <div className="bg-gray-900/50 backdrop-blur-xl rounded-2xl p-6 border border-white/10">
        <h3 className="text-lg font-semibold text-white mb-6 flex items-center gap-2">
          <ServerIcon className="w-5 h-5 text-green-400" />
          Trạng thái hệ thống
        </h3>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          <div className="p-4 bg-green-500/10 rounded-xl border border-green-500/20">
            <div className="flex items-center gap-3">
              <div className="w-3 h-3 bg-green-500 rounded-full animate-pulse" />
              <span className="font-medium text-green-300">Hoạt động bình thường</span>
            </div>
          </div>
          <div className="p-4 bg-white/5 rounded-xl border border-white/10">
            <div className="text-sm text-gray-500">Uptime</div>
            <div className="font-semibold text-white">
              {Math.floor((stats?.systemHealth?.uptime || 0) / 3600)}h {Math.floor(((stats?.systemHealth?.uptime || 0) % 3600) / 60)}m
            </div>
          </div>
          <div className="p-4 bg-white/5 rounded-xl border border-white/10">
            <div className="text-sm text-gray-500">Memory</div>
            <div className="font-semibold text-white">
              {Math.round((stats?.systemHealth?.memoryUsage?.heapUsed || 0) / 1024 / 1024)} MB
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

// Users Tab - Dark Theme
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

  const blockMutation = useMutation(
    ({ userId, isBlocked }) => adminAPI.blockUser(userId, isBlocked),
    {
      onSuccess: (response) => {
        toast.success(response?.data?.message || 'Cập nhật trạng thái thành công');
        queryClient.invalidateQueries('adminUsers');
        queryClient.invalidateQueries(['adminUserDetails', selectedUser]);
      },
      onError: (error) => {
        toast.error(error.response?.data?.error || 'Không thể cập nhật trạng thái');
      }
    }
  );

  const resetPasswordMutation = useMutation(
    ({ userId, newPassword }) => adminAPI.resetUserPassword(userId, newPassword),
    {
      onSuccess: (response) => {
        toast.success(response?.data?.message || 'Đã reset mật khẩu');
      },
      onError: (error) => {
        toast.error(error.response?.data?.error || 'Không thể reset mật khẩu');
      }
    }
  );

  const deleteUserDataMutation = useMutation(
    (userId) => adminAPI.deleteAllUserData(userId),
    {
      onSuccess: (response) => {
        toast.success(response?.data?.message || 'Đã xóa dữ liệu người dùng');
        queryClient.invalidateQueries(['adminUserDetails', selectedUser]);
      },
      onError: (error) => {
        toast.error(error.response?.data?.error || 'Không thể xóa dữ liệu người dùng');
      }
    }
  );

  const changeRoleMutation = useMutation(
    ({ userId, role }) => adminAPI.changeUserRole(userId, role),
    {
      onSuccess: (response) => {
        toast.success(response?.data?.message || 'Đã thay đổi quyền');
        queryClient.invalidateQueries('adminUsers');
        queryClient.invalidateQueries(['adminUserDetails', selectedUser]);
      },
      onError: (error) => {
        toast.error(error.response?.data?.error || 'Không thể đổi quyền');
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
          <MagnifyingGlassIcon className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-500" />
          <input
            type="text"
            placeholder="Tìm kiếm người dùng..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="w-full pl-12 pr-4 py-3 bg-white/5 border border-white/10 rounded-xl text-white placeholder-gray-500 focus:outline-none focus:border-purple-500/50 focus:ring-2 focus:ring-purple-500/20 transition-all"
          />
        </div>
        <span className="text-sm text-gray-400 bg-white/5 px-4 py-2 rounded-lg border border-white/10">
          {pagination?.total || 0} người dùng
        </span>
      </div>

      {/* Users Table */}
      <div className="bg-gray-900/50 backdrop-blur-xl rounded-2xl border border-white/10 overflow-hidden">
        <table className="w-full">
          <thead className="bg-white/5">
            <tr>
              <th className="px-6 py-4 text-left text-xs font-medium text-gray-400 uppercase tracking-wider">Người dùng</th>
              <th className="px-6 py-4 text-left text-xs font-medium text-gray-400 uppercase tracking-wider">Role</th>
              <th className="px-6 py-4 text-left text-xs font-medium text-gray-400 uppercase tracking-wider">Bài học</th>
              <th className="px-6 py-4 text-left text-xs font-medium text-gray-400 uppercase tracking-wider">Quiz</th>
              <th className="px-6 py-4 text-left text-xs font-medium text-gray-400 uppercase tracking-wider">Điểm TB</th>
              <th className="px-6 py-4 text-left text-xs font-medium text-gray-400 uppercase tracking-wider">Ngày tạo</th>
              <th className="px-6 py-4 text-right text-xs font-medium text-gray-400 uppercase tracking-wider">Thao tác</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-white/5">
            {users.map((user) => (
              <tr key={user._id} className="hover:bg-white/5 transition-colors">
                <td className="px-6 py-4">
                  <div>
                    <div className="font-medium text-white">{user.name}</div>
                    <div className="text-sm text-gray-500">{user.email}</div>
                  </div>
                </td>
                <td className="px-6 py-4">
                  <span className={`px-3 py-1 rounded-lg text-xs font-medium ${
                    user.role === 'admin' 
                      ? 'bg-red-500/20 text-red-300 border border-red-500/30' 
                      : 'bg-white/10 text-gray-300 border border-white/10'
                  }`}>
                    {user.role || 'user'}
                  </span>
                </td>
                <td className="px-6 py-4 text-gray-300">{user.stats?.lessonsCount || 0}</td>
                <td className="px-6 py-4 text-gray-300">{user.stats?.quizzesCount || 0}</td>
                <td className="px-6 py-4 text-gray-300">{user.stats?.avgScore || 0}%</td>
                <td className="px-6 py-4 text-sm text-gray-500">
                  {new Date(user.createdAt).toLocaleDateString('vi-VN')}
                </td>
                <td className="px-6 py-4 text-right">
                  <div className="flex items-center justify-end gap-2">
                    <button
                      onClick={() => setSelectedUser(user._id)}
                      className="p-2 text-gray-400 hover:text-cyan-400 hover:bg-cyan-500/10 rounded-lg transition-colors"
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
                        className="p-2 text-gray-400 hover:text-red-400 hover:bg-red-500/10 rounded-lg transition-colors"
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
            className="px-4 py-2 bg-white/5 border border-white/10 rounded-xl text-white disabled:opacity-50 disabled:cursor-not-allowed hover:bg-white/10 transition-colors"
          >
            Trước
          </button>
          <span className="text-sm text-gray-400 px-4">
            Trang {page} / {pagination.pages}
          </span>
          <button
            onClick={() => setPage(p => Math.min(pagination.pages, p + 1))}
            disabled={page === pagination.pages}
            className="px-4 py-2 bg-white/5 border border-white/10 rounded-xl text-white disabled:opacity-50 disabled:cursor-not-allowed hover:bg-white/10 transition-colors"
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
            onToggleBlock={(isBlocked) => blockMutation.mutate({ userId: selectedUser, isBlocked })}
            onResetPassword={(newPassword) => resetPasswordMutation.mutate({ userId: selectedUser, newPassword })}
            onDeleteAllData={() => deleteUserDataMutation.mutate(selectedUser)}
            onChangeRole={(role) => changeRoleMutation.mutate({ userId: selectedUser, role })}
            isActionLoading={
              blockMutation.isLoading ||
              resetPasswordMutation.isLoading ||
              deleteUserDataMutation.isLoading ||
              changeRoleMutation.isLoading
            }
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

// User Details Modal - Dark Theme
const UserDetailsModal = ({
  userId,
  userDetails,
  isLoading,
  onClose,
  onUpdate,
  onToggleBlock,
  onResetPassword,
  onDeleteAllData,
  onChangeRole,
  isActionLoading
}) => {
  const [editMode, setEditMode] = useState(false);
  const [newPassword, setNewPassword] = useState('');
  const [formData, setFormData] = useState({
    name: '',
    email: '',
    role: 'user',
    isBlocked: false
  });

  const { data: activityData } = useQuery(
    ['adminUserActivity', userId],
    () => adminAPI.getUserActivityLog(userId, 10),
    { enabled: !!userId }
  );

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
      className="fixed inset-0 bg-black/70 backdrop-blur-sm flex items-center justify-center z-50 p-4"
      onClick={onClose}
    >
      <motion.div
        initial={{ scale: 0.95, opacity: 0 }}
        animate={{ scale: 1, opacity: 1 }}
        exit={{ scale: 0.95, opacity: 0 }}
        className="bg-gray-900 rounded-2xl border border-white/10 shadow-2xl max-w-2xl w-full max-h-[90vh] overflow-y-auto"
        onClick={(e) => e.stopPropagation()}
      >
        <div className="p-6 border-b border-white/10 flex items-center justify-between">
          <h3 className="text-xl font-semibold text-white flex items-center gap-2">
            <UsersIcon className="w-6 h-6 text-purple-400" />
            Chi tiết người dùng
          </h3>
          <button onClick={onClose} className="p-2 hover:bg-white/10 rounded-xl transition-colors">
            <XMarkIcon className="w-5 h-5 text-gray-400" />
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
                  <label className="block text-sm font-medium text-gray-400 mb-2">Tên</label>
                  <input
                    type="text"
                    value={formData.name}
                    onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                    className="w-full px-4 py-3 bg-white/5 border border-white/10 rounded-xl text-white focus:outline-none focus:border-purple-500/50"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-400 mb-2">Email</label>
                  <input
                    type="email"
                    value={formData.email}
                    onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                    className="w-full px-4 py-3 bg-white/5 border border-white/10 rounded-xl text-white focus:outline-none focus:border-purple-500/50"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-400 mb-2">Role</label>
                  <select
                    value={formData.role}
                    onChange={(e) => setFormData({ ...formData, role: e.target.value })}
                    className="w-full px-4 py-3 bg-white/5 border border-white/10 rounded-xl text-white focus:outline-none focus:border-purple-500/50"
                  >
                    <option value="user">User</option>
                    <option value="admin">Admin</option>
                  </select>
                </div>
                <div className="flex items-center gap-3">
                  <input
                    type="checkbox"
                    id="isBlocked"
                    checked={formData.isBlocked}
                    onChange={(e) => setFormData({ ...formData, isBlocked: e.target.checked })}
                    className="w-5 h-5 rounded bg-white/10 border-white/20 text-red-500 focus:ring-red-500/30"
                  />
                  <label htmlFor="isBlocked" className="text-sm text-gray-300">Chặn người dùng</label>
                </div>
                <div className="flex gap-3 pt-2">
                  <button
                    onClick={() => {
                      onUpdate(formData);
                      setEditMode(false);
                    }}
                    className="px-5 py-2.5 bg-gradient-to-r from-purple-500 to-pink-500 text-white rounded-xl hover:shadow-lg hover:shadow-purple-500/25 transition-all"
                  >
                    Lưu
                  </button>
                  <button
                    onClick={() => setEditMode(false)}
                    className="px-5 py-2.5 bg-white/10 text-white rounded-xl hover:bg-white/20 transition-colors"
                  >
                    Hủy
                  </button>
                </div>
              </div>
            ) : (
              <div className="flex items-start justify-between">
                <div>
                  <h4 className="text-lg font-semibold text-white">{userDetails?.user?.name}</h4>
                  <p className="text-gray-400">{userDetails?.user?.email}</p>
                  <div className="flex gap-2 mt-3">
                    <span className={`px-3 py-1 rounded-lg text-xs font-medium ${
                      userDetails?.user?.role === 'admin' 
                        ? 'bg-red-500/20 text-red-300 border border-red-500/30' 
                        : 'bg-white/10 text-gray-300 border border-white/10'
                    }`}>
                      {userDetails?.user?.role || 'user'}
                    </span>
                    {userDetails?.user?.isBlocked && (
                      <span className="px-3 py-1 rounded-lg text-xs font-medium bg-red-500/20 text-red-300 border border-red-500/30">
                        Đã chặn
                      </span>
                    )}
                  </div>
                </div>
                <button
                  onClick={() => setEditMode(true)}
                  className="p-2.5 hover:bg-white/10 rounded-xl transition-colors"
                >
                  <PencilIcon className="w-5 h-5 text-gray-400" />
                </button>
              </div>
            )}

            {/* Stats */}
            <div className="grid grid-cols-4 gap-4">
              <div className="p-4 bg-blue-500/10 rounded-xl border border-blue-500/20 text-center">
                <div className="text-2xl font-bold text-blue-400">{userDetails?.stats?.totalLessons || 0}</div>
                <div className="text-xs text-gray-400 mt-1">Bài học</div>
              </div>
              <div className="p-4 bg-green-500/10 rounded-xl border border-green-500/20 text-center">
                <div className="text-2xl font-bold text-green-400">{userDetails?.stats?.completedLessons || 0}</div>
                <div className="text-xs text-gray-400 mt-1">Hoàn thành</div>
              </div>
              <div className="p-4 bg-purple-500/10 rounded-xl border border-purple-500/20 text-center">
                <div className="text-2xl font-bold text-purple-400">{userDetails?.stats?.totalQuizzes || 0}</div>
                <div className="text-xs text-gray-400 mt-1">Quiz</div>
              </div>
              <div className="p-4 bg-orange-500/10 rounded-xl border border-orange-500/20 text-center">
                <div className="text-2xl font-bold text-orange-400">{userDetails?.stats?.avgScore || 0}%</div>
                <div className="text-xs text-gray-400 mt-1">Điểm TB</div>
              </div>
            </div>

            {/* Advanced Actions */}
            <div className="bg-white/5 rounded-2xl border border-white/10 p-4 space-y-4">
              <h5 className="font-medium text-white">Can thiệp nâng cao</h5>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                <button
                  onClick={() => onToggleBlock(!userDetails?.user?.isBlocked)}
                  disabled={isActionLoading || userDetails?.user?.role === 'admin'}
                  className={`px-4 py-2.5 rounded-xl font-medium transition-all disabled:opacity-50 disabled:cursor-not-allowed ${
                    userDetails?.user?.isBlocked
                      ? 'bg-green-500/20 text-green-300 border border-green-500/30 hover:bg-green-500/30'
                      : 'bg-red-500/20 text-red-300 border border-red-500/30 hover:bg-red-500/30'
                  }`}
                >
                  {userDetails?.user?.isBlocked ? 'Bỏ chặn tài khoản' : 'Chặn tài khoản'}
                </button>

                <button
                  onClick={() => {
                    const nextRole = userDetails?.user?.role === 'admin' ? 'user' : 'admin';
                    onChangeRole(nextRole);
                  }}
                  disabled={isActionLoading}
                  className="px-4 py-2.5 rounded-xl font-medium bg-purple-500/20 text-purple-300 border border-purple-500/30 hover:bg-purple-500/30 transition-all disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  {userDetails?.user?.role === 'admin' ? 'Hạ quyền về user' : 'Nâng quyền admin'}
                </button>
              </div>

              <div className="flex flex-col md:flex-row gap-3">
                <input
                  type="text"
                  value={newPassword}
                  onChange={(e) => setNewPassword(e.target.value)}
                  placeholder="Mật khẩu mới (>= 6 ký tự)"
                  className="flex-1 px-4 py-2.5 bg-gray-900 border border-white/10 rounded-xl text-white placeholder-gray-500 focus:outline-none focus:border-purple-500/50"
                />
                <button
                  onClick={() => {
                    if (newPassword.length < 6) return toast.error('Mật khẩu phải >= 6 ký tự');
                    onResetPassword(newPassword);
                    setNewPassword('');
                  }}
                  disabled={isActionLoading}
                  className="px-4 py-2.5 rounded-xl font-medium bg-amber-500/20 text-amber-300 border border-amber-500/30 hover:bg-amber-500/30 transition-all disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  Reset mật khẩu
                </button>
              </div>

              <button
                onClick={onDeleteAllData}
                disabled={isActionLoading}
                className="w-full px-4 py-2.5 rounded-xl font-medium bg-rose-500/20 text-rose-300 border border-rose-500/30 hover:bg-rose-500/30 transition-all disabled:opacity-50 disabled:cursor-not-allowed"
              >
                Xóa toàn bộ dữ liệu user (lessons/quizzes/chats/roadmaps)
              </button>
            </div>

            {/* User Activity Logs */}
            <div className="bg-white/5 rounded-2xl border border-white/10 p-4">
              <h5 className="font-medium text-white mb-3">Hoạt động gần đây</h5>
              <div className="space-y-2 max-h-56 overflow-y-auto pr-1">
                {(activityData?.data?.logs || []).length === 0 ? (
                  <p className="text-sm text-gray-500">Chưa có log hoạt động</p>
                ) : (
                  (activityData?.data?.logs || []).map((log, index) => (
                    <div key={`${log.id || log._id || index}`} className="p-3 bg-gray-900/60 rounded-xl border border-white/5">
                      <p className="text-sm text-white">{log.type || log.action || 'activity'}</p>
                      <p className="text-xs text-gray-500 mt-1">{new Date(log.createdAt).toLocaleString('vi-VN')}</p>
                    </div>
                  ))
                )}
              </div>
            </div>

            {/* Recent Lessons */}
            {userDetails?.lessons?.length > 0 && (
              <div>
                <h5 className="font-medium text-white mb-3">Bài học gần đây</h5>
                <div className="space-y-2">
                  {userDetails.lessons.slice(0, 5).map((lesson) => (
                    <div key={lesson._id} className="p-3 bg-white/5 rounded-xl border border-white/5 hover:border-white/10 transition-colors">
                      <div className="font-medium text-white">{lesson.title}</div>
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

// Lessons Tab - Dark Theme
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
          <MagnifyingGlassIcon className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-500" />
          <input
            type="text"
            placeholder="Tìm kiếm bài học..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="w-full pl-12 pr-4 py-3 bg-white/5 border border-white/10 rounded-xl text-white placeholder-gray-500 focus:outline-none focus:border-purple-500/50 focus:ring-2 focus:ring-purple-500/20 transition-all"
          />
        </div>
        <select
          value={subject}
          onChange={(e) => setSubject(e.target.value)}
          className="px-4 py-3 bg-white/5 border border-white/10 rounded-xl text-white focus:outline-none focus:border-purple-500/50"
        >
          <option value="">Tất cả môn</option>
          {subjects?.data?.subjects?.map((s) => (
            <option key={s} value={s}>{s}</option>
          ))}
        </select>
        <span className="text-sm text-gray-400 bg-white/5 px-4 py-2 rounded-lg border border-white/10">
          {pagination?.total || 0} bài học
        </span>
      </div>

      {/* Lessons Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
        {lessons.map((lesson, index) => (
          <motion.div
            key={lesson._id}
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: index * 0.05 }}
            className="bg-gray-900/50 backdrop-blur-xl rounded-2xl border border-white/10 p-5 hover:border-purple-500/30 transition-all group"
          >
            <div className="flex items-start justify-between mb-3">
              <span className="px-3 py-1 bg-purple-500/20 text-purple-300 rounded-lg text-xs font-medium border border-purple-500/30">
                {lesson.subject || 'Chung'}
              </span>
              <button
                onClick={() => setDeleteTarget(lesson)}
                className="p-2 text-gray-500 hover:text-red-400 hover:bg-red-500/10 rounded-lg opacity-0 group-hover:opacity-100 transition-all"
              >
                <TrashIcon className="w-5 h-5" />
              </button>
            </div>
            <h4 className="font-semibold text-white mb-2 line-clamp-2">{lesson.title}</h4>
            <p className="text-sm text-gray-500 line-clamp-2 mb-4">
              {stripLatexForPlainText(lesson.content || '').substring(0, 100)}...
            </p>
            <div className="flex items-center justify-between text-xs text-gray-500">
              <span>{lesson.creator?.name || 'Ẩn danh'}</span>
              <span>{new Date(lesson.createdAt).toLocaleDateString('vi-VN')}</span>
            </div>
            <div className="flex gap-2 mt-3">
              {lesson.hasAudio && (
                <span className="px-2 py-1 bg-green-500/20 text-green-300 rounded-lg text-xs border border-green-500/30">
                  🔊 Audio
                </span>
              )}
              {lesson.completed && (
                <span className="px-2 py-1 bg-blue-500/20 text-blue-300 rounded-lg text-xs border border-blue-500/30">
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
            className="px-4 py-2 bg-white/5 border border-white/10 rounded-xl text-white disabled:opacity-50 disabled:cursor-not-allowed hover:bg-white/10 transition-colors"
          >
            Trước
          </button>
          <span className="text-sm text-gray-400 px-4">
            Trang {page} / {pagination.pages}
          </span>
          <button
            onClick={() => setPage(p => Math.min(pagination.pages, p + 1))}
            disabled={page === pagination.pages}
            className="px-4 py-2 bg-white/5 border border-white/10 rounded-xl text-white disabled:opacity-50 disabled:cursor-not-allowed hover:bg-white/10 transition-colors"
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

// Quizzes Tab - Dark Theme
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
          <MagnifyingGlassIcon className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-500" />
          <input
            type="text"
            placeholder="Tìm kiếm quiz..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="w-full pl-12 pr-4 py-3 bg-white/5 border border-white/10 rounded-xl text-white placeholder-gray-500 focus:outline-none focus:border-purple-500/50 focus:ring-2 focus:ring-purple-500/20 transition-all"
          />
        </div>
        <span className="text-sm text-gray-400 bg-white/5 px-4 py-2 rounded-lg border border-white/10">
          {pagination?.total || 0} quiz
        </span>
      </div>

      {/* Quizzes Table */}
      <div className="bg-gray-900/50 backdrop-blur-xl rounded-2xl border border-white/10 overflow-hidden">
        <table className="w-full">
          <thead className="bg-white/5">
            <tr>
              <th className="px-6 py-4 text-left text-xs font-medium text-gray-400 uppercase tracking-wider">Chủ đề</th>
              <th className="px-6 py-4 text-left text-xs font-medium text-gray-400 uppercase tracking-wider">Số câu</th>
              <th className="px-6 py-4 text-left text-xs font-medium text-gray-400 uppercase tracking-wider">Điểm</th>
              <th className="px-6 py-4 text-left text-xs font-medium text-gray-400 uppercase tracking-wider">Trạng thái</th>
              <th className="px-6 py-4 text-left text-xs font-medium text-gray-400 uppercase tracking-wider">Người tạo</th>
              <th className="px-6 py-4 text-left text-xs font-medium text-gray-400 uppercase tracking-wider">Ngày tạo</th>
              <th className="px-6 py-4 text-right text-xs font-medium text-gray-400 uppercase tracking-wider">Thao tác</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-white/5">
            {quizzes.map((quiz) => (
              <tr key={quiz._id} className="hover:bg-white/5 transition-colors">
                <td className="px-6 py-4">
                  <div className="font-medium text-white">{quiz.topic || quiz.title || 'Quiz'}</div>
                </td>
                <td className="px-6 py-4 text-gray-300">{quiz.questions?.length || 0}</td>
                <td className="px-6 py-4">
                  {quiz.score !== undefined ? (
                    <span className={`font-medium ${
                      quiz.score >= 80 ? 'text-green-400' : 
                      quiz.score >= 50 ? 'text-yellow-400' : 'text-red-400'
                    }`}>
                      {quiz.score}%
                    </span>
                  ) : <span className="text-gray-500">-</span>}
                </td>
                <td className="px-6 py-4">
                  <span className={`px-3 py-1 rounded-lg text-xs font-medium ${
                    quiz.completed 
                      ? 'bg-green-500/20 text-green-300 border border-green-500/30' 
                      : 'bg-white/10 text-gray-400 border border-white/10'
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
                    className="p-2 text-gray-400 hover:text-red-400 hover:bg-red-500/10 rounded-lg transition-colors"
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
            className="px-4 py-2 bg-white/5 border border-white/10 rounded-xl text-white disabled:opacity-50 disabled:cursor-not-allowed hover:bg-white/10 transition-colors"
          >
            Trước
          </button>
          <span className="text-sm text-gray-400 px-4">
            Trang {page} / {pagination.pages}
          </span>
          <button
            onClick={() => setPage(p => Math.min(pagination.pages, p + 1))}
            disabled={page === pagination.pages}
            className="px-4 py-2 bg-white/5 border border-white/10 rounded-xl text-white disabled:opacity-50 disabled:cursor-not-allowed hover:bg-white/10 transition-colors"
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

// Settings Tab - Dark Theme
const SettingsTab = () => {
  const { data, isLoading } = useQuery('adminSettings', adminAPI.getSettings);
  const { data: logs } = useQuery('adminLogs', () => adminAPI.getLogs({ limit: 20 }));

  if (isLoading) return <LoadingSpinner />;

  const settings = data?.data?.settings;

  return (
    <div className="space-y-6">
      {/* System Settings */}
      <div className="bg-gray-900/50 backdrop-blur-xl rounded-2xl p-6 border border-white/10">
        <h3 className="text-lg font-semibold text-white mb-6 flex items-center gap-2">
          <Cog6ToothIcon className="w-5 h-5 text-purple-400" />
          Cài đặt hệ thống
        </h3>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <div>
            <label className="block text-sm font-medium text-gray-400 mb-2">Tên website</label>
            <input
              type="text"
              value={settings?.siteName || ''}
              disabled
              className="w-full px-4 py-3 bg-white/5 border border-white/10 rounded-xl text-gray-300"
            />
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-400 mb-2">AI Model</label>
            <input
              type="text"
              value={settings?.aiModel || ''}
              disabled
              className="w-full px-4 py-3 bg-white/5 border border-white/10 rounded-xl text-gray-300"
            />
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-400 mb-2">Max Upload Size</label>
            <input
              type="text"
              value={`${(settings?.maxUploadSize || 0) / 1024 / 1024} MB`}
              disabled
              className="w-full px-4 py-3 bg-white/5 border border-white/10 rounded-xl text-gray-300"
            />
          </div>
        </div>
      </div>

      {/* Features */}
      <div className="bg-gray-900/50 backdrop-blur-xl rounded-2xl p-6 border border-white/10">
        <h3 className="text-lg font-semibold text-white mb-6 flex items-center gap-2">
          <SparklesIcon className="w-5 h-5 text-cyan-400" />
          Tính năng
        </h3>
        <div className="grid grid-cols-2 md:grid-cols-3 gap-4">
          {Object.entries(settings?.features || {}).map(([feature, enabled]) => (
            <div key={feature} className="flex items-center gap-3 p-4 bg-white/5 rounded-xl border border-white/10">
              <div className={`w-3 h-3 rounded-full ${enabled ? 'bg-green-500' : 'bg-gray-600'}`} />
              <span className="capitalize text-gray-300">{feature}</span>
            </div>
          ))}
        </div>
      </div>

      {/* Activity Logs */}
      <div className="bg-gray-900/50 backdrop-blur-xl rounded-2xl p-6 border border-white/10">
        <h3 className="text-lg font-semibold text-white mb-6 flex items-center gap-2">
          <ClockIcon className="w-5 h-5 text-orange-400" />
          Nhật ký hoạt động
        </h3>
        <div className="space-y-3 max-h-96 overflow-y-auto">
          {logs?.data?.logs?.map((log) => (
            <div key={log._id} className="flex items-center gap-4 p-4 bg-white/5 rounded-xl border border-white/10 hover:border-white/20 transition-colors">
              <div className="w-10 h-10 rounded-xl bg-white/10 flex items-center justify-center">
                <ClockIcon className="w-5 h-5 text-gray-400" />
              </div>
              <div className="flex-1">
                <p className="text-sm text-white">{log.type}</p>
                <p className="text-xs text-gray-500">
                  {new Date(log.createdAt).toLocaleString('vi-VN')}
                </p>
              </div>
            </div>
          ))}
          {!logs?.data?.logs?.length && (
            <p className="text-center text-gray-500 py-8">Chưa có hoạt động nào</p>
          )}
        </div>
      </div>
    </div>
  );
};

// Delete Modal - Dark Theme
const DeleteModal = ({ title, message, onConfirm, onCancel, isLoading }) => (
  <motion.div
    initial={{ opacity: 0 }}
    animate={{ opacity: 1 }}
    exit={{ opacity: 0 }}
    className="fixed inset-0 bg-black/70 backdrop-blur-sm flex items-center justify-center z-50 p-4"
    onClick={onCancel}
  >
    <motion.div
      initial={{ scale: 0.95, opacity: 0 }}
      animate={{ scale: 1, opacity: 1 }}
      exit={{ scale: 0.95, opacity: 0 }}
      className="bg-gray-900 rounded-2xl border border-white/10 shadow-2xl max-w-md w-full p-6"
      onClick={(e) => e.stopPropagation()}
    >
      <div className="flex items-center gap-4 mb-6">
        <div className="w-14 h-14 bg-red-500/20 rounded-2xl flex items-center justify-center">
          <ExclamationTriangleIcon className="w-7 h-7 text-red-400" />
        </div>
        <div>
          <h3 className="text-lg font-semibold text-white">{title}</h3>
          <p className="text-sm text-gray-400 mt-1">{message}</p>
        </div>
      </div>
      <div className="flex justify-end gap-3">
        <button
          onClick={onCancel}
          disabled={isLoading}
          className="px-5 py-2.5 bg-white/10 text-white rounded-xl hover:bg-white/20 transition-colors"
        >
          Hủy
        </button>
        <button
          onClick={onConfirm}
          disabled={isLoading}
          className="px-5 py-2.5 bg-gradient-to-r from-red-500 to-rose-500 text-white rounded-xl hover:shadow-lg hover:shadow-red-500/25 transition-all flex items-center gap-2"
        >
          {isLoading && <ArrowPathIcon className="w-4 h-4 animate-spin" />}
          Xóa
        </button>
      </div>
    </motion.div>
  </motion.div>
);

// Loading Spinner - Dark Theme
const LoadingSpinner = () => (
  <div className="flex items-center justify-center py-12">
    <div className="w-12 h-12 border-4 border-purple-500/30 border-t-purple-500 rounded-full animate-spin"></div>
  </div>
);

// Error Message - Dark Theme
const ErrorMessage = ({ message }) => (
  <div className="p-6 bg-red-500/10 border border-red-500/20 rounded-2xl">
    <div className="flex items-center gap-3 text-red-400">
      <ExclamationTriangleIcon className="w-6 h-6" />
      <p>Lỗi: {message}</p>
    </div>
  </div>
);

// Chats Tab - Dark Theme
const ChatsTab = () => {
  const queryClient = useQueryClient();
  const [page, setPage] = useState(1);
  const [searchQuery, setSearchQuery] = useState('');
  const [deleteConfirm, setDeleteConfirm] = useState(null);

  const { data, isLoading } = useQuery(['adminChats', page, searchQuery], () => 
    adminAPI.getChats({ page, limit: 20, userId: searchQuery })
  );

  const deleteMutation = useMutation(adminAPI.deleteChat, {
    onSuccess: () => {
      queryClient.invalidateQueries('adminChats');
      toast.success('Chat đã được xóa');
      setDeleteConfirm(null);
    }
  });

  if (isLoading) return <LoadingSpinner />;

  const chats = data?.data?.chats || [];
  const pagination = data?.data?.pagination || {};

  return (
    <div className="space-y-6">
      {/* Search Bar */}
      <div className="flex gap-4">
        <div className="flex-1 relative">
          <MagnifyingGlassIcon className="w-5 h-5 absolute left-4 top-1/2 -translate-y-1/2 text-gray-500" />
          <input
            type="text"
            placeholder="Tìm theo User ID hoặc Email..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="w-full pl-12 pr-4 py-3 bg-gray-900 border border-white/10 rounded-xl text-white placeholder-gray-500 focus:outline-none focus:ring-2 focus:ring-purple-500"
          />
        </div>
      </div>

      {/* Chats Table */}
      <div className="bg-gray-900 rounded-2xl border border-white/10 overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full">
            <thead className="bg-white/5">
              <tr>
                <th className="px-6 py-4 text-left text-sm font-semibold text-gray-400">User</th>
                <th className="px-6 py-4 text-left text-sm font-semibold text-gray-400">Nội dung</th>
                <th className="px-6 py-4 text-left text-sm font-semibold text-gray-400">Ngày tạo</th>
                <th className="px-6 py-4 text-right text-sm font-semibold text-gray-400">Thao tác</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-white/5">
              {chats.map((chat) => (
                <tr key={chat.id} className="hover:bg-white/5 transition-colors">
                  <td className="px-6 py-4">
                    <div>
                      <p className="text-white font-medium">{chat.userName}</p>
                      <p className="text-sm text-gray-500">{chat.userEmail}</p>
                    </div>
                  </td>
                  <td className="px-6 py-4">
                    <p className="text-gray-400 text-sm truncate max-w-md">
                      {chat.messages?.[0]?.content || 'No content'}
                    </p>
                  </td>
                  <td className="px-6 py-4">
                    <p className="text-gray-400 text-sm">
                      {new Date(chat.createdAt).toLocaleString('vi-VN')}
                    </p>
                  </td>
                  <td className="px-6 py-4">
                    <div className="flex items-center justify-end gap-2">
                      <button
                        onClick={() => setDeleteConfirm(chat)}
                        className="p-2 text-red-400 hover:bg-red-500/20 rounded-lg transition-colors"
                      >
                        <TrashIcon className="w-5 h-5" />
                      </button>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>

        {/* Pagination */}
        {pagination.pages > 1 && (
          <div className="px-6 py-4 border-t border-white/5 flex items-center justify-between">
            <p className="text-sm text-gray-500">
              Trang {pagination.page} / {pagination.pages} - Tổng {pagination.total}
            </p>
            <div className="flex gap-2">
              <button
                onClick={() => setPage(p => Math.max(1, p - 1))}
                disabled={page === 1}
                className="px-4 py-2 bg-white/10 text-white rounded-lg hover:bg-white/20 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
              >
                Trước
              </button>
              <button
                onClick={() => setPage(p => Math.min(pagination.pages, p + 1))}
                disabled={page === pagination.pages}
                className="px-4 py-2 bg-white/10 text-white rounded-lg hover:bg-white/20 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
              >
                Sau
              </button>
            </div>
          </div>
        )}
      </div>

      {/* Delete Confirmation */}
      <AnimatePresence>
        {deleteConfirm && (
          <DeleteModal
            title="Xóa Chat"
            message={`Bạn có chắc muốn xóa chat này?`}
            onConfirm={() => deleteMutation.mutate(deleteConfirm.id)}
            onCancel={() => setDeleteConfirm(null)}
            isLoading={deleteMutation.isLoading}
          />
        )}
      </AnimatePresence>
    </div>
  );
};

// Roadmaps Tab - Dark Theme
const RoadmapsTab = () => {
  const queryClient = useQueryClient();
  const [page, setPage] = useState(1);
  const [deleteConfirm, setDeleteConfirm] = useState(null);

  const { data, isLoading } = useQuery(['adminRoadmaps', page], () => 
    adminAPI.getRoadmaps({ page, limit: 20 })
  );

  const deleteMutation = useMutation(adminAPI.deleteRoadmap, {
    onSuccess: () => {
      queryClient.invalidateQueries('adminRoadmaps');
      toast.success('Roadmap đã được xóa');
      setDeleteConfirm(null);
    }
  });

  if (isLoading) return <LoadingSpinner />;

  const roadmaps = data?.data?.roadmaps || [];
  const pagination = data?.data?.pagination || {};

  return (
    <div className="space-y-6">
      {/* Stats */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <StatCard
          title="Tổng Roadmaps"
          value={pagination.total || 0}
          icon={MapIcon}
          color="purple"
        />
      </div>

      {/* Roadmaps Table */}
      <div className="bg-gray-900 rounded-2xl border border-white/10 overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full">
            <thead className="bg-white/5">
              <tr>
                <th className="px-6 py-4 text-left text-sm font-semibold text-gray-400">User</th>
                <th className="px-6 py-4 text-left text-sm font-semibold text-gray-400">Career</th>
                <th className="px-6 py-4 text-left text-sm font-semibold text-gray-400">Timeline</th>
                <th className="px-6 py-4 text-left text-sm font-semibold text-gray-400">Ngày tạo</th>
                <th className="px-6 py-4 text-right text-sm font-semibold text-gray-400">Thao tác</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-white/5">
              {roadmaps.map((roadmap) => (
                <tr key={roadmap.id} className="hover:bg-white/5 transition-colors">
                  <td className="px-6 py-4">
                    <div>
                      <p className="text-white font-medium">{roadmap.userName}</p>
                      <p className="text-sm text-gray-500">{roadmap.userEmail}</p>
                    </div>
                  </td>
                  <td className="px-6 py-4">
                    <p className="text-gray-300">{roadmap.career || 'N/A'}</p>
                  </td>
                  <td className="px-6 py-4">
                    <p className="text-gray-400 text-sm">{roadmap.timeline || 'N/A'}</p>
                  </td>
                  <td className="px-6 py-4">
                    <p className="text-gray-400 text-sm">
                      {new Date(roadmap.createdAt).toLocaleString('vi-VN')}
                    </p>
                  </td>
                  <td className="px-6 py-4">
                    <div className="flex items-center justify-end gap-2">
                      <button
                        onClick={() => setDeleteConfirm(roadmap)}
                        className="p-2 text-red-400 hover:bg-red-500/20 rounded-lg transition-colors"
                      >
                        <TrashIcon className="w-5 h-5" />
                      </button>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>

        {/* Pagination */}
        {pagination.pages > 1 && (
          <div className="px-6 py-4 border-t border-white/5 flex items-center justify-between">
            <p className="text-sm text-gray-500">
              Trang {pagination.page} / {pagination.pages}
            </p>
            <div className="flex gap-2">
              <button
                onClick={() => setPage(p => Math.max(1, p - 1))}
                disabled={page === 1}
                className="px-4 py-2 bg-white/10 text-white rounded-lg hover:bg-white/20 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
              >
                Trước
              </button>
              <button
                onClick={() => setPage(p => Math.min(pagination.pages, p + 1))}
                disabled={page === pagination.pages}
                className="px-4 py-2 bg-white/10 text-white rounded-lg hover:bg-white/20 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
              >
                Sau
              </button>
            </div>
          </div>
        )}
      </div>

      {/* Delete Confirmation */}
      <AnimatePresence>
        {deleteConfirm && (
          <DeleteModal
            title="Xóa Roadmap"
            message="Bạn có chắc muốn xóa roadmap này?"
            onConfirm={() => deleteMutation.mutate(deleteConfirm.id)}
            onCancel={() => setDeleteConfirm(null)}
            isLoading={deleteMutation.isLoading}
          />
        )}
      </AnimatePresence>
    </div>
  );
};

// System Logs Tab - Dark Theme
const LogsTab = () => {
  const [page, setPage] = useState(1);
  const [typeFilter, setTypeFilter] = useState('');

  const { data, isLoading } = useQuery(['adminLogs', page, typeFilter], () => 
    adminAPI.getLogs({ page, limit: 50, type: typeFilter })
  );

  if (isLoading) return <LoadingSpinner />;

  const logs = data?.data?.logs || [];
  const pagination = data?.data?.pagination || {};

  const typeColors = {
    info: 'text-blue-400 bg-blue-500/20',
    warning: 'text-yellow-400 bg-yellow-500/20',
    error: 'text-red-400 bg-red-500/20',
    success: 'text-green-400 bg-green-500/20'
  };

  return (
    <div className="space-y-6">
      {/* Filter */}
      <div className="flex gap-4">
        <select
          value={typeFilter}
          onChange={(e) => setTypeFilter(e.target.value)}
          className="px-4 py-3 bg-gray-900 border border-white/10 rounded-xl text-white focus:outline-none focus:ring-2 focus:ring-purple-500"
        >
          <option value="">Tất cả loại</option>
          <option value="info">Info</option>
          <option value="warning">Warning</option>
          <option value="error">Error</option>
          <option value="success">Success</option>
        </select>
      </div>

      {/* Logs List */}
      <div className="bg-gray-900 rounded-2xl border border-white/10 overflow-hidden">
        <div className="divide-y divide-white/5 max-h-[600px] overflow-y-auto">
          {logs.map((log, index) => (
            <div key={index} className="p-4 hover:bg-white/5 transition-colors">
              <div className="flex items-start gap-4">
                <span className={`px-2 py-1 text-xs font-medium rounded-lg ${typeColors[log.type] || typeColors.info}`}>
                  {log.type || 'info'}
                </span>
                <div className="flex-1">
                  <p className="text-white font-medium">{log.message || log.action}</p>
                  <p className="text-sm text-gray-500 mt-1">
                    User: {log.userId} - {new Date(log.createdAt).toLocaleString('vi-VN')}
                  </p>
                </div>
              </div>
            </div>
          ))}
        </div>

        {/* Pagination */}
        {pagination.pages > 1 && (
          <div className="px-6 py-4 border-t border-white/5 flex items-center justify-between">
            <p className="text-sm text-gray-500">
              Trang {pagination.page} / {pagination.pages}
            </p>
            <div className="flex gap-2">
              <button
                onClick={() => setPage(p => Math.max(1, p - 1))}
                disabled={page === 1}
                className="px-4 py-2 bg-white/10 text-white rounded-lg hover:bg-white/20 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
              >
                Trước
              </button>
              <button
                onClick={() => setPage(p => Math.min(pagination.pages, p + 1))}
                disabled={page === pagination.pages}
                className="px-4 py-2 bg-white/10 text-white rounded-lg hover:bg-white/20 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
              >
                Sau
              </button>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

// Database Tab - Dark Theme
const DatabaseTab = () => {
  const queryClient = useQueryClient();
  const [cleanDays, setCleanDays] = useState(90);

  const { data: dbStats, isLoading } = useQuery('adminDatabaseStats', adminAPI.getDatabaseStats);

  const cleanMutation = useMutation(adminAPI.cleanDatabase, {
    onSuccess: (data) => {
      queryClient.invalidateQueries('adminDatabaseStats');
      toast.success(`Đã xóa ${data.data.deletedCount} bản ghi cũ`);
    }
  });

  if (isLoading) return <LoadingSpinner />;

  const stats = dbStats?.data?.stats || {};
  const collections = stats.collections || {};

  return (
    <div className="space-y-6">
      {/* Database Stats */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
        <StatCard
          title="Users"
          value={collections.users || 0}
          icon={UsersIcon}
          color="blue"
        />
        <StatCard
          title="Lessons"
          value={collections.lessons || 0}
          icon={BookOpenIcon}
          color="green"
        />
        <StatCard
          title="Quizzes"
          value={collections.quizzes || 0}
          icon={ClipboardDocumentListIcon}
          color="purple"
        />
        <StatCard
          title="Chats"
          value={collections.chats || 0}
          icon={ChatBubbleLeftRightIcon}
          color="orange"
        />
      </div>

      {/* Additional Stats */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <StatCard
          title="Roadmaps"
          value={collections.roadmaps || 0}
          icon={MapIcon}
          color="cyan"
        />
        <StatCard
          title="Activity Logs"
          value={collections.activityLogs || 0}
          icon={DocumentTextIcon}
          color="blue"
        />
        <StatCard
          title="Learning Stats"
          value={collections.learningStats || 0}
          icon={ChartBarIcon}
          color="green"
        />
      </div>

      {/* System Info */}
      <div className="bg-gray-900 rounded-2xl border border-white/10 p-6">
        <h3 className="text-lg font-semibold text-white mb-4">System Information</h3>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div>
            <p className="text-sm text-gray-500">Uptime</p>
            <p className="text-white font-mono">
              {Math.floor((stats.uptime || 0) / 3600)}h {Math.floor(((stats.uptime || 0) % 3600) / 60)}m
            </p>
          </div>
          <div>
            <p className="text-sm text-gray-500">Memory Usage</p>
            <p className="text-white font-mono">
              {((stats.memory?.heapUsed || 0) / 1024 / 1024).toFixed(2)} MB
            </p>
          </div>
        </div>
      </div>

      {/* Database Cleanup */}
      <div className="bg-gray-900 rounded-2xl border border-white/10 p-6">
        <h3 className="text-lg font-semibold text-white mb-4">Database Cleanup</h3>
        <p className="text-gray-400 text-sm mb-4">
          Xóa dữ liệu cũ để tối ưu database (activity logs, failed audio, v.v.)
        </p>
        <div className="flex items-center gap-4">
          <input
            type="number"
            value={cleanDays}
            onChange={(e) => setCleanDays(parseInt(e.target.value))}
            min="30"
            max="365"
            className="w-32 px-4 py-2 bg-gray-800 border border-white/10 rounded-lg text-white focus:outline-none focus:ring-2 focus:ring-purple-500"
          />
          <span className="text-gray-400">ngày</span>
          <button
            onClick={() => cleanMutation.mutate(cleanDays)}
            disabled={cleanMutation.isLoading}
            className="px-6 py-2 bg-gradient-to-r from-purple-500 to-pink-500 text-white rounded-xl font-medium hover:shadow-lg hover:shadow-purple-500/25 transition-all flex items-center gap-2 disabled:opacity-50"
          >
            {cleanMutation.isLoading && <ArrowPathIcon className="w-4 h-4 animate-spin" />}
            Clean Database
          </button>
        </div>
      </div>
    </div>
  );
};

// Main Admin Page - Dark Theme
const Admin = () => {
  const { user } = useAuth();
  const [activeTab, setActiveTab] = useState('dashboard');

  // Check if user is admin
  if (!user || user.role !== 'admin') {
    return (
      <div className="min-h-screen bg-gray-950 flex items-center justify-center relative overflow-hidden">
        {/* Background effects */}
        <div className="absolute inset-0 overflow-hidden pointer-events-none">
          <div className="absolute top-1/4 -left-20 w-96 h-96 bg-red-500/10 rounded-full blur-3xl"></div>
          <div className="absolute bottom-1/4 -right-20 w-96 h-96 bg-orange-500/10 rounded-full blur-3xl"></div>
        </div>
        
        <div className="relative z-10 text-center p-8 bg-gray-900/50 backdrop-blur-xl rounded-2xl border border-white/10 max-w-md">
          <div className="w-20 h-20 bg-red-500/20 rounded-2xl flex items-center justify-center mx-auto mb-6">
            <ExclamationTriangleIcon className="w-10 h-10 text-red-400" />
          </div>
          <h1 className="text-2xl font-bold text-white mb-2">Truy cập bị từ chối</h1>
          <p className="text-gray-400 mb-6">
            Bạn không có quyền truy cập trang quản trị.
          </p>
          <Link 
            to="/dashboard" 
            className="inline-flex items-center gap-2 px-6 py-3 bg-gradient-to-r from-purple-500 to-pink-500 text-white rounded-xl font-medium hover:shadow-lg hover:shadow-purple-500/25 transition-all"
          >
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
      case 'chats':
        return <ChatsTab />;
      case 'roadmaps':
        return <RoadmapsTab />;
      case 'logs':
        return <LogsTab />;
      case 'database':
        return <DatabaseTab />;
      case 'settings':
        return <SettingsTab />;
      default:
        return <DashboardTab />;
    }
  };

  return (
    <div className="min-h-screen bg-gray-950 relative">
      {/* Background effects */}
      <div className="absolute inset-0 overflow-hidden pointer-events-none">
        <div className="absolute top-0 left-1/4 w-96 h-96 bg-purple-500/5 rounded-full blur-3xl"></div>
        <div className="absolute bottom-0 right-1/4 w-96 h-96 bg-pink-500/5 rounded-full blur-3xl"></div>
        <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[1000px] h-[1000px] bg-cyan-500/5 rounded-full blur-3xl"></div>
      </div>

      {/* Header */}
      <header className="relative z-10 bg-gray-900/50 backdrop-blur-xl border-b border-white/10 sticky top-0 z-40">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex items-center justify-between h-16">
            <div className="flex items-center gap-4">
              <Link to="/dashboard" className="text-gray-400 hover:text-white transition-colors">
                ← Quay lại
              </Link>
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 bg-gradient-to-br from-purple-500 to-pink-500 rounded-xl flex items-center justify-center shadow-lg shadow-purple-500/20">
                  <ShieldCheckIcon className="w-6 h-6 text-white" />
                </div>
                <h1 className="text-xl font-bold text-white">
                  Admin Panel
                </h1>
              </div>
            </div>
            <div className="flex items-center gap-4">
              <span className="text-sm text-gray-400">
                Xin chào, <span className="font-medium text-white">{user.name}</span>
              </span>
            </div>
          </div>
        </div>
      </header>

      <div className="relative z-10 max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Tabs */}
        <div className="flex gap-2 mb-8 overflow-x-auto pb-2">
          {tabs.map((tab) => (
            <button
              key={tab.id}
              onClick={() => setActiveTab(tab.id)}
              className={`flex items-center gap-2 px-5 py-3 rounded-xl font-medium transition-all whitespace-nowrap ${
                activeTab === tab.id
                  ? 'bg-gradient-to-r from-purple-500 to-pink-500 text-white shadow-lg shadow-purple-500/25'
                  : 'bg-white/5 text-gray-400 hover:bg-white/10 hover:text-white border border-white/10'
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
