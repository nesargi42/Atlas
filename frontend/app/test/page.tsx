'use client'

import { useState } from 'react'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { backendService } from '@/lib/backend-service'

export default function TestPage() {
  const [result, setResult] = useState<any>(null)
  const [loading, setLoading] = useState(false)

  const testBackend = async () => {
    setLoading(true)
    try {
      console.log('Testing backend service...')
      const data = await backendService.getCompanyProfile('AAPL')
      console.log('Backend response:', data)
      setResult(data)
    } catch (error) {
      console.error('Backend error:', error)
      setResult({ error: error.message })
    } finally {
      setLoading(false)
    }
  }

  const testFrontendAPI = async () => {
    setLoading(true)
    try {
      console.log('Testing frontend API...')
      const response = await fetch('/api/finance/AAPL')
      const data = await response.json()
      console.log('Frontend API response:', data)
      setResult(data)
    } catch (error) {
      console.error('Frontend API error:', error)
      setResult({ error: error.message })
    } finally {
      setLoading(false)
    }
  }

  const addTestCompanies = () => {
    const testCompanies = [
      {
        id: 'AAPL',
        name: 'Apple Inc.',
        ticker: 'AAPL',
        domainTags: ['technology', 'consumer electronics'],
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString()
      },
      {
        id: 'PFE',
        name: 'Pfizer Inc.',
        ticker: 'PFE',
        domainTags: ['pharmaceuticals', 'healthcare'],
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString()
      }
    ]
    localStorage.setItem('selectedCompanies', JSON.stringify(testCompanies))
    console.log('Test companies added to localStorage')
    setResult({ message: 'Test companies added to localStorage', companies: testCompanies })
  }

  return (
    <div className="container mx-auto p-8">
      <h1 className="text-2xl font-bold mb-6">Test Page</h1>
      
      <div className="space-y-4">
        <Card>
          <CardHeader>
            <CardTitle>Backend Service Test</CardTitle>
            <CardDescription>Test direct backend service call</CardDescription>
          </CardHeader>
          <CardContent>
            <Button onClick={testBackend} disabled={loading}>
              {loading ? 'Testing...' : 'Test Backend Service'}
            </Button>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>Frontend API Test</CardTitle>
            <CardDescription>Test frontend API route</CardDescription>
          </CardHeader>
          <CardContent>
            <Button onClick={testFrontendAPI} disabled={loading}>
              {loading ? 'Testing...' : 'Test Frontend API'}
            </Button>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>Add Test Companies</CardTitle>
            <CardDescription>Add test companies to localStorage</CardDescription>
          </CardHeader>
          <CardContent>
            <Button onClick={addTestCompanies}>
              Add Test Companies
            </Button>
          </CardContent>
        </Card>

        {result && (
          <Card>
            <CardHeader>
              <CardTitle>Result</CardTitle>
            </CardHeader>
            <CardContent>
              <pre className="bg-gray-100 p-4 rounded overflow-auto">
                {JSON.stringify(result, null, 2)}
              </pre>
            </CardContent>
          </Card>
        )}
      </div>
    </div>
  )
}


