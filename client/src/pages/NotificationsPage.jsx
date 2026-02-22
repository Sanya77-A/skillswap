import { useEffect } from "react";
import { Link } from "react-router-dom";
import { useDispatch, useSelector } from "react-redux";
import { fetchNotifications, markAsRead, markAllAsRead } from "../features/notifications/notificationsSlice";
import { Button } from "../components/ui/Button";

export default function NotificationsPage() {
  const dispatch = useDispatch();
  const { data: notifications } = useSelector((s) => s.notifications);

  useEffect(() => {
    dispatch(fetchNotifications({ limit: 50 }));
  }, [dispatch]);

  const handleMarkRead = (id) => {
    dispatch(markAsRead(id));
  };

  return (
    <div>
      <div className="flex justify-between items-center mb-6">
        <h1 className="font-heading text-2xl sm:text-3xl font-bold text-text-primary">Notifications</h1>
        <Button variant="secondary" size="sm" onClick={() => dispatch(markAllAsRead())}>Mark all read</Button>
      </div>
      <div className="space-y-2">
        {(notifications || []).map((n) => (
          <div
            key={n._id}
            className={`p-4 rounded-2xl border border-border transition-colors ${n.read ? "bg-surface" : "bg-surface-2/50 border-accent/20"}`}
          >
            <div className="flex justify-between items-start gap-4">
              <div>
                <p className="font-medium text-text-primary">{n.title}</p>
                {(n.body || n.message) && <p className="text-sm text-text-secondary mt-1">{n.body || n.message}</p>}
                <p className="text-xs text-text-secondary mt-2">{new Date(n.createdAt).toLocaleString()}</p>
                {n.link && <Link to={n.link} className="text-sm text-accent hover:underline mt-2 inline-block">View</Link>}
              </div>
              {!n.read && <Button variant="ghost" size="sm" onClick={() => handleMarkRead(n._id)}>Mark read</Button>}
            </div>
          </div>
        ))}
      </div>
      {(!notifications || notifications.length === 0) && <p className="text-text-secondary py-8 text-center">No notifications.</p>}
    </div>
  );
}
