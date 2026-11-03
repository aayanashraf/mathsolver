# Add a video to the library:
#   .\add-video.ps1 -Url "https://www.youtube.com/watch?v=XXXXXXXXXXX" -Title "Quadratic formula explained" -Topic Quadratics -Channel "Khan Academy"
# Topic: Algebra, Quadratics, Trigonometry, Calculus, Geometry, Statistics, Matrices or "Exam prep"
param(
  [Parameter(Mandatory = $true)][string]$Url,
  [Parameter(Mandatory = $true)][string]$Title,
  [Parameter(Mandatory = $true)][ValidateSet("Algebra", "Quadratics", "Trigonometry", "Calculus", "Geometry", "Statistics", "Matrices", "Exam prep")][string]$Topic,
  [string]$Channel = "YouTube",
  [string]$Project = "D:\mathsolver\mathsolveiq"
)
$m = [regex]::Match($Url, '(?:[?&]v=|youtu\.be/|/embed/|/shorts/)([A-Za-z0-9_-]{11})')
if (-not $m.Success) { Write-Host "Could not find a YouTube video id in that link." -ForegroundColor Red; exit 1 }
$id = $m.Groups[1].Value
$file = Join-Path $Project "js\videos-data.js"
if (-not (Test-Path $file)) { Write-Host "Not found: $file" -ForegroundColor Red; exit 1 }
$t = [IO.File]::ReadAllText($file)
if ($t.Contains('id: "' + $id + '"')) { Write-Host "That video is already in the library." -ForegroundColor Yellow; exit 0 }
function Q($s) { return $s.Replace('\', '\\').Replace('"', '\"') }
$line = '  { id: "' + $id + '", title: "' + (Q $Title) + '", topic: "' + $Topic + '", channel: "' + (Q $Channel) + '" },' + "`n  /* VIDEOS-END */"
if (-not $t.Contains("/* VIDEOS-END */")) { Write-Host "The marker /* VIDEOS-END */ is missing in videos-data.js" -ForegroundColor Red; exit 1 }
$t = $t.Replace("  /* VIDEOS-END */", $line)
[IO.File]::WriteAllText($file, $t, (New-Object System.Text.UTF8Encoding $false))
Write-Host "Added: $Title ($id) under $Topic" -ForegroundColor Green
