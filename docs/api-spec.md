# API Specification

All endpoints implemented as Next.js API routes in app/api/*/route.ts
All endpoints require a valid Supabase session (checked server-side)
All responses are JSON

Base URL (local): http://localhost:3000/api
Base URL (production): https://[vercel-url]/api

---

## POST /api/upload-resume

Purpose: Upload a resume file, store it, extract text, save metadata.

Input (multipart/form-data):
- resume_file: File (PDF or DOCX, max 5MB)

Process:
1. Validate file type (only .pdf or .docx allowed)
2. Validate file size (max 5MB)
3. Get authenticated user id from Supabase session
4. Upload file to Supabase Storage: resumes/{user_id}/{timestamp}_{filename}
5. Extract text from PDF using pdf-parse
6. Insert row into resumes table: { user_id, file_url, resume_text, original_filename }
7. Return resume_id and file_url

Success Response (200):
{
  "resume_id": "uuid",
  "file_url": "https://supabase-storage-url/...",
  "message": "Resume uploaded successfully"
}

Error Responses:
400 - { "error": "Invalid file type. Only PDF and DOCX allowed." }
400 - { "error": "File too large. Maximum size is 5MB." }
401 - { "error": "Unauthorized. Please log in." }
500 - { "error": "Upload failed. Please try again." }

---

## POST /api/analyze-resume

Purpose: Send resume text to Gemini AI for analysis. Returns ATS score, skills, gaps.

Input (JSON):
{
  "resume_id": "uuid"
}

Process:
1. Verify user session
2. Fetch resume_text from resumes table (verify ownership)
3. Send resume_text to Gemini with analysis prompt
4. Parse Gemini JSON response
5. Upsert into resume_analysis table
6. Update ats_score in resumes table
7. Return analysis results

Success Response (200):
{
  "ats_score": 85,
  "skills": ["Python", "SQL", "Machine Learning"],
  "missing_keywords": ["Tableau", "Data Visualization"],
  "strengths": "Strong project experience with measurable impact",
  "suggestions": "Add quantifiable metrics to achievements"
}

Error Responses:
400 - { "error": "resume_id is required" }
401 - { "error": "Unauthorized" }
404 - { "error": "Resume not found" }
500 - { "error": "AI analysis failed. Please try again." }

---

## POST /api/optimize-resume

Purpose: Send a resume bullet point to Gemini. Returns 3 improved versions.

Input (JSON):
{
  "resume_id": "uuid",
  "bullet_point": "Responsible for social media marketing and growing the community."
}

Process:
1. Verify user session
2. Validate inputs
3. Send bullet_point to Gemini with optimization prompt
4. Parse Gemini JSON response
5. Return 3 optimized versions

Success Response (200):
{
  "optimized_versions": [
    "Grew social media community by 45% in 6 months through targeted content campaigns",
    "Managed social media strategy across 4 platforms, increasing follower engagement by 38%",
    "Drove community growth from 10K to 14.5K followers by implementing data-driven content strategy"
  ]
}

Error Responses:
400 - { "error": "bullet_point is required" }
401 - { "error": "Unauthorized" }
500 - { "error": "Optimization failed. Please try again." }

---

## GET /api/job-matches

Purpose: Fetch job listings from RapidAPI and calculate match scores against resume.

Input (query params):
- resume_id: uuid

Process:
1. Verify user session
2. Fetch resume skills from resume_analysis table
3. Call RapidAPI JSearch with skill-based query
4. For each job: use Gemini to calculate match_score
5. Store top matches in job_matches table
6. Return ranked jobs

Success Response (200):
{
  "jobs": [
    {
      "job_id": "uuid",
      "title": "Senior Data Analyst",
      "company": "TechCorp",
      "location": "Remote",
      "match_score": 92,
      "matched_skills": ["Python", "SQL"],
      "missing_skills": ["Tableau"],
      "salary": "$120k - $150k",
      "job_type": "Full-time",
      "external_url": "https://..."
    }
  ]
}

Error Responses:
400 - { "error": "resume_id is required" }
401 - { "error": "Unauthorized" }
404 - { "error": "No resume analysis found. Please run Resume Analysis first." }
500 - { "error": "Job fetch failed. Please try again." }

---

## POST /api/job-alignment

Purpose: Compare resume against a pasted job description.

Input (JSON):
{
  "resume_id": "uuid",
  "job_description": "We are looking for a Senior Data Analyst with Python, SQL, and Tableau skills..."
}

Process:
1. Verify user session
2. Fetch resume_text from resumes table
3. Send resume_text + job_description to Gemini
4. Parse Gemini JSON response
5. Return alignment results

Success Response (200):
{
  "match_score": 74,
  "matched_skills": ["Python", "SQL"],
  "missing_skills": ["Tableau", "A/B Testing"],
  "suggestions": "Consider adding Tableau experience and highlight any A/B testing work in your current roles."
}

Error Responses:
400 - { "error": "job_description is required" }
401 - { "error": "Unauthorized" }
404 - { "error": "Resume not found" }
500 - { "error": "Alignment analysis failed. Please try again." }

---

## POST /api/interview-questions

Purpose: Generate categorized interview questions based on resume and target role.

Input (JSON):
{
  "resume_id": "uuid",
  "target_role": "Data Analyst"
}

Process:
1. Verify user session
2. Fetch resume_text and skills from DB
3. Send to Gemini with question generation prompt
4. Parse Gemini JSON response
5. Insert new session into interview_sessions table
6. Return questions array

Success Response (200):
{
  "session_id": "uuid",
  "questions": [
    {
      "category": "Technical",
      "text": "Explain the difference between normalization and standardization.",
      "hint": "Focus on when to use each and the impact on ML model performance."
    },
    {
      "category": "Behavioral",
      "text": "Describe a time you solved a complex data problem under pressure.",
      "hint": "Use the STAR method: Situation, Task, Action, Result."
    },
    {
      "category": "Role Specific",
      "text": "How would you validate the performance of a machine learning model?",
      "hint": "Mention cross-validation, precision/recall, and business context."
    }
  ]
}

Error Responses:
400 - { "error": "resume_id is required" }
401 - { "error": "Unauthorized" }
500 - { "error": "Question generation failed. Please try again." }

---

## Standard Error Format

All errors follow this format:
{
  "error": "Human readable error message"
}

HTTP Status Codes:
200 - Success
400 - Bad request (missing/invalid input)
401 - Unauthorized (no valid session)
404 - Resource not found
500 - Internal server error (AI or DB failure)