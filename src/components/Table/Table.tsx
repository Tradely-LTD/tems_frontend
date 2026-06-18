import { clsx } from 'clsx';
import type { TableProps } from './types';

function getCellValue<T>(row: T, key: string): unknown {
  return (row as Record<string, unknown>)[key];
}

export default function Table<T>({
  columns,
  data,
  onRowClick,
  emptyMessage = 'No records found.',
  loading = false,
  className,
}: TableProps<T>) {
  const skeletonRows = Array.from({ length: 5 });

  return (
    <div className={clsx('w-full overflow-x-auto', className)}>
      <table className="w-full border-collapse">
        <thead>
          <tr className="border-b border-[#c5c6d2]">
            {columns.map((col) => (
              <th
                key={String(col.key)}
                className={clsx(
                  'px-4 py-3 text-left text-[12px] font-bold tracking-[0.05em] uppercase text-[#444650]',
                  col.width
                )}
              >
                {col.header}
              </th>
            ))}
          </tr>
        </thead>
        <tbody>
          {loading ? (
            skeletonRows.map((_, i) => (
              <tr key={i} className={i % 2 === 0 ? 'bg-white' : 'bg-[#faf8ff]'}>
                {columns.map((col) => (
                  <td key={String(col.key)} className="px-4 py-3">
                    <div className="h-4 bg-[#c5c6d2] rounded animate-pulse" />
                  </td>
                ))}
              </tr>
            ))
          ) : data.length === 0 ? (
            <tr>
              <td
                colSpan={columns.length}
                className="px-4 py-10 text-center text-[14px] text-[#444650]"
              >
                {emptyMessage}
              </td>
            </tr>
          ) : (
            data.map((row, rowIdx) => (
              <tr
                key={rowIdx}
                className={clsx(
                  rowIdx % 2 === 0 ? 'bg-white' : 'bg-[#faf8ff]',
                  'hover:bg-[#002366]/5 transition-colors',
                  onRowClick && 'cursor-pointer'
                )}
                onClick={() => onRowClick?.(row)}
              >
                {columns.map((col) => {
                  const rawValue = getCellValue(row, String(col.key));
                  return (
                    <td
                      key={String(col.key)}
                      className={clsx(
                        'px-4 py-3 text-[14px] text-[#1a1b20]',
                        col.mono && 'font-mono'
                      )}
                    >
                      {col.render
                        ? col.render(row, rowIdx)
                        : rawValue !== undefined && rawValue !== null
                        ? String(rawValue)
                        : '—'}
                    </td>
                  );
                })}
              </tr>
            ))
          )}
        </tbody>
      </table>
    </div>
  );
}
