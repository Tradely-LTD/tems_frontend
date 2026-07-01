/**
 * Acceptance Tests — WaybillDetail "Revenue Authority Disbursement" section
 *
 * AC-01  Renders per-authority disbursement rows from the new levy-lines endpoint
 * AC-02  Shows an empty-state message when there are no levy lines
 * AC-03  Shows a loading message while levy lines are fetching
 * AC-04  Shows an error message when the levy lines query fails
 */

import React from 'react';
import { describe, it, expect, vi, beforeEach } from 'vitest';
import { render, screen } from '@testing-library/react';
import { Provider } from 'react-redux';
import { configureStore } from '@reduxjs/toolkit';
import { MemoryRouter, Route, Routes } from 'react-router-dom';
import { authReducer } from '@/screens/auth_screens/services/authSlice';
import { emptyApi } from '@/store/emptyApi';
import type { Waybill } from '../services/types';
import type { WaybillLevyLine } from '@/screens/superadmin_screens/services/types';

let detailState: { data?: unknown; isLoading: boolean; error?: unknown } = {
  data: undefined,
  isLoading: false,
  error: undefined,
};

let levyLinesState: { data?: unknown; isLoading: boolean; isError: boolean } = {
  data: undefined,
  isLoading: false,
  isError: false,
};

const sampleWaybill: Waybill = {
  waybill_id: 'WB-2024-0001',
  org_id: 'org-1',
  created_by: 'u-1',
  vehicle_reg: 'KN-123-AB',
  origin_state: 'Kano',
  origin_lga: 'Dawakin Tofa',
  destination_state: 'Lagos',
  destination_lga: 'Ikeja',
  departure_date: '2024-01-01',
  commodity_code: 'MAIZE',
  total_declared_value: '50000.00',
  levy_total: '1750.00',
  levy_breakdown: [],
  data_fee: '1500.00',
  escrow_enabled: false,
  payment_status: 'success',
  shipment_status: 'in_transit',
  incident_status: 'none',
  channel: 'web',
  expires_at: '2024-02-01T00:00:00Z',
  generated_at: '2024-01-01T00:00:00Z',
  created_at: '2024-01-01T00:00:00Z',
  updated_at: '2024-01-01T00:00:00Z',
};

const sampleLevyLine: WaybillLevyLine = {
  id: 'line-1',
  waybill_id: 'WB-2024-0001',
  authority_id: 'auth-1',
  authority_code: 'KN-LGA-001',
  authority_name: 'Kano LGA Trade Office',
  basis: 'per_kg',
  rate: '2.5000',
  amount: '250.00',
  disb_status: 'pending',
  created_at: '2024-01-01T00:00:00Z',
};

vi.mock('../services/waybillSlice', () => ({
  useGetWaybillQuery: () => detailState,
}));

vi.mock('@/screens/superadmin_screens/services/revenueRulesSlice', () => ({
  useGetWaybillLevyLinesQuery: () => levyLinesState,
}));

function makeStore() {
  return configureStore({
    reducer: {
      [emptyApi.reducerPath]: emptyApi.reducer,
      auth: authReducer,
    },
    preloadedState: {
      auth: {
        access_token: 'test-token',
        refresh_token: 'test-refresh',
        phone_confirmed: true,
        user: {
          id: 'u-1',
          email: 'admin@test.com',
          phone: '+2348000000000',
          full_name: 'Test User',
          status: 'active',
          org_id: 'org-1',
          role_id: 'r-1',
          role_name: 'SuperAdmin',
          phone_verified: true,
        },
      },
    },
    middleware: (gDM) => gDM({ serializableCheck: false }).concat(emptyApi.middleware),
  });
}

import WaybillDetail from '../WaybillDetail';

function renderScreen() {
  return render(
    <Provider store={makeStore()}>
      <MemoryRouter initialEntries={['/dashboard/waybills/WB-2024-0001']}>
        <Routes>
          <Route path="/dashboard/waybills/:waybillId" element={<WaybillDetail />} />
        </Routes>
      </MemoryRouter>
    </Provider>
  );
}

beforeEach(() => {
  detailState = { data: { success: true, data: sampleWaybill }, isLoading: false, error: undefined };
  levyLinesState = { data: { success: true, data: [sampleLevyLine] }, isLoading: false, isError: false };
});

describe('AC-01: Renders per-authority disbursement rows', () => {
  it('shows the authority name, code, and formatted amount', () => {
    renderScreen();
    expect(screen.getByText('Revenue Authority Disbursement')).toBeInTheDocument();
    expect(screen.getByText(/Kano LGA Trade Office/)).toBeInTheDocument();
    expect(screen.getByText(/KN-LGA-001/)).toBeInTheDocument();
    expect(screen.getByText('₦250.00')).toBeInTheDocument();
    expect(screen.getByText('pending')).toBeInTheDocument();
  });
});

describe('AC-02: Empty state', () => {
  it('shows an empty-state message when there are no levy lines', () => {
    levyLinesState = { data: { success: true, data: [] }, isLoading: false, isError: false };
    renderScreen();
    expect(screen.getByText(/No disbursement lines recorded/i)).toBeInTheDocument();
  });
});

describe('AC-03: Loading state', () => {
  it('shows a loading message while levy lines are fetching', () => {
    levyLinesState = { data: undefined, isLoading: true, isError: false };
    renderScreen();
    expect(screen.getByText(/Loading disbursement breakdown/i)).toBeInTheDocument();
  });
});

describe('AC-04: Error state', () => {
  it('shows an error message when the levy lines query fails', () => {
    levyLinesState = { data: undefined, isLoading: false, isError: true };
    renderScreen();
    expect(screen.getByText(/Failed to load disbursement breakdown/i)).toBeInTheDocument();
  });
});
