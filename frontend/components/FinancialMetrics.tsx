'use client'

import { useState, useEffect } from 'react'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { TrendingUp, DollarSign, Users, FlaskConical, Building2, TrendingDown } from 'lucide-react'
import { Company, FinancialData } from '@/lib/types'
import { backendService } from '@/lib/backend-service'

interface FinancialMetricsProps {
  companies: Company[]
}

interface CompanyFinancialData {
  company: Company
  financial: FinancialData | null
  isLoading: boolean
  error: string | null
}

export function FinancialMetrics({ companies }: FinancialMetricsProps) {
  const [financialData, setFinancialData] = useState<CompanyFinancialData[]>([])
  const [isLoading, setIsLoading] = useState(false)

  useEffect(() => {
    if (companies.length === 0) {
      setFinancialData([])
      return
    }

    const fetchFinancialData = async () => {
      setIsLoading(true)
      const data: CompanyFinancialData[] = []

      for (const company of companies) {
        if (!company.ticker) {
          data.push({
            company,
            financial: null,
            isLoading: false,
            error: 'No ticker available'
          })
          continue
        }

        try {
          const response = await fetch(`/api/finance/${company.ticker}`)
          if (!response.ok) {
            throw new Error(`HTTP ${response.status}: ${response.statusText}`)
          }
          const result = await response.json()
          const financial = result.data || result
          console.log(`Financial data for ${company.ticker}:`, financial)
          data.push({
            company,
            financial,
            isLoading: false,
            error: null
          })
        } catch (error) {
          console.error(`Error fetching financial data for ${company.ticker}:`, error)
          data.push({
            company,
            financial: null,
            isLoading: false,
            error: `Failed to fetch data: ${error instanceof Error ? error.message : 'Unknown error'}`
          })
        }
      }

      setFinancialData(data)
      setIsLoading(false)
    }

    fetchFinancialData()
  }, [companies])

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

  const formatPercentage = (raw: unknown) => {
    const value = typeof raw === 'number' && !isNaN(raw) ? raw : 0
    return `${value.toFixed(2)}%`
  }

  const getMetricIcon = (metric: string) => {
    switch (metric) {
      case 'marketCap':
        return <DollarSign className="h-4 w-4 text-green-500" />
      case 'employees':
        return <Users className="h-4 w-4 text-blue-500" />
      case 'rdExpense':
        return <FlaskConical className="h-4 w-4 text-purple-500" />
      case 'revenue':
        return <TrendingUp className="h-4 w-4 text-green-500" />
      case 'cagr':
        return <TrendingUp className="h-4 w-4 text-blue-500" />
      default:
        return <Building2 className="h-4 w-4 text-gray-500" />
    }
  }

  if (companies.length === 0) {
    return (
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <TrendingUp className="h-5 w-5" />
            Financial Metrics
          </CardTitle>
          <CardDescription>
            Add companies to see their financial metrics
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="text-center py-8 text-muted-foreground">
            <TrendingUp className="h-12 w-12 mx-auto mb-4 opacity-50" />
            <p>No companies selected. Add companies to view financial metrics.</p>
          </div>
        </CardContent>
      </Card>
    )
  }

  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <TrendingUp className="h-5 w-5" />
          Financial Metrics
        </CardTitle>
        <CardDescription>
          Financial performance data for selected companies
        </CardDescription>
      </CardHeader>
      <CardContent>
        {isLoading ? (
          <div className="flex items-center justify-center py-8">
            <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary"></div>
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead>
                <tr className="border-b">
                  <th className="text-left py-3 px-4 font-semibold">Company</th>
                  <th className="text-left py-3 px-4 font-semibold">Price</th>
                  <th className="text-left py-3 px-4 font-semibold">Market Cap</th>
                  <th className="text-left py-3 px-4 font-semibold">P/E Ratio</th>
                  <th className="text-left py-3 px-4 font-semibold">EPS</th>
                  <th className="text-left py-3 px-4 font-semibold">Revenue</th>
                  <th className="text-left py-3 px-4 font-semibold">Net Income</th>
                  <th className="text-left py-3 px-4 font-semibold">EBITDA</th>
                  <th className="text-left py-3 px-4 font-semibold">Beta</th>
                  <th className="text-left py-3 px-4 font-semibold">Employees</th>
                </tr>
              </thead>
              <tbody>
                {financialData.map((item, index) => (
                  <tr key={item.company.id} className={index % 2 === 0 ? 'bg-muted/30' : ''}>
                    <td className="py-3 px-4">
                      <div>
                        <div className="font-medium">{item.financial?.company_name || item.company.name}</div>
                        <div className="text-sm text-muted-foreground">{item.company.ticker}</div>
                        {item.error && (
                          <div className="text-xs text-red-500 mt-1">{item.error}</div>
                        )}
                      </div>
                    </td>
                    <td className="py-3 px-4">
                      {item.financial ? (
                        <span className="font-medium">${(item.financial.price ?? 0).toFixed(2)}</span>
                      ) : (
                        <span className="text-muted-foreground">-</span>
                      )}
                    </td>
                    <td className="py-3 px-4">
                      {item.financial ? (
                        <span className="font-medium">
                          {formatCurrency(item.financial.market_cap)}
                        </span>
                      ) : (
                        <span className="text-muted-foreground">-</span>
                      )}
                    </td>
                    <td className="py-3 px-4">
                      {item.financial && typeof item.financial.pe_ratio === 'number' ? (
                        <span>{item.financial.pe_ratio.toFixed(2)}</span>
                      ) : (
                        <span className="text-muted-foreground">-</span>
                      )}
                    </td>
                    <td className="py-3 px-4">
                      {item.financial && typeof item.financial.eps === 'number' ? (
                        <span>${item.financial.eps.toFixed(2)}</span>
                      ) : (
                        <span className="text-muted-foreground">-</span>
                      )}
                    </td>
                    <td className="py-3 px-4">
                      {item.financial ? (
                        <span className="font-medium">
                          {formatCurrency(item.financial.revenue)}
                        </span>
                      ) : (
                        <span className="text-muted-foreground">-</span>
                      )}
                    </td>
                    <td className="py-3 px-4">
                      {item.financial ? (
                        <span className="font-medium">
                          {formatCurrency(item.financial.net_income)}
                        </span>
                      ) : (
                        <span className="text-muted-foreground">-</span>
                      )}
                    </td>
                    <td className="py-3 px-4">
                      {item.financial && typeof item.financial.ebitda === 'number' ? (
                        <span className="font-medium">
                          {formatCurrency(item.financial.ebitda)}
                        </span>
                      ) : (
                        <span className="text-muted-foreground">-</span>
                      )}
                    </td>
                    <td className="py-3 px-4">
                      {item.financial && typeof item.financial.beta === 'number' ? (
                        <span>{item.financial.beta.toFixed(2)}</span>
                      ) : (
                        <span className="text-muted-foreground">-</span>
                      )}
                    </td>
                    <td className="py-3 px-4">
                      {item.financial ? (
                        <span>{formatNumber(item.financial.employees)}</span>
                      ) : (
                        <span className="text-muted-foreground">-</span>
                      )}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}

        {financialData.some(item => item.error) && (
          <div className="mt-4 p-4 bg-yellow-50 border border-yellow-200 rounded-lg">
            <p className="text-sm text-yellow-800">
              Some companies could not be loaded. This may be due to missing ticker symbols or API limitations.
            </p>
          </div>
        )}
      </CardContent>
    </Card>
  )
}
