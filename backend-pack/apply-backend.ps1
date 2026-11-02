# MathSolveIQ AI backend: copies the serverless function and the front-end hookup.
# Run:  Set-ExecutionPolicy -Scope Process Bypass; & ".\apply-backend.ps1" -Project "D:\mathsolver\mathsolveiq"
param([string]$Project = "D:\mathsolver\mathsolveiq")
$pack = $PSScriptRoot
$utf8 = New-Object System.Text.UTF8Encoding $false
if (-not (Test-Path "$Project\index.html")) { Write-Host "index.html not found in $Project" -ForegroundColor Red; exit 1 }
Set-Location $Project
if (-not (Test-Path ".git")) { git init | Out-Null }
git add -A 2>$null
git commit -m "before backend" 2>$null | Out-Null

New-Item -ItemType Directory -Force "$Project\api", "$Project\js" | Out-Null
Copy-Item "$pack\api\solve.js" "$Project\api\solve.js" -Force
Copy-Item "$pack\js\solve.js" "$Project\js\solve.js" -Force
Write-Host "OK    api\solve.js and js\solve.js copied" -ForegroundColor Green

$t = [IO.File]::ReadAllText("$Project\index.html")
if ($t.Contains("js/solve.js")) {
  Write-Host "ok    index.html already loads js/solve.js" -ForegroundColor DarkGreen
} elseif ($t.Contains("js/home-links.js")) {
  $t = [regex]::Replace($t, '(<script src="js/home-links\.js"></script>)', '$1' + "`n" + '<script src="js/solve.js"></script>', 1)
  [IO.File]::WriteAllText("$Project\index.html", $t, $utf8)
  Write-Host "OK    js/solve.js added to index.html" -ForegroundColor Green
} elseif ($t.Contains("js/app.js")) {
  $t = [regex]::Replace($t, '(<script src="js/app\.js"></script>)', '$1' + "`n" + '<script src="js/solve.js"></script>', 1)
  [IO.File]::WriteAllText("$Project\index.html", $t, $utf8)
  Write-Host "OK    js/solve.js added to index.html" -ForegroundColor Green
} else {
  Write-Host "NOTE  Add this line before </body> in index.html (after the other scripts):  <script src=""js/solve.js""></script>" -ForegroundColor Yellow
}
git add -A 2>$null
git commit -m "add AI backend" 2>$null | Out-Null

Write-Host "`nNEXT (do these 2 commands yourself):" -ForegroundColor Cyan
Write-Host "  1)  npx vercel env add ANTHROPIC_API_KEY production      (paste your key when asked, nothing is shown)"
Write-Host "  2)  npx vercel --prod"
Write-Host "Never type the key into a file or send it in chat." -ForegroundColor Yellow
