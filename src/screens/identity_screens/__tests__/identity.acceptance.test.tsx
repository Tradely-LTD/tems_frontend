/**
 * Acceptance Tests — Identity & KYC frontend module
 *
 * AC-01  StatusBadge variant matches kyc_status value
 * AC-02  404 from GET /api/identity/kyc/status → "Get Started" button, no StatusBadge
 * AC-03  Profile page shows nin_verified, tin_verified, tems_id, and document list
 * AC-04  Loading state shown while status request is in flight
 * AC-05  pending/rejected status opens 2-step form; Step 1 has NIN/TIN/BVN/DoB/Address
 * AC-06  Submitting Step 1 calls POST /api/identity/profile; 200/201 advances to Step 2
 * AC-07  API errors on Step 1 show inline; form stays on Step 1
 * AC-08  submitted/verified status users see summary only — no submission form
 * AC-09  Step 2 shows Select with 4 document types; Submit disabled without selection
 * AC-10  Submitting Step 2 calls POST /api/identity/kyc/documents with id_type only
 * AC-11  201 from doc submit → close flow, refetch status, badge updates
 * AC-12  404 from doc submit → "Please complete Step 1 first" + Back button
 * AC-13  Other errors on Step 2 show inline; user can retry
 * AC-14  Stepper shows 2 steps; cannot reach Step 2 without completing Step 1
 * AC-15  Back from Step 2 returns to Step 1; no API call; data preserved
 * AC-16  Auditor role (no identity:submit) sees summary only — no CTA, no form
 */

import React from 'react';
import { describe, it, expect, vi, beforeEach } from 'vitest';
import { render, screen, waitFor, within } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { Provider } from 'react-redux';
import { configureStore } from '@reduxjs/toolkit';
import { MemoryRouter } from 'react-router-dom';
import { authReducer } from '@/screens/auth_screens/services/authSlice';
import { emptyApi } from '@/store/emptyApi';

// ─── RTK Query hook state that each test controls ─────────────────────────────

type KycStatusShape = {
  isLoading: boolean;
  data?: {
    success: boolean;
    data: {
      kyc_status: string;
      nin_verified: boolean;
      tin_verified: boolean;
      tems_id: string | null;
      documents: Array<{ id: string; id_type: string; is_primary: boolean; uploaded_at: string }>;
    };
  };
  error?: { status: number; data?: unknown };
  refetch: () => void;
};

type ProfileShape = {
  data?: {
    success: boolean;
    data: {
      id: string;
      nin?: string | null;
      tin?: string | null;
      bvn?: string | null;
      date_of_birth?: string | null;
      address?: string | null;
      kyc_status: string;
      nin_verified: boolean;
      tin_verified: boolean;
      tems_id?: string | null;
      created_at: string;
      updated_at: string;
      user_id?: string;
      org_id?: string;
    };
  };
  isFetching: boolean;
};

// Mutable control objects each test can set
let kycStatusState: KycStatusShape = {
  isLoading: false,
  data: undefined,
  error: undefined,
  refetch: vi.fn(),
};
let profileState: ProfileShape = { data: undefined, isFetching: false };
let submitProfileResult: { unwrap: () => Promise<unknown> } = {
  unwrap: () => Promise.resolve({ success: true, data: {} }),
};
let submitDocumentResult: { unwrap: () => Promise<unknown> } = {
  unwrap: () => Promise.resolve({ success: true, data: {} }),
};

// Track mutation call arguments
const submitProfileArgs: unknown[] = [];
const submitDocumentArgs: unknown[] = [];

// ─── Mock the identitySlice RTK Query hooks ───────────────────────────────────

vi.mock('../services/identitySlice', () => ({
  useGetKycStatusQuery: () => kycStatusState,
  useGetIdentityProfileQuery: () => profileState,
  useSubmitProfileMutation: () => [
    (arg: unknown) => {
      submitProfileArgs.push(arg);
      return submitProfileResult;
    },
    { isLoading: false },
  ],
  useSubmitDocumentMutation: () => [
    (arg: unknown) => {
      submitDocumentArgs.push(arg);
      return submitDocumentResult;
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
          email: 'agent@test.com',
          phone: '+2348000000000',
          full_name: 'Test User',
          status: 'active',
          org_id: 'org-1',
          role_id: 'r-1',
          role_name: 'Agent',
          phone_verified: true,
          ...userOverride,
        },
      },
    },
    middleware: (gDM) => gDM({ serializableCheck: false }).concat(emptyApi.middleware),
  });
}

// ─── Imports after mocks ──────────────────────────────────────────────────────

import IdentityDashboard from '../IdentityDashboard';
import IdentityDocumentUpload from '../IdentityDocumentUpload';

function renderDashboard(store = makeStore()) {
  return render(
    <Provider store={store}>
      <MemoryRouter>
        <IdentityDashboard />
      </MemoryRouter>
    </Provider>
  );
}

// ─── Helpers to build common mock states ─────────────────────────────────────

function setKycStatus(kycStatus: string, extras: Partial<NonNullable<KycStatusShape['data']>['data']> = {}) {
  kycStatusState = {
    isLoading: false,
    data: {
      success: true,
      data: {
        kyc_status: kycStatus,
        nin_verified: false,
        tin_verified: false,
        tems_id: null,
        documents: [],
        ...extras,
      },
    },
    error: undefined,
    refetch: vi.fn(),
  };
}

function setKyc404() {
  kycStatusState = {
    isLoading: false,
    data: undefined,
    error: { status: 404, data: { message: 'Not found' } },
    refetch: vi.fn(),
  };
}

function setKycLoading() {
  kycStatusState = {
    isLoading: true,
    data: undefined,
    error: undefined,
    refetch: vi.fn(),
  };
}

function setSubmitProfileSuccess() {
  submitProfileResult = {
    unwrap: () => Promise.resolve({
      success: true,
      data: { id: 'p-1', kyc_status: 'pending', nin_verified: false, tin_verified: false, created_at: '', updated_at: '' },
    }),
  };
}

function setSubmitProfileError(message: string, status = 422) {
  submitProfileResult = {
    unwrap: () => Promise.reject({ status, data: { message } }),
  };
}

function setSubmitDocumentSuccess() {
  submitDocumentResult = {
    unwrap: () => Promise.resolve({
      success: true,
      data: { id: 'doc-1', id_type: 'passport', is_primary: true, uploaded_at: new Date().toISOString() },
    }),
  };
}

function setSubmitDocumentError(status: number, message: string) {
  submitDocumentResult = {
    unwrap: () => Promise.reject({ status, data: { message } }),
  };
}

// ─── Reach Step 2 helper ──────────────────────────────────────────────────────

async function reachStep2(store = makeStore({ role_name: 'Agent' })) {
  setKycStatus('pending');
  setSubmitProfileSuccess();

  render(
    <Provider store={store}>
      <MemoryRouter>
        <IdentityDashboard />
      </MemoryRouter>
    </Provider>
  );

  const resubmitBtn = screen.getByRole('button', { name: /resubmit|get started/i });
  await userEvent.click(resubmitBtn);

  const continueBtn = await screen.findByRole('button', { name: /continue/i });
  await userEvent.click(continueBtn);

  // Step 2 renders IdentityDocumentUpload with an h2 heading "Document Type"
  await screen.findByRole('heading', { name: 'Document Type' });
}

// ─── Reset state before each test ────────────────────────────────────────────

beforeEach(() => {
  kycStatusState = { isLoading: false, data: undefined, error: undefined, refetch: vi.fn() };
  profileState = { data: undefined, isFetching: false };
  submitProfileArgs.length = 0;
  submitDocumentArgs.length = 0;
  setSubmitProfileSuccess();
  setSubmitDocumentSuccess();
});

// =============================================================================
// AC-01: StatusBadge variant matches kyc_status
// =============================================================================

describe('AC-01: StatusBadge variant matches kyc_status value', () => {
  it('pending status renders a badge with "PENDING" text', () => {
    setKycStatus('pending');
    renderDashboard();
    expect(screen.getByText('PENDING')).toBeInTheDocument();
  });

  it('submitted status renders a badge with "SUBMITTED" text', () => {
    setKycStatus('submitted');
    renderDashboard();
    expect(screen.getByText('SUBMITTED')).toBeInTheDocument();
  });

  it('verified status renders a badge with "VERIFIED" text', () => {
    setKycStatus('verified', { nin_verified: true, tin_verified: true, tems_id: 'TEMS-001' });
    renderDashboard();
    expect(screen.getByText('VERIFIED')).toBeInTheDocument();
  });

  it('rejected status renders a badge with "REJECTED" text', () => {
    setKycStatus('rejected');
    renderDashboard();
    expect(screen.getByText('REJECTED')).toBeInTheDocument();
  });

  it('pending maps to "pending" badge variant — yellow style class', () => {
    setKycStatus('pending');
    renderDashboard();
    const badge = screen.getByText('PENDING');
    // pending variant: bg-[rgba(241,196,15,0.15)]
    expect(badge.className).toContain('bg-[rgba(241,196,15,0.15)]');
  });

  it('submitted maps to "submitted" badge variant — blue style class', () => {
    setKycStatus('submitted');
    renderDashboard();
    const badge = screen.getByText('SUBMITTED');
    // submitted variant: bg-[rgba(59,130,246,0.15)]
    expect(badge.className).toContain('bg-[rgba(59,130,246,0.15)]');
  });

  it('verified maps to "valid" badge variant — green style class', () => {
    setKycStatus('verified', { nin_verified: true, tin_verified: true, tems_id: 'TEMS-001' });
    renderDashboard();
    const badge = screen.getByText('VERIFIED');
    // valid variant: bg-[#9ff4c9]
    expect(badge.className).toContain('bg-[#9ff4c9]');
  });

  it('rejected maps to "expired" badge variant — red style class', () => {
    setKycStatus('rejected');
    renderDashboard();
    const badge = screen.getByText('REJECTED');
    // expired variant: bg-[rgba(186,26,26,0.15)]
    expect(badge.className).toContain('bg-[rgba(186,26,26,0.15)]');
  });
});

// =============================================================================
// AC-02: 404 → "Get Started" button, no StatusBadge
// =============================================================================

describe('AC-02: 404 from GET /api/identity/kyc/status shows "Get Started" button only', () => {
  it('renders "Get Started" button when status returns 404', () => {
    setKyc404();
    const store = makeStore({ role_name: 'Agent' });
    renderDashboard(store);
    expect(screen.getByRole('button', { name: /get started/i })).toBeInTheDocument();
  });

  it('does not render any StatusBadge when status returns 404', () => {
    setKyc404();
    const store = makeStore({ role_name: 'Agent' });
    renderDashboard(store);
    expect(screen.queryByText('PENDING')).not.toBeInTheDocument();
    expect(screen.queryByText('SUBMITTED')).not.toBeInTheDocument();
    expect(screen.queryByText('VERIFIED')).not.toBeInTheDocument();
    expect(screen.queryByText('REJECTED')).not.toBeInTheDocument();
  });

  it('shows "No KYC profile found" message when status returns 404', () => {
    setKyc404();
    renderDashboard();
    expect(screen.getByText(/No KYC profile found/i)).toBeInTheDocument();
  });
});

// =============================================================================
// AC-03: Profile page shows nin_verified, tin_verified, tems_id, documents
// =============================================================================

describe('AC-03: Profile data shown — nin_verified, tin_verified, tems_id, documents', () => {
  it('shows "✓ Verified" when nin_verified is true', () => {
    setKycStatus('pending', { nin_verified: true });
    renderDashboard();
    expect(screen.getByText('✓ Verified')).toBeInTheDocument();
  });

  it('shows "✗ Not verified" when nin_verified is false', () => {
    setKycStatus('pending', { nin_verified: false });
    renderDashboard();
    const notVerified = screen.getAllByText('✗ Not verified');
    expect(notVerified.length).toBeGreaterThanOrEqual(1);
  });

  it('shows "Pending assignment" when tems_id is null', () => {
    setKycStatus('pending', { tems_id: null });
    renderDashboard();
    expect(screen.getByText('Pending assignment')).toBeInTheDocument();
  });

  it('shows actual tems_id value when set', () => {
    setKycStatus('verified', { nin_verified: true, tin_verified: true, tems_id: 'TEMS-XYZ-9900' });
    renderDashboard();
    expect(screen.getByText('TEMS-XYZ-9900')).toBeInTheDocument();
  });

  it('renders "Documents Submitted" heading when profile exists', () => {
    setKycStatus('pending');
    renderDashboard();
    expect(screen.getByText('Documents Submitted')).toBeInTheDocument();
  });

  it('shows document label when document list is populated', () => {
    setKycStatus('submitted', {
      documents: [
        { id: 'doc-1', id_type: 'passport', is_primary: true, uploaded_at: '2024-01-15T10:00:00Z' },
      ],
    });
    renderDashboard();
    expect(screen.getByText('International Passport')).toBeInTheDocument();
  });

  it('shows "No documents uploaded yet" when document list is empty', () => {
    setKycStatus('pending', { documents: [] });
    renderDashboard();
    expect(screen.getByText('No documents uploaded yet.')).toBeInTheDocument();
  });

  it('labels NIN Verified and TIN Verified fields in the profile view', () => {
    setKycStatus('pending');
    renderDashboard();
    expect(screen.getByText('NIN Verified')).toBeInTheDocument();
    expect(screen.getByText('TIN Verified')).toBeInTheDocument();
  });
});

// =============================================================================
// AC-04: Loading indicator while status request is in flight
// =============================================================================

describe('AC-04: Loading indicator shown while status request is in flight', () => {
  it('renders a loading spinner when isLoading is true', () => {
    setKycLoading();
    renderDashboard();
    const spinner = document.querySelector('.animate-spin');
    expect(spinner).not.toBeNull();
  });

  it('no partial data (NIN Verified label) appears during loading', () => {
    setKycLoading();
    renderDashboard();
    expect(screen.queryByText('NIN Verified')).not.toBeInTheDocument();
    expect(screen.queryByText('Documents Submitted')).not.toBeInTheDocument();
  });

  it('no StatusBadge is shown during loading', () => {
    setKycLoading();
    renderDashboard();
    expect(screen.queryByText('PENDING')).not.toBeInTheDocument();
    expect(screen.queryByText('SUBMITTED')).not.toBeInTheDocument();
  });

  it('spinner disappears once data is available', () => {
    setKycStatus('pending');
    renderDashboard();
    expect(document.querySelector('.animate-spin')).toBeNull();
    expect(screen.getByText('Identity & KYC')).toBeInTheDocument();
  });
});

// =============================================================================
// AC-05: pending/rejected status → can open form; Step 1 fields present
// =============================================================================

describe('AC-05: pending/rejected user can open 2-step form with all Step 1 fields', () => {
  async function openFormForStatus(kycStatusValue: 'pending' | 'rejected') {
    setKycStatus(kycStatusValue);
    const store = makeStore({ role_name: 'Agent' });
    render(
      <Provider store={store}>
        <MemoryRouter>
          <IdentityDashboard />
        </MemoryRouter>
      </Provider>
    );
    const btn = screen.getByRole('button', { name: /resubmit|get started/i });
    await userEvent.click(btn);
  }

  it('pending user: clicking button opens form with NIN field', async () => {
    await openFormForStatus('pending');
    expect(await screen.findByLabelText(/NIN \(National Identification Number\)/i)).toBeInTheDocument();
  });

  it('rejected user: clicking button opens form with NIN field', async () => {
    await openFormForStatus('rejected');
    expect(await screen.findByLabelText(/NIN \(National Identification Number\)/i)).toBeInTheDocument();
  });

  it('Step 1 form has TIN field', async () => {
    await openFormForStatus('pending');
    expect(await screen.findByLabelText(/TIN \(Tax Identification Number\)/i)).toBeInTheDocument();
  });

  it('Step 1 form has BVN field', async () => {
    await openFormForStatus('pending');
    expect(await screen.findByLabelText(/BVN \(Bank Verification Number\)/i)).toBeInTheDocument();
  });

  it('Step 1 form has Date of Birth field', async () => {
    await openFormForStatus('pending');
    expect(await screen.findByLabelText(/Date of Birth/i)).toBeInTheDocument();
  });

  it('Step 1 form has Address field', async () => {
    await openFormForStatus('pending');
    expect(await screen.findByLabelText(/Address/i)).toBeInTheDocument();
  });

  it('all Step 1 fields are optional — submitting with no values advances to Step 2', async () => {
    setKycStatus('pending');
    setSubmitProfileSuccess();
    const store = makeStore({ role_name: 'Agent' });
    render(
      <Provider store={store}>
        <MemoryRouter>
          <IdentityDashboard />
        </MemoryRouter>
      </Provider>
    );

    await userEvent.click(screen.getByRole('button', { name: /resubmit|get started/i }));
    const continueBtn = await screen.findByRole('button', { name: /continue/i });
    // Submit with no fields filled in
    await userEvent.click(continueBtn);

    // Should advance to Step 2 (document type form) — h2 heading in IdentityDocumentUpload
    expect(await screen.findByRole('heading', { name: 'Document Type' })).toBeInTheDocument();
  });
});

// =============================================================================
// AC-06: Submitting Step 1 calls POST /api/identity/profile; advances to Step 2
// =============================================================================

describe('AC-06: Step 1 submit calls POST /api/identity/profile; 200/201 → Step 2', () => {
  it('clicking Continue advances to Step 2 on success', async () => {
    setKycStatus('pending');
    setSubmitProfileSuccess();
    const store = makeStore({ role_name: 'Agent' });
    render(
      <Provider store={store}>
        <MemoryRouter>
          <IdentityDashboard />
        </MemoryRouter>
      </Provider>
    );

    await userEvent.click(screen.getByRole('button', { name: /resubmit|get started/i }));
    await userEvent.click(await screen.findByRole('button', { name: /continue/i }));

    // Step 2 heading: h2 "Document Type" inside IdentityDocumentUpload
    expect(await screen.findByRole('heading', { name: 'Document Type' })).toBeInTheDocument();
  });

  it('submitProfile mutation is called when Continue is clicked', async () => {
    setKycStatus('pending');
    setSubmitProfileSuccess();
    submitProfileArgs.length = 0;

    const store = makeStore({ role_name: 'Agent' });
    render(
      <Provider store={store}>
        <MemoryRouter>
          <IdentityDashboard />
        </MemoryRouter>
      </Provider>
    );

    await userEvent.click(screen.getByRole('button', { name: /resubmit|get started/i }));
    await userEvent.click(await screen.findByRole('button', { name: /continue/i }));
    await screen.findByRole('heading', { name: 'Document Type' });

    expect(submitProfileArgs.length).toBe(1);
  });

  it('fills fields and mutation receives the data', async () => {
    setKycStatus('pending');
    setSubmitProfileSuccess();
    submitProfileArgs.length = 0;

    const store = makeStore({ role_name: 'Agent' });
    render(
      <Provider store={store}>
        <MemoryRouter>
          <IdentityDashboard />
        </MemoryRouter>
      </Provider>
    );

    await userEvent.click(screen.getByRole('button', { name: /resubmit|get started/i }));
    await screen.findByRole('button', { name: /continue/i });

    const ninInput = screen.getByLabelText(/NIN \(National Identification Number\)/i);
    await userEvent.type(ninInput, '12345678901');

    await userEvent.click(screen.getByRole('button', { name: /continue/i }));
    await screen.findByRole('heading', { name: 'Document Type' });

    expect(submitProfileArgs.length).toBe(1);
    expect((submitProfileArgs[0] as Record<string, string>).nin).toBe('12345678901');
  });
});

// =============================================================================
// AC-07: API errors on Step 1 show inline; form stays on Step 1
// =============================================================================

describe('AC-07: API errors on Step 1 display inline; form stays on Step 1', () => {
  it('shows API error message inline when mutation rejects', async () => {
    setKycStatus('pending');
    setSubmitProfileError('Invalid NIN provided');

    const store = makeStore({ role_name: 'Agent' });
    render(
      <Provider store={store}>
        <MemoryRouter>
          <IdentityDashboard />
        </MemoryRouter>
      </Provider>
    );

    await userEvent.click(screen.getByRole('button', { name: /resubmit|get started/i }));
    await userEvent.click(await screen.findByRole('button', { name: /continue/i }));

    expect(await screen.findByText('Invalid NIN provided')).toBeInTheDocument();
  });

  it('shows fallback error message when data.message is absent', async () => {
    setKycStatus('pending');
    submitProfileResult = { unwrap: () => Promise.reject({ status: 500 }) };

    const store = makeStore({ role_name: 'Agent' });
    render(
      <Provider store={store}>
        <MemoryRouter>
          <IdentityDashboard />
        </MemoryRouter>
      </Provider>
    );

    await userEvent.click(screen.getByRole('button', { name: /resubmit|get started/i }));
    await userEvent.click(await screen.findByRole('button', { name: /continue/i }));

    expect(await screen.findByText(/Submission failed. Please try again./i)).toBeInTheDocument();
  });

  it('form stays on Step 1 (Identity Details heading visible) after error', async () => {
    setKycStatus('pending');
    setSubmitProfileError('Server error', 500);

    const store = makeStore({ role_name: 'Agent' });
    render(
      <Provider store={store}>
        <MemoryRouter>
          <IdentityDashboard />
        </MemoryRouter>
      </Provider>
    );

    await userEvent.click(screen.getByRole('button', { name: /resubmit|get started/i }));
    await userEvent.click(await screen.findByRole('button', { name: /continue/i }));

    await screen.findByText('Server error');

    // Step 1 form heading still visible (the h2 inside IdentityProfileForm)
    expect(screen.getByRole('heading', { name: 'Identity Details' })).toBeInTheDocument();
    // Step 2 heading NOT visible (the h2 inside IdentityDocumentUpload)
    expect(screen.queryByRole('heading', { name: 'Document Type' })).not.toBeInTheDocument();
  });
});

// =============================================================================
// AC-08: submitted/verified users see status summary only — no form
// =============================================================================

describe('AC-08: submitted/verified users see status summary only — no submission form', () => {
  it('submitted user: no "Get Started" button visible', () => {
    setKycStatus('submitted');
    const store = makeStore({ role_name: 'Agent' });
    renderDashboard(store);
    expect(screen.queryByRole('button', { name: /get started/i })).not.toBeInTheDocument();
  });

  it('submitted user: no "Resubmit" button (canSubmit is false for submitted status)', () => {
    setKycStatus('submitted');
    const store = makeStore({ role_name: 'Agent' });
    renderDashboard(store);
    expect(screen.queryByRole('button', { name: /resubmit/i })).not.toBeInTheDocument();
  });

  it('verified user: no "Get Started" button visible', () => {
    setKycStatus('verified', { nin_verified: true, tin_verified: true, tems_id: 'TEMS-001' });
    const store = makeStore({ role_name: 'Agent' });
    renderDashboard(store);
    expect(screen.queryByRole('button', { name: /get started/i })).not.toBeInTheDocument();
  });

  it('verified user: no "Resubmit" button visible', () => {
    setKycStatus('verified', { nin_verified: true, tin_verified: true, tems_id: 'TEMS-001' });
    const store = makeStore({ role_name: 'Agent' });
    renderDashboard(store);
    expect(screen.queryByRole('button', { name: /resubmit/i })).not.toBeInTheDocument();
  });

  it('submitted user: NIN form field is not rendered (no submission form visible)', () => {
    setKycStatus('submitted');
    renderDashboard();
    expect(screen.queryByLabelText(/NIN/i)).not.toBeInTheDocument();
  });

  it('submitted user: still sees the SUBMITTED status badge', () => {
    setKycStatus('submitted');
    renderDashboard();
    expect(screen.getByText('SUBMITTED')).toBeInTheDocument();
  });
});

// =============================================================================
// AC-09: Step 2 shows Select with 4 doc types; Submit disabled without selection
// =============================================================================

describe('AC-09: Step 2 Select has 4 document types; Submit disabled without selection', () => {
  it('Step 2 renders a select element', async () => {
    await reachStep2();
    // The IdentityDocumentUpload renders a <select> (combobox role)
    expect(screen.getByRole('combobox')).toBeInTheDocument();
  });

  it('Step 2 select contains exactly 4 document type options (not counting placeholder)', async () => {
    await reachStep2();
    const select = screen.getByRole('combobox');
    const docOptions = within(select)
      .getAllByRole('option')
      .filter((o) => (o as HTMLOptionElement).value !== '');
    expect(docOptions).toHaveLength(4);
  });

  it('Step 2 select contains "National ID" option', async () => {
    await reachStep2();
    expect(screen.getByRole('option', { name: 'National ID' })).toBeInTheDocument();
  });

  it("Step 2 select contains \"Driver's Licence\" option", async () => {
    await reachStep2();
    expect(screen.getByRole('option', { name: "Driver's Licence" })).toBeInTheDocument();
  });

  it("Step 2 select contains \"Voter's Card\" option", async () => {
    await reachStep2();
    expect(screen.getByRole('option', { name: "Voter's Card" })).toBeInTheDocument();
  });

  it('Step 2 select contains "International Passport" option', async () => {
    await reachStep2();
    expect(screen.getByRole('option', { name: 'International Passport' })).toBeInTheDocument();
  });

  it('Submit Document button is disabled before a selection is made', async () => {
    await reachStep2();
    const submitBtn = screen.getByRole('button', { name: /Submit Document/i });
    expect(submitBtn).toBeDisabled();
  });

  it('Submit Document button is enabled after a selection is made', async () => {
    await reachStep2();
    const select = screen.getByRole('combobox');
    await userEvent.selectOptions(select, 'passport');
    const submitBtn = screen.getByRole('button', { name: /Submit Document/i });
    expect(submitBtn).not.toBeDisabled();
  });
});

// =============================================================================
// AC-10: Step 2 submit calls POST /api/identity/kyc/documents with id_type
// =============================================================================

describe('AC-10: Step 2 submit calls POST /api/identity/kyc/documents with id_type', () => {
  it('submitDocument mutation is called with the selected id_type', async () => {
    setSubmitDocumentSuccess();
    submitDocumentArgs.length = 0;

    await reachStep2();
    const select = screen.getByRole('combobox');
    await userEvent.selectOptions(select, 'passport');
    await userEvent.click(screen.getByRole('button', { name: /Submit Document/i }));

    await waitFor(() => expect(submitDocumentArgs.length).toBe(1));
    expect((submitDocumentArgs[0] as { id_type: string }).id_type).toBe('passport');
  });

  it('mutation payload contains only id_type (no other fields)', async () => {
    setSubmitDocumentSuccess();
    submitDocumentArgs.length = 0;

    await reachStep2();
    const select = screen.getByRole('combobox');
    await userEvent.selectOptions(select, 'national_id');
    await userEvent.click(screen.getByRole('button', { name: /Submit Document/i }));

    await waitFor(() => expect(submitDocumentArgs.length).toBe(1));
    const payload = submitDocumentArgs[0] as Record<string, unknown>;
    expect(Object.keys(payload)).toEqual(['id_type']);
    expect(payload.id_type).toBe('national_id');
  });
});

// =============================================================================
// AC-11: 201 from doc submit → close flow, refetch status, badge updates
// =============================================================================

describe('AC-11: 201 from doc submit → flow closes, status refetched', () => {
  it('after 201 doc submit, returns to summary view (Document Type heading gone)', async () => {
    setSubmitDocumentSuccess();
    const refetchMock = vi.fn();
    kycStatusState.refetch = refetchMock;

    await reachStep2();

    const select = screen.getByRole('combobox');
    await userEvent.selectOptions(select, 'national_id');
    await userEvent.click(screen.getByRole('button', { name: /Submit Document/i }));

    // Flow closes — Document Type h2 heading should disappear
    await waitFor(() => {
      expect(screen.queryByRole('heading', { name: 'Document Type' })).not.toBeInTheDocument();
    });

    // Summary view is back
    expect(screen.getByText('Identity & KYC')).toBeInTheDocument();
  });

  it('refetch is called after 201 from document submit', async () => {
    setSubmitDocumentSuccess();
    const refetchMock = vi.fn();

    // We need to set up the refetch mock before reachStep2 since that rebuilds state
    setKycStatus('pending');
    setSubmitProfileSuccess();
    kycStatusState.refetch = refetchMock;

    const store = makeStore({ role_name: 'Agent' });
    render(
      <Provider store={store}>
        <MemoryRouter>
          <IdentityDashboard />
        </MemoryRouter>
      </Provider>
    );

    await userEvent.click(screen.getByRole('button', { name: /resubmit|get started/i }));
    await userEvent.click(await screen.findByRole('button', { name: /continue/i }));
    await screen.findByRole('heading', { name: 'Document Type' });

    const select = screen.getByRole('combobox');
    await userEvent.selectOptions(select, 'drivers_licence');
    await userEvent.click(screen.getByRole('button', { name: /Submit Document/i }));

    await waitFor(() => {
      expect(refetchMock).toHaveBeenCalledTimes(1);
    });
  });
});

// =============================================================================
// AC-12: 404 from doc submit → "Please complete Step 1 first" + Back button
// =============================================================================

describe('AC-12: 404 from doc submit → "Please complete Step 1 first" + Back button', () => {
  it('shows "Please complete Step 1 first" message on 404 from document submit', async () => {
    setSubmitDocumentError(404, 'Profile not found');

    await reachStep2();
    const select = screen.getByRole('combobox');
    await userEvent.selectOptions(select, 'passport');
    await userEvent.click(screen.getByRole('button', { name: /Submit Document/i }));

    expect(
      await screen.findByText(/Please complete Step 1 first/i)
    ).toBeInTheDocument();
  });

  it('shows Back button alongside the "Step 1 first" message on 404', async () => {
    setSubmitDocumentError(404, 'Profile not found');

    await reachStep2();
    const select = screen.getByRole('combobox');
    await userEvent.selectOptions(select, 'voters_card');
    await userEvent.click(screen.getByRole('button', { name: /Submit Document/i }));

    await screen.findByText(/Please complete Step 1 first/i);
    expect(screen.getByRole('button', { name: /back/i })).toBeInTheDocument();
  });
});

// =============================================================================
// AC-13: Other errors on Step 2 show inline; user can retry
// =============================================================================

describe('AC-13: Non-404 errors on Step 2 show inline; user can retry', () => {
  it('shows inline error message on 500 from document submit', async () => {
    setSubmitDocumentError(500, 'Internal server error');

    await reachStep2();
    const select = screen.getByRole('combobox');
    await userEvent.selectOptions(select, 'drivers_licence');
    await userEvent.click(screen.getByRole('button', { name: /Submit Document/i }));

    expect(await screen.findByText('Internal server error')).toBeInTheDocument();
  });

  it('shows fallback message when error has no data.message', async () => {
    submitDocumentResult = { unwrap: () => Promise.reject({ status: 503 }) };

    await reachStep2();
    const select = screen.getByRole('combobox');
    await userEvent.selectOptions(select, 'national_id');
    await userEvent.click(screen.getByRole('button', { name: /Submit Document/i }));

    expect(await screen.findByText(/Submission failed. Please try again./i)).toBeInTheDocument();
  });

  it('Submit Document button is still present after a non-404 error (user can retry)', async () => {
    setSubmitDocumentError(500, 'Internal server error');

    await reachStep2();
    const select = screen.getByRole('combobox');
    await userEvent.selectOptions(select, 'passport');
    await userEvent.click(screen.getByRole('button', { name: /Submit Document/i }));

    await screen.findByText('Internal server error');
    // User can retry — Submit button still present
    expect(screen.getByRole('button', { name: /Submit Document/i })).toBeInTheDocument();
  });

  it('Document Type heading still present after non-404 error (still on Step 2)', async () => {
    setSubmitDocumentError(500, 'Upload failed');

    await reachStep2();
    const select = screen.getByRole('combobox');
    await userEvent.selectOptions(select, 'passport');
    await userEvent.click(screen.getByRole('button', { name: /Submit Document/i }));

    await screen.findByText('Upload failed');
    // The h2 heading inside IdentityDocumentUpload should still be there
    expect(screen.getByRole('heading', { name: 'Document Type' })).toBeInTheDocument();
  });
});

// =============================================================================
// AC-14: Stepper shows 2 steps; cannot skip to Step 2 without completing Step 1
// =============================================================================

describe('AC-14: Stepper has 2 steps; Step 2 unreachable without completing Step 1', () => {
  it('Stepper renders "Identity Details" and "Document Type" labels on Step 1', async () => {
    setKycStatus('pending');
    const store = makeStore({ role_name: 'Agent' });
    render(
      <Provider store={store}>
        <MemoryRouter>
          <IdentityDashboard />
        </MemoryRouter>
      </Provider>
    );

    await userEvent.click(screen.getByRole('button', { name: /resubmit|get started/i }));

    // Wait for Step 1 form
    await screen.findByLabelText(/NIN/i);

    // Both step labels are visible
    // "Identity Details" appears once as the stepper label and once as the form heading
    const identityDetailsElements = screen.getAllByText('Identity Details');
    expect(identityDetailsElements.length).toBeGreaterThanOrEqual(1);
    expect(screen.getByText('Document Type')).toBeInTheDocument();
  });

  it('Stepper step labels are NOT shown on the summary page (step === 0)', () => {
    setKycStatus('pending');
    renderDashboard();
    // On step 0 (summary), the stepper is not rendered so "Identity Details" step label absent
    // The page shows profile fields but no stepper steps
    expect(screen.queryByText('Identity Details')).not.toBeInTheDocument();
    expect(screen.queryByText('Document Type')).not.toBeInTheDocument();
  });

  it('Document select (Step 2) is not reachable from the summary without clicking a CTA', () => {
    setKycStatus('pending');
    const store = makeStore({ role_name: 'Agent' });
    renderDashboard(store);
    // Step 2 document select is absent until Step 1 is completed
    expect(screen.queryByRole('combobox')).not.toBeInTheDocument();
    expect(screen.queryByRole('button', { name: /Submit Document/i })).not.toBeInTheDocument();
  });

  it('Back button on Step 1 returns to summary without accessing Step 2', async () => {
    setKycStatus('pending');
    const store = makeStore({ role_name: 'Agent' });
    render(
      <Provider store={store}>
        <MemoryRouter>
          <IdentityDashboard />
        </MemoryRouter>
      </Provider>
    );

    await userEvent.click(screen.getByRole('button', { name: /resubmit|get started/i }));
    await screen.findByLabelText(/NIN/i);

    // Click Back (returns to step 0, never reaches step 2)
    await userEvent.click(screen.getByRole('button', { name: /back/i }));

    // Should be back on summary
    expect(screen.queryByRole('combobox')).not.toBeInTheDocument();
    expect(screen.getByText('Identity & KYC')).toBeInTheDocument();
  });
});

// =============================================================================
// AC-15: Back from Step 2 returns to Step 1; no API call; data preserved
// =============================================================================

describe('AC-15: Back from Step 2 returns to Step 1; no extra API call; data preserved', () => {
  it('clicking Back on Step 2 re-shows the Step 1 form', async () => {
    setKycStatus('pending');
    setSubmitProfileSuccess();
    const store = makeStore({ role_name: 'Agent' });
    render(
      <Provider store={store}>
        <MemoryRouter>
          <IdentityDashboard />
        </MemoryRouter>
      </Provider>
    );

    await userEvent.click(screen.getByRole('button', { name: /resubmit|get started/i }));
    await userEvent.click(await screen.findByRole('button', { name: /continue/i }));
    await screen.findByRole('heading', { name: 'Document Type' });

    // Click Back on Step 2
    const backButtons = screen.getAllByRole('button', { name: /back/i });
    await userEvent.click(backButtons[0]);

    // Step 1 form should be visible again
    expect(await screen.findByLabelText(/NIN/i)).toBeInTheDocument();
  });

  it('going Back from Step 2 does NOT trigger the document submit mutation', async () => {
    setKycStatus('pending');
    setSubmitProfileSuccess();
    submitDocumentArgs.length = 0;

    const store = makeStore({ role_name: 'Agent' });
    render(
      <Provider store={store}>
        <MemoryRouter>
          <IdentityDashboard />
        </MemoryRouter>
      </Provider>
    );

    await userEvent.click(screen.getByRole('button', { name: /resubmit|get started/i }));
    await userEvent.click(await screen.findByRole('button', { name: /continue/i }));
    await screen.findByRole('heading', { name: 'Document Type' });

    const backButtons = screen.getAllByRole('button', { name: /back/i });
    await userEvent.click(backButtons[0]);
    await screen.findByLabelText(/NIN/i);

    // No document submit calls
    expect(submitDocumentArgs.length).toBe(0);
  });

  it('typed address data in Step 1 is preserved when user comes back from Step 2', async () => {
    setKycStatus('pending');
    setSubmitProfileSuccess();

    const store = makeStore({ role_name: 'Agent' });
    render(
      <Provider store={store}>
        <MemoryRouter>
          <IdentityDashboard />
        </MemoryRouter>
      </Provider>
    );

    await userEvent.click(screen.getByRole('button', { name: /resubmit|get started/i }));
    await screen.findByLabelText(/Address/i);

    const addressInput = screen.getByLabelText(/Address/i) as HTMLInputElement;
    await userEvent.type(addressInput, '123 Test Street');

    await userEvent.click(screen.getByRole('button', { name: /continue/i }));
    await screen.findByRole('heading', { name: 'Document Type' });

    const backButtons = screen.getAllByRole('button', { name: /back/i });
    await userEvent.click(backButtons[0]);

    // After returning to Step 1, the address value should still be there
    const addressInputAfter = await screen.findByLabelText(/Address/i) as HTMLInputElement;
    expect(addressInputAfter.value).toBe('123 Test Street');
  });
});

// =============================================================================
// AC-16: Auditor role sees summary only — no CTA, no form
// =============================================================================

describe('AC-16: Auditor (no identity:submit) sees status summary only — no CTA, no form', () => {
  it('Auditor with existing profile does not see "Resubmit / Update" button', () => {
    setKycStatus('pending');
    const store = makeStore({ role_name: 'Auditor' });
    renderDashboard(store);
    expect(screen.queryByRole('button', { name: /resubmit/i })).not.toBeInTheDocument();
  });

  it('Auditor without a profile does not see "Get Started" button', () => {
    setKyc404();
    const store = makeStore({ role_name: 'Auditor' });
    renderDashboard(store);
    expect(screen.queryByRole('button', { name: /get started/i })).not.toBeInTheDocument();
  });

  it('Auditor without profile sees the "No KYC profile found" message', () => {
    setKyc404();
    const store = makeStore({ role_name: 'Auditor' });
    renderDashboard(store);
    expect(screen.getByText(/No KYC profile found/i)).toBeInTheDocument();
  });

  it('Auditor with pending status never sees the NIN form input', () => {
    setKycStatus('pending');
    const store = makeStore({ role_name: 'Auditor' });
    renderDashboard(store);
    expect(screen.queryByLabelText(/NIN/i)).not.toBeInTheDocument();
  });

  it('Auditor sees the KYC Status badge (status summary is visible)', () => {
    setKycStatus('submitted');
    const store = makeStore({ role_name: 'Auditor' });
    renderDashboard(store);
    expect(screen.getByText('SUBMITTED')).toBeInTheDocument();
  });

  it('Auditor sees the "Documents Submitted" section when profile exists', () => {
    setKycStatus('submitted');
    const store = makeStore({ role_name: 'Auditor' });
    renderDashboard(store);
    expect(screen.getByText('Documents Submitted')).toBeInTheDocument();
  });

  it('EnforcementOfficer role (also non-submitter) sees no "Resubmit" button', () => {
    setKycStatus('pending');
    const store = makeStore({ role_name: 'EnforcementOfficer' });
    renderDashboard(store);
    expect(screen.queryByRole('button', { name: /resubmit/i })).not.toBeInTheDocument();
  });
});
