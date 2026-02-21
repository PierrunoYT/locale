# Clean Release Assets Script
# Removes installer files from a GitHub release

param(
    [Parameter(Mandatory=$false)]
    [string]$Tag,
    
    [Parameter(Mandatory=$false)]
    [switch]$DryRun,
    
    [Parameter(Mandatory=$false)]
    [switch]$DeleteRelease
)

# Color output functions
function Write-Success { Write-Host $args -ForegroundColor Green }
function Write-Error { Write-Host $args -ForegroundColor Red }
function Write-Info { Write-Host $args -ForegroundColor Cyan }
function Write-Warning { Write-Host $args -ForegroundColor Yellow }

# Check if gh CLI is installed
$ghInstalled = Get-Command gh -ErrorAction SilentlyContinue
if (-not $ghInstalled) {
    Write-Error "GitHub CLI (gh) is not installed"
    Write-Info "Install from: https://cli.github.com/"
    exit 1
}

# Get latest release tag if not provided
if (-not $Tag) {
    Write-Info "Fetching latest release..."
    $Tag = gh release list --limit 1 --json tagName --jq '.[0].tagName' 2>$null
    
    if ($LASTEXITCODE -ne 0 -or -not $Tag) {
        Write-Error "Failed to fetch latest release"
        Write-Info "No releases found or error accessing GitHub"
        exit 1
    }
    
    Write-Info "Latest release: $Tag"
}

# Verify release exists
Write-Info "Checking release $Tag..."
$releaseInfo = gh release view $Tag --json assets,tagName 2>$null

if ($LASTEXITCODE -ne 0) {
    Write-Error "Release $Tag not found"
    Write-Info "Available releases:"
    gh release list --limit 10
    exit 1
}

$release = $releaseInfo | ConvertFrom-Json

Write-Success "Found release: $($release.tagName)"

# Get assets
$assets = $release.assets

if ($assets.Count -eq 0) {
    Write-Warning "No assets found in release $Tag"
    exit 0
}

Write-Info "`nFound $($assets.Count) asset(s):"
foreach ($asset in $assets) {
    $sizeMB = [math]::Round($asset.size / 1MB, 2)
    Write-Info "  - $($asset.name) ($sizeMB MB)"
}

# Dry run check
if ($DryRun) {
    Write-Warning "`n=== DRY RUN MODE ==="
    
    if ($DeleteRelease) {
        Write-Info "Would delete entire release: $Tag"
    } else {
        Write-Info "Would delete $($assets.Count) asset(s) from release: $Tag"
        foreach ($asset in $assets) {
            Write-Info "  - $($asset.name)"
        }
    }
    
    Write-Success "`nDry run completed. No changes made."
    exit 0
}

# Confirm action
if ($DeleteRelease) {
    Write-Warning "`n⚠️  WARNING: This will DELETE the entire release: $Tag"
    Write-Warning "This action cannot be undone!"
} else {
    Write-Warning "`n⚠️  WARNING: This will DELETE $($assets.Count) asset(s) from release: $Tag"
    foreach ($asset in $assets) {
        Write-Warning "  - $($asset.name)"
    }
}

$confirmation = Read-Host "`nType 'yes' to confirm"

if ($confirmation -ne "yes") {
    Write-Info "Operation cancelled"
    exit 0
}

# Delete entire release or just assets
if ($DeleteRelease) {
    Write-Info "`nDeleting release $Tag..."
    gh release delete $Tag --yes
    
    if ($LASTEXITCODE -ne 0) {
        Write-Error "Failed to delete release"
        exit 1
    }
    
    Write-Success "Release $Tag deleted successfully!"
    
    # Ask if user wants to delete the tag too
    Write-Warning "`nThe git tag $Tag still exists."
    $deleteTag = Read-Host "Delete the git tag too? (yes/no)"
    
    if ($deleteTag -eq "yes") {
        Write-Info "Deleting local tag..."
        git tag -d $Tag
        
        Write-Info "Deleting remote tag..."
        git push origin :refs/tags/$Tag
        
        if ($LASTEXITCODE -eq 0) {
            Write-Success "Git tag deleted successfully!"
        } else {
            Write-Error "Failed to delete remote tag"
        }
    }
} else {
    # Delete individual assets
    Write-Info "`nDeleting assets..."
    $successCount = 0
    $failCount = 0
    
    foreach ($asset in $assets) {
        Write-Info "Deleting: $($asset.name)"
        gh release delete-asset $Tag $asset.name --yes 2>$null
        
        if ($LASTEXITCODE -eq 0) {
            $successCount++
            Write-Success "  ✓ Deleted"
        } else {
            $failCount++
            Write-Error "  ✗ Failed"
        }
    }
    
    Write-Info "`nResults:"
    Write-Success "  Deleted: $successCount"
    if ($failCount -gt 0) {
        Write-Error "  Failed: $failCount"
    }
    
    if ($successCount -eq $assets.Count) {
        Write-Success "`nAll assets deleted successfully!"
    }
}

Write-Success "`n=== Cleanup Complete ==="
