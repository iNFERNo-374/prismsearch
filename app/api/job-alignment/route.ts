// POST /api/job-alignment
// Input:   { resume_id: string, job_description: string }
// Process: auth → fetch resume_text (ownership check) → Gemini analysis → return results
// Returns: { match_score, matched_skills[], missing_skills[], suggestions }

import { createClient } from "@/lib/supabase/server";
import { callGemini } from "@/lib/gemini";
import { NextRequest, NextResponse } from "next/server";

// ── Types ────────────────────────────────────────────────────────────────────

interface GeminiAlignment {
  match_score: number;
  matched_skills: string[];
  missing_skills: string[];
  suggestions: string;
}

// ── Prompt ───────────────────────────────────────────────────────────────────

function buildPrompt(resumeText: string, jobDescription: string): string {
  return `You are an expert resume-job alignment analyst. Analyze how well the candidate's resume matches the given job description.

Resume:
---
${resumeText.slice(0, 3000)}
---

Job Description:
---
${jobDescription.slice(0, 2000)}
---

Return ONLY a JSON object — no markdown, no code fences, no extra text:
{
  "match_score": <integer 0–100, overall alignment score>,
  "matched_skills": <string[], up to 8 skills/qualifications from the resume that directly match the JD>,
  "missing_skills": <string[], up to 6 key requirements in the JD that the resume clearly lacks>,
  "suggestions": <string, 2–3 specific, actionable sentences on how to tailor this resume for this exact role>
}`;
}

// ── Handler ──────────────────────────────────────────────────────────────────

export async function POST(request: NextRequest) {
  // ── Auth ────────────────────────────────────────────────────────────────────
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) {
    return NextResponse.json({ error: "Unauthorized." }, { status: 401 });
  }

  // ── Input validation ────────────────────────────────────────────────────────
  let body: { resume_id?: string; job_description?: string };
  try {
    body = await request.json();
  } catch {
    return NextResponse.json({ error: "Invalid JSON body." }, { status: 400 });
  }

  const { resume_id, job_description } = body;

  if (!resume_id || !job_description) {
    return NextResponse.json(
      { error: "resume_id and job_description are required." },
      { status: 400 }
    );
  }

  if (job_description.trim().length < 50) {
    return NextResponse.json(
      { error: "job_description is too short. Please paste the full job posting." },
      { status: 400 }
    );
  }

  // ── Resume ownership + text fetch ───────────────────────────────────────────
  const { data: resume, error: resumeErr } = await supabase
    .from("resumes")
    .select("id, resume_text")
    .eq("id", resume_id)
    .eq("user_id", user.id)
    .single();

  if (resumeErr || !resume) {
    return NextResponse.json({ error: "Resume not found." }, { status: 404 });
  }

  if (!resume.resume_text || resume.resume_text.trim().length < 50) {
    return NextResponse.json(
      { error: "Resume text is missing or too short. Please re-upload your resume." },
      { status: 422 }
    );
  }

  // ── Gemini ──────────────────────────────────────────────────────────────────
  let result: GeminiAlignment;
  try {
    const raw = await callGemini(buildPrompt(resume.resume_text, job_description));
    result = JSON.parse(raw) as GeminiAlignment;
  } catch (err) {
    console.error("[job-alignment] Gemini error:", err);
    return NextResponse.json(
      { error: "AI analysis failed. Please try again." },
      { status: 502 }
    );
  }

  // ── Validate + clamp ────────────────────────────────────────────────────────
  if (
    typeof result.match_score !== "number" ||
    !Array.isArray(result.matched_skills) ||
    !Array.isArray(result.missing_skills)
  ) {
    return NextResponse.json(
      { error: "AI returned an unexpected format. Please try again." },
      { status: 502 }
    );
  }

  result.match_score = Math.max(0, Math.min(100, Math.round(result.match_score)));

  return NextResponse.json({
    match_score: result.match_score,
    matched_skills: result.matched_skills,
    missing_skills: result.missing_skills,
    suggestions: result.suggestions ?? "",
  });
}
