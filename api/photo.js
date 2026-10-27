const MODEL = process.env.GEMINI_MODEL || "gemini-2.5-flash";

const PROMPT = "Read the math problem in this image or PDF and copy it as plain text. " +
  "Use plain symbols like x^2, sqrt(x), pi, <=, >=. Keep every number, sign and variable exactly as written. " +
  "If there are several numbered problems, copy them all, one per line. " +
  "Do NOT solve it and do NOT explain. If there is no math problem, reply exactly: NO_MATH";

module.exports = async function handler(req, res) {
  if (req.method !== "POST") {
    return res.status(405).json({ error: "Method not allowed." });
  }

    const hits = global.__msiqPhotoHits || (global.__msiqPhotoHits = new Map());
  const ip = String(req.headers["x-forwarded-for"] || "").split(",")[0].trim() || "unknown";
  const nowMs = Date.now();
  const recent = (hits.get(ip) || []).filter(function (x) { return nowMs - x < 3600000; });
  if (recent.length >= 15) {
    return res.status(429).json({ answer: "Too many requests from your connection. Please try again in a while." });
  }
  recent.push(nowMs);
  hits.set(ip, recent);
  if (hits.size > 5000) hits.clear();
  const key = process.env.GEMINI_API_KEY;
  if (!key) {
    return res.status(500).json({ error: "Server is missing GEMINI_API_KEY." });
  }

  let mime = "";
  let data = "";
  try {
    const body = typeof req.body === "string" ? JSON.parse(req.body) : req.body;
    mime = String((body && body.mime) || "");
    data = String((body && body.data) || "");
  } catch (e) {
    return res.status(400).json({ error: "Bad request." });
  }

  const okTypes = ["image/jpeg", "image/png", "image/webp", "application/pdf"];
  if (!okTypes.includes(mime) || !data) {
    return res.status(400).json({ error: "Please upload a photo or a PDF." });
  }
  if (data.length > 4000000) {
    return res.status(413).json({ error: "File is too large." });
  }

  try {
    const r = await fetch(
      "https://generativelanguage.googleapis.com/v1beta/models/" + encodeURIComponent(MODEL) + ":generateContent",
      {
        method: "POST",
        headers: { "Content-Type": "application/json", "x-goog-api-key": key },
        body: JSON.stringify({
          contents: [{ parts: [{ text: PROMPT }, { inline_data: { mime_type: mime, data: data } }] }],
          generationConfig: { temperature: 0, maxOutputTokens: 3000 },
        }),
      }
    );

    const j = await r.json();
    if (!r.ok) {
      const msg = (j.error && j.error.message) || "Unknown error";
      console.error("Gemini error:", r.status, msg);
      return res.status(502).json({ error: "Reader error: " + msg });
    }

    const parts = (j.candidates && j.candidates[0] && j.candidates[0].content && j.candidates[0].content.parts) || [];
    const text = parts.map(function (p) { return p.text || ""; }).join("").trim();

    if (!text || text === "NO_MATH") {
      return res.status(422).json({ error: "No math problem found. Try a clearer photo." });
    }
    return res.status(200).json({ text: text });
  } catch (e) {
    console.error(e);
    return res.status(500).json({ error: "Could not reach the reader." });
  }
};