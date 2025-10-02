Param(
    [string]$Source = "images/products",
    [string]$OutDir = "build/assets",
    [switch]$Zip
)

if (-Not (Test-Path $Source)) {
    Write-Error "Source folder '$Source' does not exist"
    exit 1
}

Write-Output "Preparing assets from $Source -> $OutDir"
Remove-Item -Recurse -Force -ErrorAction SilentlyContinue $OutDir
New-Item -ItemType Directory -Path $OutDir -Force | Out-Null

Get-ChildItem -Path $Source -File | ForEach-Object {
    $dest = Join-Path $OutDir $_.Name
    Copy-Item -Path $_.FullName -Destination $dest -Force
}

if ($Zip) {
    $zipPath = "$OutDir.zip"
    if (Test-Path $zipPath) { Remove-Item $zipPath -Force }
    Write-Output "Creating $zipPath"
    Add-Type -AssemblyName System.IO.Compression.FileSystem
    [System.IO.Compression.ZipFile]::CreateFromDirectory($OutDir, $zipPath)
}

Write-Output "Assets prepared in $OutDir"
