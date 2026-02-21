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

if ($IsWindows -or $env:OS -match "Windows") {
    Write-Info "Detecting Windows installers..."
    $msiFiles = Get-ChildItem "$bundleDir/msi/*.msi" -ErrorAction SilentlyContinue
    $exeFiles = Get-ChildItem "$bundleDir/nsis/*.exe" -ErrorAction SilentlyContinue
    $installers += $msiFiles
    $installers += $exeFiles
} elseif ($IsMacOS) {
    Write-Info "Detecting macOS installers..."
    $dmgFiles = Get-ChildItem "$bundleDir/dmg/*.dmg" -ErrorAction SilentlyContinue
    $appFiles = Get-ChildItem "$bundleDir/macos/*.app" -ErrorAction SilentlyContinue
    $installers += $dmgFiles
    $installers += $appFiles
} elseif ($IsLinux) {
    Write-Info "Detecting Linux installers..."
    $debFiles = Get-ChildItem "$bundleDir/deb/*.deb" -ErrorAction SilentlyContinue
    $appImageFiles = Get-ChildItem "$bundleDir/appimage/*.AppImage" -ErrorAction SilentlyContinue
    $installers += $debFiles
    $installers += $appImageFiles
}

if ($installers.Count -eq 0) {
    Write-Error "No installer files found in $bundleDir"
    Write-Info "Available directories:"
    Get-ChildItem $bundleDir -Directory | ForEach-Object { Write-Info "  - $($_.Name)" }
    exit 1
}

Write-Success "`nFound $($installers.Count) installer(s):"
$installers | ForEach-Object { Write-Info "  - $($_.Name) ($([math]::Round($_.Length / 1MB, 2)) MB)" }

# Dry run check
if ($DryRun) {
    Write-Warning "`n=== DRY RUN MODE ==="
    Write-Info "Would create tag: $TagName"
    Write-Info "Would create GitHub release with:"
    Write-Info "  - Release notes from: $ReleaseNotesFile"
    Write-Info "  - Installers: $($installers.Count) file(s)"
    Write-Success "`nDry run completed. No changes made."
    exit 0
}

# Create git tag
Write-Info "`nCreating git tag: $TagName"
git tag -a $TagName -m "Release version $Version"

if ($LASTEXITCODE -ne 0) {
    Write-Error "Failed to create git tag"
    exit 1
}

Write-Success "Git tag created successfully"

# Push tag to remote
Write-Info "Pushing tag to remote..."
git push origin $TagName

if ($LASTEXITCODE -ne 0) {
    Write-Error "Failed to push tag to remote"
    Write-Warning "Tag created locally. To remove: git tag -d $TagName"
    exit 1
}

Write-Success "Tag pushed to remote successfully"

# Create GitHub release using gh CLI
Write-Info "`nCreating GitHub release..."

# Check if gh CLI is installed
$ghInstalled = Get-Command gh -ErrorAction SilentlyContinue
if (-not $ghInstalled) {
    Write-Error "GitHub CLI (gh) is not installed"
    Write-Info "Install from: https://cli.github.com/"
    Write-Warning "Tag $TagName has been created and pushed."
    Write-Warning "You can create the release manually on GitHub."
    exit 1
}

# Build gh release create command with all installers
$ghArgs = @(
    "release", "create", $TagName,
    "--title", "Locale $Version",
    "--notes-file", $ReleaseNotesFile
)

# Add all installer files
foreach ($installer in $installers) {
    $ghArgs += $installer.FullName
}

Write-Info "Running: gh $($ghArgs -join ' ')"
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
