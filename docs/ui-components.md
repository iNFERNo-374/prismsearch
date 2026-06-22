# UI Components

This document defines all reusable UI components used throughout PrismSearch.

All components are built in Next.js with TypeScript, styled with Tailwind CSS.
UI is always built from Stitch MCP designs — never from scratch.

Stitch Project ID: 15683615550063728209

---

## Design Tokens (used across all components)

Colors:
- background: #f5f1e6 (warm cream — page background)
- foreground: #4a3f35 (dark brown — main text)
- primary: #a67c52 (warm brown — buttons, active states, headings)
- primary-foreground: #ffffff (white — text on primary buttons)
- card: #fffcf5 (off-white — card backgrounds)
- muted: #ece5d8 (light beige — sidebar background, muted areas)
- muted-foreground: #7d6b56 (medium brown — secondary text)
- accent: #d4c8aa (tan — skill pills background)
- border: #dbd0ba (warm grey — all borders)
- sidebar: #ece5d8 (sidebar background)
- destructive: #b54a35 (red — error states)

Fonts:
- Headings / Logo / Display: Lora (Google Fonts, serif)
- Body / Labels / UI text: Libre Baskerville (Google Fonts, serif)

Border Radius:
- DEFAULT: 0.25rem (4px)
- lg: 0.5rem (8px)
- xl: 0.75rem (12px)
- full: 9999px (pills)

Shadow:
- aesthetic: 2px 3px 5px 0px rgba(51, 44, 37, 0.12)

---

## Navbar (components/navbar.tsx)

Stitch reference: prismsearch_landing_page_updated_nav

Used on: all public pages (landing, login, signup, upload resume)

Layout: sticky top, backdrop blur, border-bottom border-border, height 80px

Left side:
- "PrismSearch" logo text — Lora serif, bold, text-primary (#a67c52)

Right side (desktop):
- Features link
- How It Works link
- Team link
- Log In button — primary brown, rounded, px-6 py-2

Features button behavior:
- Not logged in → redirect to /login
- Logged in, no resume → go to /dashboard (sidebar locked)
- Logged in, resume uploaded → go to /dashboard (full access)

Mobile: hamburger menu icon

---

## Sidebar (components/sidebar.tsx)

Stitch reference: dashboard_with_logout

Used on: all dashboard pages via (dashboard) layout

Width: 272px (w-72)
Background: #ece5d8
Border-right: #dbd0ba
Padding: p-6

Nav items (top section):
Each item: icon (w-5 h-5) + label text, px-4 py-3, rounded-sm

1. Dashboard — grid icon
2. Resume Analysis — document icon
3. Resume Optimizer — lightning bolt icon
4. Job Matches — briefcase icon
5. JD Alignment — clipboard icon
6. Interview Prep — chat bubble icon

Active item style: bg-card (#fffcf5), shadow-sm, border border-border
Hover style: translateX(4px) transition

Bottom section (separated by border-top):
7. Log Out — door/exit icon — calls Supabase signOut() → redirect to /
8. Settings — gear icon

Lock behavior (before resume is uploaded):
- Items 2–6 are greyed out (opacity-50)
- Cursor not-allowed
- Tooltip on hover: "Upload your resume first"
- Checked by: querying resumes table for user's resume count

---

## Public Layout (app/(public)/layout.tsx)

Used on: /, /login, /signup, /upload-resume
Renders: just the children (each page includes its own navbar)

---

## Dashboard Layout (app/(dashboard)/layout.tsx)

Used on: all /dashboard/* pages
Renders: full screen flex row — Sidebar on left + main content on right
Fetches: Supabase session → passes username to child pages

---

## Login Page (app/(public)/login/page.tsx)

Stitch reference: login_page_final_version

Full screen background: #f5f1e6
Centered card: max-w-md, bg-white, rounded-xl, shadow

Components:
- "Welcome Back" heading — Lora, bold, large
- "Sign in to continue your career journey" — muted subtitle
- EMAIL ADDRESS label (uppercase, tracking-widest, xs) + email input
- PASSWORD label + "Forgot?" link on same row + password input
- LOG IN button — full width, brown gradient, uppercase, tracking-widest
- OR CONTINUE WITH divider
- Google button + GitHub button (side by side, outlined — design only)
- "Don't have an account? Sign up" link → /signup

---

## Sign Up Page (app/(public)/signup/page.tsx)

Stitch reference: sign_up_light_mode_no_terms

Full screen background: #f5f1e6
Centered card: max-w-md, bg-white, rounded-xl, shadow

Components:
- "Create an Account" heading — Lora, bold
- "Join to unlock AI career tools" subtitle — muted
- USERNAME label + text input
- EMAIL label + email input
- PASSWORD label + password input + show/hide eye toggle button
- Sign Up → button — full width, primary brown, arrow icon
- OR CONTINUE WITH divider
- Google button + GitHub button (design only)
- "Already have an account? Log in" link → /login

---

## Upload Component (on upload-resume page)

Stitch reference: upload_resume_no_footer

Card: bg-card, rounded-lg, border, shadow-aesthetic
Inner dashed area (hover → border turns primary):
- Upload icon in accent circle (large)
- "Drag and drop your resume here" — Lora italic
- "Supports PDF and DOCX formats (Max 5MB)" — muted italic
- Browse Files button (primary)
- Use Sample Resume button (secondary outlined)
- Hidden file input: accept=".pdf,.docx"

States:
- Default: dashed border
- Hover: border-primary
- File selected: show filename + file size
- Uploading: progress bar
- Success: green confirmation + "Go to Dashboard" button

---

## Dashboard Cards

Stitch reference: dashboard_with_logout

### ATS Score Card
- Title: "Resume ATS Score"
- Circular progress (conic-gradient: primary for filled, muted for empty)
- Score number (Lora, bold, large) in center
- Label below score: "EXCELLENT" / "GOOD" / "PENDING"
- Description text below circle
- Empty state: shows "--" when no analysis run yet

### Interview Preparation Progress Card
- Title: "Interview Preparation Progress"
- 3 progress bars:
  - Behavioral Questions (X/15 Completed)
  - Technical Knowledge (X/20 Completed)
  - Industry Trends Analysis (X/5 Completed)
- Bar fill: primary (#a67c52), track: muted (#ece5d8)
- Empty state: all bars at 0%

### Recent Resume Analysis Card
- Title + "View All" button → /dashboard/resume-analysis
- List of resumes: filename, date analyzed, status badge
- Status badges:
  - Optimized: green background, green text
  - Review Needed: yellow background, yellow text
  - Archived: muted background, muted text
  - Pending Analysis: default muted style
- Empty state: uploaded resume with "Pending Analysis" badge

### Suggested Job Matches Card
- Title + "See All" button → /dashboard/job-matches
- 2 job cards: title, company + location, match %, type + salary tags
- Hover: bg-background, group-hover:underline on title
- Empty state: "Upload resume to see job matches"

---

## Resume Analysis Cards

Stitch reference: analysis_dashboard_consistent_nav

### Resume Overview Card
- Filename (bold, truncated)
- Upload date (muted, small)
- PDF icon (top right)
- File row: document icon + filename + file size + Replace button

### Strength Insights Card
- AI paragraph (Lora italic, large)
- Key Advantage box (green-50 background)
- Top Opportunity box (primary/5 background)

### ATS Score Gauge
- SVG circular gauge (stroke-dasharray / stroke-dashoffset)
- Score number (large, bold) centered
- "OF 100" label below
- Description text below gauge

### Skills Detected Card
- "SKILLS DETECTED" label (uppercase, tracking-wider)
- Skill pills: accent/20 background, border, rounded-full, text-xs

### Missing Keywords Card
- "HIGH IMPACT" badge (top right, primary text)
- Keyword pills: primary/10 background, primary/30 border, primary text, + icon
- Note: "Adding these will increase your score to X/100" (italic, muted, small)

---

## Job Card (on Job Matches page)

Stitch reference: job_matches_no_footer

Card: bg-card, border, rounded-lg, hover:shadow-aesthetic

- Company icon square (accent background, material icon)
- Job title (Lora, bold, hover → text-primary)
- Company + location (muted, italic, small)
- Match score badge (top right): verified icon for high match, bolt for recent
- "Posted X days ago" (muted, italic, small)
- Required Skills pills (background, border, italic)
- Bottom row: salary + job type (muted, italic) + Apply Now button (primary)

---

## Match Score Indicator

Used on: Resume Analysis, Job Matches, Job Alignment

Variants:
- Circular SVG gauge (ATS score, job match score)
- Linear progress bar (interview prep progress)

Circular gauge implementation:
- SVG circle with stroke-dasharray = circumference
- stroke-dashoffset = circumference × (1 - score/100)
- Primary color stroke on top of muted track

---

## Interview Question Card

Stitch reference: interview_prep_cleaned

Card: bg-card, border, rounded-lg, shadow-aesthetic, hover:opacity-95

- Category badge: accent/30 background, primary text, uppercase, tracking-wider, rounded-full, text-xs
- Bookmark icon button (top right): muted → primary on hover
- Question text: Lora, bold, large
- Hint section: lightbulb icon (primary) + italic hint text (muted)

Tab navigation (Technical / Behavioral / Role Specific):
- Active tab: primary background, white text, shadow
- Inactive tab: transparent, muted text, hover → primary text

---

## Resume Preview (Optimizer + Alignment pages)

Stitch reference: resume_optimizer_no_footer, job_alignment_polished

Paper-style container:
- White background
- A4 aspect ratio (1/1.414)
- Rounded-lg, border, shadow
- Serif font inside
- Zoom in/out controls

Weak bullet highlight:
- Left border: primary color
- Background: primary/10
- Used to indicate lines needing improvement

---

## Toast Notifications

Library: react-hot-toast (or sonner)
Position: top-right

Types:
- Success (green): "Resume uploaded successfully", "Analysis complete"
- Error (red): "Upload failed", "Analysis failed, please try again"
- Info (neutral): "Generating questions..."

---

## Loading States

Skeleton loader: muted background, animate-pulse, rounded, matches shape of real content
Button spinner: small spinner icon replaces button text during API calls
Page skeleton: full page skeleton shown while data fetches on initial load

---

## Error States

- Form errors: red text below input field, input border turns destructive (#b54a35)
- Page errors: centered card with error message + retry button
- Empty states: illustrated empty state with prompt to take action (e.g. "Run your first analysis")