import { useState } from "react";
import { Link, useNavigate, useLocation } from "react-router-dom";
import { Search, Bell, Menu, LogOut, User } from "lucide-react";
import { useDispatch, useSelector } from "react-redux";
import { logout } from "../../features/auth/authSlice";
import { Button } from "../ui/Button";
import { Avatar } from "../ui/Avatar";
import { cn } from "../../lib/utils";

const breadcrumbMap = {
  "/dashboard": ["Dashboard"],
  "/discover": ["Discover"],
  "/requests": ["Requests"],
  "/sessions": ["Sessions"],
  "/chat": ["Chat"],
  "/notifications": ["Notifications"],
  "/profile": ["Profile"],
  "/admin": ["Admin"],
};

export function Topbar({ onMenuClick, breadcrumbs: propBreadcrumbs }) {
  const dispatch = useDispatch();
  const navigate = useNavigate();
  const location = useLocation();
  const pathParts = location.pathname.split("/").filter(Boolean);
  const { user, isAuthenticated } = useSelector((s) => s.auth);
  const unreadCount = useSelector((s) => s.notifications.unreadCount);
  const [searchQ, setSearchQ] = useState("");
  const [profileOpen, setProfileOpen] = useState(false);

  const breadcrumbs = propBreadcrumbs || breadcrumbMap[location.pathname] || (pathParts[0] ? [pathParts[0].charAt(0).toUpperCase() + pathParts[0].slice(1)] : []);

  const handleSearch = (e) => {
    e.preventDefault();
    if (searchQ.trim()) navigate(`/discover?q=${encodeURIComponent(searchQ.trim())}`);
  };

  const handleLogout = () => {
    dispatch(logout());
    navigate("/");
    setProfileOpen(false);
  };

  return (
    <header className="h-14 border-b border-border bg-surface flex items-center justify-between px-4 lg:px-6 gap-4 shrink-0">
      <div className="flex items-center gap-4 min-w-0">
        <button
          type="button"
          onClick={onMenuClick}
          className="lg:hidden p-2 rounded-xl hover:bg-surface-2 text-text-secondary"
          aria-label="Open menu"
        >
          <Menu className="w-5 h-5" />
        </button>
        {breadcrumbs?.length > 0 && (
          <nav className="hidden sm:flex items-center gap-2 text-sm text-text-secondary" aria-label="Breadcrumb">
            <Link to="/dashboard" className="hover:text-text-primary transition-colors">Dashboard</Link>
            {breadcrumbs.map((crumb, i) => (
              <span key={i} className="flex items-center gap-2">
                <span className="text-border">/</span>
                <span className={i === breadcrumbs.length - 1 ? "text-text-primary font-medium" : "hover:text-text-primary"}>{crumb}</span>
              </span>
            ))}
          </nav>
        )}
      </div>

      <div className="flex items-center gap-2 flex-1 max-w-xl justify-end">
        {isAuthenticated && (
          <form onSubmit={handleSearch} className="hidden md:flex flex-1 max-w-sm">
            <div className="relative w-full">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-text-secondary" />
              <input
                type="search"
                placeholder="Search skills..."
                value={searchQ}
                onChange={(e) => setSearchQ(e.target.value)}
                className="w-full pl-9 pr-4 py-2 rounded-xl bg-surface-2 border border-border text-text-primary placeholder:text-text-secondary text-sm focus:outline-none focus:ring-2 focus:ring-accent"
              />
            </div>
          </form>
        )}

        {!isAuthenticated ? (
          <div className="flex items-center gap-2">
            <Button variant="ghost" size="sm" asChild><Link to="/login">Login</Link></Button>
            <Button size="sm" asChild><Link to="/register">Register</Link></Button>
          </div>
        ) : (
          <>
            <Link
              to="/notifications"
              className="relative p-2 rounded-xl hover:bg-surface-2 text-text-secondary hover:text-text-primary"
              aria-label={`Notifications${unreadCount > 0 ? `, ${unreadCount} unread` : ""}`}
            >
              <Bell className="w-5 h-5" />
              {unreadCount > 0 && (
                <span className="absolute top-1 right-1 w-4 h-4 rounded-full bg-danger text-[10px] text-white flex items-center justify-center">
                  {unreadCount > 9 ? "9+" : unreadCount}
                </span>
              )}
            </Link>
            <div className="relative">
              <button
                type="button"
                onClick={() => setProfileOpen((o) => !o)}
                className="flex items-center gap-2 p-1.5 rounded-xl hover:bg-surface-2"
                aria-expanded={profileOpen}
                aria-haspopup="true"
              >
                <Avatar src={user?.profileImage} name={user?.name} size="sm" />
              </button>
              {profileOpen && (
                <>
                  <div className="fixed inset-0 z-40" aria-hidden="true" onClick={() => setProfileOpen(false)} />
                  <div className="absolute right-0 top-full mt-1 py-1 w-48 rounded-xl bg-surface border border-border shadow-glass z-50">
                    <Link
                      to="/profile"
                      className={cn("flex items-center gap-2 px-4 py-2 text-sm text-text-primary hover:bg-surface-2")}
                      onClick={() => setProfileOpen(false)}
                    >
                      <User className="w-4 h-4" /> Profile
                    </Link>
                    <button
                      type="button"
                      onClick={handleLogout}
                      className="flex items-center gap-2 px-4 py-2 w-full text-sm text-text-primary hover:bg-surface-2 text-left"
                    >
                      <LogOut className="w-4 h-4" /> Logout
                    </button>
                  </div>
                </>
              )}
            </div>
          </>
        )}
      </div>
    </header>
  );
}
