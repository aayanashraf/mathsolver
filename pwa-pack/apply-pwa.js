/* MathSolveIQ PWA installer.
   Run from the project folder:   node .\pwa-pack\apply-pwa.js
   1) copies manifest.webmanifest, sw.js, offline.html, js/pwa.js and 3 icons into the project
   2) adds the manifest link and js/pwa.js to every .html page (safe to run again). */
const fs = require("fs");
const path = require("path");

const ROOT = process.cwd();
const SRC = path.join(__dirname, "files");
const COPY = ["manifest.webmanifest", "sw.js", "offline.html", "js/pwa.js", "images/icon-192.png", "images/icon-512.png", "images/icon-maskable-512.png"];
const SKIP_DIR = /^(node_modules|\.git|\.vercel|backup.*|removed-.*|.*-pack|.*-ready)$/;

if (!fs.existsSync(path.join(ROOT, "index.html"))) { console.error("Run this from the project folder (index.html not found here)."); process.exit(1); }

COPY.forEach((rel) => {
  const from = path.join(SRC, rel), to = path.join(ROOT, rel);
  if (!fs.existsSync(from)) { console.error("Missing in pack: " + rel); process.exit(1); }
  fs.mkdirSync(path.dirname(to), { recursive: true });
  fs.copyFileSync(from, to);
  console.log("copied " + rel);
});

let changed = 0, already = 0, noHead = [];
(function walk(dir) {
  fs.readdirSync(dir, { withFileTypes: true }).forEach((d) => {
    const p = path.join(dir, d.name);
    if (d.isDirectory()) { if (!SKIP_DIR.test(d.name)) walk(p); return; }
    if (!/\.html$/i.test(d.name) || d.name.toLowerCase() === "offline.html") return;
    let t = fs.readFileSync(p, "utf8");
    if (t.indexOf("/js/pwa.js") >= 0) { already++; return; }
    const i = t.search(/<\/head>/i);
    if (i < 0) { noHead.push(path.relative(ROOT, p)); return; }
    let add = "";
    if (!/rel=["']manifest["']/i.test(t)) add += '<link rel="manifest" href="/manifest.webmanifest">\n';
    add += '<script defer src="/js/pwa.js"></script>\n';
    fs.writeFileSync(p, t.slice(0, i) + add + t.slice(i), "utf8");
    changed++;
  });
})(ROOT);

console.log("\nPages updated: " + changed + ", already done: " + already);
if (noHead.length) console.log("No </head> found (skipped): " + noHead.join(", "));
const vj = path.join(ROOT, "vercel.json");
if (fs.existsSync(vj) && /rewrites|routes/.test(fs.readFileSync(vj, "utf8"))) console.log("\nNote: vercel.json has rewrites/routes. After deploy, open /sw.js and /manifest.webmanifest and confirm they show code, not your home page.");
console.log("Done. Deploy, then open the site once online so the pages get saved for offline use.");
