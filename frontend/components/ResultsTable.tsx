'use client'

import { useState, useMemo } from 'react'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { ArrowUpDown, Search, TrendingUp, Target } from 'lucide-react'
import { RankingResult } from '@/lib/types'
import { cn } from '@/lib/utils'

interface ResultsTableProps {
  results: RankingResult[]
}

type SortField = 'companyName' | 'x_maturity' | 'y_differentiation' | 'combined'
type SortDirection = 'asc' | 'desc'

export function ResultsTable({ results }: ResultsTableProps) {
  const [sortField, setSortField] = useState<SortField>('combined')
  const [sortDirection, setSortDirection] = useState<SortDirection>('desc')
  const [searchQuery, setSearchQuery] = useState('')

  const sortedResults = useMemo(() => {
    let filtered = results.filter(result =>
      result.companyName.toLowerCase().includes(searchQuery.toLowerCase())
    )

    filtered.sort((a, b) => {
      let aValue: any
      let bValue: any

      switch (sortField) {
        case 'companyName':
          aValue = a.companyName
          bValue = b.companyName
          break
        case 'x_maturity':
          aValue = a.x_maturity
          bValue = b.x_maturity
          break
        case 'y_differentiation':
          aValue = a.y_differentiation
          bValue = b.y_differentiation
          break
        case 'combined':
        default:
          aValue = a.x_maturity + a.y_differentiation
          bValue = b.x_maturity + b.y_differentiation
          break
      }

      if (typeof aValue === 'string') {
        aValue = aValue.toLowerCase()
        bValue = bValue.toLowerCase()
      }

      if (aValue < bValue) return sortDirection === 'asc' ? -1 : 1
      if (aValue > bValue) return sortDirection === 'asc' ? 1 : -1
      return 0
    })

    return filtered
  }, [results, sortField, sortDirection, searchQuery])

  const handleSort = (field: SortField) => {
    if (sortField === field) {
      setSortDirection(sortDirection === 'asc' ? 'desc' : 'asc')
    } else {
      setSortField(field)
      setSortDirection('desc')
    }
  }

  const getSortIcon = (field: SortField) => {
    if (sortField !== field) return <ArrowUpDown className="h-4 w-4" />
    return sortDirection === 'asc' ? 
      <ArrowUpDown className="h-4 w-4 rotate-180" /> : 
      <ArrowUpDown className="h-4 w-4" />
  }

  const getScoreColor = (score: number) => {
    if (score >= 0.8) return 'text-green-600'
    if (score >= 0.6) return 'text-blue-600'
    if (score >= 0.4) return 'text-yellow-600'
    return 'text-red-600'
  }

  const getScoreBackground = (score: number) => {
    if (score >= 0.8) return 'bg-green-100 dark:bg-green-900/20'
    if (score >= 0.6) return 'bg-blue-100 dark:bg-blue-900/20'
    if (score >= 0.4) return 'bg-yellow-100 dark:bg-yellow-900/20'
    return 'bg-red-100 dark:bg-red-900/20'
  }

  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <Target className="h-5 w-5" />
          Ranking Results Table
        </CardTitle>
      </CardHeader>
      <CardContent>
        {/* Search and Controls */}
        <div className="flex items-center justify-between mb-6">
          <div className="relative w-80">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-muted-foreground" />
            <Input
              placeholder="Search companies..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="pl-10"
            />
          </div>
          <div className="text-sm text-muted-foreground">
            Showing {sortedResults.length} of {results.length} companies
          </div>
        </div>

        {/* Table */}
        <div className="overflow-x-auto">
          <table className="w-full border-collapse">
            <thead>
              <tr className="border-b bg-muted/50">
                <th className="text-left p-3 font-medium">
                  <Button
                    variant="ghost"
                    size="sm"
                    onClick={() => handleSort('companyName')}
                    className="h-auto p-0 font-medium hover:bg-transparent"
                  >
                    Company
                    {getSortIcon('companyName')}
                  </Button>
                </th>
                <th className="text-left p-3 font-medium">
                  <Button
                    variant="ghost"
                    size="sm"
                    onClick={() => handleSort('x_maturity')}
                    className="h-auto p-0 font-medium hover:bg-transparent"
                  >
                    Maturity (X)
                    {getSortIcon('x_maturity')}
                  </Button>
                </th>
                <th className="text-left p-3 font-medium">
                  <Button
                    variant="ghost"
                    size="sm"
                    onClick={() => handleSort('y_differentiation')}
                    className="h-auto p-0 font-medium hover:bg-transparent"
                  >
                    Tech Differentiation (Y)
                    {getSortIcon('y_differentiation')}
                  </Button>
                </th>
                <th className="text-left p-3 font-medium">
                  <Button
                    variant="ghost"
                    size="sm"
                    onClick={() => handleSort('combined')}
                    className="h-auto p-0 font-medium hover:bg-transparent"
                  >
                    Combined Score
                    {getSortIcon('combined')}
                  </Button>
                </th>
                <th className="text-left p-3 font-medium">Explanation</th>
              </tr>
            </thead>
            <tbody>
              {sortedResults.map((result, index) => (
                <tr
                  key={result.companyId}
                  className={cn(
                    "border-b hover:bg-muted/30 transition-colors",
                    index === 0 && "bg-primary/5 border-primary/20"
                  )}
                >
                  <td className="p-3">
                    <div className="flex items-center gap-3">
                      {index === 0 && (
                        <div className="w-6 h-6 bg-primary rounded-full flex items-center justify-center">
                          <TrendingUp className="h-3 w-3 text-primary-foreground" />
                        </div>
                      )}
                      <div>
                        <div className="font-medium">{result.companyName}</div>
                        <div className="text-sm text-muted-foreground">
                          ID: {result.companyId}
                        </div>
                      </div>
                    </div>
                  </td>
                  
                  <td className="p-3">
                    <div className={cn(
                      "inline-flex items-center px-2 py-1 rounded-full text-sm font-medium",
                      getScoreBackground(result.x_maturity),
                      getScoreColor(result.x_maturity)
                    )}>
                      {(result.x_maturity * 100).toFixed(1)}%
                    </div>
                  </td>
                  
                  <td className="p-3">
                    <div className={cn(
                      "inline-flex items-center px-2 py-1 rounded-full text-sm font-medium",
                      getScoreBackground(result.y_differentiation),
                      getScoreColor(result.y_differentiation)
                    )}>
                      {(result.y_differentiation * 100).toFixed(1)}%
                    </div>
                  </td>
                  
                  <td className="p-3">
                    <div className="text-lg font-semibold">
                      {((result.x_maturity + result.y_differentiation) * 100).toFixed(1)}%
                    </div>
                    <div className="text-xs text-muted-foreground">
                      Raw: M {(result.rawScores.maturity * 100).toFixed(1)}% / 
                      D {(result.rawScores.differentiation * 100).toFixed(1)}%
                    </div>
                  </td>
                  
                  <td className="p-3">
                    <div className="max-w-xs text-sm text-muted-foreground">
                      {result.explanation}
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>

        {/* Summary Stats */}
        {sortedResults.length > 0 && (
          <div className="mt-6 p-4 bg-muted/20 rounded-lg">
            <h3 className="font-semibold mb-3">Summary Statistics</h3>
            <div className="grid grid-cols-2 md:grid-cols-4 gap-4 text-sm">
              <div>
                <div className="text-muted-foreground">Average Maturity</div>
                <div className="font-semibold">
                  {(sortedResults.reduce((sum, r) => sum + r.x_maturity, 0) / sortedResults.length * 100).toFixed(1)}%
                </div>
              </div>
              <div>
                <div className="text-muted-foreground">Average Differentiation</div>
                <div className="font-semibold">
                  {(sortedResults.reduce((sum, r) => sum + r.y_differentiation, 0) / sortedResults.length * 100).toFixed(1)}%
                </div>
              </div>
              <div>
                <div className="text-muted-foreground">Top Performer</div>
                <div className="font-semibold text-green-600">
                  {sortedResults[0]?.companyName}
                </div>
              </div>
              <div>
                <div className="text-muted-foreground">Range (Maturity)</div>
                <div className="font-semibold">
                  {(Math.min(...sortedResults.map(r => r.x_maturity)) * 100).toFixed(1)}% - 
                  {(Math.max(...sortedResults.map(r => r.x_maturity)) * 100).toFixed(1)}%
                </div>
              </div>
            </div>
          </div>
        )}
      </CardContent>
    </Card>
  )
}

