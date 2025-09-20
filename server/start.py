#!/usr/bin/env python3
"""
Startup script for Atlas FastAPI Backend Server
"""
import uvicorn
import os
from dotenv import load_dotenv

def main():
    # Load environment variables
    load_dotenv()
    
    # Get configuration from environment
    host = os.getenv("BACKEND_HOST", "0.0.0.0")
    port = int(os.getenv("BACKEND_PORT", "5000"))
    reload = os.getenv("NODE_ENV", "development") == "development"
    
    print("🚀 Starting Atlas FastAPI Backend Server...")
    print(f"📊 Host: {host}")
    print(f"📊 Port: {port}")
    print(f"📊 Reload: {reload}")
    print()
    print("📚 API Documentation:")
    print(f"   - Swagger UI: http://localhost:{port}/docs")
    print(f"   - ReDoc: http://localhost:{port}/redoc")
    print(f"   - Health Check: http://localhost:{port}/health")
    print()
    
    # Start the server
    uvicorn.run(
        "main:app",
        host=host,
        port=port,
        reload=reload,
        log_level="info"
    )

if __name__ == "__main__":
    main()

