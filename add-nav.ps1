# Puts the study pages in the left sidebar (top bar on phones), not only in the footer.
# Run:  Set-ExecutionPolicy -Scope Process Bypass; & "$HOME\Downloads\add-nav.ps1" -Project "D:\mathsolver\mathsolveiq"
param([string]$Project = "D:\mathsolver\mathsolveiq")
$utf8 = New-Object System.Text.UTF8Encoding $false
$ip = "$Project\index.html"
if (-not (Test-Path $ip)) { Write-Host "index.html not found in $Project" -ForegroundColor Red; exit 1 }
Set-Location $Project
if (-not (Test-Path ".git")) { git init | Out-Null }
git add -A 2>$null
git commit -m "before nav links" 2>$null | Out-Null

$t = [IO.File]::ReadAllText($ip)
$m = [regex]::Match($t, '(?s)<nav\b[^>]*\bid="nav"[^>]*>.*?</nav>')
if (-not $m.Success) {
  Write-Host "NOTE  Could not find <nav id=""nav""> in index.html. Send me the first 40 lines of index.html and I will fix it." -ForegroundColor Yellow
  exit 0
}
$nav = $m.Value
$items = @(
  @("quiz.html", "Practice Quizzes"),
  @("exam-mode.html", "Exam Modes"),
  @("flashcards.html", "Flashcards"),
  @("homework.html", "Homework Mode"),
  @("videos.html", "Video Lessons")
)
$new = $nav
$added = 0
foreach ($i in $items) {
  if (-not (Test-Path "$Project\$($i[0])")) { Write-Host "skip  $($i[0]) (file is not in the project yet)" -ForegroundColor Yellow; continue }
  if ($new.Contains('href="' + $i[0] + '"')) { Write-Host "ok    $($i[1]) is already in the menu" -ForegroundColor DarkGreen; continue }
  $new = $new.Replace("</nav>", '<a href="' + $i[0] + '">' + $i[1] + '</a>' + "`n</nav>")
  $added++
  Write-Host "OK    added $($i[1])" -ForegroundColor Green
}
# the old "Formulas" menu item opens the small built-in list; point it to the new searchable library
if ((Test-Path "$Project\formulas.html") -and $new.Contains('<a href="#formulas">Formulas</a>')) {
  $new = $new.Replace('<a href="#formulas">Formulas</a>', '<a href="formulas.html">Formulas</a>')
  Write-Host "OK    Formulas now opens the new Formula Library" -ForegroundColor Green
}
if ($new -ne $nav) {
  $t = $t.Replace($nav, $new)
  [IO.File]::WriteAllText($ip, $t, $utf8)
  git add -A 2>$null
  git commit -m "study pages in the sidebar menu" 2>$null | Out-Null
  Write-Host "`nSaved. Open index.html with Live Server to look, then deploy once when you are ready:  npx vercel --prod ; git push" -ForegroundColor Cyan
} else {
  Write-Host "`nNothing to change." -ForegroundColor Cyan
}
