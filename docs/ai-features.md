# AI Features

PrismSearch uses Google Gemini API to analyze resumes, generate suggestions, compare resumes with job descriptions, and create interview preparation content.

All AI processing is performed through backend API routes only.
The frontend never calls the AI directly.

---

## AI Model

Provider: Google Gemini API
Model: gemini-2.0-flash
API Key: stored in environment variable GEMINI_API_KEY

---

## Resume Analysis

Purpose:
Evaluate resume quality and estimate compatibility with Applicant Tracking Systems (ATS).

Input:
- resume_text (extracted from uploaded resume using pdf-parse)

AI Tasks:
- Extract technical and professional skills
- Identify keywords related to job roles
- Detect missing industry keywords
- Evaluate resume structure and clarity
- Generate overall ATS compatibility score

Output (strict JSON):
{
  "ats_score": 82,
  "skills": ["Python", "SQL", "Machine Learning"],
  "missing_keywords": ["Tableau", "Data Visualization"],
  "strengths": "Strong project experience with measurable impact",
  "suggestions": "Add quantifiable results to project descriptions"
}

Storage: results saved to resume_analysis table, ats_score updated in resumes table
Dashboard impact: ATS score card on dashboard updates with real score after analysis runs

---

## Resume Optimization

Purpose:
Improve the wording and effectiveness of resume bullet points.

Input:
- bullet_point (single bullet point text from resume)
- resume_id (for context)

AI Tasks:
- Rewrite bullet point using strong action verbs
- Add quantifiable achievements where possible
- Improve clarity and impact
- Return 3 alternative versions

Output (strict JSON):
{
  "optimized_versions": [
    "Developed a sales forecasting model using Python that improved prediction accuracy by 18%",
    "Built a data pipeline that automated reporting and reduced manual work by 40%",
    "Engineered an ML solution that increased revenue forecasting precision by 18% across 5 product lines"
  ]
}

Display: shown in Resume Optimizer right panel, user selects and applies preferred version

---

## Job Description Matching

Purpose:
Compare a resume against a job description to evaluate alignment.

Input:
- resume_text
- job_description (pasted by user)

AI Tasks:
- Extract required skills from job description
- Compare required skills with resume skills
- Calculate similarity score (0-100)
- Identify missing competencies
- Generate improvement suggestions

Output (strict JSON):
{
  "match_score": 74,
  "matched_skills": ["Python", "SQL"],
  "missing_skills": ["Tableau", "A/B Testing"],
  "suggestions": "Add experience with data visualization tools like Tableau to improve match score"
}

Display: shown in Job Alignment page results section

---

## Job Recommendation Assistance

Purpose:
Calculate match scores between resume and job listings fetched from RapidAPI.

Input:
- resume skills (from resume_analysis table)
- job listings (from RapidAPI JSearch)

AI Tasks:
- Analyze each job description
- Calculate resume-job compatibility score
- Identify skill gaps per job

Output (strict JSON):
{
  "match_score": 82,
  "matched_skills": ["Python", "SQL"],
  "missing_skills": ["Tableau"],
  "ranked": true
}

Storage: top matches saved to job_matches table
Dashboard impact: Suggested Job Matches section updates with top 2 results

---

## Interview Preparation

Purpose:
Generate interview questions tailored to the user's resume and target role.

Input:
- resume_text
- extracted skills (from resume_analysis)
- target_job_role (entered by user)

AI Tasks:
- Generate technical questions based on detected skills
- Generate behavioral questions
- Generate role-specific scenario questions
- Provide a hint for each question

Output (strict JSON):
{
  "questions": [
    {
      "category": "Technical",
      "text": "Explain the difference between normalization and standardization.",
      "hint": "Focus on when to use each method and the impact on ML model performance."
    },
    {
      "category": "Behavioral",
      "text": "Describe a time when you solved a complex data problem under pressure.",
      "hint": "Use the STAR method: Situation, Task, Action, Result."
    },
    {
      "category": "Role Specific",
      "text": "How would you validate the performance of a machine learning model?",
      "hint": "Mention cross-validation, confusion matrix, precision/recall, and business context."
    }
  ]
}

Storage: saved to interview_sessions table
Dashboard impact: Interview Preparation Progress bars update as user answers questions

---

## AI Processing Flow

1. User triggers an AI feature (analysis, optimize, align, interview)
2. Frontend calls the relevant Next.js API route
3. API route retrieves resume text from Supabase database
4. API route sends prompt + data to Gemini API
5. Gemini returns structured JSON response
6. API route validates the JSON structure
7. Results stored in Supabase database
8. Frontend displays results to user
9. Dashboard summary cards update to reflect new data

---

## Gemini Prompt Guidelines

All prompts must:
- Instruct Gemini to respond in strict JSON only with no extra text
- Define the exact JSON schema expected
- Include resume text or relevant context
- Handle edge cases (empty resume, very short text)

Example prompt structure:
"Analyze the following resume text and respond with ONLY a valid JSON object matching this exact schema: { ats_score: number, skills: string[], missing_keywords: string[], strengths: string, suggestions: string }. Resume text: [resume_text]"

---

## AI Usage Principles

- All AI processing occurs on the backend only (API routes)
- API key stored as environment variable, never exposed to frontend
- All AI responses validated before storing in database
- AI outputs always structured as JSON
- If Gemini returns invalid JSON, API route returns a 500 error with a clear message
- Gemini model used: gemini-2.0-flash (fast, capable, cost-effective)