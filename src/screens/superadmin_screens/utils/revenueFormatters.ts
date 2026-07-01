/**
 * Decimal columns from the API are inconsistent across endpoints:
 *  - /rules/preview: rate/amount are plain JS numbers (computed in-memory)
 *  - GET /levy-lines, persisted rule rows: decimal columns serialize as strings
 * Always normalize through this helper before doing math or formatting.
 */
export function toNumber(value: string | number | null | undefined): number {
  if (value === null || value === undefined || value === '') return 0;
  const n = typeof value === 'number' ? value : Number(value);
  return Number.isFinite(n) ? n : 0;
}

export function formatNGN(value: string | number | null | undefined): string {
  return '₦' + toNumber(value).toLocaleString('en-NG', { minimumFractionDigits: 2 });
}

export function formatRate(value: string | number | null | undefined): string {
  const n = toNumber(value);
  return n.toLocaleString('en-NG', { maximumFractionDigits: 4 });
}
