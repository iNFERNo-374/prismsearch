# Page Flows

This document describes the complete navigation structure and user interaction flow for the PrismSearch application.

---

## Full Navigation Flow

Landing Page (/)
↓ click Log In → /login
↓ click Sign Up → /signup → redirect back to /
↓ click Upload Resume → /upload-resume
↓ after upload, click Features → /dashboard
↓ sidebar: Resume Analysis / Resume Optimizer / Job Matches / JD Alignment / Interview Prep
↓ sidebar bottom: Log Out → back to /

---

# Landing Page

Route: /

Purpose:
Introduce PrismSearch and direct users to sign up, log in, or upload their resume.

Navbar Buttons:
- Features → opens /dashboard (only works if logged in AND resume uploaded)
- How It Works → scrolls to section (future feature, not functional now)
- Team → scrolls to section (future feature, not functional now)
- Log In → navigates to /login
- Upload Resume (hero CTA button) → navigates to /upload-resume

Key Sections:
- Hero: headline + resume analysis mockup visual + Upload Resume and View Example Analysis buttons
- How It Works: 4-step process (Upload → AI Analysis → Identify Skill Gaps → Optimize Resume)
- Features grid: ATS Compatibility, Skill Detection, Keyword Gap, AI Suggestions
- Visual Insights section
- Who Is It For: Students, Career Switchers, Professionals
- CTA section: Analyze My Resume button
- Footer

State Logic:
- If user is NOT logged in: Features button redirects to /login
- If user IS logged in but no resume uploaded: Features button goes to /dashboard but sidebar is locked
- If user IS logged in AND resume uploaded: Features button opens full dashboard

Backend APIs: None (static page)

---

# Login Page

Route: /login

Purpose:
Allow existing users to sign in with email and password.

Key Components:
- "Welcome Back" heading
- Email address input field
- Password input field with Forgot? link
- LOG IN button (brown gradient)
- OR CONTINUE WITH divider
- Google button (design only, not functional for now)
- GitHub button (design only, not functional for now)
- "Don't have an account? Sign up" link → /signup

System Flow:
1. User enters email and password
2. Supabase Auth validates credentials
3. On success → redirect to / (landing page)
4. On failure → show error message below form

Backend APIs: Supabase Auth signInWithPassword

---

# Sign Up Page

Route: /signup

Purpose:
Allow new users to create an account.

Key Components:
- "Create an Account" heading
- Username input field (saved to user profile, shown in dashboard)
- Email input field
- Password input field with show/hide toggle
- Sign Up → button (brown)
- OR CONTINUE WITH divider
- Google button (design only, not functional for now)
- GitHub button (design only, not functional for now)
- "Already have an account? Log in" link → /login

System Flow:
1. User enters username, email, password
2. Supabase Auth creates user account
3. Username saved to Supabase user metadata or profiles table
4. On success → redirect to / (landing page)
5. On failure → show error message below relevant field

Backend APIs: Supabase Auth signUp

---

# Upload Resume Page

Route: /upload-resume

Purpose:
Allow logged-in users to upload their resume for AI analysis.

Key Components:
- Top navbar (same as landing page)
- "Upload Your Resume" heading + subtitle
- Upload card with dashed border
  - Upload icon
  - "Drag and drop your resume here" text
  - Supports PDF and DOCX (max 5MB)
  - Browse Files button (primary)
  - Use Sample Resume button (secondary)
- AI Features section below:
  - AI Deep Analysis card
  - ATS Score Optimization card
  - Skill Gap Detection card

System Flow:
1. User selects or drags a PDF or DOCX file
2. File validated (type + size)
3. Upload progress shown
4. File stored in Supabase Storage (resumes/{user_id}/{resume_id}.pdf)
5. Resume metadata stored in resumes table
6. Resume text extracted using pdf-parse
7. On success → navbar Features button becomes active
8. User clicks Features → navigates to /dashboard

Backend APIs: POST /api/upload-resume

State Logic:
- Page is only accessible to logged-in users
- Unauthenticated users are redirected to /login

---

# Dashboard

Route: /dashboard

Purpose:
Central hub showing a summary of all career tools and the user's progress.
Updates progressively as the user completes each feature.

Layout:
- Top navbar (PrismSearch logo + Features / How It Works / Team links + Sign In button)
- Left sidebar (w-72, fixed)
- Main content area

Sidebar Items (top to bottom):
1. Dashboard (active state highlighted)
2. Resume Analysis
3. Resume Optimizer
4. Job Matches
5. JD Alignment
6. Interview Prep
--- (separator)
7. Log Out (above Settings)
8. Settings

Welcome Section:
- "Welcome back, [username]" — username pulled from Supabase user metadata
- Italic motivational quote

Dashboard Cards (2 rows):

Row 1:
- Resume ATS Score card (circular progress indicator, score out of 100, label like "Excellent")
- Interview Preparation Progress card (3 progress bars: Behavioral Questions, Technical Knowledge, Industry Trends Analysis)

Row 2:
- Recent Resume Analysis card (list of uploaded resumes with status badges: Optimized / Review Needed / Archived)
- Suggested Job Matches card (top 2 job cards with match % and tags)

First Visit State (before any feature is used):
- ATS Score shows placeholder (e.g. "--" or 0)
- Interview progress bars show 0%
- Recent resume analysis shows uploaded resume with "Pending" status
- Job matches show placeholder text

Live Update Behavior:
- User completes Resume Analysis → ATS score card updates with real score
- User uses Interview Prep → progress bars reflect actual questions answered
- User fetches Job Matches → suggested jobs section shows real matched jobs
- Each feature tool feeds back into the dashboard summary

Backend APIs:
- GET /api/dashboard-summary (fetches latest ATS score, job matches, interview progress)

---

# Resume Analysis Page

Route: /dashboard/resume-analysis

Purpose:
Display full AI-generated insights about the uploaded resume.

Layout:
- Left column (7/12): Resume Overview card + Strength Insights card
- Right column (5/12): ATS Score gauge + Skills Detected card + Missing Keywords card

Key Components:
- Resume Overview: filename, upload date, Replace button
- Strength Insights: AI-generated paragraph about resume quality + Key Advantage + Top Opportunity highlights
- ATS Score: circular SVG gauge showing score (0-100) with "OF 100" label
- Skills Detected: skill pills (accent background, rounded)
- Missing Keywords: keyword pills with + icon (primary color), "Adding these will increase your score to X/100" note

User Actions:
- Click Replace to re-upload resume
- Click New Analysis button (top right) to trigger fresh AI analysis
- Navigate to Resume Optimizer from sidebar

System Flow:
1. Page loads → fetches existing analysis from resume_analysis table
2. If no analysis exists → shows "Run Analysis" prompt
3. User clicks New Analysis → POST /api/analyze-resume
4. AI processes resume → results stored in DB → page refreshes with real data
5. Dashboard ATS score card updates automatically

Backend APIs: POST /api/analyze-resume

---

# Resume Optimizer Page

Route: /dashboard/resume-optimizer

Purpose:
Help users improve resume bullet points and wording using AI suggestions.

Layout:
- Header: "Improve Your Resume" + Download and Share buttons
- Stats row: Score %, Keywords count, Alerts count
- Left panel (7/12): Resume preview (paper-style, shows actual resume content with weak lines highlighted)
- Right panel (5/12): AI suggestions panel

Right Panel Sections:
- Weak Bullet Points (warning icon, count badge)
  - Each weak bullet shown with AI-rewritten improved version
  - Apply button per suggestion
- Missing Keywords section
- Impact Improvements section

User Actions:
- Select weak bullet point → see AI rewrite
- Apply suggestion → updates resume preview
- Download improved resume
- Share resume

Backend APIs: POST /api/optimize-resume

---

# Job Matches Page

Route: /dashboard/job-matches

Purpose:
Show job listings matched to the user's resume with AI-calculated match scores.

Layout:
- Header: "Job Matches" + subtitle
- Filter bar: Search input + Location / Experience / Remote Only filters + Search button
- Left area (2/3): Job listing cards
- Right panel (1/3): Skill Gap Insight panel + Quick Stats

Job Card Components:
- Company icon
- Job title (serif, bold)
- Company name + location (italic)
- Match score badge (verified icon for high match, bolt icon for recent)
- Posted X days/hours ago
- Required Skills pills
- Salary + job type row
- Apply Now button

Skill Gap Insight Panel:
- Shows skills user is missing for top jobs
- "Your profile is more competitive than X% of applicants" message

User Actions:
- Search and filter jobs
- Click Apply Now on a job card
- View skill gaps in side panel

System Flow:
1. Page loads → fetches jobs from RapidAPI via /api/job-matches
2. AI calculates match scores against resume
3. Jobs ranked by match score
4. Dashboard suggested jobs section updates with top 2

Backend APIs: GET /api/job-matches

---

# Job Alignment Page

Route: /dashboard/job-alignment

Purpose:
Let users paste any job description and compare it against their resume.

Layout:
- Breadcrumb: Dashboard > Job Alignment
- Header: "Job Description Alignment" + subtitle
- Left panel (4/12): Current Resume preview (thumbnail style) + Upload New Resume button + Pro Tip
- Right panel (8/12): Job Description input + Analyze button + Results section

Results Section (appears after analysis):
- Match Score gauge (circular or progress)
- Skills Coverage: matched skills vs missing skills
- Keyword Coverage
- AI Suggestions for improvement
- Final CTA: Update Resume button

User Actions:
1. View current resume in left panel
2. Paste job description in right panel text area
3. Click Analyze button
4. View match score, matched skills, missing skills, AI suggestions

Backend APIs: POST /api/job-alignment

---

# Interview Preparation Page

Route: /dashboard/interview-prep

Purpose:
Generate AI-powered interview questions tailored to the user's resume and target role.

Layout:
- Header: "Interview Preparation" + subtitle
- Left area (2/3): Question tabs + Question cards
- Right panel (1/3): Generate Questions section + Session info

Question Tabs:
- Technical (default active)
- Behavioral
- Role Specific

Question Card Components:
- Category badge (e.g. "High Frequency", "System Design", "Frontend Architecture")
- Bookmark button
- Question text (serif, bold)
- Hint section (lightbulb icon + italic hint text)

Right Panel:
- Generate New Questions button
- Target Role input
- Session stats (questions answered, score)

User Actions:
- Click tab to switch question category
- Bookmark a question
- Expand question to write/practice answer
- Generate new set of questions
- Dashboard interview progress bars update as questions are answered

Backend APIs: POST /api/interview-questions

---

# Navigation Flow Summary

Landing Page (/)
├── Log In button → /login → on success → /
├── Sign Up button → /signup → on success → /
├── Upload Resume button → /upload-resume → on success, click Features → /dashboard
└── Features button → /dashboard (if logged in + resume uploaded)

/dashboard
├── Resume Analysis → /dashboard/resume-analysis
├── Resume Optimizer → /dashboard/resume-optimizer
├── Job Matches → /dashboard/job-matches
├── JD Alignment → /dashboard/job-alignment
├── Interview Prep → /dashboard/interview-prep
├── Log Out → clears session → /
└── Settings → /dashboard/settings (future)