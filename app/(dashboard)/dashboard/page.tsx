import { createClient } from "@/lib/supabase/server";
import Link from "next/link";

// ── Helpers ───────────────────────────────────────────────────────────────────

function timeAgo(iso: string): string {
  const diff = Date.now() - new Date(iso).getTime();
  const m = Math.floor(diff / 60_000);
  if (m < 60) return `${m} minute${m !== 1 ? "s" : ""} ago`;
  const h = Math.floor(m / 60);
  if (h < 24) return `${h} hour${h !== 1 ? "s" : ""} ago`;
  const d = Math.floor(h / 24);
  if (d < 7) return `${d} day${d !== 1 ? "s" : ""} ago`;
  return new Date(iso).toLocaleDateString("en-US", { month: "short", day: "numeric", year: "numeric" });
}

function atsLabel(score: number): string {
  if (score >= 80) return "Excellent";
  if (score >= 60) return "Good";
  if (score >= 40) return "Fair";
  return "Needs Work";
}

function resumeBadge(score: number | null): { label: string; cls: string } {
  if (score === null) return { label: "Pending",       cls: "bg-[#ece5d8] text-[#7d6b56]" };
  if (score >= 70)   return { label: "Optimized",     cls: "bg-green-100 text-green-800" };
  if (score >= 50)   return { label: "Review Needed", cls: "bg-yellow-100 text-yellow-800" };
  return               { label: "Needs Work",          cls: "bg-red-100 text-red-800" };
}

type Question = { category?: string; text?: string; hint?: string };

function interviewBars(questions: Question[], answers: string[]) {
  const defs = [
    { key: "behavioral",    label: "Behavioral Questions" },
    { key: "technical",     label: "Technical Knowledge" },
    { key: "role specific", label: "Role Specific" },
  ];
  return defs.map(({ key, label }) => {
    const indices = questions
      .map((q, i) => ({ q, i }))
      .filter(({ q }) => (q.category ?? "").toLowerCase() === key);
    const total    = indices.length;
    const answered = indices.filter(({ i }) => (answers[i] ?? "").trim().length > 0).length;
    const pct      = total > 0 ? Math.round((answered / total) * 100) : 0;
    return { label, total, answered, pct };
  });
}

// ── Page ──────────────────────────────────────────────────────────────────────

export default async function DashboardPage() {
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();
  const username = user?.user_metadata?.username ?? "there";

  // Fetch resumes + latest interview session in parallel
  const [resumesResult, sessionResult] = await Promise.all([
    supabase
      .from("resumes")
      .select("id, original_filename, ats_score, created_at")
      .eq("user_id", user!.id)
      .order("created_at", { ascending: false })
      .limit(3),
    supabase
      .from("interview_sessions")
      .select("questions, answers")
      .eq("user_id", user!.id)
      .order("created_at", { ascending: false })
      .limit(1)
      .maybeSingle(),
  ]);

  const resumes      = resumesResult.data ?? [];
  const latestResume = resumes[0] ?? null;
  const session      = sessionResult.data;

  // Fetch top 2 job matches using the user's latest resume
  let topMatches: Array<{
    match_score: number;
    matched_skills: string[] | null;
    missing_skills: string[] | null;
    jobs: { title: string; company: string; external_url: string } | null;
  }> = [];

  if (latestResume) {
    const { data: matchData } = await supabase
      .from("job_matches")
      .select("match_score, matched_skills, missing_skills, jobs(title, company, external_url)")
      .eq("resume_id", latestResume.id)
      .order("match_score", { ascending: false })
      .limit(2);
    topMatches = (matchData as unknown as typeof topMatches) ?? [];
  }

  // Interview progress bars
  const questions: Question[] = Array.isArray(session?.questions) ? session!.questions : [];
  const answers: string[]     = Array.isArray(session?.answers)   ? (session!.answers as string[]) : [];
  const bars = interviewBars(questions, answers);
  const hasInterviewData = questions.length > 0;

  // ATS circular progress
  const atsScore = latestResume?.ats_score ?? null;
  const atsPct   = atsScore ?? 0;

  return (
    <div className="flex-1 p-8 md:p-10 overflow-y-auto">
      <div className="max-w-6xl mx-auto">

        {/* ── Welcome ───────────────────────────────────────────────────── */}
        <header className="mb-10">
          <h1 className="text-3xl font-bold text-foreground mb-2">
            Welcome back, {username}
          </h1>
          <p className="text-[#7d6b56] italic font-serif text-sm">
            &ldquo;An investment in knowledge always pays the best interest.&rdquo; — Benjamin Franklin
          </p>
        </header>

        {/* ── Stats row ─────────────────────────────────────────────────── */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8 mb-8">

          {/* ATS Score */}
          <div className="bg-[#fffcf5] p-6 rounded border border-[#dbd0ba] shadow-aesthetic flex flex-col items-center justify-center">
            <h3 className="text-lg font-bold mb-6 w-full text-left text-foreground">
              Resume ATS Score
            </h3>

            {atsScore === null ? (
              /* Empty state */
              <div className="flex flex-col items-center gap-3 py-4">
                <div className="w-32 h-32 rounded-full border-4 border-[#dbd0ba] border-dashed flex items-center justify-center">
                  <span className="text-3xl font-bold text-[#dbd0ba]">—</span>
                </div>
                <p className="text-sm text-center text-[#7d6b56]">
                  Upload a resume to see your ATS score.
                </p>
                <Link
                  href="/upload-resume"
                  className="text-xs text-primary font-semibold hover:underline"
                >
                  Upload now →
                </Link>
              </div>
            ) : (
              <>
                <div className="relative w-32 h-32 mb-4">
                  <div
                    className="w-full h-full rounded-full flex items-center justify-center"
                    style={{ background: `conic-gradient(#a67c52 ${atsPct}%, #dbd0ba 0)` }}
                  >
                    <div className="w-24 h-24 bg-[#fffcf5] rounded-full flex flex-col items-center justify-center shadow-inner">
                      <span className="text-3xl font-bold text-foreground">{atsScore}</span>
                      <span className="text-[10px] uppercase tracking-widest text-[#7d6b56]">
                        {atsLabel(atsScore)}
                      </span>
                    </div>
                  </div>
                </div>
                <p className="text-sm text-center text-[#7d6b56]">
                  {atsScore >= 80
                    ? "Top 5% of candidates in your sector."
                    : atsScore >= 60
                    ? "Good score — room to improve."
                    : "Needs work — consider optimizing your resume."}
                </p>
              </>
            )}
          </div>

          {/* Interview Prep Progress */}
          <div className="bg-[#fffcf5] p-6 rounded border border-[#dbd0ba] shadow-aesthetic lg:col-span-2">
            <h3 className="text-lg font-bold mb-6 text-foreground">
              Interview Preparation Progress
            </h3>

            {!hasInterviewData ? (
              <div className="flex flex-col items-center justify-center gap-3 py-6 text-center">
                <p className="text-sm text-[#7d6b56]">
                  No interview sessions yet.
                </p>
                <Link
                  href="/dashboard/interview-prep"
                  className="text-xs text-primary font-semibold hover:underline"
                >
                  Start interview prep →
                </Link>
              </div>
            ) : (
              <div className="space-y-6">
                {bars.map(({ label, total, answered, pct }) => (
                  <div key={label}>
                    <div className="flex justify-between mb-2">
                      <span className="text-sm font-medium text-foreground">{label}</span>
                      <span className="text-sm text-[#7d6b56]">
                        {total === 0 ? "No questions" : `${answered}/${total} Completed`}
                      </span>
                    </div>
                    <div className="w-full bg-[#ece5d8] h-2 rounded-full overflow-hidden">
                      <div
                        className="bg-primary h-2 rounded-full transition-all duration-500"
                        style={{ width: `${pct}%` }}
                      />
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>

        </div>

        {/* ── Lists row ─────────────────────────────────────────────────── */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">

          {/* Recent Resume Analysis */}
          <div className="bg-[#fffcf5] p-6 rounded border border-[#dbd0ba] shadow-aesthetic">
            <div className="flex justify-between items-center mb-6">
              <h3 className="text-lg font-bold text-foreground">Recent Resume Analysis</h3>
              <Link
                href="/dashboard/resume-analysis"
                className="text-sm font-medium text-[#7d6b56] underline hover:text-primary transition-colors"
              >
                View All
              </Link>
            </div>

            {resumes.length === 0 ? (
              <div className="py-8 text-center">
                <p className="text-sm text-[#7d6b56] mb-3">No resumes uploaded yet.</p>
                <Link
                  href="/upload-resume"
                  className="text-xs text-primary font-semibold hover:underline"
                >
                  Upload your first resume →
                </Link>
              </div>
            ) : (
              <ul className="divide-y divide-[#dbd0ba]">
                {resumes.map((r) => {
                  const badge = resumeBadge(r.ats_score);
                  return (
                    <li key={r.id} className="py-4 flex justify-between items-center first:pt-0 last:pb-0">
                      <div>
                        <p className="font-medium text-foreground text-sm">
                          {r.original_filename ?? "Untitled Resume"}
                        </p>
                        <p className="text-xs text-[#7d6b56] mt-0.5">
                          Analyzed {timeAgo(r.created_at)}
                        </p>
                      </div>
                      <span className={`px-3 py-1 text-xs font-semibold rounded-full italic ${badge.cls}`}>
                        {badge.label}
                      </span>
                    </li>
                  );
                })}
              </ul>
            )}
          </div>

          {/* Suggested Job Matches */}
          <div className="bg-[#fffcf5] p-6 rounded border border-[#dbd0ba] shadow-aesthetic">
            <div className="flex justify-between items-center mb-6">
              <h3 className="text-lg font-bold text-foreground">Suggested Job Matches</h3>
              <Link
                href="/dashboard/job-matches"
                className="text-sm font-medium text-[#7d6b56] underline hover:text-primary transition-colors"
              >
                See All
              </Link>
            </div>

            {topMatches.length === 0 ? (
              <div className="py-8 text-center">
                <p className="text-sm text-[#7d6b56] mb-3">No job matches yet.</p>
                <Link
                  href="/dashboard/job-matches"
                  className="text-xs text-primary font-semibold hover:underline"
                >
                  Find job matches →
                </Link>
              </div>
            ) : (
              <div className="space-y-4">
                {topMatches.map((match, i) => (
                  <a
                    key={i}
                    href={match.jobs?.external_url ?? "#"}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="block p-4 border border-[#dbd0ba] rounded hover:bg-background transition-colors group"
                  >
                    <div className="flex justify-between items-start gap-3">
                      <div className="min-w-0">
                        <h4 className="font-bold text-foreground text-sm group-hover:underline truncate">
                          {match.jobs?.title ?? "Untitled Role"}
                        </h4>
                        <p className="text-xs text-[#7d6b56] mt-0.5">
                          {match.jobs?.company ?? "Unknown Company"}
                        </p>
                      </div>
                      <span
                        className={`text-xs font-bold font-serif whitespace-nowrap px-2 py-0.5 rounded-full ${
                          match.match_score >= 85
                            ? "bg-green-100 text-green-700"
                            : match.match_score >= 70
                            ? "bg-amber-100 text-amber-700"
                            : "bg-[#ece5d8] text-[#7d6b56]"
                        }`}
                      >
                        {match.match_score}% Match
                      </span>
                    </div>
                    {(match.matched_skills?.length ?? 0) > 0 && (
                      <div className="mt-2.5 flex flex-wrap gap-1.5">
                        {(match.matched_skills ?? []).slice(0, 4).map((s) => (
                          <span
                            key={s}
                            className="text-[10px] border border-[#dbd0ba] px-2 py-0.5 rounded-full text-[#7d6b56] italic"
                          >
                            {s}
                          </span>
                        ))}
                      </div>
                    )}
                  </a>
                ))}
              </div>
            )}
          </div>

        </div>
      </div>
    </div>
  );
}
