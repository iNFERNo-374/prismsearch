// GET /api/job-matches?resume_id=uuid[&refresh=true]
// Process: auth → resume ownership → skills from resume_analysis
//          → cache check (24h) unless refresh=true
//          → fresh: RapidAPI JSearch → Gemini batch scoring → persist → return
// Returns: { jobs: JobMatchResponse[], cached: boolean }

import { createClient } from "@/lib/supabase/server";
import { callGemini } from "@/lib/gemini";
import { NextRequest, NextResponse } from "next/server";
import { revalidatePath } from "next/cache";

// ── Types ────────────────────────────────────────────────────────────────────

interface JSearchJob {
  job_id: string;
  job_title: string;
  employer_name: string;
  job_city: string | null;
  job_state: string | null;
  job_country: string | null;
  job_description: string;
  job_required_skills: string[] | null;
  job_highlights?: { Qualifications?: string[]; Responsibilities?: string[] };
  job_min_salary: number | null;
  job_max_salary: number | null;
  job_salary_currency: string | null;
  job_employment_type: string | null;
  job_apply_link: string;
  job_posted_at_datetime_utc: string | null;
}

interface GeminiScore {
  job_index: number;
  match_score: number;
  matched_skills: string[];
  missing_skills: string[];
}

export interface JobMatchResponse {
  job_id: string;
  title: string;
  company: string;
  location: string;
  match_score: number;
  matched_skills: string[];
  missing_skills: string[];
  salary: string | null;
  job_type: string | null;
  external_url: string;
  posted_at: string | null;
}

// ── Helpers ──────────────────────────────────────────────────────────────────

function formatSalary(
  min: number | null,
  max: number | null,
  currency: string | null
): string | null {
  if (!min && !max) return null;
  const fmt = (n: number) =>
    n >= 1000 ? `$${Math.round(n / 1000)}k` : `$${n}`;
  if (min && max) return `${fmt(min)} – ${fmt(max)}`;
  if (min) return `From ${fmt(min)}`;
  if (max) return `Up to ${fmt(max)}`;
  return null;
}

function formatJobType(raw: string | null): string | null {
  if (!raw) return null;
  const map: Record<string, string> = {
    FULLTIME: "Full-time",
    PARTTIME: "Part-time",
    CONTRACTOR: "Contract",
    INTERN: "Internship",
    TEMPORARY: "Temporary",
  };
  return map[raw.toUpperCase()] ?? raw;
}

function keywordScore(skills: string[], job: JSearchJob): GeminiScore & { job_index: number } {
  const title = job.job_title.toLowerCase();
  const description = job.job_description.toLowerCase();
  const matched = skills.filter((s) => description.includes(s.toLowerCase()));
  const missing = skills.filter((s) => !description.includes(s.toLowerCase())).slice(0, 5);
  const titleHit = skills.some((s) => title.includes(s.toLowerCase()));
  let score = 35; // minimum baseline
  if (titleHit) score += 30;
  score += matched.length * 15;
  score = Math.min(score, 95); // cap at 95 — perfect score reserved for Gemini
  return { job_index: -1, match_score: score, matched_skills: matched.slice(0, 6), missing_skills: missing };
}

function buildBatchScoringPrompt(skills: string[], jobs: JSearchJob[]): string {
  const jobList = jobs
    .map(
      (j, i) =>
        `[${i}] Title: "${j.job_title}" | Company: "${j.employer_name}"\nDescription (excerpt): "${j.job_description.slice(0, 400).replace(/\n/g, " ")}"`
    )
    .join("\n\n");

  return `You are a senior technical recruiter scoring resume-to-job fit. Score each job realistically — the way a real recruiter would assess a candidate's profile against a job posting.

Candidate skills: ${JSON.stringify(skills)}

Jobs to score:
${jobList}

Scoring guidelines (use real recruiter judgement):
- A candidate whose skills clearly match the job domain (e.g. a React developer applying to a frontend role) should score 65–85% even if not every listed skill matches exactly.
- A strong overall match where most core skills align should score 75–90%.
- Only score below 40% if the candidate's skills are genuinely irrelevant to the job domain.
- Do NOT be overly conservative — under-scoring wastes good candidates.

Return ONLY a JSON array — no markdown, no code fences, no extra text. Each element:
{
  "job_index": <number matching the [index] above>,
  "match_score": <integer 0–100>,
  "matched_skills": <string[], candidate skills directly relevant to this job, max 6>,
  "missing_skills": <string[], important skills this job requires that the candidate lacks, max 5>
}`;
}

// ── Handler ──────────────────────────────────────────────────────────────────

export async function GET(request: NextRequest) {
  // ── Auth ────────────────────────────────────────────────────────────────────
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) {
    return NextResponse.json({ error: "Unauthorized." }, { status: 401 });
  }

  // ── Input ───────────────────────────────────────────────────────────────────
  const { searchParams } = new URL(request.url);
  const resume_id = searchParams.get("resume_id");
  const refresh = searchParams.get("refresh") === "true";

  if (!resume_id) {
    return NextResponse.json({ error: "resume_id is required." }, { status: 400 });
  }

  // ── Resume ownership check ──────────────────────────────────────────────────
  const { data: resume, error: resumeErr } = await supabase
    .from("resumes")
    .select("id")
    .eq("id", resume_id)
    .eq("user_id", user.id)
    .single();

  if (resumeErr || !resume) {
    return NextResponse.json({ error: "Resume not found." }, { status: 404 });
  }

  // ── Get skills from analysis ─────────────────────────────────────────────────
  const { data: analysis } = await supabase
    .from("resume_analysis")
    .select("skills")
    .eq("resume_id", resume_id)
    .single();

  if (!analysis?.skills?.length) {
    return NextResponse.json(
      { error: "No resume analysis found. Please analyze your resume first." },
      { status: 422 }
    );
  }

  const candidateSkills: string[] = analysis.skills;

  // ── Cache check ──────────────────────────────────────────────────────────────
  if (!refresh) {
    const oneDayAgo = new Date(Date.now() - 24 * 60 * 60 * 1000).toISOString();

    const { data: cached } = await supabase
      .from("job_matches")
      .select(
        `id, match_score, matched_skills, missing_skills,
         jobs ( id, title, company, description, skills, external_url )`
      )
      .eq("resume_id", resume_id)
      .gte("created_at", oneDayAgo)
      .order("match_score", { ascending: false })
      .limit(10);

    if (cached && cached.length > 0) {
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      const jobs: JobMatchResponse[] = cached.map((m: any) => ({
        job_id: m.jobs?.id ?? m.id,
        title: m.jobs?.title ?? "Unknown",
        company: m.jobs?.company ?? "Unknown",
        location: m.jobs?.location ?? m.location ?? "Unknown",
        match_score: m.match_score,
        matched_skills: m.matched_skills ?? [],
        missing_skills: m.missing_skills ?? [],
        salary: null,
        job_type: null,
        external_url: m.jobs?.external_url ?? "#",
        posted_at: null,
      }));
      return NextResponse.json({ jobs, cached: true });
    }
  }

  // ── RapidAPI JSearch ─────────────────────────────────────────────────────────
  const rapidApiKey = process.env.RAPIDAPI_KEY;
  if (!rapidApiKey) {
    return NextResponse.json(
      { error: "Job search is not configured (missing RAPIDAPI_KEY)." },
      { status: 500 }
    );
  }

  const query = candidateSkills.slice(0, 4).join(" ") + " jobs";
  const jsearchUrl = `https://jsearch.p.rapidapi.com/search?query=${encodeURIComponent(query)}&page=1&num_pages=1&date_posted=month&country=us%2Cin`;

  let rawJobs: JSearchJob[];
  try {
    console.log("[job-matches] Fetching JSearch URL:", jsearchUrl);
    const res = await fetch(jsearchUrl, {
      headers: {
        "X-RapidAPI-Key": rapidApiKey,
        "X-RapidAPI-Host": "jsearch.p.rapidapi.com",
      },
    });
    const body = await res.text();
    console.log("[job-matches] JSearch status:", res.status);
    if (!res.ok) {
      console.error("[job-matches] JSearch error body:", body);
      return NextResponse.json({ error: "Job search API failed." }, { status: 502 });
    }
    const json = JSON.parse(body);
    console.log("[job-matches] JSearch returned", (json.data ?? []).length, "jobs");
    rawJobs = (json.data ?? []).slice(0, 6) as JSearchJob[];
  } catch (err) {
    console.error("[job-matches] JSearch fetch error:", err);
    return NextResponse.json({ error: "Failed to fetch jobs." }, { status: 502 });
  }

  if (rawJobs.length === 0) {
    return NextResponse.json({ jobs: [], cached: false });
  }

  // ── Gemini batch scoring (with retry + keyword fallback) ─────────────────────
  let scores: GeminiScore[] = [];
  let usedFallback = false;

  async function tryGeminiScore(): Promise<GeminiScore[] | null> {
    try {
      const raw = await callGemini(buildBatchScoringPrompt(candidateSkills, rawJobs));
      let parsed: unknown;
      try {
        parsed = JSON.parse(raw);
      } catch {
        console.error("[job-matches] Gemini returned invalid JSON:", raw.slice(0, 300));
        return null;
      }
      if (Array.isArray(parsed) && parsed.length > 0) {
        return parsed as GeminiScore[];
      }
      console.warn("[job-matches] Gemini returned empty/non-array");
      return null;
    } catch (err) {
      console.error("[job-matches] Gemini scoring error:", err);
      return null;
    }
  }

  const firstAttempt = await tryGeminiScore();
  if (firstAttempt) {
    scores = firstAttempt;
    console.log("[job-matches] Gemini scores (attempt 1):", scores.map((s) => `[${s.job_index}] ${s.match_score}%`).join(", "));
  } else {
    console.warn("[job-matches] Gemini attempt 1 failed, retrying in 2s…");
    await new Promise((resolve) => setTimeout(resolve, 2000));
    const secondAttempt = await tryGeminiScore();
    if (secondAttempt) {
      scores = secondAttempt;
      console.log("[job-matches] Gemini scores (attempt 2):", scores.map((s) => `[${s.job_index}] ${s.match_score}%`).join(", "));
    } else {
      console.warn("[job-matches] Both Gemini attempts failed, using keyword fallback");
      usedFallback = true;
    }
  }

  if (usedFallback) {
    scores = rawJobs.map((job, idx) => ({ ...keywordScore(candidateSkills, job), job_index: idx }));
    console.log("[job-matches] Keyword fallback scores:", scores.map((s) => `[${s.job_index}] ${s.match_score}%`).join(", "));
  }

  // ── Build + sort results ─────────────────────────────────────────────────────
  const results: JobMatchResponse[] = rawJobs
    .map((job, idx) => {
      const score = scores.find((s) => s.job_index === idx) ?? keywordScore(candidateSkills, job);
      const location = [job.job_city, job.job_state, job.job_country]
        .filter(Boolean)
        .join(", ");
      return {
        job_id: job.job_id,
        title: job.job_title,
        company: job.employer_name,
        location: location || "Remote",
        match_score: Math.max(0, Math.min(100, score.match_score)),
        matched_skills: score.matched_skills ?? [],
        missing_skills: score.missing_skills ?? [],
        salary: formatSalary(job.job_min_salary, job.job_max_salary, job.job_salary_currency),
        job_type: formatJobType(job.job_employment_type),
        external_url: job.job_apply_link,
        posted_at: job.job_posted_at_datetime_utc,
      };
    })
    .sort((a, b) => b.match_score - a.match_score);

  // Drop low-confidence matches, but only if enough pass the threshold
  const filtered = results.filter((r) => r.match_score >= 25);
  const finalResults = filtered.length >= 3 ? filtered : results;

  console.log("[job-matches] Persisting", finalResults.length, "matches (pre-filter:", results.length, ")");

  // ── Persist: delete old matches, insert fresh ────────────────────────────────
  await supabase.from("job_matches").delete().eq("resume_id", resume_id);

  for (const result of finalResults) {
    const raw = rawJobs.find((j) => j.job_id === result.job_id);
    const jobSkills: string[] =
      raw?.job_required_skills ??
      raw?.job_highlights?.Qualifications?.slice(0, 8) ??
      result.matched_skills;

    // Insert job row
    const { data: jobRow, error: jobErr } = await supabase
      .from("jobs")
      .insert({
        title: result.title,
        company: result.company,
        description: raw?.job_description?.slice(0, 2000) ?? "",
        skills: jobSkills,
        external_url: result.external_url,
      })
      .select("id")
      .single();

    if (jobErr || !jobRow) {
      console.error("[job-matches] Job insert error:", jobErr?.message);
      continue;
    }

    // Insert job_match row
    const { error: matchErr } = await supabase.from("job_matches").insert({
      resume_id,
      job_id: jobRow.id,
      match_score: result.match_score,
      matched_skills: result.matched_skills,
      missing_skills: result.missing_skills,
    });

    if (matchErr) {
      console.error("[job-matches] Match insert error:", matchErr.message);
    }
  }

  revalidatePath("/dashboard");
  return NextResponse.json({ jobs: finalResults, cached: false });
}
