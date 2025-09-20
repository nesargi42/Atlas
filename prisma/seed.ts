import { PrismaClient } from '@prisma/client'

const prisma = new PrismaClient()

async function main() {
  console.log('🌱 Seeding database...')

  // Create sample companies
  const companies = [
    {
      name: 'Pfizer Inc.',
      ticker: 'PFE',
      domainTags: ['oncology', 'vaccines', 'cardiology', 'immunology']
    },
    {
      name: 'Moderna Inc.',
      ticker: 'MRNA',
      domainTags: ['mRNA', 'vaccines', 'oncology', 'rare-diseases']
    },
    {
      name: 'Johnson & Johnson',
      ticker: 'JNJ',
      domainTags: ['oncology', 'immunology', 'neuroscience', 'cardiovascular']
    },
    {
      name: 'Merck & Co.',
      ticker: 'MRK',
      domainTags: ['oncology', 'vaccines', 'infectious-diseases', 'diabetes']
    },
    {
      name: 'Gilead Sciences',
      ticker: 'GILD',
      domainTags: ['HIV', 'hepatitis', 'oncology', 'inflammatory-diseases']
    },
    {
      name: 'Amgen Inc.',
      ticker: 'AMGN',
      domainTags: ['oncology', 'cardiovascular', 'bone-health', 'nephrology']
    },
    {
      name: 'Biogen Inc.',
      ticker: 'BIIB',
      domainTags: ['neurology', 'multiple-sclerosis', 'alzheimers', 'spinal-muscular-atrophy']
    },
    {
      name: 'Regeneron Pharmaceuticals',
      ticker: 'REGN',
      domainTags: ['ophthalmology', 'oncology', 'cardiovascular', 'immunology']
    },
    {
      name: 'Vertex Pharmaceuticals',
      ticker: 'VRTX',
      domainTags: ['cystic-fibrosis', 'sickle-cell', 'pain', 'diabetes']
    },
    {
      name: 'Novartis AG',
      ticker: 'NVS',
      domainTags: ['oncology', 'immunology', 'neuroscience', 'ophthalmology']
    }
  ]

  for (const company of companies) {
    await prisma.company.upsert({
      where: { ticker: company.ticker },
      update: {},
      create: {
        ...company,
        domainTags: JSON.stringify(company.domainTags)
      }
    })
  }

  // Create default evaluation profile
  const defaultProfile = {
    name: 'Default Pharma Analysis',
    weights: JSON.stringify({
      cagr: 0.15,
      marketCap: 0.10,
      enterpriseValue: 0.10,
      rdExpense: 0.20,
      partnerships: 0.15,
      focusAreaFit: 0.20,
      trialPhaseMix: 0.10
    })
  }

  await prisma.evaluationProfile.upsert({
    where: { id: 'default-profile' },
    update: {},
    create: {
      id: 'default-profile',
      ...defaultProfile
    }
  })

  console.log('✅ Database seeded successfully!')
}

main()
  .catch((e) => {
    console.error('❌ Error seeding database:', e)
    process.exit(1)
  })
  .finally(async () => {
    await prisma.$disconnect()
  })
