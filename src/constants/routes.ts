export const ROUTES = {
  LOGIN: '/login',
  FORGOT_PASSWORD: '/forgot-password',
  RESET_PASSWORD: '/reset-password',
  OTP_VERIFICATION: '/otp-verification',
  HOME: '/',
  DASHBOARD: '/dashboard',
  DASHBOARD_NATIONAL: '/dashboard/national',
  DASHBOARD_STATE: '/dashboard/state',
  DASHBOARD_AGENT: '/dashboard/agent',
  DASHBOARD_PARTNER: '/dashboard/partner',
  DASHBOARD_AUDITOR: '/dashboard/auditor',
  DASHBOARD_JRB: '/dashboard/jrb',
  DASHBOARD_CORPORATE: '/dashboard/corporate',
  DASHBOARD_ENFORCEMENT: '/dashboard/enforcement',
  WAYBILLS: '/dashboard/waybills',
  WAYBILLS_NEW: '/dashboard/waybills/new',
  WAYBILLS_MANAGE: '/dashboard/waybills/manage',
  WAYBILL_DETAIL: '/dashboard/waybills/:waybillId',
  WAYBILL_PASS: '/dashboard/waybills/:waybillId/pass',
  IDENTITY: '/dashboard/identity',
  SETTINGS: '/dashboard/settings',
  IDENTITY_PROFILE: '/dashboard/identity/profile',
  IDENTITY_DOCUMENTS: '/dashboard/identity/documents',
  AGENTS:       '/dashboard/agents',
  AGENTS_NEW:   '/dashboard/agents/new',
  AGENTS_ME:    '/dashboard/agents/me',
  AGENT_DETAIL: '/dashboard/agents/:agentId',
  REGISTER_SUBCONCESSIONAIRE: '/register/subconcessionaire',

  // Sub-Concessionnaire Hub
  INTELLIGENCE:       '/dashboard/intelligence',
  AGENT_COMPLIANCE:   '/dashboard/agent-compliance',
  AUDIT_LOGS:         '/dashboard/audit-logs',
  SUPPORT:            '/dashboard/support',

  // Super Admin
  SUBCONC_ONBOARDING:   '/dashboard/subconc-onboarding',
  SUBCONC_MANAGEMENT:   '/dashboard/subconc-management',
  SUBCONC_DETAIL:       '/dashboard/subconc/:id',
  WAYBILL_LIFECYCLE:    '/dashboard/waybill-lifecycle',
  AGENT_NETWORK:        '/dashboard/agent-network',
  COMPLIANCE:           '/dashboard/compliance',

  // Enforcement / Incidents
  INCIDENT_REPORTING:  '/dashboard/incident-reporting',
  AUDIT_REPORT:        '/dashboard/audit-report',
  INCIDENTS:           '/dashboard/incidents',

  // Support Inbox (SuperAdmin)
  SUPPORT_INBOX:       '/dashboard/support-inbox',

  // Analytics
  COMMODITY_FLOW:      '/dashboard/commodity-flow',

  // User Access Management
  USER_MANAGEMENT:     '/dashboard/user-management',

  // State Monitor (SuperAdmin multi-state view)
  STATE_MONITOR:       '/dashboard/state-monitor',

  // Profile module
  PROFILE:                    '/dashboard/profile',
  PROFILE_CHANGE_PASSWORD:    '/dashboard/profile/change-password',
  PROFILE_CHANGE_EMAIL:       '/dashboard/profile/change-email',
  PROFILE_SETTINGS:           '/dashboard/profile/settings',
} as const;

export const buildWaybillDetailRoute = (id: string): string =>
  `/dashboard/waybills/${id}`;

export const buildWaybillPassRoute = (id: string): string =>
  `/dashboard/waybills/${id}/pass`;

export const buildAgentDetailRoute = (id: string): string =>
  `/dashboard/agents/${id}`;

export const buildSubConcDetailRoute = (id: string): string =>
  `/dashboard/subconc/${id}`;
