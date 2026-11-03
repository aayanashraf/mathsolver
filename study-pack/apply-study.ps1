# MathSolveIQ study pack: Flashcards, Formula library, Homework mode, Video library.
# Run:  Set-ExecutionPolicy -Scope Process Bypass; & ".\apply-study.ps1" -Project "D:\mathsolver\mathsolveiq"
# This script does NOT deploy. Deploy and push once, when you have added everything.
param([string]$Project = "D:\mathsolver\mathsolveiq")
$pack = $PSScriptRoot
$utf8 = New-Object System.Text.UTF8Encoding $false
if (-not (Test-Path "$Project\index.html")) { Write-Host "index.html not found in $Project" -ForegroundColor Red; exit 1 }
Set-Location $Project
if (-not (Test-Path ".git")) { git init | Out-Null }
git add -A 2>$null
git commit -m "before study pack" 2>$null | Out-Null

Write-Host "`n--- 1. Copying files ---" -ForegroundColor Cyan
New-Item -ItemType Directory -Force "$Project\js" | Out-Null
foreach ($f in "flashcards.html", "formulas.html", "homework.html", "videos.html", "add-video.ps1") {
  Copy-Item "$pack\$f" "$Project\$f" -Force; Write-Host "OK    $f" -ForegroundColor Green
}
Copy-Item "$pack\js\studydata.js" "$Project\js\studydata.js" -Force; Write-Host "OK    js\studydata.js" -ForegroundColor Green
if (-not (Test-Path "$Project\js\videos-data.js")) {
  Copy-Item "$pack\js\videos-data.js" "$Project\js\videos-data.js" -Force; Write-Host "OK    js\videos-data.js (13 starter videos)" -ForegroundColor Green
} else {
  # keep the videos you added yourself, and add any starter videos that are missing
  $vf = "$Project\js\videos-data.js"; $vt = [IO.File]::ReadAllText($vf); $added = 0
  if ($vt.Contains("/* VIDEOS-END */")) {
    foreach ($l in [IO.File]::ReadAllLines("$pack\js\videos-data.js")) {
      $m = [regex]::Match($l, '^\s*\{ id: "([A-Za-z0-9_-]{11})"')
      if ($m.Success -and -not $vt.Contains('id: "' + $m.Groups[1].Value + '"')) { $vt = $vt.Replace("  /* VIDEOS-END */", $l + "`n  /* VIDEOS-END */"); $added++ }
    }
    if ($added) { [IO.File]::WriteAllText($vf, $vt, $utf8) }
    Write-Host "OK    js\videos-data.js: $added starter videos added, your own videos kept" -ForegroundColor Green
  } else { Write-Host "NOTE  videos-data.js has no /* VIDEOS-END */ marker, left unchanged" -ForegroundColor Yellow }
}

Write-Host "`n--- 2. Editing index.html ---" -ForegroundColor Cyan
$ip = "$Project\index.html"
$t = [IO.File]::ReadAllText($ip)
$orig = $t
if (-not $t.Contains("flashcards.html")) {
  $rx = [regex]'(<a[^>]*href="[^"]*exam-mode\.html"[^>]*>[^<]*</a>)'
  $links = ' <a href="flashcards.html">Flashcards</a> <a href="formulas.html">Formula Library</a> <a href="homework.html">Homework Mode</a> <a href="videos.html">Video Lessons</a>'
  if ($rx.IsMatch($t)) { $t = $rx.Replace($t, '$1' + $links, 1); Write-Host "OK    footer links added" -ForegroundColor Green }
  else { Write-Host "NOTE  Could not find the Exam Modes link in the footer. Add these links by hand:" -ForegroundColor Yellow; Write-Host $links }
} else { Write-Host "ok    footer links already there" -ForegroundColor DarkGreen }
$copy = [string][char]0x00A9; $dot = [string][char]0x00B7
$t = [regex]::Replace($t, "[\uFFFD?]+\s*MathSolveIQ\s*[\uFFFD?]+\s*Free AI Math Solver", ($copy + " MathSolveIQ " + $dot + " Free AI Math Solver"))
$t = [regex]::Replace($t, 'href="#calculators"([^>]*)>(\s*)Browse all', 'href="/calculator"$1>$2Browse all')
if ($t -ne $orig) { [IO.File]::WriteAllText($ip, $t, $utf8); Write-Host "OK    index.html saved" -ForegroundColor Green }

Write-Host "`n--- 3. sitemap.xml ---" -ForegroundColor Cyan
if (Test-Path "$Project\sitemap.xml") {
  $sm = [IO.File]::ReadAllText("$Project\sitemap.xml")
  if (-not $sm.Contains("/flashcards.html")) {
    $add = ""
    foreach ($p in "flashcards.html", "formulas.html", "homework.html", "videos.html") { $add += "  <url><loc>https://mathsolveiq.vercel.app/$p</loc><priority>0.6</priority></url>`n" }
    $sm = $sm.Replace("</urlset>", $add + "</urlset>"); [IO.File]::WriteAllText("$Project\sitemap.xml", $sm, $utf8); Write-Host "OK    4 pages added to sitemap.xml" -ForegroundColor Green
  } else { Write-Host "ok    sitemap already lists them" -ForegroundColor DarkGreen }
} else { Write-Host "NOTE  sitemap.xml not found, skipped" -ForegroundColor Yellow }

Write-Host "`n--- 4. Checks ---" -ForegroundColor Cyan
foreach ($m in "flashcards.html", "formulas.html", "homework.html", "videos.html", "js\studydata.js", "js\videos-data.js", "add-video.ps1") {
  if (Test-Path "$Project\$m") { Write-Host "found    $m" -ForegroundColor Green } else { Write-Host "MISSING  $m" -ForegroundColor Red }
}
git add -A 2>$null
git commit -m "study pack: flashcards, formulas, homework, videos" 2>$null | Out-Null
Write-Host "`nSaved locally. NOT deployed yet. When you are ready, run once:" -ForegroundColor Cyan
Write-Host "  npx vercel --prod"
Write-Host "  git push"
