'use client'

import { useState, useEffect } from 'react'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Slider } from '@/components/ui/slider'
import { Label } from '@/components/ui/label'
import { 
  TrendingUp, 
  Building2, 
  Target, 
  Users, 
  FlaskConical, 
  DollarSign,
  BarChart3,
  ArrowRight
} from 'lucide-react'
import { Company, CompanyAnalysis } from '@/lib/types'
import { backendService } from '@/lib/backend-service'

// Create company-specific mock financial data (fallback)
const getMockFinancialData = (ticker: string) => {
  const baseData = {
    company_name: '', // Will be set in switch statement
    sector: '',
    industry: '',
    employees: 0,
    price: 0,
    market_cap: 0,
    beta: 0,
    volume: 0,
    average_volume: 0,
    revenue: 0,
    net_income: 0,
    eps: 0,
    eps_diluted: 0,
    pe_ratio: 0,
    total_debt: 0,
    cash: 0,
    enterprise_value: 0,
    rd_expense: 0,
    gross_profit: 0,
    operating_income: 0,
    ebitda: 0,
    ebit: 0,
    cagr: 0
  }

  switch (ticker.toUpperCase()) {
    case 'PFE':
      return {
        ...baseData,
        company_name: 'Pfizer Inc.',
        sector: 'Healthcare',
        industry: 'Drug Manufacturers - General',
        employees: 81000,
        price: 24.54,
        market_cap: 139523397000,
        beta: 0.44,
        volume: 40849330,
        average_volume: 40776300,
        revenue: 63627000000,
        net_income: 8020000000,
        eps: 1.42,
        eps_diluted: 1.41,
        pe_ratio: 17.31,
        total_debt: 63649000000,
        cash: 12300000000,
        enterprise_value: 191000000000,
        rd_expense: 11400000000,
        gross_profit: 45000000000,
        operating_income: 12000000000,
        ebitda: 15000000000,
        ebit: 12000000000,
        cagr: 0.08
      }
    case 'JNJ':
      return {
        ...baseData,
        company_name: 'Johnson & Johnson',
        sector: 'Healthcare',
        industry: 'Drug Manufacturers - General',
        employees: 152700,
        price: 156.78,
        market_cap: 413000000000,
        beta: 0.65,
        volume: 8500000,
        average_volume: 8500000,
        revenue: 94943000000,
        net_income: 17740000000,
        eps: 6.73,
        eps_diluted: 6.73,
        pe_ratio: 23.28,
        total_debt: 32000000000,
        cash: 25000000000,
        enterprise_value: 420000000000,
        rd_expense: 14600000000,
        gross_profit: 65000000000,
        operating_income: 25000000000,
        ebitda: 30000000000,
        ebit: 25000000000,
        cagr: 0.05
      }
    case 'MRNA':
      return {
        ...baseData,
        company_name: 'Moderna Inc.',
        sector: 'Healthcare',
        industry: 'Biotechnology',
        employees: 3900,
        price: 89.45,
        market_cap: 34000000000,
        beta: 1.85,
        volume: 12000000,
        average_volume: 12000000,
        revenue: 18470000000,
        net_income: 8360000000,
        eps: 20.69,
        eps_diluted: 20.69,
        pe_ratio: 4.32,
        total_debt: 1200000000,
        cash: 18000000000,
        enterprise_value: 16000000000,
        rd_expense: 3200000000,
        gross_profit: 15000000000,
        operating_income: 10000000000,
        ebitda: 12000000000,
        ebit: 10000000000,
        cagr: 0.25
      }
    case 'GILD':
      return {
        ...baseData,
        company_name: 'Gilead Sciences Inc.',
        sector: 'Healthcare',
        industry: 'Biotechnology',
        employees: 14000,
        price: 67.23,
        market_cap: 85000000000,
        beta: 0.75,
        volume: 6000000,
        average_volume: 6000000,
        revenue: 27000000000,
        net_income: 5000000000,
        eps: 3.95,
        eps_diluted: 3.95,
        pe_ratio: 17.02,
        total_debt: 22000000000,
        cash: 8000000000,
        enterprise_value: 99000000000,
        rd_expense: 5000000000,
        gross_profit: 22000000000,
        operating_income: 8000000000,
        ebitda: 10000000000,
        ebit: 8000000000,
        cagr: 0.12
      }
    case 'AMGN':
      return {
        ...baseData,
        company_name: 'Amgen Inc.',
        sector: 'Healthcare',
        industry: 'Biotechnology',
        employees: 25000,
        price: 245.67,
        market_cap: 130000000000,
        beta: 0.85,
        volume: 2000000,
        average_volume: 2000000,
        revenue: 26000000000,
        net_income: 7000000000,
        eps: 12.50,
        eps_diluted: 12.50,
        pe_ratio: 19.65,
        total_debt: 35000000000,
        cash: 10000000000,
        enterprise_value: 155000000000,
        rd_expense: 4500000000,
        gross_profit: 20000000000,
        operating_income: 10000000000,
        ebitda: 12000000000,
        ebit: 10000000000,
        cagr: 0.08
      }
    case 'BIIB':
      return {
        ...baseData,
        company_name: 'Biogen Inc.',
        sector: 'Healthcare',
        industry: 'Biotechnology',
        employees: 9000,
        price: 234.56,
        market_cap: 35000000000,
        beta: 1.15,
        volume: 1500000,
        average_volume: 1500000,
        revenue: 10000000000,
        net_income: 2000000000,
        eps: 13.50,
        eps_diluted: 13.50,
        pe_ratio: 17.37,
        total_debt: 6000000000,
        cash: 3000000000,
        enterprise_value: 38000000000,
        rd_expense: 2500000000,
        gross_profit: 8000000000,
        operating_income: 3000000000,
        ebitda: 4000000000,
        ebit: 3000000000,
        cagr: 0.15
      }
    default:
      return {
        ...baseData,
        company_name: 'Generic Pharma Company',
        sector: 'Healthcare',
        industry: 'Pharmaceuticals',
        employees: 10000,
        price: 50.00,
        market_cap: 50000000000,
        beta: 1.0,
        volume: 1000000,
        average_volume: 1000000,
        revenue: 5000000000,
        net_income: 500000000,
        eps: 2.50,
        eps_diluted: 2.50,
        pe_ratio: 20.0,
        total_debt: 10000000000,
        cash: 2000000000,
        enterprise_value: 58000000000,
        rd_expense: 1000000000,
        gross_profit: 4000000000,
        operating_income: 1000000000,
        ebitda: 1500000000,
        ebit: 1000000000,
        cagr: 0.1
      }
  }
}

interface InDepthAnalysisProps {
  companies: Company[]
  onAnalysisComplete: (analyses: CompanyAnalysis[]) => void
}

interface AnalysisCriteria {
  partnerships: number
  croCapabilities: number
  cdmoCapabilities: number
  cagr: number
  marketCap: number
  dilutedEnterpriseValue: number
  rdExpense: number
}

export function InDepthAnalysis({ companies, onAnalysisComplete }: InDepthAnalysisProps) {
  const [criteria, setCriteria] = useState<AnalysisCriteria>({
    partnerships: 50,
    croCapabilities: 50,
    cdmoCapabilities: 50,
    cagr: 50,
    marketCap: 50,
    dilutedEnterpriseValue: 50,
    rdExpense: 50
  })
  
  const [isAnalyzing, setIsAnalyzing] = useState(false)
  const [analyses, setAnalyses] = useState<CompanyAnalysis[]>([])

  const analyzeCompanies = async () => {
    if (companies.length === 0) {
      console.log('No companies selected for analysis')
      return
    }

    console.log('Starting analysis for companies:', companies)
    setIsAnalyzing(true)
    try {
      const companyAnalyses: CompanyAnalysis[] = []

      for (const company of companies) {
        console.log(`Fetching financial data for ${company.name} (${company.ticker})`)
        
        // Fetch real financial data from backend
        let financialData: any = null
        try {
          const response = await fetch(`/api/finance/${company.ticker}`)
          if (response.ok) {
            const result = await response.json()
            financialData = result.data || result
            console.log(`Real financial data for ${company.ticker}:`, financialData)
          } else {
            console.warn(`Failed to fetch financial data for ${company.ticker}, using fallback`)
            financialData = getMockFinancialData(company.ticker || '')
          }
        } catch (error) {
          console.error(`Error fetching financial data for ${company.ticker}:`, error)
          financialData = getMockFinancialData(company.ticker || '')
        }

        // Fetch real clinical trials data from backend
        let clinicalTrials: any[] = []
        try {
          const trialsResponse = await fetch(`/api/ctgov?company=${encodeURIComponent(company.name)}`)
          if (trialsResponse.ok) {
            const trialsResult = await trialsResponse.json()
            clinicalTrials = trialsResult.data || []
            console.log(`Real clinical trials for ${company.name}:`, clinicalTrials)
          } else {
            console.warn(`Failed to fetch clinical trials for ${company.name}, using fallback`)
            clinicalTrials = getMockClinicalTrials(company.ticker || '')
          }
        } catch (error) {
          console.error(`Error fetching clinical trials for ${company.name}:`, error)
          clinicalTrials = getMockClinicalTrials(company.ticker || '')
        }

        // Create company-specific mock financial data (fallback)
        const getMockFinancialData = (ticker: string) => {
          const baseData = {
            company_name: '', // Will be set in switch statement
            sector: '',
            industry: '',
            employees: 0,
            price: 0,
            market_cap: 0,
            beta: 0,
            volume: 0,
            average_volume: 0,
            revenue: 0,
            net_income: 0,
            eps: 0,
            eps_diluted: 0,
            pe_ratio: 0,
            total_debt: 0,
            cash: 0,
            enterprise_value: 0,
            rd_expense: 0,
            gross_profit: 0,
            operating_income: 0,
            ebitda: 0,
            ebit: 0,
            cagr: 0
          }

          switch (ticker.toUpperCase()) {
            case 'PFE':
              return {
                ...baseData,
                company_name: 'Pfizer Inc.',
                sector: 'Healthcare',
                industry: 'Drug Manufacturers - General',
                employees: 81000,
                price: 24.54,
                market_cap: 139523397000,
                beta: 0.44,
                volume: 40849330,
                average_volume: 40776300,
                revenue: 63627000000,
                net_income: 8020000000,
                eps: 1.42,
                eps_diluted: 1.41,
                pe_ratio: 17.31,
                total_debt: 63649000000,
                cash: 1043000000,
                enterprise_value: 202129397000,
                rd_expense: 10738000000,
                gross_profit: 41846000000,
                operating_income: 16483000000,
                ebitda: 18127000000,
                ebit: 11114000000,
                cagr: 0.08
              }
            case 'MRNA':
              return {
                ...baseData,
                company_name: 'Moderna Inc.',
                sector: 'Biotechnology',
                industry: 'Biotechnology',
                employees: 4000,
                price: 48.12,
                market_cap: 18265000000,
                beta: 1.85,
                volume: 12500000,
                average_volume: 15800000,
                revenue: 13140000000,
                net_income: -4723000000,
                eps: -12.45,
                eps_diluted: -12.45,
                pe_ratio: -3.87,
                total_debt: 1230000000,
                cash: 7500000000,
                enterprise_value: 11995000000,
                rd_expense: 4200000000,
                gross_profit: 10200000000,
                operating_income: -3850000000,
                ebitda: -3200000000,
                ebit: -4100000000,
                cagr: 0.25
              }
            case 'AAPL':
              return {
                ...baseData,
                company_name: 'Apple Inc.',
                sector: 'Technology',
                industry: 'Consumer Electronics',
                employees: 164000,
                price: 239.78,
                market_cap: 3558431081308,
                beta: 1.109,
                volume: 46157628,
                average_volume: 54570000,
                revenue: 383285000000,
                net_income: 99803000000,
                eps: 6.13,
                eps_diluted: 6.05,
                pe_ratio: 39.1,
                total_debt: 111000000000,
                cash: 29000000000,
                enterprise_value: 3539431081308,
                rd_expense: 29300000000,
                gross_profit: 170782000000,
                operating_income: 114301000000,
                ebitda: 123136000000,
                ebit: 114301000000,
                cagr: 0.12
              }
            case 'LLY':
              return {
                ...baseData,
                company_name: 'Eli Lilly and Company',
                sector: 'Healthcare',
                industry: 'Drug Manufacturers - General',
                employees: 39000,
                price: 580.25,
                market_cap: 550000000000,
                beta: 0.35,
                volume: 2500000,
                average_volume: 2800000,
                revenue: 28100000000,
                net_income: 5240000000,
                eps: 5.48,
                eps_diluted: 5.44,
                pe_ratio: 105.9,
                total_debt: 12000000000,
                cash: 3000000000,
                enterprise_value: 559000000000,
                rd_expense: 7000000000,
                gross_profit: 22000000000,
                operating_income: 8500000000,
                ebitda: 9500000000,
                ebit: 8500000000,
                cagr: 0.15
              }
            case 'AZN':
              return {
                ...baseData,
                company_name: 'AstraZeneca PLC',
                sector: 'Healthcare',
                industry: 'Drug Manufacturers - General',
                employees: 76000,
                price: 68.45,
                market_cap: 210000000000,
                beta: 0.65,
                volume: 1500000,
                average_volume: 1800000,
                revenue: 45000000000,
                net_income: 1200000000,
                eps: 0.38,
                eps_diluted: 0.37,
                pe_ratio: 180.1,
                total_debt: 28000000000,
                cash: 8000000000,
                enterprise_value: 230000000000,
                rd_expense: 9500000000,
                gross_profit: 36000000000,
                operating_income: 6000000000,
                ebitda: 8500000000,
                ebit: 6000000000,
                cagr: 0.08
              }
            default:
              // Generic tech company data
              return {
                ...baseData,
                company_name: `${ticker} Company`,
                sector: 'Technology',
                industry: 'Software',
                employees: 50000,
                price: 100.0,
                market_cap: 5000000000,
                beta: 1.0,
                volume: 1000000,
                average_volume: 1500000,
                revenue: 20000000000,
                net_income: 2000000000,
                eps: 5.0,
                eps_diluted: 4.95,
                pe_ratio: 20.0,
                total_debt: 10000000000,
                cash: 5000000000,
                enterprise_value: 10000000000,
                rd_expense: 3000000000,
                gross_profit: 12000000000,
                operating_income: 4000000000,
                ebitda: 6000000000,
                ebit: 5000000000,
                cagr: 0.15
              }
          }
        }

        // Use real data if available, otherwise fallback to mock
        const finalFinancialData = financialData || getMockFinancialData(company.ticker || '')
        
        console.log(`Using ${financialData ? 'real' : 'mock'} financial data for ${company.name}:`, finalFinancialData)

        // Calculate analysis scores based on criteria weights
        const analysisScore = calculateAnalysisScore(finalFinancialData, criteria)
        
        // Mock data for clinical trials and molecules (to be replaced with real data)
        const getMockClinicalTrials = (ticker: string) => {
          switch (ticker.toUpperCase()) {
            case 'PFE':
              return [
                { phase: 'Phase 3', title: 'COVID-19 Vaccine Study', interventions: ['BNT162b2'], enrollment: 44000, status: 'Completed' },
                { phase: 'Phase 2', title: 'Oncology Drug Trial', interventions: ['PF-07321332'], enrollment: 200, status: 'Active' },
                { phase: 'Phase 1', title: 'Cardiovascular Study', interventions: ['PF-06882961'], enrollment: 50, status: 'Recruiting' },
                { phase: 'Phase 4', title: 'Post-Market Surveillance', interventions: ['Paxlovid'], enrollment: 10000, status: 'Active' }
              ]
            case 'MRNA':
              return [
                { phase: 'Phase 3', title: 'mRNA-1273 COVID-19 Vaccine', interventions: ['mRNA-1273'], enrollment: 30000, status: 'Completed' },
                { phase: 'Phase 2', title: 'RSV Vaccine Study', interventions: ['mRNA-1345'], enrollment: 1000, status: 'Active' },
                { phase: 'Phase 1', title: 'Influenza Vaccine', interventions: ['mRNA-1010'], enrollment: 100, status: 'Recruiting' },
                { phase: 'Phase 1', title: 'Cancer Vaccine', interventions: ['mRNA-4157'], enrollment: 20, status: 'Active' }
              ]
            case 'AAPL':
              return [
                { phase: 'Phase 1', title: 'Health App Study', interventions: ['Apple Health'], enrollment: 1000, status: 'Active' }
              ]
            case 'LLY':
              return [
                { phase: 'Phase 3', title: 'Tirzepatide Diabetes Study', interventions: ['Tirzepatide'], enrollment: 5000, status: 'Completed' },
                { phase: 'Phase 2', title: 'Alzheimer\'s Drug Trial', interventions: ['Donanemab'], enrollment: 1200, status: 'Active' },
                { phase: 'Phase 1', title: 'Obesity Treatment Study', interventions: ['Retatrutide'], enrollment: 200, status: 'Recruiting' },
                { phase: 'Phase 4', title: 'Trulicity Post-Market Study', interventions: ['Dulaglutide'], enrollment: 8000, status: 'Active' }
              ]
            case 'AZN':
              return [
                { phase: 'Phase 3', title: 'COVID-19 Vaccine Study', interventions: ['AZD1222'], enrollment: 32000, status: 'Completed' },
                { phase: 'Phase 2', title: 'Lung Cancer Treatment', interventions: ['Tagrisso'], enrollment: 800, status: 'Active' },
                { phase: 'Phase 1', title: 'Heart Disease Study', interventions: ['Brilinta'], enrollment: 150, status: 'Recruiting' },
                { phase: 'Phase 4', title: 'Diabetes Drug Surveillance', interventions: ['Farxiga'], enrollment: 5000, status: 'Active' }
              ]
            default:
              return []
          }
        }
        
        // Use real clinical trials data if available, otherwise fallback to mock
        const finalClinicalTrials = clinicalTrials.length > 0 ? clinicalTrials : getMockClinicalTrials(company.ticker || '')
        const molecules: any = null
        
        // Calculate partnerships based on company type and size
        const getPartnerships = (ticker: string, marketCap: number) => {
          const basePartnerships = Math.floor(Math.log10(marketCap) * 2) // More partnerships for larger companies
          switch (ticker.toUpperCase()) {
            case 'PFE':
              return basePartnerships + 15 // Pharmaceutical companies have many partnerships
            case 'MRNA':
              return basePartnerships + 8 // Biotech companies have moderate partnerships
            case 'AAPL':
              return basePartnerships + 12 // Tech companies have many partnerships
            case 'LLY':
              return basePartnerships + 18 // Eli Lilly has extensive partnerships
            case 'AZN':
              return basePartnerships + 16 // AstraZeneca has many partnerships
            default:
              return basePartnerships + 5
          }
        }
        
        const partnerships = getPartnerships(company.ticker || '', finalFinancialData.market_cap)
        
        // Calculate focus area fit based on company type
        const getFocusAreaFit = (ticker: string, domainTags: string[]) => {
          const focusAreas = ['oncology', 'vaccines', 'pharmaceuticals', 'biotechnology']
          const matches = domainTags.filter(tag => 
            focusAreas.some(area => tag.toLowerCase().includes(area.toLowerCase()))
          ).length
          
          // Add company-specific focus area fit
          switch (ticker.toUpperCase()) {
            case 'PFE':
              return 0.9 // High fit for pharmaceuticals
            case 'MRNA':
              return 0.95 // Very high fit for vaccines/biotech
            case 'AAPL':
              return 0.1 // Low fit for tech companies
            case 'LLY':
              return 0.92 // High fit for diabetes/Alzheimer's focus
            case 'AZN':
              return 0.88 // High fit for oncology/cardiovascular focus
            default:
              return Math.max(0.1, matches / focusAreas.length)
          }
        }
        
        const focusAreaFit = getFocusAreaFit(company.ticker || '', company.domainTags || [])
        
        // Calculate Trial Phase Mix
        const getTrialPhaseMix = (trials: any[]) => {
          if (trials.length === 0) return 0
          
          const phaseWeights = {
            'Phase 1': 1,
            'Phase 2': 2,
            'Phase 3': 3,
            'Phase 4': 4,
            'PHASE1': 1,
            'PHASE2': 2,
            'PHASE3': 3,
            'PHASE4': 4
          }
          
          const totalWeight = trials.reduce((sum, trial) => {
            const phase = trial.phase.match(/Phase \d+|PHASE\d+/)?.[0] || 'Phase 1'
            return sum + (phaseWeights[phase as keyof typeof phaseWeights] || 1)
          }, 0)
          
          return totalWeight / trials.length / 4 // Normalize to 0-1 scale
        }
        
        const trialPhaseMix = getTrialPhaseMix(finalClinicalTrials)
        
        // Calculate individual Maturity and Differentiation scores using Agentic AI
        const maturityScore = calculateMaturityScore(company, finalFinancialData, finalClinicalTrials, partnerships, focusAreaFit, trialPhaseMix)
        const differentiationScore = calculateDifferentiationScore(company, finalFinancialData, finalClinicalTrials, partnerships, focusAreaFit, trialPhaseMix)

        companyAnalyses.push({
          company,
          financial: finalFinancialData,
          clinicalTrials: finalClinicalTrials,
          molecules,
          partnerships,
          focusAreaFit,
          trialPhaseMix,
          maturityScore,
          differentiationScore,
          analysisScore // Add custom analysis score
        })
      }

      setAnalyses(companyAnalyses)
      onAnalysisComplete(companyAnalyses)
    } catch (error) {
      console.error('Error analyzing companies:', error)
    } finally {
      setIsAnalyzing(false)
    }
  }

  const calculateAnalysisScore = (financial: any, criteria: AnalysisCriteria): number => {
    let score = 0
    let totalWeight = 0

    // Partnerships score (mock calculation)
    const partnershipsScore = Math.min(100, (criteria.partnerships / 100) * 100)
    score += partnershipsScore * 0.15
    totalWeight += 0.15

    // CRO Capabilities score (based on R&D expense and market cap)
    const croScore = Math.min(100, (financial.rd_expense / 1000000000) * 50 + (financial.market_cap / 10000000000) * 50)
    score += croScore * (criteria.croCapabilities / 100)
    totalWeight += criteria.croCapabilities / 100

    // CDMO Capabilities score (based on revenue and employees)
    const cdmoScore = Math.min(100, (financial.revenue / 1000000000) * 60 + (financial.employees / 10000) * 40)
    score += cdmoScore * (criteria.cdmoCapabilities / 100)
    totalWeight += criteria.cdmoCapabilities / 100

    // CAGR score
    const cagrScore = financial.cagr ? Math.min(100, Math.max(0, financial.cagr * 10)) : 50
    score += cagrScore * (criteria.cagr / 100)
    totalWeight += criteria.cagr / 100

    // Market Cap score
    const marketCapScore = Math.min(100, (financial.market_cap / 100000000000) * 100)
    score += marketCapScore * (criteria.marketCap / 100)
    totalWeight += criteria.marketCap / 100

    // Diluted Enterprise Value score
    const devScore = Math.min(100, (financial.enterprise_value / 100000000000) * 100)
    score += devScore * (criteria.dilutedEnterpriseValue / 100)
    totalWeight += criteria.dilutedEnterpriseValue / 100

    // R&D Expense score
    const rdScore = Math.min(100, (financial.rd_expense / 1000000000) * 100)
    score += rdScore * (criteria.rdExpense / 100)
    totalWeight += criteria.rdExpense / 100

    return totalWeight > 0 ? score / totalWeight : 0
  }

  const calculateFocusAreaFit = (domainTags: string[], focusAreas: string[]): number => {
    if (!domainTags || domainTags.length === 0) return 0.5
    const matches = domainTags.filter(tag => 
      focusAreas.some(area => tag.toLowerCase().includes(area.toLowerCase()))
    ).length
    return matches / focusAreas.length
  }

  const updateCriteria = (key: keyof AnalysisCriteria, value: number) => {
    setCriteria(prev => ({ ...prev, [key]: value }))
  }

  const criteriaConfig = [
    {
      key: 'partnerships' as keyof AnalysisCriteria,
      label: 'Partnerships',
      icon: Users,
      description: 'Number of strategic partnerships and collaborations'
    },
    {
      key: 'croCapabilities' as keyof AnalysisCriteria,
      label: 'CRO Capabilities',
      icon: FlaskConical,
      description: 'Contract Research Organization capabilities and expertise'
    },
    {
      key: 'cdmoCapabilities' as keyof AnalysisCriteria,
      label: 'CDMO Capabilities',
      icon: Building2,
      description: 'Contract Development and Manufacturing Organization capabilities'
    },
    {
      key: 'cagr' as keyof AnalysisCriteria,
      label: 'CAGR',
      icon: TrendingUp,
      description: 'Compound Annual Growth Rate performance'
    },
    {
      key: 'marketCap' as keyof AnalysisCriteria,
      label: 'Market Cap',
      icon: DollarSign,
      description: 'Market capitalization and company size'
    },
    {
      key: 'dilutedEnterpriseValue' as keyof AnalysisCriteria,
      label: 'Diluted Enterprise Value',
      icon: BarChart3,
      description: 'Enterprise value including all dilutive securities'
    },
    {
      key: 'rdExpense' as keyof AnalysisCriteria,
      label: 'R&D Expense',
      icon: Target,
      description: 'Research and Development investment level'
    }
  ]

  return (
    <div className="space-y-6">
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <BarChart3 className="h-5 w-5" />
            In-Depth Analysis Criteria
          </CardTitle>
          <CardDescription>
            Adjust the importance weights for each analysis criterion. Higher values mean more importance in the final analysis.
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-6">
          {criteriaConfig.map(({ key, label, icon: Icon, description }) => (
            <div key={key} className="space-y-3">
              <div className="flex items-center gap-2">
                <Icon className="h-4 w-4 text-muted-foreground" />
                <Label className="text-sm font-medium">{label}</Label>
                <span className="text-sm text-muted-foreground">({criteria[key]}%)</span>
              </div>
              <p className="text-xs text-muted-foreground">{description}</p>
              <Slider
                value={[criteria[key]]}
                onValueChange={([value]) => updateCriteria(key, value)}
                max={100}
                min={0}
                step={5}
                className="w-full"
              />
            </div>
          ))}
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle>Analysis Summary</CardTitle>
          <CardDescription>
            {companies.length} companies selected for analysis
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="flex justify-center">
            <Button
              onClick={() => {
                console.log('Analysis button clicked, companies:', companies)
                analyzeCompanies()
              }}
              disabled={isAnalyzing || companies.length === 0}
              size="lg"
              className="flex items-center gap-2"
            >
              {isAnalyzing ? (
                <>
                  <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white"></div>
                  Analyzing Companies...
                </>
              ) : (
                <>
                  Run In-Depth Analysis
                  <ArrowRight className="h-4 w-4" />
                </>
              )}
            </Button>
          </div>
        </CardContent>
      </Card>

      {analyses.length > 0 && (
        <Card>
          <CardHeader>
            <CardTitle>Analysis Results</CardTitle>
            <CardDescription>
              Companies ranked by analysis score
            </CardDescription>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              {analyses
                .sort((a, b) => (b as any).analysisScore - (a as any).analysisScore)
                .map((analysis, index) => (
                  <div key={analysis.company.id} className="flex items-center justify-between p-4 border rounded-lg">
                    <div className="flex items-center gap-3">
                      <div className="w-8 h-8 bg-primary text-primary-foreground rounded-full flex items-center justify-center text-sm font-bold">
                        {index + 1}
                      </div>
                      <div>
                        <h3 className="font-semibold">{analysis.company.name}</h3>
                        <p className="text-sm text-muted-foreground">{analysis.company.ticker}</p>
                      </div>
                    </div>
                    <div className="text-right">
                      <div className="text-lg font-bold">
                        {((analysis as any).analysisScore || 0).toFixed(1)}%
                      </div>
                      <div className="text-xs text-muted-foreground">Analysis Score</div>
                    </div>
                  </div>
                ))}
            </div>
          </CardContent>
        </Card>
      )}
    </div>
  )
}

// Agentic AI function to calculate Maturity Score
function calculateMaturityScore(
  company: any, 
  financial: any, 
  clinicalTrials: any[], 
  partnerships: number, 
  focusAreaFit: number, 
  trialPhaseMix: number
): number {
  let score = 0
  let weight = 0

  // Revenue stability (higher revenue = more mature)
  const revenueScore = Math.min(1, Math.log10(financial.revenue + 1) / 12) // Log scale up to $1T
  score += revenueScore * 0.2
  weight += 0.2

  // Market cap (larger market cap = more mature)
  const marketCapScore = Math.min(1, Math.log10(financial.market_cap + 1) / 12)
  score += marketCapScore * 0.2
  weight += 0.2

  // Employee count (more employees = more mature)
  const employeeScore = Math.min(1, Math.log10(financial.employees + 1) / 6)
  score += employeeScore * 0.15
  weight += 0.15

  // R&D as % of revenue (lower % = more mature, but not too low)
  const rdRatio = financial.revenue > 0 ? financial.rd_expense / financial.revenue : 0
  const rdScore = rdRatio > 0 ? Math.max(0, 1 - Math.abs(rdRatio - 0.15) * 5) : 0.5
  score += rdScore * 0.15
  weight += 0.15

  // Trial phase mix (later phases = more mature)
  score += trialPhaseMix * 0.15
  weight += 0.15

  // Profitability (profitable = more mature)
  const profitScore = financial.net_income > 0 ? 1 : 0
  score += profitScore * 0.15
  weight += 0.15

  return weight > 0 ? Math.min(1, score / weight) : 0.5
}

// Agentic AI function to calculate Differentiation Score
function calculateDifferentiationScore(
  company: any, 
  financial: any, 
  clinicalTrials: any[], 
  partnerships: number, 
  focusAreaFit: number, 
  trialPhaseMix: number
): number {
  let score = 0
  let weight = 0

  // R&D intensity (higher R&D = more differentiated)
  const rdIntensity = financial.revenue > 0 ? financial.rd_expense / financial.revenue : 0
  const rdScore = Math.min(1, rdIntensity * 10) // Scale up R&D ratio
  score += rdScore * 0.25
  weight += 0.25

  // Growth rate (higher growth = more differentiated)
  const growthScore = financial.cagr ? Math.min(1, Math.max(0, financial.cagr)) : 0.5
  score += growthScore * 0.2
  weight += 0.2

  // Focus area fit (more focused = more differentiated)
  score += focusAreaFit * 0.2
  weight += 0.2

  // Trial diversity (more diverse trials = more differentiated)
  const trialDiversity = clinicalTrials.length > 0 ? 
    Math.min(1, clinicalTrials.length / 5) : 0
  score += trialDiversity * 0.15
  weight += 0.15

  // Partnership count (more partnerships = more differentiated)
  const partnershipScore = Math.min(1, partnerships / 20)
  score += partnershipScore * 0.1
  weight += 0.1

  // Innovation ratio (R&D to market cap)
  const innovationRatio = financial.market_cap > 0 ? financial.rd_expense / financial.market_cap : 0
  const innovationScore = Math.min(1, innovationRatio * 1000) // Scale up small ratios
  score += innovationScore * 0.1
  weight += 0.1

  return weight > 0 ? Math.min(1, score / weight) : 0.5
}
