import { createBrowserRouter, Navigate } from 'react-router-dom';
import PublicRoute from './PublicRoute';
import ProtectedRoute from './ProtectedRoute';
import { useAppSelector } from '@/hooks/useAppSelector';
import Login from '@/screens/auth_screens/Login';
import DemoLogin from '@/screens/auth_screens/DemoLogin';

const DEMO_MODE = import.meta.env.VITE_DEMO_MODE === 'true';
const LoginPage = DEMO_MODE ? DemoLogin : Login;
import ForgotPassword from '@/screens/auth_screens/ForgotPassword';
import ResetPassword from '@/screens/auth_screens/ResetPassword';
import OtpVerification from '@/screens/auth_screens/OtpVerification';
import RoleRouter from '@/screens/auth_screens/RoleRouter';
import SubConcessionaireRegister from '@/screens/auth_screens/SubConcessionaireRegister';
import Unauthorized from '@/screens/auth_screens/Unauthorized';
import { DashboardLayout, DashboardHome, ModuleComingSoon } from '@/screens/dashboard_screens';
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
import { WaybillLedger, WaybillDetail, WaybillPass, WaybillManage, WaybillWizard } from '@/screens/waybill_screens';
import { IdentityDashboard } from '@/screens/identity_screens';
import { LevyConfigSettings } from '@/screens/config_screens';
import {
  AgentListScreen,
  AgentOnboardingForm,
  AgentProfileContainer,
  AgentDetailScreen,
} from '@/screens/agent_screens';
import {
  SubConcessionaireIntelligence,
  SubConcessionaireCompliance,
  SubConcessionaireAuditLogs,
  SubConcessionaireSupport,
} from '@/screens/subconcessionaire_screens';
import {
  SubConcessionaireOnboarding,
  SubConcManagement,
  SubConcDetail,
  AgentNetworkManagement,
  WaybillLifecycle,
  ComplianceHub,
  SuperAdminAuditLogs,
  SuperAdminIncidents,
  SuperAdminSupportInbox,
  CommodityFlowAnalytics,
  UserAccessManagement,
  StateMonitor,
  RevenueDistributionConfig,
} from '@/screens/superadmin_screens';
import { IncidentReporting, AuditReport } from '@/screens/enforcement_screens';
import { ROUTES } from '@/constants/routes';

function AuditLogsDispatch() {
  const role = useAppSelector((s) => s.auth.user?.role_name);
  if (role === 'SuperAdmin' || role === 'NationalAdmin') {
    return <SuperAdminAuditLogs />;
  }
  return <SubConcessionaireAuditLogs />;
}

export const router = createBrowserRouter([
  {
    path: ROUTES.LOGIN,
    element: (
      <PublicRoute>
        <LoginPage />
      </PublicRoute>
    ),
  },
  {
    path: ROUTES.FORGOT_PASSWORD,
    element: (
      <PublicRoute>
        <ForgotPassword />
      </PublicRoute>
    ),
  },
  {
    path: ROUTES.RESET_PASSWORD,
    element: (
      <PublicRoute>
        <ResetPassword />
      </PublicRoute>
    ),
  },
  {
    path: ROUTES.REGISTER_SUBCONCESSIONAIRE,
    element: (
      <PublicRoute>
        <SubConcessionaireRegister />
      </PublicRoute>
    ),
  },
  {
    path: ROUTES.OTP_VERIFICATION,
    element: (
      <ProtectedRoute requirePhoneVerified={false}>
        <OtpVerification />
      </ProtectedRoute>
    ),
  },
  {
    path: ROUTES.HOME,
    element: (
      <ProtectedRoute requirePhoneVerified={true}>
        <RoleRouter />
      </ProtectedRoute>
    ),
  },
  // Unauthorized — top-level, no ProtectedRoute wrapper
  {
    path: '/unauthorized',
    element: <Unauthorized />,
  },
  {
    path: ROUTES.DASHBOARD,
    element: (
      <ProtectedRoute requirePhoneVerified={true}>
        <DashboardLayout />
      </ProtectedRoute>
    ),
    children: [
      { index: true, element: <DashboardHome /> },
      // Role home pages
      { path: 'super',         element: <SuperAdminHome /> },
      { path: 'national',      element: <NationalAdminHome /> },
      { path: 'state',         element: <StateAdminHome /> },
      { path: 'agent',         element: <AgentHome /> },
      { path: 'auditor',       element: <AuditorHome /> },
      { path: 'jrb',           element: <JRBAccountHome /> },
      { path: 'corporate',     element: <CorporateAccountHome /> },
      { path: 'enforcement',   element: <EnforcementOfficerHome /> },
      { path: 'federal',       element: <FederalGovtAccountHome /> },
      { path: 'lga',           element: <LGAAdminHome /> },
      { path: 'market',        element: <MarketAdminHome /> },
      { path: 'subconcession', element: <SubConcessionaireAdminHome /> },
      { path: 'buyer',         element: <BuyerHome /> },
      // Waybill module — static paths BEFORE dynamic path
      { path: 'waybills', element: <WaybillLedger /> },
      { path: 'waybills/new', element: <WaybillWizard /> },
      { path: 'waybills/manage', element: <WaybillManage /> },
      { path: 'waybills/:waybillId', element: <WaybillDetail /> },
      { path: 'waybills/:waybillId/pass', element: <WaybillPass /> },
      { path: 'identity', element: <IdentityDashboard /> },
      // Agent module — static paths BEFORE dynamic path
      { path: 'agents',          element: <AgentListScreen /> },
      { path: 'agents/new',      element: <AgentOnboardingForm /> },
      { path: 'agents/me',       element: <AgentProfileContainer /> },
      { path: 'agents/:agentId', element: <AgentDetailScreen /> },
      // Sub-Concessionaire Hub
      { path: 'intelligence',      element: <SubConcessionaireIntelligence /> },
      { path: 'agent-compliance',  element: <SubConcessionaireCompliance /> },
      { path: 'audit-logs',        element: <AuditLogsDispatch /> },
      { path: 'support',           element: <SubConcessionaireSupport /> },
      // Super Admin
      { path: 'subconc-management', element: <SubConcManagement /> },
      { path: 'subconc/:id',        element: <SubConcDetail /> },
      { path: 'subconc-onboarding', element: <SubConcessionaireOnboarding /> },
      { path: 'agent-network',      element: <AgentNetworkManagement /> },
      { path: 'waybill-lifecycle',  element: <WaybillLifecycle /> },
      { path: 'compliance',         element: <ComplianceHub /> },
      // Shared audit log — superadmin gets the fuller version via the same path
      // SuperAdmin extended
      { path: 'incidents',         element: <SuperAdminIncidents /> },
      { path: 'support-inbox',     element: <SuperAdminSupportInbox /> },
      { path: 'commodity-flow',    element: <CommodityFlowAnalytics /> },
      { path: 'user-management',   element: <UserAccessManagement /> },
      { path: 'state-monitor',     element: <StateMonitor /> },
      // Enforcement
      { path: 'incident-reporting', element: <IncidentReporting /> },
      { path: 'audit-report',       element: <AuditReport /> },
      { path: 'revenue', element: <RevenueDistributionConfig /> },
      { path: 'revenue/*', element: <RevenueDistributionConfig /> },
      { path: 'partners', element: <ModuleComingSoon /> },
      { path: 'partners/*', element: <ModuleComingSoon /> },
      { path: 'enforcement-ops', element: <ModuleComingSoon /> },
      { path: 'enforcement-ops/*', element: <ModuleComingSoon /> },
      { path: 'settings', element: <LevyConfigSettings /> },
      { path: 'settings/*', element: <ModuleComingSoon /> },
      // Catch-all for any unregistered dashboard sub-path
      { path: '*', element: <ModuleComingSoon /> },
    ],
  },
  {
    path: '*',
    element: <Navigate to={ROUTES.LOGIN} replace />,
  },
]);
