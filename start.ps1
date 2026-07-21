# Orvixa Developer Startup Launcher
# Run this script to boot both FastAPI backend and Vite frontend dev servers in parallel windows.

Write-Host "🚀 Starting Orvixa Local Development Suite..." -ForegroundColor Cyan

# 1. Start Backend in a new window
Write-Host "⚡ Starting Backend API Server on http://localhost:8000..." -ForegroundColor Yellow
Start-Process powershell -ArgumentList "-NoExit", "-Command", "cd backend; .\venv\Scripts\activate; uvicorn app.main:app --port 8000 --reload"

# 2. Start Frontend in a new window
Write-Host "⚡ Starting Frontend Dev Server on http://localhost:5173..." -ForegroundColor Yellow
Start-Process powershell -ArgumentList "-NoExit", "-Command", "npm run dev"

Write-Host "✅ Orvixa booted! Follow the Founder Verification Guide to load the unpacked extension in Chrome." -ForegroundColor Green
