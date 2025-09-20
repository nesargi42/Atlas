// Simple script to add test companies to localStorage
const testCompanies = [
  {
    id: 'AAPL',
    name: 'Apple Inc.',
    ticker: 'AAPL',
    domainTags: ['technology', 'consumer electronics'],
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString()
  },
  {
    id: 'PFE',
    name: 'Pfizer Inc.',
    ticker: 'PFE',
    domainTags: ['pharmaceuticals', 'healthcare'],
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString()
  },
  {
    id: 'MRNA',
    name: 'Moderna Inc.',
    ticker: 'MRNA',
    domainTags: ['biotechnology', 'vaccines'],
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString()
  }
];

// Add to localStorage
localStorage.setItem('selectedCompanies', JSON.stringify(testCompanies));
console.log('Test companies added to localStorage:', testCompanies);


