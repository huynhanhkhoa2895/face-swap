# Install TensorFlow.js Node.js for Face Detection
# This is REQUIRED for the main feature (face detection) to work

Write-Host ""
Write-Host "========================================" -ForegroundColor Cyan
Write-Host "  TensorFlow.js Node.js Installation" -ForegroundColor Cyan
Write-Host "========================================" -ForegroundColor Cyan
Write-Host ""
Write-Host "⚠️  IMPORTANT: Face detection is the MAIN FEATURE" -ForegroundColor Yellow
Write-Host "   This installation is REQUIRED for the app to work!" -ForegroundColor Yellow
Write-Host ""

# Check prerequisites
Write-Host "Checking prerequisites..." -ForegroundColor Yellow

$pythonInstalled = $false
try {
    $pythonVersion = python --version 2>&1
    if ($LASTEXITCODE -eq 0) {
        Write-Host "✓ Python found: $pythonVersion" -ForegroundColor Green
        $pythonInstalled = $true
    }
} catch {
    Write-Host "✗ Python not found" -ForegroundColor Red
}

if (-not $pythonInstalled) {
    Write-Host ""
    Write-Host "❌ Python 3.x is required!" -ForegroundColor Red
    Write-Host "   Download from: https://www.python.org/downloads/" -ForegroundColor Yellow
    Write-Host "   Make sure to check 'Add Python to PATH' during installation" -ForegroundColor Yellow
    Write-Host ""
    exit 1
}

# Check for Visual Studio Build Tools
Write-Host "Checking for Visual Studio Build Tools..." -ForegroundColor Yellow
$vsBuildTools = Get-Command "cl.exe" -ErrorAction SilentlyContinue
if ($vsBuildTools) {
    Write-Host "✓ Visual Studio Build Tools found" -ForegroundColor Green
} else {
    Write-Host "⚠️  Visual Studio Build Tools not found in PATH" -ForegroundColor Yellow
    Write-Host "   You may need to install 'Desktop development with C++' workload" -ForegroundColor Yellow
    Write-Host "   Download from: https://visualstudio.microsoft.com/downloads/" -ForegroundColor Yellow
    Write-Host ""
    $continue = Read-Host "Continue anyway? (y/n)"
    if ($continue -ne "y") {
        exit 1
    }
}

Write-Host ""
Write-Host "Installing @tensorflow/tfjs-node..." -ForegroundColor Yellow
Write-Host "⚠️  This may take 10-30 minutes (building native bindings)..." -ForegroundColor Yellow
Write-Host ""

# Install TensorFlow.js Node.js
npm install @tensorflow/tfjs-node

if ($LASTEXITCODE -eq 0) {
    Write-Host ""
    Write-Host "========================================" -ForegroundColor Green
    Write-Host "  ✓ Installation Successful!" -ForegroundColor Green
    Write-Host "========================================" -ForegroundColor Green
    Write-Host ""
    Write-Host "Face detection is now enabled!" -ForegroundColor Green
    Write-Host ""
    Write-Host "Next steps:" -ForegroundColor Cyan
    Write-Host "  1. Run: npm run build" -ForegroundColor White
    Write-Host "  2. Run: npm run start:dev" -ForegroundColor White
    Write-Host "  3. Check logs for 'Face detection models loaded successfully'" -ForegroundColor White
    Write-Host ""
} else {
    Write-Host ""
    Write-Host "========================================" -ForegroundColor Red
    Write-Host "  ✗ Installation Failed" -ForegroundColor Red
    Write-Host "========================================" -ForegroundColor Red
    Write-Host ""
    Write-Host "Troubleshooting:" -ForegroundColor Yellow
    Write-Host "  1. Make sure Python 3.x is installed and in PATH" -ForegroundColor White
    Write-Host "  2. Install Visual Studio Build Tools with C++ workload" -ForegroundColor White
    Write-Host "  3. Restart your terminal/PowerShell after installing prerequisites" -ForegroundColor White
    Write-Host "  4. See INSTALL_TENSORFLOW.md for detailed instructions" -ForegroundColor White
    Write-Host ""
    exit 1
}


