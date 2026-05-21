import { useEffect } from "react";
import { Link } from "react-router-dom";
import { useDispatch, useSelector } from "react-redux";
import { fetchDashboardStats } from "../features/dashboard/dashboardSlice";
import { fetchUserAnalytics } from "../features/analytics/analyticsSlice";
import { fetchMatches } from "../features/matches/matchesSlice";
import { BarChart, Bar, XAxis, YAxis, Tooltip, ResponsiveContainer } from "recharts";
import { Card } from "../components/ui/Card";
import { Button } from "../components/ui/Button";
import { Avatar } from "../components/ui/Avatar";
import { Skeleton } from "../components/ui/Skeleton";
import { TrendingUp, Clock, CheckCircle, Star } from "lucide-react";

export default function DashboardPage() {
  const dispatch = useDispatch();
  const { user } = useSelector((s) => s.auth);
  const { stats, swapsByMonth, loading } = useSelector((s) => s.dashboard);
  const { user: userAnalytics } = useSelector((s) => s.analytics);
  const { data: matches } = useSelector((s) => s.matches);

  useEffect(() => {
    dispatch(fetchDashboardStats());
    dispatch(fetchUserAnalytics());
    dispatch(fetchMatches({ page: 1, limit: 6 }));
  }, [dispatch]);

  const totalSwaps = userAnalytics?.totalSwaps ?? stats?.totalSwaps ?? 0;
  const pending = userAnalytics?.pendingSwaps ?? stats?.pending ?? 0;
  const completed = userAnalytics?.completedSwaps ?? stats?.completed ?? 0;
  const ratingAvg = userAnalytics?.ratingAverage ?? stats?.ratingAvg ?? 0;
  const ratingCount = userAnalytics?.ratingCount ?? stats?.ratingCount ?? 0;
  const chartData = (swapsByMonth || []).map((m) => ({
    name: `${m._id?.year}-${String(m._id?.month).padStart(2, "0")}`,
    count: m.count,
  }));

  return (
    <div>
      <h1 className="font-heading text-2xl sm:text-3xl font-bold text-text-primary mb-2">Welcome, {user?.name}</h1>
      <p className="text-text-secondary text-sm mb-8">Here's your swap overview.</p>
      {loading && !stats ? (
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-8">
          {[1, 2, 3, 4].map((i) => <Skeleton key={i} className="h-24 rounded-2xl" />)}
        </div>
      ) : (
        <>
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-8">
            <Card hover className="p-6">
              <div className="flex items-center gap-3 mb-2">
                <TrendingUp className="w-5 h-5 text-accent" />
                <span className="text-text-secondary text-sm">Total swaps</span>
              </div>
              <p className="font-heading text-2xl font-bold text-text-primary">{totalSwaps}</p>
            </Card>
            <Card hover className="p-6">
              <div className="flex items-center gap-3 mb-2">
                <Clock className="w-5 h-5 text-warning" />
                <span className="text-text-secondary text-sm">Pending</span>
              </div>
              <p className="font-heading text-2xl font-bold text-text-primary">{pending}</p>
            </Card>
            <Card hover className="p-6">
              <div className="flex items-center gap-3 mb-2">
                <CheckCircle className="w-5 h-5 text-accent-2" />
                <span className="text-text-secondary text-sm">Completed</span>
              </div>
              <p className="font-heading text-2xl font-bold text-text-primary">{completed}</p>
            </Card>
            <Card hover className="p-6">
              <div className="flex items-center gap-3 mb-2">
                <Star className="w-5 h-5 text-warning" />
                <span className="text-text-secondary text-sm">Your rating</span>
              </div>
              <p className="font-heading text-2xl font-bold text-text-primary">{ratingAvg} <span className="text-sm font-normal text-text-secondary">({ratingCount})</span></p>
            </Card>
          </div>
          {chartData.length > 0 && (
            <Card className="mb-8 p-6">
              <h2 className="font-heading font-semibold text-lg text-text-primary mb-4">Swaps by month</h2>
              <div className="h-64" style={{ minHeight: 256 }}>
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
          <div>
            <h2 className="font-heading font-semibold text-lg text-text-primary mb-4">Suggested matches</h2>
            {!matches?.length ? (
              <Card className="p-8 text-center">
                <p className="text-text-secondary mb-4">Add skills in your profile to get matches.</p>
                <Button asChild><Link to="/profile">Edit profile</Link></Button>
              </Card>
            ) : (
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                {(matches || []).slice(0, 6).map((item) => {
                  const u = item.user || item;
                  const reasons = item.reasons || [];
                  return (
                    <Link key={u._id} to={`/user/${u._id}`}>
                      <Card hover className="p-6 h-full transition-all duration-200">
                        <div className="flex items-center gap-3 mb-3">
                          <Avatar src={u.profileImage} name={u.name} size="md" />
                          <div>
                            <p className="font-medium text-text-primary">{u.name}</p>
                            <p className="text-xs text-text-secondary">Rating: {u.ratingAvg ?? 0} ({u.ratingCount ?? 0})</p>
                          </div>
                        </div>
                        {reasons.length > 0 && (
                          <div className="flex flex-wrap gap-1 mb-3">
                            {reasons.slice(0, 3).map((r) => (
                              <span key={r} className="text-xs px-2 py-0.5 rounded-lg bg-accent-2/20 text-accent-2 border border-accent-2/30">✓ {r}</span>
                            ))}
                          </div>
                        )}
                        <p className="text-sm text-text-secondary">Offers: {u.skillsOffered?.join(", ") || "—"}</p>
                        <p className="text-sm text-text-secondary">Wants: {u.skillsWanted?.join(", ") || "—"}</p>
                      </Card>
                    </Link>
                  );
                })}
              </div>
            )}
          </div>
        </>
      )}
    </div>
  );
}
