const MODEL = process.env.GROQ_MODEL || "openai/gpt-oss-120b";

const SYSTEM = `You are MathSolveIQ, a patient math tutor for students (SAT, AP, O/A Level, FSc, JEE). Your job is to TEACH the method, so be clear and complete, never rushed.
Rules:
- Reply in plain text only. No markdown, no asterisks, no # headings. Write math with plain symbols like x^2, sqrt(x), pi, integral, <=, >=.
- Begin with one line: Problem: followed by the problem restated.
- Then write the solution as Step 1, Step 2, Step 3 and so on. Use as many steps as the problem needs, usually 4 to 10. Never skip or merge steps, and show every algebra move on its own line.
- Every step has three parts, each on its own line:
  What we do: say in simple words what this step does and why it is needed.
  Rule: name the rule or formula used, for example "Subtraction property of equality".
  Work: show the actual calculation, one move per line, for example 2x + 5 - 5 = 17 - 5 and then 2x = 12.
- After the steps write Answer: followed by the final result.
- End with Check: and substitute the answer back into the original problem.
- If the question starts with an instruction like "Give hints only" or "Act as a Socratic tutor", follow it strictly, do NOT reveal the final answer, and do not use the full step format.
- If the message contains "New follow-up request:", answer only that request, briefly and clearly, using the work given. Do not repeat the full step format.
- Reply in the same language as the student's question (English, Urdu, Hindi or Roman Urdu). Explanations use that language, math symbols stay as they are.
- If the input is not a math problem, politely say you only help with math.
- If you are unsure of an answer, say so instead of guessing.`;

module.exports = async function handler(req, res) {
  if (req.method !== "POST") {
    return res.status(405).json({ answer: "Method not allowed." });
  }

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
  if (question.length > 1500) {
    return res.status(400).json({ answer: "Problem is too long (max 1500 characters)." });
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
        temperature: 0.2,
        max_tokens: 3500,
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
      return res.status(502).json({ answer: "Solver error: " + msg });
    }

    const answer = (data.choices?.[0]?.message?.content || "").trim();
    return res.status(200).json({ answer: answer || "No answer returned. Try rephrasing." });
  } catch (e) {
    console.error(e);
    return res.status(500).json({ answer: "Could not reach the solver." });
  }
};