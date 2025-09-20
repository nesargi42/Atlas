# 🚀 Atlas Company Analyzer - Startup Guide

This guide will help you start both the frontend and backend servers for the Atlas Company Analyzer.

## 📋 Prerequisites

### Backend (FastAPI)
- **Python 3.8+** installed
- **pip** package manager
- **FMP API Key** (Financial Modeling Prep)

### Frontend (Next.js)
- **Node.js 18+** installed
- **pnpm** package manager (will be installed automatically)

## 🏗️ Project Structure

```
Atlas/
├── frontend/          # Next.js frontend application
│   ├── app/          # Next.js app directory
│   ├── components/   # React components
│   ├── lib/          # Frontend utilities and services
│   └── ...
├── server/           # FastAPI backend server
│   ├── main.py       # Main FastAPI application
│   ├── .env          # Backend environment variables
│   └── ...
└── ...
```

## 🚀 Quick Start

### Option 1: Using Batch Files (Windows)

#### Start Backend Server
```bash
cd server
start.bat
```

#### Start Frontend Server (in a new terminal)
```bash
cd frontend
start.bat
```

### Option 2: Using PowerShell Scripts

#### Start Backend Server
```powershell
cd server
.\start.ps1
```

#### Start Frontend Server (in a new terminal)
```powershell
cd frontend
.\start.ps1
```

### Option 3: Manual Commands

#### Start Backend Server
```bash
cd server
python main.py
```

#### Start Frontend Server (in a new terminal)
```bash
cd frontend
pnpm install
pnpm dev
```

## 🌐 Access Points

Once both servers are running:

- **Frontend**: http://localhost:3000
- **Backend API**: http://localhost:5000
- **API Documentation**: http://localhost:5000/docs
- **Backend Health**: http://localhost:5000/health

## ⚙️ Configuration

### Backend Environment Variables

Create `server/.env` with the following variables:

```env
# Server Configuration
BACKEND_PORT=5000
FRONTEND_URL=http://localhost:3000
LOG_LEVEL=info

# API Keys
FMP_API_KEY=your_fmp_api_key_here
AI_API_KEY=your_openai_api_key_here
AI_API_BASE=https://api.openai.com/v1
AI_MODEL=gpt-4

# External APIs
FMP_BASE_URL=https://financialmodelingprep.com/stable
CTGOV_BASE=https://clinicaltrials.gov/api/v2
CHEMBL_BASE=https://www.ebi.ac.uk/chembl/api/data

# Development
MOCK_MODE=true
RATE_LIMIT=100
RATE_LIMIT_WINDOW=60
```

### Frontend Environment Variables

Create `frontend/.env.local` with:

```env
NEXT_PUBLIC_BACKEND_URL=http://localhost:5000
```

## 🔧 Troubleshooting

### Backend Issues

1. **Port 5000 already in use**:
   ```bash
   # Find and kill the process
   netstat -ano | findstr :5000
   taskkill /PID <PID_NUMBER> /F
   ```

2. **Python not found**:
   - Install Python from https://python.org
   - Make sure Python is in your PATH

3. **API Key errors**:
   - Verify your FMP API key in `server/.env`
   - Check the key is valid and has sufficient credits

### Frontend Issues

1. **Port 3000 already in use**:
   ```bash
   # Find and kill the process
   netstat -ano | findstr :3000
   taskkill /PID <PID_NUMBER> /F
   ```

2. **Node.js not found**:
   - Install Node.js from https://nodejs.org
   - Make sure Node.js is in your PATH

3. **pnpm not found**:
   ```bash
   npm install -g pnpm
   ```

## 📊 Testing the Setup

### Test Backend
```bash
cd server
python test_api.py
```

### Test Frontend
1. Open http://localhost:3000
2. Navigate to the "Evaluate" page
3. Try adding companies and viewing financial metrics

## 🎯 Features Available

### Backend API Endpoints
- `GET /health` - Health check
- `GET /api/finance/profile/{ticker}` - Company financial data
- `GET /api/finance/search?query={query}` - Search companies
- `GET /api/clinical-trials/{company}` - Clinical trials data
- `GET /api/molecules/{compound_id}` - Molecule information
- `POST /api/ranking/company` - AI company ranking
- `GET /api/companies` - Company management
- `GET /api/mock/companies` - Mock data for development

### Frontend Pages
- `/` - Landing page
- `/evaluate` - Company evaluation with financial metrics
- `/results` - Analysis results

## 🚀 Production Deployment

For production deployment, see:
- `server/WINDOWS_SETUP.md` - Backend production setup
- `server/install-service.bat` - Install as Windows service

## 📞 Support

If you encounter issues:
1. Check the console logs for both servers
2. Verify all environment variables are set
3. Ensure both servers are running on the correct ports
4. Check the API documentation at http://localhost:5000/docs