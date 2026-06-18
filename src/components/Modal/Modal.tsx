import { useEffect, useCallback } from 'react';
import { clsx } from 'clsx';
import { Button } from '@/components/Buttons';
import type { ModalProps } from './types';

const SIZE_CLASSES = {
  sm: 'max-w-sm',
  md: 'max-w-md',
  lg: 'max-w-lg',
};

export default function Modal({
  open,
  onClose,
  title,
  children,
  confirmLabel = 'Confirm',
  onConfirm,
  confirmVariant = 'primary',
  confirmLoading = false,
  cancelLabel = 'Cancel',
  size = 'md',
}: ModalProps) {
  const handleKeyDown = useCallback(
    (e: KeyboardEvent) => {
      if (e.key === 'Escape' && open) onClose();
    },
    [open, onClose]
  );

  useEffect(() => {
    document.addEventListener('keydown', handleKeyDown);
    return () => document.removeEventListener('keydown', handleKeyDown);
  }, [handleKeyDown]);

  if (!open) return null;

  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center bg-black/40"
      onClick={onClose}
      aria-modal="true"
      role="dialog"
      aria-labelledby="modal-title"
    >
      <div
        className={clsx(
          'bg-white rounded-[8px] shadow-lg w-full mx-4',
          SIZE_CLASSES[size]
        )}
        onClick={(e) => e.stopPropagation()}
      >
        {/* Header */}
        <div className="flex items-center justify-between px-6 py-4 border-b border-[#c5c6d2]">
          <h2
            id="modal-title"
            className="text-[18px] font-semibold text-[#1a1b20]"
          >
            {title}
          </h2>
          <button
            type="button"
            onClick={onClose}
            className="text-[#444650] hover:text-[#1a1b20] transition-colors p-1 rounded"
            aria-label="Close modal"
          >
            <svg
              className="w-5 h-5"
              fill="none"
              viewBox="0 0 24 24"
              stroke="currentColor"
              strokeWidth={2}
              aria-hidden="true"
            >
              <path strokeLinecap="round" strokeLinejoin="round" d="M6 18L18 6M6 6l12 12" />
            </svg>
          </button>
        </div>

        {/* Body */}
        <div className="px-6 py-4 text-[14px] text-[#1a1b20]">{children}</div>

        {/* Footer */}
        <div className="flex items-center justify-end gap-3 px-6 py-4 border-t border-[#c5c6d2]">
          <Button
            label={cancelLabel}
            variant="ghost"
            onClick={onClose}
          />
          {onConfirm && (
            <Button
              label={confirmLabel}
              variant={confirmVariant}
              onClick={onConfirm}
              loading={confirmLoading}
            />
          )}
        </div>
      </div>
    </div>
  );
}
