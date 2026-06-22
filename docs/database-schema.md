# Database Schema

Platform: Supabase PostgreSQL
MCP: Supabase MCP connected — Claude Code can read/write DB directly during development

---

## profiles

Extends Supabase auth.users. Created automatically via trigger when user signs up.
Stores the username entered during signup.

| Field | Type | Description |
|---|---|---|
| id | uuid (PK, FK → auth.users) | matches Supabase auth user id |
| username | text | display name entered at signup, shown in dashboard |
| created_at | timestamp | account creation time |

Notes:
- Created by trigger on auth.users insert
- username read via: user.user_metadata.username (from Supabase Auth) OR from this table
- Displayed in dashboard as "Welcome back, [username]"

---

## resumes

Stores uploaded resume metadata and extracted text.

| Field | Type | Description |
|---|---|---|
| id | uuid (PK) | resume identifier |
| user_id | uuid (FK → auth.users) | owner of this resume |
| file_url | text | Supabase Storage URL |
| resume_text | text | extracted text from pdf-parse |
| original_filename | text | original uploaded filename |
| ats_score | integer | updated after analysis runs (0-100) |
| created_at | timestamp | upload time |
| updated_at | timestamp | last update time |

Notes:
- file stored at: resumes/{user_id}/{timestamp}_{filename}
- resume_text is what gets sent to Gemini for all AI features
- ats_score starts null, updated when resume analysis runs
- Used to check if user has uploaded resume (sidebar lock logic)

---

## resume_analysis

Stores AI-generated analysis results for each resume.

| Field | Type | Description |
|---|---|---|
| id | uuid (PK) | analysis record identifier |
| resume_id | uuid (FK → resumes) | which resume was analyzed |
| skills | jsonb | array of detected skills e.g. ["Python", "SQL"] |
| missing_keywords | jsonb | array of missing keywords e.g. ["Tableau"] |
| strengths | text | AI-generated strengths summary paragraph |
| suggestions | text | AI-generated improvement suggestions |
| created_at | timestamp | when analysis was run |

Notes:
- One resume can have multiple analysis records (re-analysis over time)
- Dashboard and Resume Analysis page always show the most recent record
- skills array is used by job matching feature to calculate match scores

---

## jobs

Stores job listings fetched from RapidAPI JSearch.

| Field | Type | Description |
|---|---|---|
| id | uuid (PK) | job record identifier |
| title | text | job title |
| company | text | company name |
| location | text | job location |
| description | text | full job description text |
| skills | jsonb | required skills array extracted by AI |
| salary | text | salary range (e.g. "$140k - $180k") |
| job_type | text | Full-time / Part-time / Remote / Hybrid |
| source | text | API source (e.g. "rapidapi-jsearch") |
| external_url | text | link to original job posting |
| created_at | timestamp | when job was fetched |

Notes:
- Jobs are fetched fresh from RapidAPI when user visits Job Matches page
- Old job records can be cleaned up periodically
- skills field populated by Gemini extracting required skills from description

---

## job_matches

Stores match results between a user's resume and job listings.

| Field | Type | Description |
|---|---|---|
| id | uuid (PK) | match record identifier |
| resume_id | uuid (FK → resumes) | which resume was matched |
| job_id | uuid (FK → jobs) | which job was matched |
| match_score | integer | AI-calculated compatibility score (0-100) |
| matched_skills | jsonb | skills present in both resume and job |
| missing_skills | jsonb | skills required by job but missing from resume |
| created_at | timestamp | when match was calculated |

Notes:
- Dashboard Suggested Job Matches shows top 2 records ordered by match_score desc
- Job Matches page shows all records ordered by match_score desc

---

## interview_sessions

Stores interview practice sessions and generated questions.

| Field | Type | Description |
|---|---|---|
| id | uuid (PK) | session identifier |
| user_id | uuid (FK → auth.users) | user who started session |
| resume_id | uuid (FK → resumes) | resume used for question generation |
| target_role | text | job role entered by user |
| questions | jsonb | array of { category, text, hint } objects |
| answers | jsonb | user's practice answers (optional) |
| score | integer | session performance score (optional) |
| created_at | timestamp | session creation time |

Notes:
- questions jsonb structure: [{ "category": "Technical", "text": "...", "hint": "..." }]
- Dashboard Interview Progress bars calculated from: questions answered / total questions per category
- Each new "Generate Questions" click creates a new session record

---

## Row Level Security Policies

All tables have RLS enabled.
Users can only access rows where user_id = auth.uid() (or via resume ownership chain).

profiles: users can read/update their own profile
resumes: users can read/insert/update their own resumes
resume_analysis: users can read their own analyses (via resume_id → resumes → user_id)
jobs: all authenticated users can read (jobs are not user-specific)
job_matches: users can read/insert their own matches
interview_sessions: users can read/insert their own sessions

---

## Storage

Bucket name: resumes
Access: authenticated users only
RLS: users can only read/upload files at path resumes/{their_user_id}/*

---

## Auto-created Profile Trigger

When a new user signs up via Supabase Auth, this trigger automatically creates a profiles row:

CREATE OR REPLACE FUNCTION public.handle_new_user()
RETURNS trigger AS $$
BEGIN
  INSERT INTO public.profiles (id, username)
  VALUES (new.id, new.raw_user_meta_data->>'username');
  RETURN new;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

CREATE TRIGGER on_auth_user_created
  AFTER INSERT ON auth.users
  FOR EACH ROW EXECUTE PROCEDURE public.handle_new_user();

---

## Summary of All Tables

| Table | Purpose |
|---|---|
| profiles | Username display, user identity |
| resumes | Uploaded files and extracted text |
| resume_analysis | AI analysis results per resume |
| jobs | Job listings from RapidAPI |
| job_matches | Match scores between resume and jobs |
| interview_sessions | Generated questions and user answers |