import type { FormErrorProps } from './types';
export default function FormError({ message, className }: FormErrorProps) {
  return (
    <p className={`text-[14px] text-error-crimson mt-2 ${className ?? ''}`}>
      {message}
    </p>
  );
}
