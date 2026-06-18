import React from 'react';
import { clsx } from 'clsx';
import type { InputProps } from './types';

const Input = React.forwardRef<HTMLInputElement, InputProps>(
  ({ id, label, error, rightAdornment, containerClassName, className, ...rest }, ref) => {
    return (
      <div className={clsx('flex flex-col gap-1', containerClassName)}>
        <label htmlFor={id} className="text-[14px] font-medium text-jet-text">
          {label}
        </label>
        <div className="relative">
          <input
            id={id}
            ref={ref}
            className={clsx(
              'w-full rounded border bg-pure-white min-h-[44px] px-3 text-[16px] text-jet-text',
              'placeholder:text-slate-mid focus:outline-none focus:ring-2 focus:ring-soft-denim focus:ring-offset-0',
              'transition-shadow',
              rightAdornment ? 'pr-10' : 'pr-3',
              error ? 'border-stop-red' : 'border-silver-border',
              className
            )}
            {...rest}
          />
          {rightAdornment && (
            <div className="absolute right-3 top-1/2 -translate-y-1/2 flex items-center">
              {rightAdornment}
            </div>
          )}
        </div>
        {error && (
          <span className="text-[14px] text-error-crimson">{error}</span>
        )}
      </div>
    );
  }
);

Input.displayName = 'Input';

export default Input;
