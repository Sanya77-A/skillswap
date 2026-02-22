import { useState, useEffect } from "react";
import { Link, useNavigate } from "react-router-dom";
import { useDispatch, useSelector } from "react-redux";
import { logout } from "../features/auth/authSlice";
import { fetchUnreadCount } from "../features/notifications/notificationsSlice";

export default function Navbar() {
  const dispatch = useDispatch();
  const navigate = useNavigate();
  const { isAuthenticated, user } = useSelector((s) => s.auth);
  const unreadCount = useSelector((s) => s.notifications.unreadCount);
  const [dark, setDark] = useState(() => document.documentElement.classList.contains("dark"));

  useEffect(() => {
    if (isAuthenticated) dispatch(fetchUnreadCount());
  }, [isAuthenticated, dispatch]);

  const toggleDark = () => {
    document.documentElement.classList.toggle("dark", !dark);
    setDark(!dark);
  };

  const handleLogout = () => {
    dispatch(logout());
    navigate("/");
  };

  return (
    <nav className="bg-white dark:bg-gray-800 shadow border-b border-gray-200 dark:border-gray-700">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex justify-between h-16">
          <div className="flex items-center">
            <Link to="/" className="text-xl font-bold text-primary-600 dark:text-primary-400">
              SkillSwap
            </Link>
            {isAuthenticated && (
              <div className="hidden sm:ml-8 sm:flex sm:space-x-4">
                <Link to="/dashboard" className="px-3 py-2 rounded-md text-gray-700 dark:text-gray-200 hover:bg-gray-100 dark:hover:bg-gray-700">Dashboard</Link>
                <Link to="/discover" className="px-3 py-2 rounded-md text-gray-700 dark:text-gray-200 hover:bg-gray-100 dark:hover:bg-gray-700">Discover</Link>
                <Link to="/requests" className="px-3 py-2 rounded-md text-gray-700 dark:text-gray-200 hover:bg-gray-100 dark:hover:bg-gray-700">Requests</Link>
                <Link to="/sessions" className="px-3 py-2 rounded-md text-gray-700 dark:text-gray-200 hover:bg-gray-100 dark:hover:bg-gray-700">Sessions</Link>
                <Link to="/chat" className="px-3 py-2 rounded-md text-gray-700 dark:text-gray-200 hover:bg-gray-100 dark:hover:bg-gray-700">Chat</Link>
                <Link to="/notifications" className="px-3 py-2 rounded-md text-gray-700 dark:text-gray-200 hover:bg-gray-100 dark:hover:bg-gray-700 flex items-center gap-1">
                  Notifications
                  {unreadCount > 0 && (
                    <span className="bg-red-500 text-white text-xs rounded-full h-5 w-5 flex items-center justify-center">{unreadCount}</span>
                  )}
                </Link>
                <Link to="/profile" className="px-3 py-2 rounded-md text-gray-700 dark:text-gray-200 hover:bg-gray-100 dark:hover:bg-gray-700">Profile</Link>
                {user?.role === "admin" && (
                  <Link to="/admin" className="px-3 py-2 rounded-md text-red-600 dark:text-red-400 hover:bg-gray-100 dark:hover:bg-gray-700">Admin</Link>
                )}
              </div>
            )}
          </div>
          <div className="flex items-center gap-2">
            <button type="button" onClick={toggleDark} className="p-2 rounded-lg bg-gray-100 dark:bg-gray-700" aria-label="Toggle dark mode">
              {dark ? "☀️" : "🌙"}
            </button>
            {isAuthenticated ? (
              <button onClick={handleLogout} className="px-4 py-2 rounded-md bg-gray-200 dark:bg-gray-700 text-gray-800 dark:text-gray-200 hover:bg-gray-300 dark:hover:bg-gray-600">
                Logout
              </button>
            ) : (
              <>
                <Link to="/login" className="px-4 py-2 rounded-md text-gray-700 dark:text-gray-200 hover:bg-gray-100 dark:hover:bg-gray-700">Login</Link>
                <Link to="/register" className="px-4 py-2 rounded-md bg-primary-600 text-white hover:bg-primary-700">Register</Link>
              </>
            )}
          </div>
        </div>
      </div>
    </nav>
  );
}
