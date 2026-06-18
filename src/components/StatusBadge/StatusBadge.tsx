import { clsx } from 'clsx';
import type { StatusBadgeProps, BadgeVariant } from './types';

const DEFAULT_LABELS: Record<BadgeVariant, string> = {
  valid: 'VALID',
  pending: 'PENDING',
  processing: 'PROCESSING',
  warning: 'WARNING',
  expired: 'EXPIRED',
  cancelled: 'CANCELLED',
  disputed: 'DISPUTED',
  resolved: 'RESOLVED',
};

const VARIANT_STYLES: Record<BadgeVariant, string> = {
  valid: 'bg-[#9ff4c9] text-[#002114]',
  pending: 'bg-[rgba(241,196,15,0.15)] text-[#0F172A]',
  processing: 'bg-[rgba(241,196,15,0.15)] text-[#0F172A]',
  warning: 'bg-[rgba(241,196,15,0.15)] text-[#0F172A]',
  expired: 'bg-[rgba(186,26,26,0.15)] text-[#ba1a1a]',
  cancelled: 'bg-[#c5c6d2] text-[#444650]',
  disputed: 'bg-[rgba(241,196,15,0.15)] text-[#0F172A]',
  resolved: 'bg-[#9ff4c9] text-[#002114]',
};

export function shipmentStatusToBadge(status: string): BadgeVariant {
  const map: Record<string, BadgeVariant> = {
    active: 'valid',
    valid: 'valid',
    delivered: 'valid',
    resolved: 'resolved',
    draft: 'pending',
    pending: 'pending',
    in_transit: 'processing',
    processing: 'processing',
    warning: 'warning',
    expired: 'expired',
    cancelled: 'cancelled',
    disputed: 'disputed',
  };
  return map[status?.toLowerCase()] ?? 'pending';
}

export default function StatusBadge({ variant, label, className }: StatusBadgeProps) {
  const displayLabel = label ?? DEFAULT_LABELS[variant];

  return (
    <span
      className={clsx(
        'inline-flex items-center px-2 h-6 rounded-[8px]',
        'text-[12px] font-bold tracking-[0.05em] uppercase whitespace-nowrap',
        VARIANT_STYLES[variant],
        className
      )}
    >
      {displayLabel}
    </span>
  );
}
