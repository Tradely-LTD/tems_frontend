export const ROLE_NAMES = {
  SUPER_ADMIN:              'SuperAdmin',
  NATIONAL_ADMIN:           'NationalAdmin',
  JRB_ACCOUNT:              'JRBAccount',
  FEDERAL_GOVT_ACCOUNT:     'FederalGovtAccount',
  STATE_ADMIN:              'StateAdmin',
  LGA_ADMIN:                'LGAAdmin',
  MARKET_ADMIN:             'MarketAdmin',
  AGENT:                    'Agent',
  ENFORCEMENT_OFFICER:      'EnforcementOfficer',
  SUB_CONCESSIONAIRE_ADMIN: 'SubConcessionaireAdmin',
  CORPORATE_ACCOUNT:        'CorporateAccount',
  AUDITOR:                  'Auditor',
  BUYER:                    'Buyer',
} as const;

export type RoleName = typeof ROLE_NAMES[keyof typeof ROLE_NAMES];

export const ROLE_ROUTES: Record<RoleName, string> = {
  SuperAdmin:              '/dashboard/super',
  NationalAdmin:           '/dashboard/national',
  JRBAccount:              '/dashboard/jrb',
  FederalGovtAccount:      '/dashboard/federal',
  StateAdmin:              '/dashboard/state',
  LGAAdmin:                '/dashboard/lga',
  MarketAdmin:             '/dashboard/market',
  Agent:                   '/dashboard/agent',
  EnforcementOfficer:      '/dashboard/enforcement',
  SubConcessionaireAdmin:  '/dashboard/subconcession',
  CorporateAccount:        '/dashboard/corporate',
  Auditor:                 '/dashboard/auditor',
  Buyer:                   '/dashboard/buyer',
};

export const ROLE_DISPLAY: Record<RoleName, string> = {
  SuperAdmin:              'Super Admin',
  NationalAdmin:           'National Admin',
  JRBAccount:              'JRB Account',
  FederalGovtAccount:      'Federal Govt Account',
  StateAdmin:              'State Admin',
  LGAAdmin:                'LGA Admin',
  MarketAdmin:             'Market Admin',
  Agent:                   'Trade Agent',
  EnforcementOfficer:      'Enforcement Officer',
  SubConcessionaireAdmin:  'Sub-Concessionaire Admin',
  CorporateAccount:        'Corporate Account',
  Auditor:                 'Auditor',
  Buyer:                   'Buyer',
};

export type NavIconKey = 'home' | 'document' | 'identity' | 'revenue' | 'partners' | 'shield' | 'gear' | 'users' | 'chart' | 'clock' | 'help' | 'alert' | 'building';

export interface NavItemConfig {
  label: string;
  path: string;
  iconKey: NavIconKey;
  section?: string;
  built?: boolean;
  children?: NavItemConfig[];
}

export const NAV_ITEMS: Record<RoleName, NavItemConfig[]> = {
  SuperAdmin: [
    { label: 'Dashboard', path: '__home__', iconKey: 'home', built: true },
    {
      label: 'Sub-Concessionaires', path: '', iconKey: 'building', section: 'OPERATIONS',
      children: [
        { label: 'All Sub-Concs', path: '/dashboard/subconc-management', iconKey: 'building', built: true },
        { label: 'Onboard New',   path: '/dashboard/subconc-onboarding', iconKey: 'building', built: true },
      ],
    },
    {
      label: 'Waybills', path: '', iconKey: 'document',
      children: [
        { label: 'Waybill Lifecycle', path: '/dashboard/waybill-lifecycle', iconKey: 'document', built: true },
        { label: 'All Waybills',      path: '/dashboard/waybills',          iconKey: 'document', built: true },
      ],
    },
    {
      label: 'Agents & Identity', path: '', iconKey: 'users',
      children: [
        { label: 'Agent Network',  path: '/dashboard/agent-network', iconKey: 'users',    built: true },
        { label: 'All Agents',     path: '/dashboard/agents',        iconKey: 'users',    built: true },
        { label: 'Identity & KYC', path: '/dashboard/identity',      iconKey: 'identity', built: true },
      ],
    },
    {
      label: 'Compliance & Enforcement', path: '', iconKey: 'shield', section: 'COMPLIANCE',
      children: [
        { label: 'Compliance', path: '/dashboard/compliance', iconKey: 'shield', built: true },
        { label: 'Incidents',  path: '/dashboard/incidents',  iconKey: 'alert',  built: true },
        { label: 'Audit Logs', path: '/dashboard/audit-logs', iconKey: 'clock',  built: true },
      ],
    },
    { label: 'State Monitor',   path: '/dashboard/state-monitor',   iconKey: 'chart', section: 'INTELLIGENCE',    built: true },
    { label: 'Revenue Distribution', path: '/dashboard/revenue', iconKey: 'revenue', section: 'FINANCE', built: true },
    { label: 'User Management', path: '/dashboard/user-management', iconKey: 'users', section: 'ADMINISTRATION', built: true },
    { label: 'Support Inbox',   path: '/dashboard/support-inbox',  iconKey: 'help',  built: true },
    { label: 'Commodity Flow',  path: '/dashboard/commodity-flow', iconKey: 'chart', built: true },
    { label: 'System Settings', path: '/dashboard/settings',       iconKey: 'gear',  built: true },
  ],
  NationalAdmin: [
    { label: 'Overview',       path: '__home__',            iconKey: 'home',     built: true },
    { label: 'Waybills',       path: '/dashboard/waybills', iconKey: 'document', section: 'TRADE OPERATIONS', built: true },
    { label: 'Agents',         path: '/dashboard/agents',   iconKey: 'users',    built: true },
    { label: 'Identity & KYC', path: '/dashboard/identity', iconKey: 'identity', built: true },
    {
      label: 'Intelligence & Revenue', path: '', iconKey: 'revenue', section: 'INTELLIGENCE',
      children: [
        { label: 'Revenue',         path: '/dashboard/revenue',         iconKey: 'revenue',  built: true },
        { label: 'Partners',        path: '/dashboard/partners',        iconKey: 'partners', built: false },
        { label: 'Enforcement Ops', path: '/dashboard/enforcement-ops', iconKey: 'shield',   built: false },
      ],
    },
    { label: 'System Settings', path: '/dashboard/settings', iconKey: 'gear', section: 'ADMINISTRATION', built: true },
  ],
  JRBAccount: [
    { label: 'Overview',        path: '__home__',                 iconKey: 'home',     built: true },
    { label: 'Revenue',         path: '/dashboard/revenue',       iconKey: 'revenue',  built: true },
    { label: 'Waybills',        path: '/dashboard/waybills',      iconKey: 'document', built: true },
    { label: 'System Settings', path: '/dashboard/settings',      iconKey: 'gear',     section: 'ADMINISTRATION', built: true },
  ],
  FederalGovtAccount: [
    { label: 'Overview', path: '__home__',            iconKey: 'home',     built: true },
    { label: 'Revenue',  path: '/dashboard/revenue',  iconKey: 'revenue',  built: true },
    { label: 'Waybills', path: '/dashboard/waybills', iconKey: 'document', built: true },
  ],
  StateAdmin: [
    { label: 'Overview',        path: '__home__',            iconKey: 'home',  built: true },
    {
      label: 'Trade Intelligence', path: '', iconKey: 'chart', section: 'INTELLIGENCE',
      children: [
        { label: 'Waybill Activity', path: '/dashboard/waybills',        iconKey: 'document', built: true },
        { label: 'Commodity Flow',   path: '/dashboard/commodity-flow',  iconKey: 'chart',    built: true },
      ],
    },
    {
      label: 'Enforcement', path: '', iconKey: 'shield', section: 'ENFORCEMENT & SECURITY',
      children: [
        { label: 'Checkpoints & Incidents', path: '/dashboard/incidents',         iconKey: 'alert',  built: true },
        { label: 'Audit Logs',              path: '/dashboard/audit-logs',        iconKey: 'clock',  built: true },
        { label: 'Enforcement Ops',         path: '/dashboard/enforcement-ops',   iconKey: 'shield', built: false },
      ],
    },
    { label: 'Revenue Overview', path: '/dashboard/revenue', iconKey: 'revenue', section: 'FINANCE', built: true },
    { label: 'System Settings',  path: '/dashboard/settings', iconKey: 'gear',   section: 'ADMINISTRATION', built: true },
  ],
  LGAAdmin: [
    { label: 'Overview',        path: '__home__',                   iconKey: 'home',     built: true },
    { label: 'Waybills',        path: '/dashboard/waybills',        iconKey: 'document', section: 'TRADE OPERATIONS', built: true },
    { label: 'Agents',          path: '/dashboard/agents',          iconKey: 'users',    built: true },
    { label: 'Identity & KYC',  path: '/dashboard/identity',        iconKey: 'identity', built: true },
    { label: 'Enforcement Ops', path: '/dashboard/enforcement-ops', iconKey: 'shield',   section: 'INTELLIGENCE', built: false },
  ],
  MarketAdmin: [
    { label: 'Overview',  path: '__home__',            iconKey: 'home',     built: true },
    { label: 'Waybills',  path: '/dashboard/waybills', iconKey: 'document', section: 'TRADE OPERATIONS', built: true },
    { label: 'Agents',    path: '/dashboard/agents',   iconKey: 'users',    built: true },
    { label: 'Partners',  path: '/dashboard/partners', iconKey: 'partners', built: false },
  ],
  Agent: [
    { label: 'Overview',          path: '__home__',                      iconKey: 'home',     built: true },
    { label: 'Waybills',          path: '/dashboard/waybills',           iconKey: 'document', section: 'TRADE OPERATIONS', built: true },
    { label: 'My Profile',        path: '/dashboard/agents/me',          iconKey: 'users',    section: 'MY ACCOUNT', built: true },
    { label: 'Identity & KYC',    path: '/dashboard/identity',           iconKey: 'identity', built: true },
    { label: 'Report Incident',   path: '/dashboard/incident-reporting', iconKey: 'alert',    section: 'SUPPORT', built: true },
  ],
  EnforcementOfficer: [
    { label: 'Command Centre',     path: '__home__',                      iconKey: 'home',    built: true },
    { label: 'Incident Reporting', path: '/dashboard/incident-reporting', iconKey: 'alert',   section: 'FIELD OPS', built: true },
    { label: 'Audit Report',       path: '/dashboard/audit-report',       iconKey: 'clock',   built: true },
  ],
  SubConcessionaireAdmin: [
    { label: 'Dashboard', path: '__home__', iconKey: 'home', built: true },
    {
      label: 'Waybills', path: '', iconKey: 'document', section: 'TRADE OPERATIONS',
      children: [
        { label: 'Issue eWaybill', path: '/dashboard/waybills/new', iconKey: 'document', built: true },
        { label: 'Waybill Ledger', path: '/dashboard/waybills',     iconKey: 'document', built: true },
      ],
    },
    {
      label: 'Agents', path: '', iconKey: 'users', section: 'AGENT MANAGEMENT',
      children: [
        { label: 'Onboard Agent', path: '/dashboard/agents/new', iconKey: 'users', built: true },
        { label: 'All Agents',    path: '/dashboard/agents',     iconKey: 'users', built: true },
      ],
    },
    { label: 'Intelligence',     path: '/dashboard/intelligence',     iconKey: 'chart',  section: 'ANALYTICS',      built: true },
    { label: 'Agent Compliance', path: '/dashboard/agent-compliance', iconKey: 'shield', section: 'COMPLIANCE',     built: true },
    { label: 'Audit Logs',       path: '/dashboard/audit-logs',       iconKey: 'clock',  built: true },
    { label: 'Support',          path: '/dashboard/support',          iconKey: 'help',   section: 'HELP',           built: true },
    { label: 'Settings',         path: '/dashboard/settings',         iconKey: 'gear',   section: 'ADMINISTRATION', built: true },
  ],
  CorporateAccount: [
    { label: 'Overview',       path: '__home__',            iconKey: 'home',     built: true },
    { label: 'Waybills',       path: '/dashboard/waybills', iconKey: 'document', section: 'TRADE OPERATIONS', built: true },
    { label: 'Identity & KYC', path: '/dashboard/identity', iconKey: 'identity', built: true },
  ],
  Auditor: [
    { label: 'Overview', path: '__home__',            iconKey: 'home',     built: true },
    { label: 'Revenue',  path: '/dashboard/revenue',  iconKey: 'revenue',  built: true },
    { label: 'Waybills', path: '/dashboard/waybills', iconKey: 'document', built: true },
  ],
  Buyer: [
    { label: 'Overview', path: '__home__',            iconKey: 'home',     built: true },
    { label: 'Waybills', path: '/dashboard/waybills', iconKey: 'document', section: 'TRADE OPERATIONS', built: true },
  ],
};

export interface KpiCard {
  label: string;
  accentColor: string;
}

export const ROLE_KPI_CARDS: Record<RoleName, KpiCard[]> = {
  SuperAdmin:             [{ label: 'Total Users', accentColor: '#002366' }, { label: 'Total Revenue', accentColor: '#D4AF37' }, { label: 'Active Waybills', accentColor: '#096c4b' }, { label: 'System Alerts', accentColor: '#D83B01' }],
  NationalAdmin:          [{ label: 'Total Revenue', accentColor: '#D4AF37' }, { label: 'Active Waybills', accentColor: '#002366' }, { label: 'Pending KYC', accentColor: '#096c4b' }, { label: 'Partners', accentColor: '#6B21A8' }],
  JRBAccount:             [{ label: 'Revenue This Month', accentColor: '#D4AF37' }, { label: 'Waybills Processed', accentColor: '#002366' }, { label: 'Collections', accentColor: '#096c4b' }],
  FederalGovtAccount:     [{ label: 'Revenue This Month', accentColor: '#D4AF37' }, { label: 'Waybills Processed', accentColor: '#002366' }, { label: 'Collections', accentColor: '#096c4b' }],
  StateAdmin:             [{ label: 'State Revenue', accentColor: '#D4AF37' }, { label: 'Active Waybills', accentColor: '#002366' }, { label: 'Pending KYC', accentColor: '#096c4b' }, { label: 'Enforcement Actions', accentColor: '#D83B01' }],
  LGAAdmin:               [{ label: 'LGA Waybills', accentColor: '#002366' }, { label: 'Pending KYC', accentColor: '#096c4b' }, { label: 'Enforcement Actions', accentColor: '#D83B01' }],
  MarketAdmin:            [{ label: 'Market Waybills', accentColor: '#002366' }, { label: 'Active Agents', accentColor: '#096c4b' }, { label: 'Partners', accentColor: '#6B21A8' }],
  Agent:                  [{ label: 'My Waybills Today', accentColor: '#002366' }, { label: 'Pending', accentColor: '#D4AF37' }, { label: 'Completed', accentColor: '#096c4b' }, { label: 'Revenue Generated', accentColor: '#6B21A8' }],
  EnforcementOfficer:     [{ label: 'Active Checks', accentColor: '#002366' }, { label: 'Violations Today', accentColor: '#D83B01' }, { label: 'Cleared Vehicles', accentColor: '#096c4b' }],
  SubConcessionaireAdmin: [{ label: 'Waybills Issued', accentColor: '#002366' }, { label: 'Revenue', accentColor: '#D4AF37' }, { label: 'Active Partners', accentColor: '#6B21A8' }],
  CorporateAccount:       [{ label: 'Waybills Issued', accentColor: '#002366' }, { label: 'Pending KYC', accentColor: '#096c4b' }, { label: 'Active Shipments', accentColor: '#D4AF37' }],
  Auditor:                [{ label: 'Revenue This Month', accentColor: '#D4AF37' }, { label: 'Total Waybills', accentColor: '#002366' }, { label: 'Audit Flags', accentColor: '#D83B01' }],
  Buyer:                  [{ label: 'My Waybills', accentColor: '#002366' }, { label: 'In Transit', accentColor: '#D4AF37' }, { label: 'Delivered', accentColor: '#096c4b' }],
};

export const ROLE_HOME_INFO: Record<RoleName, { title: string; subtitle: string }> = {
  SuperAdmin:              { title: 'System Command Centre',           subtitle: 'Full platform oversight and control' },
  NationalAdmin:           { title: 'Strategic Oversight Dashboard',   subtitle: 'National trade infrastructure — federal view' },
  JRBAccount:              { title: 'National Revenue Oversight',      subtitle: 'JRB levy schedules and revenue distribution' },
  FederalGovtAccount:      { title: 'Federal Government Portal',       subtitle: 'Revenue compliance and national waybill data' },
  StateAdmin:              { title: 'Kano State Trade Intelligence',    subtitle: 'State-level trade operations, corridors, and revenue' },
  LGAAdmin:                { title: 'LGA Operations Dashboard',        subtitle: 'Local government area trade and enforcement' },
  MarketAdmin:             { title: 'Market Management Portal',        subtitle: 'Market waybills, agents, and partners' },
  Agent:                   { title: 'Trade Agent Portal',              subtitle: 'Manage waybills, shipments, and compliance' },
  EnforcementOfficer:      { title: 'Enforcement Command Dashboard',   subtitle: 'Field operations, checkpoints, and intelligence' },
  SubConcessionaireAdmin:  { title: 'Concessionaire Portal',           subtitle: 'Sub-concessionaire operations and settlements' },
  CorporateAccount:        { title: 'Logistics Hub',                   subtitle: 'Corporate fleet, waybills, and trade accounts' },
  Auditor:                 { title: 'Financial Integrity Hub',         subtitle: 'Audit logs, revenue trails, and compliance checks' },
  Buyer:                   { title: 'Buyer Dashboard',                 subtitle: 'Track your waybills, shipments, and deliveries' },
};
