import { createApi } from '@reduxjs/toolkit/query/react';
import { baseQueryWithReauth } from './baseQueryWithReauth';

export const emptyApi = createApi({
  reducerPath: 'api',
  baseQuery: baseQueryWithReauth,
  tagTypes: ['Waybill', 'Identity', 'LevyConfig', 'Agent', 'AuditLog', 'Incident', 'Settlement', 'EnforcementScan', 'Org', 'SupportTicket', 'RevenueAuthority', 'RevenueRule', 'LevyLine', 'Profile', 'Commodity'],
  endpoints: () => ({}),
});
