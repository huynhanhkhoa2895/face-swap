# Face Swap Development Startup Script

Write-Host "Starting Face Swap Development Environment..." -ForegroundColor Green
Write-Host ""

Write-Host "Note: Redis is not required - using in-memory storage" -ForegroundColor Cyan
Write-Host ""

# Start Backend
Write-Host "Starting Backend (NestJS)..." -ForegroundColor Yellow
Write-Host "  Backend will run on http://localhost:3001" -ForegroundColor Cyan
Start-Process powershell -ArgumentList "-NoExit", "-Command", "cd '$PSScriptRoot\face-swap-backend'; npm run start:dev" -WindowStyle Normal

# Wait a bit for backend to start
Start-Sleep -Seconds 3

# Start Frontend
Write-Host "Starting Frontend (Next.js)..." -ForegroundColor Yellow
Write-Host "  Frontend will run on http://localhost:3000" -ForegroundColor Cyan
Start-Process powershell -ArgumentList "-NoExit", "-Command", "cd '$PSScriptRoot\face-swap-frontend'; npm run dev" -WindowStyle Normal

Write-Host ""
Write-Host "✓ Both servers are starting in separate windows" -ForegroundColor Green
Write-Host ""
Write-Host "Access the application at:" -ForegroundColor Cyan
Write-Host "  Frontend: http://localhost:3000" -ForegroundColor White
Write-Host "  Backend API: http://localhost:3001" -ForegroundColor White
Write-Host ""
Write-Host "Note: Face-api models are optional (for face detection)" -ForegroundColor Yellow

