# PrismSearch 🔍

**PrismSearch** is an advanced, AI-powered resume intelligence and career preparation platform. It enables job seekers to analyze their resumes with recruiter-level precision, optimize bullet points, find matching job listings, align their profile against target job descriptions, and prepare for interviews with customized mock questions.

---

## 🚀 Key Features

*   **ATS Score Evaluation:** Instantly calculate an algorithmic compatibility score (out of 100) and identify strengths and suggestions.
*   **Skill Detection & Gap Analysis:** Automatically extract detected skills and highlight high-impact missing keywords.
*   **AI Bullet Point Optimizer:** Re-write weak resume bullet points into high-impact descriptions focusing on action verbs and quantifiable results (generating multiple options).
*   **Automated Job Matcher:** Retrieve relevant job openings in real-time matching the user's skill set and compute precise matching scores.
*   **JD Alignment Analyzer:** Paste any external job description to check compatibility against your active resume and receive tailor-made suggestions to increase your alignment.
*   **AI Mock Interview Prep:** Generate customized interview questions (Behavioral, Technical, and Role-Specific) complete with lightbulb hints tailored to your profile.

---

## 🛠️ Technology Stack

PrismSearch is built as a full-stack web application with modern technologies:

*   **Framework:** [Next.js 15](https://nextjs.org/) (App Router, Server Actions, Serverless API Routes)
*   **Language:** [TypeScript](https://www.typescriptlang.org/)
*   **Styling & Design System:** [Tailwind CSS](https://tailwindcss.com/) with a premium warm cream and beige aesthetic (`#f5f1e6` background, `#a67c52` primary brown, Lora & Libre Baskerville serif typography)
*   **Database & Auth:** [Supabase](https://supabase.com/) (PostgreSQL Database, Auth, Row Level Security, and Storage Buckets for PDF uploads)
*   **AI Processing:** [Google Gemini 2.5 Flash](https://ai.google.dev/) (via REST API for strict JSON schemas)
*   **Job Search Integration:** RapidAPI JSearch
*   **Document Parsing:** `pdf-parse` (for server-side PDF text extraction)

---

## 📁 Repository Structure

```
├── app/
│   ├── (dashboard)/       # Layout & pages for protected dashboard routes
│   ├── (public)/          # Layout & pages for landing, auth (login/signup), and upload
│   ├── api/               # Serverless API routes (upload-resume, analyze-resume, etc.)
│   ├── globals.css        # Font imports & custom CSS variables
│   └── layout.tsx         # Root html layout wrapper
├── components/            # Shared UI components (Navbar, Sidebar, Toast notifications)
├── docs/                  # Project specifications, schemas, build plans, and features
├── lib/                   
│   ├── supabase/          # Browser and Server Supabase clients
│   └── gemini.ts          # Gemini REST API wrapper
├── middleware.ts          # Protected route session-handling & redirects
├── tailwind.config.ts     # Curated color tokens & custom shadow configs
└── package.json           # Project dependencies & scripts
```

---

## ⚙️ Environment Setup

To run the application locally, create a `.env.local` file in the root directory and add the following keys:

```env
# Supabase Configuration
NEXT_PUBLIC_SUPABASE_URL=your_supabase_url
NEXT_PUBLIC_SUPABASE_ANON_KEY=your_supabase_anon_key
SUPABASE_SERVICE_ROLE_KEY=your_supabase_service_role_key

# Google Gemini API Configuration
GEMINI_API_KEY=your_gemini_api_key

# RapidAPI Configuration (for JSearch job listings)
RAPIDAPI_KEY=your_rapidapi_key
```

---

## ⚡ Setup & Installation

Follow these steps to run the application locally:

### 1. Clone the Repository & Install Dependencies

```bash
git clone https://github.com/iNFERNo-374/prismsearch.git
cd prismsearch
npm install
```

### 2. Configure the Database & Storage

Set up the required tables and storage bucket on your Supabase dashboard:

*   **Storage Bucket:** Create an authenticated-only bucket named `resumes`.
*   **Database Schema:** Create the following tables (refer to [docs/database-schema.md](docs/database-schema.md) for full details):
    1.  `profiles` (linked to `auth.users`)
    2.  `resumes` (linked to `profiles`)
    3.  `resume_analysis`
    4.  `jobs`
    5.  `job_matches`
    6.  `interview_sessions`
*   Ensure **Row Level Security (RLS)** is enabled on all tables so that users can only read and write their own data.
*   Enable a trigger on `auth.users` to automatically create a row in the `profiles` table upon sign-up.

### 3. Run the Development Server

```bash
npm run dev
```

Open [http://localhost:3000](http://localhost:3000) in your browser to see the application in action.

---

## 📦 Scripts

- `npm run dev` - Starts the development server at `localhost:3000`
- `npm run build` - Compiles the production build
- `npm run start` - Starts the production server
- `npm run lint` - Runs ESLint to check for code quality issues
