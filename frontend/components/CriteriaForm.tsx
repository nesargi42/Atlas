'use client'

import { useState } from 'react'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Slider } from '@/components/ui/slider'
import { Plus, Trash2, Save, Play } from 'lucide-react'
import { EvaluationCriteria, CustomCriterion } from '@/lib/types'
import { cn } from '@/lib/utils'

interface CriteriaFormProps {
  onComplete: (criteria: EvaluationCriteria) => void
  companyCount: number
}

const defaultCriteria: EvaluationCriteria = {
  cagr: 0.15,
  marketCap: 0.10,
  enterpriseValue: 0.10,
  rdExpense: 0.20,
  partnerships: 0.15,
  focusAreaFit: 0.20,
  trialPhaseMix: 0.10
}

export function CriteriaForm({ onComplete, companyCount }: CriteriaFormProps) {
  const [criteria, setCriteria] = useState<EvaluationCriteria>(defaultCriteria)
  const [customCriteria, setCustomCriteria] = useState<CustomCriterion[]>([])
  const [focusAreas, setFocusAreas] = useState<string>('oncology, vaccines, rare-diseases')
  const [isSubmitting, setIsSubmitting] = useState(false)

  const handleCriteriaChange = (key: keyof EvaluationCriteria, value: number) => {
    setCriteria(prev => ({
      ...prev,
      [key]: value
    }))
  }

  const addCustomCriterion = () => {
    const newCriterion: CustomCriterion = {
      name: `Custom ${customCriteria.length + 1}`,
      type: 'number',
      weight: 0.05,
      options: []
    }
    setCustomCriteria(prev => [...prev, newCriterion])
  }

  const updateCustomCriterion = (index: number, updates: Partial<CustomCriterion>) => {
    setCustomCriteria(prev => prev.map((c, i) => 
      i === index ? { ...c, ...updates } : c
    ))
  }

  const removeCustomCriterion = (index: number) => {
    setCustomCriteria(prev => prev.filter((_, i) => i !== index))
  }

  const handleSubmit = async () => {
    setIsSubmitting(true)
    
    try {
      // Combine default criteria with custom criteria
      const finalCriteria: EvaluationCriteria = {
        ...criteria,
        focusAreaFit: calculateFocusAreaFit(focusAreas),
        ...Object.fromEntries(
          customCriteria.map(c => [c.name, c.weight])
        )
      }

      // Validate total weights
      const totalWeight = Object.values(finalCriteria).reduce((sum, weight) => sum + weight, 0)
      
      if (Math.abs(totalWeight - 1.0) > 0.01) {
        alert(`Total weights must equal 1.0. Current total: ${totalWeight.toFixed(2)}`)
        return
      }

      onComplete(finalCriteria)
    } catch (error) {
      console.error('Error submitting criteria:', error)
    } finally {
      setIsSubmitting(false)
    }
  }

  const calculateFocusAreaFit = (areas: string): number => {
    // Simple calculation - could be enhanced
    const areaCount = areas.split(',').filter(a => a.trim()).length
    return Math.min(areaCount * 0.1, 0.5)
  }

  const getTotalWeight = () => {
    const baseWeight = Object.values(criteria).reduce((sum, weight) => sum + weight, 0)
    const customWeight = customCriteria.reduce((sum, c) => sum + c.weight, 0)
    return baseWeight + customWeight
  }

  const totalWeight = getTotalWeight()
  const isWeightValid = Math.abs(totalWeight - 1.0) < 0.01

  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <Save className="h-5 w-5" />
          Evaluation Criteria
        </CardTitle>
        <CardDescription>
          Set the weights for each evaluation criterion. Total weights must equal 1.0.
        </CardDescription>
      </CardHeader>
      <CardContent className="space-y-6">
        {/* Default Criteria */}
        <div>
          <h3 className="text-lg font-semibold mb-4">Standard Criteria</h3>
          <div className="grid gap-4">
            {Object.entries(criteria).map(([key, value]) => (
              <div key={key} className="space-y-2">
                <div className="flex justify-between">
                  <Label className="capitalize">
                    {key.replace(/([A-Z])/g, ' $1').trim()}
                  </Label>
                  <span className="text-sm text-muted-foreground">
                    {(value * 100).toFixed(0)}%
                  </span>
                </div>
                <Slider
                  value={[value]}
                  onValueChange={([newValue]) => handleCriteriaChange(key as keyof EvaluationCriteria, newValue)}
                  max={1}
                  min={0}
                  step={0.01}
                  className="w-full"
                />
              </div>
            ))}
          </div>
        </div>

        {/* Focus Areas */}
        <div>
          <h3 className="text-lg font-semibold mb-4">Focus Areas</h3>
          <div className="space-y-2">
            <Label htmlFor="focusAreas">
              Therapeutic areas of interest (comma-separated)
            </Label>
            <Input
              id="focusAreas"
              value={focusAreas}
              onChange={(e) => setFocusAreas(e.target.value)}
              placeholder="e.g., oncology, vaccines, rare-diseases"
            />
            <p className="text-sm text-muted-foreground">
              Weight: {(calculateFocusAreaFit(focusAreas) * 100).toFixed(0)}%
            </p>
          </div>
        </div>

        {/* Custom Criteria */}
        <div>
          <div className="flex items-center justify-between mb-4">
            <h3 className="text-lg font-semibold">Custom Criteria</h3>
            <Button
              type="button"
              variant="outline"
              size="sm"
              onClick={addCustomCriterion}
            >
              <Plus className="h-4 w-4 mr-2" />
              Add Custom
            </Button>
          </div>
          
          {customCriteria.length > 0 && (
            <div className="space-y-4">
              {customCriteria.map((criterion, index) => (
                <div key={index} className="flex items-center gap-4 p-4 border rounded-lg">
                  <div className="flex-1 space-y-2">
                    <Input
                      placeholder="Criterion name"
                      value={criterion.name}
                      onChange={(e) => updateCustomCriterion(index, { name: e.target.value })}
                    />
                    <div className="flex gap-2">
                      <select
                        value={criterion.type}
                        onChange={(e) => updateCustomCriterion(index, { type: e.target.value as any })}
                        className="input"
                      >
                        <option value="number">Number</option>
                        <option value="text">Text</option>
                        <option value="select">Select</option>
                      </select>
                      <Input
                        type="number"
                        placeholder="Weight"
                        value={criterion.weight}
                        onChange={(e) => updateCustomCriterion(index, { weight: parseFloat(e.target.value) || 0 })}
                        min={0}
                        max={1}
                        step={0.01}
                        className="w-24"
                      />
                    </div>
                  </div>
                  <Button
                    type="button"
                    variant="outline"
                    size="sm"
                    onClick={() => removeCustomCriterion(index)}
                  >
                    <Trash2 className="h-4 w-4" />
                  </Button>
                </div>
              ))}
            </div>
          )}
        </div>

        {/* Weight Summary */}
        <div className="p-4 bg-muted/20 rounded-lg">
          <div className="flex justify-between items-center mb-2">
            <span className="font-medium">Total Weight:</span>
            <span className={cn(
              "font-mono text-lg",
              isWeightValid ? "text-green-600" : "text-red-600"
            )}>
              {(totalWeight * 100).toFixed(1)}%
            </span>
          </div>
          <div className="text-sm text-muted-foreground">
            {isWeightValid ? (
              "✅ Weights are valid"
            ) : (
              `❌ Weights must equal 100% (currently ${(totalWeight * 100).toFixed(1)}%)`
            )}
          </div>
        </div>

        {/* Submit Button */}
        <div className="flex justify-end">
          <Button
            onClick={handleSubmit}
            disabled={!isWeightValid || isSubmitting}
            size="lg"
            className="flex items-center gap-2"
          >
            {isSubmitting ? (
              <>
                <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white"></div>
                Processing...
              </>
            ) : (
              <>
                <Play className="h-4 w-4" />
                Start Ranking ({companyCount} companies)
              </>
            )}
          </Button>
        </div>
      </CardContent>
    </Card>
  )
}

