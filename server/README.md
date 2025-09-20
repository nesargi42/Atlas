# 🚀 Atlas FastAPI Backend Server

This is the **production-grade backend server** for the Atlas Company Analyzer application, built with **FastAPI**.

## ✨ Features

- **🚀 FastAPI** - High-performance, modern Python web framework
- **⚡ Async Support** - Built-in async/await for better performance
- **🔒 Rate Limiting** - IP-based rate limiting middleware
- **🛡️ Security** - CORS, trusted host middleware
- **📊 Auto Documentation** - Interactive Swagger UI and ReDoc
- **✅ Data Validation** - Automatic request/response validation with Pydantic
- **📝 Logging** - Comprehensive logging system
- **🌍 Environment Config** - Flexible configuration management

## 🏗️ Architecture

```
┌─────────────────┐    HTTP Requests    ┌─────────────────┐    API Calls    ┌─────────────────┐
│   Frontend      │ ──────────────────→ │   FastAPI       │ ──────────────→ │  External APIs  │
│   (Next.js)     │                     │   Backend       │                 │  (FMP, etc.)    │
│   Port: 3000    │                     │   Port: 5000    │                 │                 │
└─────────────────┘                     └─────────────────┘                 └─────────────────┘
```

## 📋 Prerequisites

- **Python 3.8+** (3.11+ recommended)
- **pip** package manager
- **Financial Modeling Prep API Key**

## 🚀 Quick Start

### 1. Install Dependencies
```bash
cd server
pip install -r requirements.txt
```

### 2. Configure Environment
```bash
cp env.example .env
# Edit .env with your FMP_API_KEY
```

### 3. Start the Server
```bash
# Option 1: Direct Python
python main.py

# Option 2: Using startup script
python start.py

# Option 3: Windows batch file
start.bat
```

## 📚 API Documentation

Once running, visit:
- **Swagger UI**: http://localhost:5000/docs
- **ReDoc**: http://localhost:5000/redoc
- **Health Check**: http://localhost:5000/health

## 🔌 API Endpoints

### Health Check
- `GET /health` - Server health status

### Finance API
- `GET /api/finance/profile/{ticker}` - Get company financial profile
- `GET /api/finance/search?query=...` - Search companies

### Companies API
- `GET /api/companies` - List all companies
- `GET /api/companies/{id}` - Get company by ID
- `POST /api/companies` - Create new company
- `PUT /api/companies/{id}` - Update company
- `DELETE /api/companies/{id}` - Delete company
- `DELETE /api/companies` - Clear all companies

## ⚙️ Configuration

### Environment Variables
- `BACKEND_PORT` - Server port (default: 5000)
- `FRONTEND_URL` - Frontend URL for CORS
- `FMP_API_KEY` - Financial Modeling Prep API key
- `RATE_LIMIT` - Requests per time window (default: 100)
- `RATE_LIMIT_WINDOW` - Time window in seconds (default: 60)

### Rate Limiting
- **Default**: 100 requests per 60 seconds per IP
- **Configurable**: Adjust via environment variables
- **Middleware**: Automatic rate limiting for all endpoints

## 🔒 Security Features

- **CORS Protection** - Configurable origin restrictions
- **Rate Limiting** - Prevents API abuse
- **Input Validation** - Automatic request validation
- **Error Handling** - Secure error responses
- **Logging** - Audit trail for all requests

## 📊 Performance Features

- **Async Support** - Non-blocking I/O operations
- **Connection Pooling** - Efficient HTTP client usage
- **Response Compression** - Reduced bandwidth usage
- **Caching Ready** - Easy to add Redis/Memcached

## 🚀 Windows Production Deployment

### Process Manager (PM2)
```bash
# Install PM2 globally
npm install -g pm2

# Start the FastAPI server
pm2 start "python main.py" --name atlas-api

# Monitor the process
pm2 status
pm2 logs atlas-api

# Restart on system reboot
pm2 startup
pm2 save
```

### Windows Service
```bash
# Using NSSM (Non-Sucking Service Manager)
# Download from: https://nssm.cc/

# Install as Windows service
nssm install AtlasAPI "C:\Python311\python.exe" "C:\path\to\server\main.py"
nssm set AtlasAPI AppDirectory "C:\path\to\server"
nssm start AtlasAPI
```

### Environment
```bash
NODE_ENV=production
BACKEND_PORT=5000
FRONTEND_URL=https://yourdomain.com
RATE_LIMIT=1000
RATE_LIMIT_WINDOW=60
```

## 🔍 Monitoring & Debugging

### Health Check
```bash
curl http://localhost:5000/health
```

### Logs
- **Console**: Real-time logging output
- **File**: Configure logging to files
- **External**: Integrate with ELK stack, Datadog, etc.

### Metrics
- **Built-in**: Request counts, response times
- **Extensions**: Add Prometheus metrics
- **APM**: Integrate with New Relic, DataDog

## 🧪 Testing

### Run Tests
```bash
# Install test dependencies
pip install pytest pytest-asyncio httpx

# Run tests
pytest

# Run with coverage
pytest --cov=main
```

### API Testing
```bash
# Test health endpoint
curl http://localhost:5000/health

# Test company creation
curl -X POST http://localhost:5000/api/companies -H "Content-Type: application/json" -d "{\"name\":\"Test Corp\",\"ticker\":\"TEST\"}"
```

## 🔄 Development Workflow

1. **Code Changes**: Server auto-reloads with uvicorn
2. **API Changes**: Automatic documentation updates
3. **Environment**: Hot-reload configuration changes
4. **Logging**: Real-time log output

## 🆚 FastAPI vs Express.js

| Feature | FastAPI | Express.js |
|---------|---------|------------|
| **Performance** | ⭐⭐⭐⭐⭐ | ⭐⭐⭐⭐ |
| **Type Safety** | ⭐⭐⭐⭐⭐ | ⭐⭐⭐ |
| **Documentation** | ⭐⭐⭐⭐⭐ | ⭐⭐ |
| **Async Support** | ⭐⭐⭐⭐⭐ | ⭐⭐⭐ |
| **Data Validation** | ⭐⭐⭐⭐⭐ | ⭐⭐ |
| **Production Ready** | ⭐⭐⭐⭐⭐ | ⭐⭐⭐⭐ |

## 📞 Support

For issues:
1. Check the logs in your terminal
2. Verify environment variables
3. Test the health endpoint
4. Check API documentation at `/docs`

---

**🚀 FastAPI: The modern, production-grade way to build APIs! 🚀**
