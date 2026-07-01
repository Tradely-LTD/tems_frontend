import { emptyApi } from '@/store/emptyApi';

interface LocationItem { id: string; name: string; }
interface LocationListResponse { success: boolean; data: LocationItem[]; }

const locationApi = emptyApi.injectEndpoints({
  endpoints: (builder) => ({
    getStates: builder.query<LocationListResponse, void>({
      query: () => '/locations/states',
    }),
    getLgas: builder.query<LocationListResponse, string>({
      query: (stateId) => `/locations/lgas?state_id=${stateId}`,
    }),
  }),
  overrideExisting: false,
});

export const { useGetStatesQuery, useGetLgasQuery } = locationApi;
