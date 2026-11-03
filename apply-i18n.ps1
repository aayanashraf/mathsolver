# MathSolveIQ: Universal Localization & Translation Deployment Script
# Injects the client-side i18n and Google Translate configuration globally across all project pages.
# Usage:
#   Set-ExecutionPolicy -Scope Process Bypass; .\apply-i18n.ps1 -Project "D:\mathsolver\mathsolveiq"

param([string]$Project = "D:\mathsolver\mathsolveiq")

$utf8 = New-Object System.Text.UTF8Encoding $false
if (-not (Test-Path "$Project\index.html")) {
  Write-Host "ERROR: index.html not found in $Project" -ForegroundColor Red
  exit 1
}

Set-Location $Project
try {
  if (-not (Test-Path ".git")) { git init 2>$null | Out-Null }
  git add -A 2>$null
  git commit -m "before translation injection" 2>$null | Out-Null
} catch {}

Write-Host "`n=== MathSolveIQ Universal Translation Deployment ===" -ForegroundColor Cyan

$htmlFiles = Get-ChildItem -Path $Project -Filter *.html -Recurse | Where-Object {
  $_.FullName -notmatch "node_modules|\.vercel|study-pack|update-pack|calc-pack|pwa-pack|analytics-pack|backend-pack"
}

$updated = 0
$alreadyConfigured = 0

foreach ($file in $htmlFiles) {
  $path = $file.FullName
  $content = [IO.File]::ReadAllText($path)
  $orig = $content
  $relPath = $path.Substring($Project.Length + 1)

  # 1. Inject /js/i18n.js into <head>
  if ($content.Contains("js/i18n.js")) {
    $alreadyConfigured++
  } else {
    if ($content -match "</head>") {
      $content = [regex]::Replace($content, "(?i)</head>", "<script defer src=""/js/i18n.js""></script>`n</head>", 1)
    }
  }

  # 2. Ensure semantic <header> exists on subpages with <div class="top">
  if (-not ($content -match "<header\b") -and ($content -match '<div class="top">')) {
    $content = [regex]::Replace($content, '(?s)(<div class="top">.*?</div>)', '<header class="site-subnav">$1</header>', 1)
  }

  if ($content -ne $orig) {
    [IO.File]::WriteAllText($path, $content, $utf8)
    $updated++
    Write-Host "OK    Configured $relPath" -ForegroundColor Green
  }
}

Write-Host "`nSummary:" -ForegroundColor Cyan
Write-Host "  Pages updated:            $updated" -ForegroundColor Green
Write-Host "  Pages already configured: $alreadyConfigured" -ForegroundColor Green
Write-Host "  Total pages scanned:      $($htmlFiles.Count)" -ForegroundColor Green

try {
  git add -A 2>$null
  git commit -m "Inject universal client-side translation engine into all pages" 2>$null | Out-Null
} catch {}
Write-Host "`nDeployment completed successfully. All pages now support multilingual translation!" -ForegroundColor Cyan
