/**
 * Acceptance Tests — KYC Admin Review frontend module
 *
 * AC-1   NationalAdmin/SuperAdmin see the review queue, not the personal form
 * AC-2   Queue rows show: full name, email, document type (or "—"), submitted date
 * AC-3   Pagination renders only when total > 20
 * AC-4   Status filter changes what table shows; filter change resets page to 1
 * AC-5   Empty queue shows "No KYC submissions found" (or similar)
 * AC-6   Non-admin roles still see their personal KYC submission form
 * AC-7   Review modal shows submitter name, email, masked NIN/TIN/BVN, all docs with links
 * AC-8   Modal checkboxes initialised from submission.nin_verified / submission.tin_verified
 * AC-9   Approve + Reject buttons active when kyc_status === 'submitted'; read-only when reviewed
 * AC-10  Approve sends { decision: 'verified', nin_verified, tin_verified }; 200 → modal closes, queue refreshes
 * AC-11  Reject sends { decision: 'rejected' }; 200 → modal closes, queue refreshes
 * AC-16  Backend 409 → frontend shows "already been reviewed" error message
 * AC-17  Queue row with no primary document shows "—", no crash
 */

import React from 'react';
import { describe, it, expect, vi, beforeEach } from 'vitest';
import { render, screen, waitFor, fireEvent } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { Provider } from 'react-redux';
import { configureStore } from '@reduxjs/toolkit';
import { MemoryRouter } from 'react-router-dom';
import { authReducer } from '@/screens/auth_screens/services/authSlice';
import { emptyApi } from '@/store/emptyApi';
import type { AdminKycSubmission } from '../services/types';

// ─── Mutable mock state objects ───────────────────────────────────────────────

type AdminSubmissionsShape = {
  isLoading: boolean;
  data?: {
    success: boolean;
    data: {
      submissions: AdminKycSubmission[];
      total: number;
      page: number;
      limit: number;
    };
  };
};

type ReviewMutationShape = {
  unwrap: () => Promise<unknown>;
};

// Mutable state controlled by each test
let adminSubmissionsState: AdminSubmissionsShape = {
  isLoading: false,
  data: undefined,
};
let reviewMutationResult: ReviewMutationShape = {
  unwrap: () => Promise.resolve({ success: true, data: {} }),
};
let isReviewingMock = false;

// Track call arguments
const reviewMutationArgs: unknown[] = [];
// Track which status filter was last queried
let lastQueriedStatus: string | null = null;
let lastQueriedPage: number | null = null;

// Mock the identitySlice RTK Query hooks used by KycReviewQueue and KycReviewModal
vi.mock('../services/identitySlice', () => ({
  useGetKycStatusQuery: () => ({
    isLoading: false,
    data: undefined,
    error: { status: 404 },
    refetch: vi.fn(),
  }),
  useGetIdentityProfileQuery: () => ({
    data: undefined,
    isFetching: false,
  }),
  useSubmitProfileMutation: () => [vi.fn(() => ({ unwrap: () => Promise.resolve({}) })), { isLoading: false }],
  useSubmitDocumentMutation: () => [vi.fn(() => ({ unwrap: () => Promise.resolve({}) })), { isLoading: false }],
  useGetAdminSubmissionsQuery: (args: { page: number; limit: number; kyc_status: string }) => {
    lastQueriedStatus = args.kyc_status;
    lastQueriedPage = args.page;
    return adminSubmissionsState;
  },
  useReviewIdentityMutation: () => [
    (arg: unknown) => {
      reviewMutationArgs.push(arg);
      return reviewMutationResult;
    },
    { isLoading: isReviewingMock },
  ],
}));

// ─── Sample fixture data ──────────────────────────────────────────────────────

const SUBMISSION_WITH_DOC: AdminKycSubmission = {
  id: 'identity-1',
  user_id: 'user-1',
  full_name: 'Jane Okonkwo',
  email: 'jane@example.com',
  kyc_status: 'submitted',
  nin: '12345678901',
  tin: '1234567890',
  bvn: '12345678901',
  date_of_birth: '1990-05-20',
  address: '42 Broad St, Lagos',
  tems_id: null,
  nin_verified: false,
  tin_verified: false,
  reviewed_by: null,
  reviewed_at: null,
  created_at: '2024-01-10T08:00:00.000Z',
  updated_at: '2024-01-10T08:00:00.000Z',
  primary_document: {
    id: 'doc-1',
    id_type: 'national_id',
    document_url: 'https://cdn.example.com/doc1.pdf',
    selfie_url: 'https://cdn.example.com/selfie1.jpg',
    uploaded_at: '2024-01-10T09:00:00.000Z',
  },
  all_documents: [
    {
      id: 'doc-1',
      id_type: 'national_id',
      document_url: 'https://cdn.example.com/doc1.pdf',
      selfie_url: 'https://cdn.example.com/selfie1.jpg',
      is_primary: true,
      uploaded_at: '2024-01-10T09:00:00.000Z',
    },
  ],
};

const SUBMISSION_NO_DOC: AdminKycSubmission = {
  id: 'identity-2',
  user_id: 'user-2',
  full_name: 'Ade Musa',
  email: 'ade@example.com',
  kyc_status: 'submitted',
  nin: '98765432101',
  tin: null,
  bvn: null,
  date_of_birth: null,
  address: null,
  tems_id: null,
  nin_verified: true,
  tin_verified: false,
  reviewed_by: null,
  reviewed_at: null,
  created_at: '2024-01-11T08:00:00.000Z',
  updated_at: '2024-01-11T08:00:00.000Z',
  primary_document: null,
  all_documents: [],
};

const SUBMISSION_ALREADY_VERIFIED: AdminKycSubmission = {
  ...SUBMISSION_WITH_DOC,
  id: 'identity-3',
  kyc_status: 'verified',
  nin_verified: true,
  tin_verified: true,
  tems_id: 'TEMS-2024-000001',
  reviewed_by: 'admin-user-id',
  reviewed_at: '2024-01-12T10:00:00.000Z',
};

// ─── Store factory ────────────────────────────────────────────────────────────

function makeStore(role_name = 'NationalAdmin') {
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
          id: 'admin-1',
          email: 'admin@tems.ng',
          phone: '+2348000000001',
          full_name: 'Admin User',
          status: 'active',
          org_id: 'org-1',
          role_id: 'r-admin',
          role_name,
          phone_verified: true,
        },
      },
    },
    middleware: (gDM) => gDM({ serializableCheck: false }).concat(emptyApi.middleware),
  });
}

// ─── Render helpers ───────────────────────────────────────────────────────────

import IdentityDashboard from '../IdentityDashboard';
import KycReviewModal from '../KycReviewModal';

function renderDashboard(role_name = 'NationalAdmin') {
  const store = makeStore(role_name);
  return render(
    <Provider store={store}>
      <MemoryRouter>
        <IdentityDashboard />
      </MemoryRouter>
    </Provider>
  );
}

function renderModal(submission: AdminKycSubmission, onClose = vi.fn()) {
  const store = makeStore();
  return render(
    <Provider store={store}>
      <MemoryRouter>
        <KycReviewModal submission={submission} onClose={onClose} />
      </MemoryRouter>
    </Provider>
  );
}

// ─── Reset before each test ───────────────────────────────────────────────────

beforeEach(() => {
  adminSubmissionsState = { isLoading: false, data: undefined };
  reviewMutationResult = { unwrap: () => Promise.resolve({ success: true, data: {} }) };
  isReviewingMock = false;
  reviewMutationArgs.length = 0;
  lastQueriedStatus = null;
  lastQueriedPage = null;
});

// =============================================================================
// AC-1: NationalAdmin / SuperAdmin see the review queue, not personal form
// =============================================================================

describe('AC-1: Admin roles see review queue instead of personal KYC form', () => {
  it('NationalAdmin sees "Identity & KYC Review" heading (queue view)', () => {
    adminSubmissionsState = {
      isLoading: false,
      data: { success: true, data: { submissions: [], total: 0, page: 1, limit: 20 } },
    };
    renderDashboard('NationalAdmin');
    expect(screen.getByText('Identity & KYC Review')).toBeInTheDocument();
  });

  it('SuperAdmin sees "Identity & KYC Review" heading (queue view)', () => {
    adminSubmissionsState = {
      isLoading: false,
      data: { success: true, data: { submissions: [], total: 0, page: 1, limit: 20 } },
    };
    renderDashboard('SuperAdmin');
    expect(screen.getByText('Identity & KYC Review')).toBeInTheDocument();
  });

  it('NationalAdmin does NOT see personal "Identity & KYC" page heading', () => {
    adminSubmissionsState = {
      isLoading: false,
      data: { success: true, data: { submissions: [], total: 0, page: 1, limit: 20 } },
    };
    renderDashboard('NationalAdmin');
    // The personal form heading is just "Identity & KYC" (no "Review" suffix)
    // The queue heading is "Identity & KYC Review"
    // We want the personal form heading to be absent
    const headings = screen.getAllByRole('heading');
    const personalFormHeading = headings.find(
      (h) => h.textContent === 'Identity & KYC'
    );
    expect(personalFormHeading).toBeUndefined();
  });

  it('NationalAdmin sees the status filter select (queue-specific element)', () => {
    adminSubmissionsState = {
      isLoading: false,
      data: { success: true, data: { submissions: [], total: 0, page: 1, limit: 20 } },
    };
    renderDashboard('NationalAdmin');
    expect(screen.getByRole('combobox')).toBeInTheDocument();
  });
});

// =============================================================================
// AC-2: Queue rows show full name, email, document type, submitted date
// =============================================================================

describe('AC-2: Queue rows show full name, email, document type, submitted date', () => {
  beforeEach(() => {
    adminSubmissionsState = {
      isLoading: false,
      data: {
        success: true,
        data: { submissions: [SUBMISSION_WITH_DOC], total: 1, page: 1, limit: 20 },
      },
    };
  });

  it('shows the submitter full name in the table', () => {
    renderDashboard('NationalAdmin');
    expect(screen.getByText('Jane Okonkwo')).toBeInTheDocument();
  });

  it('shows the submitter email in the table', () => {
    renderDashboard('NationalAdmin');
    expect(screen.getByText('jane@example.com')).toBeInTheDocument();
  });

  it('shows the human-readable document type label in the table', () => {
    renderDashboard('NationalAdmin');
    expect(screen.getByText('National ID')).toBeInTheDocument();
  });

  it('shows a submitted date in the table', () => {
    renderDashboard('NationalAdmin');
    // The date rendered is primary_document.uploaded_at or created_at formatted as locale date
    const dateStr = new Date('2024-01-10T09:00:00.000Z').toLocaleDateString();
    expect(screen.getByText(dateStr)).toBeInTheDocument();
  });

  it('shows table column headers: Full Name, Email, Document Type, Submitted, Status', () => {
    renderDashboard('NationalAdmin');
    expect(screen.getByText('Full Name')).toBeInTheDocument();
    expect(screen.getByText('Email')).toBeInTheDocument();
    expect(screen.getByText('Document Type')).toBeInTheDocument();
    expect(screen.getByText('Submitted')).toBeInTheDocument();
    expect(screen.getByText('Status')).toBeInTheDocument();
  });
});

// =============================================================================
// AC-3: Pagination renders only when total > 20
// =============================================================================

describe('AC-3: Pagination renders only when total > 20', () => {
  it('does NOT render pagination when total is exactly 20', () => {
    adminSubmissionsState = {
      isLoading: false,
      data: { success: true, data: { submissions: [], total: 20, page: 1, limit: 20 } },
    };
    renderDashboard('NationalAdmin');
    // Pagination component renders Previous/Next buttons; should be absent when total <= 20
    expect(screen.queryByRole('button', { name: /Previous/i })).not.toBeInTheDocument();
    expect(screen.queryByRole('button', { name: /Next/i })).not.toBeInTheDocument();
  });

  it('does NOT render pagination when total is 0', () => {
    adminSubmissionsState = {
      isLoading: false,
      data: { success: true, data: { submissions: [], total: 0, page: 1, limit: 20 } },
    };
    renderDashboard('NationalAdmin');
    expect(screen.queryByRole('button', { name: /Previous/i })).not.toBeInTheDocument();
    expect(screen.queryByRole('button', { name: /Next/i })).not.toBeInTheDocument();
  });

  it('renders pagination when total is 21', () => {
    adminSubmissionsState = {
      isLoading: false,
      data: { success: true, data: { submissions: [], total: 21, page: 1, limit: 20 } },
    };
    renderDashboard('NationalAdmin');
    // Pagination component renders Previous and Next buttons when total > PAGE_SIZE (20)
    expect(screen.getByRole('button', { name: /Previous/i })).toBeInTheDocument();
    expect(screen.getByRole('button', { name: /Next/i })).toBeInTheDocument();
  });

  it('renders pagination when total is 100', () => {
    adminSubmissionsState = {
      isLoading: false,
      data: { success: true, data: { submissions: [], total: 100, page: 1, limit: 20 } },
    };
    renderDashboard('NationalAdmin');
    expect(screen.getByRole('button', { name: /Previous/i })).toBeInTheDocument();
    expect(screen.getByRole('button', { name: /Next/i })).toBeInTheDocument();
  });
});

// =============================================================================
// AC-4: Status filter changes query; filter change resets page to 1
// =============================================================================

describe('AC-4: Status filter drives the query; filter change resets page to 1', () => {
  it('initial status filter value is "submitted" (default)', () => {
    adminSubmissionsState = {
      isLoading: false,
      data: { success: true, data: { submissions: [], total: 0, page: 1, limit: 20 } },
    };
    renderDashboard('NationalAdmin');
    const select = screen.getByRole('combobox') as HTMLSelectElement;
    expect(select.value).toBe('submitted');
  });

  it('renders all status filter options', () => {
    adminSubmissionsState = {
      isLoading: false,
      data: { success: true, data: { submissions: [], total: 0, page: 1, limit: 20 } },
    };
    renderDashboard('NationalAdmin');
    expect(screen.getByRole('option', { name: /Submitted/i })).toBeInTheDocument();
    expect(screen.getByRole('option', { name: /Verified/i })).toBeInTheDocument();
    expect(screen.getByRole('option', { name: /Rejected/i })).toBeInTheDocument();
    expect(screen.getByRole('option', { name: /All Statuses/i })).toBeInTheDocument();
  });

  it('changing filter to "verified" passes kyc_status=verified to the query', async () => {
    adminSubmissionsState = {
      isLoading: false,
      data: { success: true, data: { submissions: [], total: 0, page: 1, limit: 20 } },
    };
    renderDashboard('NationalAdmin');
    const select = screen.getByRole('combobox');
    await userEvent.selectOptions(select, 'verified');
    expect(lastQueriedStatus).toBe('verified');
  });

  it('changing filter resets page to 1', async () => {
    adminSubmissionsState = {
      isLoading: false,
      data: { success: true, data: { submissions: [], total: 0, page: 1, limit: 20 } },
    };
    renderDashboard('NationalAdmin');
    const select = screen.getByRole('combobox');
    await userEvent.selectOptions(select, 'all');
    // After filter change, the hook should be querying page 1
    expect(lastQueriedPage).toBe(1);
  });
});

// =============================================================================
// AC-5: Empty queue shows "No KYC submissions found"
// =============================================================================

describe('AC-5: Empty queue shows "No KYC submissions found" message', () => {
  it('shows empty state message when submissions list is empty', () => {
    adminSubmissionsState = {
      isLoading: false,
      data: { success: true, data: { submissions: [], total: 0, page: 1, limit: 20 } },
    };
    renderDashboard('NationalAdmin');
    expect(
      screen.getByText(/No KYC submissions found/i)
    ).toBeInTheDocument();
  });

  it('shows result count of 0 when no submissions', () => {
    adminSubmissionsState = {
      isLoading: false,
      data: { success: true, data: { submissions: [], total: 0, page: 1, limit: 20 } },
    };
    renderDashboard('NationalAdmin');
    expect(screen.getByText('0 results')).toBeInTheDocument();
  });
});

// =============================================================================
// AC-6: Non-admin roles still see their personal KYC submission form
// =============================================================================

describe('AC-6: Non-admin roles see personal KYC form, not the review queue', () => {
  it('Agent role sees "Identity & KYC" heading (personal form), not "Review"', () => {
    renderDashboard('Agent');
    expect(screen.getByText('Identity & KYC')).toBeInTheDocument();
    expect(screen.queryByText('Identity & KYC Review')).not.toBeInTheDocument();
  });

  it('Agent does NOT see the status filter select (queue-specific element)', () => {
    renderDashboard('Agent');
    // The personal form page does not have the status filter
    // (no combobox on the summary step)
    expect(screen.queryByLabelText(/Status:/i)).not.toBeInTheDocument();
  });

  it('CorporateAccount role sees personal form heading', () => {
    renderDashboard('CorporateAccount');
    expect(screen.getByText('Identity & KYC')).toBeInTheDocument();
  });

  it('Auditor role sees personal form heading (not review queue)', () => {
    renderDashboard('Auditor');
    expect(screen.getByText('Identity & KYC')).toBeInTheDocument();
    expect(screen.queryByText('Identity & KYC Review')).not.toBeInTheDocument();
  });
});

// =============================================================================
// AC-7: Review modal shows name, email, masked NIN/TIN/BVN, all docs with links
// =============================================================================

describe('AC-7: Review modal shows submitter details, masked sensitive values, document links', () => {
  it('shows the submitter full name in the modal', () => {
    renderModal(SUBMISSION_WITH_DOC);
    expect(screen.getByText('Jane Okonkwo')).toBeInTheDocument();
  });

  it('shows the submitter email in the modal', () => {
    renderModal(SUBMISSION_WITH_DOC);
    expect(screen.getByText('jane@example.com')).toBeInTheDocument();
  });

  it('shows NIN field label in the modal', () => {
    renderModal(SUBMISSION_WITH_DOC);
    expect(screen.getByText('NIN')).toBeInTheDocument();
  });

  it('shows TIN field label in the modal', () => {
    renderModal(SUBMISSION_WITH_DOC);
    expect(screen.getByText('TIN')).toBeInTheDocument();
  });

  it('shows BVN field label in the modal', () => {
    renderModal(SUBMISSION_WITH_DOC);
    expect(screen.getByText('BVN')).toBeInTheDocument();
  });

  it('masks NIN — shows last 4 chars with bullet prefix', () => {
    renderModal(SUBMISSION_WITH_DOC);
    // NIN is '12345678901' (11 chars) → masked to '•••••••8901'
    // BVN is also 11 chars with same last 4 digits, so getAllByText is needed
    const maskedNin = '•'.repeat(7) + '8901';
    const matches = screen.getAllByText(maskedNin);
    expect(matches.length).toBeGreaterThanOrEqual(1);
  });

  it('shows "—" for null TIN in modal', () => {
    renderModal(SUBMISSION_NO_DOC);
    // tin is null → maskSensitiveValue returns '—'
    // There will be multiple '—' values; just check at least one is present
    expect(screen.getAllByText('—').length).toBeGreaterThanOrEqual(1);
  });

  it('shows "View Document" link for each document', () => {
    renderModal(SUBMISSION_WITH_DOC);
    expect(screen.getByRole('link', { name: /View Document/i })).toBeInTheDocument();
  });

  it('View Document link has correct href', () => {
    renderModal(SUBMISSION_WITH_DOC);
    const link = screen.getByRole('link', { name: /View Document/i }) as HTMLAnchorElement;
    expect(link.href).toBe('https://cdn.example.com/doc1.pdf');
  });

  it('shows "View Selfie" link when selfie_url is present', () => {
    renderModal(SUBMISSION_WITH_DOC);
    expect(screen.getByRole('link', { name: /View Selfie/i })).toBeInTheDocument();
  });

  it('shows "No documents uploaded" when all_documents is empty', () => {
    renderModal(SUBMISSION_NO_DOC);
    expect(screen.getByText('No documents uploaded.')).toBeInTheDocument();
  });

  it('modal title includes submitter name', () => {
    renderModal(SUBMISSION_WITH_DOC);
    expect(screen.getByText(/KYC Review — Jane Okonkwo/i)).toBeInTheDocument();
  });
});

// =============================================================================
// AC-8: Modal checkboxes initialised from submission.nin_verified / tin_verified
// =============================================================================

describe('AC-8: Modal checkboxes initialised from submission.nin_verified / tin_verified', () => {
  it('NIN Verified checkbox is unchecked when submission.nin_verified is false', () => {
    // SUBMISSION_WITH_DOC has nin_verified: false, tin_verified: false, status: 'submitted'
    renderModal(SUBMISSION_WITH_DOC);
    const ninCheckbox = screen.getByRole('checkbox', { name: /NIN Verified/i }) as HTMLInputElement;
    expect(ninCheckbox.checked).toBe(false);
  });

  it('TIN Verified checkbox is unchecked when submission.tin_verified is false', () => {
    renderModal(SUBMISSION_WITH_DOC);
    const tinCheckbox = screen.getByRole('checkbox', { name: /TIN Verified/i }) as HTMLInputElement;
    expect(tinCheckbox.checked).toBe(false);
  });

  it('NIN Verified checkbox is checked when submission.nin_verified is true', () => {
    const submissionNinTrue: AdminKycSubmission = {
      ...SUBMISSION_WITH_DOC,
      nin_verified: true,
      tin_verified: false,
    };
    renderModal(submissionNinTrue);
    const ninCheckbox = screen.getByRole('checkbox', { name: /NIN Verified/i }) as HTMLInputElement;
    expect(ninCheckbox.checked).toBe(true);
  });

  it('TIN Verified checkbox is checked when submission.tin_verified is true', () => {
    const submissionTinTrue: AdminKycSubmission = {
      ...SUBMISSION_WITH_DOC,
      nin_verified: false,
      tin_verified: true,
    };
    renderModal(submissionTinTrue);
    const tinCheckbox = screen.getByRole('checkbox', { name: /TIN Verified/i }) as HTMLInputElement;
    expect(tinCheckbox.checked).toBe(true);
  });
});

// =============================================================================
// AC-9: Approve + Reject active when 'submitted'; read-only view when reviewed
// =============================================================================

describe('AC-9: Action buttons active for submitted; read-only for already-reviewed', () => {
  it('Approve button is present when kyc_status is "submitted"', () => {
    renderModal(SUBMISSION_WITH_DOC);
    expect(screen.getByRole('button', { name: /Approve/i })).toBeInTheDocument();
  });

  it('Reject button is present when kyc_status is "submitted"', () => {
    renderModal(SUBMISSION_WITH_DOC);
    expect(screen.getByRole('button', { name: /Reject/i })).toBeInTheDocument();
  });

  it('Approve and Reject buttons are NOT present when already verified', () => {
    renderModal(SUBMISSION_ALREADY_VERIFIED);
    expect(screen.queryByRole('button', { name: /Approve/i })).not.toBeInTheDocument();
    expect(screen.queryByRole('button', { name: /Reject/i })).not.toBeInTheDocument();
  });

  it('shows "Review Outcome" section header for already-reviewed submission', () => {
    renderModal(SUBMISSION_ALREADY_VERIFIED);
    expect(screen.getByText('Review Outcome')).toBeInTheDocument();
  });

  it('shows VERIFIED status badge in outcome section for verified submission', () => {
    renderModal(SUBMISSION_ALREADY_VERIFIED);
    expect(screen.getByText('VERIFIED')).toBeInTheDocument();
  });

  it('shows TeMS ID for verified submission', () => {
    renderModal(SUBMISSION_ALREADY_VERIFIED);
    expect(screen.getByText('TEMS-2024-000001')).toBeInTheDocument();
  });

  it('shows "Review Decision" section header for pending submission', () => {
    renderModal(SUBMISSION_WITH_DOC);
    expect(screen.getByText('Review Decision')).toBeInTheDocument();
  });
});

// =============================================================================
// AC-10: Approve sends correct payload; on 200 modal closes + queue refreshes
// =============================================================================

describe('AC-10: Approve sends { decision: verified, nin_verified, tin_verified }; modal closes on success', () => {
  it('clicking Approve calls reviewIdentity with decision: "verified"', async () => {
    reviewMutationResult = { unwrap: () => Promise.resolve({ success: true, data: {} }) };
    renderModal(SUBMISSION_WITH_DOC);
    await userEvent.click(screen.getByRole('button', { name: /Approve/i }));
    await waitFor(() => expect(reviewMutationArgs.length).toBe(1));
    const call = reviewMutationArgs[0] as { id: string; body: { decision: string } };
    expect(call.body.decision).toBe('verified');
  });

  it('Approve payload includes nin_verified field', async () => {
    reviewMutationResult = { unwrap: () => Promise.resolve({ success: true, data: {} }) };
    renderModal(SUBMISSION_WITH_DOC);
    await userEvent.click(screen.getByRole('button', { name: /Approve/i }));
    await waitFor(() => expect(reviewMutationArgs.length).toBe(1));
    const call = reviewMutationArgs[0] as { id: string; body: { decision: string; nin_verified: boolean } };
    expect(call.body).toHaveProperty('nin_verified');
  });

  it('Approve payload includes tin_verified field', async () => {
    reviewMutationResult = { unwrap: () => Promise.resolve({ success: true, data: {} }) };
    renderModal(SUBMISSION_WITH_DOC);
    await userEvent.click(screen.getByRole('button', { name: /Approve/i }));
    await waitFor(() => expect(reviewMutationArgs.length).toBe(1));
    const call = reviewMutationArgs[0] as { id: string; body: { decision: string; tin_verified: boolean } };
    expect(call.body).toHaveProperty('tin_verified');
  });

  it('Approve payload carries nin_verified: true when checkbox is checked', async () => {
    reviewMutationResult = { unwrap: () => Promise.resolve({ success: true, data: {} }) };
    renderModal(SUBMISSION_WITH_DOC);
    // Check the NIN Verified checkbox before approving
    const ninCheckbox = screen.getByRole('checkbox', { name: /NIN Verified/i });
    await userEvent.click(ninCheckbox);
    await userEvent.click(screen.getByRole('button', { name: /Approve/i }));
    await waitFor(() => expect(reviewMutationArgs.length).toBe(1));
    const call = reviewMutationArgs[0] as { id: string; body: { nin_verified: boolean } };
    expect(call.body.nin_verified).toBe(true);
  });

  it('Approve sends the correct submission id', async () => {
    reviewMutationResult = { unwrap: () => Promise.resolve({ success: true, data: {} }) };
    renderModal(SUBMISSION_WITH_DOC);
    await userEvent.click(screen.getByRole('button', { name: /Approve/i }));
    await waitFor(() => expect(reviewMutationArgs.length).toBe(1));
    const call = reviewMutationArgs[0] as { id: string };
    expect(call.id).toBe('identity-1');
  });

  it('on successful approve, onClose is called (modal closes)', async () => {
    const onClose = vi.fn();
    reviewMutationResult = { unwrap: () => Promise.resolve({ success: true, data: {} }) };
    const store = makeStore();
    render(
      <Provider store={store}>
        <MemoryRouter>
          <KycReviewModal submission={SUBMISSION_WITH_DOC} onClose={onClose} />
        </MemoryRouter>
      </Provider>
    );
    await userEvent.click(screen.getByRole('button', { name: /Approve/i }));
    await waitFor(() => expect(onClose).toHaveBeenCalledTimes(1));
  });
});

// =============================================================================
// AC-11: Reject sends { decision: 'rejected' }; on 200 modal closes
// =============================================================================

describe('AC-11: Reject sends { decision: rejected }; modal closes on success', () => {
  it('clicking Reject calls reviewIdentity with decision: "rejected"', async () => {
    reviewMutationResult = { unwrap: () => Promise.resolve({ success: true, data: {} }) };
    renderModal(SUBMISSION_WITH_DOC);
    await userEvent.click(screen.getByRole('button', { name: /Reject/i }));
    await waitFor(() => expect(reviewMutationArgs.length).toBe(1));
    const call = reviewMutationArgs[0] as { id: string; body: { decision: string } };
    expect(call.body.decision).toBe('rejected');
  });

  it('Reject payload does NOT include nin_verified or tin_verified', async () => {
    reviewMutationResult = { unwrap: () => Promise.resolve({ success: true, data: {} }) };
    renderModal(SUBMISSION_WITH_DOC);
    await userEvent.click(screen.getByRole('button', { name: /Reject/i }));
    await waitFor(() => expect(reviewMutationArgs.length).toBe(1));
    const call = reviewMutationArgs[0] as { id: string; body: Record<string, unknown> };
    expect(call.body).not.toHaveProperty('nin_verified');
    expect(call.body).not.toHaveProperty('tin_verified');
  });

  it('on successful reject, onClose is called (modal closes)', async () => {
    const onClose = vi.fn();
    reviewMutationResult = { unwrap: () => Promise.resolve({ success: true, data: {} }) };
    const store = makeStore();
    render(
      <Provider store={store}>
        <MemoryRouter>
          <KycReviewModal submission={SUBMISSION_WITH_DOC} onClose={onClose} />
        </MemoryRouter>
      </Provider>
    );
    await userEvent.click(screen.getByRole('button', { name: /Reject/i }));
    await waitFor(() => expect(onClose).toHaveBeenCalledTimes(1));
  });
});

// =============================================================================
// AC-16: 409 from backend → frontend shows "already been reviewed" error
// =============================================================================

describe('AC-16: 409 backend response → frontend shows "already reviewed" error message', () => {
  it('shows "already been reviewed" message when approve returns 409', async () => {
    reviewMutationResult = {
      unwrap: () => Promise.reject({ status: 409, data: { message: 'Already reviewed' } }),
    };
    renderModal(SUBMISSION_WITH_DOC);
    await userEvent.click(screen.getByRole('button', { name: /Approve/i }));
    await waitFor(() =>
      expect(
        screen.getByText(/already been reviewed/i)
      ).toBeInTheDocument()
    );
  });

  it('shows "already been reviewed" message when reject returns 409', async () => {
    reviewMutationResult = {
      unwrap: () => Promise.reject({ status: 409, data: { message: 'Already reviewed' } }),
    };
    renderModal(SUBMISSION_WITH_DOC);
    await userEvent.click(screen.getByRole('button', { name: /Reject/i }));
    await waitFor(() =>
      expect(
        screen.getByText(/already been reviewed/i)
      ).toBeInTheDocument()
    );
  });

  it('modal does NOT close when 409 error occurs', async () => {
    const onClose = vi.fn();
    reviewMutationResult = {
      unwrap: () => Promise.reject({ status: 409, data: { message: 'Already reviewed' } }),
    };
    const store = makeStore();
    render(
      <Provider store={store}>
        <MemoryRouter>
          <KycReviewModal submission={SUBMISSION_WITH_DOC} onClose={onClose} />
        </MemoryRouter>
      </Provider>
    );
    await userEvent.click(screen.getByRole('button', { name: /Approve/i }));
    await screen.findByText(/already been reviewed/i);
    expect(onClose).not.toHaveBeenCalled();
  });

  it('shows generic error message for non-409 review failures', async () => {
    reviewMutationResult = {
      unwrap: () => Promise.reject({ status: 500, data: { message: 'Internal error' } }),
    };
    renderModal(SUBMISSION_WITH_DOC);
    await userEvent.click(screen.getByRole('button', { name: /Approve/i }));
    await waitFor(() =>
      expect(screen.getByText('Internal error')).toBeInTheDocument()
    );
  });
});

// =============================================================================
// AC-17: Queue row with no primary document shows "—", no crash
// =============================================================================

describe('AC-17: Queue row with no primary_document shows "—" in Document Type column, no crash', () => {
  it('renders "—" in Document Type column for submission with no primary document', () => {
    adminSubmissionsState = {
      isLoading: false,
      data: {
        success: true,
        data: { submissions: [SUBMISSION_NO_DOC], total: 1, page: 1, limit: 20 },
      },
    };
    renderDashboard('NationalAdmin');
    // The DOC_TYPE_LABELS lookup returns undefined for empty string → fallback "—"
    expect(screen.getByText('—')).toBeInTheDocument();
  });

  it('does not crash when rendering a submission with null primary_document', () => {
    adminSubmissionsState = {
      isLoading: false,
      data: {
        success: true,
        data: { submissions: [SUBMISSION_NO_DOC], total: 1, page: 1, limit: 20 },
      },
    };
    expect(() => renderDashboard('NationalAdmin')).not.toThrow();
  });

  it('still shows submitter full name when primary_document is null', () => {
    adminSubmissionsState = {
      isLoading: false,
      data: {
        success: true,
        data: { submissions: [SUBMISSION_NO_DOC], total: 1, page: 1, limit: 20 },
      },
    };
    renderDashboard('NationalAdmin');
    expect(screen.getByText('Ade Musa')).toBeInTheDocument();
  });

  it('modal for no-doc submission shows "No documents uploaded" without crashing', () => {
    expect(() => renderModal(SUBMISSION_NO_DOC)).not.toThrow();
    expect(screen.getByText('No documents uploaded.')).toBeInTheDocument();
  });
});
