'use client'

import { useState, useEffect } from 'react'
import { useRouter } from 'next/navigation'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Building2, Download, ArrowLeft, BarChart3, Table as TableIcon } from 'lucide-react'
import { BubbleChart } from '@/components/BubbleChart'
import { ResultsTable } from '@/components/ResultsTable'
import { CompanyAnalysis, EvaluationCriteria, RankingResult } from '@/lib/types'
import { useMutation } from '@tanstack/react-query'

export default function ResultsPage() {
  const router = useRouter()
  const [analyses, setAnalyses] = useState<CompanyAnalysis[]>([])
  const [criteria, setCriteria] = useState<EvaluationCriteria>({
    cagr: 0.15,
    marketCap: 0.10,
    enterpriseValue: 0.10,
    rdExpense: 0.20,
    partnerships: 0.15,
    focusAreaFit: 0.20,
    trialPhaseMix: 0.10
  })
  const [results, setResults] = useState<RankingResult[]>([])
  const [isLoading, setIsLoading] = useState(false)
  const [viewMode, setViewMode] = useState<'chart' | 'table'>('chart')
  const [chartConfig, setChartConfig] = useState({
    sizeMetric: 'rdExpense' as 'rdExpense' | 'projects' | 'marketCap',
    showLabels: true,
    colorScheme: 'default' as 'default' | 'focus' | 'phase'
  })

  // Get data from localStorage
  useEffect(() => {
    const savedAnalyses = localStorage.getItem('companyAnalyses')
    const savedCriteria = localStorage.getItem('evaluationCriteria')
    
    if (savedAnalyses && savedCriteria) {
      const parsedAnalyses = JSON.parse(savedAnalyses)
      const parsedCriteria = JSON.parse(savedCriteria)
      setAnalyses(parsedAnalyses)
      setCriteria(parsedCriteria)
      // Start ranking automatically
      startRanking(parsedAnalyses, parsedCriteria)
    } else {
      // Redirect back to evaluate page if no data
      router.push('/evaluate')
    }
  }, [router])

  // Ranking mutation - now processes companies one by one
  const rankingMutation = useMutation({
    mutationFn: async ({ analyses, criteria }: { analyses: CompanyAnalysis[], criteria: EvaluationCriteria }) => {
      const results = []
      
      for (const analysis of analyses) {
        const response = await fetch('/api/rank', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            companyName: analysis.company.name,
            ticker: analysis.company.ticker,
            userCriteria: {
              partnerships: criteria.partnerships || 0,
              focusFitScore: criteria.focusAreaFit || 0
            },
            userWeights: {
              maturity: criteria.trialPhaseMix || 1,
              differentiation: criteria.rdExpense || 1
            }
          })
        })
        
        if (!response.ok) {
          throw new Error(`Ranking failed for ${analysis.company.name}`)
        }
        
        const result = await response.json()
        results.push({
          companyId: analysis.company.id,
          companyName: analysis.company.name,
          x_maturity: result.data.x,
          y_differentiation: result.data.y,
          explanation: result.data.rationale,
          rawScores: {
            maturity: result.data.x,
            differentiation: result.data.y
          }
        })
      }
      
      return { data: { results } }
    },
    onSuccess: (data) => {
      setResults(data.data.results)
      // Save to localStorage
      localStorage.setItem('atlas_results', JSON.stringify(data.data.results))
    },
    onError: (error) => {
      console.error('Ranking error:', error)
      alert('Failed to rank companies. Please try again.')
    }
  })

  const startRanking = async (analyses: CompanyAnalysis[], criteria: EvaluationCriteria) => {
    setIsLoading(true)
    try {
      await rankingMutation.mutateAsync({ analyses, criteria })
    } finally {
      setIsLoading(false)
    }
  }

  const exportToCSV = () => {
    if (results.length === 0) return

    const headers = ['Company', 'Maturity (X)', 'Tech Differentiation (Y)', 'Explanation', 'Raw Maturity', 'Raw Differentiation']
    const csvContent = [
      headers.join(','),
      ...results.map(r => [
        r.companyName,
        r.x_maturity.toFixed(3),
        r.y_differentiation.toFixed(3),
        `"${r.explanation}"`,
        r.rawScores.maturity.toFixed(3),
        r.rawScores.differentiation.toFixed(3)
      ].join(','))
    ].join('\n')

    const blob = new Blob([csvContent], { type: 'text/csv' })
    const url = window.URL.createObjectURL(blob)
    const a = document.createElement('a')
    a.href = url
    a.download = 'company-ranking-results.csv'
    a.click()
    window.URL.revokeObjectURL(url)
  }

  if (isLoading) {
    return (
      <div className="min-h-screen bg-background flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-16 w-16 border-b-2 border-primary mx-auto mb-4"></div>
          <h2 className="text-2xl font-semibold mb-2">Analyzing Companies</h2>
          <p className="text-muted-foreground">Running AI-powered ranking analysis...</p>
        </div>
      </div>
    )
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
            <div className="flex items-center space-x-4">
              <Button variant="outline" onClick={() => router.push('/evaluate')}>
                <ArrowLeft className="h-4 w-4 mr-2" />
                Back to Evaluation
              </Button>
            </div>
          </div>
        </div>
      </header>

      <main className="container mx-auto px-4 py-8">
        <div className="max-w-7xl mx-auto">
          {/* Page Title */}
          <div className="text-center mb-8">
            <h1 className="text-4xl font-bold mb-4">Ranking Results</h1>
            <p className="text-lg text-muted-foreground">
              {results.length > 0 
                ? `${results.length} companies ranked by Tech Differentiation vs Maturity`
                : 'Analyzing companies...'
              }
            </p>
          </div>

          {/* Results Summary */}
          {results.length > 0 && (
            <Card className="mb-8">
              <CardHeader>
                <CardTitle>Analysis Summary</CardTitle>
                <CardDescription>
                  Overview of the ranking results and key insights
                </CardDescription>
              </CardHeader>
              <CardContent>
                <div className="grid md:grid-cols-4 gap-6">
                  <div className="text-center">
                    <div className="text-2xl font-bold text-primary">{results.length}</div>
                    <div className="text-sm text-muted-foreground">Companies Analyzed</div>
                  </div>
                  <div className="text-center">
                    <div className="text-2xl font-bold text-green-600">
                      {results[0]?.companyName}
                    </div>
                    <div className="text-sm text-muted-foreground">Top Performer</div>
                  </div>
                  <div className="text-center">
                    <div className="text-2xl font-bold text-blue-600">
                      {(results.reduce((sum, r) => sum + r.x_maturity, 0) / results.length * 100).toFixed(1)}%
                    </div>
                    <div className="text-sm text-muted-foreground">Avg Maturity</div>
                  </div>
                  <div className="text-center">
                    <div className="text-2xl font-bold text-purple-600">
                      {(results.reduce((sum, r) => sum + r.y_differentiation, 0) / results.length * 100).toFixed(1)}%
                    </div>
                    <div className="text-sm text-muted-foreground">Avg Differentiation</div>
                  </div>
                </div>
              </CardContent>
            </Card>
          )}

          {/* View Mode Toggle */}
          {results.length > 0 && (
            <div className="flex justify-center mb-8">
              <div className="flex bg-muted rounded-lg p-1">
                <Button
                  variant={viewMode === 'chart' ? 'default' : 'ghost'}
                  size="sm"
                  onClick={() => setViewMode('chart')}
                  className="flex items-center gap-2"
                >
                  <BarChart3 className="h-4 w-4" />
                  Chart View
                </Button>
                <Button
                  variant={viewMode === 'table' ? 'default' : 'ghost'}
                  size="sm"
                  onClick={() => setViewMode('table')}
                  className="flex items-center gap-2"
                >
                  <TableIcon className="h-4 w-4" />
                  Table View
                </Button>
              </div>
            </div>
          )}

          {/* Chart Configuration */}
          {viewMode === 'chart' && results.length > 0 && (
            <Card className="mb-8">
              <CardHeader>
                <CardTitle>Chart Configuration</CardTitle>
                <CardDescription>
                  Customize the bubble chart display options
                </CardDescription>
              </CardHeader>
              <CardContent>
                <div className="grid md:grid-cols-3 gap-4">
                  <div>
                    <label className="text-sm font-medium mb-2 block">Bubble Size Metric</label>
                    <select
                      value={chartConfig.sizeMetric}
                      onChange={(e) => setChartConfig(prev => ({ ...prev, sizeMetric: e.target.value as any }))}
                      className="input w-full"
                    >
                      <option value="rdExpense">R&D Expense</option>
                      <option value="projects">Number of Projects</option>
                      <option value="marketCap">Market Cap</option>
                    </select>
                  </div>
                  <div>
                    <label className="text-sm font-medium mb-2 block">Color Scheme</label>
                    <select
                      value={chartConfig.colorScheme}
                      onChange={(e) => setChartConfig(prev => ({ ...prev, colorScheme: e.target.value as any }))}
                      className="input w-full"
                    >
                      <option value="default">Default</option>
                      <option value="focus">Focus Areas</option>
                      <option value="phase">Trial Phase</option>
                    </select>
                  </div>
                  <div className="flex items-center space-x-2">
                    <input
                      type="checkbox"
                      id="showLabels"
                      checked={chartConfig.showLabels}
                      onChange={(e) => setChartConfig(prev => ({ ...prev, showLabels: e.target.checked }))}
                      className="rounded"
                    />
                    <label htmlFor="showLabels" className="text-sm font-medium">
                      Show Company Labels
                    </label>
                  </div>
                </div>
              </CardContent>
            </Card>
          )}

          {/* Results Display */}
          {results.length > 0 && (
            <div className="mb-8">
              {viewMode === 'chart' ? (
                <BubbleChart
                  results={results}
                  analyses={analyses}
                  config={chartConfig}
                />
              ) : (
                <ResultsTable results={results} />
              )}
            </div>
          )}

          {/* Export Section */}
          {results.length > 0 && (
            <Card>
              <CardHeader>
                <CardTitle>Export Results</CardTitle>
                <CardDescription>
                  Download the ranking results for further analysis
                </CardDescription>
              </CardHeader>
              <CardContent>
                <div className="flex gap-4">
                  <Button onClick={exportToCSV} className="flex items-center gap-2">
                    <Download className="h-4 w-4" />
                    Export to CSV
                  </Button>
                  <Button 
                    variant="outline" 
                    onClick={() => router.push('/evaluate')}
                    className="flex items-center gap-2"
                  >
                    <ArrowLeft className="h-4 w-4" />
                    New Analysis
                  </Button>
                </div>
              </CardContent>
            </Card>
          )}
        </div>
      </main>
    </div>
  )
}
