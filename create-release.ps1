# Locale Release Script
# Creates a git tag and GitHub release with installers

param(
    [Parameter(Mandatory=$false)]
    [string]$Version,
    
    [Parameter(Mandatory=$false)]
    [switch]$SkipBuild,
    
    [Parameter(Mandatory=$false)]
    [switch]$DryRun
)

# Color output functions
function Write-Success { Write-Host $args -ForegroundColor Green }
function Write-Error { Write-Host $args -ForegroundColor Red }
function Write-Info { Write-Host $args -ForegroundColor Cyan }
function Write-Warning { Write-Host $args -ForegroundColor Yellow }

# Get version from package.json if not provided
if (-not $Version) {
    $packageJson = Get-Content "localtranslate/package.json" -Raw | ConvertFrom-Json
    $Version = $packageJson.version
    Write-Info "Using version from package.json: $Version"
}

$TagName = "v$Version"
$ReleaseNotesFile = "RELEASE_v$Version.md"

# Validate release notes file exists
if (-not (Test-Path $ReleaseNotesFile)) {
    Write-Error "Release notes file not found: $ReleaseNotesFile"
    Write-Info "Please create the release notes file first."
    exit 1
}

Write-Info "Creating release for version $Version"
Write-Info "Tag: $TagName"
Write-Info "Release notes: $ReleaseNotesFile"

# Check if tag already exists
$existingTag = git tag -l $TagName
if ($existingTag) {
    Write-Error "Tag $TagName already exists!"
    Write-Warning "To recreate, first delete the tag:"
    Write-Warning "  git tag -d $TagName"
    Write-Warning "  git push origin :refs/tags/$TagName"
    exit 1
}

# Check if working directory is clean
$status = git status --porcelain
if ($status -and -not $DryRun) {
    Write-Error "Working directory is not clean. Please commit or stash changes first."
    Write-Info "Uncommitted changes:"
    git status --short
    exit 1
}

# Build the application
if (-not $SkipBuild) {
    Write-Info "`nCleaning old build artifacts..."
    $bundleDir = "localtranslate/src-tauri/target/release/bundle"
    if (Test-Path $bundleDir) {
        Remove-Item $bundleDir -Recurse -Force
        Write-Success "Old build artifacts removed"
    }
    
    Write-Info "`nBuilding application..."
    Push-Location "localtranslate"
    
    Write-Info "Running: npm run tauri build"
    npm run tauri build
    
    if ($LASTEXITCODE -ne 0) {
        Write-Error "Build failed!"
        Pop-Location
        exit 1
    }
    
    Pop-Location
    Write-Success "Build completed successfully!"
} else {
    Write-Warning "Skipping build (--SkipBuild flag set)"
    Write-Warning "Using existing installers - make sure they are for the correct version!"
}

# Find installer files
$bundleDir = "localtranslate/src-tauri/target/release/bundle"

if (-not (Test-Path $bundleDir)) {
    Write-Error "Bundle directory not found: $bundleDir"
    Write-Info "Please run the build first or remove --SkipBuild flag"
    exit 1
}

# Detect platform and find installers
$installers = @()

Write-Info "`nSearching for installers..."

# Windows installers
$msiDir = Join-Path $bundleDir "msi"
$nsisDir = Join-Path $bundleDir "nsis"
if (Test-Path $msiDir) {
    $msiFiles = Get-ChildItem "$msiDir/*.msi" -ErrorAction SilentlyContinue
    if ($msiFiles) { $installers += $msiFiles }
}
if (Test-Path $nsisDir) {
    $exeFiles = Get-ChildItem "$nsisDir/*.exe" -ErrorAction SilentlyContinue
    if ($exeFiles) { $installers += $exeFiles }
}

# macOS installers
$dmgDir = Join-Path $bundleDir "dmg"
$macosDir = Join-Path $bundleDir "macos"
if (Test-Path $dmgDir) {
    $dmgFiles = Get-ChildItem "$dmgDir/*.dmg" -ErrorAction SilentlyContinue
    if ($dmgFiles) { $installers += $dmgFiles }
}
if (Test-Path $macosDir) {
    $appFiles = Get-ChildItem "$macosDir/*.app" -Recurse -Depth 1 -ErrorAction SilentlyContinue | Where-Object { $_.PSIsContainer }
    if ($appFiles) { $installers += $appFiles }
}

# Linux installers
$debDir = Join-Path $bundleDir "deb"
$appimageDir = Join-Path $bundleDir "appimage"
if (Test-Path $debDir) {
    $debFiles = Get-ChildItem "$debDir/*.deb" -ErrorAction SilentlyContinue
    if ($debFiles) { $installers += $debFiles }
}
if (Test-Path $appimageDir) {
    $appImageFiles = Get-ChildItem "$appimageDir/*.AppImage" -ErrorAction SilentlyContinue
    if ($appImageFiles) { $installers += $appImageFiles }
}

if ($installers.Count -eq 0) {
    Write-Error "No installer files found in $bundleDir"
    Write-Info "`nAvailable directories:"
    if (Test-Path $bundleDir) {
        Get-ChildItem $bundleDir -Directory | ForEach-Object { 
            Write-Info "  - $($_.Name)"
            $files = Get-ChildItem $_.FullName -File
            if ($files) {
                $files | ForEach-Object { Write-Info "    - $($_.Name)" }
            }
        }
    }
    exit 1
}

Write-Success "`nFound $($installers.Count) installer(s):"
foreach ($installer in $installers) {
    $sizeMB = [math]::Round($installer.Length / 1MB, 2)
    Write-Info "  - $($installer.Name) ($sizeMB MB)"
}

# Create GitHub release using gh CLI
$ghArgs = @(
    "release", "create", $TagName,
    "--title", "Locale v$Version",
    "--notes-file", $ReleaseNotesFile
)

# Add all installer files
foreach ($installer in $installers) {
    $ghArgs += $installer.FullName
}

Write-Info "`nCreating GitHub release..."
& gh @ghArgs

if ($LASTEXITCODE -ne 0) {
    Write-Error "Failed to create GitHub release"
    Write-Warning "Tag $TagName has been created and pushed."
    Write-Warning "You may need to create the release manually on GitHub."
    exit 1
}

Write-Success "`n=== Release Created Successfully! ==="
Write-Info "Version: $Version"
Write-Info "Tag: $TagName"
Write-Info "Installers: $($installers.Count) file(s)"
Write-Success "`nView release: https://github.com/PierrunoYT/locale/releases/tag/$TagName"
