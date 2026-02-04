import React, { useState } from 'react';
import { Outlet, NavLink, useNavigate, useLocation } from 'react-router-dom';
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
  Cog6ToothIcon,
  Bars3Icon,
  XMarkIcon,
  EllipsisHorizontalIcon
} from '@heroicons/react/24/outline';
import {
  HomeIcon as HomeIconSolid,
  CloudArrowUpIcon as CloudArrowUpIconSolid,
  BookOpenIcon as BookOpenIconSolid,
  ChatBubbleLeftRightIcon as ChatBubbleLeftRightIconSolid,
  UserCircleIcon as UserCircleIconSolid
} from '@heroicons/react/24/solid';

const Layout = () => {
  const { user, logout } = useAuth();
  const navigate = useNavigate();
  const location = useLocation();
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const [moreMenuOpen, setMoreMenuOpen] = useState(false);

  const handleLogout = async () => {
    await logout();
    navigate('/');
  };

  // Full navigation for sidebar
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

  // Bottom navigation for mobile (5 main items)
  const bottomNavigation = [
    { name: 'Trang chủ', href: '/dashboard', icon: HomeIcon, iconSolid: HomeIconSolid },
    { name: 'Upload', href: '/upload', icon: CloudArrowUpIcon, iconSolid: CloudArrowUpIconSolid },
    { name: 'Bài học', href: '/lessons', icon: BookOpenIcon, iconSolid: BookOpenIconSolid },
    { name: 'Hỏi đáp', href: '/chat', icon: ChatBubbleLeftRightIcon, iconSolid: ChatBubbleLeftRightIconSolid },
    { name: 'Tôi', href: '/profile', icon: UserCircleIcon, iconSolid: UserCircleIconSolid },
  ];

  // More menu items (hidden in bottom nav, shown in popup)
  const moreNavigation = [
    { name: 'Quiz', href: '/quiz', icon: QuestionMarkCircleIcon },
    { name: 'Lộ trình', href: '/roadmap', icon: MapIcon },
    { name: 'Ôn thi TN THPT', href: '/study-plan', icon: CalendarDaysIcon },
    { name: 'Hướng nghiệp', href: '/career', icon: BriefcaseIcon },
  ];

  // Add admin link if user is admin
  if (user?.role === 'admin') {
    navigation.push({ name: 'Quản trị', href: '/admin', icon: Cog6ToothIcon, isAdmin: true });
    moreNavigation.push({ name: 'Quản trị', href: '/admin', icon: Cog6ToothIcon, isAdmin: true });
  }

  const closeSidebar = () => setSidebarOpen(false);

  const isActiveRoute = (href) => {
    return location.pathname === href || location.pathname.startsWith(href + '/');
  };

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Mobile Header */}
      <header className="lg:hidden fixed top-0 left-0 right-0 z-40 bg-white shadow-sm safe-area-top">
        <div className="flex items-center justify-between px-4 py-3">
          <div className="flex items-center gap-3">
            <div className="w-8 h-8 bg-gradient-primary rounded-lg flex items-center justify-center">
              <AcademicCapIcon className="w-5 h-5 text-white" />
            </div>
            <h1 className="font-display font-bold text-gray-900">Edumentor</h1>
          </div>
          <button
            onClick={() => setMoreMenuOpen(!moreMenuOpen)}
            className="p-2 rounded-lg text-gray-600 hover:bg-gray-100"
          >
            <EllipsisHorizontalIcon className="w-6 h-6" />
          </button>
        </div>
      </header>

      {/* Mobile More Menu Dropdown */}
      {moreMenuOpen && (
        <>
          <div 
            className="lg:hidden fixed inset-0 z-40"
            onClick={() => setMoreMenuOpen(false)}
          />
          <div className="lg:hidden fixed top-14 right-2 z-50 w-56 bg-white rounded-xl shadow-lg border border-gray-100 py-2 animate-fadeIn">
            {moreNavigation.map((item) => (
              <NavLink
                key={item.name}
                to={item.href}
                onClick={() => setMoreMenuOpen(false)}
                className={({ isActive }) =>
                  `flex items-center gap-3 px-4 py-3 transition-colors ${
                    isActive
                      ? item.isAdmin 
                        ? 'bg-orange-50 text-orange-700'
                        : 'bg-primary-50 text-primary-700'
                      : 'text-gray-700 hover:bg-gray-50'
                  }`
                }
              >
                <item.icon className="w-5 h-5" />
                <span className="font-medium">{item.name}</span>
                {item.isAdmin && (
                  <span className="ml-auto px-2 py-0.5 bg-orange-100 text-orange-600 text-xs rounded-full">
                    Admin
                  </span>
                )}
              </NavLink>
            ))}
            <div className="border-t border-gray-100 mt-2 pt-2">
              <button
                onClick={handleLogout}
                className="w-full flex items-center gap-3 px-4 py-3 text-red-600 hover:bg-red-50 transition-colors"
              >
                <ArrowRightOnRectangleIcon className="w-5 h-5" />
                <span className="font-medium">Đăng xuất</span>
              </button>
            </div>
          </div>
        </>
      )}

      {/* Desktop Sidebar */}
      <aside className="hidden lg:block fixed inset-y-0 left-0 w-64 bg-white shadow-soft z-30">
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
        <nav className="p-4 space-y-1 overflow-y-auto" style={{ maxHeight: 'calc(100vh - 200px)' }}>
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
        <div className="absolute bottom-0 left-0 right-0 p-4 border-t border-gray-100 bg-white">
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
      <main className="lg:pl-64 pt-14 pb-20 lg:pt-0 lg:pb-0">
        <div className="p-4 md:p-6 lg:p-8 min-h-screen">
          <Outlet />
        </div>
      </main>

      {/* Mobile Bottom Navigation */}
      <nav className="lg:hidden fixed bottom-0 left-0 right-0 z-40 bg-white border-t border-gray-200 safe-area-bottom">
        <div className="flex items-center justify-around px-2 py-1">
          {bottomNavigation.map((item) => {
            const isActive = isActiveRoute(item.href);
            const Icon = isActive ? item.iconSolid : item.icon;
            
            return (
              <NavLink
                key={item.name}
                to={item.href}
                className="flex flex-col items-center justify-center py-2 px-3 min-w-0"
              >
                <Icon className={`w-6 h-6 ${isActive ? 'text-primary-600' : 'text-gray-500'}`} />
                <span className={`text-xs mt-1 truncate ${isActive ? 'text-primary-600 font-medium' : 'text-gray-500'}`}>
                  {item.name}
                </span>
              </NavLink>
            );
          })}
        </div>
      </nav>
    </div>
  );
};

export default Layout;
