import type { ReactNode } from 'react';

export interface ColumnDef<T> {
  key: keyof T | string;
  header: string;
  mono?: boolean;
  render?: (row: T, index: number) => ReactNode;
  width?: string;
}

export interface TableProps<T> {
  columns: ColumnDef<T>[];
  data: T[];
  onRowClick?: (row: T) => void;
  emptyMessage?: string;
  loading?: boolean;
  className?: string;
}
