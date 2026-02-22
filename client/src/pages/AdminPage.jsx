import { useEffect } from "react";
import { useDispatch, useSelector } from "react-redux";
import toast from "react-hot-toast";
import { fetchAdminUsers, fetchAdminStats, fetchAdminReports, blockUser, unblockUser, deleteUser } from "../features/admin/adminSlice";
import { fetchPlatformAnalytics } from "../features/analytics/analyticsSlice";
import { BarChart, Bar, XAxis, YAxis, Tooltip, ResponsiveContainer } from "recharts";
import { Card } from "../components/ui/Card";
import { Button } from "../components/ui/Button";
import { Badge } from "../components/ui/Badge";

export default function AdminPage() {
  const dispatch = useDispatch();
  const { users, stats, swapsByMonth, skillsOffered, reports, loading } = useSelector((s) => s.admin);
  const platformAnalytics = useSelector((s) => s.analytics.platform);

  useEffect(() => {
    dispatch(fetchAdminUsers({}));
    dispatch(fetchAdminStats());
    dispatch(fetchAdminReports({}));
    dispatch(fetchPlatformAnalytics());
  }, [dispatch]);

  const handleBlock = async (id) => {
    const r = await dispatch(blockUser(id));
    if (blockUser.fulfilled.match(r)) toast.success("User blocked");
    else toast.error(r.payload?.message);
  };
  const handleUnblock = async (id) => {
    const r = await dispatch(unblockUser(id));
    if (unblockUser.fulfilled.match(r)) toast.success("User unblocked");
  };
  const handleDelete = async (id) => {
    if (!window.confirm("Delete this user?")) return;
    const r = await dispatch(deleteUser(id));
    if (deleteUser.fulfilled.match(r)) toast.success("User deleted");
    else toast.error(r.payload?.message);
  };

  const chartData = (swapsByMonth || []).map((m) => ({ name: `${m._id?.year}-${String(m._id?.month).padStart(2, "0")}`, count: m.count }));

  return (
    <div>
      <h1 className="font-heading text-2xl sm:text-3xl font-bold text-text-primary mb-2">Admin</h1>
      <p className="text-text-secondary text-sm mb-6">Platform analytics and user management.</p>
      {platformAnalytics && (
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-6">
          <Card className="p-6"><p className="text-sm text-text-secondary">Total users</p><p className="font-heading text-xl font-bold text-text-primary">{platformAnalytics.totalUsers}</p></Card>
          <Card className="p-6"><p className="text-sm text-text-secondary">Active (7d)</p><p className="font-heading text-xl font-bold text-text-primary">{platformAnalytics.activeUsers}</p></Card>
          <Card className="p-6"><p className="text-sm text-text-secondary">Total requests</p><p className="font-heading text-xl font-bold text-text-primary">{platformAnalytics.totalRequests}</p></Card>
          <Card className="p-6"><p className="text-sm text-text-secondary">Total messages</p><p className="font-heading text-xl font-bold text-text-primary">{platformAnalytics.totalMessages}</p></Card>
        </div>
      )}
      {stats && (
        <div className="grid grid-cols-2 md:grid-cols-5 gap-4 mb-8">
          <Card className="p-4"><p className="text-sm text-text-secondary">Users</p><p className="font-heading text-xl font-bold text-text-primary">{stats.userCount}</p></Card>
          <Card className="p-4"><p className="text-sm text-text-secondary">Swaps</p><p className="font-heading text-xl font-bold text-text-primary">{stats.swapCount}</p></Card>
          <Card className="p-4"><p className="text-sm text-text-secondary">Pending</p><p className="font-heading text-xl font-bold text-text-primary">{stats.pendingSwaps}</p></Card>
          <Card className="p-4"><p className="text-sm text-text-secondary">Completed</p><p className="font-heading text-xl font-bold text-text-primary">{stats.completedSwaps}</p></Card>
          <Card className="p-4"><p className="text-sm text-text-secondary">Reviews</p><p className="font-heading text-xl font-bold text-text-primary">{stats.reviewCount}</p></Card>
        </div>
      )}
      {chartData.length > 0 && (
        <Card className="mb-8 p-6">
          <h2 className="font-heading font-semibold text-text-primary mb-4">Completed swaps by month</h2>
          <div className="h-64">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={chartData}>
                <XAxis dataKey="name" stroke="#9CA3AF" fontSize={12} />
                <YAxis stroke="#9CA3AF" fontSize={12} />
                <Tooltip contentStyle={{ backgroundColor: "var(--color-surface)", border: "1px solid var(--color-border)", borderRadius: "0.75rem" }} />
                <Bar dataKey="count" fill="var(--color-accent)" radius={[4, 4, 0, 0]} />
              </BarChart>
            </ResponsiveContainer>
          </div>
        </Card>
      )}
      <h2 className="font-heading font-semibold text-lg text-text-primary mb-4">Users</h2>
      <Card className="overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full">
            <thead className="bg-surface-2 border-b border-border">
              <tr>
                <th className="text-left p-4 text-sm font-medium text-text-secondary">Name</th>
                <th className="text-left p-4 text-sm font-medium text-text-secondary">Email</th>
                <th className="text-left p-4 text-sm font-medium text-text-secondary">Role</th>
                <th className="text-left p-4 text-sm font-medium text-text-secondary">Blocked</th>
                <th className="text-left p-4 text-sm font-medium text-text-secondary">Actions</th>
              </tr>
            </thead>
            <tbody>
              {(users || []).map((u) => (
                <tr key={u._id} className="border-b border-border last:border-0">
                  <td className="p-4 text-text-primary">{u.name}</td>
                  <td className="p-4 text-text-secondary text-sm">{u.email}</td>
                  <td className="p-4"><Badge variant="default">{u.role}</Badge></td>
                  <td className="p-4">{u.isBlocked ? <Badge variant="danger">Yes</Badge> : <Badge variant="success">No</Badge>}</td>
                  <td className="p-4 flex gap-2">
                    {u.isBlocked ? (
                      <Button size="sm" variant="success" onClick={() => handleUnblock(u._id)}>Unblock</Button>
                    ) : (
                      <Button size="sm" variant="secondary" onClick={() => handleBlock(u._id)}>Block</Button>
                    )}
                    <Button size="sm" variant="danger" onClick={() => handleDelete(u._id)}>Delete</Button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </Card>
      {(!users || users.length === 0) && !loading && <p className="text-text-secondary mt-4">No users.</p>}

      <h2 className="font-heading font-semibold text-lg text-text-primary mb-4 mt-8">Reported users</h2>
      <Card className="overflow-hidden mb-8">
        <div className="overflow-x-auto">
          <table className="w-full">
            <thead className="bg-surface-2 border-b border-border">
              <tr>
                <th className="text-left p-4 text-sm font-medium text-text-secondary">Reported user</th>
                <th className="text-left p-4 text-sm font-medium text-text-secondary">Reported by</th>
                <th className="text-left p-4 text-sm font-medium text-text-secondary">Reason</th>
                <th className="text-left p-4 text-sm font-medium text-text-secondary">Date</th>
              </tr>
            </thead>
            <tbody>
              {(reports || []).map((r) => (
                <tr key={r._id} className="border-b border-border last:border-0">
                  <td className="p-4 text-text-primary">{r.reportedUserId?.name ?? r.reportedUserId} ({r.reportedUserId?.email})</td>
                  <td className="p-4 text-text-secondary">{r.reportedBy?.name ?? r.reportedBy}</td>
                  <td className="p-4 max-w-xs truncate text-text-secondary text-sm">{r.reason}</td>
                  <td className="p-4 text-sm text-text-secondary">{r.createdAt ? new Date(r.createdAt).toLocaleDateString() : ""}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </Card>
      {(!reports || reports.length === 0) && <p className="text-text-secondary">No reports.</p>}
    </div>
  );
}
