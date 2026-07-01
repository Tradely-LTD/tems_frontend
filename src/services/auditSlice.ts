/**
 * @module services (shared)
 * @depends store/emptyApi
 * @routes /api/audit
 */
import { emptyApi } from '@/store/emptyApi';

export interface AuditLog {
  id: string;
  user_id?: string;
  org_id?: string;
  action: string;
  entity_type: string;
  entity_id?: string;
  created_at: string;
}

interface AuditLogListResponse {
  success: boolean;
  data: AuditLog[];
  meta?: { page: number; limit: number; total: number };
}

interface AuditLogDetailResponse {
  success: boolean;
  data: AuditLog;
}

interface AuditListParams {
  page?: number;
  limit?: number;
}

const auditApi = emptyApi.injectEndpoints({
  endpoints: (builder) => ({
    listAuditLogs: builder.query<AuditLogListResponse, AuditListParams | void>({
      query: (params) => ({
        url: '/audit',
        params: { page: params?.page ?? 1, limit: params?.limit ?? 50 },
      }),
      providesTags: [{ type: 'AuditLog', id: 'LIST' }],
    }),
    getAuditLog: builder.query<AuditLogDetailResponse, string>({
      query: (id) => `/audit/${id}`,
      providesTags: (_r, _e, id) => [{ type: 'AuditLog', id }],
    }),
  }),
  overrideExisting: false,
});

export const { useListAuditLogsQuery, useGetAuditLogQuery } = auditApi;
