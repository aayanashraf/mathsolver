# MathSolveIQ: apply all downloaded files to this project in one go.
# Run INSIDE the mathsolveiq folder (the one with index.html):
#   Set-ExecutionPolicy -Scope Process Bypass; .\apply-all.ps1
# Optional: .\apply-all.ps1 -Src "D:\my-downloads"      (where the downloaded files are)
#           .\apply-all.ps1 -NoDeploy                    (skip the Vercel deploy)
param([string]$Src = "$HOME\Downloads", [switch]$NoDeploy)

$root = $PWD.Path
if (-not (Test-Path "$root\index.html")) {
  Write-Host "index.html not found. Open the mathsolveiq folder in the terminal first." -ForegroundColor Red
  exit 1
}
$utf8 = New-Object System.Text.UTF8Encoding $false

# Safety: save the current state so you can undo with:  git checkout .   or   git reset --hard HEAD~1
if (-not (Test-Path "$root\.git")) { git init | Out-Null }
git add -A 2>$null
git commit -m "before apply-all" 2>$null | Out-Null

function Latest($pattern) {
  Get-ChildItem -Path $Src -Filter $pattern -File -ErrorAction SilentlyContinue |
    Sort-Object LastWriteTime -Descending | Select-Object -First 1
}
function Put($pattern, $dest) {
  $f = Latest $pattern
  if ($f) {
    $target = Join-Path $root $dest
    New-Item -ItemType Directory -Force (Split-Path $target) | Out-Null
    Copy-Item $f.FullName $target -Force
    Write-Host "OK    $dest" -ForegroundColor Green
  } else {
    Write-Host "MISS  $pattern not found in $Src" -ForegroundColor Yellow
  }
}

Write-Host "`n--- 1. Copying files from $Src ---" -ForegroundColor Cyan
Put "privacy*.html"     "privacy.html"
Put "terms*.html"       "terms.html"
Put "contact*.html"     "contact.html"
Put "about*.html"       "about.html"
Put "robots*.txt"       "robots.txt"
Put "sitemap*.xml"      "sitemap.xml"
Put "og-image*.png"     "images\og-image.png"
Put "favicon*.svg"      "images\favicon.svg"
Put "logo*.svg"         "images\logo.svg"
Put "home-links*.js"    "js\home-links.js"

Write-Host "`n--- 2. Calculator pack ---" -ForegroundColor Cyan
$zip = Latest "calc-pack*.zip"
if ($zip) {
  $tmp = Join-Path $env:TEMP "msiq-calc-pack"
  if (Test-Path $tmp) { Remove-Item $tmp -Recurse -Force }
  Expand-Archive $zip.FullName $tmp -Force
  $pack = Join-Path $tmp "calc-pack"
  if (-not (Test-Path $pack)) { $pack = $tmp }
  New-Item -ItemType Directory -Force "$root\calculator", "$root\js" | Out-Null
  Copy-Item "$pack\calculator\*" "$root\calculator" -Recurse -Force
  Copy-Item "$pack\js\calc.js" "$root\js\calc.js" -Force
  Write-Host "OK    calculator\ (11 pages + index) and js\calc.js" -ForegroundColor Green

  if (Test-Path "$root\vercel.json") {
    Write-Host "NOTE  vercel.json already exists, not overwritten. Make sure it has: cleanUrls true and trailingSlash false" -ForegroundColor Yellow
  } else {
    Copy-Item "$pack\vercel.json" "$root\vercel.json" -Force
    Write-Host "OK    vercel.json" -ForegroundColor Green
  }

  $addFile = "$pack\sitemap-add.txt"
  if ((Test-Path $addFile) -and (Test-Path "$root\sitemap.xml")) {
    $sm = [IO.File]::ReadAllText("$root\sitemap.xml")
    if ($sm -notmatch "/calculator/fraction") {
      $add = [IO.File]::ReadAllText($addFile)
      $sm = $sm.Replace("</urlset>", $add + "</urlset>")
      [IO.File]::WriteAllText("$root\sitemap.xml", $sm, $utf8)
      Write-Host "OK    sitemap.xml now lists the calculator pages" -ForegroundColor Green
    } else {
      Write-Host "OK    sitemap.xml already lists the calculator pages" -ForegroundColor Green
    }
  }
} else {
  Write-Host "MISS  calc-pack.zip not found in $Src" -ForegroundColor Yellow
}

Write-Host "`n--- 3. Editing index.html ---" -ForegroundColor Cyan
$ip = "$root\index.html"
$t = [IO.File]::ReadAllText($ip)
$orig = $t

if ($t -notmatch 'rel="canonical"') {
  $meta = @'
<link rel="canonical" href="https://mathsolveiq.vercel.app/">
<meta name="robots" content="index, follow, max-image-preview:large">
<meta property="og:type" content="website">
<meta property="og:site_name" content="MathSolveIQ">
<meta property="og:title" content="MathSolveIQ - Free AI Math Helper">
<meta property="og:description" content="Free math helper with step-by-step explanations, hints, graphing, calculators and exam practice.">
<meta property="og:url" content="https://mathsolveiq.vercel.app/">
<meta property="og:image" content="https://mathsolveiq.vercel.app/images/og-image.png">
<meta property="og:image:width" content="1200">
<meta property="og:image:height" content="630">
<meta name="twitter:card" content="summary_large_image">
<meta name="twitter:title" content="MathSolveIQ - Free AI Math Helper">
<meta name="twitter:description" content="Step-by-step math help, hints, graphing, calculators and exam practice.">
<meta name="twitter:image" content="https://mathsolveiq.vercel.app/images/og-image.png">
<script type="application/ld+json">{"@context":"https://schema.org","@type":"WebSite","name":"MathSolveIQ","url":"https://mathsolveiq.vercel.app/"}</script>
'@
  $t = $t.Replace("</head>", $meta + "</head>")
  Write-Host "OK    SEO tags added to <head>" -ForegroundColor Green
} else { Write-Host "OK    SEO tags already there" -ForegroundColor Green }

if ($t -notmatch 'favicon\.svg') {
  $t = $t.Replace("</head>", '<link rel="icon" href="images/favicon.svg" type="image/svg+xml">' + "`n</head>")
  Write-Host "OK    favicon link added" -ForegroundColor Green
}

if ($t -notmatch 'home-links\.js') {
  $t = $t.Replace("</body>", '<script src="js/home-links.js"></script>' + "`n</body>")
  Write-Host "OK    home-links.js added" -ForegroundColor Green
} else { Write-Host "OK    home-links.js already there" -ForegroundColor Green }

if ($t -notmatch 'href="about\.html"') {
  $rx = [regex]'(<a[^>]*href="[^"]*contact\.html"[^>]*>[^<]*</a>)'
  if ($rx.IsMatch($t)) {
    $t = $rx.Replace($t, '$1 <a href="about.html">About</a>', 1)
    Write-Host "OK    About link added to footer" -ForegroundColor Green
  } else {
    Write-Host "NOTE  Could not find the Contact link in the footer. Add this by hand: <a href=""about.html"">About</a>" -ForegroundColor Yellow
  }
}

$t = $t.Replace('<a href="#calculators">Calculators</a>', '<a href="/calculator">Calculators</a>')

if ($t -ne $orig) { [IO.File]::WriteAllText($ip, $t, $utf8); Write-Host "OK    index.html saved" -ForegroundColor Green }

Write-Host "`n--- 4. Checks ---" -ForegroundColor Cyan
$must = "index.html","privacy.html","terms.html","contact.html","about.html","sitemap.xml","robots.txt","images\og-image.png","images\favicon.svg","images\logo.svg","js\calc.js","js\home-links.js","calculator\index.html","calculator\slope.html","vercel.json"
foreach ($m in $must) {
  if (Test-Path "$root\$m") { Write-Host "found    $m" -ForegroundColor Green } else { Write-Host "MISSING  $m" -ForegroundColor Red }
}
if (Test-Path "$root\contact.html") {
  if ((Get-Content "$root\contact.html" -Raw) -match 'support@mathsolveiq\.com') {
    Write-Host "`nREMINDER: contact.html still uses support@mathsolveiq.com. Change CONTACT_EMAIL inside it to your real email." -ForegroundColor Yellow
  }
}

git add -A 2>$null
git commit -m "apply-all: legal pages, SEO, calculators" 2>$null | Out-Null

if (-not $NoDeploy) {
  Write-Host "`n--- 5. Deploying to Vercel ---" -ForegroundColor Cyan
  npx vercel --prod
} else {
  Write-Host "`nSkipped deploy. Run later:  npx vercel --prod" -ForegroundColor Yellow
}
Write-Host "`nDone. Open your site and press Ctrl+Shift+R." -ForegroundColor Cyan
