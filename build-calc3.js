/* MathSolveIQ: builds the 10 calc3 calculator pages.
   Usage (from the project folder, with calc3.js and this file placed in it):
     node build-calc3.js            -> writes calculator/<slug>.html, copies js/calc3.js, adds sitemap entries
     node build-calc3.js --force    -> also overwrites pages that already exist
   Files are written as UTF-8 without BOM. */
const fs = require("fs");
const path = require("path");

const ROOT = process.cwd();
const SITE = "https://mathsolveiq.vercel.app";
const FORCE = process.argv.includes("--force");

const STYLE = "body{padding-left:0}.doc{max-width:760px;margin:0 auto;padding:24px 16px 60px}.doc h1{font:700 32px/1.2 Georgia,serif;margin:12px 0 6px}.doc h2{font:700 21px/1.3 Georgia,serif;margin:28px 0 8px}.top{display:flex;justify-content:space-between;gap:10px;flex-wrap:wrap}.top a{color:var(--acc);text-decoration:none;font-weight:600}label{display:block;font-weight:600;margin:0 0 4px;font-size:14px}table{border-collapse:collapse;width:100%;margin-top:6px}th,td{border:1px solid var(--line);padding:4px 8px;text-align:left}.crumb{color:var(--mute);font-size:14px}.rel a{display:inline-block;margin:4px 8px 0 0;padding:6px 12px;border-radius:999px;background:var(--acc2);color:var(--acc);text-decoration:none}";

const NAMES = {
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
    slug: "simplify", name: "Simplify Expression",
    desc: "Expand brackets and collect like terms in polynomials with x and y, with every step shown.",
    about: "Simplifying an expression means expanding the brackets and combining like terms so the result is as short as possible. This calculator handles polynomials in x and y written with + − * ^ and brackets. For fractions that contain x, use the Rational Expression calculator.",
    how: ["Type the expression, using ^ for powers, such as (x+2)(x-3) + 2x(x-1) - 4.", "Brackets written next to each other are multiplied, and 2x means 2 times x.", "Read the simplified form, then use the quick check to see that both forms give the same value."],
    example: "(x + 2)(x − 3) + 2x(x − 1) − 4 simplifies to 3x² − 3x − 10.",
    faqs: [["What are like terms?", "Terms that have exactly the same variables with the same powers, such as 3x² and −5x². Only like terms can be added together."], ["What can this calculator not do?", "Functions such as sin or ln, division by a variable, and fractional or negative exponents. Use the Rational Expression calculator for fractions."], ["Why does 2x(x − 1) work without a multiplication sign?", "A number or letter next to a bracket is read as multiplication, as it is in maths class."]],
    related: ["rational-expression", "factoring"]
  },
  {
    slug: "function-composition", name: "Function Composition",
    desc: "Find f(g(x)) and g(f(x)) for polynomial functions, with an optional value at a chosen x.",
    about: "Composing two functions means putting one inside the other. For f(g(x)), every x in f is replaced by the whole expression g(x). This calculator does it for polynomials and shows both orders.",
    how: ["Type f(x) and g(x) as polynomials, such as x^2 + 1 and 2x - 3.", "Optionally enter a value of x to see the numbers for both compositions.", "Compare f(g(x)) with g(f(x)). They are usually different."],
    example: "With f(x) = x² + 1 and g(x) = 2x − 3, f(g(x)) = 4x² − 12x + 10 and g(f(x)) = 2x² − 1.",
    faqs: [["What does f ∘ g mean?", "It means f(g(x)): apply g first, then f."], ["Is f(g(x)) the same as g(f(x))?", "Almost never. The order matters, which is why both are shown."], ["What can this calculator not do?", "Only polynomials are supported. Functions such as sin(x), ln(x) or 1/x are not."]],
    related: ["inverse-function", "domain-and-range"]
  },
  {
    slug: "partial-derivative", name: "Partial Derivative",
    desc: "First and second partial derivatives of a polynomial in x and y, with values at a point.",
    about: "A partial derivative measures how a function of several variables changes when only one variable moves and the others are held constant. This calculator differentiates polynomials in x and y and also gives the second derivatives.",
    how: ["Type f(x, y) as a polynomial, using ^ for powers, such as 3x^2y + 2xy^3 - 5y + 4.", "Optionally enter a point such as 1, 2.", "Read f_x (y held constant), f_y (x held constant) and the second derivatives."],
    example: "For f = 3x²y + 2xy³ − 5y + 4, f_x = 6xy + 2y³ and f_y = 3x² + 6xy² − 5.",
    faqs: [["What is a partial derivative?", "The derivative with respect to one variable while every other variable is treated as a constant."], ["Why is f_xy equal to f_yx?", "For functions whose second derivatives are continuous, the order of differentiation does not matter. Polynomials always satisfy this."], ["What can this calculator not do?", "Functions such as sin, ln and e^x, and quotients. Only polynomials in x and y are supported."]],
    related: ["derivative", "implicit-differentiation"]
  },
  {
    slug: "implicit-differentiation", name: "Implicit Differentiation",
    desc: "Find dy/dx for a polynomial equation in x and y, and the slope at a point on the curve.",
    about: "Some curves, such as circles, cannot be written as y = f(x). Implicit differentiation finds dy/dx anyway by moving everything to one side, F(x, y) = 0, and using dy/dx = −F_x / F_y.",
    how: ["Type an equation with one = sign, such as x^2 + y^2 = 25.", "Optionally enter a point on the curve, such as 3, 4.", "Read dy/dx and the slope at the point. The calculator warns you if the point is not on the curve."],
    example: "For x² + y² = 25, dy/dx = −x / y, so the slope at (3, 4) is −3/4 = −0.75.",
    faqs: [["What is implicit differentiation?", "A way to find dy/dx when y is not isolated, by differentiating both sides with respect to x and using the chain rule on every y."], ["What if F_y is 0 at the point?", "Then the tangent line is vertical and dy/dx is undefined at that point."], ["What can this calculator not do?", "Only polynomial equations in x and y are supported, not sin, ln or e^x."]],
    related: ["derivative", "partial-derivative"]
  },
  {
    slug: "eigenvalue", name: "Eigenvalue",
    desc: "Eigenvalues and eigenvectors of a 2x2 or 3x3 matrix, with the characteristic polynomial.",
    about: "An eigenvector of a matrix A is a direction that A only stretches, so that Av = λv. The number λ is the eigenvalue. This calculator builds the characteristic polynomial, finds its roots and then solves for the eigenvectors.",
    how: ["Type a 2x2 or 3x3 matrix with rows separated by ;, such as 2,1;1,2.", "Read the characteristic polynomial and the eigenvalues.", "Check the eigenvectors and the trace test at the bottom."],
    example: "The matrix [[2, 1], [1, 2]] has eigenvalues 1 and 3, with eigenvectors [1, −1] and [1, 1].",
    faqs: [["What is an eigenvalue?", "A number λ for which Av = λv has a non-zero solution v."], ["What if the eigenvalues are complex?", "They are shown, for example i and −i for a rotation matrix. Complex eigenvectors are not displayed."], ["Which sizes are supported?", "2x2 and 3x3 matrices with real numbers."]],
    related: ["determinant", "inverse-matrix"]
  },
  {
    slug: "taylor-series", name: "Taylor Series",
    desc: "Taylor and Maclaurin polynomials for common functions, with a table of derivatives and an error check.",
    about: "A Taylor polynomial approximates a function near a point a using its derivatives at that point. With a = 0 it is called a Maclaurin polynomial. This calculator supports a list of common functions and compares the approximation with the exact value.",
    how: ["Choose a function, the centre a and the highest power n.", "Optionally enter an x to approximate.", "Read the table of derivatives, the polynomial and the error."],
    example: "e^x at a = 0 with n = 4 gives 1 + x + x²/2 + x³/6 + x⁴/24, which is about 1.6484 at x = 0.5 (the exact value is 1.6487).",
    faqs: [["What is the difference between Taylor and Maclaurin?", "A Maclaurin series is a Taylor series centred at 0."], ["How many terms should I use?", "More terms give a better approximation near the centre. Far from the centre, some series (ln x, 1/x) do not improve."], ["Can I type my own function?", "Not yet. Pick from e^x, sin x, cos x, ln x, 1/x, √x and 1/(1−x)."]],
    related: ["derivative", "series-convergence"]
  },
  {
    slug: "series-convergence", name: "Series Convergence",
    desc: "Test geometric series, p-series and your own a(n) with the ratio test.",
    about: "An infinite series converges when its partial sums settle on a number. This calculator applies the geometric series test, the p-series test and the ratio test, and explains the conclusion.",
    how: ["Choose the type of series.", "For a geometric series enter a and r. For a p-series enter p in the second box.", "For the ratio test type a(n), such as n^2/2^n or 2^n/n!."],
    example: "The geometric series 3 + 1.5 + 0.75 + … has r = 0.5, so it converges to 3 / (1 − 0.5) = 6.",
    faqs: [["What is the ratio test?", "Compute L = lim |a(n+1)/a(n)|. If L < 1 the series converges, if L > 1 it diverges, and if L = 1 the test is inconclusive."], ["Why does it say inconclusive?", "When L is close to 1, as for 1/n², the ratio test cannot decide. Try the p-series test or the integral test."], ["How exact is the ratio test here?", "L is estimated numerically at a large n. It is strong evidence, but confirm the limit by hand for homework."]],
    related: ["taylor-series", "integral"]
  },
  {
    slug: "inverse-function", name: "Inverse Function",
    desc: "Find the inverse of a linear, rational, cubic, exponential or logarithmic function, with domain and range.",
    about: "The inverse function undoes the original function. To find it, write y = f(x), swap x and y, and solve for y. This calculator does that for five common forms and checks the answer by composing the two.",
    how: ["Choose the form of f(x).", "Enter the numbers a, b (and c, d for the fraction form).", "Read the steps, the inverse, its domain and range, and the check."],
    example: "f(x) = 2x + 3 has the inverse f⁻¹(x) = (x − 3) / 2.",
    faqs: [["When does an inverse exist?", "When f is one-to-one, meaning each output comes from exactly one input (it passes the horizontal line test)."], ["Why do we swap x and y?", "Because the inverse reverses inputs and outputs, so the roles of the two letters are exchanged."], ["What can this calculator not do?", "Only the five listed forms are supported, not arbitrary expressions."]],
    related: ["function-composition", "domain-and-range"]
  },
  {
    slug: "domain-and-range", name: "Domain and Range",
    desc: "Domain and range of a quadratic, square root, reciprocal, logarithm, fraction or exponential function.",
    about: "The domain is the set of inputs a function accepts, and the range is the set of outputs it produces. This calculator handles six common forms and explains why each restriction appears.",
    how: ["Choose the form of f(x).", "Enter the numbers a, b (and c, d where the form needs them).", "Read the reasoning, then the domain and the range."],
    example: "f(x) = x² − 4x + 3 has domain all real numbers and range [−1, ∞), because its lowest point is the vertex (2, −1).",
    faqs: [["What is the difference between domain and range?", "The domain lists the allowed x values. The range lists the y values that actually occur."], ["Why can't I take the square root of a negative number or divide by zero?", "Neither gives a real number, so those x values are excluded from the domain."], ["What can this calculator not do?", "Only the six listed forms are supported."]],
    related: ["inverse-function", "quadratic-equation"]
  },
  {
    slug: "rational-expression", name: "Rational Expression",
    desc: "Simplify a fraction of two polynomials, cancel common factors and list the excluded values and holes.",
    about: "A rational expression is a fraction whose top and bottom are polynomials. This calculator finds the greatest common factor with the Euclidean algorithm, cancels it, and reports the values of x that are not allowed.",
    how: ["Type the numerator and the denominator as polynomials in x, such as x^2 - 1 and x^2 - x.", "Read the common factor and the simplified fraction.", "Note the excluded values and the holes."],
    example: "(x² − 1) / (x² − x) simplifies to (x + 1) / x, with a hole at x = 1. The values x = 0 and x = 1 are not allowed.",
    faqs: [["What is a hole?", "A cancelled factor leaves a single missing point in the graph, where the original fraction is undefined but the simplified one is not."], ["Why are excluded values taken from the original denominator?", "Division by zero is not allowed in the original expression, even if the factor later cancels."], ["What can this calculator not do?", "Only polynomials in x are supported, with whole-number powers up to 12."]],
    related: ["factoring", "simplify"]
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
<script>calcInit("${p.slug}");</script>
</body></html>
`;
}

function main() {
  const calcDir = path.join(ROOT, "calculator"), jsDir = path.join(ROOT, "js");
  if (!fs.existsSync(calcDir) || !fs.existsSync(jsDir)) { console.error("Run this from the project folder (it must contain calculator/ and js/)."); process.exit(1); }
  const srcJs = path.join(__dirname, "calc3.js");
  if (!fs.existsSync(srcJs)) { console.error("calc3.js must be next to build-calc3.js."); process.exit(1); }
  fs.copyFileSync(srcJs, path.join(jsDir, "calc3.js"));
  console.log("js/calc3.js copied");
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
