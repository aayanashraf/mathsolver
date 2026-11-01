# MathSolveIQ update: 14 new calculators, new Privacy/Terms/Contact/Quiz/Exam pages, small fixes, deploy.
# Run from anywhere:
#   Set-ExecutionPolicy -Scope Process Bypass; .\apply-update.ps1 -Project "D:\mathsolver\mathsolveiq"
# Options:  -Force (overwrite the 5 pages even if already new)   -NoDeploy (skip Vercel)
param([string]$Project = "D:\mathsolver\mathsolveiq", [switch]$Force, [switch]$NoDeploy)

$pack = $PSScriptRoot
$utf8 = New-Object System.Text.UTF8Encoding $false
if (-not (Test-Path "$Project\index.html")) {
  Write-Host "index.html not found in $Project. Pass the right folder with -Project." -ForegroundColor Red
  exit 1
}
Set-Location $Project
if (-not (Test-Path ".git")) { git init | Out-Null }
git add -A 2>$null
git commit -m "before update-pack" 2>$null | Out-Null

Write-Host "`n--- 1. Pages ---" -ForegroundColor Cyan
function CopyIf($name, $marker) {
  $src = Join-Path $pack $name
  $dst = Join-Path $Project $name
  $old = ""
  if (Test-Path $dst) { $old = [IO.File]::ReadAllText($dst) }
  if ($Force -or -not $old.Contains($marker)) {
    Copy-Item $src $dst -Force
    Write-Host "UPDATED  $name" -ForegroundColor Green
  } else {
    Write-Host "ok       $name (already the new version)" -ForegroundColor DarkGreen
  }
}
CopyIf "privacy.html"   "What stays in your browser"
CopyIf "terms.html"     "Academic honesty"
CopyIf "contact.html"   "CONTACT_EMAIL"
CopyIf "quiz.html"      "var BANK"
CopyIf "exam-mode.html" "var EXAMS"

Write-Host "`n--- 2. Calculators ---" -ForegroundColor Cyan
New-Item -ItemType Directory -Force "$Project\calculator", "$Project\js" | Out-Null
Copy-Item "$pack\calculator\*" "$Project\calculator" -Recurse -Force
Copy-Item "$pack\js\calc2.js" "$Project\js\calc2.js" -Force
Copy-Item "$pack\home-links.js" "$Project\js\home-links.js" -Force
New-Item -ItemType Directory -Force "$Project\images" | Out-Null
if (Test-Path "$pack\images\og-image.png") { Copy-Item "$pack\images\og-image.png" "$Project\images\og-image.png" -Force; Write-Host "OK       images\og-image.png" -ForegroundColor Green }
$count = (Get-ChildItem "$Project\calculator" -Filter *.html | Where-Object { $_.Name -ne "index.html" }).Count
Write-Host "OK       $count calculator pages in calculator\ (plus js\calc2.js and js\home-links.js)" -ForegroundColor Green

if (Test-Path "$Project\sitemap.xml") {
  $sm = [IO.File]::ReadAllText("$Project\sitemap.xml")
  if (-not $sm.Contains("/calculator/derivative")) {
    $add = [IO.File]::ReadAllText("$pack\sitemap-add2.txt")
    $sm = $sm.Replace("</urlset>", $add + "</urlset>")
    [IO.File]::WriteAllText("$Project\sitemap.xml", $sm, $utf8)
    Write-Host "OK       sitemap.xml now lists the new calculators" -ForegroundColor Green
  } else { Write-Host "ok       sitemap.xml already lists them" -ForegroundColor DarkGreen }
} else { Write-Host "NOTE     sitemap.xml not found, skipped" -ForegroundColor Yellow }

Write-Host "`n--- 3. Fixing index.html ---" -ForegroundColor Cyan
$ip = "$Project\index.html"
$t = [IO.File]::ReadAllText($ip)
$orig = $t
$copy = [string][char]0x00A9
$dot  = [string][char]0x00B7
$t = [regex]::Replace($t, "[\uFFFD?]+\s*MathSolveIQ\s*[\uFFFD?]+\s*Free AI Math Solver", ($copy + " MathSolveIQ " + $dot + " Free AI Math Solver"))
$t = [regex]::Replace($t, 'href="#calculators"([^>]*)>(\s*)Browse all', 'href="/calculator"$1>$2Browse all')
if ($t -ne $orig) {
  [IO.File]::WriteAllText($ip, $t, $utf8)
  Write-Host "OK       footer text and the Browse-all link fixed" -ForegroundColor Green
} else {
  Write-Host "ok       nothing to fix in index.html (or the lines look different, tell me)" -ForegroundColor Yellow
}
if ($t -match "\uFFFD") { Write-Host "NOTE     index.html still has broken characters (shown as a black diamond with ?). Tell me which line." -ForegroundColor Yellow }

Write-Host "`n--- 4. Checks ---" -ForegroundColor Cyan
foreach ($m in "images\og-image.png","privacy.html","terms.html","contact.html","quiz.html","exam-mode.html","js\calc.js","js\calc2.js","js\home-links.js","calculator\index.html","calculator\derivative.html","calculator\determinant.html","calculator\fraction.html") {
  if (Test-Path "$Project\$m") { Write-Host "found    $m" -ForegroundColor Green } else { Write-Host "MISSING  $m" -ForegroundColor Red }
}
if ((Test-Path "$Project\contact.html") -and ([IO.File]::ReadAllText("$Project\contact.html").Contains("support@mathsolveiq.com"))) {
  Write-Host "`nREMINDER: contact.html still uses support@mathsolveiq.com. Change CONTACT_EMAIL inside it to your real email." -ForegroundColor Yellow
}

git add -A 2>$null
git commit -m "update-pack: 25 calculators, real quiz and exam pages, legal fixes" 2>$null | Out-Null

if (-not $NoDeploy) {
  Write-Host "`n--- 5. Deploying to Vercel ---" -ForegroundColor Cyan
  npx vercel --prod
} else {
  Write-Host "`nSkipped deploy. Run later:  npx vercel --prod" -ForegroundColor Yellow
}
Write-Host "`nDone. Open the site and press Ctrl+Shift+R." -ForegroundColor Cyan
