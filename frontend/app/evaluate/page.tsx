'use client'

import { useState, useEffect, useCallback } from 'react'
import { useSearchParams, useRouter } from 'next/navigation'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Building2, TrendingUp, BarChart3, ArrowRight } from 'lucide-react'
import { CompanyCard } from '@/components/CompanyCard'
import { ComparisonMatrix } from '@/components/ComparisonMatrix'
import { CriteriaForm } from '@/components/CriteriaForm'
import { CompanyList } from '@/components/CompanyList'
import { FinancialMetrics } from '@/components/FinancialMetrics'
import { InDepthAnalysis } from '@/components/InDepthAnalysis'
import { MaturityDifferentiationChart } from '@/components/MaturityDifferentiationChart'
import { backendService } from '@/lib/backend-service'
import { Company, CompanyAnalysis, EvaluationCriteria } from '@/lib/types'
import { calculateFocusAreaFit } from '@/lib/utils'

export default function EvaluatePage() {
  const searchParams = useSearchParams()
  const router = useRouter()
  const [selectedCompanies, setSelectedCompanies] = useState<Company[]>([])
  const [companyAnalyses, setCompanyAnalyses] = useState<CompanyAnalysis[]>([])
  const [isAnalyzing, setIsAnalyzing] = useState(false)
  const [showCriteria, setShowCriteria] = useState(false)
  const [showFinancialMetrics, setShowFinancialMetrics] = useState(true)

  console.log('EvaluatePage rendered, selectedCompanies:', selectedCompanies.length)

  // Load companies from Financial Metrics page (stored in localStorage)
  useEffect(() => {
    const savedCompanies = localStorage.getItem('selectedCompanies')
    console.log('Loading companies from localStorage:', savedCompanies)
    if (savedCompanies) {
      try {
        const companies = JSON.parse(savedCompanies)
        console.log('Parsed companies:', companies)
        setSelectedCompanies(companies)
      } catch (error) {
        console.error('Error loading saved companies:', error)
      }
    } else {
      console.log('No companies found in localStorage')
    }
  }, [])

  const handleCompanyListChange = useCallback((companies: Company[]) => {
    setSelectedCompanies(companies)
    // Save to localStorage for persistence
    localStorage.setItem('selectedCompanies', JSON.stringify(companies))
  }, [])

  const handleInDepthAnalysisComplete = (analyses: CompanyAnalysis[]) => {
    setCompanyAnalyses(analyses)
    setShowCriteria(true)
  }

  const handleEvaluationComplete = (criteria: EvaluationCriteria) => {
    // Store data in localStorage for results page
    localStorage.setItem('companyAnalyses', JSON.stringify(companyAnalyses))
    localStorage.setItem('evaluationCriteria', JSON.stringify(criteria))
    
    // Navigate to results page
    router.push('/results')
  }

  return (
    <div className="min-h-screen bg-background">
      {/* Header */}
      <header className="border-b bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/60">
        <div className="container mx-auto px-4 py-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center space-x-2">
              <Building2 className="h-8 w-8 text-primary" />
              <h1 className="text-2xl font-bold">Atlas</h1>
            </div>
            <Button variant="outline" onClick={() => router.push('/')}>
              Back to Home
            </Button>
          </div>
        </div>
      </header>

      <main className="container mx-auto px-4 py-8">
        <div className="max-w-6xl mx-auto">
          {/* Page Title */}
          <div className="text-center mb-8">
            <h1 className="text-4xl font-bold mb-4">Company Evaluation</h1>
            <p className="text-lg text-muted-foreground">
              Analyze companies from Financial Metrics using in-depth criteria
            </p>
          </div>

          {/* Company List Management */}
          <CompanyList onCompaniesChange={handleCompanyListChange} />

          {/* Financial Metrics Section - Always show when companies are selected */}
          {selectedCompanies.length > 0 && (
            <div className="mb-8">
              <FinancialMetrics companies={selectedCompanies} />
            </div>
          )}

          {/* Maturity vs Differentiation Chart - Show when analysis is complete */}
          {companyAnalyses.length > 0 && (
            <div className="mb-8">
              <MaturityDifferentiationChart analyses={companyAnalyses} />
            </div>
          )}

          {/* In-Depth Analysis Section */}
          {selectedCompanies.length > 0 && (
            <div className="mb-8">
              <InDepthAnalysis 
                companies={selectedCompanies} 
                onAnalysisComplete={handleInDepthAnalysisComplete}
              />
            </div>
          )}

          {/* Selected Companies Summary */}
          {selectedCompanies.length > 0 && (
            <Card className="mb-8">
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <BarChart3 className="h-5 w-5" />
                  Selected Companies ({selectedCompanies.length})
                </CardTitle>
                <CardDescription>
                  Companies from Financial Metrics ready for analysis
                </CardDescription>
              </CardHeader>
              <CardContent>
                <div className="grid gap-4">
                  {selectedCompanies.map((company) => (
                    <CompanyCard
                      key={company.id}
                      company={company}
                      isSelected={true}
                      onSelect={() => {}} // Disable selection changes here
                    />
                  ))}
                </div>
              </CardContent>
            </Card>
          )}

          {/* Comparison Matrix */}
          {companyAnalyses.length > 0 && (
            <div className="mb-8">
              <ComparisonMatrix analyses={companyAnalyses} />
            </div>
          )}

          {/* Evaluation Criteria Form */}
          {showCriteria && companyAnalyses.length > 0 && (
            <CriteriaForm
              onComplete={handleEvaluationComplete}
              companyCount={companyAnalyses.length}
            />
          )}
        </div>
      </main>
    </div>
  )
}
