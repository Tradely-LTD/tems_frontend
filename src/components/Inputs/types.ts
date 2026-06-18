import type { InputHTMLAttributes } from 'react';
export interface InputProps extends InputHTMLAttributes<HTMLInputElement> {
  id: string;
  label: string;
  error?: string;
  rightAdornment?: React.ReactNode;
  containerClassName?: string;
}
