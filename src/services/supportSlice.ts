/**
 * @module shared/services
 * @depends store/emptyApi
 * @routes /api/support
 */
import { emptyApi } from '@/store/emptyApi';

export interface TicketMessage {
  id: string;
  ticket_id: string;
  sender_id: string;
  sender_name: string | null;
  body: string;
  is_internal: boolean;
  created_at: string;
}

export interface SupportTicket {
  id: string;
  org_id: string;
  created_by: string;
  subject: string;
  category: string;
  priority: string;
  status: string;
  created_at: string;
  updated_at: string;
  messages?: TicketMessage[];
}

export interface TicketListResponse {
  success: boolean;
  data: SupportTicket[];
  meta?: { page: number; limit: number; total: number };
}

export interface TicketDetailResponse {
  success: boolean;
  data: SupportTicket & { messages: TicketMessage[] };
}

export interface CreateTicketInput {
  subject: string;
  category: string;
  priority?: string;
  body: string;
}

const supportApi = emptyApi.injectEndpoints({
  endpoints: (builder) => ({
    listTickets: builder.query<TicketListResponse, { page?: number; limit?: number; status?: string } | void>({
      query: (params) => ({
        url: '/support',
        params: { page: params?.page ?? 1, limit: params?.limit ?? 20, ...(params?.status ? { status: params.status } : {}) },
      }),
      providesTags: [{ type: 'SupportTicket', id: 'LIST' }],
    }),
    getTicket: builder.query<TicketDetailResponse, string>({
      query: (id) => `/support/${id}`,
      providesTags: (_r, _e, id) => [{ type: 'SupportTicket', id }],
    }),
    createTicket: builder.mutation<{ success: boolean; data: SupportTicket }, CreateTicketInput>({
      query: (body) => ({ url: '/support', method: 'POST', body }),
      invalidatesTags: [{ type: 'SupportTicket', id: 'LIST' }],
    }),
    addMessage: builder.mutation<{ success: boolean; data: TicketMessage }, { ticketId: string; body: string; is_internal?: boolean }>({
      query: ({ ticketId, body, is_internal = false }) => ({
        url: `/support/${ticketId}/messages`,
        method: 'POST',
        body: { body, is_internal },
      }),
      invalidatesTags: (_r, _e, { ticketId }) => [{ type: 'SupportTicket', id: ticketId }],
    }),
    updateTicketStatus: builder.mutation<{ success: boolean; data: SupportTicket }, { ticketId: string; status: string }>({
      query: ({ ticketId, status }) => ({
        url: `/support/${ticketId}/status`,
        method: 'PATCH',
        body: { status },
      }),
      invalidatesTags: (_r, _e, { ticketId }) => [
        { type: 'SupportTicket', id: 'LIST' },
        { type: 'SupportTicket', id: ticketId },
      ],
    }),
  }),
  overrideExisting: false,
});

export const {
  useListTicketsQuery,
  useGetTicketQuery,
  useCreateTicketMutation,
  useAddMessageMutation,
  useUpdateTicketStatusMutation,
} = supportApi;
