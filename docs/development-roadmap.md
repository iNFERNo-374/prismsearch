# Development Roadmap

This roadmap defines the exact build order for PrismSearch.
Each chunk is built completely before moving to the next.
UI is always built from Stitch MCP designs — never described manually.

---

## Tools Used

- Antigravity IDE with Claude Code (Claude model)
- Stitch MCP (project ID: 15683615550063728209) — provides exact UI designs
- Supabase MCP — direct database access during development
- Google Gemini API (gemini-2.0-flash) — AI processing

---

## Pre-Build Checklist

Before writing any code:
- [ ] Delete all files except .env and docs/ folder
- [ ] Confirm .env has: NEXT_PUBLIC_SUPABASE_URL, NEXT_PUBLIC_SUPABASE_ANON_KEY, SUPABASE_SERVICE_ROLE_KEY, GEMINI_API_KEY, RAPIDAPI_KEY
- [ ] Confirm Stitch MCP is connected (project 15683615550063728209)
- [ ] Confirm Supabase MCP is connected
- [ ] Set up Supabase database tables (run schema SQL)
- [ ] Create resumes storage bucket in Supabase

---

## Chunk 1 — Project Scaffold + Design System

Goal: Initialize Next.js project with correct config, fonts, colors, folder structure.

Tasks:
- Initialize Next.js 15 with TypeScript and Tailwind CSS
- Configure tailwind.config.ts with exact design tokens from Stitch
- Set up globals.css with Lora + Libre Baskerville Google Fonts
- Install packages: @supabase/supabase-js @supabase/ssr pdf-parse lucide-react
- Create lib/supabase/client.ts and lib/supabase/server.ts
- Create middleware.ts protecting /dashboard/* and /upload-resume
- Create complete app folder structure with placeholder pages
- Create components/ folder

Done when: Project runs locally at localhost:3000 with no errors

---

## Chunk 2 — Shared Components (Navbar + Sidebar)

Goal: Build the two components used across all pages.

Stitch screens referenced:
- prismsearch_landing_page_updated_nav (navbar style)
- dashboard_with_logout (sidebar with logout button)

Tasks:
- Build components/navbar.tsx from Stitch design
  - Logo, nav links, Log In button
  - Features button logic (checks session + resume status)
- Build components/sidebar.tsx from Stitch design
  - 6 nav items + Log Out + Settings
  - Active state highlighting
  - Sidebar lock logic (greyed out if no resume uploaded)
  - Log Out calls Supabase signOut() → redirect to /
- Build app/(public)/layout.tsx (navbar only)
- Build app/(dashboard)/layout.tsx (navbar + sidebar)

Done when: Both layouts render correctly with correct colors and fonts

---

## Chunk 3 — Authentication Pages

Goal: Login and signup pages working with Supabase Auth.

Stitch screens referenced:
- login_page_final_version
- sign_up_light_mode_no_terms

Tasks:
- Build app/(public)/login/page.tsx from Stitch design
  - Email + password form
  - Supabase signInWithPassword
  - Redirect to / on success
  - Error message display
- Build app/(public)/signup/page.tsx from Stitch design
  - Username + email + password form
  - Show/hide password toggle
  - Supabase signUp with username in user_metadata
  - Redirect to / on success
  - Error message display

Done when: User can sign up, log in, and be redirected correctly

---

## Chunk 4 — Landing Page

Goal: Full landing page matching Stitch design exactly.

Stitch screen referenced:
- prismsearch_landing_page_updated_nav

Tasks:
- Build app/(public)/page.tsx from Stitch design
- All sections: Hero, How It Works, Features, Visual Insights, Who Is It For, CTA, Footer
- Wire up navbar buttons: Log In → /login, Upload Resume → /upload-resume
- Features button checks session state

Done when: Landing page matches Stitch design exactly, all buttons work

---

## Chunk 5 — Upload Resume Page + API

Goal: Users can upload a resume and have it stored and parsed.

Stitch screen referenced:
- upload_resume_no_footer

Tasks:
- Build app/(public)/upload-resume/page.tsx from Stitch design
  - Drag and drop + Browse Files
  - File validation (PDF/DOCX, max 5MB)
  - Upload progress indicator
  - Success confirmation
- Build app/api/upload-resume/route.ts
  - Upload to Supabase Storage
  - Extract text with pdf-parse
  - Save to resumes table
  - Return resume_id

Done when: User can upload PDF, file appears in Supabase Storage, text extracted and saved to DB

---

## Chunk 6 — Dashboard Page

Goal: Dashboard showing user progress summary, updates as features are used.

Stitch screen referenced:
- dashboard_with_logout

Tasks:
- Build app/(dashboard)/dashboard/page.tsx from Stitch design
- Fetch username from Supabase session → "Welcome back, [username]"
- ATS Score circular progress card (real data from resumes table)
- Interview Progress bars (real data from interview_sessions)
- Recent Resume Analysis list (real data from resumes + resume_analysis)
- Suggested Job Matches (real data from job_matches)
- First visit state: placeholder/empty state when no data exists

Done when: Dashboard shows real data, updates after features are used, username displays correctly

---

## Chunk 7 — Resume Analysis Page + API

Goal: Full AI-powered resume analysis with ATS score.

Stitch screen referenced:
- analysis_dashboard_consistent_nav

Tasks:
- Build app/(dashboard)/dashboard/resume-analysis/page.tsx from Stitch design
  - Resume overview card
  - Strength insights card
  - ATS score SVG gauge
  - Skills detected pills
  - Missing keywords pills
  - New Analysis button
- Build app/api/analyze-resume/route.ts
  - Fetch resume text from DB
  - Send to Gemini API
  - Parse and store results
  - Return analysis JSON

Done when: User can run analysis, see real ATS score, dashboard card updates

---

## Chunk 8 — Resume Optimizer Page + API

Goal: AI rewrites weak bullet points.

Stitch screen referenced:
- resume_optimizer_no_footer

Tasks:
- Build app/(dashboard)/dashboard/resume-optimizer/page.tsx from Stitch design
  - Resume paper preview (left panel)
  - AI suggestions panel (right panel)
  - Weak bullet points highlighted
  - Apply suggestion button
- Build app/api/optimize-resume/route.ts
  - Send bullet point to Gemini
  - Return 3 optimized versions

Done when: User can select a weak bullet, see 3 AI rewrites, apply one

---

## Chunk 9 — Job Matches Page + API

Goal: Real job listings fetched and matched against resume.

Stitch screen referenced:
- job_matches_no_footer

Tasks:
- Build app/(dashboard)/dashboard/job-matches/page.tsx from Stitch design
  - Search + filter bar
  - Job cards with match scores
  - Skill gap insights panel
- Build app/api/job-matches/route.ts
  - Fetch from RapidAPI JSearch
  - Calculate match scores with Gemini
  - Store in job_matches table
  - Return ranked jobs

Done when: Real jobs displayed with accurate match scores, dashboard job cards update

---

## Chunk 10 — Job Alignment Page + API

Goal: User can compare their resume against any job description.

Stitch screen referenced:
- job_alignment_polished

Tasks:
- Build app/(dashboard)/dashboard/job-alignment/page.tsx from Stitch design
  - Resume thumbnail preview (left)
  - Job description textarea (right)
  - Results section with match score and skill breakdown
- Build app/api/job-alignment/route.ts
  - Send resume + JD to Gemini
  - Return match score, matched/missing skills, suggestions

Done when: User can paste a JD and get a real alignment score

---

## Chunk 11 — Interview Prep Page + API

Goal: AI generates interview questions tailored to resume and role.

Stitch screen referenced:
- interview_prep_cleaned

Tasks:
- Build app/(dashboard)/dashboard/interview-prep/page.tsx from Stitch design
  - Tab navigation: Technical / Behavioral / Role Specific
  - Question cards with category badge, text, hint
  - Generate Questions button + target role input
- Build app/api/interview-questions/route.ts
  - Send resume + target role to Gemini
  - Return categorized questions with hints
  - Store in interview_sessions table

Done when: User gets real AI-generated questions, dashboard progress bars update

---

## Chunk 12 — Supabase Database Setup

Goal: All tables created with correct schema and RLS policies.

Tasks:
- Run schema SQL in Supabase (via Supabase MCP or SQL editor):
  - Create profiles table + auto-create trigger
  - Create resumes table
  - Create resume_analysis table
  - Create jobs table
  - Create job_matches table
  - Create interview_sessions table
- Enable RLS on all tables
- Add RLS policies (users see only their own data)
- Create resumes storage bucket
- Test all policies

Done when: All tables exist, RLS works, storage bucket accessible

---

## Chunk 13 — Polish + Final Wiring

Goal: App feels complete, professional, and stable.

Tasks:
- Add loading skeleton states to all pages
- Add spinner to all action buttons during API calls
- Add toast notifications (upload success, analysis complete, errors)
- Verify sidebar lock logic works (greyed before upload, active after)
- Verify Features button logic (redirects correctly based on session + resume state)
- Verify protected routes (middleware.ts working)
- Mobile responsive fixes
- Error boundaries on all pages
- Final test of complete user journey end to end

Done when: Complete user journey works: signup → upload → dashboard → all features → logout

---

## Chunk 14 — Deployment

Goal: Live app accessible via Vercel URL.

Tasks:
- Initialize Git repository
- Push to GitHub
- Connect GitHub to Vercel
- Set all environment variables on Vercel:
  - NEXT_PUBLIC_SUPABASE_URL
  - NEXT_PUBLIC_SUPABASE_ANON_KEY
  - SUPABASE_SERVICE_ROLE_KEY
  - GEMINI_API_KEY
  - RAPIDAPI_KEY
- Deploy and verify all features work in production

Done when: App is live, all features work on production URL

---

## Build Order Summary

| # | Chunk | Stitch Screen Used |
|---|---|---|
| 1 | Project scaffold + design system | — |
| 2 | Navbar + Sidebar + Layouts | landing + dashboard_with_logout |
| 3 | Login + Signup pages | login_page_final_version + sign_up_light_mode_no_terms |
| 4 | Landing page | prismsearch_landing_page_updated_nav |
| 5 | Upload Resume page + API | upload_resume_no_footer |
| 6 | Dashboard page | dashboard_with_logout |
| 7 | Resume Analysis page + API | analysis_dashboard_consistent_nav |
| 8 | Resume Optimizer page + API | resume_optimizer_no_footer |
| 9 | Job Matches page + API | job_matches_no_footer |
| 10 | Job Alignment page + API | job_alignment_polished |
| 11 | Interview Prep page + API | interview_prep_cleaned |
| 12 | Supabase DB schema | — |
| 13 | Polish + final wiring | — |
| 14 | Deployment | — |