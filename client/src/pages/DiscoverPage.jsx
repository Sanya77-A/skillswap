import { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import { useDispatch, useSelector } from "react-redux";
import { fetchMatches } from "../features/matches/matchesSlice";
import { searchUsers } from "../features/user/userSlice";
import { Tabs, TabsList, TabsTrigger, TabsContent } from "../components/ui/Tabs";
import { Input } from "../components/ui/Input";
import { Select } from "../components/ui/Select";
import { Button } from "../components/ui/Button";
import { Card } from "../components/ui/Card";
import { Avatar } from "../components/ui/Avatar";
import { Search } from "lucide-react";

export default function DiscoverPage() {
  const dispatch = useDispatch();
  const [tab, setTab] = useState("matches");
  const [filters, setFilters] = useState({ experienceLevel: "", page: 1 });
  const [searchQ, setSearchQ] = useState("");
  const { data: matches, pagination: matchPagination } = useSelector((s) => s.matches);
  const { searchResults, searchPagination } = useSelector((s) => s.user);

  useEffect(() => {
    if (tab === "matches") dispatch(fetchMatches({ page: filters.page, ...(filters.experienceLevel && { experienceLevel: filters.experienceLevel }) }));
  }, [tab, filters, dispatch]);

  useEffect(() => {
    if (tab === "search" && searchQ) dispatch(searchUsers({ q: searchQ, page: filters.page }));
  }, [tab, searchQ, filters.page, dispatch]);

  const users = tab === "matches" ? matches : searchResults;
  const pagination = tab === "matches" ? matchPagination : searchPagination;

  return (
    <div>
      <h1 className="font-heading text-2xl sm:text-3xl font-bold text-text-primary mb-2">Discover</h1>
      <p className="text-text-secondary text-sm mb-6">Find peers to swap skills with.</p>

      <Tabs value={tab} onChange={setTab}>
        <TabsList className="mb-6">
          <TabsTrigger value="matches">Matches</TabsTrigger>
          <TabsTrigger value="search">Search</TabsTrigger>
        </TabsList>

        {tab === "search" && (
          <div className="mb-6 flex gap-2">
            <div className="flex-1 max-w-md">
              <Input
                placeholder="Search by name or skill..."
                value={searchQ}
                onChange={(e) => setSearchQ(e.target.value)}
              />
            </div>
            <Button onClick={() => dispatch(searchUsers({ q: searchQ }))}>
              <Search className="w-4 h-4" /> Search
            </Button>
          </div>
        )}

        {tab === "matches" && (
          <div className="mb-6 max-w-xs">
            <select
              value={filters.experienceLevel}
              onChange={(e) => setFilters((f) => ({ ...f, experienceLevel: e.target.value, page: 1 }))}
              className="w-full px-4 py-2.5 rounded-xl bg-surface border border-border text-text-primary focus:ring-2 focus:ring-accent"
            >
              <option value="">All levels</option>
              <option value="beginner">Beginner</option>
              <option value="intermediate">Intermediate</option>
              <option value="advanced">Advanced</option>
              <option value="expert">Expert</option>
            </select>
          </div>
        )}

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {(users || []).map((item) => {
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
                      {reasons.map((r) => (
                        <span key={r} className="text-xs px-2 py-0.5 rounded-lg bg-accent-2/20 text-accent-2 border border-accent-2/30">
                          ✓ {r}
                        </span>
                      ))}
                    </div>
                  )}
                  <p className="text-sm text-text-secondary">Offers: {u.skillsOffered?.join(", ") || "—"}</p>
                  <p className="text-sm text-text-secondary">Wants: {u.skillsWanted?.join(", ") || "—"}</p>
                  {item.matchScore != null && <p className="text-xs text-text-secondary mt-2">Match score: {item.matchScore}</p>}
                </Card>
              </Link>
            );
          })}
        </div>

        {(!users || users.length === 0) && (
          <Card className="p-12 text-center text-text-secondary">No users found.</Card>
        )}

        {pagination && pagination.pages > 1 && (
          <div className="mt-6 flex items-center gap-4">
            <Button
              variant="secondary"
              size="sm"
              disabled={pagination.page <= 1}
              onClick={() => setFilters((f) => ({ ...f, page: f.page - 1 }))}
            >
              Previous
            </Button>
            <span className="text-sm text-text-secondary">Page {pagination.page} of {pagination.pages}</span>
            <Button
              variant="secondary"
              size="sm"
              disabled={pagination.page >= pagination.pages}
              onClick={() => setFilters((f) => ({ ...f, page: f.page + 1 }))}
            >
              Next
            </Button>
          </div>
        )}
      </Tabs>
    </div>
  );
}
