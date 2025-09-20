# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## Development Commands

### Frontend (Next.js)
```bash
cd frontend
pnpm dev          # Start development server on localhost:3000
pnpm build        # Build for production  
pnpm lint         # Run ESLint
pnpm test         # Run Vitest unit tests
pnpm test:ui      # Run tests with UI
pnpm test:e2e     # Run Playwright end-to-end tests
pnpm format       # Format code with Prettier
```

### Backend (FastAPI)
```bash
cd server
python main.py    # Start development server on localhost:5000
python test_api.py        # Test API endpoints
python test_financial.py  # Test financial endpoints
```

### Database (Prisma)
```bash
cd frontend
pnpm db:generate  # Generate Prisma client
pnpm db:push      # Push schema changes to database
pnpm db:studio    # Open Prisma Studio
pnpm seed         # Seed database with sample data
```

## Architecture Overview

This is a dual-architecture application with separate frontend and backend servers:

### Frontend (Next.js 14 App Router)
- **Location**: `/frontend/`
- **Framework**: Next.js 14 with App Router, TypeScript, Tailwind CSS
- **UI Components**: shadcn/ui, Radix UI components
- **State Management**: Zustand for global state, TanStack Query for server state
- **Visualization**: Recharts for charts and data visualization

### Backend (FastAPI)
- **Location**: `/server/`
- **Framework**: FastAPI with Python 3.8+
- **APIs**: Financial Modeling Prep, ClinicalTrials.gov, ChEMBL
- **Features**: Rate limiting, CORS, comprehensive mock mode

### Database
- **ORM**: Prisma with SQLite (configurable to PostgreSQL)
- **Schema**: `/prisma/schema.prisma`
- **Models**: Company, EvaluationProfile, Run, UserNote

## Key Architectural Patterns

### Dual Server Architecture
- Frontend and backend run as separate processes
- Frontend: `localhost:3000` (Next.js)
- Backend: `localhost:5000` (FastAPI)
- Communication via REST API calls

### Data Flow
1. Frontend searches companies via backend proxy to Financial Modeling Prep API
2. Backend fetches financial, clinical trial, and molecule data from external APIs
3. AI ranking system (planned) will use LangGraph workflows
4. Results stored in Prisma database and cached with TanStack Query

### Mock Mode
- Set `MOCK_MODE=true` for offline development
- Provides realistic sample data for all API endpoints
- No external API keys required in mock mode

## Environment Configuration

### Frontend Environment (`frontend/.env.local`)
```env
NEXT_PUBLIC_BACKEND_URL=http://localhost:5000
NODE_ENV=development
MOCK_MODE=true
```

### Backend Environment (`server/.env`)
```env
BACKEND_PORT=5000
FRONTEND_URL=http://localhost:3000
FMP_API_KEY=your_api_key_here
AI_API_KEY=your_openai_key_here
MOCK_MODE=true
```

## Important File Locations

- **Types**: `frontend/lib/types.ts` - Shared TypeScript interfaces
- **Backend Service**: `frontend/lib/backend-service.ts` - API client
- **Prisma Schema**: `prisma/schema.prisma` - Database models
- **Main Components**: `frontend/components/` - React components
- **API Routes**: `frontend/app/api/` - Next.js API routes
- **Backend Routes**: `server/main.py` - FastAPI endpoints

## Testing

- **Unit Tests**: Vitest configuration in `vitest.config.ts`
- **E2E Tests**: Playwright setup for frontend testing
- **API Tests**: Python test files in `server/` directory
- **Test Location**: `tests/` directory contains test utilities and setup

## Startup Process

Use the startup scripts for easy development:
- Windows: `frontend/start.bat` and `server/start.bat`
- PowerShell: `frontend/start.ps1` and `server/start.ps1`
- Manual: Follow commands in STARTUP_GUIDE.md