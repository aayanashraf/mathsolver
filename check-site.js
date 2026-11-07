#!/usr/bin/env node
/* MathSolveIQ site checker: finds problems in your code (not ranking / hosting / domain).
   Run inside your project folder:   node check-site.js
   Optional: node check-site.js "D:\path\to\project" */
const fs = require("fs"), path = require("path"), vm = require("vm");
const ROOT = path.resolve(process.argv[2] || process.cwd());
const SKIP = new Set(["node_modules", ".git", ".vercel", "logs"]);
const problems = [];
const add = (lvl, file, line, msg) => problems.push({ lvl, file: (path.relative(ROOT, file) || file).split(path.sep).join("/"), line: line || 0, msg });

function walk(d, out) {
  out = out || [];
  for (const n of fs.readdirSync(d, { withFileTypes: true })) {
    if (SKIP.has(n.name)) continue;
    const p = path.join(d, n.name);
    if (n.isDirectory()) walk(p, out); else out.push(p);
  }
  return out;
}
if (!fs.existsSync(ROOT)) { console.log("Folder not found: " + ROOT); process.exit(2); }
const files = walk(ROOT);
const read = f => fs.readFileSync(f, "utf8");
const ext = f => path.extname(f).toLowerCase();
const lineAt = (txt, i) => txt.slice(0, i).split("\n").length;
const blank = s => s.replace(/[^\n]/g, " ");

/* ---------- helpers ---------- */
function syntax(code, file, lineBase, label) {
  try { new vm.Script(code, { filename: "x" }); }
  catch (e) {
    const m = String(e.stack || "").match(/^[^\n]*:(\d+)\n/);
    let msg = e.message;
    if (/import|export/.test(msg)) msg += " (the browser and the server files here must not use import/export)";
    add("ERROR", file, (m ? +m[1] : 1) + (lineBase || 0), "JavaScript syntax error" + (label ? " in " + label : "") + ": " + msg);
  }
}
const dirCache = {};
function listDir(d) { return dirCache[d] || (dirCache[d] = (() => { try { return fs.readdirSync(d); } catch (e) { return []; } })()); }
function exactCase(p) {
  const rel = path.relative(ROOT, p); if (rel.startsWith("..")) return true;
  let cur = ROOT;
  for (const seg of rel.split(path.sep).filter(Boolean)) { if (!listDir(cur).includes(seg)) return false; cur = path.join(cur, seg); }
  return true;
}
function resolveRef(fromFile, ref) {
  ref = ref.split("#")[0].split("?")[0];
  if (!ref) return { ok: true };
  try { ref = decodeURIComponent(ref); } catch (e) {}
  const base = ref.startsWith("/") ? path.join(ROOT, ref) : path.resolve(path.dirname(fromFile), ref);
  const cands = [base, base + ".html", path.join(base, "index.html")];
  for (const c of cands) {
    try { if (fs.statSync(c).isFile()) return { ok: true, caseOk: exactCase(c), found: c }; } catch (e) {}
  }
  return { ok: false };
}

/* ---------- per-file checks ---------- */
const textExt = new Set([".html", ".js", ".css", ".json", ".xml", ".txt", ".md", ".ps1", ".svg"]);
for (const f of files) {
  const e = ext(f); if (!textExt.has(e)) continue;
  let txt; try { txt = read(f); } catch (x) { continue; }
  const rel = path.relative(ROOT, f);

  /* secrets (every text file) */
  const sec = [[/sk-ant-[A-Za-z0-9_-]{10,}/, "an Anthropic API key"], [/AIza[0-9A-Za-z_-]{30,}/, "a Google API key"], [/sk-[A-Za-z0-9]{32,}/, "an API key"]];
  for (const [rx, name] of sec) { const m = rx.exec(txt); if (m) add("ERROR", f, lineAt(txt, m.index), "SECRET: this looks like " + name + ". Remove it and create a new key. Keys belong only in Vercel environment variables."); }

  /* broken text encoding */
  if ([".html", ".js", ".css", ".json"].includes(e)) {
    txt.split("\n").forEach((ln, i) => { if (/\uFFFD|â€|Ã[\u0080-\u00BF]|Â[\u00A0-\u00BF]/.test(ln)) add("ERROR", f, i + 1, "Broken characters (encoding problem): " + ln.trim().slice(0, 70)); });
  }

  if (e === ".json") { try { JSON.parse(txt); } catch (x) { add("ERROR", f, 1, "Invalid JSON: " + x.message); } }

  if (e === ".js" && !/\.min\.js$/.test(f)) {
    syntax(txt, f, 0);
    if (/(^|[\\/])api[\\/]/.test(rel) && !/module\.exports|export\s+default|exports\./.test(txt)) add("ERROR", f, 1, "Server function does not export a handler (needs module.exports = async (req, res) => {...}).");
  }

  if (e === ".css") {
    const c = txt.replace(/\/\*[\s\S]*?\*\//g, "").replace(/"[^"]*"|'[^']*'/g, '""');
    const o = (c.match(/\{/g) || []).length, cl = (c.match(/\}/g) || []).length;
    if (o !== cl) add("ERROR", f, 1, "CSS braces do not match: " + o + " '{' and " + cl + " '}'. The styles after the mistake will not work.");
  }

  if (e === ".xml" && /sitemap/i.test(f)) {
    const rx = /<loc>\s*([^<]+?)\s*<\/loc>/g; let m;
    while ((m = rx.exec(txt))) {
      let u = m[1]; const p = u.replace(/^https?:\/\/[^/]+/, "") || "/";
      if (!resolveRef(path.join(ROOT, "index.html"), p).ok) add("WARN", f, lineAt(txt, m.index), "Sitemap lists a page that does not exist in your project: " + p);
    }
  }

  if (e !== ".html") continue;

  /* ---------- HTML ---------- */
  let html = txt.replace(/<!--[\s\S]*?-->/g, blank);
  const scripts = []; let sm;
  const srx = /<script\b([^>]*)>([\s\S]*?)<\/script>/gi;
  while ((sm = srx.exec(html))) scripts.push({ attrs: sm[1], code: sm[2], line: lineAt(html, sm.index + sm[0].indexOf(">") + 1), idx: sm.index });
  let clean = html.replace(srx, (m, a, c) => m.replace(c, blank(c))).replace(/<style\b[^>]*>[\s\S]*?<\/style>/gi, m => blank(m));

  if (!/<meta[^>]+charset/i.test(clean)) add("WARN", f, 1, "No <meta charset=\"utf-8\">. Special characters can break.");
  if (!/<meta[^>]+name=["']viewport["']/i.test(clean)) add("WARN", f, 1, "No viewport meta tag. The page will look tiny on phones.");

  /* inline scripts */
  const srcSeen = {}, scriptText = [];
  for (const s of scripts) {
    const src = /\bsrc\s*=\s*["']([^"']+)["']/i.exec(s.attrs), type = (/\btype\s*=\s*["']([^"']+)["']/i.exec(s.attrs) || [])[1] || "";
    if (src) {
      if (srcSeen[src[1]]) add("WARN", f, lineAt(html, s.idx), "The script " + src[1] + " is loaded twice.");
      srcSeen[src[1]] = 1;
      const r = resolveRef(f, src[1]);
      if (r.ok && r.found && /\.js$/.test(r.found)) scriptText.push(read(r.found));
    } else if (/ld\+json/i.test(type)) {
      try { JSON.parse(s.code); } catch (x) { add("ERROR", f, s.line, "Invalid JSON-LD (structured data): " + x.message); }
    } else if (!type || /javascript|module/i.test(type)) {
      syntax(s.code, f, s.line - 1, "an inline <script>");
      scriptText.push(s.code);
    }
  }

  /* tags: ids, links, images */
  const ids = {}, idList = new Set();
  const trx = /<([a-z][a-z0-9-]*)\b([^>]*)>/gi; let tm;
  const attr = (a, n) => { const m = new RegExp("\\b" + n + "\\s*=\\s*(?:\"([^\"]*)\"|'([^']*)')", "i").exec(a); return m ? (m[1] !== undefined ? m[1] : m[2]) : null; };
  const anchors = [];
  while ((tm = trx.exec(clean))) {
    const tag = tm[1].toLowerCase(), a = tm[2], line = lineAt(clean, tm.index);
    const id = attr(a, "id");
    if (id) { if (ids[id]) add("ERROR", f, line, "Duplicate id=\"" + id + "\" (first on line " + ids[id] + "). Buttons and scripts will pick the wrong element."); else ids[id] = line; idList.add(id); }
    if (tag === "img" && attr(a, "alt") === null) add("WARN", f, line, "<img> without alt text (accessibility).");
    for (const n of (tag === "a" || tag === "link" ? ["href"] : tag === "script" || tag === "img" || tag === "source" || tag === "iframe" ? ["src"] : [])) {
      const v = attr(a, n); if (v === null) continue; const t = v.trim();
      if (!t || /^(https?:|\/\/|mailto:|tel:|data:|javascript:|blob:|sms:)/i.test(t)) continue;
      if (t.charAt(0) === "#") { anchors.push([t.slice(1), line]); continue; }
      if (/\$\{|\{\{|<%/.test(t)) continue;
      const r = resolveRef(f, t);
      if (!r.ok) add("ERROR", f, line, "Broken link/file: " + t + " does not exist.");
      else if (r.caseOk === false) add("ERROR", f, line, "Wrong upper/lower case in " + t + ". It works on Windows but breaks on Vercel.");
    }
  }
  for (const [h, line] of anchors) { if (h && !idList.has(h) && !idList.has("page-" + h) && h !== "top") add("WARN", f, line, "Link #" + h + " points to nothing on this page."); }

  /* ids that the scripts look for */
  const all = scriptText.join("\n"), made = new Set();
  for (const m of all.matchAll(/\bid\s*=\s*\\?["']([\w-]+)\\?["']/g)) made.add(m[1]);
  for (const m of all.matchAll(/\.id\s*=\s*["']([\w-]+)["']/g)) made.add(m[1]);
  const seenMissing = new Set();
  for (const m of all.matchAll(/(?:getElementById|\$)\(\s*["']([\w-]+)["']\s*\)/g)) {
    const id = m[1]; if (idList.has(id) || made.has(id) || seenMissing.has(id)) continue; seenMissing.add(id);
    add("WARN", f, 0, "A script looks for an element with id=\"" + id + "\" but this page has none. That button or box may do nothing.");
  }

  /* unbalanced tags */
  for (const t of ["div", "section", "ul", "ol", "table", "details", "form", "nav", "header", "footer", "main", "select", "button", "textarea", "span", "a"]) {
    const o = (clean.match(new RegExp("<" + t + "(?=[\\s>/])", "gi")) || []).length, c = (clean.match(new RegExp("</" + t + ">", "gi")) || []).length;
    if (o !== c) add("ERROR", f, 1, "Tags do not match: " + o + " <" + t + "> opened but " + c + " </" + t + "> closed. The layout can break.");
  }
}

/* ---------- report ---------- */
const order = { ERROR: 0, WARN: 1 };
problems.sort((a, b) => order[a.lvl] - order[b.lvl] || a.file.localeCompare(b.file) || a.line - b.line);
const errs = problems.filter(p => p.lvl === "ERROR"), warns = problems.filter(p => p.lvl === "WARN");
const counts = { html: 0, js: 0, css: 0, json: 0 };
files.forEach(f => { const k = ext(f).slice(1); if (counts[k] !== undefined) counts[k]++; });
console.log("\nChecked " + counts.html + " HTML, " + counts.js + " JS, " + counts.css + " CSS and " + counts.json + " JSON files in " + ROOT + "\n");
let last = "";
for (const p of problems) {
  if (p.lvl !== last) { console.log((p.lvl === "ERROR" ? "=== ERRORS (fix these) ===" : "\n=== WARNINGS (worth a look) ===")); last = p.lvl; }
  console.log("  " + p.lvl.padEnd(5) + "  " + p.file + (p.line ? ":" + p.line : "") + "  " + p.msg);
}
console.log("\n----------------------------------------");
console.log(errs.length ? errs.length + " error(s), " + warns.length + " warning(s)." : warns.length ? "No errors. " + warns.length + " warning(s)." : "No problems found in your code.");
console.log("(Ranking, hosting and domain are not checked here.)\n");
process.exit(errs.length ? 1 : 0);
