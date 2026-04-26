// SimplePractice → Practice OS field mapping constants — Phase 6

export const SP_SESSION_STATUS_MAP: Record<string, string> = {
  'Attended': 'completed',
  'Cancelled': 'cancelled',
  'No Show': 'no_show',
  'Late Cancelled': 'late_cancel',
  'Scheduled': 'scheduled',
}

export const SP_CPT_CODE_MAP: Record<string, string> = {
  'Individual Therapy - 60 min': '90837',
  'Individual Therapy - 45 min': '90834',
  'Individual Therapy - 30 min': '90832',
  'Initial Assessment': '90791',
}
