export interface Charity {
  id: string
  bnRegistrationNumber: string
  organizationName: string
  charityStatus: string
  typeOfQualifiedDonee: string
  effectiveDateOfStatus: string
  description: string
  sanction: string
  designation: string
  charityType: string
  category: string
  address: string
  city: string
  provinceTerritory: string
  country: string
  postalCode: string
  financial: FinancialData
  tags: string[]
}

export interface FinancialData {
  totalRevenue: number
  totalExpenses: number
  totalAssets: number
  totalLiabilities: number
  charitableExpenditure: number
  fundraisingExpenditure: number
  managementExpenditure: number
  fiscalYearEnd: string
}

export interface QuestionnaireAnswers {
  causes: string
  beneficiaries: string
  geography: string
  givingStyle: string
}
