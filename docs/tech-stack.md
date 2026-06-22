# Tech Stack

---

## Frontend

Framework: Next.js 15 (App Router)
Language: TypeScript
Styling: Tailwind CSS
UI Components: ShadCN UI
Icons: Lucide React
Charts: Recharts (for progress indicators and score visualizations)

Design System:
- Primary font: Lora (Google Fonts) — used for all headings, logo, display text
- Body font: Libre Baskerville (Google Fonts) — used for body text and labels
- Primary color: #a67c52 (warm brown)
- Background: #f5f1e6 (warm cream)
- Card background: #fffcf5 (off-white)
- Border: #dbd0ba
- Sidebar background: #ece5d8

Responsibilities:
- Rendering all UI pages matching Stitch designs exactly
- Handling user navigation and routing
- Uploading resume files
- Displaying AI analysis results
- Showing job matches and interview questions
- Managing auth state (logged in / logged out)

---

## Backend

Runtime: Next.js API Routes (serverless functions)
Language: TypeScript

Responsibilities:
- Resume file upload and validation
- Resume text extraction (pdf-parse)
- Gemini AI API calls
- Supabase database operations
- RapidAPI job data fetching
- Authentication validation on all protected routes

---

## Database

Platform: Supabase PostgreSQL
MCP: Supabase MCP connected in Antigravity (Claude Code can read/write DB directly)

Tables:
- profiles (username, linked to auth.users)
- resumes (file_url, resume_text, ats_score)
- resume_analysis (skills, missing_keywords, strengths, suggestions)
- jobs (title, company, location, description, skills, salary)
- job_matches (resume_id, job_id, match_score)
- interview_sessions (questions, answers, score)

---

## Authentication

Provider: Supabase Auth
Methods: Email + Password
Username: saved in user_metadata at signup, displayed in dashboard

Session management:
- Supabase handles session tokens automatically
- Next.js middleware.ts protects all /dashboard/* and /upload-resume routes
- Unauthenticated users redirected to /login

---

## File Storage

Platform: Supabase Storage
Bucket: resumes
File path structure: resumes/{user_id}/{timestamp}_{filename}
Access: authenticated users only (RLS enforced)

---

## AI Processing

Provider: Google Gemini API
Model: gemini-2.0-flash
Key: GEMINI_API_KEY environment variable

Used for:
- Resume analysis and ATS scoring
- Resume bullet point optimization
- Job description alignment scoring
- Interview question generation

---

## Resume Parsing

Library: pdf-parse
Purpose: Extract raw text from uploaded PDF files
Used in: POST /api/upload-resume route

---

## External Job Data

Provider: RapidAPI JSearch
Key: RAPIDAPI_KEY environment variable
Purpose: Fetch real job listings for job matching feature

---

## Development Environment

IDE: Antigravity
AI Agent: Claude Code (Claude model via Antigravity)
MCP Servers connected:
- Stitch MCP (project ID: 15683615550063728209) — provides UI designs
- Supabase MCP — direct database access during development
Version Control: GitHub
Package Manager: npm
Runtime: Node.js

---

## Deployment

Frontend + Backend: Vercel
Database + Storage + Auth: Supabase Cloud
AI: Google Gemini API (called from Vercel serverless functions)

Environment Variables required on Vercel:
- NEXT_PUBLIC_SUPABASE_URL
- NEXT_PUBLIC_SUPABASE_ANON_KEY
- SUPABASE_SERVICE_ROLE_KEY
- GEMINI_API_KEY
- RAPIDAPI_KEY