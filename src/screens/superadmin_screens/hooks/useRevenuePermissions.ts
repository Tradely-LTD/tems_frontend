import { useAppSelector } from '@/hooks/useAppSelector';

/**
 * Role → permission mapping mirrors backend/src/constants/permissions.ts ROLE_PERMISSIONS.
 * The frontend has no per-user permission-override visibility at login time (UserData
 * does not carry role_permissions/permission_overrides), so — consistent with how the
 * rest of this codebase gates UI (see config_screens/hooks/useLevyConfig.ts) — we gate
 * purely on role_name. The server remains the source of truth for all writes.
 */
const MANAGE_ROLES = new Set(['SuperAdmin', 'NationalAdmin']);
const READ_ROLES = new Set([
  'SuperAdmin',
  'NationalAdmin',
  'JRBAccount',
  'FederalGovtAccount',
  'StateAdmin',
  'MarketAdmin',
  'Auditor',
]);
const SETTLEMENT_RUN_ROLES = new Set(['SuperAdmin', 'NationalAdmin']);
const SETTLEMENT_READ_ROLES = new Set([
  'SuperAdmin',
  'NationalAdmin',
  'JRBAccount',
  'FederalGovtAccount',
  'StateAdmin',
  'Auditor',
]);

export interface UseRevenuePermissionsResult {
  canManageRevenue: boolean;
  canReadRevenue: boolean;
  canRunSettlement: boolean;
  canReadSettlement: boolean;
}

export function useRevenuePermissions(): UseRevenuePermissionsResult {
  const roleName = useAppSelector((s) => s.auth.user?.role_name ?? '');

  return {
    canManageRevenue: MANAGE_ROLES.has(roleName),
    canReadRevenue: READ_ROLES.has(roleName),
    canRunSettlement: SETTLEMENT_RUN_ROLES.has(roleName),
    canReadSettlement: SETTLEMENT_READ_ROLES.has(roleName),
  };
}
