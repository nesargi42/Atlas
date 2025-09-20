const express = require('express');
const router = express.Router();

// In-memory storage for companies (in production, use a database)
let companies = [];

// Get all companies
router.get('/', (req, res) => {
  res.json(companies);
});

// Get company by ID
router.get('/:id', (req, res) => {
  const company = companies.find(c => c.id === req.params.id);
  if (!company) {
    return res.status(404).json({ error: 'Company not found' });
  }
  res.json(company);
});

// Create new company
router.post('/', (req, res) => {
  const { name, ticker, description, companyType } = req.body;
  
  if (!name || !ticker) {
    return res.status(400).json({ error: 'Name and ticker are required' });
  }

  const newCompany = {
    id: `${ticker}-${Date.now()}`,
    name,
    ticker: ticker.toUpperCase(),
    description: description || 'Company description will be populated here.',
    companyType: companyType || 'Unknown',
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString()
  };

  companies.push(newCompany);
  res.status(201).json(newCompany);
});

// Update company
router.put('/:id', (req, res) => {
  const companyIndex = companies.findIndex(c => c.id === req.params.id);
  if (companyIndex === -1) {
    return res.status(404).json({ error: 'Company not found' });
  }

  const { name, ticker, description, companyType } = req.body;
  
  companies[companyIndex] = {
    ...companies[companyIndex],
    ...(name && { name }),
    ...(ticker && { ticker: ticker.toUpperCase() }),
    ...(description && { description }),
    ...(companyType && { companyType }),
    updatedAt: new Date().toISOString()
  };

  res.json(companies[companyIndex]);
});

// Delete company
router.delete('/:id', (req, res) => {
  const companyIndex = companies.findIndex(c => c.id === req.params.id);
  if (companyIndex === -1) {
    return res.status(404).json({ error: 'Company not found' });
  }

  const deletedCompany = companies.splice(companyIndex, 1)[0];
  res.json({ message: 'Company deleted successfully', company: deletedCompany });
});

// Bulk operations
router.post('/bulk', (req, res) => {
  const { companies: newCompanies } = req.body;
  
  if (!Array.isArray(newCompanies)) {
    return res.status(400).json({ error: 'Companies must be an array' });
  }

  const validCompanies = newCompanies.filter(c => c.name && c.ticker);
  const addedCompanies = validCompanies.map(company => ({
    id: `${company.ticker}-${Date.now()}-${Math.random()}`,
    name: company.name,
    ticker: company.ticker.toUpperCase(),
    description: company.description || 'Company description will be populated here.',
    companyType: company.companyType || 'Unknown',
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString()
  }));

  companies.push(...addedCompanies);
  res.status(201).json(addedCompanies);
});

// Clear all companies
router.delete('/', (req, res) => {
  const count = companies.length;
  companies = [];
  res.json({ message: `Cleared ${count} companies` });
});

module.exports = router;

