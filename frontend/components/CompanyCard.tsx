'use client'

import { Company } from '@/lib/types'
import { Card, CardContent } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Check, Building2, Tag } from 'lucide-react'
import { cn } from '@/lib/utils'

interface CompanyCardProps {
  company: Company
  isSelected: boolean
  onSelect: (company: Company) => void
}

export function CompanyCard({ company, isSelected, onSelect }: CompanyCardProps) {
  return (
    <Card 
      className={cn(
        "transition-all duration-200 cursor-pointer hover:shadow-md",
        isSelected && "ring-2 ring-primary bg-primary/5"
      )}
      onClick={() => onSelect(company)}
    >
      <CardContent className="p-4">
        <div className="flex items-center justify-between">
          <div className="flex items-center space-x-3">
            <div className="w-10 h-10 bg-primary/10 rounded-lg flex items-center justify-center">
              <Building2 className="h-5 w-5 text-primary" />
            </div>
            <div>
              <h3 className="font-semibold text-lg">{company.name}</h3>
              {company.ticker && (
                <p className="text-sm text-muted-foreground font-mono">
                  {company.ticker}
                </p>
              )}
            </div>
          </div>
          
          <div className="flex items-center space-x-2">
            {company.domainTags && company.domainTags.length > 0 && (
              <div className="flex items-center space-x-1 text-xs text-muted-foreground">
                <Tag className="h-3 w-3" />
                <span>{company.domainTags.slice(0, 2).join(', ')}</span>
                {company.domainTags && company.domainTags.length > 2 && (
                  <span>+{company.domainTags.length - 2}</span>
                )}
              </div>
            )}
            
            <Button
              variant={isSelected ? "default" : "outline"}
              size="sm"
              className={cn(
                "w-8 h-8 p-0",
                isSelected && "bg-primary text-primary-foreground"
              )}
            >
              {isSelected ? (
                <Check className="h-4 w-4" />
              ) : (
                <span className="text-xs">+</span>
              )}
            </Button>
          </div>
        </div>
      </CardContent>
    </Card>
  )
}

