# System Overview

## Project Name
PrismSearch

## Product Description
PrismSearch is an AI-powered resume intelligence and career preparation platform.
It helps job seekers analyze their resumes, optimize them for Applicant Tracking Systems (ATS), align them with job descriptions, discover relevant job opportunities, and prepare for interviews.

The platform uses Google Gemini API to extract insights from resumes and provide actionable suggestions to improve employability.

---

## Core Goals

- Authenticate users securely via Supabase Auth
- Allow users to upload their resume (PDF or DOCX)
- Analyze resumes using AI (ATS scoring, skill detection, keyword gaps)
- Suggest resume improvements using AI
- Match users with relevant job listings
- Compare resumes with job descriptions
- Generate interview preparation questions
- Show a live dashboard that updates as user completes each feature

---

## Target Users

- University students
- Entry-level job seekers
- Professionals looking to switch jobs
- Users preparing for interviews

---

## Key Features

### Authentication
- User signs up with username, email, and password
- User logs in with email and password
- Supabase Auth handles sessions
- Username is saved and displayed in the dashboard as "Welcome back, [username]"
- Protected routes redirect unauthenticated users to /login

### Resume Upload
- Drag and drop or browse to upload PDF or DOCX resume
- File stored in Supabase Storage
- Resume text extracted using pdf-parse
- After successful upload, user navigates to dashboard via Features button

### Resume Analysis
- AI analyzes resume text for ATS compatibility
- Generates ATS score (0-100), detected skills, missing keywords, strengths, suggestions
- Results stored in database
- Dashboard shows a summary card of the latest ATS score

### Resume Optimization
- AI rewrites weak bullet points using action verbs and quantifiable results
- User can review and apply AI suggestions
- Split layout: resume preview on left, AI suggestions on right

### Job Matching
- Job listings fetched from RapidAPI JSearch
- AI calculates match score between resume skills and job requirements
- Dashboard shows top 2 suggested job matches as a summary

### Job Description Alignment
- User pastes any job description
- AI compares resume against job description
- Returns match score, matched skills, missing skills

### Interview Preparation
- AI generates technical, behavioral, and role-specific questions
- Questions displayed in tabs (Technical / Behavioral / Role Specific)
- Each question has a hint
- Dashboard shows interview prep progress bars

### Dashboard - Live Updates
- On first visit after upload: shows example/placeholder data
- As user completes each feature tool, dashboard updates with real data:
  - Resume Analysis done → ATS score card updates with real score
  - Interview Prep used → progress bars update with real completion
  - Job Matches fetched → suggested jobs section updates
- Dashboard is the central hub reflecting the user's actual progress

---

## Application Pages

1. Landing Page (/)
2. Login Page (/login)
3. Sign Up Page (/signup)
4. Resume Upload Page (/upload-resume)
5. Dashboard (/dashboard)
6. Resume Analysis Page (/dashboard/resume-analysis)
7. Resume Optimizer Page (/dashboard/resume-optimizer)
8. Job Matches Page (/dashboard/job-matches)
9. Job Alignment Page (/dashboard/job-alignment)
10. Interview Preparation Page (/dashboard/interview-prep)

---

## System Architecture Overview

### Frontend
Next.js 15 application with React and Tailwind CSS.
Responsible for UI rendering, navigation, and user interaction.

### Backend
Next.js API routes handling all server-side logic including file upload, AI calls, database queries, and job data fetching.

### Database
Supabase PostgreSQL storing users, resumes, analysis results, job matches, and interview sessions.

### File Storage
Supabase Storage bucket named "resumes" storing uploaded resume files.

### AI Processing Layer
Google Gemini API (model: gemini-2.0-flash) used for:
- Resume text analysis
- ATS scoring
- Resume bullet point optimization
- Job description alignment
- Interview question generation

### External Job Data
Job listings retrieved from RapidAPI JSearch endpoints.

---

## High-Level User Workflow

1. User visits landing page
2. User clicks Log In or Sign Up
3. After sign up → redirected to landing page
4. User clicks Upload Resume → goes to /upload-resume
5. User uploads resume (PDF or DOCX)
6. After successful upload → user clicks Features button in navbar
7. Dashboard opens with sidebar and example/placeholder data
8. User clicks Resume Analysis in sidebar → AI analyzes resume → ATS score shown → dashboard ATS card updates
9. User clicks Resume Optimizer → AI suggests improvements
10. User clicks Job Matches → jobs fetched and matched → dashboard job cards update
11. User clicks JD Alignment → pastes job description → AI compares
12. User clicks Interview Prep → AI generates questions → dashboard progress updates
13. User logs out via Log Out button in sidebar

---

## Navigation Rules

### Public Pages (no login required)
- Landing Page (/)
- Login Page (/login)
- Sign Up Page (/signup)
- Upload Resume (/upload-resume) — accessible after login

### Protected Pages (login required)
- All /dashboard/* routes
- If unauthenticated user tries to access these → redirect to /login

### Features Button Behavior
- If user is NOT logged in → Features button does nothing or redirects to /login
- If user IS logged in but has NO resume uploaded → Features opens dashboard with sidebar disabled/locked
- If user IS logged in AND has uploaded a resume → Features opens full dashboard with all sidebar options active

### Sidebar Behavior
- Sidebar items are only clickable if resume has been uploaded
- Before upload: sidebar shows items but they are locked/greyed out
- After upload: all sidebar items become active

---

## Technology Stack Overview

Frontend: Next.js 15, React, Tailwind CSS, ShadCN UI, Lucide React
Backend: Next.js API Routes
Database: Supabase PostgreSQL
File Storage: Supabase Storage
Authentication: Supabase Auth (email + password)
AI Model: Google Gemini API (gemini-2.0-flash)
Resume Parsing: pdf-parse
Job Data: RapidAPI JSearch
Deployment: Vercel

---

## Deployment Target

Frontend: Vercel
Backend: Next.js API routes on Vercel serverless functions
Database and Storage: Supabase Cloud
AI Processing: Google Gemini API