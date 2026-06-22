"use client";

// Job Alignment — /dashboard/job-alignment
// Stitch reference: job_alignment_polished
// Layout: left (4/12) resume thumbnail panel
//         right (8/12) JD textarea + Analyze button + results
// API: POST /api/job-alignment

import { useEffect, useState } from "react";
import { createClient } from "@/lib/supabase/client";
import {
  FileText,
  Wand2,
  Target,
  Lightbulb,
  CheckCircle,
  AlertTriangle,
  Loader2,
  ArrowRight,
  Upload,
  XCircle,
} from "lucide-react";
import Link from "next/link";
import { useToast } from "@/components/toast";

// ── Types ────────────────────────────────────────────────────────────────────

interface ResumeInfo {
  id: string;
  original_filename: string | null;
  ats_score: number | null;
  skills: string[];
}

interface AlignmentResult {
  match_score: number;
  matched_skills: string[];
  missing_skills: string[];
  suggestions: string;
}

// ── Score gauge (SVG circle) ─────────────────────────────────────────────────

function ScoreGauge({ score }: { score: number }) {
  const r = 42;
  const circ = 2 * Math.PI * r;
  const offset = (1 - score / 100) * circ;
  const color =
    score >= 80 ? "#16a34a" : score >= 60 ? "#d97706" : "#b54a35";
  const label =
    score >= 80 ? "Strong Match" : score >= 60 ? "Moderate Match" : "Needs Work";

  return (
    <div className="flex flex-col items-center text-center">
      <p className="text-xs font-bold uppercase tracking-widest text-muted-foreground mb-6">
        Job Match Score
      </p>
      <div className="relative w-44 h-44">
        <svg className="w-full h-full" viewBox="0 0 100 100">
          <circle
            cx="50" cy="50" r={r}
            fill="transparent"
            stroke="#ece5d8"
            strokeWidth="8"
          />
          <circle
            cx="50" cy="50" r={r}
            fill="transparent"
            stroke={color}
            strokeWidth="8"
            strokeDasharray={circ}
            strokeDashoffset={offset}
            strokeLinecap="round"
            transform="rotate(-90 50 50)"
            style={{ transition: "stroke-dashoffset 0.6s ease" }}
          />
        </svg>
        <div className="absolute inset-0 flex flex-col items-center justify-center">
          <span className="text-4xl font-black font-serif" style={{ color }}>
            {score}%
          </span>
          <span className="text-[10px] font-bold uppercase tracking-wider text-muted-foreground mt-0.5">
            {label}
          </span>
        </div>
      </div>
      <p className="mt-4 text-sm italic font-serif text-muted-foreground">
        {score >= 80
          ? "Your resume aligns well with this role."
          : score >= 60
          ? "Some gaps to address before applying."
          : "Significant tailoring needed for this role."}
      </p>
    </div>
  );
}

// ── Page ─────────────────────────────────────────────────────────────────────

export default function JobAlignmentPage() {
  const supabase = createClient();
  const { toast } = useToast();

  const [resume, setResume] = useState<ResumeInfo | null>(null);
  const [loadingResume, setLoadingResume] = useState(true);
  const [jobDescription, setJobDescription] = useState("");
  const [analyzing, setAnalyzing] = useState(false);
  const [result, setResult] = useState<AlignmentResult | null>(null);
  const [error, setError] = useState<string | null>(null);

  // ── Load latest resume + skills ─────────────────────────────────────────────
  useEffect(() => {
    async function load() {
      const {
        data: { user },
      } = await supabase.auth.getUser();
      if (!user) {
        setLoadingResume(false);
        return;
      }

      const { data: r } = await supabase
        .from("resumes")
        .select("id, original_filename, ats_score")
        .eq("user_id", user.id)
        .order("created_at", { ascending: false })
        .limit(1)
        .single();

      if (!r) {
        setLoadingResume(false);
        return;
      }

      const { data: analysis } = await supabase
        .from("resume_analysis")
        .select("skills")
        .eq("resume_id", r.id)
        .single();

      setResume({ ...r, skills: analysis?.skills ?? [] });
      setLoadingResume(false);
    }
    load();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  // ── Analyze ──────────────────────────────────────────────────────────────────
  async function handleAnalyze() {
    if (!resume || jobDescription.trim().length < 50) return;
    setAnalyzing(true);
    setError(null);
    setResult(null);

    try {
      const res = await fetch("/api/job-alignment", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          resume_id: resume.id,
          job_description: jobDescription,
        }),
      });
      const data = await res.json();
      if (!res.ok) {
        const msg = data.error ?? "Analysis failed.";
        setError(msg);
        toast({ message: msg, type: "error" });
      } else {
        setResult(data as AlignmentResult);
        toast({ message: "Analysis complete! Review your match score below.", type: "success" });
      }
    } catch {
      const msg = "Network error. Please try again.";
      setError(msg);
      toast({ message: msg, type: "error" });
    } finally {
      setAnalyzing(false);
    }
  }

  // ── Render ───────────────────────────────────────────────────────────────────
  return (
    <div className="p-6 md:p-8">
      {/* Header */}
      <div className="mb-10 space-y-1.5">
        <div className="flex items-center gap-2 text-primary font-bold text-xs tracking-widest uppercase">
          <Target className="w-4 h-4" />
          AI Analysis
        </div>
        <h1 className="text-3xl font-serif font-bold text-foreground">
          Job Description Alignment
        </h1>
        <p className="text-muted-foreground italic font-serif text-sm max-w-xl">
          Refine your professional narrative. Analyze how precisely your expertise maps to your next career milestone.
        </p>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-12 gap-10 items-start">

        {/* ── Left: Resume Thumbnail Panel ──────────────────────────────── */}
        <div className="lg:col-span-4 space-y-5">
          <div className="bg-card border border-border rounded-xl p-6 shadow-aesthetic">
            <h3 className="text-xs font-bold uppercase tracking-widest text-muted-foreground mb-5">
              Current Resume
            </h3>

            {loadingResume ? (
              <div className="flex items-center gap-2 text-muted-foreground text-sm py-4">
                <Loader2 className="w-4 h-4 animate-spin" />
                Loading…
              </div>
            ) : !resume ? (
              <div className="text-center py-6 space-y-3">
                <FileText className="w-8 h-8 text-muted-foreground/40 mx-auto" />
                <p className="text-sm text-muted-foreground italic font-serif">
                  No resume found.
                </p>
                <Link
                  href="/upload-resume"
                  className="inline-flex items-center gap-2 px-4 py-2 bg-primary text-white text-sm font-bold rounded-lg hover:opacity-90 transition-all shadow-aesthetic"
                >
                  <Upload className="w-4 h-4" />
                  Upload Resume
                </Link>
              </div>
            ) : (
              <div className="space-y-5">
                {/* Paper thumbnail */}
                <div className="relative group">
                  <div className="aspect-[3/4] w-full bg-white border border-border rounded-lg shadow-aesthetic flex flex-col p-5 overflow-hidden transition-transform hover:scale-[1.01]">
                    {/* File header */}
                    <div className="flex items-center gap-2.5 mb-4">
                      <div className="bg-primary/10 p-1.5 rounded flex-shrink-0">
                        <FileText className="w-4 h-4 text-primary" />
                      </div>
                      <div className="min-w-0">
                        <p className="font-bold text-xs text-foreground truncate">
                          {resume.original_filename ?? "resume.pdf"}
                        </p>
                        {resume.ats_score !== null && (
                          <p className="text-[10px] text-muted-foreground">
                            ATS Score:{" "}
                            <span className="text-primary font-bold">
                              {resume.ats_score}%
                            </span>
                          </p>
                        )}
                      </div>
                    </div>
                    {/* Skeleton lines */}
                    <div className="flex-1 border-t border-muted pt-3 space-y-2 opacity-30">
                      <div className="h-3 bg-muted rounded w-2/3" />
                      <div className="h-2 bg-muted rounded w-full" />
                      <div className="h-2 bg-muted rounded w-5/6" />
                      <div className="h-2 bg-muted rounded w-4/6" />
                      <div className="h-3 bg-muted rounded w-1/2 mt-4" />
                      <div className="h-2 bg-muted rounded w-full" />
                      <div className="h-2 bg-muted rounded w-full" />
                      <div className="h-2 bg-muted rounded w-3/4" />
                      <div className="h-3 bg-muted rounded w-2/5 mt-4" />
                      <div className="h-2 bg-muted rounded w-full" />
                      <div className="h-2 bg-muted rounded w-5/6" />
                    </div>
                  </div>
                </div>

                {/* Skills detected */}
                {resume.skills.length > 0 && (
                  <div>
                    <p className="text-[10px] font-bold uppercase tracking-wider text-muted-foreground mb-2">
                      Detected Skills
                    </p>
                    <div className="flex flex-wrap gap-1.5">
                      {resume.skills.slice(0, 10).map((s) => (
                        <span
                          key={s}
                          className="px-2 py-0.5 bg-primary/8 text-primary border border-primary/15 rounded text-xs italic"
                        >
                          {s}
                        </span>
                      ))}
                      {resume.skills.length > 10 && (
                        <span className="text-xs text-muted-foreground italic">
                          +{resume.skills.length - 10} more
                        </span>
                      )}
                    </div>
                  </div>
                )}

                <Link
                  href="/upload-resume"
                  className="w-full flex items-center justify-center gap-2 bg-primary text-white py-2.5 rounded-lg font-bold text-sm hover:opacity-90 transition-all shadow-aesthetic"
                >
                  <Upload className="w-4 h-4" />
                  Upload New Resume
                </Link>
              </div>
            )}
          </div>

          {/* Pro tip */}
          <div className="p-4 border border-dashed border-primary/30 rounded-xl bg-primary/5">
            <p className="text-xs italic text-primary/80 font-serif leading-relaxed">
              &ldquo;Pro Tip: Paste the complete job description including requirements, responsibilities, and &lsquo;About Us&rsquo; for the most accurate analysis.&rdquo;
            </p>
          </div>
        </div>

        {/* ── Right: Input + Results ─────────────────────────────────────── */}
        <div className="lg:col-span-8 space-y-8">

          {/* JD Input card */}
          <div className="bg-card border border-border rounded-xl shadow-aesthetic overflow-hidden">
            <div className="p-6 border-b border-border bg-muted/20 flex items-center justify-between">
              <h2 className="text-lg font-bold font-serif">Paste Job Description</h2>
              {jobDescription.length > 0 && (
                <span className="text-xs text-muted-foreground">
                  {jobDescription.length} chars
                </span>
              )}
            </div>
            <div className="p-6 space-y-4">
              <textarea
                value={jobDescription}
                onChange={(e) => setJobDescription(e.target.value)}
                placeholder={"Paste the full job posting here to analyze how your skills align…\n\nInclude the role title, responsibilities, required skills, and qualifications for the most accurate analysis."}
                className="w-full h-60 bg-background border border-border rounded-lg p-4 text-sm font-serif italic focus:outline-none focus:ring-2 focus:ring-primary/30 resize-none placeholder:text-muted-foreground/50 leading-relaxed"
              />
              <button
                onClick={handleAnalyze}
                disabled={analyzing || !resume || jobDescription.trim().length < 50}
                className="w-full flex items-center justify-center gap-2.5 bg-primary text-white font-bold py-3.5 rounded-lg hover:opacity-90 transition-all shadow-aesthetic disabled:opacity-50 disabled:cursor-not-allowed text-sm"
              >
                {analyzing ? (
                  <>
                    <Loader2 className="w-4 h-4 animate-spin" />
                    Analyzing…
                  </>
                ) : (
                  <>
                    <Wand2 className="w-4 h-4" />
                    Analyze Match
                    <ArrowRight className="w-4 h-4" />
                  </>
                )}
              </button>
              {jobDescription.trim().length > 0 &&
                jobDescription.trim().length < 50 && (
                  <p className="text-xs text-center text-muted-foreground italic">
                    Paste a longer job description for accurate analysis
                  </p>
                )}
            </div>
          </div>

          {/* Error */}
          {error && (
            <div className="flex items-center gap-2 p-4 bg-destructive/10 border border-destructive/20 rounded-xl text-destructive text-sm">
              <AlertTriangle className="w-4 h-4 flex-shrink-0" />
              {error}
            </div>
          )}

          {/* ── Results ─────────────────────────────────────────────────── */}
          {result && (
            <div className="space-y-5 pt-2 border-t border-border">

              {/* Row 1: Score gauge + Skills analysis */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-5">

                {/* Gauge */}
                <div className="bg-card border border-border rounded-xl p-6 shadow-aesthetic flex items-center justify-center">
                  <ScoreGauge score={result.match_score} />
                </div>

                {/* Skills */}
                <div className="bg-card border border-border rounded-xl p-6 shadow-aesthetic space-y-5">
                  <h3 className="text-xs font-bold uppercase tracking-widest text-muted-foreground">
                    Skills Analysis
                  </h3>

                  {/* Matched */}
                  <div>
                    <p className="text-xs font-bold text-muted-foreground flex items-center gap-1.5 mb-2">
                      <CheckCircle className="w-3.5 h-3.5 text-green-500" />
                      Matched Skills
                    </p>
                    {result.matched_skills.length > 0 ? (
                      <div className="flex flex-wrap gap-1.5">
                        {result.matched_skills.map((s) => (
                          <span
                            key={s}
                            className="px-2.5 py-1 bg-green-50 text-green-700 border border-green-200 rounded-md text-xs italic font-medium"
                          >
                            {s}
                          </span>
                        ))}
                      </div>
                    ) : (
                      <p className="text-xs text-muted-foreground italic font-serif">
                        No direct matches detected.
                      </p>
                    )}
                  </div>

                  {/* Missing */}
                  <div>
                    <p className="text-xs font-bold text-muted-foreground flex items-center gap-1.5 mb-2">
                      <XCircle className="w-3.5 h-3.5 text-orange-500" />
                      Missing Skills
                    </p>
                    {result.missing_skills.length > 0 ? (
                      <div className="flex flex-wrap gap-1.5">
                        {result.missing_skills.map((s) => (
                          <span
                            key={s}
                            className="px-2.5 py-1 bg-orange-50 text-orange-600 border border-orange-200 rounded-md text-xs italic font-medium"
                          >
                            + {s}
                          </span>
                        ))}
                      </div>
                    ) : (
                      <p className="text-xs text-muted-foreground italic font-serif">
                        No major gaps detected!
                      </p>
                    )}
                  </div>
                </div>
              </div>

              {/* Row 2: Suggestions */}
              {result.suggestions && (
                <div className="bg-card border-l-4 border-primary border border-border rounded-xl p-6 shadow-aesthetic">
                  <div className="flex items-center gap-2 mb-4">
                    <Lightbulb className="w-4 h-4 text-primary" />
                    <h3 className="text-xs font-bold uppercase tracking-widest text-foreground">
                      Optimization Suggestions
                    </h3>
                  </div>
                  <p className="text-sm font-serif italic leading-relaxed text-foreground/80">
                    {result.suggestions}
                  </p>
                </div>
              )}

              {/* Row 3: CTA */}
              <div className="bg-foreground text-white rounded-2xl p-8 flex flex-col md:flex-row items-center justify-between gap-6">
                <div>
                  <h3 className="font-serif text-xl font-bold mb-1">
                    Ready to tailor your resume?
                  </h3>
                  <p className="text-sm italic opacity-70">
                    Use the Resume Optimizer to address the missing skills above.
                  </p>
                </div>
                <Link
                  href="/dashboard/resume-optimizer"
                  className="flex-shrink-0 flex items-center gap-2 bg-primary text-white px-6 py-3 rounded-xl font-bold hover:opacity-90 transition-all shadow-aesthetic"
                >
                  <Wand2 className="w-4 h-4" />
                  Optimize Resume
                </Link>
              </div>
            </div>
          )}

          {/* Empty state */}
          {!result && !analyzing && !error && (
            <div className="bg-card border border-border rounded-xl p-12 text-center shadow-aesthetic">
              <Target className="w-10 h-10 text-muted-foreground/30 mx-auto mb-3" />
              <p className="font-medium text-foreground mb-1">No Analysis Yet</p>
              <p className="text-sm text-muted-foreground italic font-serif">
                Paste a job description above and click Analyze Match.
              </p>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
