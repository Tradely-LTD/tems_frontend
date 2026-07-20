import { useRef, useState } from 'react';
import { createPortal } from 'react-dom';
import { clsx } from 'clsx';
import type { InfoTooltipProps } from './types';

// Portal to document.body rather than positioning relative to the trigger in
// place — an absolutely-positioned tooltip nested inside any ancestor with
// overflow-x-auto/hidden (e.g. a scrollable tab bar) gets silently clipped,
// since setting overflow on one axis forces the other to clip too. Rendering
// at the body level and positioning from the trigger's own bounding rect
// sidesteps that regardless of where this component is used.
export default function InfoTooltip({ text, className }: InfoTooltipProps) {
  const triggerRef = useRef<HTMLButtonElement>(null);
  const [position, setPosition] = useState<{ top: number; left: number } | null>(null);

  const show = () => {
    const rect = triggerRef.current?.getBoundingClientRect();
    if (!rect) return;
    setPosition({ top: rect.bottom + 8, left: rect.left + rect.width / 2 });
  };
  const hide = () => setPosition(null);

  return (
    <span className={clsx('inline-flex', className)}>
      <button
        ref={triggerRef}
        type="button"
        aria-label={text}
        onMouseEnter={show}
        onMouseLeave={hide}
        onFocus={show}
        onBlur={hide}
        className={clsx(
          'inline-flex items-center justify-center w-4 h-4 rounded-full shrink-0',
          'text-[10px] font-bold leading-none',
          'bg-[#e2e4ed] text-[#64748b] hover:bg-[#c5c6d2]',
          'focus:outline-none focus:ring-2 focus:ring-[#435b9f]'
        )}
      >
        i
      </button>
      {position &&
        createPortal(
          <span
            role="tooltip"
            style={{ top: position.top, left: position.left, transform: 'translateX(-50%)' }}
            className={clsx(
              'fixed z-50 pointer-events-none',
              'w-56 rounded-lg bg-[#1a1b20] px-3 py-2 text-[11px] leading-snug text-white text-left normal-case font-normal',
              'shadow-lg'
            )}
          >
            {text}
          </span>,
          document.body
        )}
    </span>
  );
}
