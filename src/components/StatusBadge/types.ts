export type BadgeVariant =
  | 'valid'
  | 'pending'
  | 'warning'
  | 'expired'
  | 'cancelled'
  | 'disputed'
  | 'processing'
  | 'resolved'
  | 'submitted';

export interface StatusBadgeProps {
  variant: BadgeVariant;
  label?: string;
  className?: string;
}
