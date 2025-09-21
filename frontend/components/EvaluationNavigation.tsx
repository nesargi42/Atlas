'use client'

import { Button } from '@/components/ui/button'
import { Building2 } from 'lucide-react'
import type { LucideIcon } from 'lucide-react'
import { cn } from '@/lib/utils'

export type EvaluationNavigationStatus = 'in-progress' | 'ready' | 'error'

export interface EvaluationNavigationItem {
  id: string
  label: string
  icon: LucideIcon
  visible?: boolean
  disabled?: boolean
  status?: EvaluationNavigationStatus
}

interface EvaluationNavigationProps {
  activeSection: string
  onSectionChange: (section: string) => void
  items: EvaluationNavigationItem[]
}

const statusLabel: Record<EvaluationNavigationStatus, string> = {
  'in-progress': 'In progress',
  ready: 'Ready',
  error: 'Needs attention'
}

const statusStyles: Record<EvaluationNavigationStatus, string> = {
  'in-progress': 'text-amber-500',
  ready: 'text-emerald-500',
  error: 'text-destructive'
}

export default function EvaluationNavigation({
  activeSection,
  onSectionChange,
  items
}: EvaluationNavigationProps) {
  const visibleItems = items.filter((item) => item.visible !== false)

  return (
    <div className="w-72 bg-background border-r border-border h-full flex flex-col">
      {/* Header */}
      <div className="p-5 border-b border-border">
        <div className="flex items-center space-x-2">
          <Building2 className="h-6 w-6 text-primary" />
          <h2 className="text-lg font-semibold">Atlas</h2>
        </div>
        <p className="text-xs text-muted-foreground mt-3 uppercase tracking-wide">Contents</p>
      </div>

      {/* Navigation Items */}
      <nav className="flex-1 p-4 space-y-2 overflow-y-auto">
        {visibleItems.map((item) => {
          const isActive = activeSection === item.id
          const Icon = item.icon
          const status = item.status

          return (
            <Button
              key={item.id}
              variant={isActive ? 'default' : 'ghost'}
              className={cn(
                'w-full justify-between text-left h-auto p-3',
                isActive && 'bg-primary text-primary-foreground hover:bg-primary/90'
              )}
              disabled={item.disabled}
              onClick={() => onSectionChange(item.id)}
            >
              <span className="flex items-center gap-3">
                <Icon className="h-4 w-4" />
                <span className="text-sm font-medium">{item.label}</span>
              </span>
              {status && (
                <span className={cn('text-xs font-medium', statusStyles[status])}>
                  {statusLabel[status]}
                </span>
              )}
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

