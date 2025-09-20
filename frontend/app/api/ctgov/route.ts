import { NextRequest, NextResponse } from 'next/server'
import { backendService } from '@/lib/backend-service'

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url)
    const company = searchParams.get('company')
    const phase = searchParams.get('phase')
    const status = searchParams.get('status')
    const interventionType = searchParams.get('interventionType')

    if (!company) {
      return NextResponse.json(
        { error: 'Company parameter is required' },
        { status: 400 }
      )
    }

    // Parse filters
    const filters: any = {}
    if (phase) filters.phase = phase.split(',')
    if (status) filters.status = status.split(',')
    if (interventionType) filters.interventionType = interventionType.split(',')

    const trials = await backendService.getCompanyTrials(company)

    return NextResponse.json({
      data: trials,
      message: `Found ${trials.length} clinical trials for ${company}`,
      filters: {
        company,
        phase: filters.phase || [],
        status: filters.status || [],
        interventionType: filters.interventionType || []
      }
    })
  } catch (error) {
    console.error('Error fetching clinical trials:', error)
    
    return NextResponse.json(
      { 
        error: 'Failed to fetch clinical trials',
        details: error instanceof Error ? error.message : 'Unknown error'
      },
      { status: 500 }
    )
  }
}

export async function POST(request: NextRequest) {
  try {
    const body = await request.json()
    const { query, filters } = body

    if (!query) {
      return NextResponse.json(
        { error: 'Query parameter is required' },
        { status: 400 }
      )
    }

    const trials = await backendService.getCompanyTrials(query)

    return NextResponse.json({
      data: trials,
      message: `Found ${trials.length} clinical trials matching query`,
      query,
      filters
    })
  } catch (error) {
    console.error('Error searching clinical trials:', error)
    
    return NextResponse.json(
      { 
        error: 'Failed to search clinical trials',
        details: error instanceof Error ? error.message : 'Unknown error'
      },
      { status: 500 }
    )
  }
}

