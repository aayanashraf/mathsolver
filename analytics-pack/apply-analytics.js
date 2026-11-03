/* MathSolveIQ analytics installer.
   From the project folder:
     node .\analytics-pack\apply-analytics.js G-XXXXXXXXXX                  (Google Analytics 4, with cookie notice)
     node .\analytics-pack\apply-analytics.js mathsolveiq.vercel.app plausible   (Plausible, cookie-free)
     node .\analytics-pack\apply-analytics.js                               (install only, analytics stays off until you add an id)
   Safe to run again: the id is replaced and pages are not changed twice. */
const fs = require("fs");
const path = require("path");
const ROOT = process.cwd();
const SKIP_DIR = /^(node_modules|\.git|\.vercel|backup.*|removed-.*|.*-pack|.*-ready)$/;
const id = (process.argv[2] || "").trim();
const provider = (process.argv[3] || (id.indexOf("G-") === 0 ? "ga4" : id ? "plausible" : "ga4")).toLowerCase();

if (!fs.existsSync(path.join(ROOT, "index.html"))) { console.error("Run this from the project folder (index.html not found here)."); process.exit(1); }
if (id && provider === "ga4" && !/^G-[A-Z0-9]{4,}$/.test(id)) { console.error("A Google Analytics 4 id looks like G-ABC123XYZ. Got: " + id); process.exit(1); }
if (id && provider === "plausible" && !/^[a-z0-9-]+(\.[a-z0-9-]+)+$/i.test(id)) { console.error("For Plausible give your domain, like mathsolveiq.vercel.app. Got: " + id); process.exit(1); }
if (provider !== "ga4" && provider !== "plausible") { console.error('Provider must be "ga4" or "plausible".'); process.exit(1); }

let js = fs.readFileSync(path.join(__dirname, "files", "js", "consent.js"), "utf8");
const cfg = JSON.stringify({ provider: provider, id: id });
js = js.replace(/\/\*CONFIG\*\/[\s\S]*?\/\*END\*\//, "/*CONFIG*/" + cfg + "/*END*/");
fs.mkdirSync(path.join(ROOT, "js"), { recursive: true });
fs.writeFileSync(path.join(ROOT, "js", "consent.js"), js, "utf8");
console.log("js/consent.js written (" + (id ? provider + " " + id : "no id yet, analytics is OFF") + ")");

let changed = 0, already = 0;
(function walk(dir) {
  fs.readdirSync(dir, { withFileTypes: true }).forEach((d) => {
    const p = path.join(dir, d.name);
    if (d.isDirectory()) { if (!SKIP_DIR.test(d.name)) walk(p); return; }
    if (!/\.html$/i.test(d.name) || d.name.toLowerCase() === "offline.html") return;
    const t = fs.readFileSync(p, "utf8");
    if (t.indexOf("/js/consent.js") >= 0) { already++; return; }
    const i = t.search(/<\/head>/i); if (i < 0) return;
    fs.writeFileSync(p, t.slice(0, i) + '<script defer src="/js/consent.js"></script>\n' + t.slice(i), "utf8"); changed++;
  });
})(ROOT);
console.log("Pages updated: " + changed + ", already done: " + already);
if (!id) console.log("\nNext: node .\\analytics-pack\\apply-analytics.js G-XXXXXXXXXX   (your Google Analytics 4 measurement id)");
else console.log("\nDone. Deploy, then update your Privacy page: it must say that Google Analytics cookies are used only after Accept.");
