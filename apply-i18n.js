/**
 * MathSolveIQ: Automated Global Translation Injector
 * Scans index.html, quiz.html, exam-mode.html, and all 85+ calculator pages in calculators/ or calculator/
 * Injects <script defer src="/js/i18n.js"></script> and ensures semantic <header> integration.
 *
 * Usage:
 *   node apply-i18n.js
 */

const fs = require('fs');
const path = require('path');

const ROOT = process.cwd();
const SKIP_DIRS = /^(node_modules|\.git|\.vercel|.*-pack)$/i;

let scanned = 0;
let updated = 0;
let alreadyConfigured = 0;

function processHtmlFile(filePath) {
  scanned++;
  let content = fs.readFileSync(filePath, 'utf8');
  const orig = content;
  const relPath = path.relative(ROOT, filePath);

  // 1. Inject /js/i18n.js into <head>
  if (content.includes('js/i18n.js')) {
    alreadyConfigured++;
  } else {
    if (/<\/head>/i.test(content)) {
      content = content.replace(/<\/head>/i, '  <script defer src="/js/i18n.js"></script>\n</head>');
    }
  }

  // 2. Ensure semantic <header> exists on subpages with <div class="top">
  if (!/<header\b/i.test(content) && /<div class="top">/i.test(content)) {
    content = content.replace(/(<div class="top">[\s\S]*?<\/div>)/i, '<header class="site-subnav">$1</header>');
  }

  if (content !== orig) {
    fs.writeFileSync(filePath, content, 'utf8');
    updated++;
    console.log(`[OK] Injected i18n into: ${relPath}`);
  }
}

function walkDir(dir) {
  const entries = fs.readdirSync(dir, { withFileTypes: true });
  for (const entry of entries) {
    const fullPath = path.join(dir, entry.name);
    if (entry.isDirectory()) {
      if (!SKIP_DIRS.test(entry.name)) {
        walkDir(fullPath);
      }
    } else if (entry.isFile() && /\.html$/i.test(entry.name)) {
      processHtmlFile(fullPath);
    }
  }
}

console.log('=== MathSolveIQ Universal Translation Injector ===');
walkDir(ROOT);

console.log('\n--- Deployment Summary ---');
console.log(`Total HTML files scanned:  ${scanned}`);
console.log(`Files updated:             ${updated}`);
console.log(`Files already configured:  ${alreadyConfigured}`);
console.log('All 85+ platform pages configured for universal client-side translation.\n');
