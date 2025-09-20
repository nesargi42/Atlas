'use client'

import { useMemo } from 'react'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { CompanyAnalysis } from '@/lib/types'

interface MaturityDifferentiationChartProps {
  analyses: CompanyAnalysis[]
}

interface ChartDataPoint {
  x: number // Maturity Score
  y: number // Differentiation Score
  size: number
  company: string
  ticker: string
  explanation: string
  color: string
}

export function MaturityDifferentiationChart({ analyses }: MaturityDifferentiationChartProps) {
  const chartData = useMemo(() => {
    return analyses.map((analysis) => {
      // Use individual scores calculated during analysis
      const maturityScore = analysis.maturityScore || 0
      const differentiationScore = analysis.differentiationScore || 0
      
      // Calculate bubble size based on market cap
      const size = Math.max(50, Math.min(200, (analysis.financial?.market_cap || 0) / 1e12 * 1000))
      
      // Calculate color based on analysis score
      const analysisScore = (analysis as any).analysisScore || 0
      let color = '#3b82f6' // Default blue
      if (analysisScore > 80) color = '#10b981' // Green for high scores
      else if (analysisScore > 60) color = '#f59e0b' // Yellow for medium scores
      else if (analysisScore > 40) color = '#ef4444' // Red for low scores
      
      return {
        x: maturityScore,
        y: differentiationScore,
        size,
        company: analysis.company.name,
        ticker: analysis.company.ticker,
        explanation: generateExplanation(analysis, maturityScore, differentiationScore),
        color
      }
    })
  }, [analyses])

  return (
    <Card>
      <CardHeader>
        <CardTitle>Maturity vs Differentiation Analysis</CardTitle>
        <CardDescription>
          Companies positioned by maturity (X-axis) and differentiation (Y-axis) scores
        </CardDescription>
      </CardHeader>
      <CardContent>
        <div className="h-96 w-full">
          <div className="relative h-full w-full border rounded-lg bg-gray-50">
            {/* Y-axis label */}
            <div className="absolute left-2 top-1/2 transform -rotate-90 text-sm font-medium text-gray-600">
              Differentiation Score
            </div>
            
            {/* X-axis label */}
            <div className="absolute bottom-2 left-1/2 transform -translate-x-1/2 text-sm font-medium text-gray-600">
              Maturity Score
            </div>
            
            {/* Grid lines */}
            <div className="absolute inset-0">
              {/* Vertical grid lines */}
              {[0, 0.25, 0.5, 0.75, 1].map((x) => (
                <div
                  key={`v-${x}`}
                  className="absolute top-0 bottom-0 w-px bg-gray-200"
                  style={{ left: `${x * 100}%` }}
                />
              ))}
              
              {/* Horizontal grid lines */}
              {[0, 0.25, 0.5, 0.75, 1].map((y) => (
                <div
                  key={`h-${y}`}
                  className="absolute left-0 right-0 h-px bg-gray-200"
                  style={{ top: `${y * 100}%` }}
                />
              ))}
            </div>
            
            {/* Data points */}
            {chartData.map((point, index) => (
              <div
                key={index}
                className="absolute group cursor-pointer"
                style={{
                  left: `${point.x * 100}%`,
                  top: `${(1 - point.y) * 100}%`, // Invert Y for proper positioning
                }}
              >
                {/* Bubble */}
                <div
                  className="rounded-full border-2 border-white shadow-lg transition-all duration-200 hover:scale-110 flex items-center justify-center absolute transform -translate-x-1/2 -translate-y-1/2"
                  style={{
                    width: `${point.size}px`,
                    height: `${point.size}px`,
                    backgroundColor: point.color,
                  }}
                >
                  {/* Company ticker on bubble */}
                  <div className="text-white text-xs font-semibold text-center px-1">
                    {point.ticker}
                  </div>
                </div>
                
                {/* Company name label positioned to avoid overlap */}
                <div 
                  className="absolute transform -translate-x-1/2 text-xs font-medium text-gray-700 bg-white/90 px-2 py-1 rounded shadow-sm whitespace-nowrap"
                  style={{
                    top: `${point.size / 2 + 10}px`,
                    left: '50%',
                    zIndex: 10
                  }}
                >
                  {point.company}
                </div>
                
                {/* Tooltip */}
                <div className="absolute bottom-full left-1/2 transform -translate-x-1/2 mb-2 opacity-0 group-hover:opacity-100 transition-opacity duration-200 pointer-events-none z-20">
                  <div className="bg-gray-900 text-white text-xs rounded-lg px-3 py-2 whitespace-nowrap">
                    <div className="font-semibold">{point.company}</div>
                    <div className="text-gray-300">Maturity: {(point.x * 100).toFixed(1)}%</div>
                    <div className="text-gray-300">Differentiation: {(point.y * 100).toFixed(1)}%</div>
                  </div>
                </div>
              </div>
            ))}
            
            {/* Axis labels */}
            <div className="absolute top-2 right-2 text-xs text-gray-500">
              High Differentiation
            </div>
            <div className="absolute bottom-2 right-2 text-xs text-gray-500">
              High Maturity
            </div>
          </div>
        </div>
        
        {/* Legend */}
        <div className="mt-4 flex flex-wrap gap-4 text-sm">
          <div className="flex items-center gap-2">
            <div className="w-3 h-3 rounded-full bg-green-500"></div>
            <span>High Performance (80%+)</span>
          </div>
          <div className="flex items-center gap-2">
            <div className="w-3 h-3 rounded-full bg-yellow-500"></div>
            <span>Medium Performance (60-80%)</span>
          </div>
          <div className="flex items-center gap-2">
            <div className="w-3 h-3 rounded-full bg-red-500"></div>
            <span>Low Performance (40-60%)</span>
          </div>
          <div className="flex items-center gap-2">
            <div className="w-3 h-3 rounded-full bg-blue-500"></div>
            <span>Very Low Performance (&lt;40%)</span>
          </div>
        </div>
      </CardContent>
    </Card>
  )
}


// Generate explanation for the positioning
function generateExplanation(analysis: CompanyAnalysis, maturity: number, differentiation: number): string {
  const company = analysis.company.name
  const financial = analysis.financial
  
  let maturityDesc = ''
  if (maturity > 0.8) maturityDesc = 'highly mature'
  else if (maturity > 0.6) maturityDesc = 'moderately mature'
  else if (maturity > 0.4) maturityDesc = 'developing'
  else maturityDesc = 'early-stage'

  let diffDesc = ''
  if (differentiation > 0.8) diffDesc = 'highly differentiated'
  else if (differentiation > 0.6) diffDesc = 'moderately differentiated'
  else if (differentiation > 0.4) diffDesc = 'somewhat differentiated'
  else diffDesc = 'commoditized'

  return `${company} is ${maturityDesc} and ${diffDesc}, with $${(financial?.market_cap || 0).toLocaleString()} market cap and ${analysis.clinicalTrials.length} active trials.`
}
