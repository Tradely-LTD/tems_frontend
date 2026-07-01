/**
 * @module enforcement_screens
 * @depends store/emptyApi
 * @routes /api/incidents
 */
import { emptyApi } from '@/store/emptyApi';
import type {
  IncidentListResponse,
  IncidentDetailResponse,
  CreateIncidentInput,
  UpdateIncidentStateInput,
} from './types';

const incidentApi = emptyApi.injectEndpoints({
  endpoints: (builder) => ({
    listIncidents: builder.query<IncidentListResponse, { page?: number; limit?: number } | void>({
      query: (params) => ({
        url: '/incidents',
        params: { page: params?.page ?? 1, limit: params?.limit ?? 20 },
      }),
      providesTags: [{ type: 'Incident', id: 'LIST' }],
    }),
    getIncident: builder.query<IncidentDetailResponse, string>({
      query: (id) => `/incidents/${id}`,
      providesTags: (_r, _e, id) => [{ type: 'Incident', id }],
    }),
    createIncident: builder.mutation<IncidentDetailResponse, CreateIncidentInput>({
      query: (body) => ({ url: '/incidents', method: 'POST', body }),
      invalidatesTags: [{ type: 'Incident', id: 'LIST' }],
    }),
    updateIncidentState: builder.mutation<IncidentDetailResponse, { id: string; body: UpdateIncidentStateInput }>({
      query: ({ id, body }) => ({ url: `/incidents/${id}/state`, method: 'PATCH', body }),
      invalidatesTags: (_r, _e, { id }) => [
        { type: 'Incident', id: 'LIST' },
        { type: 'Incident', id },
      ],
    }),
  }),
  overrideExisting: false,
});

export const {
  useListIncidentsQuery,
  useGetIncidentQuery,
  useCreateIncidentMutation,
  useUpdateIncidentStateMutation,
} = incidentApi;
