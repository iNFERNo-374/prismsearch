"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { RefreshCw } from "lucide-react";
import { useToast } from "@/components/toast";

export function AnalyzeButton({ resumeId, label = "New Analysis" }: { resumeId: string; label?: string }) {
  const router = useRouter();
  const { toast } = useToast();
  const [loading, setLoading] = useState(false);

  async function handleAnalyze() {
    setLoading(true);
    try {
      const res = await fetch("/api/analyze-resume", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ resume_id: resumeId }),
      });
      const data = await res.json();
      if (!res.ok) {
        toast({ message: data.error ?? "Analysis failed. Please try again.", type: "error" });
        return;
      }
      toast({ message: "Resume analysis complete!", type: "success" });
      router.refresh();
    } catch {
      toast({ message: "Network error. Check your connection and try again.", type: "error" });
    } finally {
      setLoading(false);
    }
  }

  return (
    <button
      onClick={handleAnalyze}
      disabled={loading}
      className="bg-primary text-white px-6 py-3 rounded-lg font-bold text-sm hover:opacity-90 transition-all flex items-center gap-2 shadow-aesthetic disabled:opacity-60"
    >
      <RefreshCw className={`w-4 h-4 ${loading ? "animate-spin" : ""}`} />
      {loading ? "Analyzing…" : label}
    </button>
  );
}
