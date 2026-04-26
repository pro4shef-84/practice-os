// SimplePractice CSV parser — Phase 6
// Parses the two CSV exports available from SimplePractice:
// 1. Client list export
// 2. Session history export

import type { Database } from '@/lib/types/database.types'

type ClientInsert = Database['public']['Tables']['clients']['Insert']
type SessionInsert = Database['public']['Tables']['sessions']['Insert']

export function parseSPClientsCsv(_csv: string): Partial<ClientInsert>[] {
  // TODO: implement in Phase 6
  // SP client CSV headers: Client ID, First Name, Last Name, Email, Phone, DOB, Status
  throw new Error('parseSPClientsCsv not yet implemented')
}

export function parseSPSessionsCsv(_csv: string): Partial<SessionInsert>[] {
  // TODO: implement in Phase 6
  // SP session CSV headers: Client ID, Session Date, Duration, Status, CPT Code, Fee Charged, Fee Collected
  throw new Error('parseSPSessionsCsv not yet implemented')
}
