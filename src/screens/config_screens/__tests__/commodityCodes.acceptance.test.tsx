/**
 * Acceptance Tests — Commodity Codes frontend module
 *
 * AC-01  Loading spinner shown while isLoading/isFetching
 * AC-02  Fetch error renders error message
 * AC-03  Read-only view for non-editable role (no Add/Edit controls)
 * AC-04  Add/Edit controls shown for SuperAdmin
 * AC-05  Add/Edit controls shown for JRBAccount
 * AC-06  Table lists code, name, category, description, status
 * AC-07  Submitting the create form calls createCommodity with correct values
 * AC-08  Success banner shown after successful create
 * AC-09  Error banner shown when create fails
 * AC-10  Editing a row populates the edit form and submits update with { id, body }
 * AC-11  Empty list shows "No commodity codes found."
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
import type { Commodity } from '../services/types';

type QueryState = {
  isLoading: boolean;
  isFetching: boolean;
  data?: { success: boolean; data: Commodity[] };
  error?: unknown;
};

type MutationResult = { unwrap: () => Promise<unknown> };

let queryState: QueryState = {
  isLoading: false,
  isFetching: false,
  data: undefined,
  error: undefined,
};

let createMutationResult: MutationResult = {
  unwrap: () => Promise.resolve({ success: true, data: defaultCommodity }),
};

let updateMutationResult: MutationResult = {
  unwrap: () => Promise.resolve({ success: true, data: defaultCommodity }),
};

const createArgs: unknown[] = [];
const updateArgs: unknown[] = [];

const defaultCommodity: Commodity = {
  id: 'com-1',
  code: 'AGR-001',
  name: 'Maize',
  category: 'Agriculture',
  description: 'Grain commodity',
  is_active: true,
  created_at: '2024-01-01T00:00:00Z',
  updated_at: '2024-01-01T00:00:00Z',
};

vi.mock('../services/commodityCodesSlice', () => ({
  useGetCommoditiesQuery: () => queryState,
  useCreateCommodityMutation: () => [
    (arg: unknown) => {
      createArgs.push(arg);
      return createMutationResult;
    },
    { isLoading: false },
  ],
  useUpdateCommodityMutation: () => [
    (arg: unknown) => {
      updateArgs.push(arg);
      return updateMutationResult;
    },
    { isLoading: false },
  ],
}));

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

import CommodityCodesSettings from '../CommodityCodesSettings';

function renderSettings(store = makeStore()) {
  return render(
    <Provider store={store}>
      <MemoryRouter>
        <CommodityCodesSettings />
      </MemoryRouter>
    </Provider>
  );
}

beforeEach(() => {
  queryState = {
    isLoading: false,
    isFetching: false,
    data: { success: true, data: [defaultCommodity] },
    error: undefined,
  };
  createMutationResult = { unwrap: () => Promise.resolve({ success: true, data: defaultCommodity }) };
  updateMutationResult = { unwrap: () => Promise.resolve({ success: true, data: defaultCommodity }) };
  createArgs.length = 0;
  updateArgs.length = 0;
});

describe('AC-01: Loading spinner shown while isLoading or isFetching', () => {
  it('renders a loading spinner when isLoading is true', () => {
    queryState = { isLoading: true, isFetching: false };
    renderSettings();
    expect(document.querySelector('.animate-spin')).not.toBeNull();
  });

  it('renders a loading spinner when isFetching is true', () => {
    queryState = { isLoading: false, isFetching: true };
    renderSettings();
    expect(document.querySelector('.animate-spin')).not.toBeNull();
  });
});

describe('AC-02: Fetch error renders error message', () => {
  it('shows an error message when fetchError is set', () => {
    queryState = { isLoading: false, isFetching: false, error: { status: 500 } };
    renderSettings();
    expect(screen.getByText(/Failed to load commodity codes/i)).toBeInTheDocument();
  });
});

describe('AC-03: Read-only view for non-editable role', () => {
  it('does not show "Add Commodity" button for NationalAdmin', () => {
    renderSettings(makeStore({ role_name: 'NationalAdmin' }));
    expect(screen.queryByRole('button', { name: /Add Commodity/i })).not.toBeInTheDocument();
  });

  it('does not show "Edit" action for NationalAdmin', () => {
    renderSettings(makeStore({ role_name: 'NationalAdmin' }));
    expect(screen.queryByRole('button', { name: /Edit/i })).not.toBeInTheDocument();
  });

  it('still shows the page heading', () => {
    renderSettings(makeStore({ role_name: 'NationalAdmin' }));
    expect(screen.getByRole('heading', { name: /Commodity Codes/i })).toBeInTheDocument();
  });
});

describe('AC-04: Add/Edit controls shown for SuperAdmin', () => {
  it('shows "Add Commodity" button', () => {
    renderSettings(makeStore({ role_name: 'SuperAdmin' }));
    expect(screen.getByRole('button', { name: /Add Commodity/i })).toBeInTheDocument();
  });

  it('shows "Edit" action for each row', () => {
    renderSettings(makeStore({ role_name: 'SuperAdmin' }));
    expect(screen.getByRole('button', { name: /Edit/i })).toBeInTheDocument();
  });
});

describe('AC-05: Add/Edit controls shown for JRBAccount', () => {
  it('shows "Add Commodity" button', () => {
    renderSettings(makeStore({ role_name: 'JRBAccount' }));
    expect(screen.getByRole('button', { name: /Add Commodity/i })).toBeInTheDocument();
  });
});

describe('AC-06: Table lists commodity fields', () => {
  it('shows code, name, category, description and Active badge', () => {
    renderSettings(makeStore({ role_name: 'NationalAdmin' }));
    expect(screen.getByText('AGR-001')).toBeInTheDocument();
    expect(screen.getByText('Maize')).toBeInTheDocument();
    expect(screen.getByText('Agriculture')).toBeInTheDocument();
    expect(screen.getByText('Grain commodity')).toBeInTheDocument();
    expect(screen.getByText('Active')).toBeInTheDocument();
  });

  it('shows Inactive badge when is_active is false', () => {
    queryState = {
      isLoading: false,
      isFetching: false,
      data: { success: true, data: [{ ...defaultCommodity, is_active: false }] },
    };
    renderSettings(makeStore({ role_name: 'NationalAdmin' }));
    expect(screen.getByText('Inactive')).toBeInTheDocument();
  });
});

describe('AC-07: Submitting the create form calls createCommodity', () => {
  it('calls createCommodity with the form values', async () => {
    renderSettings(makeStore({ role_name: 'SuperAdmin' }));

    await userEvent.click(screen.getByRole('button', { name: /Add Commodity/i }));

    await userEvent.type(screen.getByLabelText(/^Code$/i), 'ENG-010');
    await userEvent.type(screen.getByLabelText(/^Category$/i), 'Energy');
    await userEvent.type(screen.getByLabelText(/^Name$/i), 'Diesel');

    await userEvent.click(screen.getByRole('button', { name: /Create Commodity/i }));

    await waitFor(() => expect(createArgs.length).toBe(1));
    const payload = createArgs[0] as Record<string, unknown>;
    expect(payload).toMatchObject({ code: 'ENG-010', category: 'Energy', name: 'Diesel' });
  });
});

describe('AC-08: Success banner shown after successful create', () => {
  it('shows "Commodity created successfully."', async () => {
    renderSettings(makeStore({ role_name: 'SuperAdmin' }));

    await userEvent.click(screen.getByRole('button', { name: /Add Commodity/i }));
    await userEvent.type(screen.getByLabelText(/^Code$/i), 'ENG-010');
    await userEvent.type(screen.getByLabelText(/^Category$/i), 'Energy');
    await userEvent.type(screen.getByLabelText(/^Name$/i), 'Diesel');
    await userEvent.click(screen.getByRole('button', { name: /Create Commodity/i }));

    expect(await screen.findByText('Commodity created successfully.')).toBeInTheDocument();
  });
});

describe('AC-09: Error banner shown when create fails', () => {
  it('shows "Failed to create commodity." on rejection', async () => {
    createMutationResult = { unwrap: () => Promise.reject({ status: 409, data: { message: 'Duplicate code' } }) };
    renderSettings(makeStore({ role_name: 'SuperAdmin' }));

    await userEvent.click(screen.getByRole('button', { name: /Add Commodity/i }));
    await userEvent.type(screen.getByLabelText(/^Code$/i), 'AGR-001');
    await userEvent.type(screen.getByLabelText(/^Category$/i), 'Agriculture');
    await userEvent.type(screen.getByLabelText(/^Name$/i), 'Maize');
    await userEvent.click(screen.getByRole('button', { name: /Create Commodity/i }));

    expect(await screen.findByText(/Failed to create commodity/i)).toBeInTheDocument();
  });
});

describe('AC-10: Editing a row submits update with { id, body }', () => {
  it('populates the edit form and calls updateCommodity with correct id and body', async () => {
    renderSettings(makeStore({ role_name: 'SuperAdmin' }));

    await userEvent.click(screen.getByRole('button', { name: /Edit/i }));

    const nameInput = screen.getByLabelText(/^Name$/i) as HTMLInputElement;
    expect(nameInput.value).toBe('Maize');

    await userEvent.clear(nameInput);
    await userEvent.type(nameInput, 'Yellow Maize');

    await userEvent.click(screen.getByRole('button', { name: /Save Changes/i }));

    await waitFor(() => expect(updateArgs.length).toBe(1));
    const payload = updateArgs[0] as { id: string; body: Record<string, unknown> };
    expect(payload.id).toBe('com-1');
    expect(payload.body).toMatchObject({ name: 'Yellow Maize' });
  });
});

describe('AC-11: Empty list shows no-data message', () => {
  it('shows "No commodity codes found."', () => {
    queryState = { isLoading: false, isFetching: false, data: { success: true, data: [] } };
    renderSettings(makeStore({ role_name: 'SuperAdmin' }));
    expect(screen.getByText(/No commodity codes found\./i)).toBeInTheDocument();
  });
});
