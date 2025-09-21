'use client'

import { useState, useEffect, useCallback, useMemo } from 'react'
import { useRouter } from 'next/navigation'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import {
  Search,
  TrendingUp,
  Settings,
  FileText,
  BarChart3,
  Grid3X3
} from 'lucide-react'
import { CompanyCard } from '@/components/CompanyCard'
import { ComparisonMatrix } from '@/components/ComparisonMatrix'
import { CriteriaForm } from '@/components/CriteriaForm'
import { CompanyList } from '@/components/CompanyList'
import { FinancialMetrics } from '@/components/FinancialMetrics'
import { InDepthAnalysis } from '@/components/InDepthAnalysis'
import { MaturityDifferentiationChart } from '@/components/MaturityDifferentiationChart'
import EvaluationNavigation, { EvaluationNavigationItem } from '@/components/EvaluationNavigation'
import { Company, CompanyAnalysis, EvaluationCriteria } from '@/lib/types'

type AnalysisStatus = 'idle' | 'running' | 'completed' | 'error'

export default function EvaluatePage() {
  const router = useRouter()
  const [selectedCompanies, setSelectedCompanies] = useState<Company[]>([])
  const [companyAnalyses, setCompanyAnalyses] = useState<CompanyAnalysis[]>([])
  const [analysisStatus, setAnalysisStatus] = useState<AnalysisStatus>('idle')
  const [analysisError, setAnalysisError] = useState<string | null>(null)
  const [showCriteria, setShowCriteria] = useState(false)
  const [activeSection, setActiveSection] = useState('select-company')

  // Load companies that may have been selected earlier
  useEffect(() => {
    const savedCompanies = localStorage.getItem('selectedCompanies')
    if (savedCompanies) {
      try {
        const parsed = JSON.parse(savedCompanies)
        if (Array.isArray(parsed)) {
          setSelectedCompanies(parsed)
        }
      } catch (error) {
        console.error('Error loading saved companies:', error)
      }
    }
  }, [])

  const handleCompanyListChange = useCallback((companies: Company[]) => {
    setSelectedCompanies(companies)
    setCompanyAnalyses([])
    setShowCriteria(false)
    setAnalysisStatus('idle')
    setAnalysisError(null)
    if (companies.length === 0) {
      setActiveSection('select-company')
    }
    localStorage.setItem('selectedCompanies', JSON.stringify(companies))
  }, [])

  const handleAnalysisStart = useCallback(() => {
    setAnalysisStatus('running')
    setAnalysisError(null)
    if (activeSection !== 'analysis-criteria') {
      setActiveSection('analysis-criteria')
    }
  }, [activeSection])

  const handleAnalysisError = useCallback((error: unknown) => {
    const message = error instanceof Error ? error.message : 'Analysis failed. Please try again.'
    setAnalysisError(message)
    setAnalysisStatus('error')
    setActiveSection('analysis-summary')
  }, [])

  const handleInDepthAnalysisComplete = useCallback((analyses: CompanyAnalysis[]) => {
    setCompanyAnalyses(analyses)
    setShowCriteria(true)
    setAnalysisStatus('completed')
    setActiveSection('analysis-summary')
  }, [])

  const handleEvaluationComplete = (criteria: EvaluationCriteria) => {
    localStorage.setItem('companyAnalyses', JSON.stringify(companyAnalyses))
    localStorage.setItem('evaluationCriteria', JSON.stringify(criteria))
    router.push('/results')
  }

  const navigationItems = useMemo<EvaluationNavigationItem[]>(() => {
    const hasCompanies = selectedCompanies.length > 0
    const hasResults = companyAnalyses.length > 0

    return [
      {
        id: 'select-company',
        label: 'Company Selection',
        icon: Search,
        status: hasCompanies ? 'ready' : undefined
      },
      {
        id: 'financial-metrics',
        label: 'Financial Metrics',
        icon: TrendingUp,
        disabled: !hasCompanies,
        status: hasCompanies ? 'ready' : undefined
      },
      {
        id: 'analysis-criteria',
        label: 'Analysis Settings',
        icon: Settings,
        disabled: !hasCompanies,
        status:
          analysisStatus === 'running'
            ? 'in-progress'
            : hasCompanies && analysisStatus === 'completed'
            ? 'ready'
            : undefined
      },
      {
        id: 'analysis-summary',
        label: 'Analysis Summary',
        icon: FileText,
        disabled: !hasResults && analysisStatus !== 'running' && analysisStatus !== 'error',
        status:
          analysisStatus === 'running'
            ? 'in-progress'
            : analysisStatus === 'error'
            ? 'error'
            : hasResults
            ? 'ready'
            : undefined
      },
      {
        id: 'maturity-differentiation',
        label: 'Maturity vs. Differentiation',
        icon: BarChart3,
        disabled: !hasResults,
        status: hasResults ? 'ready' : undefined
      },
      {
        id: 'comparison-matrix',
        label: 'Comparison Matrix',
        icon: Grid3X3,
        disabled: !hasResults,
        status: hasResults ? 'ready' : undefined
      }
    ]
  }, [selectedCompanies.length, companyAnalyses.length, analysisStatus])

  const renderSection = () => {
    switch (activeSection) {
      case 'select-company':
        return (
          <div className="space-y-6">
            <div className="mb-8">
              <h2 className="text-3xl font-bold mb-2">Company Selection</h2>
              <p className="text-lg text-muted-foreground">
                Search and curate the companies you want to evaluate.
              </p>
            </div>
            <CompanyList onCompaniesChange={handleCompanyListChange} />

            {selectedCompanies.length > 0 && (
              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    Selected Companies ({selectedCompanies.length})
                  </CardTitle>
                  <CardDescription>Companies currently queued for analysis</CardDescription>
                </CardHeader>
                <CardContent>
                  <div className="grid gap-4">
                    {selectedCompanies.map((company) => (
                      <CompanyCard
                        key={company.id}
                        company={company}
                        isSelected
                        onSelect={() => {}}
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
            <div className="mb-8">
              <h2 className="text-3xl font-bold mb-2">Financial Metrics</h2>
              <p className="text-lg text-muted-foreground">
                Review performance indicators across revenue, profitability, and growth.
              </p>
            </div>
            {selectedCompanies.length > 0 ? (
              <FinancialMetrics companies={selectedCompanies} />
            ) : (
              <Card>
                <CardContent className="text-center py-12">
                  <p className="text-muted-foreground">
                    Add companies in the selection panel to unlock financial metrics.
                  </p>
                </CardContent>
              </Card>
            )}
          </div>
        )

      case 'analysis-criteria':
        return (
          <div className="space-y-6">
            <div className="mb-8">
              <h2 className="text-3xl font-bold mb-2">Analysis Settings</h2>
              <p className="text-lg text-muted-foreground">
                Fine-tune the weighting for maturity, differentiation, and strategic fit before running the evaluation.
              </p>
            </div>
            {selectedCompanies.length > 0 ? (
              <InDepthAnalysis
                companies={selectedCompanies}
                onAnalysisStart={handleAnalysisStart}
                onAnalysisError={handleAnalysisError}
                onAnalysisComplete={handleInDepthAnalysisComplete}
              />
            ) : (
              <Card>
                <CardContent className="text-center py-12">
                  <p className="text-muted-foreground">
                    Select at least one company to enable analysis settings.
                  </p>
                </CardContent>
              </Card>
            )}
          </div>
        )

      case 'analysis-summary':
        return (
          <div className="space-y-6">
            <div className="mb-8">
              <h2 className="text-3xl font-bold mb-2">Analysis Summary</h2>
              <p className="text-lg text-muted-foreground">
                Track the status of the evaluation and prepare for next steps.
              </p>
            </div>

            {analysisStatus === 'running' && (
              <Card>
                <CardContent className="py-12">
                  <div className="flex flex-col items-center gap-4">
                    <div className="h-10 w-10 rounded-full border-4 border-primary border-t-transparent animate-spin"></div>
                    <div className="text-center">
                      <p className="font-semibold">Running company evaluation</p>
                      <p className="text-sm text-muted-foreground">Hang tight?this can take a few moments.</p>
                    </div>
                  </div>
                </CardContent>
              </Card>
            )}

            {analysisStatus === 'error' && (
              <Card>
                <CardHeader>
                  <CardTitle>Analysis failed</CardTitle>
                  <CardDescription>Something went wrong while generating the insights.</CardDescription>
                </CardHeader>
                <CardContent>
                  <p className="text-sm text-destructive mb-4">{analysisError}</p>
                  <Button onClick={() => setActiveSection('analysis-criteria')} variant="outline">
                    Try again
                  </Button>
                </CardContent>
              </Card>
            )}

            {companyAnalyses.length > 0 && analysisStatus === 'completed' && (
              <div className="space-y-6">
                <Card>
                  <CardHeader>
                    <CardTitle>Evaluation complete</CardTitle>
                    <CardDescription>
                      We generated insights for {companyAnalyses.length} companies. Jump into the visualizations or proceed to scoring.
                    </CardDescription>
                  </CardHeader>
                  <CardContent className="flex flex-wrap gap-3">
                    <Button onClick={() => setActiveSection('maturity-differentiation')}>
                      View maturity vs. differentiation
                    </Button>
                    <Button variant="outline" onClick={() => setActiveSection('comparison-matrix')}>
                      Open comparison matrix
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
            )}

            {analysisStatus === 'idle' && companyAnalyses.length === 0 && (
              <Card>
                <CardContent className="py-12 text-center text-muted-foreground">
                  Run the analysis from the settings panel to generate a summary.
                </CardContent>
              </Card>
            )}
          </div>
        )

      case 'maturity-differentiation':
        return (
          <div className="space-y-6">
            <div className="mb-8">
              <h2 className="text-3xl font-bold mb-2">Maturity vs. Differentiation</h2>
              <p className="text-lg text-muted-foreground">
                Visualize where each company lands on the maturity and differentiation spectrum.
              </p>
            </div>
            {companyAnalyses.length > 0 ? (
              <MaturityDifferentiationChart analyses={companyAnalyses} />
            ) : (
              <Card>
                <CardContent className="py-12 text-center text-muted-foreground">
                  Complete the analysis to display this chart.
                </CardContent>
              </Card>
            )}
          </div>
        )

      case 'comparison-matrix':
        return (
          <div className="space-y-6">
            <div className="mb-8">
              <h2 className="text-3xl font-bold mb-2">Comparison Matrix</h2>
              <p className="text-lg text-muted-foreground">
                Compare companies side-by-side across the dimensions you just evaluated.
              </p>
            </div>
            {companyAnalyses.length > 0 ? (
              <ComparisonMatrix analyses={companyAnalyses} />
            ) : (
              <Card>
                <CardContent className="py-12 text-center text-muted-foreground">
                  Complete the analysis to unlock the comparison matrix.
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
      <EvaluationNavigation
        activeSection={activeSection}
        onSectionChange={setActiveSection}
        items={navigationItems}
      />

      <div className="flex-1 flex flex-col">
        <header className="border-b bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/60">
          <div className="px-8 py-6">
            <div className="flex items-center justify-between">
              <div>
                <h1 className="text-2xl font-bold tracking-tight">Company Evaluation Workspace</h1>
                <p className="text-sm text-muted-foreground">
                  Navigate the full evaluation flow from selection to insight in one unified view.
                </p>
              </div>
            </div>
          </div>
        </header>

        <main className="flex-1 p-8 overflow-auto">
          <div className="max-w-6xl mx-auto space-y-8">
            {renderSection()}
          </div>
        </main>
      </div>
    </div>
  )
}


