'use client'

import { useState, useCallback } from 'react'
import { useRouter } from 'next/navigation'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { TrendingUp, Building2, Target, ArrowRight } from 'lucide-react'
import { Company, CompanyAnalysis, EvaluationCriteria } from '@/lib/types'
import { CompanyList } from '@/components/CompanyList'
import { FinancialMetrics } from '@/components/FinancialMetrics'
import { ComparisonMatrix } from '@/components/ComparisonMatrix'
import { CriteriaForm } from '@/components/CriteriaForm'
import { backendService } from '@/lib/backend-service'
import { calculateFocusAreaFit } from '@/lib/utils'

export default function FinancialMetricsPage() {
  const router = useRouter()
  const [selectedCompanies, setSelectedCompanies] = useState<Company[]>([])
  const [companyAnalyses, setCompanyAnalyses] = useState<CompanyAnalysis[]>([])
  const [isAnalyzing, setIsAnalyzing] = useState(false)
  const [showCriteria, setShowCriteria] = useState(false)

  const handleCompanyListChange = useCallback((companies: Company[]) => {
    console.log('📈 Companies changed:', companies)
    setSelectedCompanies(companies)
    // Save to localStorage for use in Evaluation page
    localStorage.setItem('selectedCompanies', JSON.stringify(companies))
  }, [])

  const analyzeCompanies = async () => {
    if (selectedCompanies.length === 0) return

    setIsAnalyzing(true)
    try {
      const analyses: CompanyAnalysis[] = []

      for (const company of selectedCompanies) {
        // Fetch financial data for analysis
        const financial = await backendService.getCompanyProfile(company.ticker || '')
        
        if (!financial) continue

        // For now, we'll use mock data for clinical trials and molecules
        const clinicalTrials: any[] = []
        const molecules: any = null
        
        // Calculate partnerships (simplified)
        const partnerships = Math.floor(Math.random() * 10) + 1
        
        // Calculate focus area fit
        const focusAreaFit = calculateFocusAreaFit(company.domainTags || [], ['oncology', 'vaccines'])

        analyses.push({
          company,
          financial,
          clinicalTrials,
          molecules,
          partnerships,
          focusAreaFit
        })
      }

      setCompanyAnalyses(analyses)
      setShowCriteria(true)
    } catch (error) {
      console.error('Error analyzing companies:', error)
    } finally {
      setIsAnalyzing(false)
    }
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
            <div className="flex gap-2">
              <Button variant="outline" onClick={() => router.push('/')}>Home</Button>
              <Button variant="outline" onClick={() => router.push('/evaluate')}>Evaluation</Button>
            </div>
          </div>
        </div>
      </header>

      <main className="container mx-auto px-4 py-8">
        <div className="max-w-6xl mx-auto space-y-8">
          <div className="text-center">
            <h1 className="text-3xl font-bold mb-2">Financial Metrics</h1>
            <p className="text-muted-foreground">Add companies and view their key financial data</p>
          </div>

          {/* Company management */}
          <CompanyList onCompaniesChange={handleCompanyListChange} />

          {/* Metrics table */}
          {selectedCompanies.length === 0 ? (
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <TrendingUp className="h-5 w-5" />
                  Financial Metrics Table
                </CardTitle>
                <CardDescription>Financial performance data for added companies</CardDescription>
              </CardHeader>
              <CardContent>
                <div className="text-center py-8 text-muted-foreground">
                  <p>Add companies above to view metrics.</p>
                </div>
              </CardContent>
            </Card>
          ) : (
            <FinancialMetrics companies={selectedCompanies} />
          )}

          {/* Analysis Section */}
          {selectedCompanies.length > 0 && (
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Target className="h-5 w-5" />
                  Company Analysis
                </CardTitle>
                <CardDescription>
                  Analyze companies for investment evaluation
                </CardDescription>
              </CardHeader>
              <CardContent>
                <div className="flex justify-center">
                  <Button
                    onClick={analyzeCompanies}
                    disabled={isAnalyzing}
                    size="lg"
                    className="flex items-center gap-2"
                  >
                    {isAnalyzing ? (
                      <>
                        <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white"></div>
                        Analyzing Companies...
                      </>
                    ) : (
                      <>
                        Analyze Companies
                        <ArrowRight className="h-4 w-4" />
                      </>
                    )}
                  </Button>
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
