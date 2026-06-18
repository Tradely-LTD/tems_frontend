export type BadgeVariant =
  | 'valid'
  | 'pending'
  | 'warning'
  | 'expired'
  | 'cancelled'
  | 'disputed'
  | 'processing'
  | 'resolved';

export interface StatusBadgeProps {
  variant: BadgeVariant;
  label?: string;
  className?: string;
}
