import { createClient } from "@/lib/supabase/server";
import Link from "next/link";
import { FileText, Plus } from "lucide-react";
import { AnalyzeButton } from "./AnalyzeButton";

// ── SVG gauge helpers ─────────────────────────────────────────────────────────
const RADIUS = 88;
const CIRCUMFERENCE = 2 * Math.PI * RADIUS; // ≈ 552.92

function atsScoreDescription(score: number): string {
  if (score >= 85) return "Excellent! Your resume is in the top 15% of all applicants.";
  if (score >= 70) return "Strong score. A few tweaks could push you to the top tier.";
  if (score >= 55) return "Good foundation. Targeted improvements will boost your ranking.";
  if (score >= 40) return "Average. Add more relevant keywords and quantified achievements.";
  return "Needs work. Follow the suggestions below to improve your score.";
}

function timeAgo(iso: string): string {
  const diff = Date.now() - new Date(iso).getTime();
  const h = Math.floor(diff / 3_600_000);
  if (h < 24) return h <= 1 ? "1 hour ago" : `${h} hours ago`;
  const d = Math.floor(h / 24);
  if (d < 7) return `${d} day${d !== 1 ? "s" : ""} ago`;
  return new Date(iso).toLocaleDateString("en-US", { month: "short", day: "numeric", year: "numeric" });
}

// ── Page ─────────────────────────────────────────────────────────────────────

export default async function ResumeAnalysisPage() {
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();

  // Fetch latest resume + its analysis in parallel
  const [resumeResult, analysisResult] = await Promise.all([
    supabase
      .from("resumes")
      .select("id, original_filename, ats_score, created_at")
      .eq("user_id", user!.id)
      .order("created_at", { ascending: false })
      .limit(1)
      .maybeSingle(),
    supabase
      .from("resume_analysis")
      .select("skills, missing_keywords, strengths, suggestions, created_at, resume_id")
      .order("created_at", { ascending: false })
      .limit(1)
      .maybeSingle(),
  ]);

  const resume   = resumeResult.data;
  const analysis = analysisResult.data;

  // Ensure analysis belongs to the user's latest resume
  const matchedAnalysis =
    analysis && resume && analysis.resume_id === resume.id ? analysis : null;

  const atsScore   = resume?.ats_score ?? null;
  const dashOffset = atsScore !== null ? CIRCUMFERENCE * (1 - atsScore / 100) : CIRCUMFERENCE;

  const skills:          string[] = Array.isArray(matchedAnalysis?.skills)           ? matchedAnalysis!.skills           : [];
  const missingKeywords: string[] = Array.isArray(matchedAnalysis?.missing_keywords) ? matchedAnalysis!.missing_keywords : [];

  // Derive "Key Advantage" / "Top Opportunity" snippets for the highlight boxes
  const keyAdvantage  = skills.length > 0
    ? `Demonstrates strong proficiency in ${skills.slice(0, 2).join(" and ")}.`
    : "Your resume shows well-structured professional experience.";
  const topOpportunity = missingKeywords.length > 0
    ? `Add "${missingKeywords[0]}" to significantly boost match rates.`
    : matchedAnalysis?.suggestions?.split(".")[0] ?? "Consider quantifying more of your achievements.";

  return (
    <div className="flex-1 p-8 lg:p-12 overflow-y-auto">
      <div className="max-w-6xl mx-auto">

        {/* ── Header ───────────────────────────────────────────────────── */}
        <header className="mb-10 flex flex-wrap items-end justify-between gap-6">
          <div className="max-w-2xl">
            <h2 className="text-5xl font-bold text-foreground leading-tight mb-3 italic font-serif">
              Resume Analysis
            </h2>
            <p className="text-lg text-muted-foreground leading-relaxed font-serif">
              Comprehensive evaluation of your professional narrative and algorithmic compatibility.
            </p>
          </div>
          {resume && (
            <AnalyzeButton
              resumeId={resume.id}
              label={matchedAnalysis ? "Re-Analyze" : "Analyze Resume"}
            />
          )}
        </header>

        {/* ── No resume state ───────────────────────────────────────────── */}
        {!resume && (
          <div className="bg-card border border-border rounded-lg p-16 shadow-aesthetic text-center">
            <FileText className="w-12 h-12 text-muted-foreground mx-auto mb-4" />
            <h3 className="font-serif text-xl font-bold text-foreground mb-2">No Resume Uploaded</h3>
            <p className="text-muted-foreground text-sm mb-6">
              Upload your resume to get a full AI-powered analysis.
            </p>
            <Link
              href="/upload-resume"
              className="bg-primary text-white px-8 py-3 rounded-lg font-bold text-sm hover:opacity-90 transition-all shadow-aesthetic"
            >
              Upload Resume
            </Link>
          </div>
        )}

        {/* ── Main grid ─────────────────────────────────────────────────── */}
        {resume && (
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-8">

            {/* ── LEFT COLUMN (7/12) ──────────────────────────────────── */}
            <div className="lg:col-span-7 flex flex-col gap-8">

              {/* Resume Overview */}
              <div className="bg-card border border-border rounded-lg p-8 shadow-aesthetic">
                <div className="flex justify-between items-start mb-6">
                  <div>
                    <h3 className="text-xl font-bold mb-1 font-serif text-foreground">
                      Resume Overview
                    </h3>
                    <p className="text-sm text-muted-foreground">
                      Last uploaded {timeAgo(resume.created_at)}
                    </p>
                  </div>
                  <FileText className="w-8 h-8 text-primary" />
                </div>
                <div className="flex items-center gap-4 p-4 rounded-lg bg-background border border-primary/5">
                  <div className="w-12 h-16 bg-primary/10 rounded flex items-center justify-center flex-shrink-0">
                    <FileText className="w-6 h-6 text-primary" />
                  </div>
                  <div className="flex-1 min-w-0">
                    <p className="font-bold text-foreground truncate">
                      {resume.original_filename ?? "Resume.pdf"}
                    </p>
                    <p className="text-xs text-muted-foreground mt-0.5">PDF Document</p>
                  </div>
                  <Link
                    href="/upload-resume"
                    className="text-primary hover:opacity-80 text-sm font-bold italic flex-shrink-0"
                  >
                    Replace
                  </Link>
                </div>
              </div>

              {/* Strength Insights */}
              <div className="bg-card border border-border rounded-lg p-8 shadow-aesthetic">
                <h3 className="text-2xl font-bold italic font-serif text-foreground mb-4">
                  Strength Insights
                </h3>

                {!matchedAnalysis ? (
                  <div className="py-8 text-center">
                    <p className="text-muted-foreground text-sm italic">
                      Run an analysis to see AI-generated insights about your resume strengths and improvement areas.
                    </p>
                  </div>
                ) : (
                  <>
                    <p className="text-foreground leading-relaxed italic text-lg font-serif">
                      &ldquo;{matchedAnalysis.strengths}&rdquo;
                    </p>

                    <div className="mt-8 grid grid-cols-2 gap-4">
                      <div className="p-4 rounded-lg bg-green-50 border border-green-100">
                        <p className="text-xs font-bold text-green-700 uppercase tracking-wider mb-1">
                          Key Advantage
                        </p>
                        <p className="text-sm font-medium text-foreground">{keyAdvantage}</p>
                      </div>
                      <div className="p-4 rounded-lg bg-primary/5 border border-primary/10">
                        <p className="text-xs font-bold text-primary uppercase tracking-wider mb-1">
                          Top Opportunity
                        </p>
                        <p className="text-sm font-medium text-foreground">{topOpportunity}</p>
                      </div>
                    </div>

                    {matchedAnalysis.suggestions && (
                      <div className="mt-6 p-4 bg-muted/40 rounded-lg border border-border">
                        <p className="text-xs font-bold text-muted-foreground uppercase tracking-wider mb-2">
                          Suggestions
                        </p>
                        <p className="text-sm text-foreground leading-relaxed">
                          {matchedAnalysis.suggestions}
                        </p>
                      </div>
                    )}
                  </>
                )}
              </div>
            </div>

            {/* ── RIGHT COLUMN (5/12) ─────────────────────────────────── */}
            <div className="lg:col-span-5 flex flex-col gap-8">

              {/* ATS Score gauge */}
              <div className="bg-card border border-border rounded-lg p-8 shadow-aesthetic">
                <h3 className="text-sm font-bold uppercase tracking-[0.2em] text-muted-foreground mb-8 font-serif">
                  Overall ATS Score
                </h3>

                {atsScore === null ? (
                  <div className="flex flex-col items-center gap-4 py-4">
                    {/* Empty gauge ring */}
                    <div className="relative">
                      <svg className="size-48 -rotate-90" viewBox="0 0 192 192">
                        <circle
                          cx="96" cy="96" r={RADIUS}
                          fill="transparent"
                          stroke="currentColor"
                          strokeWidth="12"
                          className="text-primary/10"
                        />
                      </svg>
                      <div className="absolute inset-0 flex flex-col items-center justify-center">
                        <span className="text-3xl font-black text-muted-foreground">—</span>
                        <span className="text-xs font-bold text-muted-foreground">OF 100</span>
                      </div>
                    </div>
                    <p className="text-sm text-muted-foreground text-center">
                      Click &ldquo;Analyze Resume&rdquo; to generate your ATS score.
                    </p>
                  </div>
                ) : (
                  <>
                    <div className="relative flex items-center justify-center">
                      <svg className="size-48 -rotate-90" viewBox="0 0 192 192">
                        {/* Track */}
                        <circle
                          cx="96" cy="96" r={RADIUS}
                          fill="transparent"
                          stroke="currentColor"
                          strokeWidth="12"
                          className="text-primary/10"
                        />
                        {/* Progress arc */}
                        <circle
                          cx="96" cy="96" r={RADIUS}
                          fill="transparent"
                          stroke="currentColor"
                          strokeWidth="12"
                          strokeLinecap="round"
                          strokeDasharray={CIRCUMFERENCE}
                          strokeDashoffset={dashOffset}
                          className="text-primary transition-all duration-700"
                        />
                      </svg>
                      <div className="absolute inset-0 flex flex-col items-center justify-center">
                        <span className="text-5xl font-black text-foreground">{atsScore}</span>
                        <span className="text-sm font-bold text-muted-foreground">OF 100</span>
                      </div>
                    </div>
                    <p className="mt-8 text-muted-foreground text-sm max-w-[220px]">
                      {atsScoreDescription(atsScore)}
                    </p>
                  </>
                )}
              </div>

              {/* Skills Detected */}
              <div className="bg-card border border-border rounded-lg p-8 shadow-aesthetic">
                <h3 className="text-sm font-bold uppercase tracking-wider text-foreground mb-6 font-serif">
                  Skills Detected
                </h3>
                {skills.length === 0 ? (
                  <p className="text-sm text-muted-foreground italic">
                    Skills will appear here after analysis.
                  </p>
                ) : (
                  <div className="flex flex-wrap gap-2">
                    {skills.map((skill) => (
                      <span
                        key={skill}
                        className="px-3 py-1.5 bg-accent/20 border border-border text-foreground text-xs font-medium rounded-full"
                      >
                        {skill}
                      </span>
                    ))}
                  </div>
                )}
              </div>

              {/* Missing Keywords */}
              <div className="bg-card border border-border rounded-lg p-8 shadow-aesthetic">
                <div className="flex items-center justify-between mb-6">
                  <h3 className="text-sm font-bold uppercase tracking-wider text-foreground font-serif">
                    Missing Keywords
                  </h3>
                  {missingKeywords.length > 0 && (
                    <span className="text-xs font-bold text-primary">HIGH IMPACT</span>
                  )}
                </div>
                {missingKeywords.length === 0 ? (
                  <p className="text-sm text-muted-foreground italic">
                    Missing keywords will appear here after analysis.
                  </p>
                ) : (
                  <>
                    <div className="flex flex-wrap gap-2">
                      {missingKeywords.map((kw) => (
                        <span
                          key={kw}
                          className="px-3 py-1.5 bg-primary/10 border border-primary/30 text-primary text-xs font-bold rounded-full flex items-center gap-1"
                        >
                          {kw}
                          <Plus className="w-2.5 h-2.5" />
                        </span>
                      ))}
                    </div>
                    <p className="mt-4 text-[11px] text-muted-foreground italic">
                      Adding these keywords can noticeably increase your match score.
                    </p>
                  </>
                )}
              </div>

            </div>
          </div>
        )}

      </div>
    </div>
  );
}
