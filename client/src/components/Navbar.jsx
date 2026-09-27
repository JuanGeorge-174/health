import React, { useState, useRef, useEffect } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { useConfig } from '../context/ConfigContext';
import { useNotifications } from '../context/NotificationContext';

export function Navbar() {
  const { user, logout } = useAuth();
  const { config } = useConfig();
  const { notifications, unreadCount, markAsRead, markAllAsRead } = useNotifications();
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const [notifDropdownOpen, setNotifDropdownOpen] = useState(false);
  const notifRef = useRef(null);
  const navigate = useNavigate();

  // Close notification dropdown on outside click or Escape key
  useEffect(() => {
    const handleKeyDown = (e) => {
      if (e.key === 'Escape' && notifDropdownOpen) {
        setNotifDropdownOpen(false);
      }
    };

    const handleClickOutside = (e) => {
      if (notifRef.current && !notifRef.current.contains(e.target)) {
        setNotifDropdownOpen(false);
      }
    };

    if (notifDropdownOpen) {
      document.addEventListener('keydown', handleKeyDown);
      document.addEventListener('mousedown', handleClickOutside);
    }
    return () => {
      document.removeEventListener('keydown', handleKeyDown);
      document.removeEventListener('mousedown', handleClickOutside);
    };
  }, [notifDropdownOpen]);

  const getDashboardPath = () => {
    if (!user) return '/login';
    if (user.role === 'patient') return '/patient/dashboard';
    if (user.role === 'doctor') return '/doctor/dashboard';
    if (user.role === 'admin') return '/admin/dashboard';
    return '/';
  };

  return (
    <header className="sticky top-0 z-40 bg-slate-900/90 backdrop-blur-md border-b border-slate-800 text-slate-100">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 h-16 flex items-center justify-between">
        {/* Brand Name */}
        <Link to="/" className="text-lg font-bold tracking-tight text-white flex items-center gap-2">
          <span className="h-3 w-3 rounded-full bg-emerald-500 inline-block"></span>
          {config.clinicName || 'Healthcare Portal'}
        </Link>

        {/* Desktop Nav Links */}
        <nav className="hidden md:flex items-center gap-6 text-sm font-medium">
          <Link to="/" className="text-slate-300 hover:text-white transition-colors">
            Home
          </Link>
          <Link to="/doctors" className="text-slate-300 hover:text-white transition-colors">
            Find Doctors
          </Link>

          {user && (
            <Link to={getDashboardPath()} className="text-indigo-400 hover:text-indigo-300 font-semibold transition-colors">
              Dashboard
            </Link>
          )}
        </nav>

        {/* Right Section / Auth Links */}
        <div className="hidden md:flex items-center gap-4">
          {user ? (
            <>
              {/* Notification Dropdown */}
              <div className="relative" ref={notifRef}>
                <button
                  onClick={() => setNotifDropdownOpen(!notifDropdownOpen)}
                  className="p-2 rounded-lg bg-slate-800 hover:bg-slate-700 text-slate-300 relative transition-colors"
                  aria-label="View in-app notifications"
                >
                  🔔
                  {unreadCount > 0 && (
                    <span className="absolute -top-1 -right-1 bg-rose-500 text-white text-[10px] font-bold h-4 w-4 rounded-full flex items-center justify-center">
                      {unreadCount}
                    </span>
                  )}
                </button>

                {notifDropdownOpen && (
                  <div className="absolute right-0 mt-2 w-80 bg-slate-900 border border-slate-800 rounded-xl shadow-2xl p-4 text-xs z-50">
                    <div className="flex items-center justify-between pb-2 mb-2 border-b border-slate-800">
                      <span className="font-semibold text-slate-200">Notifications ({unreadCount} unread)</span>
                      {unreadCount > 0 && (
                        <button
                          onClick={markAllAsRead}
                          className="text-indigo-400 hover:text-indigo-300 font-medium text-[11px]"
                        >
                          Mark all read
                        </button>
                      )}
                    </div>
                    <div className="max-h-64 overflow-y-auto divide-y divide-slate-800">
                      {notifications.length === 0 ? (
                        <p className="py-4 text-center text-slate-400">No notifications yet.</p>
                      ) : (
                        notifications.map(n => (
                          <div
                            key={n._id}
                            onClick={() => markAsRead(n._id)}
                            className={`py-2 px-1 cursor-pointer hover:bg-slate-800/50 rounded transition-colors ${
                              !n.isRead ? 'font-medium text-white' : 'text-slate-400'
                            }`}
                          >
                            <div className="flex justify-between items-start gap-2">
                              <span className="text-slate-200 font-semibold">{n.title}</span>
                              {!n.isRead && <span className="h-1.5 w-1.5 rounded-full bg-indigo-500 inline-block mt-1" />}
                            </div>
                            <p className="mt-0.5 text-slate-300 text-[11px]">{n.message}</p>
                          </div>
                        ))
                      )}
                    </div>
                  </div>
                )}
              </div>

              {/* User Dropdown / Logout */}
              <div className="flex items-center gap-3">
                <span className="text-xs text-slate-300 font-medium">
                  {user.name} ({user.role})
                </span>
                <button
                  onClick={logout}
                  className="px-3 py-1.5 text-xs font-medium bg-slate-800 hover:bg-slate-700 text-slate-200 rounded-lg transition-colors border border-slate-700"
                >
                  Sign Out
                </button>
              </div>
            </>
          ) : (
            <div className="flex items-center gap-3">
              <Link
                to="/login"
                className="px-4 py-2 text-xs font-medium text-slate-300 hover:text-white transition-colors"
              >
                Sign In
              </Link>
              <Link
                to="/register"
                className="px-4 py-2 text-xs font-medium bg-indigo-600 hover:bg-indigo-500 text-white rounded-lg transition-colors shadow-sm"
              >
                Book An Appointment
              </Link>
            </div>
          )}
        </div>

        {/* Mobile Menu Button */}
        <div className="md:hidden flex items-center gap-2">
          {user && (
            <button
              onClick={() => setNotifDropdownOpen(!notifDropdownOpen)}
              className="p-2 rounded-lg bg-slate-800 text-slate-300 relative"
              aria-label="View notifications"
            >
              🔔
              {unreadCount > 0 && (
                <span className="absolute -top-1 -right-1 bg-rose-500 text-white text-[10px] font-bold h-4 w-4 rounded-full flex items-center justify-center">
                  {unreadCount}
                </span>
              )}
            </button>
          )}

          <button
            onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
            className="p-2 text-slate-400 hover:text-white rounded-lg bg-slate-800"
            aria-label="Toggle mobile menu"
          >
            ☰
          </button>
        </div>
      </div>

      {/* Mobile Menu Content */}
      {mobileMenuOpen && (
        <div className="md:hidden border-b border-slate-800 bg-slate-900 px-4 pt-2 pb-4 space-y-3 text-sm">
          <Link
            to="/"
            onClick={() => setMobileMenuOpen(false)}
            className="block text-slate-300 hover:text-white py-1"
          >
            Home
          </Link>
          <Link
            to="/doctors"
            onClick={() => setMobileMenuOpen(false)}
            className="block text-slate-300 hover:text-white py-1"
          >
            Find Doctors
          </Link>
          {user ? (
            <>
              <Link
                to={getDashboardPath()}
                onClick={() => setMobileMenuOpen(false)}
                className="block text-indigo-400 hover:text-indigo-300 font-semibold py-1"
              >
                Dashboard ({user.name})
              </Link>
              <button
                onClick={() => {
                  setMobileMenuOpen(false);
                  logout();
                }}
                className="w-full text-left py-2 text-rose-400 font-medium"
              >
                Sign Out
              </button>
            </>
          ) : (
            <div className="pt-2 flex flex-col gap-2">
              <Link
                to="/login"
                onClick={() => setMobileMenuOpen(false)}
                className="block text-center py-2 bg-slate-800 text-slate-200 rounded-lg text-xs font-medium"
              >
                Sign In
              </Link>
              <Link
                to="/register"
                onClick={() => setMobileMenuOpen(false)}
                className="block text-center py-2 bg-indigo-600 text-white rounded-lg text-xs font-medium"
              >
                Register
              </Link>
            </div>
          )}
        </div>
      )}
    </header>
  );
}
