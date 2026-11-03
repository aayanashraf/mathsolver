/* MathSolveIQ: builds the Word Problem Solver page (needs calc3.js and calc5.js next to this file).
   Usage (from the project folder, with calc3.js, calc5.js and this file placed in it):
     node build-calc5.js            -> writes calculator/word-problem-solver.html, copies js/calc3.js and js/calc5.js, adds the sitemap entry
     node build-calc5.js --force    -> also overwrites pages that already exist
   Files are written as UTF-8 without BOM. */
const fs = require("fs");
const path = require("path");

const ROOT = process.cwd();
const SITE = "https://mathsolveiq.vercel.app";
const FORCE = process.argv.includes("--force");
global.window = {};
require(path.join(__dirname, "calc3.js"));
require(path.join(__dirname, "calc5.js"));

const STYLE = "body{padding-left:0}.doc{max-width:760px;margin:0 auto;padding:24px 16px 60px}.doc h1{font:700 32px/1.2 Georgia,serif;margin:12px 0 6px}.doc h2{font:700 21px/1.3 Georgia,serif;margin:28px 0 8px}.top{display:flex;justify-content:space-between;gap:10px;flex-wrap:wrap}.top a{color:var(--acc);text-decoration:none;font-weight:600}label{display:block;font-weight:600;margin:0 0 4px;font-size:14px}table{border-collapse:collapse;width:100%;margin-top:6px}th,td{border:1px solid var(--line);padding:4px 8px;text-align:left}.crumb{color:var(--mute);font-size:14px}.rel a{display:inline-block;margin:4px 8px 0 0;padding:6px 12px;border-radius:999px;background:var(--acc2);color:var(--acc);text-decoration:none}";

const NAMES = {
  percentage: "Percentage Calculator", "solve-for-x": "Solve for X Calculator", "word-problem-solver": "Word Problem Solver",
  factoring: "Factoring Calculator", derivative: "Derivative Calculator", integral: "Integral Calculator",
  determinant: "Determinant Calculator", "inverse-matrix": "Inverse Matrix Calculator",
  "quadratic-equation": "Quadratic Equation Calculator", logarithm: "Logarithm Calculator",
  simplify: "Simplify Expression Calculator", "function-composition": "Function Composition Calculator",
  "partial-derivative": "Partial Derivative Calculator", "implicit-differentiation": "Implicit Differentiation Calculator",
  eigenvalue: "Eigenvalue Calculator", "taylor-series": "Taylor Series Calculator",
  "series-convergence": "Series Convergence Calculator", "inverse-function": "Inverse Function Calculator",
  "domain-and-range": "Domain and Range Calculator", "rational-expression": "Rational Expression Calculator"
};

const PAGES = [
  {
    slug: "word-problem-solver", name: "Word Problem", title: "Word Problem Solver with Steps – MathSolveIQ", h1: "Word Problem Solver",
    desc: "Guided solver for 12 kinds of word problems: speed and distance, percentages, interest, ages, work rates, number problems and more, with the equation and every step.",
    about: "Most word problems follow a small number of patterns. Choose the pattern, put the numbers from your problem into the boxes, and the solver writes the equation, solves it step by step and checks the answer. Each type is explained in the guide below.",
    how: ["Choose the type of problem that matches yours.", "Fill in Value 1, 2, 3 (and 4 if the type uses it) with the numbers from your problem, using the guide below. Leave a box blank only when the type says it is optional or is the one to find.", "Read the equation that is set up, each solving step and the check at the end."],
    example: "A train travels 120 km in 2 hours. Choose Speed, distance and time, leave Value 1 blank, enter 120 and 2. The speed is 120 / 2 = 60 km per hour.",
    faqs: [["Which problems can it solve?", "Speed, distance and time; two travellers meeting or one catching up; percentages and finding an original amount; simple and compound interest; two numbers from their sum and difference; consecutive numbers; ages; working together; two kinds of items; and rectangle sides."], ["My problem is worded differently. What should I do?", "Pick the closest type and match your numbers to the boxes with the guide. For a problem written in free-form sentences, ask the AI helper on the home page."], ["Does it show the working?", "Yes. Every answer shows how the equation is set up, the solving steps and a check."]],
    related: ["percentage", "solve-for-x"]
  }
];

PAGES[0].guide = window.MSIQ_WP_TYPES.map((t) => [t.name, t.vars.map((l, i) => "Value " + (i + 1) + " = " + l).join("; ")]);

const esc = (s) => String(s).replace(/&/g, "&amp;").replace(/</g, "&lt;").replace(/>/g, "&gt;");

function page(p) {
  const url = SITE + "/calculator/" + p.slug;
  const h1t = p.h1 || (p.name + " Calculator");
  const title = p.title || (p.name + " Calculator with Steps – MathSolveIQ");
  const ogTitle = h1t + " – MathSolveIQ";
  const ld = {
    "@context": "https://schema.org",
    "@graph": [
      { "@type": "BreadcrumbList", itemListElement: [
        { "@type": "ListItem", position: 1, name: "Home", item: SITE + "/" },
        { "@type": "ListItem", position: 2, name: "Calculators", item: SITE + "/calculator" },
        { "@type": "ListItem", position: 3, name: h1t, item: url }] },
      { "@type": "FAQPage", mainEntity: p.faqs.map((f) => ({ "@type": "Question", name: f[0], acceptedAnswer: { "@type": "Answer", text: f[1] } })) }
    ]
  };
  const ldText = JSON.stringify(ld).replace(/</g, "\\u003c");
  const rel = p.related.map((s) => '<a href="/calculator/' + s + '">' + esc(NAMES[s]) + "</a>").join("");
  const guideHtml = p.guide ? "<h2>What each box means</h2><table><tr><th>Type of problem</th><th>Boxes</th></tr>" + p.guide.map((g) => "<tr><td>" + esc(g[0]) + "</td><td>" + esc(g[1]) + "</td></tr>").join("") + "</table>" : "";
  const faqHtml = p.faqs.map((f) => "<details><summary>" + esc(f[0]) + "</summary><p>" + esc(f[1]) + "</p></details>").join("");
  return `<!DOCTYPE html>
<html lang="en"><head><meta charset="utf-8">
<meta name="viewport" content="width=device-width, initial-scale=1">
<title>${esc(title)}</title>
<meta name="description" content="${esc(p.desc)}">
<link rel="canonical" href="${url}">
<meta name="robots" content="index, follow">
<meta property="og:type" content="website"><meta property="og:site_name" content="MathSolveIQ">
<meta property="og:title" content="${esc(ogTitle)}"><meta property="og:description" content="${esc(p.desc)}">
<meta property="og:url" content="${url}"><meta property="og:image" content="${SITE}/images/og-image.png">
<meta name="twitter:card" content="summary_large_image">
<link rel="icon" href="/images/favicon.svg" type="image/svg+xml">
<link rel="stylesheet" href="/css/style.css">
<style>${STYLE}</style>
<script type="application/ld+json">${ldText}</script>
</head><body>
<div class="doc">
 <div class="top"><a href="/">MathSolveIQ</a><a href="/calculator">All calculators</a></div>
 <p class="crumb"><a href="/">Home</a> › <a href="/calculator">Calculators</a> › ${esc(h1t)}</p>
 <h1>${esc(h1t)}</h1>
 <p class="lead">${esc(p.desc)}</p>
 <div class="card"><div id="form"></div><div class="out" id="result"></div></div>
 <h2>About this calculator</h2><p>${esc(p.about)}</p>
 <h2>How to use it</h2><ol>${p.how.map((h) => "<li>" + esc(h) + "</li>").join("")}</ol>
 <h2>Example</h2><p>${esc(p.example)}</p>
 ${guideHtml}
 <h2>Common questions</h2>
 ${faqHtml}
 <h2>Related calculators</h2><p class="rel">${rel}</p>
 <p class="hint">Calculators can make input mistakes. Check important results yourself. <a href="/privacy.html">Privacy</a> · <a href="/terms.html">Terms</a></p>
</div>
<script src="/js/calc.js"></script>
<script src="/js/calc2.js"></script>
<script src="/js/calc3.js"></script>
<script src="/js/calc5.js"></script>
<script>calcInit("${p.slug}");</script>
</body></html>
`;
}

function main() {
  const calcDir = path.join(ROOT, "calculator"), jsDir = path.join(ROOT, "js");
  if (!fs.existsSync(calcDir) || !fs.existsSync(jsDir)) { console.error("Run this from the project folder (it must contain calculator/ and js/)."); process.exit(1); }
  ["calc3.js", "calc5.js"].forEach((f) => {
    fs.copyFileSync(path.join(__dirname, f), path.join(jsDir, f));
    console.log("js/" + f + " copied");
  });
  const made = [];
  PAGES.forEach((p) => {
    const f = path.join(calcDir, p.slug + ".html");
    if (fs.existsSync(f) && !FORCE) { console.log("SKIP (exists): calculator/" + p.slug + ".html"); return; }
    fs.writeFileSync(f, page(p), "utf8");
    made.push(p.slug); console.log("wrote calculator/" + p.slug + ".html");
  });
  const sm = path.join(ROOT, "sitemap.xml");
  if (fs.existsSync(sm)) {
    let x = fs.readFileSync(sm, "utf8"), add = "";
    PAGES.forEach((p) => { const u = SITE + "/calculator/" + p.slug; if (x.indexOf(u + "<") < 0 && x.indexOf(u + "\"") < 0) add += "  <url><loc>" + u + "</loc></url>\n"; });
    if (add && x.indexOf("</urlset>") >= 0) { fs.writeFileSync(sm, x.replace("</urlset>", add + "</urlset>"), "utf8"); console.log("sitemap.xml: added " + add.trim().split("\n").length + " URLs"); }
    else console.log("sitemap.xml: nothing to add");
  } else console.log("sitemap.xml not found in project root: add the new URLs by hand.");
  console.log("\nDone. " + made.length + " pages written. Next: add them to calculator/index.html.");
}
main();
