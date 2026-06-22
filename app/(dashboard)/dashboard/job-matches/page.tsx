"use client";

// Job Matches — /dashboard/job-matches
// Stitch reference: job_matches_no_footer
// Layout: search + filter bar, 2/3 job cards, 1/3 Skill Gap Insight panel (sticky)
// API: GET /api/job-matches?resume_id=uuid[&refresh=true]

import { useEffect, useState, useMemo } from "react";
import { useRouter } from "next/navigation";
import { createClient } from "@/lib/supabase/client";
import {
  Search,
  MapPin,
  Briefcase,
  DollarSign,
  ExternalLink,
  RefreshCw,
  BarChart3,
  AlertTriangle,
  CheckCircle,
  Wifi,
  ChevronDown,
  Loader2,
} from "lucide-react";
import type { JobMatchResponse } from "@/app/api/job-matches/route";

// ── Types ────────────────────────────────────────────────────────────────────

interface SkillGap {
  skill: string;
  count: number;
}

// ── Helpers ──────────────────────────────────────────────────────────────────

function scoreBadgeStyle(score: number): string {
  if (score >= 85) return "bg-green-100 text-green-700 border-green-200";
  if (score >= 70) return "bg-amber-100 text-amber-700 border-amber-200";
  return "bg-muted text-muted-foreground border-border";
}

function scoreLabel(score: number): string {
  if (score >= 85) return "Strong Match";
  if (score >= 70) return "Good Match";
  return "Partial Match";
}

function timeAgo(isoDate: string | null): string {
  if (!isoDate) return "";
  const diff = Date.now() - new Date(isoDate).getTime();
  const hours = Math.floor(diff / 3_600_000);
  if (hours < 1) return "Just posted";
  if (hours < 24) return `${hours}h ago`;
  const days = Math.floor(hours / 24);
  if (days === 1) return "Yesterday";
  return `${days} days ago`;
}

function aggregateSkillGaps(jobs: JobMatchResponse[], topN = 5): SkillGap[] {
  const counts: Record<string, number> = {};
  jobs.slice(0, 5).forEach((job) => {
    (job.missing_skills ?? []).forEach((s) => {
      counts[s] = (counts[s] ?? 0) + 1;
    });
  });
  return Object.entries(counts)
    .sort((a, b) => b[1] - a[1])
    .slice(0, topN)
    .map(([skill, count]) => ({ skill, count }));
}

// ── Job Card ─────────────────────────────────────────────────────────────────

function JobCard({
  job,
  rank,
}: {
  job: JobMatchResponse;
  rank: number;
}) {
  return (
    <div className="group bg-card border border-border rounded-lg overflow-hidden hover:shadow-aesthetic transition-all duration-300">
      <div className="p-6">
        {/* Header row */}
        <div className="flex justify-between items-start mb-4 gap-3">
          <div className="flex gap-3 min-w-0">
            {/* Company icon */}
            <div className="w-12 h-12 flex-shrink-0 rounded-lg bg-muted flex items-center justify-center text-primary font-serif font-bold text-lg">
              {job.company.charAt(0).toUpperCase()}
            </div>
            <div className="min-w-0">
              <h3 className="text-lg font-bold font-serif group-hover:text-primary transition-colors truncate">
                {job.title}
              </h3>
              <p className="text-muted-foreground text-sm italic truncate">
                {job.company}
                {job.location ? ` • ${job.location}` : ""}
              </p>
            </div>
          </div>

          {/* Match badge */}
          <div className="flex flex-col items-end flex-shrink-0">
            <div
              className={`flex items-center gap-1 px-3 py-1 rounded-full text-sm font-bold border ${scoreBadgeStyle(job.match_score)}`}
            >
              {job.match_score >= 85 ? (
                <CheckCircle className="w-3.5 h-3.5" />
              ) : (
                <BarChart3 className="w-3.5 h-3.5" />
              )}
              {job.match_score}% Match
            </div>
            {job.posted_at && (
              <span className="text-xs text-muted-foreground mt-1.5 italic">
                {timeAgo(job.posted_at)}
              </span>
            )}
          </div>
        </div>

        {/* Skills */}
        {(job.matched_skills.length > 0 || job.missing_skills.length > 0) && (
          <div className="mb-5">
            <p className="text-xs font-bold uppercase tracking-wider text-muted-foreground mb-2">
              Skills
            </p>
            <div className="flex flex-wrap gap-2">
              {job.matched_skills.slice(0, 5).map((s) => (
                <span
                  key={s}
                  className="px-2.5 py-1 bg-primary/8 text-primary rounded-md text-xs border border-primary/20 italic"
                >
                  {s}
                </span>
              ))}
              {job.missing_skills.slice(0, 3).map((s) => (
                <span
                  key={s}
                  className="px-2.5 py-1 bg-background text-muted-foreground rounded-md text-xs border border-border italic"
                  title="You may be missing this skill"
                >
                  {s} ↗
                </span>
              ))}
            </div>
          </div>
        )}

        {/* Footer row */}
        <div className="flex items-center justify-between pt-4 border-t border-border gap-3">
          <div className="flex flex-wrap gap-4 text-sm text-muted-foreground italic">
            {job.salary && (
              <span className="flex items-center gap-1">
                <DollarSign className="w-3.5 h-3.5" />
                {job.salary}
              </span>
            )}
            {job.job_type && (
              <span className="flex items-center gap-1">
                <Briefcase className="w-3.5 h-3.5" />
                {job.job_type}
              </span>
            )}
            {job.location?.toLowerCase().includes("remote") && (
              <span className="flex items-center gap-1">
                <Wifi className="w-3.5 h-3.5" />
                Remote
              </span>
            )}
            {job.location && !job.location.toLowerCase().includes("remote") && (
              <span className="flex items-center gap-1">
                <MapPin className="w-3.5 h-3.5" />
                {job.location}
              </span>
            )}
          </div>

          <a
            href={job.external_url}
            target="_blank"
            rel="noopener noreferrer"
            className={`flex items-center gap-2 px-6 py-2.5 rounded-lg font-bold text-sm transition-all shadow-aesthetic flex-shrink-0 ${
              job.match_score >= 70
                ? "bg-primary text-white hover:opacity-90"
                : "bg-muted text-foreground border border-border hover:bg-accent"
            }`}
          >
            Apply Now
            <ExternalLink className="w-3.5 h-3.5" />
          </a>
        </div>
      </div>
    </div>
  );
}

// ── Skill Gap Panel ───────────────────────────────────────────────────────────

function SkillGapPanel({
  jobs,
  totalMatches,
}: {
  jobs: JobMatchResponse[];
  totalMatches: number;
}) {
  const gaps = aggregateSkillGaps(jobs);
  const avgScore =
    jobs.length > 0
      ? Math.round(jobs.reduce((sum, j) => sum + j.match_score, 0) / jobs.length)
      : 0;

  return (
    <aside className="flex flex-col gap-5">
      {/* Skill Gap Insight */}
      <div
        className="bg-card border border-border rounded-lg p-6 shadow-aesthetic sticky top-6"
      >
        <div className="flex items-center gap-2 mb-4 text-primary">
          <BarChart3 className="w-5 h-5" />
          <h2 className="text-lg font-bold font-serif text-foreground">Skill Gap Insight</h2>
        </div>
        <p className="text-muted-foreground italic font-serif text-sm mb-5 leading-relaxed">
          Key skills missing from your top matches. Bridge these gaps to increase your score.
        </p>

        {gaps.length > 0 ? (
          <div className="space-y-5">
            {/* Critical gaps */}
            <div>
              <h4 className="text-xs font-bold uppercase tracking-wider text-foreground mb-3 flex justify-between items-center">
                Critical Gaps
                <span className="text-muted-foreground font-normal normal-case tracking-normal">
                  {gaps.length} identified
                </span>
              </h4>
              <div className="space-y-2.5">
                {gaps.map((gap, i) => (
                  <div
                    key={gap.skill}
                    className={`p-3 rounded-lg border flex items-start gap-3 ${
                      i === 0
                        ? "bg-background border-primary/15"
                        : "bg-background border-border"
                    }`}
                  >
                    <AlertTriangle
                      className={`w-4 h-4 mt-0.5 flex-shrink-0 ${
                        i === 0 ? "text-primary" : "text-muted-foreground"
                      }`}
                    />
                    <div>
                      <p className="text-sm font-bold">{gap.skill}</p>
                      <p className="text-xs text-muted-foreground mt-0.5">
                        Required by {gap.count} of your top matches
                      </p>
                    </div>
                  </div>
                ))}
              </div>
            </div>

            {/* Market potential */}
            <div className="pt-4 border-t border-border">
              <h4 className="text-xs font-bold uppercase tracking-wider text-foreground mb-3">
                Avg Match Score
              </h4>
              <div className="flex items-center gap-3 mb-1.5">
                <div className="flex-1 h-2.5 bg-muted rounded-full overflow-hidden">
                  <div
                    className="h-full bg-primary rounded-full transition-all"
                    style={{ width: `${avgScore}%` }}
                  />
                </div>
                <span className="text-sm font-black text-primary w-10 text-right">
                  {avgScore}%
                </span>
              </div>
              <p className="text-xs text-muted-foreground">
                Across {jobs.length} matched role{jobs.length !== 1 ? "s" : ""}
              </p>
            </div>
          </div>
        ) : (
          <p className="text-sm text-muted-foreground italic font-serif">
            No skill gaps detected — great profile coverage!
          </p>
        )}
      </div>

      {/* Quick stats */}
      <div className="grid grid-cols-2 gap-3">
        <div className="bg-card border border-border p-4 rounded-xl text-center shadow-aesthetic">
          <p className="text-2xl font-black font-serif text-primary">{totalMatches}</p>
          <p className="text-[10px] text-muted-foreground uppercase font-bold tracking-wider mt-1">
            Matches
          </p>
        </div>
        <div className="bg-card border border-border p-4 rounded-xl text-center shadow-aesthetic">
          <p className="text-2xl font-black font-serif text-foreground">
            {jobs.filter((j) => j.match_score >= 85).length}
          </p>
          <p className="text-[10px] text-muted-foreground uppercase font-bold tracking-wider mt-1">
            Strong Fits
          </p>
        </div>
      </div>
    </aside>
  );
}

// ── Page ─────────────────────────────────────────────────────────────────────

export default function JobMatchesPage() {
  const supabase = createClient();
  const router = useRouter();

  const [resumeId, setResumeId] = useState<string | null>(null);
  const [jobs, setJobs] = useState<JobMatchResponse[]>([]);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [cached, setCached] = useState(false);

  // Filters
  const [search, setSearch] = useState("");
  const [remoteOnly, setRemoteOnly] = useState(false);
  const [sortBy, setSortBy] = useState<"match" | "recent">("match");

  // ── Load resume ID ──────────────────────────────────────────────────────────
  useEffect(() => {
    async function loadResume() {
      const {
        data: { user },
      } = await supabase.auth.getUser();
      if (!user) {
        setError("You are not signed in.");
        setLoading(false);
        return;
      }
      const { data } = await supabase
        .from("resumes")
        .select("id")
        .eq("user_id", user.id)
        .order("created_at", { ascending: false })
        .limit(1)
        .single();

      if (!data) {
        setError("No resume found. Please upload a resume first.");
        setLoading(false);
        return;
      }
      setResumeId(data.id);
    }
    loadResume();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  // ── Fetch matches when resumeId is set ──────────────────────────────────────
  useEffect(() => {
    if (!resumeId) return;
    fetchMatches(false);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [resumeId]);

  async function fetchMatches(forceRefresh: boolean) {
    if (!resumeId) return;
    forceRefresh ? setRefreshing(true) : setLoading(true);
    setError(null);

    try {
      const url = `/api/job-matches?resume_id=${resumeId}${forceRefresh ? "&refresh=true" : ""}`;
      const res = await fetch(url);
      const data = await res.json();

      if (!res.ok) {
        setError(data.error ?? "Failed to load job matches.");
      } else {
        setJobs(data.jobs ?? []);
        setCached(data.cached ?? false);
        if (!data.cached) {
          router.refresh();
        }
      }
    } catch {
      setError("Network error. Please try again.");
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  }

  // ── Derived / filtered jobs ─────────────────────────────────────────────────
  const filteredJobs = useMemo(() => {
    let result = [...jobs];

    if (search.trim()) {
      const q = search.toLowerCase();
      result = result.filter(
        (j) =>
          j.title.toLowerCase().includes(q) ||
          j.company.toLowerCase().includes(q) ||
          j.location?.toLowerCase().includes(q)
      );
    }

    if (remoteOnly) {
      result = result.filter((j) => j.location?.toLowerCase().includes("remote"));
    }

    if (sortBy === "recent") {
      result.sort((a, b) => {
        if (!a.posted_at && !b.posted_at) return 0;
        if (!a.posted_at) return 1;
        if (!b.posted_at) return -1;
        return new Date(b.posted_at).getTime() - new Date(a.posted_at).getTime();
      });
    }
    // "match" sort is already applied server-side

    return result;
  }, [jobs, search, remoteOnly, sortBy]);

  // ── Loading state ───────────────────────────────────────────────────────────
  if (loading) {
    return (
      <div className="p-8 flex flex-col items-center justify-center min-h-[60vh] gap-4">
        <Loader2 className="w-8 h-8 text-primary animate-spin" />
        <p className="text-muted-foreground italic font-serif text-sm">
          Finding your best job matches…
        </p>
      </div>
    );
  }

  // ── Error state ─────────────────────────────────────────────────────────────
  if (error && jobs.length === 0) {
    return (
      <div className="p-8">
        <div
          className="bg-card border border-border rounded-xl p-8 text-center max-w-md mx-auto shadow-aesthetic"
        >
          <AlertTriangle className="w-8 h-8 text-orange-500 mx-auto mb-3" />
          <p className="text-foreground font-medium">{error}</p>
        </div>
      </div>
    );
  }

  // ── Main render ─────────────────────────────────────────────────────────────
  return (
    <div className="p-6 md:p-8">
      {/* Header */}
      <div className="mb-8">
        <h1 className="text-3xl font-serif font-bold text-foreground mb-1.5">Job Matches</h1>
        <p className="text-muted-foreground italic font-serif text-sm">
          Curated opportunities specifically analyzed for your professional profile and growth trajectory.
        </p>
      </div>

      {/* Filter Bar */}
      <div className="flex flex-wrap items-center gap-3 mb-8 bg-card p-4 rounded-xl border border-border shadow-aesthetic">
        {/* Search */}
        <div className="relative flex-1 min-w-[200px]">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
          <input
            type="text"
            placeholder="Search roles, companies…"
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="w-full pl-9 pr-4 py-2 bg-background border border-border rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-primary/30 italic placeholder:text-muted-foreground"
          />
        </div>

        {/* Sort */}
        <div className="relative">
          <select
            value={sortBy}
            onChange={(e) => setSortBy(e.target.value as "match" | "recent")}
            className="appearance-none h-10 pl-3 pr-8 bg-background border border-border rounded-lg text-sm font-medium focus:outline-none focus:ring-2 focus:ring-primary/30 cursor-pointer"
          >
            <option value="match">Best Match</option>
            <option value="recent">Most Recent</option>
          </select>
          <ChevronDown className="absolute right-2 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground pointer-events-none" />
        </div>

        {/* Remote toggle */}
        <button
          onClick={() => setRemoteOnly((v) => !v)}
          className={`flex items-center gap-2 h-10 px-4 rounded-lg border text-sm font-medium transition-all ${
            remoteOnly
              ? "bg-primary text-white border-primary"
              : "bg-background border-border hover:bg-muted"
          }`}
        >
          <Wifi className="w-4 h-4" />
          Remote Only
        </button>

        {/* Refresh */}
        <button
          onClick={() => fetchMatches(true)}
          disabled={refreshing}
          className="flex items-center gap-2 h-10 px-4 bg-primary text-white font-bold rounded-lg hover:opacity-90 transition-all shadow-aesthetic disabled:opacity-60"
        >
          <RefreshCw className={`w-4 h-4 ${refreshing ? "animate-spin" : ""}`} />
          {refreshing ? "Searching…" : cached ? "Refresh" : "Re-fetch"}
        </button>
      </div>

      {/* Results count + cache notice */}
      {jobs.length > 0 && (
        <p className="text-xs text-muted-foreground mb-5 px-1">
          {filteredJobs.length} of {jobs.length} matches shown
          {cached && (
            <span className="ml-2 italic">
              (cached — click Refresh for new results)
            </span>
          )}
        </p>
      )}

      {/* Error banner (non-fatal) */}
      {error && jobs.length > 0 && (
        <div className="mb-5 p-3 bg-orange-50 border border-orange-200 rounded-lg text-sm text-orange-700">
          {error}
        </div>
      )}

      {/* Main 2/3 + 1/3 grid */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8 items-start">

        {/* Job Cards */}
        <div className="lg:col-span-2 flex flex-col gap-5">
          {filteredJobs.length === 0 ? (
            <div className="bg-card border border-border rounded-xl p-12 text-center shadow-aesthetic">
              <Briefcase className="w-10 h-10 text-muted-foreground/40 mx-auto mb-3" />
              <p className="font-medium text-foreground mb-1">No matches found</p>
              <p className="text-sm text-muted-foreground italic font-serif">
                {search || remoteOnly
                  ? "Try adjusting your filters."
                  : "Click Refresh to search for new job matches."}
              </p>
            </div>
          ) : (
            filteredJobs.map((job, i) => (
              <JobCard key={`${job.job_id}-${i}`} job={job} rank={i + 1} />
            ))
          )}
        </div>

        {/* Skill Gap Panel */}
        <SkillGapPanel jobs={jobs} totalMatches={jobs.length} />
      </div>
    </div>
  );
}
