# Remove All Releases and Tags Script
# Deletes all GitHub releases and git tags

param(
    [Parameter(Mandatory=$false)]
    [switch]$DryRun,
    
    [Parameter(Mandatory=$false)]
    [switch]$KeepTags
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

# Get all releases
Write-Info "Fetching all releases..."
$releases = gh release list --limit 100 --json tagName,name | ConvertFrom-Json

if ($releases.Count -eq 0) {
    Write-Warning "No releases found"
    $releases = @()
} else {
    Write-Success "Found $($releases.Count) release(s):"
    foreach ($release in $releases) {
        Write-Info "  - $($release.tagName): $($release.name)"
    }
}

# Get all tags
Write-Info "`nFetching all git tags..."
$tags = git tag

if (-not $tags) {
    Write-Warning "No git tags found"
    $tags = @()
} else {
    $tagArray = $tags -split "`n" | Where-Object { $_ -ne "" }
    Write-Success "Found $($tagArray.Count) tag(s):"
    foreach ($tag in $tagArray) {
        Write-Info "  - $tag"
    }
}

# Check if there's anything to delete
if ($releases.Count -eq 0 -and ($tags.Count -eq 0 -or $KeepTags)) {
    Write-Success "`nNothing to delete!"
    exit 0
}

# Dry run check
if ($DryRun) {
    Write-Warning "`n=== DRY RUN MODE ==="
    Write-Info "Would delete $($releases.Count) GitHub release(s)"
    
    if (-not $KeepTags -and $tags) {
        $tagArray = $tags -split "`n" | Where-Object { $_ -ne "" }
        Write-Info "Would delete $($tagArray.Count) git tag(s)"
    }
    
    Write-Success "`nDry run completed. No changes made."
    exit 0
}

# Confirm action
Write-Warning "`n⚠️  DANGER ZONE ⚠️"
Write-Warning "This will DELETE:"
Write-Warning "  - $($releases.Count) GitHub release(s)"

if (-not $KeepTags -and $tags) {
    $tagArray = $tags -split "`n" | Where-Object { $_ -ne "" }
    Write-Warning "  - $($tagArray.Count) git tag(s) (local and remote)"
}

Write-Warning "`nThis action CANNOT be undone!"
$confirmation = Read-Host "`nType 'DELETE ALL' to confirm"

if ($confirmation -ne "DELETE ALL") {
    Write-Info "Operation cancelled"
    exit 0
}

# Delete all GitHub releases
if ($releases.Count -gt 0) {
    Write-Info "`nDeleting GitHub releases..."
    $successCount = 0
    $failCount = 0
    
    foreach ($release in $releases) {
        Write-Info "Deleting release: $($release.tagName)"
        gh release delete $release.tagName --yes 2>$null
        
        if ($LASTEXITCODE -eq 0) {
            $successCount++
            Write-Success "  ✓ Deleted"
        } else {
            $failCount++
            Write-Error "  ✗ Failed"
        }
    }
    
    Write-Info "`nGitHub Releases:"
    Write-Success "  Deleted: $successCount"
    if ($failCount -gt 0) {
        Write-Error "  Failed: $failCount"
    }
}

# Delete all git tags
if (-not $KeepTags -and $tags) {
    $tagArray = $tags -split "`n" | Where-Object { $_ -ne "" }
    
    Write-Info "`nDeleting git tags..."
    $successCount = 0
    $failCount = 0
    
    foreach ($tag in $tagArray) {
        Write-Info "Deleting tag: $tag"
        
        # Delete local tag
        git tag -d $tag 2>$null
        $localSuccess = $LASTEXITCODE -eq 0
        
        # Delete remote tag
        git push origin :refs/tags/$tag 2>$null
        $remoteSuccess = $LASTEXITCODE -eq 0
        
        if ($localSuccess -and $remoteSuccess) {
            $successCount++
            Write-Success "  ✓ Deleted (local and remote)"
        } elseif ($localSuccess) {
            $successCount++
            Write-Warning "  ⚠ Deleted locally (remote may not exist)"
        } else {
            $failCount++
            Write-Error "  ✗ Failed"
        }
    }
    
    Write-Info "`nGit Tags:"
    Write-Success "  Deleted: $successCount"
    if ($failCount -gt 0) {
        Write-Error "  Failed: $failCount"
    }
}

Write-Success "`n=== Cleanup Complete ==="

# Show remaining releases/tags
Write-Info "`nVerifying cleanup..."

$remainingReleases = gh release list --limit 10 --json tagName | ConvertFrom-Json
$remainingTags = git tag

if ($remainingReleases.Count -eq 0 -and -not $remainingTags) {
    Write-Success "All releases and tags removed successfully!"
} else {
    if ($remainingReleases.Count -gt 0) {
        Write-Warning "Remaining releases: $($remainingReleases.Count)"
    }
    if ($remainingTags) {
        $remainingTagArray = $remainingTags -split "`n" | Where-Object { $_ -ne "" }
        Write-Warning "Remaining tags: $($remainingTagArray.Count)"
    }
}
