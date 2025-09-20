const express = require('express');
const axios = require('axios');
const router = express.Router();

const FMP_BASE_URL = 'https://financialmodelingprep.com/api/v3';
const FMP_API_KEY = process.env.FMP_API_KEY;

// Middleware to check if API key is available
const checkApiKey = (req, res, next) => {
  if (!FMP_API_KEY) {
    return res.status(500).json({ 
      error: 'Financial Modeling Prep API key not configured',
      message: 'Please set FMP_API_KEY in your environment variables'
    });
  }
  next();
};

// Get company profile and financial data
router.get('/profile/:ticker', checkApiKey, async (req, res) => {
  try {
    const { ticker } = req.params;
    
    // Get company profile
    const profileResponse = await axios.get(
      `${FMP_BASE_URL}/profile/${ticker}?apikey=${FMP_API_KEY}`
    );

    if (!profileResponse.data || profileResponse.data.length === 0) {
      return res.status(404).json({ error: 'Company not found' });
    }

    const profile = profileResponse.data[0];

    // Get financial statements
    const [incomeResponse, balanceResponse] = await Promise.all([
      axios.get(`${FMP_BASE_URL}/income-statement/${ticker}?limit=1&apikey=${FMP_API_KEY}`),
      axios.get(`${FMP_BASE_URL}/balance-sheet-statement/${ticker}?limit=1&apikey=${FMP_API_KEY}`)
    ]);

    const income = incomeResponse.data?.[0] || {};
    const balance = balanceResponse.data?.[0] || {};

    // Get historical data for CAGR calculation
    const historicalResponse = await axios.get(
      `${FMP_BASE_URL}/historical-price-full/${ticker}?apikey=${FMP_API_KEY}`
    );

    const historical = historicalResponse.data?.historical || [];
    const cagr = calculateCAGRFromHistorical(historical, profile.mktCap);

    const financialData = {
      marketCap: profile.mktCap || 0,
      employees: profile.employees || 0,
      rdExpense: income.researchAndDevelopmentExpenses || 0,
      totalDebt: balance.totalDebt || 0,
      cash: balance.cashAndCashEquivalents || 0,
      enterpriseValue: calculateEnterpriseValue(
        profile.mktCap || 0,
        balance.totalDebt || 0,
        balance.cashAndCashEquivalents || 0
      ),
      revenue: income.revenue || 0,
      cagr,
      companyName: profile.companyName,
      sector: profile.sector,
      industry: profile.industry,
      website: profile.website,
      description: profile.description
    };

    res.json(financialData);
  } catch (error) {
    console.error(`Error fetching financial data for ${req.params.ticker}:`, error);
    res.status(500).json({ 
      error: 'Failed to fetch financial data',
      message: error.message 
    });
  }
});

// Search companies
router.get('/search', checkApiKey, async (req, res) => {
  try {
    const { query } = req.query;
    
    if (!query) {
      return res.status(400).json({ error: 'Query parameter is required' });
    }

    const response = await axios.get(
      `${FMP_BASE_URL}/search?query=${encodeURIComponent(query)}&apikey=${FMP_API_KEY}`
    );

    res.json(response.data || []);
  } catch (error) {
    console.error('Error searching companies:', error);
    res.status(500).json({ 
      error: 'Failed to search companies',
      message: error.message 
    });
  }
});

// Get market data (quote)
router.get('/quote/:ticker', checkApiKey, async (req, res) => {
  try {
    const { ticker } = req.params;
    
    const response = await axios.get(
      `${FMP_BASE_URL}/quote/${ticker}?apikey=${FMP_API_KEY}`
    );

    if (!response.data || response.data.length === 0) {
      return res.status(404).json({ error: 'Quote not found' });
    }

    res.json(response.data[0]);
  } catch (error) {
    console.error(`Error fetching quote for ${req.params.ticker}:`, error);
    res.status(500).json({ 
      error: 'Failed to fetch quote',
      message: error.message 
    });
  }
});

// Helper functions
function calculateCAGRFromHistorical(historical, currentPrice) {
  if (historical.length < 2) return 0;

  const fiveYearsAgo = new Date();
  fiveYearsAgo.setFullYear(fiveYearsAgo.getFullYear() - 5);

  const historicalPrice = historical.find(h => {
    const date = new Date(h.date);
    return date <= fiveYearsAgo;
  });

  if (!historicalPrice) return 0;

  const years = 5;
  const startPrice = historicalPrice.close;
  const endPrice = currentPrice;

  return Math.pow(endPrice / startPrice, 1 / years) - 1;
}

function calculateEnterpriseValue(marketCap, totalDebt, cash) {
  return marketCap + totalDebt - cash;
}

module.exports = router;

