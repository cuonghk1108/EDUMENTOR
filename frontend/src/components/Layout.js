import React, { useState } from 'react';
import { Outlet, NavLink, useNavigate, useLocation } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { motion, AnimatePresence, useReducedMotion } from 'framer-motion';
import { getResourceUrl } from '../utils/apiHelpers';
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
  EllipsisHorizontalIcon,
  FireIcon
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
  const shouldReduceMotion = useReducedMotion();
  const [moreMenuOpen, setMoreMenuOpen] = useState(false);
  const isChatPage = location.pathname === '/chat';

  const handleLogout = async () => {
    await logout();
    navigate('/');
  };

  // Full navigation for sidebar
  const navigation = [
    { name: 'Dashboard', href: '/dashboard', icon: HomeIcon, color: 'primary' },
    { name: 'Upload SGK', href: '/upload', icon: CloudArrowUpIcon, color: 'blue' },
    { name: 'Bài học', href: '/lessons', icon: BookOpenIcon, color: 'green' },
    { name: 'Quiz', href: '/quiz', icon: QuestionMarkCircleIcon, color: 'purple' },
    { name: 'Hỏi đáp AI', href: '/chat', icon: ChatBubbleLeftRightIcon, color: 'cyan' },
    { name: 'Lộ trình', href: '/roadmap', icon: MapIcon, color: 'orange' },
    { name: 'Ôn thi TN', href: '/study-plan', icon: CalendarDaysIcon, color: 'pink' },
    { name: 'Hướng nghiệp', href: '/career', icon: BriefcaseIcon, color: 'indigo' },
  ];

  // Bottom navigation for mobile
  const bottomNavigation = [
    { name: 'Trang chủ', href: '/dashboard', icon: HomeIcon, iconSolid: HomeIconSolid },
    { name: 'Upload', href: '/upload', icon: CloudArrowUpIcon, iconSolid: CloudArrowUpIconSolid },
    { name: 'Bài học', href: '/lessons', icon: BookOpenIcon, iconSolid: BookOpenIconSolid },
    { name: 'Hỏi đáp', href: '/chat', icon: ChatBubbleLeftRightIcon, iconSolid: ChatBubbleLeftRightIconSolid },
    { name: 'Tôi', href: '/profile', icon: UserCircleIcon, iconSolid: UserCircleIconSolid },
  ];

  // More menu items
  const moreNavigation = [
    { name: 'Quiz', href: '/quiz', icon: QuestionMarkCircleIcon },
    { name: 'Lộ trình', href: '/roadmap', icon: MapIcon },
    { name: 'Ôn thi TN THPT', href: '/study-plan', icon: CalendarDaysIcon },
    { name: 'Hướng nghiệp', href: '/career', icon: BriefcaseIcon },
  ];

  // Add admin link if user is admin
  if (user?.role === 'admin') {
    navigation.push({ name: 'Quản trị', href: '/admin', icon: Cog6ToothIcon, isAdmin: true, color: 'orange' });
    moreNavigation.push({ name: 'Quản trị', href: '/admin', icon: Cog6ToothIcon, isAdmin: true });
  }

  const isActiveRoute = (href) => {
    return location.pathname === href || location.pathname.startsWith(href + '/');
  };

  return (
    <div className="app-shell">
      <a
        href="#main-content"
        className="sr-only focus:not-sr-only focus:fixed focus:left-4 focus:top-4 focus:z-[100] focus:rounded-lg focus:bg-primary-500 focus:px-4 focus:py-2 focus:text-sm focus:font-semibold focus:text-white"
      >
        Bỏ qua điều hướng
      </a>
      <div className="app-ambient-bg" />

      {/* Mobile Header - Dark Theme */}
      <header className="lg:hidden fixed top-0 left-0 right-0 z-40 glass-panel border-x-0 border-t-0 safe-area-top">
        <div className="flex items-center justify-between px-4 py-3">
          {/* Left: Logo */}
          <div className="flex items-center gap-3">
            <div className="relative">
              <div className="absolute inset-0 bg-primary-500 rounded-lg blur opacity-50" />
              <div className="relative w-9 h-9 bg-gradient-to-br from-primary-500 to-secondary-500 rounded-lg flex items-center justify-center">
                <AcademicCapIcon className="w-5 h-5 text-white" />
              </div>
            </div>
            <h1 className="font-display font-bold text-white">Edumentor</h1>
          </div>
          
          {/* Right: User + More */}
          <div className="flex items-center gap-2">
            <NavLink to="/profile" className="flex items-center gap-2 px-2 py-1.5 rounded-lg bg-white/5 hover:bg-white/10 transition-colors">
              <div className="relative">
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
                {/* Streak badge */}
                {user?.streak?.current > 0 && (
                  <div className={`absolute -bottom-1 -right-1 bg-gradient-to-r from-orange-500 to-yellow-500 rounded-full px-1.5 py-0.5 flex items-center gap-0.5 shadow-lg ring-2 ring-gray-900 ${
                    user.streak.current >= 7 ? 'streak-glow' : ''
                  }`}>
                    <FireIcon className="w-2.5 h-2.5 text-white" />
                    <span className="text-[10px] font-bold text-white leading-none">{user.streak.current}</span>
                  </div>
                )}
              </div>
              <span className="hidden sm:block text-sm font-medium text-white">
                {user?.name?.split(' ').pop()}
              </span>
            </NavLink>
            <button
              onClick={() => setMoreMenuOpen(!moreMenuOpen)}
              className="p-2 rounded-lg text-gray-400 hover:bg-white/5 hover:text-white transition-colors"
            >
              <EllipsisHorizontalIcon className="w-6 h-6" />
            </button>
          </div>
        </div>
      </header>

      {/* Mobile More Menu - Dark */}
      <AnimatePresence>
        {moreMenuOpen && (
          <>
            <motion.div 
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              className="lg:hidden fixed inset-0 z-40 bg-black/50 backdrop-blur-sm"
              onClick={() => setMoreMenuOpen(false)}
            />
            <motion.div 
              initial={{ opacity: 0, y: -10, scale: 0.95 }}
              animate={{ opacity: 1, y: 0, scale: 1 }}
              exit={{ opacity: 0, y: -10, scale: 0.95 }}
              className="lg:hidden fixed top-16 right-2 z-50 w-72 glass-panel rounded-2xl shadow-xl overflow-hidden"
            >
              {/* User Info */}
              <div className="p-4 border-b border-white/5 bg-gradient-to-r from-primary-500/10 to-secondary-500/10">
                <div className="flex items-center gap-3">
                  <div className="relative">
                    {user?.avatar ? (
                      <img
                        src={getResourceUrl(user.avatar)}
                        alt="Avatar"
                        className="w-12 h-12 rounded-full object-cover ring-2 ring-primary-500/50"
                      />
                    ) : (
                      <div className="w-12 h-12 bg-gradient-to-br from-primary-500 to-secondary-500 rounded-full flex items-center justify-center">
                        <span className="text-lg font-bold text-white">
                          {user?.name?.charAt(0)?.toUpperCase() || 'U'}
                        </span>
                      </div>
                    )}
                    {/* Streak badge */}
                    {user?.streak?.current > 0 && (
                      <div className={`absolute -bottom-1 -right-1 bg-gradient-to-r from-orange-500 to-yellow-500 rounded-full px-2 py-1 flex items-center gap-1 shadow-lg ring-2 ring-gray-900 ${
                        user.streak.current >= 7 ? 'streak-glow' : ''
                      }`}>
                        <FireIcon className="w-3 h-3 text-white" />
                        <span className="text-xs font-bold text-white leading-none">{user.streak.current}</span>
                      </div>
                    )}
                  </div>
                  <div className="flex-1 min-w-0">
                    <p className="font-semibold text-white truncate">{user?.name || 'User'}</p>
                    <p className="text-xs text-gray-400 truncate">{user?.email}</p>
                    <div className="flex items-center gap-1 mt-1">
                      <span className="w-1.5 h-1.5 bg-green-500 rounded-full animate-pulse"></span>
                      <span className="text-xs text-green-400">Online</span>
                    </div>
                  </div>
                </div>
              </div>

              {/* Nav Items */}
              <div className="py-2">
                {moreNavigation.map((item) => (
                  <NavLink
                    key={item.name}
                    to={item.href}
                    onClick={() => setMoreMenuOpen(false)}
                    className={({ isActive }) =>
                      `flex items-center gap-3 px-4 py-3 transition-colors ${
                        isActive
                          ? 'bg-primary-500/10 text-primary-400'
                          : 'text-gray-300 hover:bg-white/5 hover:text-white'
                      }`
                    }
                  >
                    <item.icon className="w-5 h-5" />
                    <span className="font-medium">{item.name}</span>
                    {item.isAdmin && (
                      <span className="ml-auto px-2 py-0.5 bg-orange-500/20 text-orange-400 text-xs rounded-full">
                        Admin
                      </span>
                    )}
                  </NavLink>
                ))}
              </div>
              
              {/* Logout */}
              <div className="border-t border-white/5 p-2">
                <button
                  onClick={handleLogout}
                  className="w-full flex items-center gap-3 px-4 py-3 text-red-400 hover:bg-red-500/10 rounded-xl transition-colors"
                >
                  <ArrowRightOnRectangleIcon className="w-5 h-5" />
                  <span className="font-medium">Đăng xuất</span>
                </button>
              </div>
            </motion.div>
          </>
        )}
      </AnimatePresence>

      {/* Desktop Sidebar - Dark Theme */}
      <aside className="hidden lg:block fixed inset-y-0 left-0 w-72 glass-panel border-y-0 border-l-0 z-30">
        {/* Logo */}
        <div className="flex items-center gap-3 px-6 py-6 border-b border-white/5">
          <div className="relative">
            <div className="absolute inset-0 bg-primary-500 rounded-xl blur-lg opacity-50" />
            <div className="relative w-11 h-11 bg-gradient-to-br from-primary-500 to-secondary-500 rounded-xl flex items-center justify-center">
              <AcademicCapIcon className="w-6 h-6 text-white" />
            </div>
          </div>
          <div>
            <h1 className="font-display font-bold text-lg text-white">Edumentor</h1>
            <div className="text-xs text-gray-500">
              AI-Powered Learning
            </div>
          </div>
        </div>

        {/* Navigation */}
        <nav className="p-4 space-y-1 overflow-y-auto" style={{ maxHeight: 'calc(100vh - 220px)' }} aria-label="Điều hướng chính">
          {navigation.map((item, index) => (
            <NavLink
              key={item.name}
              to={item.href}
              className={({ isActive }) =>
                `group flex items-center gap-3 px-4 py-3 rounded-xl transition-all duration-200 ${
                  isActive
                    ? 'bg-gradient-to-r from-primary-500/18 to-cyan-500/14 text-white border border-primary-400/20 shadow-lg shadow-primary-950/20'
                    : 'text-gray-400 hover:bg-white/[0.07] hover:text-white'
                }`
              }
            >
              <div className={`w-9 h-9 rounded-lg flex items-center justify-center transition-all ${
                isActiveRoute(item.href) 
                  ? 'bg-gradient-to-br from-primary-500 to-secondary-500 shadow-lg shadow-primary-500/25'
                  : 'bg-white/5 group-hover:bg-white/10'
              }`}>
                <item.icon className="w-5 h-5" />
              </div>
              <span className="font-medium">{item.name}</span>
              {item.isAdmin && (
                <span className="ml-auto px-2 py-0.5 bg-orange-500/20 text-orange-400 text-xs rounded-full">
                  Admin
                </span>
              )}
            </NavLink>
          ))}
        </nav>

        {/* User Section */}
        <div className="absolute bottom-0 left-0 right-0 p-4 border-t border-white/5 bg-slate-950/70 backdrop-blur-xl">
          <NavLink
            to="/profile"
            className={({ isActive }) =>
              `flex items-center gap-3 px-4 py-3 rounded-xl transition-all duration-200 ${
                isActive
                  ? 'bg-gradient-to-r from-primary-500/20 to-secondary-500/20 border border-primary-500/20'
                  : 'hover:bg-white/5'
              }`
            }
          >
            <div className="relative">
              {user?.avatar ? (
                <img
                  src={getResourceUrl(user.avatar)}
                  alt="Avatar"
                  className="w-10 h-10 rounded-full object-cover ring-2 ring-primary-500/30"
                />
              ) : (
                <div className="w-10 h-10 bg-gradient-to-br from-primary-500 to-secondary-500 rounded-full flex items-center justify-center">
                  <span className="font-bold text-white">
                    {user?.name?.charAt(0)?.toUpperCase() || 'U'}
                  </span>
                </div>
              )}
            </div>
            <div className="flex-1 min-w-0">
              <p className="text-sm font-medium text-white truncate">{user?.name}</p>
              <p className="text-xs text-gray-500 truncate">{user?.email}</p>
            </div>
            {user?.streak?.current > 0 && (
              <div className={`flex items-center gap-1 px-2 py-1 bg-gradient-to-r from-orange-500/20 to-yellow-500/20 rounded-full ${
                user.streak.current >= 7 ? 'streak-glow' : ''
              }`}>
                <FireIcon className="w-3.5 h-3.5 text-orange-400" />
                <span className="text-xs text-orange-400 font-bold">{user.streak.current}</span>
              </div>
            )}
          </NavLink>
          
          <button
            onClick={handleLogout}
            className="w-full flex items-center gap-3 px-4 py-3 rounded-xl text-gray-400 hover:bg-red-500/10 hover:text-red-400 transition-all duration-200 mt-2"
          >
            <ArrowRightOnRectangleIcon className="w-5 h-5" />
            <span className="font-medium">Đăng xuất</span>
          </button>
        </div>
      </aside>

      {/* Main Content */}
      <main id="main-content" className="relative z-10 lg:pl-72 pt-14 pb-20 lg:pt-0 lg:pb-0">
        <div className="min-h-screen flex flex-col">
          <div className="flex-1">
            <motion.div
              key={location.pathname}
              initial={shouldReduceMotion ? false : { opacity: 0, y: 6 }}
              animate={{ opacity: 1, y: 0 }}
              transition={
                shouldReduceMotion
                  ? { duration: 0.01 }
                  : { type: 'spring', damping: 26, stiffness: 240, mass: 0.55 }
              }
            >
              <div className={isChatPage ? 'app-content-shell app-content-shell--wide' : 'app-content-shell'}>
                <Outlet />
              </div>
            </motion.div>
          </div>
          
          {/* Footer - Hidden on Chat page */}
          {location.pathname !== '/chat' && (
            <footer className="mt-auto py-6 px-4 sm:px-6 lg:px-8 border-t border-white/5">
              <div className="max-w-7xl mx-auto">
                <div className="flex flex-col sm:flex-row items-center justify-between gap-4 text-sm text-gray-500">
                  <span>© 2026 Edumentor - AI-Powered Learning Platform</span>
                  <span>Code by <span className="text-primary-400 font-medium">Cuongdev1108</span></span>
                </div>
              </div>
            </footer>
          )}
        </div>
      </main>

      {/* Mobile Bottom Navigation - Dark */}
      <nav className="lg:hidden fixed bottom-0 left-0 right-0 z-40 glass-panel border-x-0 border-b-0 safe-area-bottom" aria-label="Điều hướng nhanh">
        <div className="flex items-center justify-around px-2 py-1">
          {bottomNavigation.map((item) => {
            const isActive = isActiveRoute(item.href);
            const Icon = isActive ? item.iconSolid : item.icon;
            const isProfile = item.href === '/profile';
            
            return (
              <NavLink
                key={item.name}
                to={item.href}
                className="flex flex-col items-center justify-center py-2 px-3 min-w-0 transition-transform duration-200 ease-out active:scale-[0.98]"
              >
                {isProfile && user?.avatar ? (
                  <div className="relative">
                    <img
                      src={getResourceUrl(user.avatar)}
                      alt="Avatar"
                      className={`w-6 h-6 rounded-full object-cover ${isActive ? 'ring-2 ring-primary-500' : ''}`}
                    />
                    {/* Streak badge for mobile */}
                    {user?.streak?.current > 0 && (
                      <div className="absolute -top-1 -right-1 bg-gradient-to-r from-orange-500 to-yellow-500 rounded-full w-3.5 h-3.5 flex items-center justify-center shadow ring-1 ring-gray-900">
                        <span className="text-[8px] font-bold text-white leading-none">{user.streak.current}</span>
                      </div>
                    )}
                  </div>
                ) : (
                  <div className={`p-1.5 rounded-lg transition-colors ${isActive ? 'bg-primary-500/20' : ''}`}>
                    <Icon className={`w-6 h-6 ${isActive ? 'text-primary-400' : 'text-gray-500'}`} />
                  </div>
                )}
                <span className={`text-xs mt-1 truncate ${isActive ? 'text-primary-400 font-medium' : 'text-gray-500'}`}>
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
