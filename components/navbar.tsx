'use client';

import React, { useState, useEffect, useMemo } from 'react';
import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { Button } from '@/components/ui/button';
import {
  Menu,
  Search,
  Bell,
  User,
  Settings,
  LogOut,
  Home,
  MessageSquare,
  Users,
  Calendar,
  FileText,
  ChevronDown,
  Sun,
  Moon,
  X,
  PanelLeftClose,
  PanelLeftOpen
} from 'lucide-react';

interface NavbarProps {
  user?: {
    name: string;
    email: string;
    avatar?: string;
    role?: string;
  };
  onLogout?: () => void;
  onSearch?: (query: string) => void;
  onToggleSidebar?: () => void;
  sidebarVisible?: boolean;
  notifications?: Array<{
    id: string;
    title: string;
    description: string;
    time: string;
    read: boolean;
    type: 'message' | 'alert' | 'system';
  }>;
  onNotificationClick?: (id: string) => void;
  darkMode?: boolean;
  onToggleDarkMode?: () => void;
}

const Navbar: React.FC<NavbarProps> = ({
  user = {
    name: 'John Doe',
    email: 'john@example.com',
    role: 'User'
  },
  onLogout = () => console.log('Logout clicked'),
  onSearch,
  onToggleSidebar,
  sidebarVisible = true,
  notifications = [],
  onNotificationClick,
  darkMode: propDarkMode,
  onToggleDarkMode: propToggleDarkMode
}) => {
  const pathname = usePathname();
  const [isMenuOpen, setIsMenuOpen] = useState(false);
  const [isUserDropdownOpen, setIsUserDropdownOpen] = useState(false);
  const [isNotificationsOpen, setIsNotificationsOpen] = useState(false);
  const [isSearchOpen, setIsSearchOpen] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');
  const [localDarkMode, setLocalDarkMode] = useState(false);

  const currentDarkMode = propDarkMode !== undefined ? propDarkMode : localDarkMode;
  const toggleDarkMode = propToggleDarkMode || (() => setLocalDarkMode(!localDarkMode));

  const unreadNotifications = useMemo(() => {
    return notifications.filter(n => !n.read).length;
  }, [notifications]);

  // Toggle dark mode
  useEffect(() => {
    if (currentDarkMode) {
      document.documentElement.classList.add('dark');
    } else {
      document.documentElement.classList.remove('dark');
    }
  }, [currentDarkMode]);

  // Navigation items
  const navItems = [
    { href: '/dashboard', label: 'Dashboard', icon: Home },
    { href: '/chat', label: 'Chat', icon: MessageSquare },
  ];

  // User dropdown items
  const userMenuItems = [
    { label: 'Profile', icon: User, href: '/profile' },
    { label: 'Settings', icon: Settings, href: '/settings' },
    { label: 'Logout', icon: LogOut, onClick: onLogout },
  ];

  const handleSearch = (e: React.FormEvent) => {
    e.preventDefault();
    if (onSearch && searchQuery.trim()) {
      onSearch(searchQuery);
    }
    setIsSearchOpen(false);
  };

  const handleSearchKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter') {
      handleSearch(e);
    }
  };

  const markAllNotificationsAsRead = () => {
    console.log('Marking all notifications as read');
  };

  const formatNotificationTime = (time: string) => {
    return time;
  };

  return (
    <>
      <nav className="sticky top-0 z-50 w-full border-b bg-white dark:bg-gray-900 dark:border-gray-800">
        <div className="px-4 sm:px-6 lg:px-8">
          <div className="flex h-16 items-center justify-between">
            
            {/* Left side: Logo and Desktop Navigation */}
            <div className="flex items-center">
              {/* Mobile menu button */}
              <Button
                variant="ghost"
                size="icon"
                className="md:hidden mr-2"
                onClick={() => setIsMenuOpen(!isMenuOpen)}
              >
                {isMenuOpen ? (
                  <X className="h-5 w-5" />
                ) : (
                  <Menu className="h-5 w-5" />
                )}
              </Button>

              {/* Sidebar Toggle */}
              {onToggleSidebar && (
                <Button
                  variant="ghost"
                  size="icon"
                  onClick={onToggleSidebar}
                  className="mr-2"
                  title={sidebarVisible ? "Hide Sidebar" : "Show Sidebar"}
                >
                  {sidebarVisible ? <PanelLeftClose className="w-5 h-5" /> : <PanelLeftOpen className="w-5 h-5" />}
                </Button>
              )}

              {/* Logo */}
              <Link href="/" className="flex items-center space-x-2">
                <div className="w-8 h-8 bg-gradient-to-br from-blue-500 to-purple-600 rounded-lg flex items-center justify-center">
                  <MessageSquare className="w-5 h-5 text-white" />
                </div>
                <span className="text-xl font-bold text-gray-900 dark:text-white hidden sm:inline">
                  ChatApp
                </span>
              </Link>

              {/* Desktop Navigation */}
              <div className="hidden lg:flex ml-10 space-x-1">
                {navItems.map((item) => {
                  const Icon = item.icon;
                  const isActive = pathname === item.href;
                  
                  return (
                    <Link
                      key={item.href}
                      href={item.href}
                      className={`flex items-center px-3 py-2 text-sm font-medium rounded-md transition-colors ${
                        isActive
                          ? 'bg-blue-50 text-blue-700 dark:bg-blue-900/20 dark:text-blue-400'
                          : 'text-gray-700 hover:bg-gray-100 dark:text-gray-300 dark:hover:bg-gray-800'
                      }`}
                    >
                      <Icon className="w-4 h-4 mr-2" />
                      {item.label}
                    </Link>
                  );
                })}
              </div>
            </div>

            {/* Center: Search (Desktop and Tablet) */}
            <div className="hidden md:flex flex-1 max-w-md lg:max-w-2xl mx-2 lg:mx-4">
              <div className="w-full">
                <div className="relative">
                  <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-4 h-4" />
                  <input
                    type="text"
                    placeholder="Search..."
                    value={searchQuery}
                    onChange={(e) => setSearchQuery(e.target.value)}
                    onKeyDown={handleSearchKeyDown}
                    className="w-full pl-10 pr-4 py-2 text-sm border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent dark:bg-gray-800 dark:border-gray-700 dark:text-white"
                  />
                </div>
              </div>
            </div>

            {/* Right side: Actions and User Menu */}
            <div className="flex items-center space-x-1 sm:space-x-2">
              
              {/* Mobile search button */}
              <Button
                variant="ghost"
                size="icon"
                className="md:hidden"
                onClick={() => setIsSearchOpen(!isSearchOpen)}
              >
                <Search className="h-5 w-5" />
              </Button>

              {/* Dark mode toggle */}
              <Button
                variant="ghost"
                size="icon"
                onClick={toggleDarkMode}
                className="hidden sm:inline-flex"
                title={currentDarkMode ? "Switch to Light Mode" : "Switch to Dark Mode"}
              >
                {currentDarkMode ? (
                  <Sun className="h-5 w-5" />
                ) : (
                  <Moon className="h-5 w-5" />
                )}
              </Button>

              {/* Notifications */}
              <div className="relative">
                <Button
                  variant="ghost"
                  size="icon"
                  onClick={() => setIsNotificationsOpen(!isNotificationsOpen)}
                  title="Notifications"
                >
                  <Bell className="h-5 w-5" />
                  {unreadNotifications > 0 && (
                    <span className="absolute -top-1 -right-1 bg-red-500 text-white text-xs rounded-full h-5 w-5 flex items-center justify-center font-semibold">
                      {unreadNotifications > 9 ? '9+' : unreadNotifications}
                    </span>
                  )}
                </Button>

                {/* Notifications dropdown */}
                {isNotificationsOpen && (
                  <>
                    <div
                      className="fixed inset-0 z-40"
                      onClick={() => setIsNotificationsOpen(false)}
                    />
                    <div className="absolute right-0 mt-2 w-80 sm:w-96 max-w-[calc(100vw-2rem)] bg-white dark:bg-gray-800 rounded-lg shadow-lg border dark:border-gray-700 z-50">
                      <div className="p-4 border-b dark:border-gray-700">
                        <div className="flex items-center justify-between">
                          <h3 className="font-semibold text-gray-900 dark:text-white">
                            Notifications
                          </h3>
                          {unreadNotifications > 0 && (
                            <Button
                              variant="ghost"
                              size="sm"
                              onClick={markAllNotificationsAsRead}
                              className="text-xs h-auto py-1 px-2"
                            >
                              Mark all as read
                            </Button>
                          )}
                        </div>
                      </div>
                      
                      <div className="max-h-[60vh] sm:max-h-96 overflow-y-auto">
                        {notifications.length > 0 ? (
                          notifications.map((notification) => (
                            <div
                              key={notification.id}
                              onClick={() => {
                                if (onNotificationClick) {
                                  onNotificationClick(notification.id);
                                }
                                setIsNotificationsOpen(false);
                              }}
                              className={`p-4 border-b dark:border-gray-700 cursor-pointer hover:bg-gray-50 dark:hover:bg-gray-700 transition-colors active:bg-gray-100 dark:active:bg-gray-600 ${
                                !notification.read ? 'bg-blue-50 dark:bg-blue-900/20' : ''
                              }`}
                            >
                              <div className="flex items-start">
                                <div className="flex-1 min-w-0">
                                  <h4 className="font-medium text-sm text-gray-900 dark:text-white">
                                    {notification.title}
                                  </h4>
                                  <p className="text-sm text-gray-600 dark:text-gray-300 mt-1 line-clamp-2">
                                    {notification.description}
                                  </p>
                                  <p className="text-xs text-gray-500 dark:text-gray-400 mt-2">
                                    {formatNotificationTime(notification.time)}
                                  </p>
                                </div>
                                {!notification.read && (
                                  <div className="w-2 h-2 bg-blue-500 rounded-full ml-2 mt-1 flex-shrink-0" />
                                )}
                              </div>
                            </div>
                          ))
                        ) : (
                          <div className="p-8 text-center">
                            <Bell className="w-12 h-12 text-gray-300 dark:text-gray-600 mx-auto mb-4" />
                            <p className="text-gray-500 dark:text-gray-400">No notifications</p>
                          </div>
                        )}
                      </div>
                      
                      <div className="p-4 border-t dark:border-gray-700">
                        <Link
                          href="/notifications"
                          className="text-sm text-blue-600 dark:text-blue-400 hover:text-blue-800 dark:hover:text-blue-300 font-medium block text-center"
                          onClick={() => setIsNotificationsOpen(false)}
                        >
                          View all notifications
                        </Link>
                      </div>
                    </div>
                  </>
                )}
              </div>

              {/* User menu */}
              <div className="relative">
                <Button
                  variant="ghost"
                  className="flex items-center space-x-2 hover:bg-gray-100 dark:hover:bg-gray-800"
                  onClick={() => setIsUserDropdownOpen(!isUserDropdownOpen)}
                >
                  {user.avatar ? (
                    <img
                      src={user.avatar}
                      alt={user.name}
                      className="w-8 h-8 rounded-full object-cover"
                    />
                  ) : (
                    <div className="w-8 h-8 bg-gradient-to-br from-blue-500 to-purple-600 rounded-full flex items-center justify-center text-white font-medium text-sm">
                      {user.name.charAt(0).toUpperCase()}
                    </div>
                  )}
                  <div className="hidden lg:block text-left">
                    <p className="text-sm font-medium text-gray-900 dark:text-white leading-tight">
                      {user.name}
                    </p>
                    <p className="text-xs text-gray-500 dark:text-gray-400 leading-tight">
                      {user.role}
                    </p>
                  </div>
                  <ChevronDown className="h-4 w-4 text-gray-500 dark:text-gray-400 hidden sm:block" />
                </Button>

                {/* User dropdown */}
                {isUserDropdownOpen && (
                  <>
                    <div
                      className="fixed inset-0 z-40"
                      onClick={() => setIsUserDropdownOpen(false)}
                    />
                    <div className="absolute right-0 mt-2 w-56 bg-white dark:bg-gray-800 rounded-lg shadow-lg border dark:border-gray-700 z-50 py-1">
                      <div className="px-4 py-3 border-b dark:border-gray-700">
                        <p className="text-sm font-medium text-gray-900 dark:text-white">
                          {user.name}
                        </p>
                        <p className="text-sm text-gray-500 dark:text-gray-400 truncate">
                          {user.email}
                        </p>
                      </div>
                      
                      {userMenuItems.map((item) => {
                        const Icon = item.icon;
                        return item.href ? (
                          <Link
                            key={item.label}
                            href={item.href}
                            className="flex items-center px-4 py-2.5 text-sm text-gray-700 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-700 transition-colors active:bg-gray-200 dark:active:bg-gray-600"
                            onClick={() => setIsUserDropdownOpen(false)}
                          >
                            <Icon className="w-4 h-4 mr-3" />
                            {item.label}
                          </Link>
                        ) : (
                          <button
                            key={item.label}
                            onClick={() => {
                              if (item.onClick) item.onClick();
                              setIsUserDropdownOpen(false);
                            }}
                            className="flex items-center w-full px-4 py-2.5 text-sm text-gray-700 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-700 transition-colors active:bg-gray-200 dark:active:bg-gray-600"
                          >
                            <Icon className="w-4 h-4 mr-3" />
                            {item.label}
                          </button>
                        );
                      })}
                      
                      <div className="border-t dark:border-gray-700 mt-1 pt-1 sm:hidden">
                        <button
                          onClick={() => {
                            toggleDarkMode();
                            setIsUserDropdownOpen(false);
                          }}
                          className="flex items-center w-full px-4 py-2.5 text-sm text-gray-700 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-700 transition-colors"
                        >
                          {currentDarkMode ? (
                            <>
                              <Sun className="w-4 h-4 mr-3" />
                              Light Mode
                            </>
                          ) : (
                            <>
                              <Moon className="w-4 h-4 mr-3" />
                              Dark Mode
                            </>
                          )}
                        </button>
                      </div>
                    </div>
                  </>
                )}
              </div>
            </div>
          </div>
        </div>

        {/* Mobile search bar */}
        {isSearchOpen && (
          <div className="md:hidden border-t dark:border-gray-800 px-4 py-3 bg-white dark:bg-gray-900">
            <div className="relative">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-4 h-4" />
              <input
                type="text"
                placeholder="Search..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                onKeyDown={handleSearchKeyDown}
                className="w-full pl-10 pr-10 py-2.5 text-sm border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent dark:bg-gray-800 dark:border-gray-700 dark:text-white"
                autoFocus
              />
              <button
                type="button"
                onClick={() => setIsSearchOpen(false)}
                className="absolute right-3 top-1/2 transform -translate-y-1/2 p-1 hover:bg-gray-100 dark:hover:bg-gray-700 rounded"
              >
                <X className="w-4 h-4 text-gray-400" />
              </button>
            </div>
          </div>
        )}
      </nav>

      {/* Mobile menu */}
      {isMenuOpen && (
        <div className="md:hidden fixed inset-0 z-50">
          <div
            className="absolute inset-0 bg-black bg-opacity-50 transition-opacity"
            onClick={() => setIsMenuOpen(false)}
          />
          <div className="absolute inset-y-0 left-0 w-64 sm:w-72 bg-white dark:bg-gray-900 shadow-xl">
            <div className="h-full flex flex-col">
              {/* Mobile menu header */}
              <div className="p-4 border-b dark:border-gray-800">
                <div className="flex items-center justify-between mb-4">
                  <div className="flex items-center space-x-2">
                    <div className="w-8 h-8 bg-gradient-to-br from-blue-500 to-purple-600 rounded-lg flex items-center justify-center">
                      <MessageSquare className="w-5 h-5 text-white" />
                    </div>
                    <span className="text-lg font-bold text-gray-900 dark:text-white">
                      ChatApp
                    </span>
                  </div>
                  <button
                    onClick={() => setIsMenuOpen(false)}
                    className="p-2 hover:bg-gray-100 dark:hover:bg-gray-800 rounded-lg transition-colors"
                  >
                    <X className="w-5 h-5 text-gray-500 dark:text-gray-400" />
                  </button>
                </div>
                
                <div className="flex items-center space-x-3">
                  {user.avatar ? (
                    <img
                      src={user.avatar}
                      alt={user.name}
                      className="w-12 h-12 rounded-full object-cover"
                    />
                  ) : (
                    <div className="w-12 h-12 bg-gradient-to-br from-blue-500 to-purple-600 rounded-full flex items-center justify-center text-white font-medium text-lg">
                      {user.name.charAt(0).toUpperCase()}
                    </div>
                  )}
                  <div className="flex-1 min-w-0">
                    <p className="font-medium text-gray-900 dark:text-white truncate">
                      {user.name}
                    </p>
                    <p className="text-sm text-gray-500 dark:text-gray-400 truncate">
                      {user.email}
                    </p>
                  </div>
                </div>
              </div>

              {/* Mobile navigation */}
              <nav className="flex-1 p-4 space-y-1 overflow-y-auto">
                {navItems.map((item) => {
                  const Icon = item.icon;
                  const isActive = pathname === item.href;
                  
                  return (
                    <Link
                      key={item.href}
                      href={item.href}
                      className={`flex items-center px-4 py-3 rounded-lg transition-colors ${
                        isActive
                          ? 'bg-blue-50 text-blue-700 dark:bg-blue-900/20 dark:text-blue-400'
                          : 'text-gray-700 hover:bg-gray-100 dark:text-gray-300 dark:hover:bg-gray-800 active:bg-gray-200 dark:active:bg-gray-700'
                      }`}
                      onClick={() => setIsMenuOpen(false)}
                    >
                      <Icon className="w-5 h-5 mr-3 flex-shrink-0" />
                      <span className="font-medium">{item.label}</span>
                    </Link>
                  );
                })}
              </nav>

              {/* Mobile menu footer */}
              <div className="p-4 border-t dark:border-gray-800 space-y-2">
                <Link
                  href="/profile"
                  className="flex items-center w-full px-4 py-3 text-gray-700 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-800 active:bg-gray-200 dark:active:bg-gray-700 rounded-lg transition-colors"
                  onClick={() => setIsMenuOpen(false)}
                >
                  <User className="w-5 h-5 mr-3" />
                  <span className="font-medium">Profile</span>
                </Link>
                
                <Link
                  href="/settings"
                  className="flex items-center w-full px-4 py-3 text-gray-700 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-800 active:bg-gray-200 dark:active:bg-gray-700 rounded-lg transition-colors"
                  onClick={() => setIsMenuOpen(false)}
                >
                  <Settings className="w-5 h-5 mr-3" />
                  <span className="font-medium">Settings</span>
                </Link>
                
                <button
                  onClick={() => {
                    toggleDarkMode();
                  }}
                  className="flex items-center w-full px-4 py-3 text-gray-700 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-800 active:bg-gray-200 dark:active:bg-gray-700 rounded-lg transition-colors"
                >
                  {currentDarkMode ? (
                    <>
                      <Sun className="w-5 h-5 mr-3" />
                      <span className="font-medium">Light Mode</span>
                    </>
                  ) : (
                    <>
                      <Moon className="w-5 h-5 mr-3" />
                      <span className="font-medium">Dark Mode</span>
                    </>
                  )}
                </button>
                
                <button
                  onClick={() => {
                    onLogout();
                    setIsMenuOpen(false);
                  }}
                  className="flex items-center w-full px-4 py-3 text-red-600 hover:bg-red-50 dark:hover:bg-red-900/20 active:bg-red-100 dark:active:bg-red-900/30 rounded-lg transition-colors"
                >
                  <LogOut className="w-5 h-5 mr-3" />
                  <span className="font-medium">Logout</span>
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </>
  );
};

export default Navbar;