import { Link, useLocation } from "react-router-dom";
import {
  LayoutDashboard,
  Compass,
  MessageSquare,
  Calendar,
  Bell,
  User,
  Shield,
  FileText,
} from "lucide-react";
import { useTheme } from "../../context/ThemeContext";
import { Sun, Moon } from "lucide-react";
import { Avatar } from "../ui/Avatar";
import { useSelector } from "react-redux";
import { cn } from "../../lib/utils";

const navItems = [
  { to: "/dashboard", label: "Dashboard", icon: LayoutDashboard },
  { to: "/discover", label: "Discover", icon: Compass },
  { to: "/requests", label: "Requests", icon: FileText },
  { to: "/sessions", label: "Sessions", icon: Calendar },
  { to: "/chat", label: "Chat", icon: MessageSquare },
  { to: "/notifications", label: "Notifications", icon: Bell },
  { to: "/profile", label: "Profile", icon: User },
];

export function Sidebar({ collapsed, onClose }) {
  const location = useLocation();
  const { theme, toggleTheme } = useTheme();
  const { user, isAuthenticated } = useSelector((s) => s.auth);
  const unreadCount = useSelector((s) => s.notifications.unreadCount);

  if (!isAuthenticated) return null;

  return (
    <aside
      className={cn(
        "flex flex-col border-r border-border bg-surface transition-all duration-250 z-40",
        collapsed ? "w-[72px]" : "w-56"
      )}
      onClick={onClose}
    >
      <div className="p-4 border-b border-border flex items-center gap-3">
        <Link to="/" className="flex items-center gap-2 min-w-0">
          <span className="text-accent font-heading font-bold text-xl shrink-0">S</span>
          {!collapsed && <span className="font-heading font-semibold text-text-primary truncate">SkillSwap</span>}
        </Link>
      </div>
      <nav className="flex-1 p-2 space-y-0.5 overflow-y-auto">
        {navItems.map(({ to, label, icon: Icon }) => {
          const isActive = location.pathname === to || (to !== "/dashboard" && location.pathname.startsWith(to));
          const isNotifications = to === "/notifications";
          return (
            <Link
              key={to}
              to={to}
              className={cn(
                "flex items-center gap-3 px-3 py-2.5 rounded-xl text-sm font-medium transition-all duration-200",
                isActive ? "bg-accent/15 text-accent" : "text-text-secondary hover:bg-surface-2 hover:text-text-primary"
              )}
            >
              <span className="relative shrink-0">
                <Icon className="w-5 h-5" />
                {isNotifications && unreadCount > 0 && (
                  <span className="absolute -top-1 -right-1 w-4 h-4 rounded-full bg-danger text-[10px] text-white flex items-center justify-center font-sans">
                    {unreadCount > 9 ? "9+" : unreadCount}
                  </span>
                )}
              </span>
              {!collapsed && <span>{label}</span>}
            </Link>
          );
        })}
        {user?.role === "admin" && (
          <Link
            to="/admin"
            className={cn(
              "flex items-center gap-3 px-3 py-2.5 rounded-xl text-sm font-medium transition-all duration-200",
              location.pathname.startsWith("/admin") ? "bg-danger/15 text-danger" : "text-text-secondary hover:bg-surface-2 hover:text-text-primary"
            )}
          >
            <Shield className="w-5 h-5 shrink-0" />
            {!collapsed && <span>Admin</span>}
          </Link>
        )}
      </nav>
      <div className="p-2 border-t border-border space-y-1">
        <button
          type="button"
          onClick={toggleTheme}
          className="flex items-center gap-3 px-3 py-2.5 rounded-xl w-full text-text-secondary hover:bg-surface-2 hover:text-text-primary text-sm"
          aria-label="Toggle theme"
        >
          {theme === "dark" ? <Sun className="w-5 h-5" /> : <Moon className="w-5 h-5" />}
          {!collapsed && <span>{theme === "dark" ? "Light mode" : "Dark mode"}</span>}
        </button>
        {user && !collapsed && (
          <Link
            to="/profile"
            className="flex items-center gap-3 px-3 py-2.5 rounded-xl text-text-secondary hover:bg-surface-2"
          >
            <Avatar src={user.profileImage} name={user.name} size="sm" />
            <span className="text-sm truncate">{user.name}</span>
          </Link>
        )}
      </div>
    </aside>
  );
}
