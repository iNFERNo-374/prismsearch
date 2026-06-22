// POST /api/optimize-resume
// Input:   { resume_id: string, bullet_point: string }
// Process: auth → ownership check → Gemini → return 3 optimized versions
// Returns: { optimized_versions: string[] }

import { createClient } from "@/lib/supabase/server";
import { callGemini } from "@/lib/gemini";
import { NextRequest, NextResponse } from "next/server";

interface GeminiOptimizeResponse {
  optimized_versions: string[];
}

function buildPrompt(bulletPoint: string): string {
  return `You are an expert resume writer. Rewrite the following resume bullet point into exactly 3 improved versions.

Requirements for each version:
- Start with a strong action verb (e.g., Spearheaded, Engineered, Drove, Achieved, Delivered, Launched)
- Include quantifiable results and metrics where possible (e.g., "increased by 40%", "saved $50K annually", "reduced time by 2 hours/week")
- Be specific and concrete — avoid vague or passive language
- Keep each version to 1–2 sentences, under 200 characters
- Do NOT start with "Responsible for", "Helped", "Assisted", or other passive phrases
- Each version should take a different angle (impact-first, metric-first, scope-first)

Original bullet point:
"${bulletPoint}"

Return ONLY a JSON object with this exact shape — no markdown, no code fences, no extra text:
{
  "optimized_versions": ["version 1 here", "version 2 here", "version 3 here"]
}`;
}

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
  let body: { resume_id?: string; bullet_point?: string };
  try {
    body = await request.json();
  } catch {
    return NextResponse.json({ error: "Invalid JSON body." }, { status: 400 });
  }

  const { resume_id, bullet_point } = body;

  if (!resume_id || !bullet_point) {
    return NextResponse.json(
      { error: "resume_id and bullet_point are required." },
      { status: 400 }
    );
  }

  if (bullet_point.trim().length < 5) {
    return NextResponse.json({ error: "bullet_point is too short." }, { status: 400 });
  }

  // ── Ownership check ─────────────────────────────────────────────────────────
  const { data: resume, error: resumeErr } = await supabase
    .from("resumes")
    .select("id")
    .eq("id", resume_id)
    .eq("user_id", user.id)
    .single();

  if (resumeErr || !resume) {
    return NextResponse.json({ error: "Resume not found." }, { status: 404 });
  }

  // ── Gemini ──────────────────────────────────────────────────────────────────
  let result: GeminiOptimizeResponse;
  try {
    const raw = await callGemini(buildPrompt(bullet_point.trim()));
    result = JSON.parse(raw) as GeminiOptimizeResponse;
  } catch (err) {
    console.error("[optimize-resume] Gemini error:", err);
    return NextResponse.json(
      { error: "AI optimization failed. Please try again." },
      { status: 502 }
    );
  }

  if (
    !Array.isArray(result.optimized_versions) ||
    result.optimized_versions.length === 0
  ) {
    return NextResponse.json(
      { error: "AI returned an unexpected response. Please try again." },
      { status: 502 }
    );
  }

  return NextResponse.json({
    optimized_versions: result.optimized_versions.slice(0, 3),
  });
}
