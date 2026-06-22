// POST /api/analyze-resume
// Input:   { resume_id: string }
// Process: auth → fetch resume_text → Gemini → upsert resume_analysis → update ats_score
// Returns: { ats_score, skills, missing_keywords, strengths, suggestions }

import { createClient } from "@/lib/supabase/server";
import { callGemini } from "@/lib/gemini";
import { NextRequest, NextResponse } from "next/server";

interface GeminiAnalysis {
  ats_score: number;
  skills: string[];
  missing_keywords: string[];
  strengths: string;
  suggestions: string;
}

function buildPrompt(resumeText: string): string {
  return `You are an expert resume analyst and ATS specialist. Analyze the resume text below and return a single JSON object — no markdown, no code fences, no extra text.

The JSON must have exactly these fields:
{
  "ats_score": <integer 0–100, ATS compatibility score>,
  "skills": <string[], up to 15 detected skills/technologies from the resume>,
  "missing_keywords": <string[], up to 8 high-impact keywords absent from the resume that would boost hirability>,
  "strengths": <string, 2–3 sentences on the resume's strongest points>,
  "suggestions": <string, 2–3 sentences of specific, actionable improvements>
}

Resume text:
---
${resumeText}
---`;
}

export async function POST(request: NextRequest) {
  // ── Auth ──────────────────────────────────────────────────────────────────
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) {
    return NextResponse.json({ error: "Unauthorized." }, { status: 401 });
  }

  // ── Input ─────────────────────────────────────────────────────────────────
  let body: { resume_id?: string };
  try {
    body = await request.json();
  } catch {
    return NextResponse.json({ error: "Invalid JSON body." }, { status: 400 });
  }

  const { resume_id } = body;
  if (!resume_id) {
    return NextResponse.json({ error: "resume_id is required." }, { status: 400 });
  }

  // ── Fetch resume (ownership check) ───────────────────────────────────────
  const { data: resume, error: resumeErr } = await supabase
    .from("resumes")
    .select("id, resume_text, original_filename")
    .eq("id", resume_id)
    .eq("user_id", user.id)
    .single();

  if (resumeErr || !resume) {
    return NextResponse.json({ error: "Resume not found." }, { status: 404 });
  }

  if (!resume.resume_text || resume.resume_text.trim().length < 50) {
    return NextResponse.json(
      { error: "Resume text is too short or missing. DOCX text extraction is not yet supported — please upload a PDF." },
      { status: 422 }
    );
  }

  // ── Gemini analysis ───────────────────────────────────────────────────────
  let analysis: GeminiAnalysis;
  try {
    const raw = await callGemini(buildPrompt(resume.resume_text));
    analysis = JSON.parse(raw) as GeminiAnalysis;
  } catch (err) {
    console.error("[analyze-resume] Gemini error:", err);
    return NextResponse.json(
      { error: "AI analysis failed. Please try again." },
      { status: 502 }
    );
  }

  // Validate the shape Gemini returned
  if (
    typeof analysis.ats_score !== "number" ||
    !Array.isArray(analysis.skills) ||
    !Array.isArray(analysis.missing_keywords)
  ) {
    return NextResponse.json(
      { error: "AI returned an unexpected response format. Please try again." },
      { status: 502 }
    );
  }

  // Clamp ats_score to 0–100
  analysis.ats_score = Math.max(0, Math.min(100, Math.round(analysis.ats_score)));

  // ── Persist: delete old analysis, insert new ──────────────────────────────
  await supabase.from("resume_analysis").delete().eq("resume_id", resume_id);

  const { error: insertErr } = await supabase.from("resume_analysis").insert({
    resume_id,
    skills:           analysis.skills,
    missing_keywords: analysis.missing_keywords,
    strengths:        analysis.strengths,
    suggestions:      analysis.suggestions,
  });

  if (insertErr) {
    console.error("[analyze-resume] DB insert error:", insertErr);
    return NextResponse.json({ error: "Failed to save analysis." }, { status: 500 });
  }

  // ── Update ats_score + updated_at on resumes row ──────────────────────────
  await supabase
    .from("resumes")
    .update({ ats_score: analysis.ats_score, updated_at: new Date().toISOString() })
    .eq("id", resume_id);

  return NextResponse.json({
    ats_score:        analysis.ats_score,
    skills:           analysis.skills,
    missing_keywords: analysis.missing_keywords,
    strengths:        analysis.strengths,
    suggestions:      analysis.suggestions,
  });
}
