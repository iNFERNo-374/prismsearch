# PrismSearch — Master Build Plan

This is the step-by-step execution plan for building PrismSearch.
Each chunk is a prompt to give Claude in Antigravity.
Complete each chunk fully before moving to the next.

---

## BEFORE STARTING

Tell Gemini agent in Antigravity:
"Delete all files and folders in this project EXCEPT the .env file and the docs/ folder. We are starting fresh."

Confirm the file tree is clean, then begin chunk 1.

---

## CHUNK 1 — Project Scaffold + Design System

Prompt for Claude in Antigravity:

"Initialize a Next.js 15 project with TypeScript and Tailwind CSS in this existing folder. Then set up the complete design system:

1. Configure tailwind.config.ts with these exact custom colors:
   - background: #f5f1e6
   - foreground: #4a3f35
   - primary: #a67c52
   - primary-foreground: #ffffff
   - secondary: #e2d8c3
   - secondary-foreground: #5c4d3f
   - card: #fffcf5
   - card-foreground: #4a3f35
   - muted: #ece5d8
   - muted-foreground: #7d6b56
   - accent: #d4c8aa
   - accent-foreground: #4a3f35
   - border: #dbd0ba
   - destructive: #b54a35
   - sidebar: #ece5d8

2. Set font families:
   - serif: Lora (Google Fonts)
   - sans: Libre Baskerville (Google Fonts) 
   - body fallback: Inter

3. Set border radius:
   - DEFAULT: 0.25rem
   - lg: 0.5rem
   - xl: 0.75rem
   - full: 9999px

4. Add custom box shadow:
   - aesthetic: 2px 3px 5px 0px rgba(51, 44, 37, 0.12)

5. Install ShadCN UI and configure it.

6. Create globals.css importing Lora and Libre Baskerville from Google Fonts and setting body font to Libre Baskerville, headings to Lora.

7. Install these packages: @supabase/supabase-js @supabase/ssr pdf-parse lucide-react

8. Create lib/supabase/client.ts and lib/supabase/server.ts using the env variables NEXT_PUBLIC_SUPABASE_URL and NEXT_PUBLIC_SUPABASE_ANON_KEY.

9. Create middleware.ts at root that protects these routes using Supabase session: /dashboard, /dashboard/*, /upload-resume

10. Set up the app folder structure:
    - app/(public)/layout.tsx — for landing, login, signup
    - app/(public)/page.tsx — landing page placeholder
    - app/(public)/login/page.tsx — placeholder
    - app/(public)/signup/page.tsx — placeholder
    - app/(public)/upload-resume/page.tsx — placeholder
    - app/(dashboard)/layout.tsx — for all dashboard pages
    - app/(dashboard)/dashboard/page.tsx — placeholder
    - app/(dashboard)/dashboard/resume-analysis/page.tsx — placeholder
    - app/(dashboard)/dashboard/resume-optimizer/page.tsx — placeholder
    - app/(dashboard)/dashboard/job-matches/page.tsx — placeholder
    - app/(dashboard)/dashboard/job-alignment/page.tsx — placeholder
    - app/(dashboard)/dashboard/interview-prep/page.tsx — placeholder
    - app/api/upload-resume/route.ts — placeholder
    - app/api/analyze-resume/route.ts — placeholder
    - app/api/optimize-resume/route.ts — placeholder
    - app/api/job-matches/route.ts — placeholder
    - app/api/job-alignment/route.ts — placeholder
    - app/api/interview-questions/route.ts — placeholder"

---

## CHUNK 2 — Shared Components (Navbar + Sidebar + Layouts)

Prompt for Claude in Antigravity:

"Build the two shared layout components for PrismSearch. The design uses warm beige/cream colors (#f5f1e6 background, #a67c52 primary brown, #fffcf5 card, #dbd0ba border). Fonts: Lora for headings/logo, Libre Baskerville for body.

1. Create components/navbar.tsx — the top navigation bar used on all public pages:
   - Sticky top, backdrop blur, border bottom
   - Left: 'PrismSearch' logo in Lora serif bold, primary color (#a67c52)
   - Right: Features link, How It Works link, Team link, Log In button (brown)
   - Log In links to /login
   - Features link: if user is logged in AND has resume → go to /dashboard, else → go to /login
   - Use Supabase client to check session

2. Create components/sidebar.tsx — left sidebar for all dashboard pages (width 272px):
   - Background: #ece5d8, border-right: #dbd0ba
   - Items (each with icon + label):
     1. Dashboard (grid icon)
     2. Resume Analysis (document icon)
     3. Resume Optimizer (lightning bolt icon)
     4. Job Matches (briefcase icon)
     5. JD Alignment (clipboard icon)
     6. Interview Prep (chat bubble icon)
   - Active item: white card background, shadow
   - Hover: slight translateX(4px) slide effect
   - Bottom section (separated by border-top):
     7. Log Out (door/exit icon) — calls Supabase signOut() then redirects to /
     8. Settings (gear icon)
   - If user has no resume uploaded: items 2-6 are greyed out with a lock icon and show tooltip 'Upload your resume first'

3. Create app/(public)/layout.tsx — wraps landing, login, signup, upload-resume pages. Just renders children (navbar is included per-page as needed).

4. Create app/(dashboard)/layout.tsx — wraps all dashboard pages. Renders: top navbar + sidebar on left + main content on right. Fetches username from Supabase session and passes it to child pages via context or props."

---

## CHUNK 3 — Login + Sign Up Pages

Prompt for Claude in Antigravity:

"Build the Login and Sign Up pages for PrismSearch exactly matching the Stitch designs.

Design: warm cream background (#f5f1e6), centered card (#fffcf5, rounded-xl, shadow), Lora serif headings, Libre Baskerville body, primary brown (#a67c52).

1. app/(public)/login/page.tsx:
   - Background: #f5f1e6 full screen
   - Centered white card (max-w-md)
   - 'Welcome Back' heading (Lora, bold, large)
   - 'Sign in to continue your career journey' subtitle (muted)
   - EMAIL ADDRESS label (uppercase, small, tracking-widest) + email input
   - PASSWORD label + 'Forgot?' link on same row + password input
   - LOG IN button (full width, brown gradient, uppercase, tracking-widest)
   - OR CONTINUE WITH divider
   - Google button + GitHub button (side by side, outlined, for design only - not functional)
   - 'Don't have an account? Sign up' link → /signup
   - On submit: call Supabase signInWithPassword → on success redirect to / → on error show error message

2. app/(public)/signup/page.tsx:
   - Background: #f5f1e6 full screen
   - Centered white card (max-w-md)
   - 'Create an Account' heading (Lora, bold)
   - 'Join to unlock AI career tools' subtitle
   - USERNAME label + text input (placeholder: federicovalverde)
   - EMAIL label + email input
   - PASSWORD label + password input with show/hide eye toggle button
   - Sign Up → button (full width, brown, arrow icon)
   - OR CONTINUE WITH divider
   - Google button + GitHub button (for design only)
   - 'Already have an account? Log in' link → /login
   - On submit: call Supabase signUp with email, password, and username in user_metadata → on success redirect to / → on error show error message"

---

## CHUNK 4 — Landing Page

Prompt for Claude in Antigravity:

"Build the PrismSearch landing page (app/(public)/page.tsx) exactly matching the Stitch design. Use the Navbar component we built. Design tokens: background #f5f1e6, primary #a67c52, card #fffcf5, border #dbd0ba. Fonts: Lora for headings, Libre Baskerville body.

Sections to build:

1. Navbar at top (import Navbar component)

2. Hero Section (2-column grid):
   - Left: 
     - Large serif heading: 'Understand Your Resume Like a Recruiter Does'
     - Subtitle paragraph
     - Two buttons: 'Upload Resume' (primary brown) → /upload-resume, 'View Example Analysis' (outlined)
   - Right: 
     - Resume Analysis preview card (#fffcf5, border, shadow)
     - Shows: 'Resume Analysis' title, 'LIVE PREVIEW' badge
     - ATS Score row: 'Overall ATS Score' label + '84/100' large serif number + spinning circular indicator
     - 'TOP DETECTED SKILLS' section with skill pills: Project Management, Product Strategy, Data Analysis
     - Divider
     - 'IMPROVEMENT SUGGESTIONS' with 2 bullet suggestions in italic

3. How It Works Section (centered, muted background strip):
   - Title: 'How It Works'
   - 4 steps in a row with icons: Upload Resume → AI Analysis → Identify Skill Gaps → Optimize Resume
   - Each step has icon circle, title, short description

4. Features Grid Section:
   - Title: 'Deep Insights for Better Hireability'
   - 4 feature cards: ATS Compatibility, Skill Detection, Keyword Gap, AI Suggestions

5. Visual Insights Section (2-column):
   - Left: heading 'Visual Insights for Rapid Improvement' + description + 3 checkmarks
   - Right: mockup dashboard preview image/card

6. Who Is It For Section:
   - Title: 'Who Is It For?'
   - 3 columns: Students, Career Switchers, Professionals with descriptions

7. CTA Section:
   - Centered card with: 'Improve Your Resume With AI Insight' heading
   - 'Join over 10,000 professionals...' text
   - 'Analyze My Resume' primary button

8. Footer:
   - PrismSearch logo + tagline
   - Product, Resources, Contact link columns
   - Copyright line"

---

## CHUNK 5 — Upload Resume Page

Prompt for Claude in Antigravity:

"Build the Upload Resume page (app/(public)/upload-resume/page.tsx) matching the Stitch design exactly.

Design: background #f5f1e6, card #fffcf5, primary #a67c52, border #dbd0ba. Same navbar as landing page.

1. Navbar at top (import Navbar component)

2. Main content (max-w-4xl centered):
   - Heading: 'Upload Your Resume' (Lora, serif, large, italic)
   - Subtitle: 'Let our advanced AI analyze your professional background...' (muted, italic)

3. Upload Card (#fffcf5, rounded-lg, border, shadow-aesthetic):
   - Dashed border inner area (hover changes border to primary)
   - Upload icon (large, in accent circle)
   - 'Drag and drop your resume here' heading (italic)
   - 'Supports PDF and DOCX formats (Max 5MB)' text (muted, italic)
   - Two buttons side by side:
     - 'Browse Files' (primary brown) — triggers file input
     - 'Use Sample Resume' (secondary outlined)
   - Hidden file input accepting .pdf,.docx
   - Show file name + size after selection
   - Upload button appears after file selected
   - Progress bar during upload
   - On success: green confirmation message + 'Go to Dashboard' button → /dashboard

4. AI Features Section below card:
   - Title: 'Our AI Analysis Features'
   - 3 cards in a row:
     - AI Deep Analysis (psychology icon, accent background)
     - ATS Score Optimization (analytics icon)
     - Skill Gap Detection (checklist icon)

5. Wire up to POST /api/upload-resume:
   - Send file as multipart/form-data
   - Store in Supabase Storage under resumes/{user_id}/{timestamp}.pdf
   - Save metadata to resumes table: user_id, file_url, original_filename
   - Return resume_id on success
   - Save resume_id to localStorage or Supabase for later use by other features"

---

## CHUNK 6 — Dashboard Page

Prompt for Claude in Antigravity:

"Build the Dashboard page (app/(dashboard)/dashboard/page.tsx) matching the Stitch design exactly.

Layout: full screen, sidebar on left (import Sidebar component), main content on right.

1. Welcome Section:
   - 'Welcome back, [username]' heading (Lora, bold, primary color) — username from Supabase user_metadata
   - Italic motivational quote: 'An investment in knowledge always pays the best interest. — Benjamin Franklin'

2. Stats Row (grid 3 columns):
   - Card 1: Resume ATS Score
     - Circular progress indicator (conic-gradient using primary #a67c52 for filled, #dbd0ba for empty)
     - Score number large and bold in center
     - 'EXCELLENT' label below score (or 'PENDING' if no analysis done)
     - Description text below
   - Card 2 (spans 2 cols): Interview Preparation Progress
     - 3 progress bars: Behavioral Questions (X/15), Technical Knowledge (X/20), Industry Trends Analysis (X/5)
     - Each bar: label on left, count on right, progress bar below
     - Progress bar fill: #a67c52, track: #ece5d8

3. Lists Row (grid 2 columns):
   - Card 1: Recent Resume Analysis
     - 'View All' button top right → /dashboard/resume-analysis
     - List of uploaded resumes (filename, date analyzed, status badge)
     - Status badges: Optimized (green), Review Needed (yellow), Archived (muted), Pending Analysis (default)
     - If no analysis done: show uploaded resume with 'Pending Analysis' badge
   - Card 2: Suggested Job Matches
     - 'See All' button top right → /dashboard/job-matches
     - 2 job cards (title, company, location, match %, tags)
     - If no job matches yet: show placeholder 'Upload resume to see matches'

4. First Visit State:
   - If user has never run analysis: ATS score shows '--'
   - Interview progress bars all at 0%
   - Resume list shows uploaded file with 'Pending Analysis' status
   - Job matches shows placeholder

5. Data fetching:
   - Fetch latest resume analysis from resume_analysis table
   - Fetch top 2 job matches from job_matches table
   - Fetch interview session progress from interview_sessions table
   - All fetches use Supabase client server-side"

---

## CHUNK 7 — Resume Analysis Page

Prompt for Claude in Antigravity:

"Build the Resume Analysis page (app/(dashboard)/dashboard/resume-analysis/page.tsx) matching the Stitch design.

Layout: sidebar (imported) + main content area.

1. Page Header:
   - 'Resume Analysis' heading (Lora, large, italic)
   - Subtitle: 'Comprehensive evaluation of your professional narrative and algorithmic compatibility.'
   - 'New Analysis' button (primary, with upload icon) — triggers fresh AI analysis

2. Main Grid (12 columns):
   
   Left column (7/12):
   - Resume Overview card: filename, upload date, pdf icon, Replace button
   - Strength Insights card: AI-generated italic paragraph + Key Advantage box (green) + Top Opportunity box (primary)
   
   Right column (5/12):
   - ATS Score card: 
     - 'OVERALL ATS SCORE' label (uppercase, tracking-wide, muted)
     - Circular SVG gauge (score as stroke-dashoffset on a circle)
     - Score number large in center, 'OF 100' below
     - Description text
   - Skills Detected card:
     - Skill pills (accent/30 background, border, rounded-full)
   - Missing Keywords card:
     - 'HIGH IMPACT' badge top right
     - Keyword pills with + icon (primary color background)
     - 'Adding these will increase your score to X/100' italic note

3. Wire up to POST /api/analyze-resume:
   - On 'New Analysis' click: send resume_id to API
   - API retrieves resume text from DB, sends to Gemini API
   - Gemini returns: ats_score, skills[], missing_keywords[], strengths, suggestions
   - Store in resume_analysis table
   - Update page with real data
   - Trigger dashboard ATS score card to update"

---

## CHUNK 8 — Resume Optimizer Page

Prompt for Claude in Antigravity:

"Build the Resume Optimizer page (app/(dashboard)/dashboard/resume-optimizer/page.tsx) matching the Stitch design.

Layout: sidebar + main content.

1. Header:
   - 'RESUME OPTIMIZER' label (uppercase, tracking-widest, primary, small)
   - 'Improve Your Resume' heading (Lora, large, bold)
   - Subtitle (italic, muted)
   - Download button + Share button (top right)

2. Stats Row (3 small cards):
   - Score % (large primary number)
   - Keywords count
   - Alerts count

3. Main Grid:
   
   Left panel (7/12): Resume Preview
   - Zoom in/out buttons
   - Paper-style resume (white background, A4 aspect ratio, serif font, padding)
   - Shows resume content
   - Weak bullet points highlighted with left border (primary color, light primary background)
   
   Right panel (5/12): AI Suggestions
   - Weak Bullet Points section (warning icon, count badge)
     - Each item: original bullet → AI-rewritten version → Apply button
   - Missing Keywords section
   - Impact Improvements section

4. Wire up to POST /api/optimize-resume:
   - Send resume_id + selected bullet point
   - Gemini API returns 3 optimized versions
   - Show versions in panel
   - Apply button updates the preview"

---

## CHUNK 9 — Job Matches Page

Prompt for Claude in Antigravity:

"Build the Job Matches page (app/(dashboard)/dashboard/job-matches/page.tsx) matching the Stitch design.

Layout: sidebar + main content.

1. Header:
   - 'Job Matches' heading (Lora, bold)
   - Subtitle (italic, muted)

2. Filter Bar (card with border):
   - Search input with search icon (placeholder: 'Search roles...')
   - Location dropdown button
   - Experience dropdown button
   - Remote Only toggle
   - Search button (primary)

3. Main Grid (3 columns):
   
   Left (2/3): Job Cards
   - Each job card (border, rounded, hover shadow):
     - Company icon (accent square)
     - Job title (serif, bold, hover → primary color)
     - Company + location (muted, italic)
     - Match score badge (verified icon for top match, bolt for recent)
     - 'Posted X days ago' (muted, italic)
     - Required Skills pills (background, border, italic)
     - Salary + job type row
     - Apply Now button (primary)
   
   Right (1/3): Insight Panel
   - 'Skill Gap Insights' card
   - Quick stats card ('Your profile is more competitive than X% of applicants')

4. Wire up to GET /api/job-matches:
   - Fetch jobs from RapidAPI JSearch
   - Calculate match scores using resume skills
   - Rank by match score
   - Top 2 jobs update dashboard suggested jobs section"

---

## CHUNK 10 — Job Alignment Page

Prompt for Claude in Antigravity:

"Build the Job Alignment page (app/(dashboard)/dashboard/job-alignment/page.tsx) matching the Stitch design.

Layout: sidebar + main content.

1. Breadcrumb: Dashboard > Job Alignment

2. Header:
   - 'Job Description Alignment' heading (Lora, large, bold)
   - Subtitle (italic, muted)

3. Main Grid (12 columns):
   
   Left panel (4/12):
   - 'CURRENT RESUME' label (uppercase, tracking-widest, muted)
   - Resume thumbnail card (A4 preview, hover shows 'View Full' button)
   - Upload Resume button below
   - Pro Tip box (dashed border, italic text)
   
   Right panel (8/12): Job Description Input
   - Textarea (paste job description here, large, min-height)
   - Analyze button (primary, full width)
   
   Results section (appears after analysis):
   - Match Score gauge
   - Skills Coverage (matched vs missing)
   - Keyword Coverage
   - AI Improvement Suggestions
   - 'Update Resume' CTA button

4. Wire up to POST /api/job-alignment:
   - Send resume_id + job_description text
   - Gemini API compares and returns: match_score, matched_skills[], missing_skills[], suggestions
   - Display results below the input"

---

## CHUNK 11 — Interview Prep Page

Prompt for Claude in Antigravity:

"Build the Interview Preparation page (app/(dashboard)/dashboard/interview-prep/page.tsx) matching the Stitch design.

Layout: sidebar + main content.

1. Header:
   - 'Interview Preparation' heading (Lora, bold)
   - Subtitle (italic, muted)

2. Main Grid (3 columns):
   
   Left area (2/3):
   - Question category tabs:
     - Technical (default active, primary background)
     - Behavioral
     - Role Specific
   - Question cards (for each question):
     - Category badge (e.g. 'High Frequency', 'System Design') — accent background, primary text, uppercase, tracking-wide
     - Bookmark icon button (top right)
     - Question text (Lora, bold, large)
     - Hint section: lightbulb icon + italic hint text (muted)
   
   Right panel (1/3):
   - Generate Questions section (card):
     - Target role input
     - 'Generate Questions' button (primary)
   - Session card: questions answered count, score
   - Practice Mode toggle

3. Wire up to POST /api/interview-questions:
   - Send resume_id + target_role
   - Gemini returns: questions[] with category, text, hint for each
   - Store in interview_sessions table
   - Dashboard progress bars update: count answered / total per category"

---

## CHUNK 12 — All API Routes (Backend)

Prompt for Claude in Antigravity:

"Build all the backend API routes for PrismSearch. Use Google Gemini API (model: gemini-2.0-flash) with the GEMINI_API_KEY environment variable. Use Supabase server client for database operations.

1. app/api/upload-resume/route.ts (POST):
   - Accept multipart/form-data with resume_file
   - Validate: only PDF or DOCX, max 5MB
   - Upload to Supabase Storage: resumes/{user_id}/{timestamp}_{filename}
   - Extract text using pdf-parse (for PDFs)
   - Insert to resumes table: { user_id, file_url, resume_text, original_filename }
   - Return: { resume_id, file_url }

2. app/api/analyze-resume/route.ts (POST):
   - Input: { resume_id }
   - Fetch resume_text from resumes table
   - Send to Gemini with prompt asking for JSON: { ats_score, skills[], missing_keywords[], strengths, suggestions }
   - Validate JSON response
   - Insert/upsert to resume_analysis table
   - Update ats_score in resumes table
   - Return analysis object

3. app/api/optimize-resume/route.ts (POST):
   - Input: { resume_id, bullet_point }
   - Send bullet_point to Gemini asking for 3 improved versions with action verbs and quantifiable results
   - Return: { optimized_versions: string[] }

4. app/api/job-matches/route.ts (GET):
   - Input: resume_id as query param
   - Fetch resume skills from resume_analysis table
   - Call RapidAPI JSearch with skill-based search query using RAPIDAPI_KEY
   - For each job: use Gemini to calculate match_score against resume skills
   - Store top matches in job_matches table
   - Return: { jobs: [{ job_id, title, company, location, match_score, skills[], salary, type }] }

5. app/api/job-alignment/route.ts (POST):
   - Input: { resume_id, job_description }
   - Fetch resume_text from DB
   - Send both to Gemini asking for: { match_score, matched_skills[], missing_skills[], suggestions }
   - Return alignment object

6. app/api/interview-questions/route.ts (POST):
   - Input: { resume_id, target_role }
   - Fetch resume_text and skills from DB
   - Send to Gemini asking for: { questions: [{ category, text, hint }] } — mix of technical, behavioral, role-specific
   - Insert to interview_sessions table
   - Return questions array

All routes must:
- Verify user is authenticated via Supabase session
- Return proper error responses with HTTP status codes
- Validate all inputs before processing"

---

## CHUNK 13 — Supabase Database Setup

Prompt for Claude in Antigravity:

"Generate the complete Supabase SQL setup for PrismSearch. Create a file called supabase/schema.sql with all table creation statements, RLS policies, and storage bucket setup.

Tables needed:

1. profiles (extends Supabase auth.users):
   - id uuid references auth.users primary key
   - username text
   - created_at timestamp default now()

2. resumes:
   - id uuid primary key default gen_random_uuid()
   - user_id uuid references auth.users
   - file_url text
   - resume_text text
   - original_filename text
   - ats_score integer
   - created_at timestamp default now()
   - updated_at timestamp default now()

3. resume_analysis:
   - id uuid primary key default gen_random_uuid()
   - resume_id uuid references resumes
   - skills jsonb
   - missing_keywords jsonb
   - strengths text
   - suggestions text
   - created_at timestamp default now()

4. jobs:
   - id uuid primary key default gen_random_uuid()
   - title text
   - company text
   - location text
   - description text
   - skills jsonb
   - salary text
   - source text
   - created_at timestamp default now()

5. job_matches:
   - id uuid primary key default gen_random_uuid()
   - resume_id uuid references resumes
   - job_id uuid references jobs
   - match_score integer
   - created_at timestamp default now()

6. interview_sessions:
   - id uuid primary key default gen_random_uuid()
   - user_id uuid references auth.users
   - resume_id uuid references resumes
   - questions jsonb
   - answers jsonb
   - score integer
   - created_at timestamp default now()

Enable Row Level Security on all tables.
Add RLS policies so users can only read/write their own data.
Create the resumes storage bucket with authenticated access only.
Also create a trigger that auto-creates a profiles row when a new user signs up."

---

## CHUNK 14 — Polish + Middleware + Final Wiring

Prompt for Claude in Antigravity:

"Do the final wiring and polish for PrismSearch:

1. middleware.ts: Protect /dashboard/*, /upload-resume routes. Redirect unauthenticated users to /login. Allow /login and /signup to redirect to /dashboard if already logged in.

2. Add loading states to all pages: skeleton loaders while data fetches, spinner on buttons during API calls.

3. Add toast notifications (use react-hot-toast or similar) for:
   - Upload success / failure
   - Analysis complete
   - Copy to clipboard actions

4. Sidebar lock logic: if user has no resume in DB (resumes table empty for this user), grey out Resume Analysis, Resume Optimizer, Job Matches, JD Alignment, Interview Prep. Show tooltip 'Upload your resume first'.

5. Dashboard live update: after any feature API completes, invalidate and re-fetch dashboard summary data.

6. Features navbar button logic: check session + check if resume exists → route accordingly.

7. Make all pages fully responsive for mobile and tablet.

8. Add error boundaries to prevent full page crashes.

9. Verify all environment variables are used correctly:
   - NEXT_PUBLIC_SUPABASE_URL
   - NEXT_PUBLIC_SUPABASE_ANON_KEY
   - SUPABASE_SERVICE_ROLE_KEY
   - GEMINI_API_KEY
   - RAPIDAPI_KEY"

---

## BUILD ORDER SUMMARY

| Chunk | What | Estimated Time |
|---|---|---|
| 1 | Project scaffold + design system + folder structure | Start here |
| 2 | Navbar + Sidebar + Layouts | Foundation |
| 3 | Login + Sign Up pages | Auth UI |
| 4 | Landing page | Public face |
| 5 | Upload Resume page + API | Entry point |
| 6 | Dashboard page | Core hub |
| 7 | Resume Analysis page + API | Main feature |
| 8 | Resume Optimizer page + API | Main feature |
| 9 | Job Matches page + API | Main feature |
| 10 | Job Alignment page + API | Main feature |
| 11 | Interview Prep page + API | Main feature |
| 12 | All remaining API routes | Backend |
| 13 | Supabase DB schema | Database |
| 14 | Polish + wiring + middleware | Final |

---

## IMPORTANT NOTES FOR CLAUDE IN ANTIGRAVITY

- Always match the Stitch design exactly: colors, fonts, spacing, component layout
- Primary color is always #a67c52 (brown)
- Background is always #f5f1e6 (warm cream)
- Cards are always #fffcf5
- Headings always use Lora serif font
- Body always uses Libre Baskerville
- Sidebar width is always 272px (w-72)
- All dashboard pages use the sidebar layout
- All public pages (landing, login, signup, upload) use just the top navbar
- Gemini model to use: gemini-2.0-flash
- All AI calls happen in API routes, never in frontend components
- Use Supabase RLS — never expose service role key to frontend