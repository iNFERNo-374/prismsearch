"use client";

// Interview Prep — /dashboard/interview-prep
// Stitch reference: interview_prep_cleaned
// Layout: left (2/3) tab nav + question cards
//         right (1/3) generate controls + session stats + pro tips
// API: POST /api/interview-questions → { session_id, questions }

import { useEffect, useState, useMemo } from "react";
import { createClient } from "@/lib/supabase/client";
import {
  Lightbulb,
  Bookmark,
  BookmarkCheck,
  Loader2,
  AlertTriangle,
  Wand2,
  BarChart3,
  ChevronRight,
  CheckCircle,
  Save,
} from "lucide-react";
import type {
  InterviewQuestion,
  QuestionCategory,
} from "@/app/api/interview-questions/route";
import { useToast } from "@/components/toast";

// ── Constants ────────────────────────────────────────────────────────────────

const TABS: QuestionCategory[] = ["Technical", "Behavioral", "Role Specific"];

const CATEGORY_STYLE: Record<QuestionCategory, string> = {
  Technical: "bg-blue-50 text-blue-700 border-blue-200",
  Behavioral: "bg-purple-50 text-purple-700 border-purple-200",
  "Role Specific": "bg-green-50 text-green-700 border-green-200",
};

const PRO_TIPS = [
  {
    n: 1,
    text: "Use the <strong>STAR</strong> method for behavioral questions: Situation, Task, Action, Result.",
  },
  {
    n: 2,
    text: "Think out loud during technical challenges. Interviewers value your process as much as the solution.",
  },
  {
    n: 3,
    text: "Research the company's tech stack and engineering blog to anticipate role-specific domain questions.",
  },
];

// ── Question Card ─────────────────────────────────────────────────────────────

function QuestionCard({
  question,
  index,
  bookmarked,
  onToggleBookmark,
  answer,
  onAnswerChange,
  onSave,
  saving,
  saved,
}: {
  question: InterviewQuestion;
  index: number;
  bookmarked: boolean;
  onToggleBookmark: () => void;
  answer: string;
  onAnswerChange: (text: string) => void;
  onSave: () => void;
  saving: boolean;
  saved: boolean;
}) {
  const [hintOpen, setHintOpen] = useState(false);
  const [answerOpen, setAnswerOpen] = useState(answer.trim().length > 0);

  return (
    <div className="bg-card border border-border rounded-lg p-6 shadow-aesthetic hover:shadow-md transition-all">
      {/* Header row */}
      <div className="flex items-start justify-between mb-4 gap-3">
        <div className="flex items-center gap-2 flex-wrap">
          <span
            className={`px-2.5 py-1 rounded-full text-xs font-bold uppercase tracking-wider border ${
              CATEGORY_STYLE[question.category]
            }`}
          >
            {question.category}
          </span>
          <span className="text-xs text-muted-foreground font-medium">
            Q{index + 1}
          </span>
          {saved && (
            <span className="flex items-center gap-1 text-[10px] font-bold text-green-600">
              <CheckCircle className="w-3 h-3" />
              Answered
            </span>
          )}
        </div>
        <button
          onClick={onToggleBookmark}
          className="text-muted-foreground hover:text-primary transition-colors flex-shrink-0"
          title={bookmarked ? "Remove bookmark" : "Bookmark this question"}
        >
          {bookmarked ? (
            <BookmarkCheck className="w-5 h-5 text-primary" />
          ) : (
            <Bookmark className="w-5 h-5" />
          )}
        </button>
      </div>

      {/* Question text */}
      <h3 className="font-serif text-base font-bold text-foreground leading-snug mb-4">
        {question.text}
      </h3>

      {/* Hint toggle */}
      <button
        onClick={() => setHintOpen((v) => !v)}
        className="flex items-start gap-2 text-muted-foreground hover:text-primary transition-colors w-full text-left group mb-4"
      >
        <Lightbulb className="w-4 h-4 text-primary mt-0.5 flex-shrink-0" />
        <span className="text-xs italic leading-relaxed">
          {hintOpen ? (
            question.hint
          ) : (
            <span className="underline underline-offset-2 decoration-dashed">
              Show hint
            </span>
          )}
        </span>
      </button>

      {/* Answer section */}
      <div className="border-t border-border pt-4">
        <button
          onClick={() => setAnswerOpen((v) => !v)}
          className="text-xs font-bold text-primary hover:underline mb-3 flex items-center gap-1"
        >
          {answerOpen ? "Hide answer" : "Write your answer"}
          <ChevronRight
            className={`w-3.5 h-3.5 transition-transform ${answerOpen ? "rotate-90" : ""}`}
          />
        </button>

        {answerOpen && (
          <div className="space-y-2">
            <textarea
              value={answer}
              onChange={(e) => onAnswerChange(e.target.value)}
              placeholder="Type your answer here… Use the STAR method for behavioral questions."
              rows={4}
              className="w-full px-3 py-2.5 bg-background border border-border rounded-lg text-sm font-serif italic focus:outline-none focus:ring-2 focus:ring-primary/30 resize-none placeholder:text-muted-foreground/50 leading-relaxed"
            />
            <div className="flex items-center justify-between">
              <span className="text-[10px] text-muted-foreground">
                {answer.trim().length} characters
              </span>
              <button
                onClick={onSave}
                disabled={saving || answer.trim().length === 0}
                className="flex items-center gap-1.5 px-3 py-1.5 bg-primary text-white text-xs font-bold rounded-lg hover:opacity-90 transition-all disabled:opacity-50 disabled:cursor-not-allowed shadow-aesthetic"
              >
                {saving ? (
                  <Loader2 className="w-3.5 h-3.5 animate-spin" />
                ) : saved ? (
                  <CheckCircle className="w-3.5 h-3.5" />
                ) : (
                  <Save className="w-3.5 h-3.5" />
                )}
                {saving ? "Saving…" : saved ? "Saved" : "Save Answer"}
              </button>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}

// ── Page ─────────────────────────────────────────────────────────────────────

export default function InterviewPrepPage() {
  const supabase = createClient();
  const { toast } = useToast();

  const [resumeId, setResumeId] = useState<string | null>(null);
  const [targetRole, setTargetRole] = useState("");
  const [generating, setGenerating] = useState(false);
  const [questions, setQuestions] = useState<InterviewQuestion[]>([]);
  const [sessionId, setSessionId] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [activeTab, setActiveTab] = useState<QuestionCategory>("Technical");
  const [bookmarks, setBookmarks] = useState<Set<number>>(new Set());
  const [loadingResume, setLoadingResume] = useState(true);
  // answers[i] is the saved answer for questions[i]; empty string = not answered
  const [answers, setAnswers] = useState<string[]>([]);
  // draft[i] is what the user is currently typing (may differ from saved answers[i])
  const [draft, setDraft] = useState<string[]>([]);
  const [savingIndex, setSavingIndex] = useState<number | null>(null);

  // ── Load latest resume id ───────────────────────────────────────────────────
  useEffect(() => {
    async function load() {
      const {
        data: { user },
      } = await supabase.auth.getUser();
      if (!user) {
        setLoadingResume(false);
        return;
      }
      const { data } = await supabase
        .from("resumes")
        .select("id")
        .eq("user_id", user.id)
        .order("created_at", { ascending: false })
        .limit(1)
        .single();

      setResumeId(data?.id ?? null);
      setLoadingResume(false);
    }
    load();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  // ── Load most recent session ───────────────────────────────────────────────
  useEffect(() => {
    async function loadSession() {
      if (!resumeId) return;
      const { data } = await supabase
        .from("interview_sessions")
        .select("id, target_role, questions, answers")
        .eq("resume_id", resumeId)
        .order("created_at", { ascending: false })
        .limit(1)
        .single();

      if (data?.questions?.length) {
        const qs = data.questions as InterviewQuestion[];
        const saved: string[] = Array.isArray(data.answers)
          ? (data.answers as string[])
          : Array(qs.length).fill("");
        // Ensure saved is same length as questions
        const normalised = Array.from({ length: qs.length }, (_, i) => saved[i] ?? "");
        setSessionId(data.id);
        setTargetRole(data.target_role ?? "");
        setQuestions(qs);
        setAnswers(normalised);
        setDraft(normalised);
      }
    }
    loadSession();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [resumeId]);

  // ── Generate ────────────────────────────────────────────────────────────────
  async function handleGenerate() {
    if (!resumeId || targetRole.trim().length < 2) return;
    setGenerating(true);
    setError(null);

    try {
      const res = await fetch("/api/interview-questions", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ resume_id: resumeId, target_role: targetRole }),
      });
      const data = await res.json();
      if (!res.ok) {
        const msg = data.error ?? "Generation failed.";
        setError(msg);
        toast({ message: msg, type: "error" });
      } else {
        const qs: InterviewQuestion[] = data.questions ?? [];
        setQuestions(qs);
        setSessionId(data.session_id ?? null);
        setBookmarks(new Set());
        setActiveTab("Technical");
        const empty = Array(qs.length).fill("");
        setAnswers(empty);
        setDraft(empty);
        toast({ message: `${qs.length} interview questions generated!`, type: "success" });
      }
    } catch {
      const msg = "Network error. Please try again.";
      setError(msg);
      toast({ message: msg, type: "error" });
    } finally {
      setGenerating(false);
    }
  }

  // ── Derived ─────────────────────────────────────────────────────────────────
  const filteredQuestions = useMemo(
    () => questions.filter((q) => q.category === activeTab),
    [questions, activeTab]
  );

  const tabCounts = useMemo(
    () =>
      TABS.reduce(
        (acc, tab) => ({
          ...acc,
          [tab]: questions.filter((q) => q.category === tab).length,
        }),
        {} as Record<QuestionCategory, number>
      ),
    [questions]
  );

  const toggleBookmark = (globalIndex: number) => {
    setBookmarks((prev) => {
      const next = new Set(prev);
      next.has(globalIndex) ? next.delete(globalIndex) : next.add(globalIndex);
      return next;
    });
  };

  // Map filtered questions back to their global index for bookmarks + answers
  const filteredWithIndex = useMemo(
    () =>
      questions
        .map((q, i) => ({ q, i }))
        .filter(({ q }) => q.category === activeTab),
    [questions, activeTab]
  );

  const answeredCount = useMemo(
    () => answers.filter((a) => a.trim().length > 0).length,
    [answers]
  );

  // ── Save a single answer ────────────────────────────────────────────────────
  async function handleSaveAnswer(globalIndex: number) {
    if (!sessionId || savingIndex !== null) return;
    setSavingIndex(globalIndex);

    // Merge current draft into saved answers array
    const updated = answers.map((a, i) => (i === globalIndex ? draft[globalIndex] : a));

    try {
      const { error: saveErr } = await supabase
        .from("interview_sessions")
        .update({ answers: updated })
        .eq("id", sessionId);
      if (saveErr) throw saveErr;
      setAnswers(updated);
      toast({ message: "Answer saved!", type: "success" });
    } catch (err) {
      console.error("[interview-prep] save answer error:", err);
      toast({ message: "Failed to save answer. Please try again.", type: "error" });
    } finally {
      setSavingIndex(null);
    }
  }

  // ── Render ───────────────────────────────────────────────────────────────────
  return (
    <div className="p-6 md:p-8">
      {/* Header */}
      <div className="mb-8 space-y-1.5">
        <div className="flex items-center gap-2 text-primary font-bold text-xs tracking-widest uppercase">
          <Wand2 className="w-4 h-4" />
          AI Practice
        </div>
        <h1 className="text-3xl font-serif font-bold text-foreground">
          Interview Preparation
        </h1>
        <p className="text-muted-foreground italic font-serif text-sm max-w-xl">
          Master your next career move with AI-driven interview insights and personalized questions.
        </p>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8 items-start">

        {/* ── Left: Questions (2/3) ────────────────────────────────────── */}
        <div className="lg:col-span-2 space-y-6">

          {/* Tab nav + heading */}
          <div className="flex items-center justify-between gap-4">
            <h2 className="text-lg font-bold font-serif italic">
              {questions.length > 0
                ? "AI Generated Questions"
                : "Your Questions"}
            </h2>
            <div className="flex bg-muted/60 p-1 rounded-xl border border-border">
              {TABS.map((tab) => (
                <button
                  key={tab}
                  onClick={() => setActiveTab(tab)}
                  className={`px-3 py-1.5 rounded-lg text-xs font-bold transition-all ${
                    activeTab === tab
                      ? "bg-primary text-white shadow-aesthetic"
                      : "text-muted-foreground hover:text-primary"
                  }`}
                >
                  {tab}
                  {tabCounts[tab] > 0 && (
                    <span
                      className={`ml-1.5 text-[10px] font-bold ${
                        activeTab === tab ? "opacity-80" : "text-primary"
                      }`}
                    >
                      {tabCounts[tab]}
                    </span>
                  )}
                </button>
              ))}
            </div>
          </div>

          {/* Loading */}
          {generating && (
            <div className="flex flex-col items-center justify-center py-16 gap-3">
              <Loader2 className="w-8 h-8 text-primary animate-spin" />
              <p className="text-sm text-muted-foreground italic font-serif">
                Generating personalized questions for &ldquo;{targetRole}&rdquo;…
              </p>
            </div>
          )}

          {/* Error */}
          {error && (
            <div className="flex items-center gap-2 p-4 bg-destructive/10 border border-destructive/20 rounded-xl text-destructive text-sm">
              <AlertTriangle className="w-4 h-4 flex-shrink-0" />
              {error}
            </div>
          )}

          {/* Empty state */}
          {!generating && questions.length === 0 && !error && (
            <div className="bg-card border border-border rounded-xl p-12 text-center shadow-aesthetic">
              <Wand2 className="w-10 h-10 text-muted-foreground/30 mx-auto mb-3" />
              <p className="font-medium text-foreground mb-1">
                No Questions Yet
              </p>
              <p className="text-sm text-muted-foreground italic font-serif">
                Enter a target role and click Generate to get personalized interview questions.
              </p>
            </div>
          )}

          {/* Question cards */}
          {!generating && filteredWithIndex.length > 0 && (
            <div className="space-y-4">
              {filteredWithIndex.map(({ q, i }, localIdx) => (
                <QuestionCard
                  key={i}
                  question={q}
                  index={localIdx}
                  bookmarked={bookmarks.has(i)}
                  onToggleBookmark={() => toggleBookmark(i)}
                  answer={draft[i] ?? ""}
                  onAnswerChange={(text) =>
                    setDraft((prev) => {
                      const next = [...prev];
                      next[i] = text;
                      return next;
                    })
                  }
                  onSave={() => handleSaveAnswer(i)}
                  saving={savingIndex === i}
                  saved={
                    answers[i]?.trim().length > 0 &&
                    answers[i] === draft[i]
                  }
                />
              ))}
            </div>
          )}

          {/* No questions in this tab but others exist */}
          {!generating && questions.length > 0 && filteredWithIndex.length === 0 && (
            <div className="bg-card border border-border rounded-xl p-8 text-center shadow-aesthetic">
              <p className="text-sm text-muted-foreground italic font-serif">
                No {activeTab} questions in this session.
              </p>
            </div>
          )}
        </div>

        {/* ── Right: Controls + Stats + Tips (1/3) ────────────────────── */}
        <div className="space-y-5">

          {/* Generate card */}
          <div className="bg-card border border-border rounded-xl p-6 shadow-aesthetic">
            <h3 className="font-bold font-serif text-base italic flex items-center gap-2 mb-5">
              <Wand2 className="w-4 h-4 text-primary" />
              Generate Questions
            </h3>

            <div className="space-y-3">
              <div>
                <label className="text-xs font-bold text-muted-foreground uppercase tracking-wider block mb-1.5">
                  Target Role
                </label>
                <input
                  type="text"
                  value={targetRole}
                  onChange={(e) => setTargetRole(e.target.value)}
                  placeholder="e.g. Senior Software Engineer"
                  className="w-full px-3 py-2.5 bg-background border border-border rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-primary/30 italic placeholder:text-muted-foreground/50 font-serif"
                  onKeyDown={(e) => e.key === "Enter" && handleGenerate()}
                />
              </div>

              <button
                onClick={handleGenerate}
                disabled={
                  generating ||
                  loadingResume ||
                  !resumeId ||
                  targetRole.trim().length < 2
                }
                className="w-full flex items-center justify-center gap-2 bg-primary text-white font-bold py-3 rounded-lg hover:opacity-90 transition-all shadow-aesthetic disabled:opacity-50 disabled:cursor-not-allowed text-sm"
              >
                {generating ? (
                  <>
                    <Loader2 className="w-4 h-4 animate-spin" />
                    Generating…
                  </>
                ) : (
                  <>
                    <Wand2 className="w-4 h-4" />
                    {questions.length > 0 ? "Regenerate" : "Generate Questions"}
                  </>
                )}
              </button>

              {!resumeId && !loadingResume && (
                <p className="text-xs text-center text-muted-foreground italic">
                  Upload a resume first to generate questions.
                </p>
              )}
            </div>
          </div>

          {/* Session stats */}
          <div className="bg-card border border-border rounded-xl p-6 shadow-aesthetic">
            <h3 className="font-serif text-base font-bold italic mb-4 flex items-center gap-2">
              <BarChart3 className="w-4 h-4 text-primary" />
              Session Stats
            </h3>
            <div className="grid grid-cols-2 gap-3">
              <div className="p-3 bg-muted/30 rounded-lg">
                <p className="text-[10px] text-muted-foreground uppercase font-bold tracking-tighter">
                  Questions
                </p>
                <p className="text-2xl font-black text-primary font-serif">
                  {questions.length}
                </p>
                <p className="text-[10px] text-muted-foreground italic leading-tight">
                  Total generated
                </p>
              </div>
              <div className="p-3 bg-muted/30 rounded-lg">
                <p className="text-[10px] text-muted-foreground uppercase font-bold tracking-tighter">
                  Answered
                </p>
                <p className="text-2xl font-black text-foreground font-serif">
                  {answeredCount}
                </p>
                <p className="text-[10px] text-muted-foreground italic leading-tight">
                  of {questions.length} questions
                </p>
              </div>
            </div>

            {questions.length > 0 && (
              <div className="mt-3 pt-3 border-t border-border space-y-1.5">
                {TABS.map((tab) => (
                  <div key={tab} className="flex items-center justify-between text-xs">
                    <span
                      className={`px-2 py-0.5 rounded-full border text-[10px] font-bold ${CATEGORY_STYLE[tab]}`}
                    >
                      {tab}
                    </span>
                    <span className="font-bold text-foreground">
                      {tabCounts[tab]}
                    </span>
                  </div>
                ))}
              </div>
            )}
          </div>

          {/* Pro tips */}
          <div className="bg-card border border-border rounded-xl p-6 shadow-aesthetic">
            <h3 className="font-serif text-base font-bold italic flex items-center gap-2 mb-4">
              <Lightbulb className="w-4 h-4 text-primary" />
              Pro Tips
            </h3>
            <ul className="space-y-4">
              {PRO_TIPS.map(({ n, text }) => (
                <li key={n} className="flex gap-3">
                  <div className="h-5 w-5 rounded-full bg-muted flex items-center justify-center flex-shrink-0 mt-0.5">
                    <span className="text-primary font-bold text-[10px]">{n}</span>
                  </div>
                  <p
                    className="text-xs text-muted-foreground italic leading-relaxed"
                    dangerouslySetInnerHTML={{ __html: text }}
                  />
                </li>
              ))}
            </ul>
            <button className="w-full mt-5 py-2 text-xs font-bold text-primary border border-border rounded-lg hover:bg-muted/50 transition-colors flex items-center justify-center gap-1">
              Explore Full Library
              <ChevronRight className="w-3.5 h-3.5" />
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
