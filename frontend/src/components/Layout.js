import React from 'react';
import { Outlet, NavLink, useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { 
  HomeIcon, 
  CloudArrowUpIcon, 
  BookOpenIcon, 
  QuestionMarkCircleIcon,
  ChatBubbleLeftRightIcon,
  MapIcon,
  CalendarDaysIcon,
  BriefcaseIcon,
  UserCircleIcon,
  ArrowRightOnRectangleIcon,
  AcademicCapIcon,
  Cog6ToothIcon
} from '@heroicons/react/24/outline';

const Layout = () => {
  const { user, logout } = useAuth();
  const navigate = useNavigate();

  const handleLogout = async () => {
    await logout();
    navigate('/');
  };

  const navigation = [
    { name: 'Dashboard', href: '/dashboard', icon: HomeIcon },
    { name: 'Upload SGK', href: '/upload', icon: CloudArrowUpIcon },
    { name: 'Bài học', href: '/lessons', icon: BookOpenIcon },
    { name: 'Quiz', href: '/quiz', icon: QuestionMarkCircleIcon },
    { name: 'Hỏi đáp', href: '/chat', icon: ChatBubbleLeftRightIcon },
    { name: 'Lộ trình', href: '/roadmap', icon: MapIcon },
    { name: 'Ôn thi TN THPT', href: '/study-plan', icon: CalendarDaysIcon },
    { name: 'Hướng nghiệp', href: '/career', icon: BriefcaseIcon },
  ];

  // Add admin link if user is admin
  if (user?.role === 'admin') {
    navigation.push({ name: 'Quản trị', href: '/admin', icon: Cog6ToothIcon, isAdmin: true });
  }

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Sidebar */}
      <aside className="fixed inset-y-0 left-0 w-64 bg-white shadow-soft z-30">
        {/* Logo */}
        <div className="flex items-center gap-3 px-6 py-5 border-b border-gray-100">
          <div className="w-10 h-10 bg-gradient-primary rounded-xl flex items-center justify-center">
            <AcademicCapIcon className="w-6 h-6 text-white" />
          </div>
          <div>
            <h1 className="font-display font-bold text-lg text-gray-900">Edumentor</h1>
            <p className="text-xs text-gray-500">Học thông minh hơn</p>
          </div>
        </div>

        {/* Navigation */}
        <nav className="p-4 space-y-1">
          {navigation.map((item) => (
            <NavLink
              key={item.name}
              to={item.href}
              className={({ isActive }) =>
                `flex items-center gap-3 px-4 py-3 rounded-lg transition-all duration-200 ${
                  isActive
                    ? item.isAdmin 
                      ? 'bg-orange-50 text-orange-700 font-medium'
                      : 'bg-primary-50 text-primary-700 font-medium'
                    : item.isAdmin
                      ? 'text-orange-600 hover:bg-orange-50 hover:text-orange-700'
                      : 'text-gray-600 hover:bg-gray-50 hover:text-gray-900'
                }`
              }
            >
              <item.icon className="w-5 h-5" />
              {item.name}
              {item.isAdmin && (
                <span className="ml-auto px-2 py-0.5 bg-orange-100 text-orange-600 text-xs rounded-full">
                  Admin
                </span>
              )}
            </NavLink>
          ))}
        </nav>

        {/* User section */}
        <div className="absolute bottom-0 left-0 right-0 p-4 border-t border-gray-100">
          <NavLink
            to="/profile"
            className={({ isActive }) =>
              `flex items-center gap-3 px-4 py-3 rounded-lg transition-all duration-200 ${
                isActive
                  ? 'bg-primary-50 text-primary-700'
                  : 'text-gray-600 hover:bg-gray-50'
              }`
            }
          >
            <UserCircleIcon className="w-5 h-5" />
            <div className="flex-1 min-w-0">
              <p className="text-sm font-medium truncate">{user?.name}</p>
              <p className="text-xs text-gray-400 truncate">{user?.email}</p>
            </div>
          </NavLink>
          
          <button
            onClick={handleLogout}
            className="w-full flex items-center gap-3 px-4 py-3 rounded-lg text-red-600 hover:bg-red-50 transition-all duration-200 mt-1"
          >
            <ArrowRightOnRectangleIcon className="w-5 h-5" />
            Đăng xuất
          </button>
        </div>
      </aside>

      {/* Main content */}
      <main className="pl-64">
        <div className="p-8">
          <Outlet />
        </div>
      </main>
    </div>
  );
};

export default Layout;
