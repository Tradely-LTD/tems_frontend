/**
 * Acceptance Tests — Levy Config frontend module
 *
 * AC-01  Loading spinner shown while isLoading/isFetching
 * AC-02  Fetch error renders error message
 * AC-03  Read-only view shown for NationalAdmin (non-editable role)
 * AC-04  Edit form shown for SuperAdmin
 * AC-05  Edit form shown for JRBAccount
 * AC-06  Submitting calls upsertLevyConfig with correct values
 * AC-07  Success banner shown after successful save
 * AC-08  Error banner shown when save fails
 * AC-09  flat_levy_amount field hidden (but registered) when levy_mode is per_category
 * AC-10  commission_percentage field hidden (but registered) when commission_type is flat
 * AC-11  commission_flat_amount field hidden (but registered) when commission_type is percentage
 * AC-12  Form populates from API data when query resolves
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
import type { LevyConfig } from '../services/types';

// ─── RTK Query hook state that each test controls ─────────────────────────────

type QueryState = {
  isLoading: boolean;
  isFetching: boolean;
  data?: { success: boolean; data: LevyConfig };
  error?: unknown;
};

type MutationResult = { unwrap: () => Promise<unknown> };

let queryState: QueryState = {
  isLoading: false,
  isFetching: false,
  data: undefined,
  error: undefined,
};

let mutationResult: MutationResult = {
  unwrap: () => Promise.resolve({ success: true, data: defaultConfig }),
};

const upsertArgs: unknown[] = [];

const defaultConfig: LevyConfig = {
  id: 'cfg-1',
  levy_mode: 'flat',
  flat_levy_amount: 500,
  commission_type: 'flat',
  commission_flat_amount: 50,
  commission_percentage: 0,
  updated_by: null,
  created_at: '2024-01-01T00:00:00Z',
  updated_at: '2024-01-01T00:00:00Z',
};

// ─── Mock the levyConfigSlice RTK Query hooks ────────────────────────────────

vi.mock('../services/levyConfigSlice', () => ({
  useGetLevyConfigQuery: () => queryState,
  useUpsertLevyConfigMutation: () => [
    (arg: unknown) => {
      upsertArgs.push(arg);
      return mutationResult;
    },
    { isLoading: false },
  ],
}));

// ─── Store factory ────────────────────────────────────────────────────────────

type UserOverride = {
  role_name?: string;
  [k: string]: unknown;
};

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

import LevyConfigSettings from '../LevyConfigSettings';

function renderSettings(store = makeStore()) {
  return render(
    <Provider store={store}>
      <MemoryRouter>
        <LevyConfigSettings />
      </MemoryRouter>
    </Provider>
  );
}

// ─── Reset state before each test ────────────────────────────────────────────

beforeEach(() => {
  queryState = { isLoading: false, isFetching: false, data: undefined, error: undefined };
  mutationResult = { unwrap: () => Promise.resolve({ success: true, data: defaultConfig }) };
  upsertArgs.length = 0;
});

// =============================================================================
// AC-01: Loading spinner shown while isLoading or isFetching
// =============================================================================

describe('AC-01: Loading spinner shown while isLoading or isFetching', () => {
  it('renders a loading spinner when isLoading is true', () => {
    queryState = { isLoading: true, isFetching: false };
    renderSettings();
    expect(document.querySelector('.animate-spin')).not.toBeNull();
  });

  it('renders "Loading…" text when isLoading is true', () => {
    queryState = { isLoading: true, isFetching: false };
    renderSettings();
    expect(screen.getByText(/Loading…/i)).toBeInTheDocument();
  });

  it('renders a loading spinner when isFetching is true', () => {
    queryState = { isLoading: false, isFetching: true };
    renderSettings();
    expect(document.querySelector('.animate-spin')).not.toBeNull();
  });

  it('does not show the form heading while loading', () => {
    queryState = { isLoading: true, isFetching: false };
    renderSettings();
    expect(screen.queryByText(/Levy & Commission Settings/i)).not.toBeInTheDocument();
  });
});

// =============================================================================
// AC-02: Fetch error renders error message
// =============================================================================

describe('AC-02: Fetch error renders error message', () => {
  it('shows an error message when fetchError is set', () => {
    queryState = { isLoading: false, isFetching: false, error: { status: 500, data: { message: 'Server error' } } };
    renderSettings();
    expect(screen.getByText(/Failed to load settings/i)).toBeInTheDocument();
  });

  it('does not render a spinner when there is a fetch error', () => {
    queryState = { isLoading: false, isFetching: false, error: { status: 500 } };
    renderSettings();
    expect(document.querySelector('.animate-spin')).toBeNull();
  });
});

// =============================================================================
// AC-03: Read-only view for non-editable role (NationalAdmin)
// =============================================================================

describe('AC-03: Read-only view for NationalAdmin (non-editable role)', () => {
  it('shows the page heading', () => {
    queryState = {
      isLoading: false,
      isFetching: false,
      data: { success: true, data: defaultConfig },
    };
    const store = makeStore({ role_name: 'NationalAdmin' });
    renderSettings(store);
    expect(screen.getByText(/Levy & Commission Settings/i)).toBeInTheDocument();
  });

  it('does not show a submit button for NationalAdmin', () => {
    queryState = {
      isLoading: false,
      isFetching: false,
      data: { success: true, data: defaultConfig },
    };
    const store = makeStore({ role_name: 'NationalAdmin' });
    renderSettings(store);
    expect(screen.queryByRole('button', { name: /Save Configuration/i })).not.toBeInTheDocument();
  });

  it('shows levy mode label in read-only view', () => {
    queryState = {
      isLoading: false,
      isFetching: false,
      data: { success: true, data: defaultConfig },
    };
    const store = makeStore({ role_name: 'StateAdmin' });
    renderSettings(store);
    expect(screen.getByText('Levy Mode')).toBeInTheDocument();
  });

  it('shows "Flat Rate" when levy_mode is flat in read-only view', () => {
    queryState = {
      isLoading: false,
      isFetching: false,
      data: { success: true, data: { ...defaultConfig, levy_mode: 'flat' } },
    };
    const store = makeStore({ role_name: 'NationalAdmin' });
    renderSettings(store);
    expect(screen.getByText('Flat Rate')).toBeInTheDocument();
  });

  it('shows "Per Category" when levy_mode is per_category in read-only view', () => {
    queryState = {
      isLoading: false,
      isFetching: false,
      data: { success: true, data: { ...defaultConfig, levy_mode: 'per_category' } },
    };
    const store = makeStore({ role_name: 'NationalAdmin' });
    renderSettings(store);
    expect(screen.getByText('Per Category')).toBeInTheDocument();
  });
});

// =============================================================================
// AC-04: Edit form shown for SuperAdmin
// =============================================================================

describe('AC-04: Edit form shown for SuperAdmin', () => {
  it('renders "Save Configuration" button for SuperAdmin', () => {
    queryState = { isLoading: false, isFetching: false };
    renderSettings(makeStore({ role_name: 'SuperAdmin' }));
    expect(screen.getByRole('button', { name: /Save Configuration/i })).toBeInTheDocument();
  });

  it('renders levy_mode and commission_type selects for SuperAdmin', () => {
    queryState = { isLoading: false, isFetching: false };
    renderSettings(makeStore({ role_name: 'SuperAdmin' }));
    const combos = screen.getAllByRole('combobox');
    expect(combos.length).toBeGreaterThanOrEqual(2);
  });
});

// =============================================================================
// AC-05: Edit form shown for JRBAccount
// =============================================================================

describe('AC-05: Edit form shown for JRBAccount', () => {
  it('renders "Save Configuration" button for JRBAccount', () => {
    queryState = { isLoading: false, isFetching: false };
    renderSettings(makeStore({ role_name: 'JRBAccount' }));
    expect(screen.getByRole('button', { name: /Save Configuration/i })).toBeInTheDocument();
  });
});

// =============================================================================
// AC-06: Submitting calls upsertLevyConfig with correct values
// =============================================================================

describe('AC-06: Submitting calls upsertLevyConfig with correct values', () => {
  it('calls upsertLevyConfig once when form is submitted', async () => {
    queryState = { isLoading: false, isFetching: false };
    upsertArgs.length = 0;
    renderSettings(makeStore({ role_name: 'SuperAdmin' }));

    await userEvent.click(screen.getByRole('button', { name: /Save Configuration/i }));

    await waitFor(() => expect(upsertArgs.length).toBe(1));
  });

  it('mutation payload includes levy_mode, flat_levy_amount, commission_type, commission_flat_amount, commission_percentage', async () => {
    queryState = { isLoading: false, isFetching: false };
    upsertArgs.length = 0;
    renderSettings(makeStore({ role_name: 'SuperAdmin' }));

    await userEvent.click(screen.getByRole('button', { name: /Save Configuration/i }));

    await waitFor(() => expect(upsertArgs.length).toBe(1));
    const payload = upsertArgs[0] as Record<string, unknown>;
    expect(payload).toHaveProperty('levy_mode');
    expect(payload).toHaveProperty('flat_levy_amount');
    expect(payload).toHaveProperty('commission_type');
    expect(payload).toHaveProperty('commission_flat_amount');
    expect(payload).toHaveProperty('commission_percentage');
  });
});

// =============================================================================
// AC-07: Success banner shown after successful save
// =============================================================================

describe('AC-07: Success banner shown after successful save', () => {
  it('shows "Settings saved successfully." after a successful save', async () => {
    queryState = { isLoading: false, isFetching: false };
    mutationResult = { unwrap: () => Promise.resolve({ success: true, data: defaultConfig }) };
    renderSettings(makeStore({ role_name: 'SuperAdmin' }));

    await userEvent.click(screen.getByRole('button', { name: /Save Configuration/i }));

    expect(await screen.findByText('Settings saved successfully.')).toBeInTheDocument();
  });
});

// =============================================================================
// AC-08: Error banner shown when save fails
// =============================================================================

describe('AC-08: Error banner shown when save fails', () => {
  it('shows "Failed to save settings." after a failed save', async () => {
    queryState = { isLoading: false, isFetching: false };
    mutationResult = { unwrap: () => Promise.reject({ status: 403, data: { message: 'Forbidden' } }) };
    renderSettings(makeStore({ role_name: 'SuperAdmin' }));

    await userEvent.click(screen.getByRole('button', { name: /Save Configuration/i }));

    expect(await screen.findByText(/Failed to save settings/i)).toBeInTheDocument();
  });
});

// =============================================================================
// AC-09: flat_levy_amount hidden but registered when levy_mode is per_category
// =============================================================================

describe('AC-09: flat_levy_amount hidden (not unmounted) when levy_mode is per_category', () => {
  it('flat_levy_amount input exists in the DOM when levy_mode is per_category', async () => {
    queryState = {
      isLoading: false,
      isFetching: false,
      data: { success: true, data: { ...defaultConfig, levy_mode: 'per_category' } },
    };
    renderSettings(makeStore({ role_name: 'SuperAdmin' }));

    // Wait for form to populate
    await waitFor(() => {
      const input = document.getElementById('flat_levy_amount');
      expect(input).not.toBeNull();
    });

    const wrapper = document.getElementById('flat_levy_amount')?.closest('div');
    expect(wrapper).not.toBeNull();
    expect((wrapper as HTMLElement).style.display).toBe('none');
  });

  it('flat_levy_amount input is visible when levy_mode is flat', async () => {
    queryState = {
      isLoading: false,
      isFetching: false,
      data: { success: true, data: { ...defaultConfig, levy_mode: 'flat' } },
    };
    renderSettings(makeStore({ role_name: 'SuperAdmin' }));

    await waitFor(() => {
      const input = document.getElementById('flat_levy_amount');
      expect(input).not.toBeNull();
    });

    const wrapper = document.getElementById('flat_levy_amount')?.closest('div');
    expect((wrapper as HTMLElement).style.display).not.toBe('none');
  });
});

// =============================================================================
// AC-10: commission_percentage hidden when commission_type is flat
// =============================================================================

describe('AC-10: commission_percentage hidden (not unmounted) when commission_type is flat', () => {
  it('commission_percentage input exists in the DOM when commission_type is flat', async () => {
    queryState = {
      isLoading: false,
      isFetching: false,
      data: { success: true, data: { ...defaultConfig, commission_type: 'flat' } },
    };
    renderSettings(makeStore({ role_name: 'SuperAdmin' }));

    await waitFor(() => {
      const input = document.getElementById('commission_percentage');
      expect(input).not.toBeNull();
    });

    const wrapper = document.getElementById('commission_percentage')?.closest('div');
    expect((wrapper as HTMLElement).style.display).toBe('none');
  });
});

// =============================================================================
// AC-11: commission_flat_amount hidden when commission_type is percentage
// =============================================================================

describe('AC-11: commission_flat_amount hidden (not unmounted) when commission_type is percentage', () => {
  it('commission_flat_amount input exists in the DOM when commission_type is percentage', async () => {
    queryState = {
      isLoading: false,
      isFetching: false,
      data: { success: true, data: { ...defaultConfig, commission_type: 'percentage' } },
    };
    renderSettings(makeStore({ role_name: 'SuperAdmin' }));

    await waitFor(() => {
      const input = document.getElementById('commission_flat_amount');
      expect(input).not.toBeNull();
    });

    const wrapper = document.getElementById('commission_flat_amount')?.closest('div');
    expect((wrapper as HTMLElement).style.display).toBe('none');
  });
});

// =============================================================================
// AC-12: Form populates from API data when query resolves
// =============================================================================

describe('AC-12: Form populates from API data when query resolves', () => {
  it('flat_levy_amount input has the value from the API response', async () => {
    queryState = {
      isLoading: false,
      isFetching: false,
      data: { success: true, data: { ...defaultConfig, flat_levy_amount: 750 } },
    };
    renderSettings(makeStore({ role_name: 'SuperAdmin' }));

    await waitFor(() => {
      const input = document.getElementById('flat_levy_amount') as HTMLInputElement | null;
      expect(input?.value).toBe('750');
    });
  });

  it('commission_percentage input has the value from the API response', async () => {
    queryState = {
      isLoading: false,
      isFetching: false,
      data: { success: true, data: { ...defaultConfig, commission_type: 'percentage', commission_percentage: 12 } },
    };
    renderSettings(makeStore({ role_name: 'SuperAdmin' }));

    await waitFor(() => {
      const input = document.getElementById('commission_percentage') as HTMLInputElement | null;
      expect(input?.value).toBe('12');
    });
  });
});

// =============================================================================
// AC-21: Client-side validation prevents network call for invalid values
// =============================================================================

describe('AC-21: Client-side validation before network call', () => {
  it('shows an inline error and does NOT call upsertLevyConfig when flat_levy_amount is negative', async () => {
    queryState = {
      isLoading: false,
      isFetching: false,
      data: { success: true, data: { ...defaultConfig, levy_mode: 'flat', flat_levy_amount: 500 } },
    };
    upsertArgs.length = 0;
    renderSettings(makeStore({ role_name: 'SuperAdmin' }));

    // Wait for the form to populate from API data
    await waitFor(() => {
      const input = document.getElementById('flat_levy_amount') as HTMLInputElement | null;
      expect(input?.value).toBe('500');
    });

    const input = document.getElementById('flat_levy_amount') as HTMLInputElement;
    await userEvent.clear(input);
    await userEvent.type(input, '-5');

    await userEvent.click(screen.getByRole('button', { name: /Save Configuration/i }));

    // Inline validation error must appear
    await waitFor(() => {
      expect(screen.getByText(/cannot be negative/i)).toBeInTheDocument();
    });

    // Mutation must NOT have been called
    expect(upsertArgs.length).toBe(0);
  });
});

// =============================================================================
// AC-24: Form pre-fills with system defaults on first visit
// =============================================================================

describe('AC-24: Form pre-fills with system defaults on first visit', () => {
  it('populates form inputs with default values when API returns system defaults', async () => {
    const systemDefaults: LevyConfig = {
      id: null,
      levy_mode: 'flat',
      flat_levy_amount: 0,
      commission_type: 'flat',
      commission_flat_amount: 0,
      commission_percentage: 0,
      updated_by: null,
      created_at: null,
      updated_at: null,
    };
    queryState = {
      isLoading: false,
      isFetching: false,
      data: { success: true, data: systemDefaults },
    };
    renderSettings(makeStore({ role_name: 'SuperAdmin' }));

    // levy_mode select should show "Flat Rate" (value = "flat")
    await waitFor(() => {
      expect(screen.getByDisplayValue('Flat Rate')).toBeInTheDocument();
    });

    // flat_levy_amount input should be "0"
    await waitFor(() => {
      const flatInput = document.getElementById('flat_levy_amount') as HTMLInputElement | null;
      expect(flatInput?.value).toBe('0');
    });

    // commission_flat_amount input should be "0"
    await waitFor(() => {
      const commissionInput = document.getElementById('commission_flat_amount') as HTMLInputElement | null;
      expect(commissionInput?.value).toBe('0');
    });
  });
});
