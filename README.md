# Atlas - Company Analyzer

A high-performance web application for analyzing pharmaceutical companies using financial metrics, clinical trial data, and AI-powered ranking. Built with Next.js 14, TypeScript, and LangGraph.

## 🚀 Features

- **Company Search & Analysis**: Search companies by name or ticker symbol
- **Financial Metrics**: Market cap, R&D expense, CAGR, enterprise value
- **Clinical Trial Data**: Integration with ClinicalTrials.gov API
- **Molecule Information**: ChEMBL API integration for drug data
- **AI-Powered Ranking**: LangGraph-based analysis for tech differentiation vs maturity
- **Interactive Visualizations**: Bubble charts and sortable tables
- **Custom Evaluation Criteria**: Configurable weights and custom metrics
- **Export Functionality**: CSV export of results
- **Mock Mode**: Fully offline development with realistic sample data

## 🛠️ Tech Stack

- **Frontend**: Next.js 14 (App Router), TypeScript, Tailwind CSS
- **UI Components**: shadcn/ui, Radix UI, Lucide React icons
- **State Management**: Zustand, TanStack Query
- **Charts**: Recharts
- **AI/ML**: LangGraph, LangChain
- **Database**: Prisma with SQLite (easily switchable to PostgreSQL)
- **APIs**: Financial Modeling Prep, ClinicalTrials.gov, ChEMBL
- **Deployment**: Vercel (recommended), Docker

## 📋 Prerequisites

- Node.js 18+ 
- pnpm (recommended) or npm
- API keys for external services (optional for mock mode)

## 🚀 Quick Start

### 1. Clone and Install

```bash
git clone <repository-url>
cd atlas-company-analyzer
pnpm install
```

### 2. Environment Setup

Copy the environment file and configure your API keys:

```bash
cp env.example .env.local
```

Edit `.env.local` with your configuration:

```env
# Required for production
NODE_ENV=development

# Financial API (optional - mock mode works without it)
FMP_API_KEY=your_financial_modeling_prep_api_key

# AI/LLM Configuration (optional - heuristics fallback works without it)
AI_API_BASE=https://api.openai.com/v1
AI_API_KEY=your_openai_api_key
AI_MODEL=gpt-4o-mini

# Mock Mode (set to true for offline development)
MOCK_MODE=true

# Database
DATABASE_URL="file:./dev.db"
```

### 3. Database Setup

```bash
# Generate Prisma client
pnpm db:generate

# Push schema to database
pnpm db:push

# Seed with sample data
pnpm seed
```

### 4. Run Development Server

```bash
pnpm dev
```

Open [http://localhost:3000](http://localhost:3000) in your browser.

## 🔧 Development

### Available Scripts

```bash
pnpm dev          # Start development server
pnpm build        # Build for production
pnpm start        # Start production server
pnpm lint         # Run ESLint
pnpm test         # Run unit tests
pnpm test:ui      # Run tests with UI
pnpm test:e2e     # Run end-to-end tests
pnpm seed         # Seed database with sample data
pnpm format       # Format code with Prettier
pnpm db:generate  # Generate Prisma client
pnpm db:push      # Push database schema
pnpm db:studio    # Open Prisma Studio
```

### Project Structure

```
/app                    # Next.js app router pages
  /(routes)            # Route groups
    /                  # Home page
    /evaluate          # Company evaluation
    /results           # Ranking results
  /api                 # API routes
    /finance           # Financial data API
    /ctgov             # Clinical trials API
    /chembl            # ChEMBL API
    /rank              # Ranking API
/components            # React components
  /ui                  # shadcn/ui components
  CompanyCard.tsx      # Company display component
  CriteriaForm.tsx     # Evaluation criteria form
  BubbleChart.tsx      # Results visualization
  ResultsTable.tsx     # Results table
/lib                   # Utility libraries
  /types.ts           # TypeScript type definitions
  /utils.ts           # Helper functions
  /finance.ts         # Financial API service
  /ctgov.ts           # Clinical trials service
  /chembl.ts          # ChEMBL service
  /scoring.ts         # Scoring algorithms
  /mock-data.ts       # Sample data for development
/graphs                # LangGraph workflows
  companyRanking.ts    # Company ranking graph
/db                    # Database
  /schema.prisma      # Prisma schema
  /seed.ts            # Database seed script
/tests                 # Test files
```

### Mock Mode

The application includes a comprehensive mock mode that works without external APIs:

- **Sample Companies**: 10 well-known pharmaceutical companies
- **Financial Data**: Realistic market caps, R&D expenses, employee counts
- **Clinical Trials**: Sample trial data with phases and enrollment
- **Molecule Data**: ChEMBL-like compound information

To enable mock mode, set `MOCK_MODE=true` in your environment variables.

## 🌐 API Integration

### Financial Data (FMP)

- Market capitalization
- Employee count
- R&D expenses
- Financial statements
- Historical data for CAGR calculation

### ClinicalTrials.gov v2

- Active clinical trials
- Trial phases and status
- Enrollment numbers
- Sponsor information
- Intervention details

### ChEMBL

- Molecule metadata
- Maximum phase information
- Target and mechanism data
- Compound synonyms

### AI Ranking (LangGraph)

The ranking system uses a multi-node workflow:

1. **Data Collector**: Validates and consolidates company data
2. **Normalizer**: Scales metrics to 0-1 range
3. **Heuristics Calculator**: Rule-based scoring fallback
4. **AI Scorer**: LLM-based analysis (when available)
5. **Calibrator**: Ensures scores are properly bounded
6. **Merger**: Combines results and applies user weights

## 🎯 Usage

### 1. Company Search

- Search by company name or ticker symbol
- Browse search results and select companies
- View company details and domain tags

### 2. Data Analysis

- Automatically fetch financial and clinical data
- Analyze molecule information from ChEMBL
- Calculate focus area alignment

### 3. Evaluation Criteria

- Set weights for standard metrics (CAGR, R&D, etc.)
- Define therapeutic focus areas
- Add custom evaluation criteria
- Validate total weights equal 100%

### 4. Results & Ranking

- View AI-powered ranking results
- Interactive bubble chart visualization
- Sortable results table
- Export results to CSV

## 🚀 Getting Started

1. **Prerequisites**: Node 20.x, pnpm (or npm)
2. **Install**:
   ```bash
   pnpm install
   cp env.example .env.local
   # fill keys as needed; leave MOCK_MODE=true to test without keys
   pnpm dev
   ```
3. **Health Check**: open http://localhost:3000/api/health
4. **Toggle Real Data**: set MOCK_MODE=false in .env.local, add keys:
   - FMP_API_KEY (finance)
   - AI_API_KEY (+ optionally AI_API_BASE, AI_MODEL)
   - ClinicalTrials.gov / ChEMBL / NIH use public endpoints (no keys)
5. **Security**: Do not expose secrets in client components. Only server code imports /lib/env.

## 🚀 Deployment

### Vercel (Recommended)

1. Push your code to GitHub
2. Connect repository to Vercel
3. Set environment variables in Vercel dashboard
4. Deploy automatically on push

### Docker

```bash
# Build image
docker build -t atlas-company-analyzer .

# Run container
docker run -p 3000:3000 atlas-company-analyzer
```

### Environment Variables for Production

```env
NODE_ENV=production
FMP_API_KEY=your_production_key
AI_API_BASE=https://api.openai.com/v1
AI_API_KEY=your_production_key
AI_MODEL=gpt-4o-mini
MOCK_MODE=false
DATABASE_URL="your_production_database_url"
```

## 🧪 Testing

### Unit Tests

```bash
pnpm test              # Run tests
pnpm test:ui           # Run with UI
pnpm test --coverage   # Run with coverage
```

### End-to-End Tests

```bash
pnpm test:e2e          # Run Playwright tests
```

## 📊 Performance

- **Server-Side Rendering**: Optimized for SEO and initial load
- **Code Splitting**: Lazy-loaded components and routes
- **Caching**: TanStack Query for client-side, ETags for API responses
- **Image Optimization**: Next.js built-in image optimization
- **Bundle Analysis**: Built-in bundle analyzer

## 🔒 Security

- **API Key Protection**: Server-side only environment variables
- **Input Validation**: Zod schema validation
- **Rate Limiting**: Exponential backoff for external APIs
- **Error Handling**: Graceful degradation and user feedback

## 🤝 Contributing

1. Fork the repository
2. Create a feature branch
3. Make your changes
4. Add tests for new functionality
5. Submit a pull request

## 📝 License

This project is licensed under the MIT License.

## 🆘 Support

- **Issues**: Create GitHub issues for bugs or feature requests
- **Documentation**: Check the code comments and type definitions
- **Mock Mode**: Use mock mode for development without external dependencies

## 🔮 Roadmap

- [ ] Company comparison view
- [ ] Result snapshots and sharing
- [ ] Role-based access control
- [ ] Audit logging
- [ ] Additional data sources
- [ ] Advanced analytics dashboard
- [ ] Mobile app
- [ ] API rate limiting and caching
- [ ] Real-time updates
- [ ] Integration with investment platforms

---

Built with ❤️ using Next.js, TypeScript, and modern web technologies.
