"use client";

import { useCallback, useRef, useState } from "react";
import Link from "next/link";
import { UploadCloud, FileText, CheckCircle, AlertCircle, X } from "lucide-react";
import { useToast } from "@/components/toast";

const ACCEPTED_TYPES = [
  "application/pdf",
  "application/vnd.openxmlformats-officedocument.wordprocessingml.document",
];
const MAX_SIZE = 5 * 1024 * 1024; // 5 MB

type UploadState =
  | { status: "idle" }
  | { status: "selected"; file: File }
  | { status: "uploading"; progress: number }
  | { status: "success" }
  | { status: "error"; message: string };

function formatBytes(n: number) {
  if (n < 1024) return `${n} B`;
  if (n < 1024 * 1024) return `${(n / 1024).toFixed(1)} KB`;
  return `${(n / (1024 * 1024)).toFixed(1)} MB`;
}

function validateFile(file: File): string | null {
  const validExt = file.name.toLowerCase().endsWith(".pdf") || file.name.toLowerCase().endsWith(".docx");
  if (!ACCEPTED_TYPES.includes(file.type) && !validExt) {
    return "Only PDF and DOCX files are accepted.";
  }
  if (file.size > MAX_SIZE) {
    return `File too large — max 5 MB (yours is ${formatBytes(file.size)}).`;
  }
  return null;
}

export default function UploadResumePage() {
  const { toast } = useToast();
  const [state, setState] = useState<UploadState>({ status: "idle" });
  const [isDragging, setIsDragging] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);

  function pickFile(file: File) {
    const err = validateFile(file);
    if (err) {
      setState({ status: "error", message: err });
      return;
    }
    setState({ status: "selected", file });
  }

  const handleDrop = useCallback((e: React.DragEvent) => {
    e.preventDefault();
    setIsDragging(false);
    const file = e.dataTransfer.files[0];
    if (file) pickFile(file);
  }, []);

  const handleDragOver = useCallback((e: React.DragEvent) => {
    e.preventDefault();
    setIsDragging(true);
  }, []);

  const handleDragLeave = useCallback(() => setIsDragging(false), []);

  function handleInputChange(e: React.ChangeEvent<HTMLInputElement>) {
    const file = e.target.files?.[0];
    if (file) pickFile(file);
  }

  function reset() {
    setState({ status: "idle" });
    if (fileInputRef.current) fileInputRef.current.value = "";
  }

  async function handleUpload() {
    if (state.status !== "selected") return;
    const { file } = state;

    setState({ status: "uploading", progress: 0 });

    // Animate progress to 85% while fetch is in flight
    let prog = 0;
    const ticker = setInterval(() => {
      prog = Math.min(prog + Math.random() * 12, 85);
      setState({ status: "uploading", progress: Math.round(prog) });
    }, 350);

    try {
      const body = new FormData();
      body.append("resume_file", file);

      const res = await fetch("/api/upload-resume", { method: "POST", body });
      clearInterval(ticker);
      setState({ status: "uploading", progress: 100 });

      const data = await res.json();
      if (!res.ok) {
        setState({ status: "error", message: data.error ?? "Upload failed. Please try again." });
        return;
      }

      setTimeout(() => {
        setState({ status: "success" });
        toast({ message: "Resume uploaded successfully! Head to your dashboard to get started.", type: "success" });
      }, 400);
    } catch {
      clearInterval(ticker);
      const msg = "Network error. Check your connection and try again.";
      setState({ status: "error", message: msg });
      toast({ message: msg, type: "error" });
    }
  }

  return (
    <main className="max-w-4xl mx-auto px-6 py-16 md:py-24">

      {/* Hero */}
      <div className="text-center mb-12">
        <h2 className="font-serif text-4xl md:text-5xl font-bold text-foreground italic mb-4">
          Upload Your Resume
        </h2>
        <p className="text-lg text-muted-foreground max-w-xl mx-auto font-serif italic">
          Let our advanced AI analyze your professional background to uncover the perfect
          job matches and career opportunities.
        </p>
      </div>

      {/* Upload Card */}
      <div className="bg-card rounded-lg p-8 md:p-12 shadow-aesthetic border border-border relative overflow-hidden">
        <div className="absolute inset-0 bg-gradient-to-br from-primary/5 to-transparent opacity-50 pointer-events-none" />

        {/* ── IDLE ─────────────────────────────────────── */}
        {state.status === "idle" && (
          <>
            <div
              onDrop={handleDrop}
              onDragOver={handleDragOver}
              onDragLeave={handleDragLeave}
              onClick={() => fileInputRef.current?.click()}
              className={`relative flex flex-col items-center justify-center border border-dashed rounded-lg p-12 text-center cursor-pointer group transition-colors ${
                isDragging
                  ? "border-primary bg-primary/5"
                  : "border-border hover:border-primary"
              }`}
            >
              <div className="w-16 h-16 bg-accent rounded-full flex items-center justify-center mb-6 group-hover:scale-105 transition-transform">
                <UploadCloud className="w-8 h-8 text-primary" />
              </div>
              <h3 className="font-serif text-2xl font-bold text-foreground italic mb-2">
                {isDragging ? "Drop your file here" : "Drag and drop your resume here"}
              </h3>
              <p className="text-muted-foreground mb-8 text-sm italic">
                Supports PDF and DOCX formats (Max 5MB)
              </p>
              <button
                type="button"
                onClick={(e) => { e.stopPropagation(); fileInputRef.current?.click(); }}
                className="bg-primary text-white px-8 py-3 rounded-lg font-bold shadow-aesthetic hover:opacity-90 transition-all"
              >
                Browse Files
              </button>
            </div>
            <input
              ref={fileInputRef}
              type="file"
              accept=".pdf,.docx,application/pdf,application/vnd.openxmlformats-officedocument.wordprocessingml.document"
              className="hidden"
              onChange={handleInputChange}
            />
          </>
        )}

        {/* ── ERROR ────────────────────────────────────── */}
        {state.status === "error" && (
          <>
            <div
              onDrop={handleDrop}
              onDragOver={handleDragOver}
              onDragLeave={handleDragLeave}
              onClick={() => fileInputRef.current?.click()}
              className="relative flex flex-col items-center justify-center border border-dashed border-border rounded-lg p-12 text-center cursor-pointer group hover:border-primary transition-colors"
            >
              <div className="w-16 h-16 bg-accent rounded-full flex items-center justify-center mb-6 group-hover:scale-105 transition-transform">
                <UploadCloud className="w-8 h-8 text-primary" />
              </div>
              <h3 className="font-serif text-2xl font-bold text-foreground italic mb-2">
                Drag and drop your resume here
              </h3>
              <p className="text-muted-foreground mb-8 text-sm italic">
                Supports PDF and DOCX formats (Max 5MB)
              </p>
              <button
                type="button"
                onClick={(e) => { e.stopPropagation(); fileInputRef.current?.click(); }}
                className="bg-primary text-white px-8 py-3 rounded-lg font-bold shadow-aesthetic hover:opacity-90 transition-all"
              >
                Browse Files
              </button>
            </div>
            <div className="mt-4 flex items-center gap-3 p-4 bg-red-50 border border-red-200 rounded-lg text-red-700">
              <AlertCircle className="w-5 h-5 flex-shrink-0" />
              <p className="text-sm flex-1">{state.message}</p>
              <button onClick={reset} aria-label="Dismiss">
                <X className="w-4 h-4" />
              </button>
            </div>
            <input
              ref={fileInputRef}
              type="file"
              accept=".pdf,.docx,application/pdf,application/vnd.openxmlformats-officedocument.wordprocessingml.document"
              className="hidden"
              onChange={handleInputChange}
            />
          </>
        )}

        {/* ── SELECTED ─────────────────────────────────── */}
        {state.status === "selected" && (
          <div className="relative flex flex-col items-center gap-6 py-4">
            <div className="w-16 h-16 bg-accent rounded-full flex items-center justify-center">
              <FileText className="w-8 h-8 text-primary" />
            </div>
            <div className="text-center">
              <p className="font-serif text-xl font-bold text-foreground">{state.file.name}</p>
              <p className="text-sm text-muted-foreground mt-1">{formatBytes(state.file.size)}</p>
            </div>
            <div className="flex gap-4">
              <button
                type="button"
                onClick={reset}
                className="bg-[#e2d8c3] text-[#5c4d3f] px-8 py-3 rounded-lg font-bold border border-border hover:opacity-80 transition-all"
              >
                Change File
              </button>
              <button
                type="button"
                onClick={handleUpload}
                className="bg-primary text-white px-8 py-3 rounded-lg font-bold shadow-aesthetic hover:opacity-90 transition-all"
              >
                Upload &amp; Analyze
              </button>
            </div>
          </div>
        )}

        {/* ── UPLOADING ────────────────────────────────── */}
        {state.status === "uploading" && (
          <div className="relative flex flex-col items-center gap-6 py-4">
            <div className="w-16 h-16 bg-accent rounded-full flex items-center justify-center">
              <UploadCloud className="w-8 h-8 text-primary animate-pulse" />
            </div>
            <div className="w-full max-w-sm text-center">
              <p className="font-serif text-xl font-bold text-foreground italic mb-2">
                Uploading your resume…
              </p>
              <p className="text-sm text-muted-foreground italic mb-4">
                Please wait while we process your file.
              </p>
              <div className="w-full bg-muted rounded-full h-2 overflow-hidden">
                <div
                  className="bg-primary h-2 rounded-full transition-all duration-300"
                  style={{ width: `${state.progress}%` }}
                />
              </div>
              <p className="text-xs text-muted-foreground mt-2">{state.progress}%</p>
            </div>
          </div>
        )}

        {/* ── SUCCESS ──────────────────────────────────── */}
        {state.status === "success" && (
          <div className="relative flex flex-col items-center gap-6 py-4 text-center">
            <div className="w-16 h-16 bg-green-100 rounded-full flex items-center justify-center">
              <CheckCircle className="w-8 h-8 text-green-600" />
            </div>
            <div>
              <h3 className="font-serif text-2xl font-bold text-foreground italic mb-2">
                Resume Uploaded Successfully!
              </h3>
              <p className="text-muted-foreground text-sm italic max-w-md">
                Your resume has been uploaded and is ready for AI analysis. Head to your
                dashboard to get started.
              </p>
            </div>
            <Link
              href="/dashboard"
              className="bg-primary text-white px-10 py-3 rounded-lg font-bold shadow-aesthetic hover:opacity-90 transition-all"
            >
              Go to Dashboard
            </Link>
          </div>
        )}
      </div>

      {/* Features */}
      <div className="mt-24">
        <div className="flex items-center mb-10">
          <h3 className="font-serif text-2xl font-bold text-foreground italic whitespace-nowrap">
            Our AI Analysis Features
          </h3>
          <div className="h-px bg-border flex-grow ml-8" />
        </div>
        <div className="grid md:grid-cols-3 gap-8">

          <div className="bg-card p-8 rounded-lg shadow-aesthetic border border-border hover:opacity-90 transition-opacity">
            <div className="w-12 h-12 bg-accent rounded-lg flex items-center justify-center mb-6">
              <svg className="w-6 h-6 text-primary" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path d="M9.663 17h4.673M12 3v1m6.364 1.636l-.707.707M21 12h-1M4 12H3m3.343-5.657l-.707-.707m2.828 9.9a5 5 0 117.072 0l-.548.547A3.374 3.374 0 0014 18.469V19a2 2 0 11-4 0v-.531c0-.895-.356-1.754-.988-2.386l-.548-.547z" strokeLinecap="round" strokeLinejoin="round" strokeWidth="1.5" />
              </svg>
            </div>
            <h4 className="font-serif text-xl font-bold text-foreground mb-3">AI Deep Analysis</h4>
            <p className="text-muted-foreground text-sm leading-relaxed">
              Comprehensive evaluation of your professional narrative, identifying hidden
              strengths and leadership traits.
            </p>
          </div>

          <div className="bg-card p-8 rounded-lg shadow-aesthetic border border-border hover:opacity-90 transition-opacity">
            <div className="w-12 h-12 bg-accent rounded-lg flex items-center justify-center mb-6">
              <svg className="w-6 h-6 text-primary" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path d="M9 19v-6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2a2 2 0 002-2zm0 0V9a2 2 0 012-2h2a2 2 0 012 2v10m-6 0a2 2 0 002 2h2a2 2 0 002-2m0 0V5a2 2 0 012-2h2a2 2 0 012 2v14a2 2 0 01-2 2h-2a2 2 0 01-2-2z" strokeLinecap="round" strokeLinejoin="round" strokeWidth="1.5" />
              </svg>
            </div>
            <h4 className="font-serif text-xl font-bold text-foreground mb-3">ATS Score Optimization</h4>
            <p className="text-muted-foreground text-sm leading-relaxed">
              See how well your resume ranks against applicant tracking systems and
              receive actionable keywords.
            </p>
          </div>

          <div className="bg-card p-8 rounded-lg shadow-aesthetic border border-border hover:opacity-90 transition-opacity">
            <div className="w-12 h-12 bg-accent rounded-lg flex items-center justify-center mb-6">
              <svg className="w-6 h-6 text-primary" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path d="M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2m-6 9l2 2 4-4" strokeLinecap="round" strokeLinejoin="round" strokeWidth="1.5" />
              </svg>
            </div>
            <h4 className="font-serif text-xl font-bold text-foreground mb-3">Skill Gap Detection</h4>
            <p className="text-muted-foreground text-sm leading-relaxed">
              Identify missing technical or soft skills required for your target roles
              with personalized learning paths.
            </p>
          </div>

        </div>
      </div>
    </main>
  );
}
