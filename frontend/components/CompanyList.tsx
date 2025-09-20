'use client'

import { useState, useEffect } from 'react'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Textarea } from '@/components/ui/textarea'
import { Label } from '@/components/ui/label'
import { X, Plus, Edit2, Save, Building2, DollarSign, FlaskConical } from 'lucide-react'
import { Company, FinancialData } from '@/lib/types'
import { backendService } from '@/lib/backend-service'

interface CompanyListItem {
  id: string
  name: string
  ticker: string
  description: string
  companyType: string
  isEditing: boolean
  financial?: FinancialData | null
  financialLoading?: boolean
  financialError?: string | null
}

interface CompanyListProps {
  onCompaniesChange: (companies: Company[]) => void
}

export function CompanyList({ onCompaniesChange }: CompanyListProps) {
  const [companies, setCompanies] = useState<CompanyListItem[]>([])
  const [newCompanyInput, setNewCompanyInput] = useState('')
  const [isAdding, setIsAdding] = useState(false)

  // Update parent component when companies change
  useEffect(() => {
    const companyObjects: Company[] = companies.map(company => ({
      id: company.id,
      name: company.name,
      ticker: company.ticker,
      domainTags: [company.companyType],
      createdAt: new Date(),
      updatedAt: new Date()
    }))
    onCompaniesChange(companyObjects)
  }, [companies, onCompaniesChange])

  // Fetch financials lazily for companies missing data
  useEffect(() => {
    const fetchMissing = async () => {
      const targets = companies.filter(c => c.ticker && c.financial === undefined && !c.financialLoading)
      if (targets.length === 0) return
      for (const c of targets) {
        setCompanies(prev => prev.map(it => it.id === c.id ? { ...it, financialLoading: true, financialError: null } : it))
        try {
          const response = await fetch(`/api/finance/${c.ticker}`)
          if (!response.ok) throw new Error(`HTTP ${response.status}`)
          const result = await response.json()
          const profile = result.data || result
          setCompanies(prev => prev.map(it => it.id === c.id ? { ...it, financial: profile, financialLoading: false } : it))
        } catch (e: any) {
          setCompanies(prev => prev.map(it => it.id === c.id ? { ...it, financialLoading: false, financialError: e?.message || 'Failed to load financials' } : it))
        }
      }
    }
    fetchMissing()
  }, [companies])

  const addCompany = async () => {
    if (!newCompanyInput.trim()) {
      console.log('❌ Empty input, not adding company')
      return
    }

    console.log('🚀 Adding company:', newCompanyInput)
    setIsAdding(true)
    try {
      // Try to get company info from API using frontend API routes
      console.log('🔍 Searching for company:', newCompanyInput)
      const searchResponse = await fetch(`/api/finance/search?query=${encodeURIComponent(newCompanyInput)}`)
      
      if (!searchResponse.ok) {
        throw new Error(`Search failed: ${searchResponse.status}`)
      }
      
      const searchData = await searchResponse.json()
      const searchResults = searchData.data || searchData
      console.log('📊 Search results:', searchResults)
      
      let companyName = newCompanyInput
      let ticker = newCompanyInput.toUpperCase()
      let description = 'Company description will be populated here.'
      let companyType = 'Unknown'
      let fetchedProfile: FinancialData | null = null

      if (searchResults && searchResults.length > 0) {
        const firstResult = searchResults[0]
        companyName = firstResult.name || newCompanyInput
        ticker = firstResult.symbol || newCompanyInput.toUpperCase()
        
        console.log('✅ Found company:', { companyName, ticker })
        
        // Determine company type based on name or other indicators
        if (companyName.toLowerCase().includes('pharma') || 
            companyName.toLowerCase().includes('biotech') ||
            companyName.toLowerCase().includes('healthcare')) {
          companyType = 'Pharmaceutical'
        } else if (companyName.toLowerCase().includes('tech') ||
                   companyName.toLowerCase().includes('software')) {
          companyType = 'Technology'
        } else if (companyName.toLowerCase().includes('finance') ||
                   companyName.toLowerCase().includes('bank')) {
          companyType = 'Financial'
        } else {
          companyType = 'Other'
        }
      } else {
        console.log('⚠️ No search results found for:', newCompanyInput)
      }

      // Try to get a basic description from company profile (for any ticker)
      try {
        console.log('💰 Fetching financial profile for:', ticker)
        const profileResponse = await fetch(`/api/finance/${ticker}`)
        
        if (profileResponse.ok) {
          const profileData = await profileResponse.json()
          const profile = profileData.data || profileData
          console.log('💰 Received profile:', profile)
          fetchedProfile = profile
          if (profile) {
            description = `${companyName} is a company with a market cap of $${(profile.market_cap / 1_000_000_000).toFixed(2)}B and ${Number(profile.employees || 0).toLocaleString()} employees.`
          }
        } else {
          console.log('⚠️ Profile fetch failed with status:', profileResponse.status)
          fetchedProfile = null
        }
      } catch (error) {
        console.error('⚠️ Could not fetch company profile for description:', error)
        fetchedProfile = null
      }

      const newCompany: CompanyListItem = {
        id: `${ticker}-${Date.now()}`,
        name: companyName,
        ticker,
        description,
        companyType,
        isEditing: false,
        financial: fetchedProfile ?? undefined,
        financialLoading: !fetchedProfile,
        financialError: null
      }

      console.log('✅ Adding company to list:', newCompany)
      setCompanies(prev => {
        const newList = [...prev, newCompany]
        console.log('📋 Updated company list:', newList)
        return newList
      })
      setNewCompanyInput('')
      console.log('🎉 Company added successfully!')
    } catch (error) {
      console.error('❌ Error adding company:', error)
      alert(`Failed to add company: ${error instanceof Error ? error.message : 'Unknown error'}`)
    } finally {
      setIsAdding(false)
    }
  }

  const removeCompany = (id: string) => {
    setCompanies(prev => prev.filter(company => company.id !== id))
  }

  const toggleEdit = (id: string) => {
    setCompanies(prev => prev.map(company => 
      company.id === id ? { ...company, isEditing: !company.isEditing } : company
    ))
  }

  const updateCompany = (id: string, field: keyof CompanyListItem, value: string) => {
    setCompanies(prev => prev.map(company => 
      company.id === id ? { ...company, [field]: value } : company
    ))
  }

  const saveCompany = (id: string) => {
    setCompanies(prev => prev.map(company => 
      company.id === id ? { ...company, isEditing: false } : company
    ))
  }

  const getCompanyTypeIcon = (type: string) => {
    switch (type.toLowerCase()) {
      case 'pharmaceutical':
        return <FlaskConical className="h-4 w-4 text-blue-500" />
      case 'technology':
        return <Building2 className="h-4 w-4 text-green-500" />
      case 'financial':
        return <DollarSign className="h-4 w-4 text-yellow-500" />
      default:
        return <Building2 className="h-4 w-4 text-gray-500" />
    }
  }

  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <Building2 className="h-5 w-5" />
          Company List
        </CardTitle>
        <CardDescription>
          Add companies to analyze and customize their descriptions
        </CardDescription>
      </CardHeader>
      <CardContent>
        {/* Add Company Input */}
        <div className="flex gap-2 mb-6">
          <Input
            type="text"
            placeholder="Enter company name or ticker (e.g., PFE, Moderna, Apple)"
            value={newCompanyInput}
            onChange={(e) => setNewCompanyInput(e.target.value)}
            onKeyPress={(e) => e.key === 'Enter' && addCompany()}
            className="flex-1"
          />
          <Button 
            onClick={() => {
              console.log('🔘 Add button clicked!')
              addCompany()
            }}
            disabled={isAdding || !newCompanyInput.trim()}
            className="flex items-center gap-2"
          >
            {isAdding ? (
              <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white" />
            ) : (
              <Plus className="h-4 w-4" />
            )}
            Add
          </Button>
        </div>

        {/* Company List */}
        {companies.length === 0 ? (
          <div className="text-center py-8 text-muted-foreground">
            <Building2 className="h-12 w-12 mx-auto mb-4 opacity-50" />
            <p>No companies added yet. Start by adding a company above.</p>
          </div>
        ) : (
          <div className="space-y-4">
            {companies.map((company) => (
              <Card key={company.id} className="border-l-4 border-l-primary/20">
                <CardContent className="p-4">
                  <div className="flex items-start justify-between">
                    <div className="flex-1">
                      <div className="flex items-center gap-2 mb-2">
                        {getCompanyTypeIcon(company.companyType)}
                        <span className="text-sm font-medium text-muted-foreground">
                          {company.companyType}
                        </span>
                      </div>
                      
                      <div className="flex items-center gap-2 mb-3">
                        <h3 className="font-semibold text-lg">{company.name}</h3>
                        <span className="text-sm bg-muted px-2 py-1 rounded">
                          {company.ticker}
                        </span>
                      </div>

                      {company.isEditing ? (
                        <div className="space-y-3">
                          <div>
                            <Label htmlFor={`desc-${company.id}`}>Description</Label>
                            <Textarea
                              id={`desc-${company.id}`}
                              value={company.description}
                              onChange={(e) => updateCompany(company.id, 'description', e.target.value)}
                              rows={3}
                            />
                          </div>
                          <div className="flex gap-2">
                            <Button
                              size="sm"
                              onClick={() => saveCompany(company.id)}
                              className="flex items-center gap-2"
                            >
                              <Save className="h-4 w-4" />
                              Save
                            </Button>
                          </div>
                        </div>
                      ) : (
                        <div className="space-y-3">
                          {/* Company Description */}
                          {company.financialLoading ? (
                            <div className="flex items-center gap-2 text-sm text-muted-foreground">
                              <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-primary" />
                              Loading company details...
                            </div>
                          ) : company.financial ? (
                            <div className="space-y-2">
                              <p className="text-muted-foreground">
                                {company.financial.company_name} operates in the {company.financial.sector} sector, 
                                specifically in {company.financial.industry}. The company has a market capitalization of {formatCurrency(company.financial.market_cap)} 
                                and employs approximately {formatNumber(company.financial.employees)} people.
                              </p>
                              <div className="text-sm text-muted-foreground">
                                <span className="font-medium">Current Stock Price:</span> ${company.financial.price?.toFixed(2) || 'N/A'} • 
                                <span className="font-medium ml-2">Market Cap:</span> {formatCurrency(company.financial.market_cap)} • 
                                <span className="font-medium ml-2">Employees:</span> {formatNumber(company.financial.employees)}
                              </div>
                            </div>
                          ) : company.financialError ? (
                            <div>
                              <p className="text-muted-foreground">{company.description}</p>
                              <p className="text-xs text-yellow-700 bg-yellow-50 border border-yellow-200 rounded px-2 py-1 inline-block mt-2">{company.financialError}</p>
                            </div>
                          ) : (
                            <p className="text-muted-foreground">{company.description}</p>
                          )}
                          
                          <div className="flex gap-2">
                            <Button
                              variant="outline"
                              size="sm"
                              onClick={() => toggleEdit(company.id)}
                              className="flex items-center gap-2"
                            >
                              <Edit2 className="h-4 w-4" />
                              Edit Description
                            </Button>
                          </div>
                        </div>
                      )}
                    </div>
                    
                    <Button
                      variant="ghost"
                      size="sm"
                      onClick={() => removeCompany(company.id)}
                      className="text-muted-foreground hover:text-destructive"
                    >
                      <X className="h-4 w-4" />
                    </Button>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        )}
      </CardContent>
    </Card>
  )
}

// Local helpers (keep compact, mirror FinancialMetrics)
const formatCurrency = (raw: unknown) => {
  const value = typeof raw === 'number' && !isNaN(raw) ? raw : 0
  if (value >= 1e12) return `$${(value / 1e12).toFixed(2)}T`
  if (value >= 1e9) return `$${(value / 1e9).toFixed(2)}B`
  if (value >= 1e6) return `$${(value / 1e6).toFixed(2)}M`
  if (value >= 1e3) return `$${(value / 1e3).toFixed(2)}K`
  return `$${value.toFixed(2)}`
}

const formatNumber = (raw: unknown) => {
  const value = typeof raw === 'number' && !isNaN(raw) ? raw : 0
  return value.toLocaleString()
}

const formatMaybeNumber = (raw: unknown) => {
  return typeof raw === 'number' && !isNaN(raw) ? raw.toFixed(2) : '-'
}

const formatMaybeCurrency = (raw: unknown) => {
  return typeof raw === 'number' && !isNaN(raw) ? `$${raw.toFixed(2)}` : '-'
}
