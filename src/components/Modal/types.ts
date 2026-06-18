import type { ReactNode } from 'react';

export interface ModalProps {
  open: boolean;
  onClose: () => void;
  title: string;
  children: ReactNode;
  confirmLabel?: string;
  onConfirm?: () => void;
  confirmVariant?: 'primary' | 'danger';
  confirmLoading?: boolean;
  cancelLabel?: string;
  size?: 'sm' | 'md' | 'lg';
}
