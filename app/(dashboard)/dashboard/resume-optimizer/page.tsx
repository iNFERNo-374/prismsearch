"use client";

// Resume Optimizer — /dashboard/resume-optimizer
// Stitch reference: resume_optimizer_no_footer
// Split layout: left (7/12) resume paper preview with weak bullets highlighted
//               right (5/12) stats row + AI suggestion panel + keywords + impact
// API: POST /api/optimize-resume → { optimized_versions: string[] }

import { useEffect, useState, useCallback } from "react";
import { createClient } from "@/lib/supabase/client";
import {
  AlertTriangle,
  KeyRound,
  TrendingUp,
  FileText,
  Copy,
  Wand2,
  ChevronRight,
  CheckCircle,
} from "lucide-react";
import { useToast } from "@/components/toast";

// ── Types ────────────────────────────────────────────────────────────────────

interface ResumeData {
  id: string;
  resume_text: string;
  ats_score: number | null;
  original_filename: string | null;
}

interface Analysis {
  skills: string[];
  missing_keywords: string[];
  strengths: string;
  suggestions: string;
}

interface BulletLine {
  lineIndex: number;
  text: string;
  isWeak: boolean;
}

// ── Helpers ──────────────────────────────────────────────────────────────────

// Phrases that indicate a weak/passive bullet regardless of metrics
const WEAK_STARTS = [
  "responsible for",
  "helped",
  "worked on",
  "assisted",
  "participated",
  "involved in",
  "part of",
  "supported",
  "contributed to",
  "was responsible",
  "were responsible",
  "managed",
  "handled",
  "did ",
  "was ",
  "were ",
];

// Lines that are clearly NOT job duty sentences — skip them entirely
function isSkipLine(line: string): boolean {
  const t = line.trim();
  if (!t || t.length < 8) return true;
  // Section headers: all-caps short strings (EXPERIENCE, EDUCATION, SKILLS…)
  if (/^[A-Z\s\/&]+$/.test(t) && t.length <= 40) return true;
  // Contact info: email, URL, phone
  if (/@/.test(t) || /https?:\/\/|linkedin\.com|github\.com/i.test(t)) return true;
  // Phone numbers
  if (/^\+?[\d\s\(\)\-]{7,}$/.test(t)) return true;
  // Date-only lines: "Jan 2020 – Present", "2018 - 2022"
  if (/^(jan|feb|mar|apr|may|jun|jul|aug|sep|oct|nov|dec|\d{4})/i.test(t) && t.length < 40) return true;
  return false;
}

// A line is a candidate duty sentence if it passes the skip filter and looks
// like a job-duty sentence (starts with a letter, has 2+ words, reasonable length).
// Works for both plain PDF text AND lines with bullet symbols.
function isCandidateLine(line: string): boolean {
  if (isSkipLine(line)) return false;
  const t = line.trim();
  // Strip leading bullet symbol if present
  const content = t.replace(/^[•\-\*·▪▸➢➤►]\s*/, "");
  // Must start with a letter and contain at least one space (2+ words)
  if (!/^[A-Za-z]/.test(content)) return false;
  if (!content.includes(" ")) return false;
  // Reasonable duty length
  if (content.length < 12 || content.length > 280) return false;
  return true;
}

// A candidate line is "weak" if it uses passive phrasing OR has no metrics and
// is short enough that it's likely vague.
function isWeakLine(line: string): boolean {
  const content = line.trim().replace(/^[•\-\*·▪▸➢➤►]\s*/, "").toLowerCase();
  const isPassive = WEAK_STARTS.some((s) => content.startsWith(s));
  const hasMetrics = /\d/.test(content);
  const isTooShort = content.length < 60;
  return isPassive || (!hasMetrics && isTooShort);
}

// Build the full list of candidate lines with their line indices
function extractCandidateLines(text: string): BulletLine[] {
  return text
    .split("\n")
    .map((line, index) => ({ line, index }))
    .filter(({ line }) => isCandidateLine(line))
    .map(({ line, index }) => ({
      lineIndex: index,
      text: line.trim(),
      isWeak: isWeakLine(line),
    }));
}

function isSectionHeader(line: string): boolean {
  const t = line.trim();
  if (!t || t.length > 50) return false;
  return /^[A-Z\s\/&]+$/.test(t) && t.length > 2 && !/^\d/.test(t);
}

// ── Page ─────────────────────────────────────────────────────────────────────

export default function ResumeOptimizerPage() {
  const supabase = createClient();
  const { toast } = useToast();

  const [resume, setResume] = useState<ResumeData | null>(null);
  const [analysis, setAnalysis] = useState<Analysis | null>(null);
  const [bullets, setBullets] = useState<BulletLine[]>([]);
  const [lines, setLines] = useState<string[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  // Optimization state
  const [selectedBullet, setSelectedBullet] = useState<BulletLine | null>(null);
  const [optimizing, setOptimizing] = useState(false);
  const [optimizedVersions, setOptimizedVersions] = useState<string[]>([]);
  const [optError, setOptError] = useState<string | null>(null);
  const [appliedLines, setAppliedLines] = useState<Record<number, string>>({});
  const [copied, setCopied] = useState<number | null>(null);

  // ── Load data ──────────────────────────────────────────────────────────────
  useEffect(() => {
    async function load() {
      setLoading(true);
      const {
        data: { user },
      } = await supabase.auth.getUser();

      if (!user) {
        setError("You are not signed in.");
        setLoading(false);
        return;
      }

      const { data: resumeData, error: resumeErr } = await supabase
        .from("resumes")
        .select("id, resume_text, ats_score, original_filename")
        .eq("user_id", user.id)
        .order("created_at", { ascending: false })
        .limit(1)
        .single();

      if (resumeErr || !resumeData) {
        setError("No resume found. Please upload a resume first.");
        setLoading(false);
        return;
      }

      setResume(resumeData as ResumeData);

      if (resumeData.resume_text) {
        setLines(resumeData.resume_text.split("\n"));
        setBullets(extractCandidateLines(resumeData.resume_text));
      }

      const { data: analysisData } = await supabase
        .from("resume_analysis")
        .select("skills, missing_keywords, strengths, suggestions")
        .eq("resume_id", resumeData.id)
        .single();

      if (analysisData) setAnalysis(analysisData as Analysis);

      setLoading(false);
    }
    load();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  // ── Optimize a bullet ──────────────────────────────────────────────────────
  const handleOptimize = useCallback(
    async (bullet: BulletLine) => {
      if (!resume) return;
      setSelectedBullet(bullet);
      setOptimizing(true);
      setOptimizedVersions([]);
      setOptError(null);

      try {
        const res = await fetch("/api/optimize-resume", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ resume_id: resume.id, bullet_point: bullet.text }),
        });
        const data = await res.json();
        if (!res.ok) {
          setOptError(data.error ?? "Optimization failed.");
        } else {
          setOptimizedVersions(data.optimized_versions ?? []);
        }
      } catch {
        setOptError("Network error. Please try again.");
      } finally {
        setOptimizing(false);
      }
    },
    [resume]
  );

  // ── Apply a suggestion → update preview ───────────────────────────────────
  const applyVersion = useCallback(
    (version: string) => {
      if (!selectedBullet) return;
      const idx = selectedBullet.lineIndex;
      setAppliedLines((prev) => ({ ...prev, [idx]: version }));
      setLines((prev) => {
        const updated = [...prev];
        updated[idx] = version;
        return updated;
      });
      toast({ message: "Suggestion applied to your resume!", type: "success" });
    },
    [selectedBullet, toast]
  );

  const copyToClipboard = useCallback(async (text: string, index: number) => {
    await navigator.clipboard.writeText(text);
    setCopied(index);
    setTimeout(() => setCopied(null), 2000);
  }, []);

  // ── Derived ────────────────────────────────────────────────────────────────
  const weakBullets = bullets.filter((b) => b.isWeak);
  const atsScore = resume?.ats_score ?? null;
  const keywordsCount = analysis?.skills?.length ?? null;
  const alertsCount = weakBullets.length;

  // ── Loading / error states ─────────────────────────────────────────────────
  if (loading) {
    return (
      <div className="p-8 flex items-center justify-center min-h-[60vh]">
        <div className="text-center space-y-3">
          <div className="w-8 h-8 border-2 border-primary border-t-transparent rounded-full animate-spin mx-auto" />
          <p className="text-muted-foreground font-serif italic text-sm">Loading your resume…</p>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="p-8">
        <div
          className="bg-card border border-border rounded-xl p-8 text-center max-w-md mx-auto"
          style={{ boxShadow: "2px 3px 5px 0px rgba(51,44,37,0.12)" }}
        >
          <AlertTriangle className="w-8 h-8 text-orange-500 mx-auto mb-3" />
          <p className="text-foreground font-medium">{error}</p>
        </div>
      </div>
    );
  }

  // ── Main render ────────────────────────────────────────────────────────────
  return (
    <div className="p-6 md:p-8">
      {/* Header */}
      <div className="flex flex-col md:flex-row md:items-end justify-between gap-4 mb-8">
        <div className="space-y-1.5">
          <div className="flex items-center gap-2 text-primary font-bold text-xs tracking-widest uppercase">
            <Wand2 className="w-4 h-4" />
            AI Assistant
          </div>
          <h1 className="text-3xl font-serif font-bold text-foreground">Improve Your Resume</h1>
          <p className="text-muted-foreground italic font-serif text-sm">
            Professional editorial assistant for resume optimization and impact analysis.
          </p>
        </div>
        <div className="flex gap-3 flex-shrink-0">
          <button className="flex items-center gap-2 px-4 py-2 rounded-lg border border-border bg-card text-sm font-bold hover:bg-muted transition-all shadow-aesthetic">
            Export PDF
          </button>
        </div>
      </div>

      {/* Split Layout */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-start">

        {/* ── Left: Resume Paper Preview ─────────────────────────────────── */}
        <div className="lg:col-span-7 space-y-3">
          <div className="flex items-center justify-between px-1">
            <h3 className="font-bold flex items-center gap-2 text-sm">
              <FileText className="w-4 h-4 text-primary" />
              Document Preview
            </h3>
            {resume?.original_filename && (
              <span className="text-xs text-muted-foreground truncate max-w-[220px]">
                {resume.original_filename}
              </span>
            )}
          </div>

          <div
            className="bg-card border border-border rounded-lg p-8 overflow-auto font-serif text-sm leading-relaxed"
            style={{
              minHeight: "580px",
              boxShadow: "2px 3px 15px rgba(51,44,37,0.08)",
            }}
          >
            {(() => {
              // Build a Map from lineIndex → BulletLine for O(1) lookup
              const candidateMap = new Map(bullets.map((b) => [b.lineIndex, b]));

              return lines.map((line, i) => {
                const displayLine = appliedLines[i] ?? line;
                const candidate = candidateMap.get(i);
                const isSelected = selectedBullet?.lineIndex === i;
                const isApplied = !!appliedLines[i];
                const isWeak = candidate?.isWeak;
                const trimmed = line.trim();

                // Section headers first (skip them as candidates above)
                if (isSectionHeader(line)) {
                  return (
                    <h4
                      key={i}
                      className="border-b border-border text-xs font-bold uppercase tracking-widest mt-6 mb-2 pb-1 text-foreground"
                    >
                      {trimmed}
                    </h4>
                  );
                }

                // Empty lines → spacer
                if (!trimmed) return <div key={i} className="h-1.5" />;

                // Candidate duty line — clickable, conditionally highlighted
                if (candidate) {
                  return (
                    <div
                      key={i}
                      onClick={() => handleOptimize(candidate)}
                      className={[
                        "flex items-start gap-2 py-1 pl-3 -ml-3 pr-2 rounded-r border-l-2 my-0.5 cursor-pointer transition-all",
                        isApplied
                          ? "bg-green-50 border-green-400"
                          : isSelected
                          ? "bg-primary/15 border-primary"
                          : isWeak
                          ? "bg-amber-50 border-amber-400 hover:bg-amber-100"
                          : "border-transparent hover:bg-muted/40",
                      ].join(" ")}
                    >
                      <span className="flex-1 text-foreground/90">{displayLine}</span>
                      {isApplied && (
                        <CheckCircle className="w-3.5 h-3.5 text-green-500 mt-0.5 flex-shrink-0" />
                      )}
                    </div>
                  );
                }

                // Plain non-candidate line
                return (
                  <p key={i} className="text-foreground/90 mb-1">
                    {displayLine}
                  </p>
                );
              });
            })()}
          </div>

          {weakBullets.length > 0 && (
            <p className="text-xs text-muted-foreground px-1">
              <span className="text-primary font-bold">
                {weakBullets.length} weak bullet{weakBullets.length > 1 ? "s" : ""}
              </span>{" "}
              highlighted — click any to get AI suggestions.
            </p>
          )}
        </div>

        {/* ── Right: AI Suggestions Panel ───────────────────────────────── */}
        <div className="lg:col-span-5 space-y-5">

          {/* Stats Row */}
          <div className="grid grid-cols-3 gap-3">
            <div className="bg-card p-4 rounded-xl border border-border text-center shadow-aesthetic">
              <div className="text-2xl font-black text-primary">
                {atsScore !== null ? `${atsScore}%` : "—"}
              </div>
              <div className="text-[10px] uppercase font-bold text-muted-foreground tracking-wider mt-0.5">
                Score
              </div>
            </div>
            <div className="bg-card p-4 rounded-xl border border-border text-center shadow-aesthetic">
              <div className="text-2xl font-black text-primary">
                {keywordsCount !== null ? keywordsCount : "—"}
              </div>
              <div className="text-[10px] uppercase font-bold text-muted-foreground tracking-wider mt-0.5">
                Keywords
              </div>
            </div>
            <div className="bg-card p-4 rounded-xl border border-border text-center shadow-aesthetic">
              <div className="text-2xl font-black text-primary">{alertsCount}</div>
              <div className="text-[10px] uppercase font-bold text-muted-foreground tracking-wider mt-0.5">
                Alerts
              </div>
            </div>
          </div>

          {/* Bullet Optimizer Card */}
          <div className="bg-card rounded-xl border border-border overflow-hidden shadow-aesthetic">
            <div className="p-4 border-b border-border flex items-center justify-between bg-muted/30">
              <h4 className="font-bold flex items-center gap-2 text-sm">
                <AlertTriangle className="w-4 h-4 text-orange-500" />
                Bullet Optimizer
              </h4>
              {weakBullets.length > 0 && (
                <span className="text-xs bg-orange-100 text-orange-600 px-2 py-1 rounded font-bold">
                  {weakBullets.length} to improve
                </span>
              )}
            </div>

            <div className="p-4">
              {!selectedBullet ? (
                /* Empty state */
                <div className="text-center py-8 space-y-2">
                  <Wand2 className="w-8 h-8 text-muted-foreground/40 mx-auto" />
                  <p className="text-sm text-muted-foreground italic font-serif leading-relaxed">
                    Click a highlighted bullet point in the preview to get AI‑optimized versions.
                  </p>
                  {weakBullets.length > 0 && (
                    <button
                      onClick={() => handleOptimize(weakBullets[0])}
                      className="mt-1 text-xs font-bold text-primary hover:underline flex items-center gap-1 mx-auto"
                    >
                      Start with first weak bullet
                      <ChevronRight className="w-3 h-3" />
                    </button>
                  )}
                </div>
              ) : (
                <div className="space-y-4">
                  {/* Original */}
                  <div className="space-y-1.5">
                    <div className="text-[10px] font-bold text-muted-foreground uppercase tracking-widest">
                      Original
                    </div>
                    <p className="text-sm p-3 bg-muted/50 rounded-lg italic text-foreground/80 leading-relaxed">
                      &ldquo;{selectedBullet.text}&rdquo;
                    </p>
                  </div>

                  {/* Loading */}
                  {optimizing && (
                    <div className="flex items-center gap-2 py-4 justify-center">
                      <div className="w-5 h-5 border-2 border-primary border-t-transparent rounded-full animate-spin" />
                      <span className="text-sm text-muted-foreground">Generating suggestions…</span>
                    </div>
                  )}

                  {/* Error */}
                  {optError && (
                    <div className="text-sm text-destructive bg-destructive/10 rounded-lg p-3">
                      {optError}
                    </div>
                  )}

                  {/* 3 Optimized versions */}
                  {optimizedVersions.length > 0 && (
                    <div className="space-y-4">
                      <div className="text-[10px] font-bold text-primary uppercase tracking-widest">
                        {optimizedVersions.length} AI Suggestions
                      </div>
                      {optimizedVersions.map((version, idx) => (
                        <div key={idx} className="space-y-2">
                          <div className="flex items-start gap-1.5">
                            <span className="text-[10px] font-bold text-muted-foreground mt-1 w-4 flex-shrink-0">
                              {idx + 1}.
                            </span>
                            <p className="text-sm p-3 bg-primary/5 border border-primary/20 rounded-lg font-medium leading-relaxed italic flex-1">
                              &ldquo;{version}&rdquo;
                            </p>
                          </div>
                          <div className="flex gap-2 pl-5">
                            <button
                              onClick={() => applyVersion(version)}
                              className="flex-1 bg-primary text-white text-xs font-bold py-2 rounded-lg hover:bg-primary/90 transition-colors"
                            >
                              Apply Suggestion
                            </button>
                            <button
                              onClick={() => copyToClipboard(version, idx)}
                              className="px-3 border border-border rounded-lg hover:bg-muted transition-colors"
                              title="Copy to clipboard"
                            >
                              {copied === idx ? (
                                <CheckCircle className="w-4 h-4 text-green-500" />
                              ) : (
                                <Copy className="w-4 h-4 text-muted-foreground" />
                              )}
                            </button>
                          </div>
                        </div>
                      ))}
                    </div>
                  )}
                </div>
              )}
            </div>
          </div>

          {/* Missing Keywords */}
          {analysis?.missing_keywords && analysis.missing_keywords.length > 0 && (
            <div className="bg-card rounded-xl border border-border overflow-hidden shadow-aesthetic">
              <div className="p-4 border-b border-border bg-muted/30">
                <h4 className="font-bold flex items-center gap-2 text-sm">
                  <KeyRound className="w-4 h-4 text-blue-500" />
                  Missing Keywords
                </h4>
              </div>
              <div className="p-4 space-y-3">
                <p className="text-muted-foreground text-sm italic font-serif">
                  Add these keywords to improve ATS compatibility:
                </p>
                <div className="flex flex-wrap gap-2">
                  {analysis.missing_keywords.map((kw) => (
                    <span
                      key={kw}
                      className="px-2 py-1 rounded-md bg-blue-50 text-blue-600 text-xs font-bold border border-blue-100"
                    >
                      + {kw}
                    </span>
                  ))}
                </div>
              </div>
            </div>
          )}

          {/* Impact Analysis */}
          {analysis && (analysis.strengths || analysis.suggestions) && (
            <div className="bg-card rounded-xl border border-border overflow-hidden shadow-aesthetic">
              <div className="p-4 border-b border-border bg-muted/30">
                <h4 className="font-bold flex items-center gap-2 text-sm">
                  <TrendingUp className="w-4 h-4 text-green-500" />
                  Impact Analysis
                </h4>
              </div>
              <div className="p-4 space-y-3">
                {analysis.strengths && (
                  <div className="flex items-start gap-3 p-3 rounded-lg bg-green-50 border border-green-100">
                    <TrendingUp className="w-4 h-4 text-green-500 mt-0.5 flex-shrink-0" />
                    <div>
                      <p className="text-xs font-bold mb-1">Strengths</p>
                      <p className="text-xs leading-relaxed text-foreground/70">{analysis.strengths}</p>
                    </div>
                  </div>
                )}
                {analysis.suggestions && (
                  <div className="flex items-start gap-3 p-3 rounded-lg bg-primary/5 border border-primary/15">
                    <ChevronRight className="w-4 h-4 text-primary mt-0.5 flex-shrink-0" />
                    <div>
                      <p className="text-xs font-bold mb-1">Suggestions</p>
                      <p className="text-xs leading-relaxed text-foreground/70">{analysis.suggestions}</p>
                    </div>
                  </div>
                )}
              </div>
            </div>
          )}

          {/* No analysis CTA */}
          {!analysis && (
            <div
              className="p-5 bg-accent/30 border border-border rounded-2xl flex flex-col items-center text-center gap-3 shadow-aesthetic"
            >
              <div className="h-10 w-10 bg-primary rounded-full flex items-center justify-center text-white">
                <Wand2 className="w-5 h-5" />
              </div>
              <div>
                <h5 className="font-bold text-sm">No Analysis Yet</h5>
                <p className="text-xs text-muted-foreground mt-1 leading-relaxed">
                  Run a resume analysis first to see your ATS score, keywords, and strengths.
                </p>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
