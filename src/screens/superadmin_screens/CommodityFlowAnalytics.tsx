/**
 * @module superadmin_screens
 * @depends services/analyticsSlice (commodity-flow endpoint)
 * @routes GET /analytics/commodity-flow
 */
import { useState, useMemo } from 'react';
import { emptyApi } from '@/store/emptyApi';
import { NIGERIAN_STATE_NAMES, getLgasForState } from '@/constants/nigeria';
import { useAppSelector } from '@/hooks/useAppSelector';
import { useGetOrgQuery } from './services/orgSlice';
import { useGetStatesQuery } from '@/screens/auth_screens/services/locationSlice';

interface CommodityFlowItem {
  commodity_code: string;
  commodity_name: string;
  total_waybills:  number;
  total_weight_kg: number;
  origin_state:    string;
  destination_state: string;
  period: string;
}

interface CommodityFlowResponse {
  success: boolean;
  data: CommodityFlowItem[];
  meta?: { total: number };
}

type FlowDirection = 'outbound' | 'inbound' | 'all';

interface CommodityFlowParams {
  state?:           string;
  lga?:             string;
  direction?:       FlowDirection;
  commodity_code?:  string;
  from?:            string;
  to?:              string;
}

const commodityFlowApi = emptyApi.injectEndpoints({
  endpoints: (builder) => ({
    getCommodityFlow: builder.query<CommodityFlowResponse, CommodityFlowParams | void>({
      query: (params) => ({
        url:    '/analytics/commodity-flow',
        params: params ?? {},
      }),
    }),
  }),
  overrideExisting: false,
});
const { useGetCommodityFlowQuery } = commodityFlowApi;

export default function CommodityFlowAnalytics() {
  const today     = new Date().toISOString().split('T')[0];
  const thirtyAgo = new Date(Date.now() - 30 * 86400000).toISOString().split('T')[0];

  const user         = useAppSelector((s) => s.auth.user);
  const isStateAdmin = user?.role_name === 'StateAdmin';

  const { data: orgData }    = useGetOrgQuery(user?.org_id ?? '', { skip: !isStateAdmin || !user?.org_id });
  const { data: statesData } = useGetStatesQuery(undefined, { skip: !isStateAdmin });

  const adminStateId   = orgData?.data?.state_id;
  const adminStateName = statesData?.data?.find((s) => s.id === adminStateId)?.name ?? '';

  const [state,     setState]     = useState('');
  const [lga,       setLga]       = useState('');
  const [direction, setDirection] = useState<FlowDirection>('all');
  const [code,      setCode]      = useState('');
  const [from,      setFrom]      = useState(thirtyAgo);
  const [to,        setTo]        = useState(today);
  const [sortCol,   setSortCol]   = useState<keyof CommodityFlowItem>('total_waybills');
  const [sortDir,   setSortDir]   = useState<'asc'|'desc'>('desc');

  // StateAdmin is always scoped to their own state — never let it bleed to "All"
  const effectiveState = isStateAdmin ? adminStateName : state;

  const params: CommodityFlowParams = {
    ...(effectiveState ? { state: effectiveState }     : {}),
    ...(effectiveState ? { direction }                 : {}),
    ...(lga            ? { lga }                       : {}),
    ...(code           ? { commodity_code: code }      : {}),
    ...(from           ? { from }                      : {}),
    ...(to             ? { to }                        : {}),
  };

  const { data, isLoading, isError, isFetching } = useGetCommodityFlowQuery(params);

  const lgaOptions = useMemo(() => getLgasForState(effectiveState), [effectiveState]);

  function handleStateChange(value: string) {
    setState(value);
    setLga('');
    if (!value) setDirection('all');
  }

  const rows = useMemo(() => {
    const list = data?.data ?? [];
    return [...list].sort((a, b) => {
      const av = a[sortCol] as string | number;
      const bv = b[sortCol] as string | number;
      if (typeof av === 'number' && typeof bv === 'number') {
        return sortDir === 'asc' ? av - bv : bv - av;
      }
      return sortDir === 'asc'
        ? String(av).localeCompare(String(bv))
        : String(bv).localeCompare(String(av));
    });
  }, [data, sortCol, sortDir]);

  const totalWaybills = rows.reduce((s, r) => s + r.total_waybills, 0);
  const totalWeight   = rows.reduce((s, r) => s + r.total_weight_kg, 0);
  const uniqueCodes   = new Set(rows.map((r) => r.commodity_code)).size;

  function toggleSort(col: keyof CommodityFlowItem) {
    if (sortCol === col) setSortDir((d) => d === 'asc' ? 'desc' : 'asc');
    else { setSortCol(col); setSortDir('desc'); }
  }

  function SortIcon({ col }: { col: keyof CommodityFlowItem }) {
    if (sortCol !== col) return <span className="ml-1 opacity-30">↕</span>;
    return <span className="ml-1">{sortDir === 'asc' ? '↑' : '↓'}</span>;
  }

  return (
    <div className="max-w-[1280px] mx-auto space-y-6">

      <div>
        <h1 className="text-[22px] font-bold text-[#1a1b20]">Commodity Outflow Analytics</h1>
        <p className="text-[13px] text-[#64748b] mt-0.5">Track commodity movement by state, LGA, and commodity type</p>
      </div>

      {/* Filters */}
      <div className="bg-white rounded-xl border border-[#e2e4ed] p-5">
        <div className="flex items-center justify-between mb-3">
          <p className="text-[12px] font-semibold text-[#64748b] uppercase tracking-wide">Filters</p>
          {isStateAdmin && adminStateName && (
            <span className="text-[11px] font-semibold px-2.5 py-1 rounded-full bg-[#e8edf7] text-[#002366]">
              Scoped to {adminStateName}
            </span>
          )}
        </div>
        {effectiveState && (
          <div className="flex items-center gap-1 bg-[#f1f3f9] p-1 rounded-lg w-fit mb-3">
            {(['all', 'outbound', 'inbound'] as FlowDirection[]).map((d) => (
              <button
                key={d}
                onClick={() => { setDirection(d); setLga(''); }}
                className={`text-[11px] font-semibold px-3 py-1 rounded-md capitalize transition-colors ${
                  direction === d ? 'bg-white text-[#1a1b20] shadow-sm' : 'text-[#64748b] hover:text-[#1a1b20]'
                }`}
              >
                {d === 'all' ? 'All flows' : d === 'outbound' ? '↑ Outbound' : '↓ Inbound'}
              </button>
            ))}
          </div>
        )}

        <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-5 gap-3">

          {!isStateAdmin && (
            <div>
              <label className="block text-[11px] font-medium text-[#64748b] mb-1">State</label>
              <select value={state} onChange={(e) => handleStateChange(e.target.value)}
                className="w-full border border-[#c5c6d2] rounded-lg px-2.5 py-2 text-[12px] bg-white focus:outline-none focus:ring-2 focus:ring-[#435b9f]">
                <option value="">All States</option>
                {NIGERIAN_STATE_NAMES.map((s) => <option key={s} value={s}>{s}</option>)}
              </select>
            </div>
          )}

          <div>
            <label className="block text-[11px] font-medium text-[#64748b] mb-1">
              {direction === 'inbound' ? 'Destination LGA' : 'Origin LGA'}
            </label>
            <select value={lga} onChange={(e) => setLga(e.target.value)} disabled={!effectiveState || direction === 'all'}
              className="w-full border border-[#c5c6d2] rounded-lg px-2.5 py-2 text-[12px] bg-white focus:outline-none focus:ring-2 focus:ring-[#435b9f] disabled:bg-[#f8f9fc] disabled:text-[#94a3b8]">
              <option value="">{!effectiveState ? 'Select a state first' : direction === 'all' ? 'Pick outbound or inbound' : 'All LGAs'}</option>
              {lgaOptions.map((l) => <option key={l.name} value={l.name}>{l.name}</option>)}
            </select>
          </div>

          <div>
            <label className="block text-[11px] font-medium text-[#64748b] mb-1">Commodity Code</label>
            <input value={code} onChange={(e) => setCode(e.target.value.toUpperCase())}
              placeholder="e.g. MAIZE-001"
              className="w-full border border-[#c5c6d2] rounded-lg px-2.5 py-2 text-[12px] font-mono focus:outline-none focus:ring-2 focus:ring-[#435b9f]" />
          </div>

          <div>
            <label className="block text-[11px] font-medium text-[#64748b] mb-1">From</label>
            <input type="date" value={from} onChange={(e) => setFrom(e.target.value)}
              className="w-full border border-[#c5c6d2] rounded-lg px-2.5 py-2 text-[12px] focus:outline-none focus:ring-2 focus:ring-[#435b9f]" />
          </div>

          <div>
            <label className="block text-[11px] font-medium text-[#64748b] mb-1">To</label>
            <input type="date" value={to} onChange={(e) => setTo(e.target.value)}
              className="w-full border border-[#c5c6d2] rounded-lg px-2.5 py-2 text-[12px] focus:outline-none focus:ring-2 focus:ring-[#435b9f]" />
          </div>

        </div>
        {((!isStateAdmin && state) || lga || code) && (
          <button
            onClick={() => { if (!isStateAdmin) setState(''); setLga(''); setCode(''); }}
            className="mt-3 text-[11px] text-[#435b9f] hover:underline"
          >
            Clear filters
          </button>
        )}
      </div>

      {/* KPI strip */}
      <div className="grid grid-cols-3 gap-4">
        {[
          { label: 'Total Waybills',      value: totalWaybills.toLocaleString(),                    color: '#002366', bg: '#e8edf7' },
          { label: 'Total Weight (kg)',   value: totalWeight.toLocaleString(undefined, { maximumFractionDigits: 0 }), color: '#096c4b', bg: '#e6f4ef' },
          { label: 'Unique Commodities',  value: uniqueCodes.toString(),                             color: '#0369a1', bg: '#e0f2fe' },
        ].map((k) => (
          <div key={k.label} className="rounded-xl border border-[#e2e4ed] p-5" style={{ backgroundColor: k.bg }}>
            <p className="text-[11px] font-semibold uppercase tracking-wide text-[#64748b]">{k.label}</p>
            <p className="text-[28px] font-bold mt-1 tabular-nums" style={{ color: k.color }}>
              {isLoading ? '…' : k.value}
            </p>
          </div>
        ))}
      </div>

      {/* Table */}
      <div className="bg-white rounded-xl border border-[#e2e4ed] overflow-hidden">
        {(isLoading || isFetching) && (
          <div className="py-12 text-center text-[#94a3b8] text-[13px]">
            {isFetching && !isLoading ? 'Updating…' : 'Loading…'}
          </div>
        )}
        {isError && (
          <div className="py-12 text-center text-[#dc2626] text-[13px]">Failed to load commodity flow data.</div>
        )}
        {!isLoading && !isError && (
          <table className="w-full text-[12px]">
            <thead className="bg-[#f8f9fc] border-b border-[#e2e4ed]">
              <tr>
                {([
                  ['commodity_code',    'Commodity Code'],
                  ['commodity_name',    'Name'],
                  ['origin_state',      'Origin State'],
                  ['destination_state', 'Destination'],
                  ['total_waybills',    'Waybills'],
                  ['total_weight_kg',   'Weight (kg)'],
                  ['period',            'Period'],
                ] as [keyof CommodityFlowItem, string][]).map(([col, label]) => (
                  <th key={col}
                    onClick={() => toggleSort(col)}
                    className="text-left font-semibold text-[#64748b] px-4 py-3 cursor-pointer hover:text-[#1a1b20] select-none whitespace-nowrap"
                  >
                    {label}<SortIcon col={col} />
                  </th>
                ))}
              </tr>
            </thead>
            <tbody>
              {rows.map((row, i) => (
                <tr key={i} className="border-b border-[#f1f3f9] last:border-0 hover:bg-[#fafbfd]">
                  <td className="px-4 py-3 font-mono font-semibold text-[#002366]">{row.commodity_code}</td>
                  <td className="px-4 py-3 text-[#1a1b20] font-medium">{row.commodity_name}</td>
                  <td className="px-4 py-3 text-[#64748b]">{row.origin_state}</td>
                  <td className="px-4 py-3 text-[#64748b]">{row.destination_state}</td>
                  <td className="px-4 py-3 font-semibold text-[#1a1b20] tabular-nums">{row.total_waybills.toLocaleString()}</td>
                  <td className="px-4 py-3 text-[#1a1b20] tabular-nums">
                    {row.total_weight_kg.toLocaleString(undefined, { maximumFractionDigits: 1 })}
                  </td>
                  <td className="px-4 py-3 text-[#94a3b8]">{row.period}</td>
                </tr>
              ))}
              {rows.length === 0 && (
                <tr>
                  <td colSpan={7} className="py-12 text-center text-[#94a3b8]">
                    No data for the selected filters.
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        )}
      </div>

    </div>
  );
}
