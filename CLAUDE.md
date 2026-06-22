# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## Project Status

PrismSearch is in **pre-build phase**. The `docs/` folder contains complete specifications. No source code exists yet. Implementation follows the 14-chunk build plan in `docs/build-plan.md` — complete each chunk fully before moving to the next.

## Commands

Once the project is scaffolded (CHUNK 1), these are the standard commands:

```bash
npm run dev      # Start dev server at localhost:3000
npm run build    # Production build
npm run start    # Start production server
npm run lint     # Run ESLint
```

Install command (from CHUNK 1):
```bash
npx create-next-app@latest . --typescript --tailwind --app --no-src-dir
npm install @supabase/supabase-js @supabase/ssr pdf-parse lucide-react recharts
npx shadcn@latest init
```

## Architecture

**Full-stack Next.js 15 (App Router)** — frontend and backend in one codebase, deployed to Vercel.

### Route Groups & Layout Structure

```
app/
├── (public)/layout.tsx        ← Navbar only; wraps /, /login, /signup, /upload-resume
├── (dashboard)/layout.tsx     ← Navbar + sidebar; wraps all /dashboard/* pages
├── api/                       ← Serverless API routes (all require Supabase session)
├── layout.tsx                 ← Root layout (Google Fonts, globals)
└── globals.css

components/
├── navbar.tsx
├── sidebar.tsx
└── ui/                        ← ShadCN UI components

lib/
├── supabase/client.ts         ← Browser Supabase client
├── supabase/server.ts         ← Server-side Supabase client (for API routes)
└── gemini.ts                  ← Gemini API client

middleware.ts                  ← Protects /dashboard/* and /upload-resume; redirects unauthenticated users to /login
```

### API Routes

Every API route must: verify Supabase session → validate input → perform operation → return JSON.

| Route | Method | Purpose |
|---|---|---|
| `/api/upload-resume` | POST | File upload → pdf-parse → save to Supabase Storage + resumes table |
| `/api/analyze-resume` | POST | Send resume_text to Gemini → save to resume_analysis table |
| `/api/optimize-resume` | POST | Send bullet point to Gemini → return 3 improved versions |
| `/api/job-matches` | GET | Fetch from RapidAPI → Gemini scores each job → save to job_matches |
| `/api/job-alignment` | POST | Send resume + job description to Gemini → return alignment score |
| `/api/interview-questions` | POST | Send resume + target role to Gemini → save to interview_sessions |

### AI Layer

- **Model:** `gemini-2.0-flash` via `GEMINI_API_KEY`
- All Gemini prompts must request **strict JSON output only**
- Validate Gemini response before storing in database

### Database (Supabase PostgreSQL)

RLS is enabled on all tables — users can only access their own data.

| Table | Key fields |
|---|---|
| `profiles` | id (FK → auth.users), username |
| `resumes` | user_id, file_url, resume_text, ats_score |
| `resume_analysis` | resume_id, skills (jsonb), missing_keywords (jsonb), strengths, suggestions |
| `jobs` | title, company, description, skills (jsonb), external_url |
| `job_matches` | resume_id, job_id, match_score, matched_skills (jsonb), missing_skills (jsonb) |
| `interview_sessions` | user_id, resume_id, target_role, questions (jsonb: [{category, text, hint}]) |

The `profiles` row is auto-created by a trigger on `auth.users` insert that reads `raw_user_meta_data->>'username'`.

### Authentication

- Supabase Auth (email + password)
- Username saved in `user_metadata` at signup: `{ username: "..." }`
- Retrieved in dashboard as `user.user_metadata.username`
- `SUPABASE_SERVICE_ROLE_KEY`, `GEMINI_API_KEY`, and `RAPIDAPI_KEY` are **server-side only** — never expose in frontend

### File Storage

- Bucket: `resumes`
- Path pattern: `resumes/{user_id}/{timestamp}_{filename}`
- Accepted: PDF/DOCX, max 5MB

## Design System

Defined in `tailwind.config.ts`:

| Token | Value |
|---|---|
| `background` | `#f5f1e6` (warm cream) |
| `primary` | `#a67c52` (warm brown) |
| `card` | `#fffcf5` (off-white) |
| `sidebar` | `#ece5d8` (light beige) |
| `border` | `#dbd0ba` |
| `muted` | `#ece5d8` |

- **Headings/Logo font:** Lora (Google Fonts, serif)
- **Body font:** Libre Baskerville (Google Fonts, serif)
- **Box shadow:** `aesthetic: 2px 3px 5px 0px rgba(51, 44, 37, 0.12)`

## Key Docs

- `docs/build-plan.md` — 14 implementation chunks with exact prompts
- `docs/api-spec.md` — Full request/response contracts for all API routes
- `docs/page-flows.md` — Page-by-page user flow and UI behavior
- `docs/ui-components.md` — Component specs
- `docs/auth-flow.md` — Signup/login/session flow details
- `docs/ai-features.md` — Gemini prompt templates and expected JSON schemas
