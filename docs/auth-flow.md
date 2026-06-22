# Authentication Flow

This document describes the complete authentication system for PrismSearch.

---

## Auth Provider

Supabase Auth (email + password)

---

## User Data Stored on Sign Up

| Field | Where Stored | Purpose |
|---|---|---|
| email | Supabase Auth | Login identifier |
| password | Supabase Auth (hashed) | Login credential |
| username | Supabase user_metadata | Displayed in dashboard as "Welcome back, [username]" |
| id (uuid) | Supabase Auth | Links to all other tables |

---

## Sign Up Flow

1. User visits /signup
2. Fills in: Username, Email, Password
3. Frontend calls Supabase signUp({ email, password, options: { data: { username } } })
4. Supabase creates user account and stores username in user_metadata
5. On success → redirect to / (landing page)
6. On error → display error message (e.g. "Email already in use")

---

## Login Flow

1. User visits /login
2. Fills in: Email, Password
3. Frontend calls Supabase signInWithPassword({ email, password })
4. Supabase returns session token
5. On success → redirect to / (landing page)
6. On error → display error message (e.g. "Invalid credentials")

---

## Logout Flow

1. User clicks Log Out in sidebar
2. Frontend calls Supabase signOut()
3. Session cleared
4. Redirect to / (landing page)

---

## Protected Routes (Middleware)

The following routes require authentication.
If user is not logged in and tries to access them, they are redirected to /login:

- /dashboard
- /dashboard/resume-analysis
- /dashboard/resume-optimizer
- /dashboard/job-matches
- /dashboard/job-alignment
- /dashboard/interview-prep
- /upload-resume

Implementation: Next.js middleware.ts checks Supabase session on every request to protected routes.

---

## Username Display in Dashboard

After login, the dashboard reads the username from Supabase user session:

const { data: { user } } = await supabase.auth.getUser()
const username = user?.user_metadata?.username

Displayed as: "Welcome back, [username]"

---

## Session Persistence

Supabase Auth automatically persists the session in localStorage.
On page refresh, the session is restored and the user stays logged in.
The Features button on the landing page checks for an active session to determine its behavior.

---

## Features Button State Logic

| User State | Features Button Behavior |
|---|---|
| Not logged in | Redirects to /login |
| Logged in, no resume | Goes to /dashboard, sidebar items locked/greyed |
| Logged in, resume uploaded | Goes to /dashboard, full sidebar active |

---

## Sidebar Lock Logic

Before resume is uploaded:
- Sidebar renders all items
- Items are visually greyed out with a lock indicator
- Clicking locked items shows a prompt: "Upload your resume first"

After resume is uploaded:
- All sidebar items become fully clickable
- Dashboard shows real data as user completes each tool