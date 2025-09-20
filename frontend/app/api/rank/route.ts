import { NextRequest, NextResponse } from 'next/server'
import { backendService } from '@/lib/backend-service'

export async function POST(request: NextRequest) {
  try {
    const body = await request.json()
    const { companyName, ticker, userCriteria, userWeights } = body

    if (!companyName) {
      return NextResponse.json(
        { error: 'Company name is required' },
        { status: 400 }
      )
    }

    console.log(`🚀 Starting ranking for company: ${companyName}`)

    // Use backend service
    const result = await backendService.rankCompany({
      company_name: companyName,
      ticker: ticker || '',
      user_criteria: userCriteria,
      user_weights: userWeights,
    })

    console.log(`✅ Ranking completed successfully for ${companyName}`)

    return NextResponse.json({
      data: result,
      message: 'Company ranking completed successfully'
    })

  } catch (error) {
    console.error('Error in ranking API:', error)
    
    return NextResponse.json(
      { 
        error: 'Failed to rank companies',
        details: error instanceof Error ? error.message : 'Unknown error'
      },
      { status: 500 }
    )
  }
}

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url)
    const action = searchParams.get('action')

    if (action === 'health') {
      return NextResponse.json({
        status: 'healthy',
        message: 'Ranking service is operational',
        timestamp: new Date().toISOString()
      })
    }

    if (action === 'criteria') {
      // Return available criteria and their default weights
      return NextResponse.json({
        data: {
          defaultCriteria: {
            cagr: { weight: 0.15, description: 'Compound Annual Growth Rate' },
            marketCap: { weight: 0.10, description: 'Market Capitalization' },
            enterpriseValue: { weight: 0.10, description: 'Enterprise Value' },
            rdExpense: { weight: 0.20, description: 'Research & Development Expenses' },
            partnerships: { weight: 0.15, description: 'Number of Partnerships' },
            focusAreaFit: { weight: 0.20, description: 'Alignment with Focus Areas' },
            trialPhaseMix: { weight: 0.10, description: 'Clinical Trial Phase Distribution' }
          },
          customCriteria: {
            description: 'You can add custom criteria with name, type (number/text/select), and weight'
          }
        },
        message: 'Available evaluation criteria retrieved'
      })
    }

    return NextResponse.json(
      { error: 'Invalid action parameter' },
      { status: 400 }
    )

  } catch (error) {
    console.error('Error in ranking API GET:', error)
    
    return NextResponse.json(
      { 
        error: 'Failed to process request',
        details: error instanceof Error ? error.message : 'Unknown error'
      },
      { status: 500 }
    )
  }
}
