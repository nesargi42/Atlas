'use client'

import { useMemo } from 'react'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { 
  ResponsiveContainer, 
  ScatterChart, 
  Scatter, 
  XAxis, 
  YAxis, 
  CartesianGrid, 
  Tooltip, 
  Cell,
  ReferenceLine,
  ReferenceArea
} from 'recharts'
import { CompanyAnalysis, RankingResult } from '@/lib/types'
import { formatCurrency, formatNumber } from '@/lib/utils'

interface BubbleChartProps {
  results: RankingResult[]
  analyses: CompanyAnalysis[]
  config: {
    sizeMetric: 'rdExpense' | 'projects' | 'marketCap'
    showLabels: boolean
    colorScheme: 'default' | 'focus' | 'phase'
  }
}

interface ChartDataPoint {
  x: number
  y: number
  size: number
  company: string
  ticker: string
  explanation: string
  color: string
}

export function BubbleChart({ results, analyses, config }: BubbleChartProps) {
  const chartData = useMemo(() => {
    return results.map((result, index) => {
      const analysis = analyses.find(a => a.company.id === result.companyId)
      
      // Calculate bubble size based on config
      let size = 100 // Default size
      if (analysis && analysis.financial) {
        switch (config.sizeMetric) {
          case 'rdExpense':
            size = Math.max(50, Math.min(200, (analysis.financial.rd_expense || 0) / 1e9 * 100))
            break
          case 'projects':
            size = Math.max(50, Math.min(200, analysis.clinicalTrials.length * 20))
            break
          case 'marketCap':
            size = Math.max(50, Math.min(200, (analysis.financial.market_cap || 0) / 1e12 * 1000))
            break
        }
      }

      // Calculate color based on config
      let color = '#3b82f6' // Default blue
      if (analysis && config.colorScheme !== 'default') {
        if (config.colorScheme === 'focus') {
          // Color by focus area fit
          const fit = analysis.focusAreaFit
          if (fit > 0.8) color = '#10b981' // Green for high fit
          else if (fit > 0.5) color = '#f59e0b' // Yellow for medium fit
          else color = '#ef4444' // Red for low fit
        } else if (config.colorScheme === 'phase') {
          // Color by trial phase mix
          const avgPhase = analysis.clinicalTrials.reduce((sum, trial) => {
            const phaseNum = trial.phase.includes('4') ? 4 : 
                           trial.phase.includes('3') ? 3 : 
                           trial.phase.includes('2') ? 2 : 
                           trial.phase.includes('1') ? 1 : 0
            return sum + phaseNum
          }, 0) / Math.max(analysis.clinicalTrials.length, 1)
          
          if (avgPhase > 3) color = '#10b981' // Green for late phase
          else if (avgPhase > 2) color = '#f59e0b' // Yellow for mid phase
          else color = '#ef4444' // Red for early phase
        }
      }

      return {
        x: result.x_maturity,
        y: result.y_differentiation,
        size,
        company: result.companyName,
        ticker: analysis?.company.ticker || '',
        explanation: result.explanation,
        color
      }
    })
  }, [results, analyses, config])

  const CustomTooltip = ({ active, payload }: any) => {
    if (active && payload && payload.length) {
      const data = payload[0].payload as ChartDataPoint
      return (
        <div className="bg-popover border border-border rounded-lg p-3 shadow-lg">
          <div className="font-semibold mb-2">{data.company}</div>
          {data.ticker && <div className="text-sm text-muted-foreground mb-1">{data.ticker}</div>}
          <div className="text-sm mb-1">
            <span className="font-medium">Maturity:</span> {(data.x * 100).toFixed(1)}%
          </div>
          <div className="text-sm mb-1">
            <span className="font-medium">Differentiation:</span> {(data.y * 100).toFixed(1)}%
          </div>
          <div className="text-sm mb-1">
            <span className="font-medium">Size Metric:</span> {config.sizeMetric}
          </div>
          <div className="text-xs text-muted-foreground mt-2 max-w-xs">
            {data.explanation}
          </div>
        </div>
      )
    }
    return null
  }

  const CustomCell = ({ cx, cy, payload }: any) => {
    const data = payload as ChartDataPoint
    return (
      <Cell
        key={`cell-${data.company}`}
        fill={data.color}
        opacity={0.7}
        stroke={data.color}
        strokeWidth={2}
      />
    )
  }

  return (
    <Card>
      <CardHeader>
        <CardTitle>Company Ranking: Tech Differentiation vs Maturity</CardTitle>
      </CardHeader>
      <CardContent>
        <div className="h-96 w-full">
          <ResponsiveContainer width="100%" height="100%">
            <ScatterChart
              margin={{ top: 20, right: 20, bottom: 20, left: 20 }}
            >
              <CartesianGrid strokeDasharray="3 3" opacity={0.3} />
              
              <XAxis
                type="number"
                dataKey="x"
                name="Maturity"
                domain={[0, 1]}
                tickFormatter={(value) => `${(value * 100).toFixed(0)}%`}
                label={{ value: 'Maturity (X)', position: 'bottom', offset: 0 }}
              />
              
              <YAxis
                type="number"
                dataKey="y"
                name="Tech Differentiation"
                domain={[0, 1]}
                tickFormatter={(value) => `${(value * 100).toFixed(0)}%`}
                label={{ value: 'Tech Differentiation (Y)', angle: -90, position: 'left' }}
              />
              
              <Tooltip content={<CustomTooltip />} />
              
              {/* Reference lines for quadrants */}
              <ReferenceLine x={0.5} stroke="#e5e7eb" strokeDasharray="3 3" />
              <ReferenceLine y={0.5} stroke="#e5e7eb" strokeDasharray="3 3" />
              
              {/* Quadrant labels */}
              <text x="25%" y="25%" textAnchor="middle" className="text-xs text-muted-foreground">
                Early Stage
              </text>
              <text x="75%" y="25%" textAnchor="middle" className="text-xs text-muted-foreground">
                Mature
              </text>
              <text x="25%" y="75%" textAnchor="middle" className="text-xs text-muted-foreground">
                Emerging
              </text>
              <text x="75%" y="75%" textAnchor="middle" className="text-xs text-muted-foreground">
                Leader
              </text>
              
              <Scatter
                data={chartData}
                shape="circle"
                dataKey="size"
                fill="#8884d8"
              >
                {chartData.map((entry, index) => (
                  <CustomCell key={`cell-${index}`} payload={entry} />
                ))}
              </Scatter>
            </ScatterChart>
          </ResponsiveContainer>
        </div>
        
        {/* Legend */}
        <div className="mt-6 flex flex-wrap gap-4 justify-center">
          <div className="flex items-center gap-2">
            <div className="w-4 h-4 bg-primary rounded-full"></div>
            <span className="text-sm text-muted-foreground">Company</span>
          </div>
          
          {config.colorScheme === 'focus' && (
            <>
              <div className="flex items-center gap-2">
                <div className="w-4 h-4 bg-green-500 rounded-full"></div>
                <span className="text-sm text-muted-foreground">High Focus Fit</span>
              </div>
              <div className="flex items-center gap-2">
                <div className="w-4 h-4 bg-yellow-500 rounded-full"></div>
                <span className="text-sm text-muted-foreground">Medium Focus Fit</span>
              </div>
              <div className="flex items-center gap-2">
                <div className="w-4 h-4 bg-red-500 rounded-full"></div>
                <span className="text-sm text-muted-foreground">Low Focus Fit</span>
              </div>
            </>
          )}
          
          {config.colorScheme === 'phase' && (
            <>
              <div className="flex items-center gap-2">
                <div className="w-4 h-4 bg-green-500 rounded-full"></div>
                <span className="text-sm text-muted-foreground">Late Phase Trials</span>
              </div>
              <div className="flex items-center gap-2">
                <div className="w-4 h-4 bg-yellow-500 rounded-full"></div>
                <span className="text-sm text-muted-foreground">Mid Phase Trials</span>
              </div>
              <div className="flex items-center gap-2">
                <div className="w-4 h-4 bg-red-500 rounded-full"></div>
                <span className="text-sm text-muted-foreground">Early Phase Trials</span>
              </div>
            </>
          )}
          
          <div className="flex items-center gap-2">
            <span className="text-sm text-muted-foreground">
              Bubble size: {config.sizeMetric === 'rdExpense' ? 'R&D Expense' : 
                           config.sizeMetric === 'projects' ? 'Number of Projects' : 'Market Cap'}
            </span>
          </div>
        </div>
      </CardContent>
    </Card>
  )
}

