import type { KycStatus } from '../services/types';
import type { BadgeVariant } from '@/components/StatusBadge/types';

export const DOC_TYPE_LABELS: Record<string, string> = {
  national_id: 'National ID',
  drivers_licence: "Driver's Licence",
  voters_card: "Voter's Card",
  passport: 'International Passport',
};

export function kycStatusToBadge(status: KycStatus): BadgeVariant {
  switch (status) {
    case 'verified':  return 'valid';
    case 'rejected':  return 'expired';
    case 'submitted': return 'submitted';
    default:          return 'pending';
  }
}

/**
 * Always masks a sensitive value — shows last 4 characters only.
 * Used by admin views where the admin is NOT the owner.
 */
export function maskSensitiveValue(value: string | null | undefined): string {
  if (!value) return '—';
  if (value.length <= 4) return '•'.repeat(value.length);
  return '•'.repeat(value.length - 4) + value.slice(-4);
}
