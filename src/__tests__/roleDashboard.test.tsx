/**
 * Acceptance Tests — Role-Based Dashboard and Navigation
 *
 * AC-1  roles.ts exports exactly 13 role constants; no other file hardcodes role strings
 * AC-2  All 13 roles have unique registered routes each rendering a distinct component
 * AC-3  RoleRouter redirects every role to the correct path; JRBAccount / EnforcementOfficer
 *        bugs fixed; unknown role → /unauthorized
 * AC-4  Sidebar nav shows exactly the items specified in NAV_ITEMS for each role
 * AC-5  Each role home component renders a role-unique heading and at least one unique KPI label
 * AC-6  Unauthenticated users hitting /dashboard/* are redirected to /login
 * AC-7  Buyer user visiting /dashboard/super is redirected to /dashboard/buyer
 * AC-8  No role name strings hardcoded outside config/roles.ts
 */

import React from 'react';
import { describe, it, expect, beforeEach, vi } from 'vitest';
import { render, screen } from '@testing-library/react';
import { MemoryRouter, Route, Routes } from 'react-router-dom';
import { Provider } from 'react-redux';
import { configureStore } from '@reduxjs/toolkit';
import { authReducer } from '@/screens/auth_screens/services/authSlice';
import { emptyApi } from '@/store/emptyApi';
import {
  ROLE_NAMES,
  ROLE_ROUTES,
  NAV_ITEMS,
  ROLE_KPI_CARDS,
  ROLE_HOME_INFO,
} from '@/config/roles';
import type { RoleName } from '@/config/roles';

// ─── Test store factory ───────────────────────────────────────────────────────

type AuthOverride = {
  access_token?: string | null;
  refresh_token?: string | null;
  phone_confirmed?: boolean;
  user?: {
    id: string;
    email: string;
    phone: string;
    full_name: string;
    status: string;
    org_id: string;
    role_id: string;
    role_name: string;
    phone_verified: boolean;
  } | null;
};

function makeStore(authOverride: AuthOverride = {}) {
  return configureStore({
    reducer: {
      [emptyApi.reducerPath]: emptyApi.reducer,
      auth: authReducer,
    },
    preloadedState: {
      auth: {
        access_token: 'tok',
        refresh_token: 'ref',
        phone_confirmed: true,
        user: null,
        ...authOverride,
      },
    },
    middleware: (gDM) => gDM({ serializableCheck: false }).concat(emptyApi.middleware),
  });
}

function makeUser(role_name: string) {
  return {
    id: '1',
    email: `${role_name.toLowerCase()}@test.com`,
    phone: '+2348000000000',
    full_name: `Test ${role_name}`,
    status: 'active',
    org_id: 'org-1',
    role_id: 'rid-1',
    role_name,
    phone_verified: true,
  };
}

// Wrapper that places the component inside a MemoryRouter + Redux Provider
function renderWithRouter(
  ui: React.ReactElement,
  {
    initialEntries = ['/'],
    store = makeStore(),
  }: { initialEntries?: string[]; store?: ReturnType<typeof makeStore> } = {}
) {
  return render(
    <Provider store={store}>
      <MemoryRouter initialEntries={initialEntries}>{ui}</MemoryRouter>
    </Provider>
  );
}

// ─── Lazy imports for components (avoids tree-shaking issues with router) ─────

// We import components directly — no router-level wrapping needed for isolated tests.
import RoleRouter from '@/screens/auth_screens/RoleRouter';
import ProtectedRoute from '@/navigation/ProtectedRoute';
import SuperAdminHome from '@/screens/dashboard_screens/SuperAdminHome';
import NationalAdminHome from '@/screens/dashboard_screens/NationalAdminHome';
import JRBAccountHome from '@/screens/dashboard_screens/JRBAccountHome';
import FederalGovtAccountHome from '@/screens/dashboard_screens/FederalGovtAccountHome';
import StateAdminHome from '@/screens/dashboard_screens/StateAdminHome';
import LGAAdminHome from '@/screens/dashboard_screens/LGAAdminHome';
import MarketAdminHome from '@/screens/dashboard_screens/MarketAdminHome';
import AgentHome from '@/screens/dashboard_screens/AgentHome';
import EnforcementOfficerHome from '@/screens/dashboard_screens/EnforcementOfficerHome';
import SubConcessionaireAdminHome from '@/screens/dashboard_screens/SubConcessionaireAdminHome';
import CorporateAccountHome from '@/screens/dashboard_screens/CorporateAccountHome';
import AuditorHome from '@/screens/dashboard_screens/AuditorHome';
import BuyerHome from '@/screens/dashboard_screens/BuyerHome';

// ─── Spy on Navigate so we can capture redirect targets ──────────────────────

const navigatedTo: string[] = [];

vi.mock('react-router-dom', async (importOriginal) => {
  const actual = await importOriginal<typeof import('react-router-dom')>();
  return {
    ...actual,
    Navigate: ({ to }: { to: string }) => {
      navigatedTo.push(to);
      return <div data-testid="navigate" data-to={to} />;
    },
  };
});

beforeEach(() => {
  navigatedTo.length = 0;
});

// =============================================================================
// AC-1 — roles.ts exports exactly 13 role constants
// =============================================================================

describe('AC-1: config/roles.ts exports exactly 13 role constants', () => {
  it('exports ROLE_NAMES with exactly 13 keys', () => {
    const keys = Object.keys(ROLE_NAMES);
    expect(keys).toHaveLength(13);
  });

  it('all 13 expected role name values are present', () => {
    const expected = [
      'SuperAdmin',
      'NationalAdmin',
      'JRBAccount',
      'FederalGovtAccount',
      'StateAdmin',
      'LGAAdmin',
      'MarketAdmin',
      'Agent',
      'EnforcementOfficer',
      'SubConcessionaireAdmin',
      'CorporateAccount',
      'Auditor',
      'Buyer',
    ];
    const values = Object.values(ROLE_NAMES);
    for (const r of expected) {
      expect(values).toContain(r);
    }
  });
});

// =============================================================================
// AC-2 — 13 roles have unique registered routes each rendering a distinct component
// =============================================================================

describe('AC-2: 13 unique role routes each rendering a distinct component', () => {
  const ROLE_COMPONENT_MAP: [RoleName, React.ComponentType][] = [
    ['SuperAdmin', SuperAdminHome],
    ['NationalAdmin', NationalAdminHome],
    ['JRBAccount', JRBAccountHome],
    ['FederalGovtAccount', FederalGovtAccountHome],
    ['StateAdmin', StateAdminHome],
    ['LGAAdmin', LGAAdminHome],
    ['MarketAdmin', MarketAdminHome],
    ['Agent', AgentHome],
    ['EnforcementOfficer', EnforcementOfficerHome],
    ['SubConcessionaireAdmin', SubConcessionaireAdminHome],
    ['CorporateAccount', CorporateAccountHome],
    ['Auditor', AuditorHome],
    ['Buyer', BuyerHome],
  ];

  it('ROLE_ROUTES contains exactly 13 entries', () => {
    expect(Object.keys(ROLE_ROUTES)).toHaveLength(13);
  });

  it('all 13 routes are unique paths', () => {
    const paths = Object.values(ROLE_ROUTES);
    const unique = new Set(paths);
    expect(unique.size).toBe(13);
  });

  it.each(ROLE_COMPONENT_MAP)(
    '%s → route %s renders a component with its role-specific heading',
    (roleName, Component) => {
      const store = makeStore({ user: makeUser(roleName) });
      render(
        <Provider store={store}>
          <MemoryRouter>
            <Component />
          </MemoryRouter>
        </Provider>
      );
      // Each component renders a heading from ROLE_HOME_INFO
      const { title } = ROLE_HOME_INFO[roleName];
      expect(screen.getByText(title)).toBeInTheDocument();
    }
  );

  it('the 13 component headings are all distinct', () => {
    const titles = Object.values(ROLE_HOME_INFO).map((info) => info.title);
    const unique = new Set(titles);
    expect(unique.size).toBe(13);
  });
});

// =============================================================================
// AC-3 — RoleRouter redirects all 13 roles correctly; bug fixes verified;
//         unknown role → /unauthorized
// =============================================================================

describe('AC-3: RoleRouter redirects', () => {
  const roleToPath: [string, string][] = [
    ['SuperAdmin', '/dashboard/super'],
    ['NationalAdmin', '/dashboard/national'],
    ['JRBAccount', '/dashboard/jrb'],
    ['FederalGovtAccount', '/dashboard/federal'],
    ['StateAdmin', '/dashboard/state'],
    ['LGAAdmin', '/dashboard/lga'],
    ['MarketAdmin', '/dashboard/market'],
    ['Agent', '/dashboard/agent'],
    ['EnforcementOfficer', '/dashboard/enforcement'],
    ['SubConcessionaireAdmin', '/dashboard/subconcession'],
    ['CorporateAccount', '/dashboard/corporate'],
    ['Auditor', '/dashboard/auditor'],
    ['Buyer', '/dashboard/buyer'],
  ];

  it.each(roleToPath)(
    'role "%s" is redirected to "%s"',
    (roleName, expectedPath) => {
      navigatedTo.length = 0;
      const store = makeStore({ user: makeUser(roleName) });
      renderWithRouter(<RoleRouter />, { store });
      const nav = screen.getByTestId('navigate');
      expect(nav).toHaveAttribute('data-to', expectedPath);
    }
  );

  it('JRBAccount bug fix: maps to /dashboard/jrb (not /dashboard/JRB or /dashboard/jrb-account)', () => {
    navigatedTo.length = 0;
    const store = makeStore({ user: makeUser('JRBAccount') });
    renderWithRouter(<RoleRouter />, { store });
    const nav = screen.getByTestId('navigate');
    expect(nav).toHaveAttribute('data-to', '/dashboard/jrb');
    expect(nav).not.toHaveAttribute('data-to', '/dashboard/JRB');
  });

  it('EnforcementOfficer bug fix: maps to /dashboard/enforcement (not /dashboard/Enforcement)', () => {
    navigatedTo.length = 0;
    const store = makeStore({ user: makeUser('EnforcementOfficer') });
    renderWithRouter(<RoleRouter />, { store });
    const nav = screen.getByTestId('navigate');
    expect(nav).toHaveAttribute('data-to', '/dashboard/enforcement');
    expect(nav).not.toHaveAttribute('data-to', '/dashboard/Enforcement');
  });

  it('unknown role redirects to /unauthorized, not /dashboard/agent', () => {
    navigatedTo.length = 0;
    const store = makeStore({ user: makeUser('GhostRole') });
    renderWithRouter(<RoleRouter />, { store });
    const nav = screen.getByTestId('navigate');
    expect(nav).toHaveAttribute('data-to', '/unauthorized');
    expect(nav).not.toHaveAttribute('data-to', '/dashboard/agent');
  });

  it('null user redirects to /login', () => {
    navigatedTo.length = 0;
    const store = makeStore({ user: null, access_token: 'tok' });
    renderWithRouter(<RoleRouter />, { store });
    const nav = screen.getByTestId('navigate');
    expect(nav).toHaveAttribute('data-to', '/login');
  });
});

// =============================================================================
// AC-4 — Sidebar nav items are role-scoped per NAV_ITEMS
// =============================================================================

describe('AC-4: NAV_ITEMS scopes exactly the right items for each role', () => {
  // Verify the data layer: each role's NAV_ITEMS is a distinct, non-empty array
  const allRoles = Object.keys(ROLE_NAMES) as (keyof typeof ROLE_NAMES)[];

  it('every role has at least one nav item', () => {
    for (const key of allRoles) {
      const roleName = ROLE_NAMES[key] as RoleName;
      expect(NAV_ITEMS[roleName].length).toBeGreaterThan(0);
    }
  });

  it('SuperAdmin has 9 nav items (includes Agents)', () => {
    expect(NAV_ITEMS['SuperAdmin']).toHaveLength(9);
    const labels = NAV_ITEMS['SuperAdmin'].map((i) => i.label);
    expect(labels).toContain('Agents');
  });

  it('Agent has exactly 4 nav items (Overview + Waybills + My Profile + Identity & KYC)', () => {
    // I-4 fix: Agent is a KYC submitter role so Identity & KYC must appear in their nav
    // Agent module: My Profile added for self-service profile access
    expect(NAV_ITEMS['Agent']).toHaveLength(4);
    const labels = NAV_ITEMS['Agent'].map((i) => i.label);
    expect(labels).toContain('Overview');
    expect(labels).toContain('Waybills');
    expect(labels).toContain('Identity & KYC');
    expect(labels).toContain('My Profile');
    // Agent must NOT see admin-only items
    expect(labels).not.toContain('User Management');
    expect(labels).not.toContain('System Settings');
    expect(labels).not.toContain('Enforcement Ops');
  });

  it('EnforcementOfficer has exactly 2 nav items (Overview + Enforcement Ops)', () => {
    expect(NAV_ITEMS['EnforcementOfficer']).toHaveLength(2);
    const labels = NAV_ITEMS['EnforcementOfficer'].map((i) => i.label);
    expect(labels).toContain('Overview');
    expect(labels).toContain('Enforcement Ops');
    expect(labels).not.toContain('User Management');
  });

  it('Buyer has exactly 2 nav items (Overview + Waybills)', () => {
    expect(NAV_ITEMS['Buyer']).toHaveLength(2);
    const labels = NAV_ITEMS['Buyer'].map((i) => i.label);
    expect(labels).toContain('Overview');
    expect(labels).toContain('Waybills');
  });

  it('Auditor does NOT have User Management or System Settings', () => {
    const labels = NAV_ITEMS['Auditor'].map((i) => i.label);
    expect(labels).not.toContain('User Management');
    expect(labels).not.toContain('System Settings');
  });

  it('JRBAccount has exactly 4 items (Overview, Revenue, Waybills, System Settings)', () => {
    expect(NAV_ITEMS['JRBAccount']).toHaveLength(4);
    const labels = NAV_ITEMS['JRBAccount'].map((i) => i.label);
    expect(labels).toContain('Overview');
    expect(labels).toContain('Revenue');
    expect(labels).toContain('Waybills');
    expect(labels).toContain('System Settings');
  });

  it('LGAAdmin has 5 items (includes Agents) and no Revenue or Partners', () => {
    expect(NAV_ITEMS['LGAAdmin']).toHaveLength(5);
    const labels = NAV_ITEMS['LGAAdmin'].map((i) => i.label);
    expect(labels).toContain('Agents');
    expect(labels).not.toContain('Revenue');
    expect(labels).not.toContain('Partners');
  });

  it('Overview "__home__" path is present for all roles', () => {
    for (const key of allRoles) {
      const roleName = ROLE_NAMES[key] as RoleName;
      const homeItem = NAV_ITEMS[roleName].find((i) => i.path === '__home__');
      expect(homeItem, `${roleName} should have an Overview/__home__ nav item`).toBeDefined();
    }
  });
});

// =============================================================================
// AC-5 — Each role home component renders a unique heading and unique KPI label
// =============================================================================

describe('AC-5: Each role home renders a unique heading and at least one unique KPI label', () => {
  const componentMap: [RoleName, React.ComponentType][] = [
    ['SuperAdmin', SuperAdminHome],
    ['NationalAdmin', NationalAdminHome],
    ['JRBAccount', JRBAccountHome],
    ['FederalGovtAccount', FederalGovtAccountHome],
    ['StateAdmin', StateAdminHome],
    ['LGAAdmin', LGAAdminHome],
    ['MarketAdmin', MarketAdminHome],
    ['Agent', AgentHome],
    ['EnforcementOfficer', EnforcementOfficerHome],
    ['SubConcessionaireAdmin', SubConcessionaireAdminHome],
    ['CorporateAccount', CorporateAccountHome],
    ['Auditor', AuditorHome],
    ['Buyer', BuyerHome],
  ];

  it.each(componentMap)(
    '%s Home renders its unique title heading',
    (roleName, Component) => {
      const store = makeStore({ user: makeUser(roleName) });
      const { title } = ROLE_HOME_INFO[roleName];
      render(
        <Provider store={store}>
          <MemoryRouter>
            <Component />
          </MemoryRouter>
        </Provider>
      );
      expect(screen.getByText(title)).toBeInTheDocument();
    }
  );

  it.each(componentMap)(
    '%s Home renders at least one KPI card label unique to that role',
    (roleName, Component) => {
      const store = makeStore({ user: makeUser(roleName) });
      const cards = ROLE_KPI_CARDS[roleName];
      render(
        <Provider store={store}>
          <MemoryRouter>
            <Component />
          </MemoryRouter>
        </Provider>
      );
      // At least one KPI label from this role's cards must appear in the document
      const labelsInDoc = cards.filter((c) => {
        try {
          return !!screen.getByText(c.label);
        } catch {
          return false;
        }
      });
      expect(labelsInDoc.length).toBeGreaterThan(0);
    }
  );

  it('SuperAdmin KPI label "Total Users" is not present in Buyer home', () => {
    const store = makeStore({ user: makeUser('Buyer') });
    render(
      <Provider store={store}>
        <MemoryRouter>
          <BuyerHome />
        </MemoryRouter>
      </Provider>
    );
    expect(screen.queryByText('Total Users')).not.toBeInTheDocument();
  });

  it('Buyer KPI label "My Waybills" is not present in SuperAdmin home', () => {
    const store = makeStore({ user: makeUser('SuperAdmin') });
    render(
      <Provider store={store}>
        <MemoryRouter>
          <SuperAdminHome />
        </MemoryRouter>
      </Provider>
    );
    expect(screen.queryByText('My Waybills')).not.toBeInTheDocument();
  });

  it('EnforcementOfficer KPI "Active Checks" is unique to that role', () => {
    // Confirm "Active Checks" appears only in EnforcementOfficer KPI cards
    const allOtherRoles = (Object.keys(ROLE_KPI_CARDS) as RoleName[]).filter(
      (r) => r !== 'EnforcementOfficer'
    );
    for (const r of allOtherRoles) {
      const hasIt = ROLE_KPI_CARDS[r].some((c) => c.label === 'Active Checks');
      expect(hasIt, `"Active Checks" should not appear in ${r} KPI cards`).toBe(false);
    }
  });
});

// =============================================================================
// AC-6 — Unauthenticated users hitting /dashboard/* redirect to /login
// =============================================================================

describe('AC-6: Unauthenticated users are redirected to /login', () => {
  it('ProtectedRoute redirects to /login when access_token is null', () => {
    // Store with no access_token
    const store = makeStore({ access_token: null, user: null });
    render(
      <Provider store={store}>
        <MemoryRouter initialEntries={['/dashboard/super']}>
          <Routes>
            <Route
              path="/dashboard/*"
              element={
                <ProtectedRoute requirePhoneVerified={true}>
                  <div data-testid="protected-content">Dashboard</div>
                </ProtectedRoute>
              }
            />
            <Route path="/login" element={<div data-testid="login-page">Login</div>} />
          </Routes>
        </MemoryRouter>
      </Provider>
    );
    // Our Navigate mock renders a div[data-to] instead of actually navigating,
    // so we verify via the mock element rather than waiting for the /login route to mount.
    expect(screen.queryByTestId('protected-content')).not.toBeInTheDocument();
    const nav = screen.getByTestId('navigate');
    expect(nav).toHaveAttribute('data-to', '/login');
  });

  it('ProtectedRoute shows protected content when access_token is set and phone confirmed', () => {
    const store = makeStore({
      access_token: 'valid-token',
      phone_confirmed: true,
      user: makeUser('SuperAdmin'),
    });
    render(
      <Provider store={store}>
        <MemoryRouter initialEntries={['/dashboard/super']}>
          <Routes>
            <Route
              path="/dashboard/*"
              element={
                <ProtectedRoute requirePhoneVerified={true}>
                  <div data-testid="protected-content">Dashboard</div>
                </ProtectedRoute>
              }
            />
            <Route path="/login" element={<div data-testid="login-page">Login</div>} />
          </Routes>
        </MemoryRouter>
      </Provider>
    );
    expect(screen.getByTestId('protected-content')).toBeInTheDocument();
    expect(screen.queryByTestId('login-page')).not.toBeInTheDocument();
  });

  it('ProtectedRoute redirects unverified phone to /otp-verification', () => {
    const store = makeStore({
      access_token: 'valid-token',
      phone_confirmed: false,
      user: makeUser('Agent'),
    });
    render(
      <Provider store={store}>
        <MemoryRouter initialEntries={['/dashboard/agent']}>
          <Routes>
            <Route
              path="/dashboard/*"
              element={
                <ProtectedRoute requirePhoneVerified={true}>
                  <div data-testid="protected-content">Dashboard</div>
                </ProtectedRoute>
              }
            />
            <Route path="/login" element={<div data-testid="login-page">Login</div>} />
            <Route path="/otp-verification" element={<div data-testid="otp-page">OTP</div>} />
          </Routes>
        </MemoryRouter>
      </Provider>
    );
    // Navigate mock intercepts before real routing completes; verify via mock element.
    expect(screen.queryByTestId('protected-content')).not.toBeInTheDocument();
    const nav = screen.getByTestId('navigate');
    expect(nav).toHaveAttribute('data-to', '/otp-verification');
  });
});

// =============================================================================
// AC-7 — Buyer visiting /dashboard/super is redirected to /dashboard/buyer
// =============================================================================

describe('AC-7: Wrong-role redirect — Buyer visiting /dashboard/super goes to /dashboard/buyer', () => {
  it('RoleRouter sends Buyer to /dashboard/buyer regardless of requested path', () => {
    navigatedTo.length = 0;
    const store = makeStore({ user: makeUser('Buyer') });
    // RoleRouter always redirects based on role, not requested path
    renderWithRouter(<RoleRouter />, {
      initialEntries: ['/dashboard/super'],
      store,
    });
    const nav = screen.getByTestId('navigate');
    expect(nav).toHaveAttribute('data-to', '/dashboard/buyer');
    expect(nav).not.toHaveAttribute('data-to', '/dashboard/super');
  });

  it('ROLE_ROUTES maps Buyer to /dashboard/buyer', () => {
    expect(ROLE_ROUTES['Buyer']).toBe('/dashboard/buyer');
  });

  it('ROLE_ROUTES maps SuperAdmin to /dashboard/super (not /dashboard/buyer)', () => {
    expect(ROLE_ROUTES['SuperAdmin']).toBe('/dashboard/super');
    expect(ROLE_ROUTES['SuperAdmin']).not.toBe('/dashboard/buyer');
  });
});

// =============================================================================
// AC-8 — No role name strings hardcoded outside config/roles.ts
// =============================================================================
// These tests encode the grep results observed at test-write time.
// They verify the data-layer properties (ROLE_NAMES values match what roles.ts exports).
// The static grep violation in IdentityDashboard.tsx is documented as a failing check.

describe('AC-8: No role name strings hardcoded outside config/roles.ts', () => {
  // Structural check: the 13 canonical role names are defined only via ROLE_NAMES
  it('ROLE_NAMES is the single source of truth — all values are distinct strings', () => {
    const values = Object.values(ROLE_NAMES);
    const unique = new Set(values);
    expect(unique.size).toBe(values.length);
    // Every value must be a non-empty string
    for (const v of values) {
      expect(typeof v).toBe('string');
      expect(v.length).toBeGreaterThan(0);
    }
  });

  it('ROLE_ROUTES keys exactly match ROLE_NAMES values', () => {
    const roleNameValues = new Set(Object.values(ROLE_NAMES));
    const routeKeys = new Set(Object.keys(ROLE_ROUTES));
    expect(routeKeys).toEqual(roleNameValues);
  });

  it('NAV_ITEMS keys exactly match ROLE_NAMES values', () => {
    const roleNameValues = new Set(Object.values(ROLE_NAMES));
    const navKeys = new Set(Object.keys(NAV_ITEMS));
    expect(navKeys).toEqual(roleNameValues);
  });

  it('ROLE_KPI_CARDS keys exactly match ROLE_NAMES values', () => {
    const roleNameValues = new Set(Object.values(ROLE_NAMES));
    const kpiKeys = new Set(Object.keys(ROLE_KPI_CARDS));
    expect(kpiKeys).toEqual(roleNameValues);
  });

  it('IdentityDashboard.tsx must not hardcode role name strings inline', () => {
    const fs = require('fs');
    const path = require('path');
    const filePath = path.resolve(__dirname, '../screens/identity_screens/IdentityDashboard.tsx');
    const content = fs.readFileSync(filePath, 'utf-8');
    expect(content, 'IdentityDashboard.tsx hardcodes role name string "Agent" — import ROLE_NAMES from config/roles instead').not.toMatch(/['"]Agent['"]/);
    expect(content, 'IdentityDashboard.tsx hardcodes role name string "CorporateAccount" — import ROLE_NAMES from config/roles instead').not.toMatch(/['"]CorporateAccount['"]/);
  });
});
