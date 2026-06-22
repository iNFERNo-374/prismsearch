// Thin wrapper around the Gemini REST API — no SDK dependency.
// Always requests JSON output via responseMimeType.

const GEMINI_URL =
  "https://generativelanguage.googleapis.com/v1beta/models/gemini-2.5-flash:generateContent";

export async function callGemini(prompt: string): Promise<string> {
  const apiKey = process.env.GEMINI_API_KEY;
  if (!apiKey) {
    console.error("[gemini] GEMINI_API_KEY is not set in environment variables.");
    throw new Error("GEMINI_API_KEY environment variable is not set.");
  }
  console.log(`[gemini] API key present: ${apiKey.slice(0, 4)}...${apiKey.slice(-4)} (length: ${apiKey.length})`);
  console.log(`[gemini] Calling URL: ${GEMINI_URL}`);

  const res = await fetch(`${GEMINI_URL}?key=${apiKey}`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({
      contents: [{ parts: [{ text: prompt }] }],
      generationConfig: { responseMimeType: "application/json" },
    }),
  });

  console.log(`[gemini] Response status: ${res.status} ${res.statusText}`);

  if (!res.ok) {
    const body = await res.text();
    console.error(`[gemini] Error response body: ${body}`);
    throw new Error(`Gemini API ${res.status}: ${body}`);
  }

  const data = await res.json();
  console.log("[gemini] Response candidates count:", data.candidates?.length ?? 0);
  const text: string = data.candidates?.[0]?.content?.parts?.[0]?.text ?? "";
  if (!text) {
    console.error("[gemini] Empty text in response. Full response:", JSON.stringify(data));
    throw new Error("Gemini returned an empty response.");
  }
  console.log(`[gemini] Success — response text length: ${text.length}`);
  return text;
}
