import type { ExceptionSeverity, ExceptionStatus, JournalEntryStatus, WalletLotStatus } from '../types/usageRevenue'
import type { TagTone } from '../components/Tag'

export const LOT_STATUS_LABEL: Record<WalletLotStatus, string> = {
  active: 'Active',
  'expiring-soon': 'Expiring soon',
  expired: 'Expired',
  depleted: 'Depleted',
}

export const LOT_STATUS_TONE: Record<WalletLotStatus, TagTone> = {
  active: 'matched',
  'expiring-soon': 'mismatch',
  expired: 'neutral',
  depleted: 'neutral',
}

export const JE_STATUS_LABEL: Record<JournalEntryStatus, string> = {
  posted: 'Posted',
  pending: 'Pending',
  exception: 'Exception',
}

export const JE_STATUS_TONE: Record<JournalEntryStatus, TagTone> = {
  posted: 'matched',
  pending: 'info',
  exception: 'gap',
}

export const SEVERITY_LABEL: Record<ExceptionSeverity, string> = {
  high: 'High',
  medium: 'Medium',
  low: 'Low',
}

export const SEVERITY_TONE: Record<ExceptionSeverity, TagTone> = {
  high: 'gap',
  medium: 'mismatch',
  low: 'info',
}

export const EXCEPTION_STATUS_LABEL: Record<ExceptionStatus, string> = {
  open: 'Open',
  'in-review': 'In review',
  resolved: 'Resolved',
}

export const EXCEPTION_STATUS_TONE: Record<ExceptionStatus, TagTone> = {
  open: 'gap',
  'in-review': 'mismatch',
  resolved: 'matched',
}
