const MODEL = process.env.GROQ_MODEL || "openai/gpt-oss-120b";

const FALLBACK = process.env.GROQ_FALLBACK_MODEL || "openai/gpt-oss-20b";

const SYSTEM = `You are MathSolveIQ, a friendly math tutor for students (SAT, AP, O/A Level, FSc, JEE).
Rules:
- In each numbered step: first say in simple English what you do and why, then put the rule in brackets, then show the actual calculation on its own line, like 2x + 5 - 5 = 17 - 5 -> 2x = 12. Use up to 10 steps for harder problems.
- Reply in plain text only. No markdown, no LaTeX, no asterisks, no # headings.
  Write math with plain symbols like x^2, sqrt(x), pi, integral, <=, >=.
- Show numbered steps. For each step, name the rule or formula used and why.
- End a full solution with a short "Check:" line that verifies the answer.
- If the question starts with an instruction like "Give hints only" or
  "Act as a Socratic tutor", follow it strictly and do NOT reveal the final answer.
- Reply in the same language as the student's question
  (English, Urdu, Hindi or Roman Urdu).
- If the input is not a math problem, politely say you only help with math.
- If you are unsure of an answer, say so instead of guessing.`;

module.exports = async function handler(req, res) {
  if (req.method !== "POST") {
    return res.status(405).json({ answer: "Method not allowed." });
  }

    const hits = global.__msiqHits || (global.__msiqHits = new Map());
  const ip = String(req.headers["x-forwarded-for"] || "").split(",")[0].trim() || "unknown";
  const nowMs = Date.now();
  const recent = (hits.get(ip) || []).filter(function (x) { return nowMs - x < 3600000; });
  if (recent.length >= 40) {
    return res.status(429).json({ answer: "Too many requests from your connection. Please try again in a while." });
  }
  recent.push(nowMs);
  hits.set(ip, recent);
  if (hits.size > 5000) hits.clear();
  const key = process.env.GROQ_API_KEY;
  if (!key) {
    return res.status(500).json({ answer: "Server is missing GROQ_API_KEY." });
  }

  let question = "";
  try {
    const body = typeof req.body === "string" ? JSON.parse(req.body) : req.body;
    question = String((body && body.question) || "").trim();
  } catch (e) {
    return res.status(400).json({ answer: "Bad request." });
  }

  if (!question) return res.status(400).json({ answer: "Please type a problem." });
  if (question.length > 4000) {
    return res.status(400).json({ answer: "Problem is too long (max 4000 characters)." });
  }

  const t0 = Date.now();
  try {
    const r = await fetch("https://api.groq.com/openai/v1/chat/completions", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        Authorization: "Bearer " + key,
      },
      body: JSON.stringify({
        model: MODEL,
        temperature: 0.2, reasoning_effort: "low",
        max_tokens: 2000,
        messages: [
          { role: "system", content: SYSTEM },
          { role: "user", content: question },
        ],
      }),
    });

    const data = await r.json();
    console.log("Groq", MODEL, r.status, Date.now() - t0 + "ms");

    if (!r.ok) {
      const msg = (data.error && data.error.message) || "Unknown error";
      console.error("Groq error:", r.status, msg);
      if (r.status === 429) {
        return res.status(429).json({ answer: "Too many requests right now. Please try again in a minute." });
      }
            if (/model/i.test(msg) && FALLBACK !== MODEL) {
        const fb = { model: FALLBACK, temperature: 0.2, max_tokens: 2000, messages: [{ role: "system", content: SYSTEM }, { role: "user", content: question }] };
        if (FALLBACK.indexOf("openai/gpt-oss") === 0) fb.reasoning_effort = "low";
        const r2 = await fetch("https://api.groq.com/openai/v1/chat/completions", {
          method: "POST",
          headers: { "Content-Type": "application/json", Authorization: "Bearer " + key },
          body: JSON.stringify(fb),
        });
        const d2 = await r2.json();
        const a2 = ((d2.choices && d2.choices[0] && d2.choices[0].message && d2.choices[0].message.content) || "").trim();
        if (r2.ok && a2) return res.status(200).json({ answer: a2 });
      }      return res.status(502).json({ answer: "Solver error: " + msg });
    }

    const answer = (data.choices?.[0]?.message?.content || "").trim();
    return res.status(200).json({ answer: answer || "No answer returned. Try rephrasing." });
  } catch (e) {
    console.error(e);
    return res.status(500).json({ answer: "Could not reach the solver." });
  }
};