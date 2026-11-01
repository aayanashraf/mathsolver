# MathSolveIQ extras: microphone ON indicator + on-page scientific calculator.
# Run:  Set-ExecutionPolicy -Scope Process Bypass; & ".\apply-extras.ps1" -Project "D:\mathsolver\mathsolveiq"
param([string]$Project = "D:\mathsolver\mathsolveiq", [switch]$NoDeploy)
$pack = $PSScriptRoot
$utf8 = New-Object System.Text.UTF8Encoding $false
if (-not (Test-Path "$Project\index.html")) { Write-Host "index.html not found in $Project" -ForegroundColor Red; exit 1 }
Set-Location $Project
if (-not (Test-Path ".git")) { git init | Out-Null }
git add -A 2>$null
git commit -m "before extras" 2>$null | Out-Null

New-Item -ItemType Directory -Force "$Project\js" | Out-Null
Copy-Item "$pack\js\extras.js" "$Project\js\extras.js" -Force
Write-Host "OK    js\extras.js copied" -ForegroundColor Green

$t = [IO.File]::ReadAllText("$Project\index.html")
if ($t.Contains("js/extras.js")) {
  Write-Host "ok    index.html already loads js/extras.js" -ForegroundColor DarkGreen
} else {
  $tag = '<script src="js/extras.js"></script>'
  $done = $false
  foreach ($anchor in 'js/solve.js', 'js/home-links.js', 'js/app.js') {
    if (-not $done -and $t.Contains($anchor)) {
      $rx = '(<script src="' + [regex]::Escape($anchor) + '"></script>)'
      $t = [regex]::Replace($t, $rx, '$1' + "`n" + $tag, 1)
      $done = $true
    }
  }
  if (-not $done) { $t = $t.Replace("</body>", $tag + "`n</body>"); $done = $true }
  [IO.File]::WriteAllText("$Project\index.html", $t, $utf8)
  Write-Host "OK    js/extras.js added to index.html (after the other scripts)" -ForegroundColor Green
}
git add -A 2>$null
git commit -m "mic indicator and calculator" 2>$null | Out-Null
if (-not $NoDeploy) { Write-Host "`nDeploying..." -ForegroundColor Cyan; npx vercel --prod } else { Write-Host "`nSkipped deploy. Run:  npx vercel --prod" -ForegroundColor Yellow }
Write-Host "`nDone. Open the site and press Ctrl+Shift+R." -ForegroundColor Cyan
