import { NextRequest, NextResponse } from 'next/server'
import { env } from '@/lib/env'
import { isValidTicker } from '@/lib/utils'
import type { FinancialData } from '@/lib/types'

export async function GET(
  request: NextRequest,
  { params }: { params: { ticker: string } }
) {
  try {
    const { ticker } = params

    if (!ticker || !isValidTicker(ticker)) {
      return NextResponse.json(
        { error: 'Invalid ticker symbol' },
        { status: 400 }
      )
    }

    // Always use backend service - no mock data fallback
    console.log('🔄 Fetching data from backend service')
    
    const backendUrl = process.env.NEXT_PUBLIC_BACKEND_URL || 'http://127.0.0.1:5000'
    console.log('Backend URL:', backendUrl)
    
    const response = await fetch(`${backendUrl}/api/finance/profile/${ticker}`)
    
    if (!response.ok) {
      throw new Error(`Backend API error: ${response.status} ${response.statusText}`)
    }
    
    const data = await response.json()
    console.log('✅ Backend data received:', data.company_name)
    
    return NextResponse.json({
      data: data,
      message: 'Financial data retrieved from backend'
    })
  } catch (error) {
    console.error('Error fetching financial data:', error)
    
    return NextResponse.json(
      { 
        error: 'Failed to fetch financial data',
        details: error instanceof Error ? error.message : 'Unknown error'
      },
      { status: 500 }
    )
  }
}

