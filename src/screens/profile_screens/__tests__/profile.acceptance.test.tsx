/**
 * Acceptance Tests — Profile module frontend
 *
 * AC-01  ProfileScreen shows loading spinner while fetching
 * AC-02  ProfileScreen shows profile data (full_name, email, phone, role_name, email_verified badge)
 * AC-03  ProfileScreen allows editing full_name inline with Save/Cancel
 * AC-04  ProfileScreen shows error state on fetch failure
 * AC-05  ProfileScreen links to change-password, change-email, and settings
 * AC-06  ChangePasswordScreen has three password fields and a submit button
 * AC-07  ChangePasswordScreen shows "Current password is incorrect" on 401
 * AC-08  ChangePasswordScreen shows "New password must differ" on 422
 * AC-09  ChangePasswordScreen shows generic error on other failures
 * AC-10  ChangeEmailScreen step 1 shows email input; step 2 shows OTP input with new_email
 * AC-11  ProfileSettingsScreen shows common settings for all roles
 * AC-12  ProfileSettingsScreen shows agent-only fields for Agent role
 * AC-13  ProfileSettingsScreen shows admin digest field for SuperAdmin role
 * AC-14  ProfileSettingsScreen does NOT show agent fields for admin roles
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

// ─── Mutable hook state ───────────────────────────────────────────────────────

type ProfileShape = {
  data?: { success: true; data: {
    id: string; full_name: string; email: string; phone: string; role_name: string;
    email_verified: boolean; phone_verified: boolean; status: string; org_id: string;
    last_login_at: string | null; created_at: string; updated_at: string;
  }};
  isLoading: boolean;
  error?: unknown;
};

type SettingsShape = {
  data?: { success: true; data: {
    notifications_enabled: boolean; email_notifications: boolean; theme: 'light' | 'dark' | 'system';
    scan_sound_enabled?: boolean; offline_mode_hint?: boolean; digest_frequency?: 'daily' | 'weekly' | 'none';
  }};
  isLoading: boolean;
};

let profileState: ProfileShape = { isLoading: false };
let settingsState: SettingsShape = { isLoading: false };
let updateProfileResult: { unwrap: () => Promise<unknown> } = { unwrap: () => Promise.resolve({ success: true, data: {} }) };
let changePasswordResult: { unwrap: () => Promise<unknown> } = { unwrap: () => Promise.resolve({ success: true, data: { message: 'ok' } }) };
let initiateResult: { unwrap: () => Promise<unknown> } = { unwrap: () => Promise.resolve({ success: true, data: { message: 'sent' } }) };
let confirmResult: { unwrap: () => Promise<unknown> } = { unwrap: () => Promise.resolve({ success: true, data: { message: 'confirmed' } }) };
let updateSettingsResult: { unwrap: () => Promise<unknown> } = { unwrap: () => Promise.resolve({ success: true, data: {} }) };

const changePasswordArgs: unknown[] = [];
const updateProfileArgs: unknown[] = [];

// ─── Mock the profileSlice hooks ─────────────────────────────────────────────

vi.mock('../services/profileSlice', () => ({
  useGetProfileQuery: () => profileState,
  useUpdateProfileMutation: () => [
    (arg: unknown) => { updateProfileArgs.push(arg); return updateProfileResult; },
    { isLoading: false },
  ],
  useChangePasswordMutation: () => [
    (arg: unknown) => { changePasswordArgs.push(arg); return changePasswordResult; },
    { isLoading: false },
  ],
  useInitiateEmailChangeMutation: () => [
    () => initiateResult,
    { isLoading: false },
  ],
  useConfirmEmailChangeMutation: () => [
    () => confirmResult,
    { isLoading: false },
  ],
  useGetSettingsQuery: () => settingsState,
  useUpdateSettingsMutation: () => [
    () => updateSettingsResult,
    { isLoading: false },
  ],
}));

// ─── Store factory ────────────────────────────────────────────────────────────

function makeStore(roleName = 'Agent') {
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
          id: 'u-1', email: 'agent@test.com', phone: '+2348000000000',
          full_name: 'Test User', status: 'active', org_id: 'org-1',
          role_id: 'r-1', role_name: roleName, phone_verified: true,
        },
      },
    },
    middleware: (gDM) => gDM({ serializableCheck: false }).concat(emptyApi.middleware),
  });
}

// ─── Imports after mocks ──────────────────────────────────────────────────────

import ProfileScreen from '../ProfileScreen';
import ChangePasswordScreen from '../ChangePasswordScreen';
import ChangeEmailScreen from '../ChangeEmailScreen';
import ProfileSettingsScreen from '../ProfileSettingsScreen';

function renderWithStore(ui: React.ReactElement, store = makeStore()) {
  return render(
    <Provider store={store}>
      <MemoryRouter>
        {ui}
      </MemoryRouter>
    </Provider>
  );
}

// ─── Helpers ─────────────────────────────────────────────────────────────────

function setProfileLoading() {
  profileState = { isLoading: true };
}

function setProfileData(overrides: Partial<NonNullable<ProfileShape['data']>['data']> = {}) {
  profileState = {
    isLoading: false,
    data: {
      success: true,
      data: {
        id: 'u-1', full_name: 'Jane Doe', email: 'jane@example.com',
        phone: '+2348000000000', role_name: 'Agent', email_verified: true,
        phone_verified: true, status: 'active', org_id: 'org-1',
        last_login_at: null, created_at: '2024-01-01T00:00:00Z', updated_at: '2024-01-01T00:00:00Z',
        ...overrides,
      },
    },
  };
}

function setProfileError() {
  profileState = { isLoading: false, error: { status: 500, data: { message: 'Server error' } } };
}

function setSettingsData(overrides: Partial<NonNullable<SettingsShape['data']>['data']> = {}) {
  settingsState = {
    isLoading: false,
    data: {
      success: true,
      data: {
        notifications_enabled: true, email_notifications: false, theme: 'system',
        scan_sound_enabled: false, offline_mode_hint: false, digest_frequency: 'none',
        ...overrides,
      },
    },
  };
}

// ─── Reset before each test ───────────────────────────────────────────────────

beforeEach(() => {
  profileState = { isLoading: false };
  settingsState = { isLoading: false };
  updateProfileResult = { unwrap: () => Promise.resolve({ success: true, data: {} }) };
  changePasswordResult = { unwrap: () => Promise.resolve({ success: true, data: { message: 'ok' } }) };
  initiateResult = { unwrap: () => Promise.resolve({ success: true, data: { message: 'sent' } }) };
  confirmResult = { unwrap: () => Promise.resolve({ success: true, data: { message: 'confirmed' } }) };
  updateSettingsResult = { unwrap: () => Promise.resolve({ success: true, data: {} }) };
  changePasswordArgs.length = 0;
  updateProfileArgs.length = 0;
});

// =============================================================================
// AC-01: ProfileScreen shows loading spinner
// =============================================================================

describe('AC-01: ProfileScreen shows loading spinner while fetching', () => {
  it('renders a loading spinner when isLoading is true', () => {
    setProfileLoading();
    renderWithStore(<ProfileScreen />);
    expect(document.querySelector('.animate-spin')).not.toBeNull();
  });

  it('does not render profile fields during loading', () => {
    setProfileLoading();
    renderWithStore(<ProfileScreen />);
    expect(screen.queryByText('My Profile')).not.toBeInTheDocument();
  });
});

// =============================================================================
// AC-02: ProfileScreen shows profile data
// =============================================================================

describe('AC-02: ProfileScreen shows profile data', () => {
  it('shows full_name in the card', () => {
    setProfileData({ full_name: 'Jane Doe' });
    renderWithStore(<ProfileScreen />);
    expect(screen.getByText('Jane Doe')).toBeInTheDocument();
  });

  it('shows email address', () => {
    setProfileData({ email: 'jane@example.com' });
    renderWithStore(<ProfileScreen />);
    expect(screen.getByText('jane@example.com')).toBeInTheDocument();
  });

  it('shows phone number', () => {
    setProfileData({ phone: '+2348000000000' });
    renderWithStore(<ProfileScreen />);
    expect(screen.getByText('+2348000000000')).toBeInTheDocument();
  });

  it('shows role_name', () => {
    setProfileData({ role_name: 'Agent' });
    renderWithStore(<ProfileScreen />);
    // role appears in two places (avatar subtitle and role field)
    const agentEls = screen.getAllByText('Agent');
    expect(agentEls.length).toBeGreaterThanOrEqual(1);
  });

  it('shows "Verified" badge when email_verified is true', () => {
    setProfileData({ email_verified: true });
    renderWithStore(<ProfileScreen />);
    expect(screen.getByText('Verified')).toBeInTheDocument();
  });

  it('shows "Unverified" badge when email_verified is false', () => {
    setProfileData({ email_verified: false });
    renderWithStore(<ProfileScreen />);
    expect(screen.getByText('Unverified')).toBeInTheDocument();
  });

  it('shows "Contact support to change your phone number" hint', () => {
    setProfileData();
    renderWithStore(<ProfileScreen />);
    expect(screen.getByText(/Contact support to change your phone number/i)).toBeInTheDocument();
  });
});

// =============================================================================
// AC-03: ProfileScreen inline name editing
// =============================================================================

describe('AC-03: ProfileScreen allows editing full_name inline', () => {
  it('clicking Edit reveals a text input', async () => {
    setProfileData({ full_name: 'Jane Doe' });
    renderWithStore(<ProfileScreen />);
    await userEvent.click(screen.getByRole('button', { name: /edit/i }));
    expect(screen.getByRole('textbox', { name: /full name/i })).toBeInTheDocument();
  });

  it('clicking Cancel hides the input', async () => {
    setProfileData({ full_name: 'Jane Doe' });
    renderWithStore(<ProfileScreen />);
    await userEvent.click(screen.getByRole('button', { name: /edit/i }));
    await userEvent.click(screen.getByRole('button', { name: /cancel/i }));
    expect(screen.queryByRole('textbox', { name: /full name/i })).not.toBeInTheDocument();
  });

  it('submitting the form calls updateProfile with new name', async () => {
    setProfileData({ full_name: 'Jane Doe' });
    renderWithStore(<ProfileScreen />);
    await userEvent.click(screen.getByRole('button', { name: /edit/i }));
    const input = screen.getByRole('textbox', { name: /full name/i });
    await userEvent.clear(input);
    await userEvent.type(input, 'Jane Updated');
    await userEvent.click(screen.getByRole('button', { name: /save/i }));
    await waitFor(() => expect(updateProfileArgs.length).toBe(1));
    expect((updateProfileArgs[0] as { full_name: string }).full_name).toBe('Jane Updated');
  });
});

// =============================================================================
// AC-04: ProfileScreen error state
// =============================================================================

describe('AC-04: ProfileScreen shows error state on fetch failure', () => {
  it('renders an error message when fetch fails', () => {
    setProfileError();
    renderWithStore(<ProfileScreen />);
    expect(screen.getByText(/Failed to load profile/i)).toBeInTheDocument();
  });
});

// =============================================================================
// AC-05: ProfileScreen navigation links
// =============================================================================

describe('AC-05: ProfileScreen links to security sub-pages', () => {
  it('shows link to Change password page', () => {
    setProfileData();
    renderWithStore(<ProfileScreen />);
    expect(screen.getByText('Change password')).toBeInTheDocument();
  });

  it('shows link to Change email page', () => {
    setProfileData();
    renderWithStore(<ProfileScreen />);
    expect(screen.getByText('Change email address')).toBeInTheDocument();
  });

  it('shows link to Settings page', () => {
    setProfileData();
    renderWithStore(<ProfileScreen />);
    expect(screen.getByText(/Preferences.*settings/i)).toBeInTheDocument();
  });
});

// =============================================================================
// AC-06: ChangePasswordScreen has three fields
// =============================================================================

describe('AC-06: ChangePasswordScreen renders three password fields and submit', () => {
  it('has current password field', () => {
    renderWithStore(<ChangePasswordScreen />);
    expect(screen.getByLabelText(/current password/i)).toBeInTheDocument();
  });

  it('has new password field', () => {
    renderWithStore(<ChangePasswordScreen />);
    expect(screen.getByLabelText(/new password/i)).toBeInTheDocument();
  });

  it('has confirm new password field', () => {
    renderWithStore(<ChangePasswordScreen />);
    expect(screen.getByLabelText(/confirm new password/i)).toBeInTheDocument();
  });

  it('has a submit button', () => {
    renderWithStore(<ChangePasswordScreen />);
    expect(screen.getByRole('button', { name: /change password/i })).toBeInTheDocument();
  });

  it('all password fields have type="password"', () => {
    renderWithStore(<ChangePasswordScreen />);
    const inputs = document.querySelectorAll('input[type="password"]');
    expect(inputs.length).toBe(3);
  });
});

// =============================================================================
// AC-07: ChangePasswordScreen 401 error
// =============================================================================

describe('AC-07: ChangePasswordScreen shows "Current password is incorrect" on 401', () => {
  it('shows the 401 error message', async () => {
    changePasswordResult = { unwrap: () => Promise.reject({ status: 401, data: { message: 'Unauthorized' } }) };
    renderWithStore(<ChangePasswordScreen />);
    await userEvent.type(screen.getByLabelText(/current password/i), 'wrongpass');
    await userEvent.type(screen.getByLabelText(/^new password/i), 'Newpass123!');
    await userEvent.type(screen.getByLabelText(/confirm new password/i), 'Newpass123!');
    await userEvent.click(screen.getByRole('button', { name: /change password/i }));
    expect(await screen.findByText(/Current password is incorrect/i)).toBeInTheDocument();
  });
});

// =============================================================================
// AC-08: ChangePasswordScreen 422 error
// =============================================================================

describe('AC-08: ChangePasswordScreen shows "New password must differ" on 422', () => {
  it('shows the 422 error message', async () => {
    changePasswordResult = { unwrap: () => Promise.reject({ status: 422, data: { message: 'Same password' } }) };
    renderWithStore(<ChangePasswordScreen />);
    await userEvent.type(screen.getByLabelText(/current password/i), 'Samepass123!');
    await userEvent.type(screen.getByLabelText(/^new password/i), 'Samepass123!');
    await userEvent.type(screen.getByLabelText(/confirm new password/i), 'Samepass123!');
    await userEvent.click(screen.getByRole('button', { name: /change password/i }));
    expect(await screen.findByText(/New password must differ from current password/i)).toBeInTheDocument();
  });
});

// =============================================================================
// AC-09: ChangePasswordScreen generic error
// =============================================================================

describe('AC-09: ChangePasswordScreen shows generic error for other failures', () => {
  it('shows the backend message for other errors', async () => {
    changePasswordResult = { unwrap: () => Promise.reject({ status: 500, data: { message: 'Server exploded' } }) };
    renderWithStore(<ChangePasswordScreen />);
    await userEvent.type(screen.getByLabelText(/current password/i), 'Currpass1!');
    await userEvent.type(screen.getByLabelText(/^new password/i), 'Newpass123!');
    await userEvent.type(screen.getByLabelText(/confirm new password/i), 'Newpass123!');
    await userEvent.click(screen.getByRole('button', { name: /change password/i }));
    expect(await screen.findByText('Server exploded')).toBeInTheDocument();
  });
});

// =============================================================================
// AC-10: ChangeEmailScreen two-step flow
// =============================================================================

describe('AC-10: ChangeEmailScreen step 1 has email input; step 2 has OTP input with new_email', () => {
  it('step 1 shows an email input', () => {
    renderWithStore(<ChangeEmailScreen />);
    expect(screen.getByLabelText(/new email address/i)).toBeInTheDocument();
  });

  it('step 2 shows OTP input with "Code sent to {email}" after submit', async () => {
    initiateResult = { unwrap: () => Promise.resolve({ success: true, data: { message: 'sent' } }) };
    renderWithStore(<ChangeEmailScreen />);
    await userEvent.type(screen.getByLabelText(/new email address/i), 'newemail@example.com');
    await userEvent.click(screen.getByRole('button', { name: /send verification code/i }));
    expect(await screen.findByLabelText(/verification code/i)).toBeInTheDocument();
    expect(screen.getByText(/Code sent to/i)).toBeInTheDocument();
    expect(screen.getByText('newemail@example.com')).toBeInTheDocument();
  });

  it('OTP input on step 2 has inputMode="numeric"', async () => {
    initiateResult = { unwrap: () => Promise.resolve({ success: true, data: { message: 'sent' } }) };
    renderWithStore(<ChangeEmailScreen />);
    await userEvent.type(screen.getByLabelText(/new email address/i), 'newemail@example.com');
    await userEvent.click(screen.getByRole('button', { name: /send verification code/i }));
    const otpInput = await screen.findByLabelText(/verification code/i);
    expect(otpInput).toHaveAttribute('inputMode', 'numeric');
  });
});

// =============================================================================
// AC-11: ProfileSettingsScreen shows common settings
// =============================================================================

describe('AC-11: ProfileSettingsScreen shows common settings for all roles', () => {
  it('shows "Push notifications" toggle', () => {
    setSettingsData();
    renderWithStore(<ProfileSettingsScreen />, makeStore('Auditor'));
    expect(screen.getByLabelText(/Push notifications/i)).toBeInTheDocument();
  });

  it('shows "Email notifications" toggle', () => {
    setSettingsData();
    renderWithStore(<ProfileSettingsScreen />, makeStore('Auditor'));
    expect(screen.getByLabelText(/Email notifications/i)).toBeInTheDocument();
  });

  it('shows Theme select', () => {
    setSettingsData();
    renderWithStore(<ProfileSettingsScreen />, makeStore('Auditor'));
    expect(screen.getByLabelText(/Theme/i)).toBeInTheDocument();
  });
});

// =============================================================================
// AC-12: ProfileSettingsScreen shows agent-only fields for Agent role
// =============================================================================

describe('AC-12: ProfileSettingsScreen shows agent-only fields for Agent and EnforcementOfficer', () => {
  it('Agent sees scan sound toggle', () => {
    setSettingsData();
    renderWithStore(<ProfileSettingsScreen />, makeStore('Agent'));
    expect(screen.getByLabelText(/Scan sound/i)).toBeInTheDocument();
  });

  it('Agent sees offline mode hint toggle', () => {
    setSettingsData();
    renderWithStore(<ProfileSettingsScreen />, makeStore('Agent'));
    expect(screen.getByLabelText(/Offline mode hint/i)).toBeInTheDocument();
  });

  it('EnforcementOfficer sees scan sound toggle', () => {
    setSettingsData();
    renderWithStore(<ProfileSettingsScreen />, makeStore('EnforcementOfficer'));
    expect(screen.getByLabelText(/Scan sound/i)).toBeInTheDocument();
  });
});

// =============================================================================
// AC-13: ProfileSettingsScreen shows digest field for admin roles
// =============================================================================

describe('AC-13: ProfileSettingsScreen shows digest_frequency for admin roles', () => {
  it('SuperAdmin sees Digest frequency select', () => {
    setSettingsData();
    renderWithStore(<ProfileSettingsScreen />, makeStore('SuperAdmin'));
    expect(screen.getByLabelText(/Digest frequency/i)).toBeInTheDocument();
  });

  it('NationalAdmin sees Digest frequency select', () => {
    setSettingsData();
    renderWithStore(<ProfileSettingsScreen />, makeStore('NationalAdmin'));
    expect(screen.getByLabelText(/Digest frequency/i)).toBeInTheDocument();
  });

  it('StateAdmin sees Digest frequency select', () => {
    setSettingsData();
    renderWithStore(<ProfileSettingsScreen />, makeStore('StateAdmin'));
    expect(screen.getByLabelText(/Digest frequency/i)).toBeInTheDocument();
  });
});

// =============================================================================
// AC-14: ProfileSettingsScreen does NOT show agent fields for admin roles
// =============================================================================

describe('AC-14: Admin roles do not see agent-specific settings', () => {
  it('SuperAdmin does not see Scan sound toggle', () => {
    setSettingsData();
    renderWithStore(<ProfileSettingsScreen />, makeStore('SuperAdmin'));
    expect(screen.queryByLabelText(/Scan sound/i)).not.toBeInTheDocument();
  });

  it('NationalAdmin does not see Offline mode hint toggle', () => {
    setSettingsData();
    renderWithStore(<ProfileSettingsScreen />, makeStore('NationalAdmin'));
    expect(screen.queryByLabelText(/Offline mode hint/i)).not.toBeInTheDocument();
  });

  it('Agent does not see Digest frequency select', () => {
    setSettingsData();
    renderWithStore(<ProfileSettingsScreen />, makeStore('Agent'));
    expect(screen.queryByLabelText(/Digest frequency/i)).not.toBeInTheDocument();
  });
});
