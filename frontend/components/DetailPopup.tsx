'use client'

import { useState } from 'react'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { X, Info } from 'lucide-react'

interface DetailPopupProps {
  title: string
  description: string
  details: {
    label: string
    value: string | number
    description?: string
  }[]
  calculation: string
  isOpen: boolean
  onClose: () => void
}

export function DetailPopup({ 
  title, 
  description, 
  details, 
  calculation, 
  isOpen, 
  onClose 
}: DetailPopupProps) {
  if (!isOpen) return null

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
      <Card className="w-full max-w-2xl max-h-[80vh] overflow-y-auto">
        <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-4">
          <div>
            <CardTitle className="flex items-center gap-2">
              <Info className="h-5 w-5" />
              {title}
            </CardTitle>
            <CardDescription className="mt-2">
              {description}
            </CardDescription>
          </div>
          <Button
            variant="ghost"
            size="sm"
            onClick={onClose}
            className="h-8 w-8 p-0"
          >
            <X className="h-4 w-4" />
          </Button>
        </CardHeader>
        <CardContent className="space-y-6">
          {/* Details Table */}
          <div>
            <h4 className="font-semibold mb-3">Calculation Details</h4>
            <div className="space-y-3">
              {details.map((detail, index) => (
                <div key={index} className="flex justify-between items-start py-2 border-b border-gray-100 last:border-b-0">
                  <div className="flex-1">
                    <div className="font-medium text-sm">{detail.label}</div>
                    {detail.description && (
                      <div className="text-xs text-gray-600 mt-1">{detail.description}</div>
                    )}
                  </div>
                  <div className="text-sm font-mono bg-gray-100 px-2 py-1 rounded">
                    {detail.value}
                  </div>
                </div>
              ))}
            </div>
          </div>

          {/* Calculation Formula */}
          <div>
            <h4 className="font-semibold mb-3">Calculation Formula</h4>
            <div className="bg-gray-50 p-4 rounded-lg">
              <code className="text-sm whitespace-pre-wrap">{calculation}</code>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  )
}

interface MetricWithPopupProps {
  label: string
  value: string | number
  popupTitle: string
  popupDescription: string
  popupDetails: {
    label: string
    value: string | number
    description?: string
  }[]
  popupCalculation: string
}

export function MetricWithPopup({
  label,
  value,
  popupTitle,
  popupDescription,
  popupDetails,
  popupCalculation
}: MetricWithPopupProps) {
  const [isPopupOpen, setIsPopupOpen] = useState(false)

  return (
    <>
      <div className="flex items-center justify-between">
        <span className="text-sm font-medium">{label}</span>
        <div className="flex items-center gap-2">
          <span className="text-sm font-mono">{value}</span>
          <Button
            variant="ghost"
            size="sm"
            onClick={() => setIsPopupOpen(true)}
            className="h-6 w-6 p-0 hover:bg-gray-100"
          >
            <Info className="h-3 w-3" />
          </Button>
        </div>
      </div>
      
      <DetailPopup
        title={popupTitle}
        description={popupDescription}
        details={popupDetails}
        calculation={popupCalculation}
        isOpen={isPopupOpen}
        onClose={() => setIsPopupOpen(false)}
      />
    </>
  )
}


