import { clsx } from 'clsx';
import type { InfoTooltipProps } from './types';

// Hover/focus-only (i) badge — no click handler, no state. Pure CSS via
// group-hover/group-focus-within so it works the same for mouse and keyboard.
export default function InfoTooltip({ text, className }: InfoTooltipProps) {
  return (
    <span className={clsx('relative inline-flex group', className)}>
      <button
        type="button"
        tabIndex={0}
        aria-label={text}
        className={clsx(
          'inline-flex items-center justify-center w-4 h-4 rounded-full shrink-0',
          'text-[10px] font-bold leading-none',
          'bg-[#e2e4ed] text-[#64748b] hover:bg-[#c5c6d2]',
          'focus:outline-none focus:ring-2 focus:ring-[#435b9f]'
        )}
      >
        i
      </button>
      <span
        role="tooltip"
        className={clsx(
          'pointer-events-none absolute z-10 top-full left-1/2 -translate-x-1/2 mt-2',
          'w-56 rounded-lg bg-[#1a1b20] px-3 py-2 text-[11px] leading-snug text-white text-left normal-case font-normal',
          'opacity-0 scale-95 transition-all duration-100 origin-top',
          'group-hover:opacity-100 group-hover:scale-100 group-focus-within:opacity-100 group-focus-within:scale-100'
        )}
      >
        {text}
      </span>
    </span>
  );
}
