'use client'

import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { CompanyAnalysis } from '@/lib/types'
import { MetricWithPopup } from '@/components/DetailPopup'

interface ComparisonMatrixProps {
  analyses: CompanyAnalysis[]
}

export function ComparisonMatrix({ analyses }: ComparisonMatrixProps) {
  if (!analyses || analyses.length === 0) return null

  // Helper function to get the correct company name
  const getCompanyName = (analysis: CompanyAnalysis) => {
    return analysis.financial?.company_name || analysis.company.name
  }

  const metrics: Array<{ key: string; label: string; formatter?: (v: unknown) => string }> = [
    { key: 'price', label: 'Price', formatter: formatCurrency },
    { key: 'market_cap', label: 'Market Cap', formatter: formatCurrency },
    { key: 'pe_ratio', label: 'P/E', formatter: formatMaybeNumber },
    { key: 'eps', label: 'EPS', formatter: formatMaybeCurrency },
    { key: 'revenue', label: 'Revenue', formatter: formatCurrency },
    { key: 'net_income', label: 'Net Income', formatter: formatCurrency },
    { key: 'ebitda', label: 'EBITDA', formatter: formatCurrency },
    { key: 'employees', label: 'Employees', formatter: formatNumber },
    { key: 'cagr', label: 'CAGR', formatter: formatPercentage },
    { key: 'rd_expense', label: 'R&D Expense', formatter: formatCurrency },
    { key: 'enterprise_value', label: 'Enterprise Value', formatter: formatCurrency },
  ]

  const analysisMetrics: Array<{ key: string; label: string; formatter?: (v: unknown) => string }> = [
    { key: 'partnerships', label: 'Partnerships', formatter: formatNumber },
    { key: 'focusAreaFit', label: 'Focus Area Fit', formatter: formatPercentage },
    { key: 'trialPhaseMix', label: 'Trial Phase Mix', formatter: formatPercentage },
    { key: 'maturityScore', label: 'Maturity Score', formatter: formatPercentage },
    { key: 'differentiationScore', label: 'Differentiation Score', formatter: formatPercentage },
    { key: 'analysisScore', label: 'Analysis Score', formatter: formatPercentage },
  ]

  return (
    <Card>
      <CardHeader>
        <CardTitle>Comparison Matrix</CardTitle>
        <CardDescription>Quick comparison of key financial metrics</CardDescription>
      </CardHeader>
      <CardContent>
        <div className="overflow-x-auto">
          <table className="w-full text-sm">
            <thead>
              <tr className="border-b">
                <th className="text-left py-3 px-4 font-semibold">Metric</th>
                {analyses.map(a => (
                  <th key={a.company.id} className="text-left py-3 px-4 font-semibold">
                    {getCompanyName(a)}
                    <div className="text-xs text-muted-foreground">{a.company.ticker}</div>
                  </th>
                ))}
              </tr>
            </thead>
            <tbody>
              {/* Financial Metrics Section */}
              <tr className="bg-muted/50">
                <td colSpan={analyses.length + 1} className="py-2 px-4 font-semibold text-center">
                  Financial Metrics
                </td>
              </tr>
              {metrics.map((m, idx) => (
                <tr key={m.key} className={idx % 2 === 0 ? 'bg-muted/30' : ''}>
                  <td className="py-2 px-4 text-muted-foreground">{m.label}</td>
                  {analyses.map(a => {
                    const val = (a.financial as any)?.[m.key]
                    const display = m.formatter ? m.formatter(val) : (val ?? '-')
                    return (
                      <td key={a.company.id + m.key} className="py-2 px-4 font-medium">{display}</td>
                    )
                  })}
                </tr>
              ))}
              
              {/* R&D Ratio Row with Popup */}
              <tr className="bg-muted/30">
                <td className="py-2 px-4 text-muted-foreground">
                  <MetricWithPopup
                    label="R&D Ratio"
                    value={formatPercentage(getRdRatio(analyses[0]))}
                    popupTitle="R&D Ratio Calculation"
                    popupDescription="R&D Ratio measures the percentage of revenue spent on research and development activities."
          popupDetails={analyses.map(a => ({
            label: getCompanyName(a),
                      value: `${formatCurrency(a.financial?.rd_expense || 0)} / ${formatCurrency(a.financial?.revenue || 0)}`,
                      description: `R&D Expense: ${formatCurrency(a.financial?.rd_expense || 0)}, Revenue: ${formatCurrency(a.financial?.revenue || 0)}`
                    }))}
                    popupCalculation="R&D Ratio = (R&D Expense / Revenue) × 100\n\nThis metric indicates how much of the company's revenue is invested in research and development, which is crucial for innovation and future growth in pharmaceutical and biotech companies."
                  />
                </td>
                {analyses.map(a => {
                  const rdRatio = getRdRatio(a)
                  return (
                    <td key={a.company.id + 'rd_ratio'} className="py-2 px-4 font-medium">
                      {formatPercentage(rdRatio)}
                    </td>
                  )
                })}
              </tr>
              
              {/* Analysis Metrics Section */}
              <tr className="bg-muted/50">
                <td colSpan={analyses.length + 1} className="py-2 px-4 font-semibold text-center">
                  Analysis Metrics
                </td>
              </tr>
              {analysisMetrics.map((m, idx) => {
                // Special handling for Trial Phase Mix with popup
                if (m.key === 'trialPhaseMix') {
                  return (
                    <tr key={m.key} className={idx % 2 === 0 ? 'bg-muted/30' : ''}>
                      <td className="py-2 px-4 text-muted-foreground">
                        <MetricWithPopup
                          label="Trial Phase Mix"
                          value={formatPercentage(analyses[0]?.trialPhaseMix || 0)}
                          popupTitle="Clinical Trials Phase Mix Calculation"
                          popupDescription="Trial Phase Mix measures the weighted average of clinical trial phases, indicating the maturity of the company's pipeline."
                          popupDetails={analyses.map(a => {
                            const trials = a.clinicalTrials || []
                            const phaseCounts = trials.reduce((acc, trial) => {
                              const phase = trial.phase?.match(/Phase \d+|PHASE\d+/)?.[0] || 'Phase 1'
                              acc[phase] = (acc[phase] || 0) + 1
                              return acc
                            }, {} as Record<string, number>)
                            
                            return {
                              label: getCompanyName(a),
                              value: `${trials.length} trials`,
                              description: `Phase breakdown: ${Object.entries(phaseCounts).map(([phase, count]) => `${phase}: ${count}`).join(', ')}`
                            }
                          })}
                          popupCalculation="Trial Phase Mix = (Σ(Phase Weight × Count)) / Total Trials / 4\n\nPhase Weights:\n- Phase 1: 1\n- Phase 2: 2\n- Phase 3: 3\n- Phase 4: 4\n\nThis metric indicates the maturity of the company's clinical pipeline, with higher values suggesting more advanced trials."
                        />
                      </td>
                      {analyses.map(a => {
                        const val = (a as any)[m.key]
                        const display = m.formatter ? m.formatter(val) : (val ?? '-')
                        return (
                          <td key={a.company.id + m.key} className="py-2 px-4 font-medium">{display}</td>
                        )
                      })}
                    </tr>
                  )
                }
                
                // Regular metrics
                return (
                  <tr key={m.key} className={idx % 2 === 0 ? 'bg-muted/30' : ''}>
                    <td className="py-2 px-4 text-muted-foreground">{m.label}</td>
                    {analyses.map(a => {
                      const val = (a as any)[m.key]
                      const display = m.formatter ? m.formatter(val) : (val ?? '-')
                      return (
                        <td key={a.company.id + m.key} className="py-2 px-4 font-medium">{display}</td>
                      )
                    })}
                  </tr>
                )
              })}
            </tbody>
          </table>
        </div>
      </CardContent>
    </Card>
  )
}

// Formatting helpers
const formatCurrency = (raw: unknown) => {
  const value = typeof raw === 'number' && !isNaN(raw) ? raw : 0
  const absValue = Math.abs(value)
  const sign = value < 0 ? '-' : ''
  
  if (absValue >= 1e12) return `${sign}$${(absValue / 1e12).toFixed(2)}T`
  if (absValue >= 1e9) return `${sign}$${(absValue / 1e9).toFixed(2)}B`
  if (absValue >= 1e6) return `${sign}$${(absValue / 1e6).toFixed(2)}M`
  if (absValue >= 1e3) return `${sign}$${(absValue / 1e3).toFixed(2)}K`
  return `${sign}$${absValue.toFixed(2)}`
}

const formatNumber = (raw: unknown) => {
  const value = typeof raw === 'number' && !isNaN(raw) ? raw : 0
  return value.toLocaleString()
}

const formatMaybeNumber = (raw: unknown) => {
  return typeof raw === 'number' && !isNaN(raw) ? raw.toFixed(2) : '-'
}

const formatMaybeCurrency = (raw: unknown) => {
  if (typeof raw === 'number' && !isNaN(raw)) {
    const absValue = Math.abs(raw)
    const sign = raw < 0 ? '-' : ''
    
    if (absValue >= 1e12) return `${sign}$${(absValue / 1e12).toFixed(2)}T`
    if (absValue >= 1e9) return `${sign}$${(absValue / 1e9).toFixed(2)}B`
    if (absValue >= 1e6) return `${sign}$${(absValue / 1e6).toFixed(2)}M`
    if (absValue >= 1e3) return `${sign}$${(absValue / 1e3).toFixed(2)}K`
    return `${sign}$${absValue.toFixed(2)}`
  }
  return '-'
}

const formatPercentage = (raw: unknown) => {
  const value = typeof raw === 'number' && !isNaN(raw) ? raw : 0
  return `${value.toFixed(1)}%`
}

// Calculate R&D ratio for each analysis
const getRdRatio = (analysis: CompanyAnalysis) => {
  if (!analysis.financial?.revenue || analysis.financial.revenue === 0) return 0
  return analysis.financial.rd_expense / analysis.financial.revenue
}

