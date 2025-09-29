Param(
    [string]$SourceDir = "products",
    [string]$DestDir = "images/products"
)

Write-Output "Moving images from $SourceDir to $DestDir"

if (-Not (Test-Path $SourceDir)) {
    Write-Error "Source directory '$SourceDir' not found"
    exit 1
}

if (-Not (Test-Path $DestDir)) {
    New-Item -ItemType Directory -Path $DestDir -Force | Out-Null
}

Get-ChildItem -Path $SourceDir -File | ForEach-Object {
    $dest = Join-Path $DestDir $_.Name
    Write-Output "Copying $_.FullName -> $dest"
    Copy-Item -Path $_.FullName -Destination $dest -Force
}

Write-Output "Done. Please verify files in $DestDir"
