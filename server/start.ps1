# PowerShell script to start Atlas FastAPI Backend Server
Write-Host "🚀 Starting Atlas FastAPI Backend Server..." -ForegroundColor Green
Write-Host ""

# Check if Python is installed
try {
    $pythonVersion = python --version 2>&1
    Write-Host "✅ Python found: $pythonVersion" -ForegroundColor Green
} catch {
    Write-Host "❌ Python not found. Please install Python 3.8+ and add it to PATH" -ForegroundColor Red
    Write-Host "Download from: https://www.python.org/downloads/" -ForegroundColor Yellow
    Read-Host "Press Enter to exit"
    exit 1
}

# Check if requirements are installed
if (-not (Test-Path "venv")) {
    Write-Host "📦 Creating virtual environment..." -ForegroundColor Yellow
    python -m venv venv
}

# Activate virtual environment
Write-Host "🔧 Activating virtual environment..." -ForegroundColor Yellow
& ".\venv\Scripts\Activate.ps1"

# Install requirements if needed
if (-not (Test-Path "venv\Lib\site-packages\fastapi")) {
    Write-Host "📥 Installing dependencies..." -ForegroundColor Yellow
    pip install -r requirements.txt
}

# Check if .env exists
if (-not (Test-Path ".env")) {
    Write-Host "⚠️  .env file not found. Creating from template..." -ForegroundColor Yellow
    if (Test-Path "env.example") {
        Copy-Item "env.example" ".env"
        Write-Host "📝 Please edit .env file with your FMP_API_KEY" -ForegroundColor Yellow
    } else {
        Write-Host "❌ env.example not found" -ForegroundColor Red
    }
}

Write-Host ""
Write-Host "📊 Server Configuration:" -ForegroundColor Cyan
Write-Host "   - Host: 0.0.0.0" -ForegroundColor White
Write-Host "   - Port: 5000" -ForegroundColor White
Write-Host "   - Reload: Enabled" -ForegroundColor White
Write-Host ""

Write-Host "📚 API Documentation will be available at:" -ForegroundColor Cyan
Write-Host "   - Swagger UI: http://localhost:5000/docs" -ForegroundColor White
Write-Host "   - ReDoc: http://localhost:5000/redoc" -ForegroundColor White
Write-Host "   - Health Check: http://localhost:5000/health" -ForegroundColor White
Write-Host ""

Write-Host "🚀 Starting server..." -ForegroundColor Green
Write-Host "Press Ctrl+C to stop the server" -ForegroundColor Yellow
Write-Host ""

# Start the server
try {
    python main.py
} catch {
    Write-Host "❌ Failed to start server: $_" -ForegroundColor Red
    Read-Host "Press Enter to exit"
}

