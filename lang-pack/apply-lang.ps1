# Language: only English and Turkish. Removes the language dropdown (two buttons instead),
# limits the AI server to English/Turkish, makes the microphone follow the choice, and fixes the text on the site.
# Run:  Set-ExecutionPolicy -Scope Process Bypass; & ".\apply-lang.ps1" -Project "D:\mathsolver\mathsolveiq"
param([string]$Project = "D:\mathsolver\mathsolveiq")
$pack = $PSScriptRoot
$utf8 = New-Object System.Text.UTF8Encoding $false
if (-not (Test-Path "$Project\index.html")) { Write-Host "index.html not found in $Project" -ForegroundColor Red; exit 1 }
Set-Location $Project
if (-not (Test-Path ".git")) { git init | Out-Null }
git add -A 2>$null
git commit -m "before language change" 2>$null | Out-Null

Write-Host "`n--- 1. Files ---" -ForegroundColor Cyan
New-Item -ItemType Directory -Force "$Project\api", "$Project\js" | Out-Null
Copy-Item "$pack\api\solve.js" "$Project\api\solve.js" -Force; Write-Host "OK    api\solve.js (English + Turkish only)" -ForegroundColor Green
Copy-Item "$pack\js\solve.js" "$Project\js\solve.js" -Force; Write-Host "OK    js\solve.js (English | Turkce buttons, no dropdown)" -ForegroundColor Green
Copy-Item "$pack\js\extras.js" "$Project\js\extras.js" -Force; Write-Host "OK    js\extras.js (mic follows the language)" -ForegroundColor Green

Write-Host "`n--- 2. Text on the pages ---" -ForegroundColor Cyan
function Fix($file, $old, $new) {
  $p = Join-Path $Project $file
  if (-not (Test-Path $p)) { Write-Host "skip  $file (not found)" -ForegroundColor Yellow; return }
  $t = [IO.File]::ReadAllText($p)
  if ($t.Contains($old)) { [IO.File]::WriteAllText($p, $t.Replace($old, $new), $utf8); Write-Host "OK    $file text updated" -ForegroundColor Green }
  else { Write-Host "ok    $file (that sentence is not there, nothing to change)" -ForegroundColor DarkGreen }
}
Fix "index.html" "Explanations in English, Urdu, Hindi and Roman Urdu." "Explanations in English and Turkish."
Fix "about.html" "We care about students who study in English, Urdu, Hindi and Roman Urdu, and about exams like FSc, O and A Level, SAT and JEE. We are adding more languages and topics step by step." "The solver can explain in English and Turkish, and we build practice for exams like FSc, O and A Level, SAT and JEE. We are adding more topics step by step."

Write-Host "`n--- 3. Any other mention of removed languages? ---" -ForegroundColor Cyan
$hits = Select-String -Path "$Project\*.html", "$Project\js\*.js", "$Project\api\*.js" -Pattern "Roman Urdu|Urdu|Hindi|Arabic|Spanish|French" -ErrorAction SilentlyContinue
if ($hits) { $hits | ForEach-Object { Write-Host ("{0}:{1}  {2}" -f (Split-Path $_.Path -Leaf), $_.LineNumber, $_.Line.Trim().Substring(0, [Math]::Min(110, $_.Line.Trim().Length))) -ForegroundColor Yellow }
  Write-Host "Lines above still mention other languages. Tell me which ones to change." -ForegroundColor Yellow }
else { Write-Host "OK    no other mentions" -ForegroundColor Green }

git add -A 2>$null
git commit -m "language: English and Turkish only" 2>$null | Out-Null
Write-Host "`nSaved. The server file changed, so deploy once:  npx vercel --prod   then   git push" -ForegroundColor Cyan
