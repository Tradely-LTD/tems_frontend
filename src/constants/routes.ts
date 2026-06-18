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
} as const;

export const buildWaybillDetailRoute = (id: string): string =>
  `/dashboard/waybills/${id}`;

export const buildWaybillPassRoute = (id: string): string =>
  `/dashboard/waybills/${id}/pass`;
