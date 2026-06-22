// POST /api/upload-resume
// Input:   multipart/form-data { resume_file: File }
// Process: auth → validate → Storage upload → pdf-parse → resumes insert
// Returns: { resume_id, file_url, message }

import { createClient } from "@/lib/supabase/server";
import { NextRequest, NextResponse } from "next/server";

const ALLOWED_TYPES = [
  "application/pdf",
  "application/vnd.openxmlformats-officedocument.wordprocessingml.document",
];
const MAX_SIZE = 5 * 1024 * 1024; // 5 MB

export async function POST(request: NextRequest) {
  // ── Auth ────────────────────────────────────────────────────────────────
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) {
    return NextResponse.json({ error: "Unauthorized. Please log in." }, { status: 401 });
  }

  // ── Parse form data ──────────────────────────────────────────────────────
  let formData: FormData;
  try {
    formData = await request.formData();
  } catch {
    return NextResponse.json({ error: "Invalid form data." }, { status: 400 });
  }

  const file = formData.get("resume_file");
  if (!file || !(file instanceof File)) {
    return NextResponse.json(
      { error: "Missing resume_file. Attach the file as resume_file in the form." },
      { status: 400 }
    );
  }

  // ── Validate type ────────────────────────────────────────────────────────
  const lowerName = file.name.toLowerCase();
  const validExt = lowerName.endsWith(".pdf") || lowerName.endsWith(".docx");
  if (!ALLOWED_TYPES.includes(file.type) && !validExt) {
    return NextResponse.json(
      { error: "Invalid file type. Only PDF and DOCX files are accepted." },
      { status: 400 }
    );
  }

  // ── Validate size ────────────────────────────────────────────────────────
  if (file.size > MAX_SIZE) {
    return NextResponse.json(
      { error: "File too large. Maximum allowed size is 5 MB." },
      { status: 400 }
    );
  }

  // ── Read buffer once — used for both Storage upload and pdf-parse ────────
  const arrayBuffer = await file.arrayBuffer();
  const fileBuffer = Buffer.from(arrayBuffer);

  // ── Upload to Supabase Storage ───────────────────────────────────────────
  const safeName = file.name.replace(/[^a-zA-Z0-9._-]/g, "_");
  const storagePath = `resumes/${user.id}/${Date.now()}_${safeName}`;

  const { error: storageError } = await supabase.storage
    .from("resumes")
    .upload(storagePath, fileBuffer, {
      contentType: file.type,
      upsert: false,
    });

  if (storageError) {
    return NextResponse.json(
      { error: `Storage upload failed: ${storageError.message}` },
      { status: 500 }
    );
  }

  // ── Get public URL ───────────────────────────────────────────────────────
  const {
    data: { publicUrl },
  } = supabase.storage.from("resumes").getPublicUrl(storagePath);

  // ── Extract text (PDF only) ──────────────────────────────────────────────
  let resumeText = "";
  const isPdf = file.type === "application/pdf" || lowerName.endsWith(".pdf");
  if (isPdf) {
    try {
      // Import via the lib sub-path to avoid pdf-parse loading its own test files
      const pdfParse = (await import("pdf-parse/lib/pdf-parse.js")).default;
      const parsed = await pdfParse(fileBuffer);
      resumeText = parsed.text ?? "";
    } catch (err) {
      // Non-fatal — text extraction failure shouldn't block the upload
      console.error("[upload-resume] pdf-parse error:", err);
    }
  }
  // DOCX text extraction is handled later by /api/analyze-resume via Gemini

  // ── Insert into resumes table ────────────────────────────────────────────
  const { data: resume, error: dbError } = await supabase
    .from("resumes")
    .insert({
      user_id: user.id,
      file_url: publicUrl,
      resume_text: resumeText,
      original_filename: file.name,
    })
    .select("id")
    .single();

  if (dbError) {
    // Roll back the Storage upload so we don't leave orphaned files
    await supabase.storage.from("resumes").remove([storagePath]);
    return NextResponse.json(
      { error: `Database error: ${dbError.message}` },
      { status: 500 }
    );
  }

  return NextResponse.json({
    resume_id: resume.id,
    file_url: publicUrl,
    message: "Resume uploaded successfully.",
  });
}
