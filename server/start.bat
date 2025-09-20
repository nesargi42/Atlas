@echo off
echo Starting Atlas FastAPI Backend Server...
echo.
echo Make sure you have:
echo 1. Python 3.8+ installed and in PATH
echo 2. Dependencies installed (run: pip install -r requirements.txt)
echo 3. Environment configured (.env file)
echo.
echo Starting FastAPI server on port 5000...
echo.
echo API Documentation will be available at:
echo - Swagger UI: http://localhost:5000/docs
echo - ReDoc: http://localhost:5000/redoc
echo - Health Check: http://localhost:5000/health
echo.
echo Press Ctrl+C to stop the server
echo.
python main.py
pause
