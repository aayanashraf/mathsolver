# Makes the AI server able to use the FREE Google Gemini key (or Claude if you add that later).
# Run:  Set-ExecutionPolicy -Scope Process Bypass; & ".\apply-gemini.ps1" -Project "D:\mathsolver\mathsolveiq"
param([string]$Project = "D:\mathsolver\mathsolveiq")
$pack = $PSScriptRoot
if (-not (Test-Path "$Project\index.html")) { Write-Host "index.html not found in $Project" -ForegroundColor Red; exit 1 }
Set-Location $Project
if (-not (Test-Path ".git")) { git init | Out-Null }
git add -A 2>$null
git commit -m "before gemini" 2>$null | Out-Null
New-Item -ItemType Directory -Force "$Project\api" | Out-Null
Copy-Item "$pack\api\solve.js" "$Project\api\solve.js" -Force
node --check "$Project\api\solve.js" 2>&1 | Out-Null
if ($LASTEXITCODE -eq 0) { Write-Host "OK    api\solve.js updated (syntax ok)" -ForegroundColor Green } else { Write-Host "ERROR api\solve.js has a syntax error" -ForegroundColor Red }
git add -A 2>$null
git commit -m "AI server: free Gemini option" 2>$null | Out-Null
Write-Host "`nNEXT:" -ForegroundColor Cyan
Write-Host "  1) Get a free key:  https://aistudio.google.com/apikey   (sign in with Google, Create API key)"
Write-Host "  2) npx vercel env add GEMINI_API_KEY production        (paste the key, Enter)"
Write-Host "  3) npx vercel --prod"
Write-Host "Never put the key in a file or send it in chat." -ForegroundColor Yellow
