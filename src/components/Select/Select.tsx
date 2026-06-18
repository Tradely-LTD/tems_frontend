import { clsx } from 'clsx';
import type { SelectProps } from './types';

export default function Select({
  id,
  label,
  options,
  value,
  onChange,
  placeholder,
  error,
  disabled = false,
  className,
}: SelectProps) {
  return (
    <div className="flex flex-col gap-1">
      <label htmlFor={id} className="text-[14px] font-medium text-jet-text">
        {label}
      </label>
      <select
        id={id}
        value={value}
        onChange={(e) => onChange(e.target.value)}
        disabled={disabled}
        className={clsx(
          'w-full rounded border bg-pure-white min-h-[44px] px-3 text-[16px] text-[#444650]',
          'focus:outline-none focus:ring-2 focus:ring-[#435b9f] focus:ring-offset-0',
          'transition-shadow appearance-none cursor-pointer',
          'disabled:bg-[#f4f3f9] disabled:cursor-not-allowed disabled:text-[#475569]',
          error ? 'border-[#D83B01]' : 'border-[#c5c6d2]',
          className
        )}
        style={{
          backgroundImage: `url("data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' fill='none' viewBox='0 0 24 24' stroke='%23444650' stroke-width='2'%3E%3Cpath stroke-linecap='round' stroke-linejoin='round' d='M19 9l-7 7-7-7'/%3E%3C/svg%3E")`,
          backgroundRepeat: 'no-repeat',
          backgroundPosition: 'right 12px center',
          backgroundSize: '16px',
          paddingRight: '36px',
        }}
      >
        {placeholder && (
          <option value="" disabled>
            {placeholder}
          </option>
        )}
        {options.map((opt) => (
          <option key={opt.value} value={opt.value}>
            {opt.label}
          </option>
        ))}
      </select>
      {error && <span className="text-[14px] text-[#D83B01]">{error}</span>}
    </div>
  );
}
