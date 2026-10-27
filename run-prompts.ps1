# Usage (PowerShell, inside this folder):  .\run-prompts.ps1 1 4   -> runs prompts 1 to 4
param([int]$From = 1, [int]$To = 1)
if (-not (Test-Path .git)) { git init | Out-Null; git add -A; git commit -m "start" | Out-Null }
$lines = Get-Content PROMPTS.md | Where-Object { $_ -match '^\d+\. ' }
foreach ($l in $lines) {
  $n = [int](($l -split '\.')[0])
  if ($n -lt $From -or $n -gt $To) { continue }
  $p = $l -replace '^\d+\.\s*', ''
  Write-Host "=== Prompt $n : $p ===" -ForegroundColor Cyan
  claude -p $p --permission-mode acceptEdits --allowedTools "Read,Write,Edit,Bash(npm *),Bash(node *)"
  git add -A; git commit -m "prompt $n" | Out-Null
}
