'use client'

import { useState } from 'react'
import { Button } from '@/components/ui/button'
import { 
  Search, 
  TrendingUp, 
  Settings, 
  FileText, 
  BarChart3, 
  Grid3X3,
  Building2
} from 'lucide-react'
import { cn } from '@/lib/utils'

interface EvaluationNavigationProps {
  activeSection: string
  onSectionChange: (section: string) => void
  hasAnalysisResults: boolean
}

const navigationItems = [
  {
    id: 'select-company',
    label: 'Select Company',
    icon: Search,
    alwaysVisible: true
  },
  {
    id: 'financial-metrics',
    label: 'Financial Metrics',
    icon: TrendingUp,
    alwaysVisible: true
  },
  {
    id: 'analysis-criteria',
    label: 'Analysis Criteria',
    icon: Settings,
    alwaysVisible: true
  },
  {
    id: 'analysis-summary',
    label: 'Analysis Summary',
    icon: FileText,
    alwaysVisible: true
  },
  {
    id: 'maturity-differentiation',
    label: 'Maturity vs. Differentiation',
    icon: BarChart3,
    alwaysVisible: false
  },
  {
    id: 'comparison-matrix',
    label: 'Comparison Matrix',
    icon: Grid3X3,
    alwaysVisible: false
  }
]

export default function EvaluationNavigation({ 
  activeSection, 
  onSectionChange, 
  hasAnalysisResults 
}: EvaluationNavigationProps) {
  return (
    <div className="w-64 bg-background border-r border-border h-full flex flex-col">
      {/* Header */}
      <div className="p-4 border-b border-border">
        <div className="flex items-center space-x-2">
          <Building2 className="h-6 w-6 text-primary" />
          <h2 className="text-lg font-semibold">Atlas</h2>
        </div>
      </div>

      {/* Navigation Items */}
      <nav className="flex-1 p-4 space-y-2">
        {navigationItems.map((item) => {
          const isVisible = item.alwaysVisible || hasAnalysisResults
          const isActive = activeSection === item.id
          
          if (!isVisible) return null

          return (
            <Button
              key={item.id}
              variant={isActive ? "default" : "ghost"}
              className={cn(
                "w-full justify-start text-left h-auto p-3",
                isActive && "bg-primary text-primary-foreground"
              )}
              onClick={() => onSectionChange(item.id)}
            >
              <item.icon className="h-4 w-4 mr-3" />
              <span className="text-sm">{item.label}</span>
            </Button>
          )
        })}
      </nav>

      {/* Footer */}
      <div className="p-4 border-t border-border">
        <p className="text-xs text-muted-foreground text-center">
          Company Analysis Platform
        </p>
      </div>
    </div>
  )
}
