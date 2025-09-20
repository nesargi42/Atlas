'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Search, TrendingUp, Building2, FlaskConical, Target, Users } from 'lucide-react'

export default function HomePage() {
  const [searchQuery, setSearchQuery] = useState('')
  const [isSearching, setIsSearching] = useState(false)
  const router = useRouter()

  const handleSearch = async () => {
    if (!searchQuery.trim()) return
    
    setIsSearching(true)
    
    // Navigate to evaluation page with search query
    router.push(`/evaluate?search=${encodeURIComponent(searchQuery.trim())}`)
  }

  const handleKeyPress = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter') {
      handleSearch()
    }
  }

  const features = [
    {
      icon: <TrendingUp className="h-6 w-6" />,
      title: 'Financial Metrics',
      description: 'Market cap, R&D expense, CAGR, and enterprise value analysis'
    },
    {
      icon: <FlaskConical className="h-6 w-6" />,
      title: 'Pharma Insights',
      description: 'Clinical trials, molecule data, and therapeutic focus areas'
    },
    {
      icon: <Target className="h-6 w-6" />,
      title: 'AI-Powered Ranking',
      description: 'LangGraph-based analysis for tech differentiation and maturity'
    },
    {
      icon: <Users className="h-6 w-6" />,
      title: 'Partnership Analysis',
      description: 'Collaboration networks and strategic relationships'
    }
  ]

  return (
    <div className="min-h-screen bg-gradient-to-br from-background via-background to-muted/20">
      {/* Header */}
      <header className="border-b bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/60">
        <div className="container mx-auto px-4 py-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center space-x-2">
              <Building2 className="h-8 w-8 text-primary" />
              <h1 className="text-2xl font-bold">Atlas</h1>
            </div>
            <div className="flex items-center space-x-4">
              <Button variant="outline" onClick={() => router.push('/evaluate')}>
                Open Search Evaluation
              </Button>
            </div>
          </div>
        </div>
      </header>

      {/* Hero Section */}
      <main className="container mx-auto px-4 py-16">
        <div className="text-center mb-16">
          <h1 className="text-5xl font-bold tracking-tight mb-6 bg-gradient-to-r from-primary to-primary/60 bg-clip-text text-transparent">
            Company Analysis Platform
          </h1>
          <p className="text-xl text-muted-foreground max-w-3xl mx-auto mb-8">
            Analyze pharmaceutical companies using advanced financial metrics, clinical trial data, 
            and AI-powered ranking to identify the best investment opportunities.
          </p>
          
          {/* Search Bar */}
          <div className="max-w-2xl mx-auto mb-12">
            <div className="flex gap-2">
              <Input
                type="text"
                placeholder="Search by company name or ticker (e.g., PFE, Moderna, Johnson & Johnson)"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                onKeyPress={handleKeyPress}
                className="text-lg py-6"
              />
              <Button 
                onClick={handleSearch}
                disabled={isSearching || !searchQuery.trim()}
                size="lg"
                className="px-8"
              >
                {isSearching ? (
                  <div className="animate-spin rounded-full h-5 w-5 border-b-2 border-white" />
                ) : (
                  <Search className="h-5 w-5" />
                )}
              </Button>
            </div>
            <p className="text-sm text-muted-foreground mt-2">
              Try searching for: PFE, MRNA, JNJ, MRK, GILD
            </p>
          </div>
        </div>

        {/* Features Grid */}
        <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-6 mb-16">
          {features.map((feature, index) => (
            <Card 
              key={index} 
              className={`text-center hover:shadow-lg transition-shadow cursor-pointer ${
                feature.title === 'Financial Metrics' ? 'hover:scale-105' : ''
              }`}
              onClick={() => {
                if (feature.title === 'Financial Metrics') {
                  router.push('/financial-metrics')
                }
              }}
            >
              <CardHeader>
                <div className="mx-auto w-12 h-12 bg-primary/10 rounded-lg flex items-center justify-center text-primary mb-4">
                  {feature.icon}
                </div>
                <CardTitle className="text-lg">{feature.title}</CardTitle>
              </CardHeader>
              <CardContent>
                <CardDescription>{feature.description}</CardDescription>
              </CardContent>
            </Card>
          ))}
        </div>

        {/* Quick Actions */}
        <div className="text-center">
          <h2 className="text-3xl font-semibold mb-6">Get Started</h2>
          <div className="flex flex-col sm:flex-row gap-4 justify-center">
            <Button 
              size="lg" 
              onClick={() => router.push('/evaluate')}
              className="px-8 py-3"
            >
              Start Company Evaluation
            </Button>
            <Button 
              variant="outline" 
              size="lg"
              onClick={() => router.push('/evaluate?demo=true')}
              className="px-8 py-3"
            >
              View Demo
            </Button>
          </div>
        </div>
      </main>

      {/* Footer */}
      <footer className="border-t bg-muted/20 mt-20">
        <div className="container mx-auto px-4 py-8">
          <div className="text-center text-muted-foreground">
            <p>&copy; 2025 Atlas Company Analyzer</p>
          </div>
        </div>
      </footer>
    </div>
  )
}

