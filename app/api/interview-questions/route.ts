// POST /api/interview-questions
// Input:   { resume_id: string, target_role: string }
// Process: auth → fetch resume_text + skills → Gemini → insert interview_sessions → return
// Gemini output: { questions: [{ category, text, hint }] }
//   categories: "Technical" | "Behavioral" | "Role Specific"
// Returns: { session_id, questions }

import { createClient } from "@/lib/supabase/server";
import { callGemini } from "@/lib/gemini";
import { NextRequest, NextResponse } from "next/server";

// ── Types ────────────────────────────────────────────────────────────────────

export type QuestionCategory = "Technical" | "Behavioral" | "Role Specific";

export interface InterviewQuestion {
  category: QuestionCategory;
  text: string;
  hint: string;
}

interface GeminiQuestionsResponse {
  questions: InterviewQuestion[];
}

// ── Prompt ───────────────────────────────────────────────────────────────────

function buildPrompt(resumeText: string, targetRole: string): string {
  return `You are an expert technical interviewer at a top tech company. Generate 12 tailored interview questions for a candidate applying for the role of "${targetRole}".

Candidate background (from resume):
---
${resumeText.slice(0, 2000)}
---

Generate exactly 12 questions distributed as follows:
- 4 Technical questions: depth on relevant technologies, system design, or problem-solving specific to the role
- 4 Behavioral questions: past experiences, teamwork, conflict resolution, and leadership using STAR-method scenarios
- 4 Role Specific questions: domain knowledge, industry context, and responsibilities unique to "${targetRole}"

Each question must have a practical, concise hint (1–2 sentences) guiding the candidate on what a strong answer covers.

Return ONLY a JSON object — no markdown, no code fences, no extra text:
{
  "questions": [
    {
      "category": "Technical" | "Behavioral" | "Role Specific",
      "text": "<full question text>",
      "hint": "<brief coaching hint for a strong answer>"
    }
  ]
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
  let body: { resume_id?: string; target_role?: string };
  try {
    body = await request.json();
  } catch {
    return NextResponse.json({ error: "Invalid JSON body." }, { status: 400 });
  }

  const { resume_id, target_role } = body;

  if (!resume_id || !target_role) {
    return NextResponse.json(
      { error: "resume_id and target_role are required." },
      { status: 400 }
    );
  }

  if (target_role.trim().length < 2) {
    return NextResponse.json(
      { error: "target_role is too short." },
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
  let result: GeminiQuestionsResponse;
  try {
    const raw = await callGemini(buildPrompt(resume.resume_text, target_role.trim()));
    result = JSON.parse(raw) as GeminiQuestionsResponse;
  } catch (err) {
    console.error("[interview-questions] Gemini error:", err);
    return NextResponse.json(
      { error: "AI question generation failed. Please try again." },
      { status: 502 }
    );
  }

  // ── Validate ────────────────────────────────────────────────────────────────
  if (!Array.isArray(result.questions) || result.questions.length === 0) {
    return NextResponse.json(
      { error: "AI returned an unexpected format. Please try again." },
      { status: 502 }
    );
  }

  // Normalise categories in case Gemini uses unexpected casing
  const VALID_CATEGORIES: QuestionCategory[] = [
    "Technical",
    "Behavioral",
    "Role Specific",
  ];

  const questions: InterviewQuestion[] = result.questions
    .filter((q) => q.text && q.hint)
    .map((q) => {
      const cat = VALID_CATEGORIES.find(
        (c) => c.toLowerCase() === (q.category ?? "").toLowerCase()
      );
      return {
        category: cat ?? "Technical",
        text: q.text,
        hint: q.hint,
      };
    })
    .slice(0, 15);

  // ── Persist interview_sessions ──────────────────────────────────────────────
  const { data: session, error: sessionErr } = await supabase
    .from("interview_sessions")
    .insert({
      user_id: user.id,
      resume_id,
      target_role: target_role.trim(),
      questions,
    })
    .select("id")
    .single();

  if (sessionErr || !session) {
    console.error("[interview-questions] Session insert error:", sessionErr?.message);
    // Non-fatal — still return questions even if DB write fails
    return NextResponse.json({ session_id: null, questions });
  }

  return NextResponse.json({ session_id: session.id, questions });
}
