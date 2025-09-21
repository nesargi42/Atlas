import { NextRequest, NextResponse } from 'next/server'
import { env } from '@/lib/env'

// Force dynamic rendering
export const dynamic = 'force-dynamic'

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url)
    const query = searchParams.get('query')

    if (!query || query.length < 2) {
      return NextResponse.json(
        { error: 'Query must be at least 2 characters long' },
        { status: 400 }
      )
    }

    // Use backend service for search
    console.log('🔄 Using backend service for search')
    
    const backendUrl = process.env.NEXT_PUBLIC_BACKEND_URL || 'http://127.0.0.1:5000'
    const response = await fetch(`${backendUrl}/api/finance/search?query=${encodeURIComponent(query)}`)

    if (!response.ok) {
      throw new Error(`Backend API error: ${response.status} ${response.statusText}`)
    }

    const searchResults = await response.json()

    return NextResponse.json({
      data: searchResults,
      message: 'Search completed successfully'
    })
  } catch (error) {
    console.error('Error searching companies:', error)
    
    return NextResponse.json(
      { 
        error: 'Failed to search companies',
        details: error instanceof Error ? error.message : 'Unknown error'
      },
      { status: 500 }
    )
  }
}