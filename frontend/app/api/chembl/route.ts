import { NextRequest, NextResponse } from 'next/server'
import { backendService } from '@/lib/backend-service'

// Force dynamic rendering
export const dynamic = 'force-dynamic'

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url)
    const query = searchParams.get('query')
    const target = searchParams.get('target')
    const mechanism = searchParams.get('mechanism')
    const company = searchParams.get('company')

    if (!query && !target && !mechanism && !company) {
      return NextResponse.json(
        { error: 'At least one search parameter is required' },
        { status: 400 }
      )
    }

    let molecules: any[] = []

    if (company) {
      molecules = [await backendService.getMoleculeData(company)]
    } else if (target) {
      molecules = [await backendService.getMoleculeData(target)]
    } else if (mechanism) {
      molecules = [await backendService.getMoleculeData(mechanism)]
    } else if (query) {
      molecules = [await backendService.getMoleculeData(query)]
    }

    return NextResponse.json({
      data: molecules,
      message: `Found ${molecules.length} molecules`,
      searchParams: {
        query: query || null,
        target: target || null,
        mechanism: mechanism || null,
        company: company || null
      }
    })
  } catch (error) {
    console.error('Error fetching ChEMBL data:', error)
    
    return NextResponse.json(
      { 
        error: 'Failed to fetch ChEMBL data',
        details: error instanceof Error ? error.message : 'Unknown error'
      },
      { status: 500 }
    )
  }
}

export async function POST(request: NextRequest) {
  try {
    const body = await request.json()
    const { searchType, searchValue } = body

    if (!searchType || !searchValue) {
      return NextResponse.json(
        { error: 'Search type and value are required' },
        { status: 400 }
      )
    }

    let molecules: any[] = []

    switch (searchType) {
      case 'company':
        molecules = [await backendService.getMoleculeData(searchValue)]
        break
      case 'target':
        molecules = [await backendService.getMoleculeData(searchValue)]
        break
      case 'mechanism':
        molecules = [await backendService.getMoleculeData(searchValue)]
        break
      case 'query':
        molecules = [await backendService.getMoleculeData(searchValue)]
        break
      default:
        return NextResponse.json(
          { error: 'Invalid search type' },
          { status: 400 }
        )
    }

    return NextResponse.json({
      data: molecules,
      message: `Found ${molecules.length} molecules for ${searchType}: ${searchValue}`,
      searchType,
      searchValue
    })
  } catch (error) {
    console.error('Error searching ChEMBL data:', error)
    
    return NextResponse.json(
      { 
        error: 'Failed to search ChEMBL data',
        details: error instanceof Error ? error.message : 'Unknown error'
      },
      { status: 500 }
    )
  }
}

