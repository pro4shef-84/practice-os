// Superbill PDF generation — Phase 4
// Uses @react-pdf/renderer to generate a properly formatted superbill PDF

export interface SuperbillData {
  therapistName: string
  licenseType: string
  licenseNumber: string
  npi: string
  practiceName: string
  practiceAddress: { street: string; city: string; state: string; zip: string }
  sessionDate: string
  clientName: string
  clientDateOfBirth: string
  cptCode: string
  cptDescription: string
  diagnosisCode: string
  feeCharged: number   // in cents
  feeCollected: number // in cents
}

export async function generateSuperbillPdf(_data: SuperbillData): Promise<Buffer> {
  // TODO: implement in Phase 4
  throw new Error('generateSuperbillPdf not yet implemented')
}
