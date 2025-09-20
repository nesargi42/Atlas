from fastapi import FastAPI, HTTPException, Depends, status
from fastapi.middleware.cors import CORSMiddleware
from fastapi.middleware.trustedhost import TrustedHostMiddleware
from fastapi.responses import JSONResponse
from contextlib import asynccontextmanager
import uvicorn
import os
from dotenv import load_dotenv
from typing import List, Optional, Dict, Any
import httpx
import asyncio
from datetime import datetime, timedelta
import logging
import json
import math

# Load environment variables
load_dotenv()

# Configure logging
logging.basicConfig(level=logging.INFO)
logger = logging.getLogger(__name__)

# Global variables for rate limiting
request_counts = {}
RATE_LIMIT = int(os.getenv("RATE_LIMIT", "100"))
RATE_LIMIT_WINDOW = int(os.getenv("RATE_LIMIT_WINDOW", "60"))

@asynccontextmanager
async def lifespan(app: FastAPI):
    # Startup
    logger.info("🚀 Starting Atlas Backend Server...")
    logger.info(f"📊 Rate Limit: {RATE_LIMIT} requests per {RATE_LIMIT_WINDOW} seconds")
    yield
    # Shutdown
    logger.info("🛑 Shutting down Atlas Backend Server...")

# Create FastAPI app
app = FastAPI(
    title="Atlas Company Analyzer API",
    description="High-performance API for company analysis, financial metrics, clinical trials, and AI-powered ranking",
    version="1.0.0",
    docs_url="/docs",
    redoc_url="/redoc",
    lifespan=lifespan
)

# Middleware
app.add_middleware(
    CORSMiddleware,
    allow_origins=[os.getenv("FRONTEND_URL", "http://localhost:3001")],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

app.add_middleware(
    TrustedHostMiddleware,
    allowed_hosts=["*"]  # Configure appropriately for production
)

# Rate limiting middleware
@app.middleware("http")
async def rate_limit_middleware(request, call_next):
    client_ip = request.client.host
    current_time = datetime.now()
    
    # Clean old entries
    if client_ip in request_counts:
        request_counts[client_ip] = [
            req_time for req_time in request_counts[client_ip]
            if current_time - req_time < timedelta(seconds=RATE_LIMIT_WINDOW)
        ]
    
    # Check rate limit
    if client_ip in request_counts and len(request_counts[client_ip]) >= RATE_LIMIT:
        return JSONResponse(
            status_code=status.HTTP_429_TOO_MANY_REQUESTS,
            content={"error": "Rate limit exceeded", "retry_after": RATE_LIMIT_WINDOW}
        )
    
    # Add current request
    if client_ip not in request_counts:
        request_counts[client_ip] = []
    request_counts[client_ip].append(current_time)
    
    response = await call_next(request)
    return response

# Pydantic models
from pydantic import BaseModel, Field
from typing import Optional, List, Dict, Any

class CompanyBase(BaseModel):
    name: str = Field(..., min_length=1, max_length=200)
    ticker: str = Field(..., min_length=1, max_length=10)
    description: Optional[str] = Field(None, max_length=1000)
    company_type: Optional[str] = Field(None, max_length=50)

class CompanyCreate(CompanyBase):
    pass

class CompanyUpdate(BaseModel):
    name: Optional[str] = Field(None, min_length=1, max_length=200)
    ticker: Optional[str] = Field(None, max_length=10)
    description: Optional[str] = Field(None, max_length=1000)
    company_type: Optional[str] = Field(None, max_length=50)

class Company(CompanyBase):
    id: str
    created_at: datetime
    updated_at: datetime
    
    class Config:
        from_attributes = True

class FinancialData(BaseModel):
    # Basic Company Info
    company_name: Optional[str] = None
    sector: Optional[str] = None
    industry: Optional[str] = None
    employees: int = 0
    
    # Market Data
    price: float = 0.0
    market_cap: float = 0.0
    beta: float = 0.0
    volume: int = 0
    average_volume: int = 0
    
    # Financial Metrics
    revenue: float = 0.0
    net_income: float = 0.0
    eps: float = 0.0
    eps_diluted: float = 0.0
    pe_ratio: float = 0.0
    
    # Balance Sheet
    total_debt: float = 0.0
    cash: float = 0.0
    enterprise_value: float = 0.0
    
    # Income Statement
    rd_expense: float = 0.0
    gross_profit: float = 0.0
    operating_income: float = 0.0
    ebitda: float = 0.0
    ebit: float = 0.0
    
    # Growth Metrics
    cagr: Optional[float] = None
    revenue_growth: Optional[float] = None
    net_income_growth: Optional[float] = None

class ClinicalTrial(BaseModel):
    phase: str
    title: str
    interventions: List[str]
    enrollment: int
    status: Optional[str]
    sponsor: Optional[str]

class MoleculeData(BaseModel):
    distinct_targets: int
    max_phase_by_molecule: Dict[str, int]

class CompanyRankingInput(BaseModel):
    company_name: str
    ticker: str
    user_criteria: Optional[Dict[str, Any]] = None
    user_weights: Optional[Dict[str, float]] = None

class CompanyRankingOutput(BaseModel):
    x: float  # Maturity score (0-1)
    y: float  # Differentiation score (0-1)
    rationale: str

class HealthResponse(BaseModel):
    status: str
    timestamp: datetime
    uptime: float
    version: str = "1.0.0"

# In-memory storage (replace with database in production)
companies_db = []

# Configuration
FMP_BASE_URL = "https://financialmodelingprep.com/stable"
FMP_API_KEY = os.getenv("FMP_API_KEY")
CTGOV_BASE = "https://clinicaltrials.gov/api/v2"
CHEMBL_BASE = "https://www.ebi.ac.uk/chembl/api/data"
MOCK_MODE = os.getenv("MOCK_MODE", "true").lower() == "true"

# Mock data for development
MOCK_COMPANIES = [
    {
        "name": "Pfizer Inc.",
        "ticker": "PFE",
        "domainTags": ["Oncology", "Cardiovascular", "Infectious Disease"],
        "marketCap": 150000000000,
        "employees": 80000,
        "rdExpense": 8000000000,
        "cagr": 0.08
    },
    {
        "name": "Johnson & Johnson",
        "ticker": "JNJ",
        "domainTags": ["Immunology", "Oncology", "Neuroscience"],
        "marketCap": 400000000000,
        "employees": 135000,
        "rdExpense": 12000000000,
        "cagr": 0.06
    }
]

# Health check endpoint
@app.get("/health", response_model=HealthResponse, tags=["Health"])
async def health_check():
    """Health check endpoint for monitoring"""
    return HealthResponse(
        status="healthy",
        timestamp=datetime.now(),
        uptime=0.0  # You can implement actual uptime tracking
    )

# Mock data function for finance profiles
def get_mock_financial_data(ticker: str) -> FinancialData:
    """Generate mock financial data for a given ticker"""
    ticker_upper = ticker.upper()
    
    # Company-specific mock data
    mock_data = {
        "PFE": {
            "company_name": "Pfizer Inc.",
            "sector": "Healthcare",
            "industry": "Drug Manufacturers - General",
            "employees": 81000,
            "price": 24.54,
            "market_cap": 139523397000,
            "beta": 0.44,
            "volume": 40849330,
            "average_volume": 40776300,
            "revenue": 63627000000,
            "net_income": 8020000000,
            "eps": 1.42,
            "eps_diluted": 1.41,
            "pe_ratio": 17.31,
            "total_debt": 63649000000,
            "cash": 1043000000,
            "enterprise_value": 202129397000,
            "rd_expense": 10738000000,
            "gross_profit": 41846000000,
            "operating_income": 16483000000,
            "ebitda": 18127000000,
            "ebit": 11114000000,
            "cagr": 0.12
        },
        "LLY": {
            "company_name": "Eli Lilly and Company",
            "sector": "Healthcare",
            "industry": "Drug Manufacturers - General",
            "employees": 39000,
            "price": 580.25,
            "market_cap": 550000000000,
            "beta": 0.35,
            "volume": 2500000,
            "average_volume": 2800000,
            "revenue": 28100000000,
            "net_income": 5240000000,
            "eps": 5.48,
            "eps_diluted": 5.44,
            "pe_ratio": 105.9,
            "total_debt": 12000000000,
            "cash": 3000000000,
            "enterprise_value": 559000000000,
            "rd_expense": 7000000000,
            "gross_profit": 22000000000,
            "operating_income": 8500000000,
            "ebitda": 9500000000,
            "ebit": 8500000000,
            "cagr": 0.15
        },
        "AZN": {
            "company_name": "AstraZeneca PLC",
            "sector": "Healthcare",
            "industry": "Drug Manufacturers - General",
            "employees": 76000,
            "price": 68.45,
            "market_cap": 210000000000,
            "beta": 0.65,
            "volume": 1500000,
            "average_volume": 1800000,
            "revenue": 45000000000,
            "net_income": 1200000000,
            "eps": 0.38,
            "eps_diluted": 0.37,
            "pe_ratio": 180.1,
            "total_debt": 28000000000,
            "cash": 8000000000,
            "enterprise_value": 230000000000,
            "rd_expense": 9500000000,
            "gross_profit": 36000000000,
            "operating_income": 6000000000,
            "ebitda": 8500000000,
            "ebit": 6000000000,
            "cagr": 0.08
        }
    }
    
    # Get company-specific data or use generic fallback
    data = mock_data.get(ticker_upper, {
        "company_name": f"{ticker_upper} Company",
        "sector": "Technology",
        "industry": "Software",
        "employees": 50000,
        "price": 100.0,
        "market_cap": 5000000000,
        "beta": 1.0,
        "volume": 1000000,
        "average_volume": 1500000,
        "revenue": 20000000000,
        "net_income": 2000000000,
        "eps": 5.0,
        "eps_diluted": 4.95,
        "pe_ratio": 20.0,
        "total_debt": 10000000000,
        "cash": 5000000000,
        "enterprise_value": 10000000000,
        "rd_expense": 3000000000,
        "gross_profit": 12000000000,
        "operating_income": 4000000000,
        "ebitda": 6000000000,
        "ebit": 5000000000,
        "cagr": 0.10
    })
    
    return FinancialData(
        company_name=data["company_name"],
        sector=data["sector"],
        industry=data["industry"],
        employees=data["employees"],
        price=data["price"],
        market_cap=data["market_cap"],
        beta=data["beta"],
        volume=data["volume"],
        average_volume=data["average_volume"],
        revenue=data["revenue"],
        net_income=data["net_income"],
        eps=data["eps"],
        eps_diluted=data["eps_diluted"],
        pe_ratio=data["pe_ratio"],
        total_debt=data["total_debt"],
        cash=data["cash"],
        enterprise_value=data["enterprise_value"],
        rd_expense=data["rd_expense"],
        gross_profit=data["gross_profit"],
        operating_income=data["operating_income"],
        ebitda=data["ebitda"],
        ebit=data["ebit"],
        cagr=data["cagr"],
        revenue_growth=None,
        net_income_growth=None
    )

# Finance API endpoints
@app.get("/api/finance/profile/{ticker}", response_model=FinancialData, tags=["Finance"])
async def get_company_profile(ticker: str):
    """Get company financial profile by ticker symbol"""
    if not FMP_API_KEY:
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail="Financial Modeling Prep API key not configured"
        )
    
    try:
        async with httpx.AsyncClient() as client:
            # Updated FMP API structure
            profile_url = f"{FMP_BASE_URL}/profile?symbol={ticker}&apikey={FMP_API_KEY}"
            profile_response = await client.get(profile_url)
            profile_response.raise_for_status()
            
            profile_data = profile_response.json()
            if not profile_data or not isinstance(profile_data, list) or len(profile_data) == 0:
                raise HTTPException(
                    status_code=status.HTTP_404_NOT_FOUND,
                    detail="Company not found"
                )
            
            profile = profile_data[0]
            
            # Get financial statements with updated API structure
            ticker_upper = ticker.upper()
            income_url = f"{FMP_BASE_URL}/income-statement?symbol={ticker_upper}&apikey={FMP_API_KEY}"
            balance_url = f"{FMP_BASE_URL}/balance-sheet-statement?symbol={ticker_upper}&apikey={FMP_API_KEY}"
            
            income_response, balance_response = await asyncio.gather(
                client.get(income_url),
                client.get(balance_url)
            )
            
            income_response.raise_for_status()
            balance_response.raise_for_status()
            
            income_json = income_response.json()
            balance_json = balance_response.json()
            
            income_data = income_json[0] if income_json and len(income_json) > 0 else {}
            balance_data = balance_json[0] if balance_json and len(balance_json) > 0 else {}
            
            logger.info(f"Fetched financial data for {ticker}: profile fields={list(profile.keys())}")
            logger.info(f"Income data fields: {list(income_data.keys()) if income_data else 'None'}")
            logger.info(f"Balance data fields: {list(balance_data.keys()) if balance_data else 'None'}")
            
            # Calculate enterprise value
            market_cap = profile.get("marketCap", 0) or 0
            total_debt = balance_data.get("totalDebt", 0) or 0
            cash = balance_data.get("cashAndCashEquivalents", 0) or 0
            enterprise_value = market_cap + total_debt - cash
            
            # Calculate P/E ratio
            price = profile.get("price", 0) or 0
            eps = income_data.get("eps", 0) or 0
            pe_ratio = price / eps if eps > 0 else 0
            
            # Calculate growth metrics (comparing current year to previous year)
            current_revenue = income_data.get("revenue", 0) or 0
            current_net_income = income_data.get("netIncome", 0) or 0
            
            # Get previous year data for growth calculation
            previous_revenue = 0
            previous_net_income = 0
            if income_json and len(income_json) > 1:
                prev_income = income_json[1]
                previous_revenue = prev_income.get("revenue", 0) or 0
                previous_net_income = prev_income.get("netIncome", 0) or 0
            
            revenue_growth = ((current_revenue - previous_revenue) / previous_revenue * 100) if previous_revenue > 0 else None
            net_income_growth = ((current_net_income - previous_net_income) / previous_net_income * 100) if previous_net_income > 0 else None
            
            return FinancialData(
                # Basic Company Info
                company_name=profile.get("companyName"),
                sector=profile.get("sector"),
                industry=profile.get("industry"),
                employees=int(profile.get("fullTimeEmployees", 0)) if profile.get("fullTimeEmployees") else 0,
                
                # Market Data
                price=price,
                market_cap=market_cap,
                beta=profile.get("beta", 0) or 0,
                volume=profile.get("volume", 0) or 0,
                average_volume=profile.get("averageVolume", 0) or 0,
                
                # Financial Metrics
                revenue=current_revenue,
                net_income=current_net_income,
                eps=eps,
                eps_diluted=income_data.get("epsDiluted", 0) or 0,
                pe_ratio=pe_ratio,
                
                # Balance Sheet
                total_debt=total_debt,
                cash=cash,
                enterprise_value=enterprise_value,
                
                # Income Statement
                rd_expense=income_data.get("researchAndDevelopmentExpenses", 0) or 0,
                gross_profit=income_data.get("grossProfit", 0) or 0,
                operating_income=income_data.get("operatingIncome", 0) or 0,
                ebitda=income_data.get("ebitda", 0) or 0,
                ebit=income_data.get("ebit", 0) or 0,
                
                # Growth Metrics
                cagr=None,  # Would need multi-year data for proper CAGR calculation
                revenue_growth=revenue_growth,
                net_income_growth=net_income_growth
            )
            
    except httpx.HTTPStatusError as e:
        logger.error(f"HTTP error fetching data for {ticker}: {e}")
        # Return mock data if API fails
        logger.info(f"Falling back to mock data for {ticker}")
        print(f"DEBUG: Falling back to mock data for {ticker}")
        return get_mock_financial_data(ticker)
    except Exception as e:
        logger.error(f"Error fetching data for {ticker}: {e}")
        # Return mock data as fallback
        logger.info(f"Falling back to mock data for {ticker}")
        return get_mock_financial_data(ticker)

@app.get("/api/finance/search", tags=["Finance"])
async def search_companies(query: str):
    """Search companies by name or ticker"""
    if not FMP_API_KEY:
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail="Financial Modeling Prep API key not configured"
        )
    
    try:
        async with httpx.AsyncClient() as client:
            # Updated FMP API structure - using the correct search-symbol endpoint
            search_url = f"{FMP_BASE_URL}/search-symbol?query={query}&apikey={FMP_API_KEY}"
            response = await client.get(search_url)
            response.raise_for_status()
            
            data = response.json()
            # FMP returns a list, so return it directly
            return data
            
    except httpx.HTTPStatusError as e:
        logger.error(f"HTTP error searching companies: {e}")
        # Return mock data if API fails
        return [
            {
                "symbol": "AAPL",
                "name": "Apple Inc.",
                "exchange": "NASDAQ",
                "exchangeShortName": "NASDAQ",
                "type": "stock"
            }
        ]
    except Exception as e:
        logger.error(f"Error searching companies: {e}")
        # Return mock data as fallback
        return [
            {
                "symbol": "AAPL",
                "name": "Apple Inc.",
                "exchange": "NASDAQ",
                "exchangeShortName": "NASDAQ",
                "type": "stock"
            }
        ]

# Clinical Trials API endpoints
@app.get("/api/clinical-trials/{company_name}", response_model=List[ClinicalTrial], tags=["Clinical Trials"])
async def get_company_trials(company_name: str):
    """Get clinical trials for a company"""
    if MOCK_MODE:
        # Return mock data
        return [
            ClinicalTrial(
                phase="PHASE2",
                title=f"Mock Trial for {company_name}",
                interventions=["ABC-123", "XYZ-789"],
                enrollment=220,
                status="Recruiting",
                sponsor=company_name
            )
        ]
    
    try:
        async with httpx.AsyncClient() as client:
            # ClinicalTrials.gov API call
            search_url = f"{CTGOV_BASE}/studies"
            params = {
                "query": f"sponsor:\"{company_name}\"",
                "fields": "NCTId,BriefTitle,Phase,EnrollmentCount,LeadSponsorName,OverallStatus"
            }
            
            response = await client.get(search_url, params=params)
            response.raise_for_status()
            
            trials_data = response.json()
            trials = []
            
            for trial in trials_data.get("studies", []):
                trials.append(ClinicalTrial(
                    phase=trial.get("phase", "Unknown"),
                    title=trial.get("briefTitle", "No title"),
                    interventions=[],  # Would need additional API call
                    enrollment=trial.get("enrollmentCount", 0),
                    status=trial.get("overallStatus", "Unknown"),
                    sponsor=trial.get("leadSponsorName", "Unknown")
                ))
            
            return trials
            
    except Exception as e:
        logger.error(f"Error fetching clinical trials for {company_name}: {e}")
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail="Failed to fetch clinical trials"
        )

# ChEMBL API endpoints
@app.get("/api/molecules/{compound_id}", response_model=MoleculeData, tags=["Molecules"])
async def get_molecule_data(compound_id: str):
    """Get molecule data from ChEMBL"""
    if MOCK_MODE:
        # Return mock data
        return MoleculeData(
            distinct_targets=5,
            max_phase_by_molecule={compound_id: 2}
        )
    
    try:
        async with httpx.AsyncClient() as client:
            # ChEMBL API call
            molecule_url = f"{CHEMBL_BASE}/molecule/{compound_id}"
            response = await client.get(molecule_url)
            response.raise_for_status()
            
            molecule_data = response.json()
            
            return MoleculeData(
                distinct_targets=len(molecule_data.get("targets", [])),
                max_phase_by_molecule={compound_id: molecule_data.get("max_phase", 0)}
            )
            
    except Exception as e:
        logger.error(f"Error fetching molecule data for {compound_id}: {e}")
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail="Failed to fetch molecule data"
        )

# Company Ranking API endpoints
@app.post("/api/ranking/company", response_model=CompanyRankingOutput, tags=["AI Ranking"])
async def rank_company(input_data: CompanyRankingInput):
    """Rank a company using AI and heuristics"""
    try:
        # Mock ranking for now - would integrate with actual AI service
        if MOCK_MODE:
            return CompanyRankingOutput(
                x=0.6,  # Maturity score
                y=0.7,  # Differentiation score
                rationale="Mock ranking based on company data analysis"
            )
        
        # TODO: Implement actual AI ranking logic
        # This would integrate with OpenAI or other AI services
        
        return CompanyRankingOutput(
            x=0.5,
            y=0.5,
            rationale="AI ranking service not yet implemented"
        )
        
    except Exception as e:
        logger.error(f"Error in company ranking: {e}")
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail="Failed to rank company"
        )

# Companies API endpoints
@app.get("/api/companies", response_model=List[Company], tags=["Companies"])
async def get_companies():
    """Get all companies"""
    return companies_db

@app.get("/api/companies/{company_id}", response_model=Company, tags=["Companies"])
async def get_company(company_id: str):
    """Get company by ID"""
    company = next((c for c in companies_db if c["id"] == company_id), None)
    if not company:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Company not found"
        )
    return company

@app.post("/api/companies", response_model=Company, status_code=status.HTTP_201_CREATED, tags=["Companies"])
async def create_company(company: CompanyCreate):
    """Create a new company"""
    # Check if ticker already exists
    if any(c["ticker"] == company.ticker.upper() for c in companies_db):
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail="Company with this ticker already exists"
        )
    
    # Try to fetch description from FMP if not provided
    description = company.description
    if not description and FMP_API_KEY and not MOCK_MODE:
        try:
            async with httpx.AsyncClient() as client:
                profile_url = f"{FMP_BASE_URL}/profile?symbol={company.ticker}&apikey={FMP_API_KEY}"
                response = await client.get(profile_url)
                if response.status_code == 200:
                    profile_data = response.json()
                    if profile_data and len(profile_data) > 0:
                        description = profile_data[0].get("description", "No description available.")
        except Exception as e:
            logger.warning(f"Failed to fetch description for {company.ticker}: {e}")
            description = "Company description will be populated here."
    
    new_company = {
        "id": f"{company.ticker}-{datetime.now().timestamp()}",
        "name": company.name,
        "ticker": company.ticker.upper(),
        "description": description or "Company description will be populated here.",
        "company_type": company.company_type or "Unknown",
        "created_at": datetime.now(),
        "updated_at": datetime.now()
    }
    
    companies_db.append(new_company)
    logger.info(f"Created company: {new_company['name']} ({new_company['ticker']})")
    return new_company

@app.put("/api/companies/{company_id}", response_model=Company, tags=["Companies"])
async def update_company(company_id: str, company_update: CompanyUpdate):
    """Update company information"""
    company_index = next((i for i, c in enumerate(companies_db) if c["id"] == company_id), None)
    if company_index is None:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Company not found"
        )
    
    # Update fields
    for field, value in company_update.dict(exclude_unset=True).items():
        if field == "ticker" and value:
            value = value.upper()
        companies_db[company_index][field] = value
    
    companies_db[company_index]["updated_at"] = datetime.now()
    
    logger.info(f"Updated company: {companies_db[company_index]['name']}")
    return companies_db[company_index]

@app.delete("/api/companies/{company_id}", tags=["Companies"])
async def delete_company(company_id: str):
    """Delete a company"""
    company_index = next((i for i, c in enumerate(companies_db) if c["id"] == company_id), None)
    if company_index is None:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Company not found"
        )
    
    deleted_company = companies_db.pop(company_index)
    logger.info(f"Deleted company: {deleted_company['name']}")
    
    return {"message": "Company deleted successfully", "company": deleted_company}

@app.delete("/api/companies", tags=["Companies"])
async def clear_companies():
    """Clear all companies"""
    count = len(companies_db)
    companies_db.clear()
    logger.info(f"Cleared {count} companies")
    
    return {"message": f"Cleared {count} companies"}

# Mock data endpoints for development
@app.get("/api/mock/companies", tags=["Mock Data"])
async def get_mock_companies():
    """Get mock company data for development"""
    return MOCK_COMPANIES

# Root endpoint
@app.get("/", tags=["Root"])
async def root():
    """Root endpoint with API information"""
    return {
        "message": "Atlas Company Analyzer API",
        "version": "1.0.0",
        "docs": "/docs",
        "health": "/health",
        "features": [
            "Financial Data (FMP API)",
            "Clinical Trials (ClinicalTrials.gov)",
            "Molecule Data (ChEMBL)",
            "AI Company Ranking",
            "Company Management"
        ]
    }

if __name__ == "__main__":
    uvicorn.run(
        "main:app",
        host="0.0.0.0",
        port=int(os.getenv("BACKEND_PORT", "5000")),
        reload=True,
        log_level="info"
    )
