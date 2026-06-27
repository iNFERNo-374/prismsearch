# System Architecture

---

## Overview

PrismSearch is a Next.js 15 full-stack application using the App Router.
Frontend and backend live in the same codebase.
Supabase handles database, file storage, and authentication.
Google Gemini API handles all AI processing.
RapidAPI JSearch provides job listing data.

---

## Architecture Diagram

User Browser
↓
Next.js Frontend (App Router pages)
↓
Next.js API Routes (/app/api/*)
↓
┌─────────────────────────────────────┐
│  Supabase                           │
│  - PostgreSQL (data)                │
│  - Storage (resume files)           │
│  - Auth (user sessions)             │
└─────────────────────────────────────┘
↓
Google Gemini API (AI processing)
↓
RapidAPI JSearch (job listings)

---

## Route Structure

Public routes (no auth required):
- / → Landing page
- /login → Login page
- /signup → Sign up page
- /upload-resume → Upload resume page (auth recommended but accessible)

Protected routes (auth required, handled by middleware.ts):
- /dashboard → Main dashboard
- /dashboard/resume-analysis → Resume analysis tool
- /dashboard/resume-optimizer → Resume optimizer tool
- /dashboard/job-matches → Job matches tool
- /dashboard/job-alignment → Job alignment tool
- /dashboard/interview-prep → Interview preparation tool

API routes (all require valid Supabase session):
- POST /api/upload-resume
- POST /api/analyze-resume
- POST /api/optimize-resume
- GET /api/job-matches
- POST /api/job-alignment
- POST /api/interview-questions

---

## Layout Structure

app/
├── (public)/               ← Public layout group (just navbar)
│   ├── layout.tsx          ← Wraps: landing, login, signup, upload
│   ├── page.tsx            ← Landing page /
│   ├── login/page.tsx      ← /login
│   ├── signup/page.tsx     ← /signup
│   └── upload-resume/page.tsx ← /upload-resume
│
├── (dashboard)/            ← Dashboard layout group (navbar + sidebar)
│   ├── layout.tsx          ← Wraps all dashboard pages, renders sidebar
│   └── dashboard/
│       ├── page.tsx                    ← /dashboard
│       ├── resume-analysis/page.tsx    ← /dashboard/resume-analysis
│       ├── resume-optimizer/page.tsx   ← /dashboard/resume-optimizer
│       ├── job-matches/page.tsx        ← /dashboard/job-matches
│       ├── job-alignment/page.tsx      ← /dashboard/job-alignment
│       └── interview-prep/page.tsx     ← /dashboard/interview-prep
│
├── api/                    ← Backend API routes
│   ├── upload-resume/route.ts
│   ├── analyze-resume/route.ts
│   ├── optimize-resume/route.ts
│   ├── job-matches/route.ts
│   ├── job-alignment/route.ts
│   └── interview-questions/route.ts
│
├── layout.tsx              ← Root layout (fonts, globals)
└── globals.css             ← Global styles, font imports

components/
├── navbar.tsx              ← Top navigation bar (used on all pages)
├── sidebar.tsx             ← Left sidebar (used on all dashboard pages)
└── ui/                     ← ShadCN UI components

lib/
├── supabase/
│   ├── client.ts           ← Browser Supabase client
│   └── server.ts           ← Server Supabase client (for API routes)
└── gemini.ts               ← Gemini API client setup

middleware.ts               ← Protects /dashboard/* and /upload-resume routes

---

## Frontend Layer

Framework: Next.js 15 with App Router
All pages built from Stitch MCP designs (exact HTML/CSS converted to Next.js + Tailwind)

Two layout groups:
1. (public) layout — renders just the top navbar
2. (dashboard) layout — renders top navbar + left sidebar (w-72)

State management:
- Supabase session stored automatically by @supabase/ssr
- Resume upload state tracked in Supabase DB (not localStorage)
- Dashboard data fetched server-side on each page load

---

## API Layer

All API routes are in app/api/*/route.ts
Every route:
1. Verifies Supabase session (rejects if unauthenticated)
2. Validates input
3. Performs operation (DB query, AI call, file upload)
4. Returns JSON response
5. Returns proper HTTP status codes on error

---

## AI Processing Layer

All AI calls made from API routes using Gemini API client (lib/gemini.ts)
Model: gemini-2.0-flash
All prompts instruct Gemini to return strict JSON only
Responses validated before storing in database

AI features:
- Resume analysis → ATS score, skills, keywords, strengths, suggestions
- Resume optimization → 3 improved bullet point versions
- Job alignment → match score, matched/missing skills
- Interview questions → categorized questions with hints

---

## Database Layer

Platform: Supabase PostgreSQL
All queries use Supabase JS client
Row Level Security enabled on all tables
Users can only read/write their own data

Tables:
profiles, resumes, resume_analysis, jobs, job_matches, interview_sessions

---

## Storage Layer

Platform: Supabase Storage
Bucket: resumes
Path: resumes/{user_id}/{timestamp}_{filename}
RLS: users can only access their own files

---

## Authentication Layer

Provider: Supabase Auth
Middleware: middleware.ts runs on every request to protected routes
- Checks for valid Supabase session
- Redirects to /login if no session found
- Redirects to /dashboard if logged-in user visits /login or /signup

Username flow:
- Saved in user_metadata at signup: { username: "johndoe" }
- Read in dashboard: user.user_metadata.username
- Displayed as: "Welcome back, [username]"

---

## Security Considerations

- NEXT_PUBLIC_* env vars: safe to expose (Supabase URL and anon key)
- SUPABASE_SERVICE_ROLE_KEY: server-side only, never in frontend
- GEMINI_API_KEY: server-side only, only used in API routes
- RAPIDAPI_KEY: server-side only, only used in API routes
- All file uploads validated for type (PDF/DOCX) and size (max 5MB)
- RLS policies ensure users cannot access other users' data
- All API routes verify session before processing

---

## Data Flow — Complete User Journey

1. User signs up → username + email + password → Supabase Auth creates user + saves username in metadata
2. User logs in → Supabase session created → redirect to landing page
3. User uploads resume → file → Supabase Storage → pdf-parse extracts text → saved to resumes table
4. User clicks Features → middleware checks session → /dashboard opens
5. User runs Resume Analysis → API sends resume_text to Gemini → results saved to resume_analysis table → dashboard ATS card updates
6. User runs Resume Optimizer → API sends bullet point to Gemini → 3 suggestions returned
7. User fetches Job Matches → API calls RapidAPI → Gemini scores each job → top matches saved to job_matches table → dashboard job cards update
8. User runs Job Alignment → API sends resume + JD to Gemini → alignment score returned
9. User generates Interview Questions → API sends resume + target role to Gemini → questions saved to interview_sessions → dashboard progress bars update
10. User logs out → Supabase session cleared → redirect to landing page 