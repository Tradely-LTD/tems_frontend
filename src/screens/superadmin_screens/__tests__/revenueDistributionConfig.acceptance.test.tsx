/**
 * Acceptance Tests — Revenue Distribution Config frontend module
 *
 * AC-01  Users without read permission see a permission-denied message
 * AC-02  Authorities tab lists authorities returned by the query
 * AC-03  Loading state shown while authorities are fetching
 * AC-04  Error state shown when authorities query fails
 * AC-05  "Onboard Stakeholder" button only shown for manage-permitted roles
 * AC-06  Switching to Rules tab renders rules from the query
 * AC-07  Switching to Preview tab and submitting renders the fee breakdown
 * AC-08  Read-only roles (e.g. Auditor) do not see manage actions
 */

import React from 'react';
import { describe, it, expect, vi, beforeEach } from 'vitest';
import { render, screen, waitFor } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { Provider } from 'react-redux';
import { configureStore } from '@reduxjs/toolkit';
import { MemoryRouter } from 'react-router-dom';
import { authReducer } from '@/screens/auth_screens/services/authSlice';
import { emptyApi } from '@/store/emptyApi';
import type { RevenueAuthority, RevenueRule, PreviewRulesResult } from '../services/types';

// ─── RTK Query hook state that each test controls ─────────────────────────────

let authoritiesState: { isFetching: boolean; isError: boolean; data?: unknown } = {
  isFetching: false,
  isError: false,
  data: undefined,
};

let rulesState: { isFetching: boolean; isError: boolean; data?: unknown } = {
  isFetching: false,
  isError: false,
  data: undefined,
};

let previewResolvedValue: { success: boolean; data: PreviewRulesResult } = {
  success: true,
  data: { levy_lines: [], data_fee: 1500, total: 1500 },
};

const sampleAuthority: RevenueAuthority = {
  id: 'auth-1',
  authority_code: 'KN-LGA-001',
  authority_name: 'Kano LGA Trade Office',
  tier: 'lga',
  state: 'Kano',
  lga: 'Dawakin Tofa',
  bank_name: 'First Bank',
  bank_code: '011',
  is_active: true,
  jrb_verified: false,
  stakeholder_type: 'lga',
  settlement_type: 'bank_transfer',
  nibss_verified: true,
  account_last4: '6789',
  created_at: '2024-01-01T00:00:00Z',
  updated_at: '2024-01-01T00:00:00Z',
};

const sampleRule: RevenueRule = {
  id: 'rule-1',
  authority_id: 'auth-1',
  scope: 'lga',
  state_name: 'Kano',
  lga_name: 'Dawakin Tofa',
  commodity_code: 'MAIZE',
  basis: 'per_kg',
  rate: '2.5000',
  effective_from: '2024-01-01T00:00:00Z',
  status: 'active',
  created_by: 'u-1',
  created_at: '2024-01-01T00:00:00Z',
  updated_at: '2024-01-01T00:00:00Z',
};

vi.mock('../services/revenueRulesSlice', () => ({
  useListAuthoritiesQuery: () => authoritiesState,
  useListRulesQuery: () => rulesState,
  useDeactivateAuthorityMutation: () => [vi.fn(() => ({ unwrap: () => Promise.resolve({}) })), { isLoading: false }],
  usePreviewRulesMutation: () => [
    vi.fn(() => ({ unwrap: () => Promise.resolve(previewResolvedValue) })),
    { isLoading: false },
  ],
  useCreateAuthorityMutation: () => [vi.fn(() => ({ unwrap: () => Promise.resolve({}) })), { isLoading: false }],
  useAddContactMutation: () => [vi.fn(() => ({ unwrap: () => Promise.resolve({}) })), { isLoading: false }],
  useRemoveContactMutation: () => [vi.fn(() => ({ unwrap: () => Promise.resolve({}) })), { isLoading: false }],
  useVerifyBankMutation: () => [vi.fn(() => ({ unwrap: () => Promise.resolve({}) })), { isLoading: false }],
  useCreateRuleMutation: () => [vi.fn(() => ({ unwrap: () => Promise.resolve({}) })), { isLoading: false }],
  useUpdateRuleMutation: () => [vi.fn(() => ({ unwrap: () => Promise.resolve({}) })), { isLoading: false }],
}));

// ─── Store factory ────────────────────────────────────────────────────────────

type UserOverride = { role_name?: string; [k: string]: unknown };

function makeStore(userOverride: UserOverride = {}) {
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
          ...userOverride,
        },
      },
    },
    middleware: (gDM) => gDM({ serializableCheck: false }).concat(emptyApi.middleware),
  });
}

// ─── Import under test ────────────────────────────────────────────────────────

import RevenueDistributionConfig from '../RevenueDistributionConfig';

function renderScreen(store = makeStore()) {
  return render(
    <Provider store={store}>
      <MemoryRouter>
        <RevenueDistributionConfig />
      </MemoryRouter>
    </Provider>
  );
}

beforeEach(() => {
  authoritiesState = { isFetching: false, isError: false, data: { data: { data: [sampleAuthority], total: 1, page: 1, limit: 100 } } };
  rulesState = { isFetching: false, isError: false, data: { data: { data: [sampleRule], total: 1, page: 1, limit: 100 } } };
  previewResolvedValue = { success: true, data: { levy_lines: [], data_fee: 1500, total: 1500 } };
});

// =============================================================================
// AC-01: Users without read permission see a permission-denied message
// =============================================================================

describe('AC-01: Permission gating', () => {
  it('shows a permission-denied message for roles without revenue read access', () => {
    renderScreen(makeStore({ role_name: 'Buyer' }));
    expect(screen.getByText(/do not have permission/i)).toBeInTheDocument();
  });

  it('renders the screen for SuperAdmin', () => {
    renderScreen(makeStore({ role_name: 'SuperAdmin' }));
    expect(screen.getByText('Revenue Distribution Config')).toBeInTheDocument();
  });
});

// =============================================================================
// AC-02: Authorities tab lists authorities returned by the query
// =============================================================================

describe('AC-02: Authorities listing', () => {
  it('renders the authority code and name from the query result', () => {
    renderScreen();
    expect(screen.getByText('KN-LGA-001')).toBeInTheDocument();
    expect(screen.getByText('Kano LGA Trade Office')).toBeInTheDocument();
  });
});

// =============================================================================
// AC-03: Loading state shown while authorities are fetching
// =============================================================================

describe('AC-03: Loading state', () => {
  it('shows a loading message while authorities are fetching', () => {
    authoritiesState = { isFetching: true, isError: false, data: undefined };
    renderScreen();
    expect(screen.getByText(/Loading authorities/i)).toBeInTheDocument();
  });
});

// =============================================================================
// AC-04: Error state shown when authorities query fails
// =============================================================================

describe('AC-04: Error state', () => {
  it('shows an error message when the authorities query fails', () => {
    authoritiesState = { isFetching: false, isError: true, data: undefined };
    renderScreen();
    expect(screen.getByText(/Failed to load revenue authorities/i)).toBeInTheDocument();
  });
});

// =============================================================================
// AC-05: "Onboard Stakeholder" button only shown for manage-permitted roles
// =============================================================================

describe('AC-05: Manage action visibility', () => {
  it('shows the Onboard Stakeholder button for SuperAdmin', () => {
    renderScreen(makeStore({ role_name: 'SuperAdmin' }));
    expect(screen.getByText('+ Onboard Stakeholder')).toBeInTheDocument();
  });

  it('does not show the Onboard Stakeholder button for Auditor (read-only role)', () => {
    renderScreen(makeStore({ role_name: 'Auditor' }));
    expect(screen.queryByText('+ Onboard Stakeholder')).not.toBeInTheDocument();
  });
});

// =============================================================================
// AC-06: Switching to Rules tab renders rules from the query
// =============================================================================

describe('AC-06: Rules tab', () => {
  it('renders rule rows after switching to the Revenue Rules tab', async () => {
    const user = userEvent.setup();
    renderScreen();
    await user.click(screen.getByText('Revenue Rules'));
    expect(await screen.findByText('MAIZE')).toBeInTheDocument();
  });
});

// =============================================================================
// AC-07: Switching to Preview tab and submitting renders the fee breakdown
// =============================================================================

describe('AC-07: Fee preview', () => {
  it('renders the breakdown total after submitting the preview form', async () => {
    previewResolvedValue = {
      success: true,
      data: {
        levy_lines: [
          { authority_id: 'auth-1', authority_code: 'KN-LGA-001', authority_name: 'Kano LGA Trade Office', basis: 'per_kg', rate: 2.5, amount: 250 },
        ],
        data_fee: 1500,
        total: 1750,
      },
    };
    const user = userEvent.setup();
    renderScreen();
    await user.click(screen.getByText('Fee Preview'));

    await user.type(screen.getByPlaceholderText('e.g. MAIZE'), 'MAIZE');
    // State is a <select> of Nigerian states (data-quality fix — free text
    // allowed typos), not a text input — no placeholder to type into anymore.
    const stateSelect = screen.getByText('State *').parentElement!.querySelector('select')!;
    await user.selectOptions(stateSelect, 'Kano');
    const quantityInput = screen.getByText('Quantity *').parentElement!.querySelector('input')!;
    await user.clear(quantityInput);
    await user.type(quantityInput, '100');

    await user.click(screen.getByText('Preview Fee Breakdown'));

    await waitFor(() => {
      expect(screen.getByText(/₦1,750/)).toBeInTheDocument();
    });
  });
});

// =============================================================================
// AC-08: Read-only roles do not see manage actions on the Rules tab
// =============================================================================

describe('AC-08: Read-only role rules tab', () => {
  it('does not show "+ New Rule" or "Edit" actions for Auditor', async () => {
    const user = userEvent.setup();
    renderScreen(makeStore({ role_name: 'Auditor' }));
    await user.click(screen.getByText('Revenue Rules'));
    expect(screen.queryByText('+ New Rule')).not.toBeInTheDocument();
    await waitFor(() => {
      expect(screen.queryByText('Edit')).not.toBeInTheDocument();
    });
  });
});
