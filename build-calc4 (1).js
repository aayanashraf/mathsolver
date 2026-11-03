/* MathSolveIQ: builds the 7 calc4 calculator pages (solve-for-x, exponent, polynomial, trig-identities, limit, probability, graphing).
   Usage (from the project folder, with calc3.js, calc4.js and this file placed in it):
     node build-calc4.js            -> writes calculator/<slug>.html, copies js/calc3.js and js/calc4.js, adds sitemap entries
     node build-calc4.js --force    -> also overwrites pages that already exist
   Files are written as UTF-8 without BOM. */
const fs = require("fs");
const path = require("path");

const ROOT = process.cwd();
const SITE = "https://mathsolveiq.vercel.app";
const FORCE = process.argv.includes("--force");

const STYLE = "body{padding-left:0}.doc{max-width:760px;margin:0 auto;padding:24px 16px 60px}.doc h1{font:700 32px/1.2 Georgia,serif;margin:12px 0 6px}.doc h2{font:700 21px/1.3 Georgia,serif;margin:28px 0 8px}.top{display:flex;justify-content:space-between;gap:10px;flex-wrap:wrap}.top a{color:var(--acc);text-decoration:none;font-weight:600}label{display:block;font-weight:600;margin:0 0 4px;font-size:14px}table{border-collapse:collapse;width:100%;margin-top:6px}th,td{border:1px solid var(--line);padding:4px 8px;text-align:left}.crumb{color:var(--mute);font-size:14px}.rel a{display:inline-block;margin:4px 8px 0 0;padding:6px 12px;border-radius:999px;background:var(--acc2);color:var(--acc);text-decoration:none}";

const NAMES = {
  "solve-for-x": "Solve for X Calculator", exponent: "Exponent Calculator", polynomial: "Polynomial Calculator",
  "trig-identities": "Trig Identities Calculator", limit: "Limit Calculator", probability: "Probability Calculator",
  graphing: "Graphing Calculator", "unit-circle": "Unit Circle Calculator", "systems-of-equations": "Systems of Equations Calculator",
  "permutation-combination": "Permutations and Combinations Calculator", "standard-deviation": "Standard Deviation Calculator",
  "law-of-cosines": "Law of Cosines Calculator",
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
    slug: "solve-for-x", name: "Solve for X",
    desc: "Solve linear, quadratic and higher-degree equations in x, with every step and a check by substitution.",
    about: "Solving for x means finding the values that make both sides of an equation equal. This calculator moves everything to one side and then uses the right method: isolating x for a linear equation, the quadratic formula for degree 2, and numerical root finding for degrees 3 to 8.",
    how: ["Type the equation with one = sign, using ^ for powers, such as 2x^2 - 5x - 3 = 0.", "Both sides can contain x, for example 3x + 5 = x + 11.", "Read the steps, then the check that puts each solution back into the equation."],
    example: "2x² − 5x − 3 = 0 has discriminant 49, so x = 3 or x = −0.5.",
    faqs: [["What is the discriminant?", "For ax² + bx + c = 0 it is b² − 4ac. Positive means two real solutions, zero means one, and negative means two complex solutions."], ["What can this calculator not do?", "Equations with sin, ln, e^x, fractions that contain x, or more than one variable. Only polynomial equations in x are supported."], ["Why does it say every number is a solution?", "If both sides simplify to the same expression, such as 2(x + 1) = 2x + 2, the equation is an identity and is true for all x."]],
    related: ["quadratic-equation", "systems-of-equations"]
  },
  {
    slug: "exponent", name: "Exponent",
    desc: "Evaluate powers and apply the exponent rules for products, quotients and powers of powers, including negative and fractional exponents.",
    about: "An exponent tells you how many times to multiply a base by itself. This calculator evaluates a^b, including zero, negative and fractional exponents, and shows the rule for multiplying, dividing and raising a power to a power.",
    how: ["Choose whether to evaluate a power or apply a rule.", "Enter the base a and the exponent b. For the three rules, also enter the second exponent n.", "Read the rule, the combined exponent and the result."],
    example: "2¹⁰ = 1024, and 8^(2/3) = (∛8)² = 4.",
    faqs: [["What is a negative exponent?", "a^(−n) means 1 divided by a^n, so 2^(−3) = 1/8."], ["What does a fractional exponent mean?", "a^(p/q) is the q-th root of a, raised to the power p. For example 8^(2/3) = (∛8)² = 4."], ["What can this calculator not do?", "Expressions with variables, such as x²·x³. It works with numbers for the base and the exponents."]],
    related: ["logarithm", "simplify"]
  },
  {
    slug: "polynomial", name: "Polynomial",
    desc: "Find the roots and factors of a polynomial, or add, subtract, multiply and divide two polynomials.",
    about: "A polynomial is a sum of terms such as 3x² or −5x. This calculator finds all roots (real and complex) and the factored form of a polynomial up to degree 8, and it can also add, subtract, multiply and divide two polynomials.",
    how: ["Choose what you want to do.", "Type polynomial A, and polynomial B if the operation needs one, using ^ for powers.", "Read the roots, the factored form or the result, then the check at the bottom."],
    example: "x³ − 6x² + 11x − 6 has roots 1, 2 and 3, so it factors as (x − 1)(x − 2)(x − 3).",
    faqs: [["What is a root?", "A value of x that makes the polynomial equal to 0."], ["What is multiplicity?", "How many times a root repeats. In (x − 1)² the root 1 has multiplicity 2."], ["What can this calculator not do?", "Degrees above 8, and polynomials with variables other than x."]],
    related: ["solve-for-x", "factoring"]
  },
  {
    slug: "trig-identities", name: "Trig Identities",
    desc: "Exact and decimal values of the six trig functions at any angle, with the main identities checked at that angle.",
    about: "The six trig functions are linked by identities such as sin²θ + cos²θ = 1. Enter an angle to see all six values (with exact values for multiples of 30° and 45°) and to watch each identity hold numerically.",
    how: ["Type the angle and choose degrees or radians. For radians you can type pi/6 or 2pi/3.", "Read the table of values.", "Check the list of identities. A tick means both sides agree at your angle."],
    example: "At 30°, sin = 1/2, cos = √3/2 and tan = √3/3, and sin²θ + cos²θ = 1.",
    faqs: [["Does this prove an identity?", "No. It checks the identity at one angle. A proof needs algebra that works for every angle."], ["Why is tan 90° undefined?", "Because cos 90° = 0, and tan = sin / cos would divide by zero."], ["Where does it show exact values?", "For angles that are multiples of 30° or 45°, such as 120° or 225°."]],
    related: ["unit-circle", "law-of-cosines"]
  },
  {
    slug: "limit", name: "Limit",
    desc: "Limits of polynomial and rational functions at a number or at infinity, with one-sided limits.",
    about: "A limit describes the value a function approaches as x gets close to a number, or as x grows without bound. This calculator handles polynomials and ratios of polynomials: direct substitution, cancelling common factors, one-sided limits and limits at infinity.",
    how: ["Type the numerator and the denominator as polynomials (use 1 for the denominator if there is none).", "Enter the number x approaches, or inf or -inf.", "Choose both sides, or only the right or left side, then read the steps."],
    example: "For (x² − 1)/(x − 1) as x → 1, both parts are 0, so cancel (x − 1) to get x + 1. The limit is 2.",
    faqs: [["What does 0/0 mean?", "It is an indeterminate form. It usually means a common factor can be cancelled, as in the example above."], ["What is a one-sided limit?", "The value the function approaches as x comes only from the right or only from the left. If they differ, the two-sided limit does not exist."], ["What can this calculator not do?", "Functions such as sin(x)/x or e^x. Only polynomials and ratios of polynomials are supported."]],
    related: ["derivative", "series-convergence"]
  },
  {
    slug: "probability", name: "Probability",
    desc: "Simple probability, two events (union, conditional, independence) and binomial probabilities, with steps.",
    about: "Probability measures how likely an event is, from 0 (impossible) to 1 (certain). This calculator covers favourable over total outcomes, two events A and B (including conditional probability and independence), and the binomial distribution.",
    how: ["Choose the type of problem.", "Fill in the values. The label of each box says what it means for each type.", "Read the steps and the results as a decimal and a percentage."],
    example: "3 favourable outcomes out of 10 give P = 3/10 = 0.3 = 30%. For 10 fair coin tosses, P(exactly 5 heads) is about 0.2461.",
    faqs: [["What does independent mean?", "Two events are independent if P(A and B) = P(A) × P(B), so one does not change the chance of the other."], ["When do I use the binomial formula?", "When there is a fixed number n of trials, each with two outcomes and the same chance p of success."], ["What is conditional probability?", "P(A | B) is the chance of A given that B has happened: P(A and B) divided by P(B)."]],
    related: ["permutation-combination", "standard-deviation"]
  },
  {
    slug: "graphing", name: "Graphing",
    desc: "Plot one or two functions of x, with automatic scaling and the intercepts found for you.",
    about: "Type a function such as x^2 - 4 or sin(x) and see its graph with axes and grid lines. The calculator reads sin, cos, tan, asin, acos, atan, sqrt, abs, exp, ln, log, pi and e, and finds the y-intercept and the x-intercepts in the window.",
    how: ["Type y = f(x) and, if you like, a second function.", "Set the x range. Leave the y range blank for automatic scaling.", "Read the intercepts below the graph."],
    example: "y = x² − 4 crosses the x-axis at x = −2 and x = 2, and the y-axis at (0, −4).",
    faqs: [["Which functions can I type?", "Numbers, x, + − * / ^, brackets and sin, cos, tan, asin, acos, atan, sqrt, abs, exp, ln, log, pi, e. Use brackets, like sin(x)."], ["Why is there a gap in the graph?", "Where a function is undefined or jumps to infinity, such as tan(x) or 1/x at 0, the line is broken on purpose."], ["Can I zoom?", "Yes. Change the x and y ranges and solve again."]],
    related: ["domain-and-range", "unit-circle"]
  }
];

const esc = (s) => String(s).replace(/&/g, "&amp;").replace(/</g, "&lt;").replace(/>/g, "&gt;");

function page(p) {
  const url = SITE + "/calculator/" + p.slug;
  const title = p.name + " Calculator with Steps – MathSolveIQ";
  const ogTitle = p.name + " Calculator – MathSolveIQ";
  const ld = {
    "@context": "https://schema.org",
    "@graph": [
      { "@type": "BreadcrumbList", itemListElement: [
        { "@type": "ListItem", position: 1, name: "Home", item: SITE + "/" },
        { "@type": "ListItem", position: 2, name: "Calculators", item: SITE + "/calculator" },
        { "@type": "ListItem", position: 3, name: p.name + " Calculator", item: url }] },
      { "@type": "FAQPage", mainEntity: p.faqs.map((f) => ({ "@type": "Question", name: f[0], acceptedAnswer: { "@type": "Answer", text: f[1] } })) }
    ]
  };
  const ldText = JSON.stringify(ld).replace(/</g, "\\u003c");
  const rel = p.related.map((s) => '<a href="/calculator/' + s + '">' + esc(NAMES[s]) + "</a>").join("");
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
 <p class="crumb"><a href="/">Home</a> › <a href="/calculator">Calculators</a> › ${esc(p.name)} Calculator</p>
 <h1>${esc(p.name)} Calculator</h1>
 <p class="lead">${esc(p.desc)}</p>
 <div class="card"><div id="form"></div><div class="out" id="result"></div></div>
 <h2>About this calculator</h2><p>${esc(p.about)}</p>
 <h2>How to use it</h2><ol>${p.how.map((h) => "<li>" + esc(h) + "</li>").join("")}</ol>
 <h2>Example</h2><p>${esc(p.example)}</p>
 <h2>Common questions</h2>
 ${faqHtml}
 <h2>Related calculators</h2><p class="rel">${rel}</p>
 <p class="hint">Calculators can make input mistakes. Check important results yourself. <a href="/privacy.html">Privacy</a> · <a href="/terms.html">Terms</a></p>
</div>
<script src="/js/calc.js"></script>
<script src="/js/calc2.js"></script>
<script src="/js/calc3.js"></script>
<script src="/js/calc4.js"></script>
<script>calcInit("${p.slug}");</script>
</body></html>
`;
}

function main() {
  const calcDir = path.join(ROOT, "calculator"), jsDir = path.join(ROOT, "js");
  if (!fs.existsSync(calcDir) || !fs.existsSync(jsDir)) { console.error("Run this from the project folder (it must contain calculator/ and js/)."); process.exit(1); }
  ["calc3.js", "calc4.js"].forEach((f) => {
    const src = path.join(__dirname, f);
    if (!fs.existsSync(src)) { console.error(f + " must be next to build-calc4.js."); process.exit(1); }
    fs.copyFileSync(src, path.join(jsDir, f));
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
