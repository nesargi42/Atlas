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
import EvaluationNavigation from '@/components/EvaluationNavigation'
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
  const [activeSection, setActiveSection] = useState('select-company')

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

  const renderSection = () => {
    switch (activeSection) {
      case 'select-company':
        return (
          <div className="space-y-6">
            <div className="text-center mb-8">
              <h2 className="text-3xl font-bold mb-4">Select Companies</h2>
              <p className="text-lg text-muted-foreground">
                Search and select companies for analysis
              </p>
            </div>
            <CompanyList onCompaniesChange={handleCompanyListChange} />
            
            {selectedCompanies.length > 0 && (
              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    <BarChart3 className="h-5 w-5" />
                    Selected Companies ({selectedCompanies.length})
                  </CardTitle>
                  <CardDescription>
                    Companies ready for analysis
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
          </div>
        )

      case 'financial-metrics':
        return (
          <div className="space-y-6">
            <div className="text-center mb-8">
              <h2 className="text-3xl font-bold mb-4">Financial Metrics</h2>
              <p className="text-lg text-muted-foreground">
                Detailed financial analysis of selected companies
              </p>
            </div>
            {selectedCompanies.length > 0 ? (
              <FinancialMetrics companies={selectedCompanies} />
            ) : (
              <Card>
                <CardContent className="text-center py-8">
                  <p className="text-muted-foreground">Please select companies first to view financial metrics.</p>
                </CardContent>
              </Card>
            )}
          </div>
        )

      case 'analysis-criteria':
        return (
          <div className="space-y-6">
            <div className="text-center mb-8">
              <h2 className="text-3xl font-bold mb-4">Analysis Criteria</h2>
              <p className="text-lg text-muted-foreground">
                Configure analysis parameters and weights
              </p>
            </div>
            {selectedCompanies.length > 0 ? (
              <InDepthAnalysis 
                companies={selectedCompanies} 
                onAnalysisComplete={handleInDepthAnalysisComplete}
              />
            ) : (
              <Card>
                <CardContent className="text-center py-8">
                  <p className="text-muted-foreground">Please select companies first to configure analysis criteria.</p>
                </CardContent>
              </Card>
            )}
          </div>
        )

      case 'analysis-summary':
        return (
          <div className="space-y-6">
            <div className="text-center mb-8">
              <h2 className="text-3xl font-bold mb-4">Analysis Summary</h2>
              <p className="text-lg text-muted-foreground">
                Overview of analysis results and next steps
              </p>
            </div>
            {companyAnalyses.length > 0 ? (
              <div className="space-y-6">
                <Card>
                  <CardHeader>
                    <CardTitle>Analysis Complete</CardTitle>
                    <CardDescription>
                      Analysis has been completed for {companyAnalyses.length} companies
                    </CardDescription>
                  </CardHeader>
                  <CardContent>
                    <p className="text-sm text-muted-foreground mb-4">
                      You can now view the Maturity vs. Differentiation chart and Comparison Matrix.
                    </p>
                    <Button onClick={() => setActiveSection('maturity-differentiation')}>
                      View Maturity vs. Differentiation Analysis
                    </Button>
                  </CardContent>
                </Card>
                
                {showCriteria && (
                  <CriteriaForm
                    onComplete={handleEvaluationComplete}
                    companyCount={companyAnalyses.length}
                  />
                )}
              </div>
            ) : (
              <Card>
                <CardContent className="text-center py-8">
                  <p className="text-muted-foreground">Please run the analysis first to view the summary.</p>
                </CardContent>
              </Card>
            )}
          </div>
        )

      case 'maturity-differentiation':
        return (
          <div className="space-y-6">
            <div className="text-center mb-8">
              <h2 className="text-3xl font-bold mb-4">Maturity vs. Differentiation Analysis</h2>
              <p className="text-lg text-muted-foreground">
                Visual analysis of company maturity and differentiation scores
              </p>
            </div>
            {companyAnalyses.length > 0 ? (
              <MaturityDifferentiationChart analyses={companyAnalyses} />
            ) : (
              <Card>
                <CardContent className="text-center py-8">
                  <p className="text-muted-foreground">Please complete the analysis first to view the maturity vs. differentiation chart.</p>
                </CardContent>
              </Card>
            )}
          </div>
        )

      case 'comparison-matrix':
        return (
          <div className="space-y-6">
            <div className="text-center mb-8">
              <h2 className="text-3xl font-bold mb-4">Comparison Matrix</h2>
              <p className="text-lg text-muted-foreground">
                Side-by-side comparison of all analyzed companies
              </p>
            </div>
            {companyAnalyses.length > 0 ? (
              <ComparisonMatrix analyses={companyAnalyses} />
            ) : (
              <Card>
                <CardContent className="text-center py-8">
                  <p className="text-muted-foreground">Please complete the analysis first to view the comparison matrix.</p>
                </CardContent>
              </Card>
            )}
          </div>
        )

      default:
        return null
    }
  }

  return (
    <div className="min-h-screen bg-background flex">
      {/* Sidebar Navigation */}
      <EvaluationNavigation 
        activeSection={activeSection}
        onSectionChange={setActiveSection}
        hasAnalysisResults={companyAnalyses.length > 0}
      />

      {/* Main Content */}
      <div className="flex-1 flex flex-col">
        {/* Header */}
        <header className="border-b bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/60">
          <div className="px-6 py-4">
            <div className="flex items-center justify-between">
              <div>
                <h1 className="text-2xl font-bold">Company Evaluation</h1>
                <p className="text-sm text-muted-foreground">
                  Analyze pharmaceutical companies using advanced metrics
                </p>
              </div>
            </div>
          </div>
        </header>

        {/* Content Area */}
        <main className="flex-1 p-6 overflow-auto">
          <div className="max-w-6xl mx-auto">
            {renderSection()}
          </div>
        </main>
      </div>
    </div>
  )
}
