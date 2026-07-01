/**
 * @module services (shared)
 * @depends store/emptyApi
 * @routes /api/analytics
 */
import { emptyApi } from '@/store/emptyApi';

export interface AnalyticsSummary {
  period: string;
  from: string;
  to: string;
  total_waybills: number;
  total_revenue: number;
  by_status: Record<string, number>;
  outbound_waybills?: number;
  inbound_waybills?: number;
}

export interface AnalyticsSummaryParams {
  period?: 'today' | 'week' | 'month';
  org_id?: string;
  state_id?: string;
}

export interface LgaBreakdownRow {
  lga: string;
  waybill_count: number;
  total_levy: number;
  pct: number;
}

export interface CorridorRow {
  origin_state: string;
  destination_state: string;
  waybill_count: number;
  direction: 'outbound' | 'inbound';
  top_commodity: string | null;
}

export interface MarketRow {
  market: string;
  origin_lga: string;
  waybill_count: number;
  top_commodity: string | null;
}

export interface StateAnalyticsParams {
  state_id: string;
  period?: 'today' | 'week' | 'month';
  limit?: number;
}

interface AnalyticsSummaryResponse {
  success: boolean;
  data: AnalyticsSummary;
}

interface LgaBreakdownResponse {
  success: boolean;
  data: LgaBreakdownRow[];
}

interface CorridorsResponse {
  success: boolean;
  data: CorridorRow[];
}

interface MarketsResponse {
  success: boolean;
  data: MarketRow[];
}

const analyticsApi = emptyApi.injectEndpoints({
  endpoints: (builder) => ({
    getAnalyticsSummary: builder.query<AnalyticsSummaryResponse, AnalyticsSummaryParams | void>({
      query: (params) => ({ url: '/analytics/summary', params: params ?? {} }),
    }),
    getLgaBreakdown: builder.query<LgaBreakdownResponse, StateAnalyticsParams>({
      query: ({ state_id, period }) => ({
        url: '/analytics/lga-breakdown',
        params: { state_id, period: period ?? 'month' },
      }),
    }),
    getStateCorridors: builder.query<CorridorsResponse, StateAnalyticsParams>({
      query: ({ state_id, period, limit }) => ({
        url: '/analytics/corridors',
        params: { state_id, period: period ?? 'month', limit: limit ?? 8 },
      }),
    }),
    getStateMarkets: builder.query<MarketsResponse, StateAnalyticsParams>({
      query: ({ state_id, period, limit }) => ({
        url: '/analytics/markets',
        params: { state_id, period: period ?? 'month', limit: limit ?? 10 },
      }),
    }),
  }),
  overrideExisting: false,
});

export const {
  useGetAnalyticsSummaryQuery,
  useGetLgaBreakdownQuery,
  useGetStateCorridorsQuery,
  useGetStateMarketsQuery,
} = analyticsApi;
