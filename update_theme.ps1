# PowerShell script to update theme for chord recognition level pages
$basePath = "C:\Users\Luke\Desktop\programming\create-anything\apps\web\src\app\chord-recognition"

# Define the files to update
$levelFiles = @(
    "basic-triads\recognition\level2\page.jsx",
    "basic-triads\recognition\level3\page.jsx", 
    "basic-triads\recognition\level4\page.jsx",
    "basic-triads\construction\level5\page.jsx",
    "basic-triads\construction\level6\page.jsx",
    "basic-triads\construction\level7\page.jsx",
    "seventh-chords\recognition\level1\page.jsx",
    "seventh-chords\recognition\level2\page.jsx",
    "seventh-chords\recognition\level3\page.jsx",
    "seventh-chords\recognition\level4\page.jsx",
    "seventh-chords\recognition\level5\page.jsx",
    "seventh-chords\construction\level6\page.jsx",
    "seventh-chords\construction\level7\page.jsx",
    "seventh-chords\construction\level8\page.jsx",
    "jazz-chords\recognition\level1\page.jsx",
    "jazz-chords\recognition\level2\page.jsx",
    "chord-progressions\level1\page.jsx",
    "chord-progressions\level2\page.jsx"
)

# Define the replacements
$replacements = @(
    @("bg-gradient-to-br from-\[#F9D6E8\] to-\[#D8D6F9\]", "bg-gradient-to-br from-[#0a0a0a] via-[#1a1a2e] to-[#16213e]"),
    @("text-black(?![\/])", "text-white"),
    @("text-black/70", "text-white/70"),
    @("text-black/80", "text-white/70"),
    @("bg-white/10", "bg-black/20"),
    @("border-white/20", "border-white/10"),
    @("bg-white/30", "bg-white/10"),
    @("bg-white/20", "bg-white/10"),
    @("bg-black flex items-center justify-center hover:bg-gray-800", "bg-white/20 flex items-center justify-center hover:bg-white/30")
)

foreach ($file in $levelFiles) {
    $fullPath = Join-Path $basePath $file
    if (Test-Path $fullPath) {
        Write-Host "Updating $file..."
        $content = Get-Content $fullPath -Raw
        
        foreach ($replacement in $replacements) {
            $content = $content -replace $replacement[0], $replacement[1]
        }
        
        Set-Content $fullPath $content
        Write-Host "  - Updated $file"
    } else {
        Write-Host "  - File not found: $file"
    }
}

Write-Host "Theme update complete!"