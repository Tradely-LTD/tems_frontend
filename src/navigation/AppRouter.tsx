import { createBrowserRouter, Navigate } from 'react-router-dom';
import PublicRoute from './PublicRoute';
import ProtectedRoute from './ProtectedRoute';
import Login from '@/screens/auth_screens/Login';
import ForgotPassword from '@/screens/auth_screens/ForgotPassword';
import ResetPassword from '@/screens/auth_screens/ResetPassword';
import OtpVerification from '@/screens/auth_screens/OtpVerification';
import RoleRouter from '@/screens/auth_screens/RoleRouter';
import { DashboardLayout, DashboardHome, ModuleComingSoon } from '@/screens/dashboard_screens';
import { WaybillLedger, WaybillDetail, WaybillPass, WaybillManage, WaybillWizard } from '@/screens/waybill_screens';
import { ROUTES } from '@/constants/routes';

export const router = createBrowserRouter([
  {
    path: ROUTES.LOGIN,
    element: (
      <PublicRoute>
        <Login />
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
      { path: 'national', element: <DashboardHome /> },
      { path: 'state', element: <DashboardHome /> },
      { path: 'agent', element: <DashboardHome /> },
      { path: 'partner', element: <DashboardHome /> },
      { path: 'auditor', element: <DashboardHome /> },
      { path: 'jrb', element: <DashboardHome /> },
      { path: 'corporate', element: <DashboardHome /> },
      { path: 'enforcement', element: <DashboardHome /> },
      // Waybill module — static paths BEFORE dynamic path
      { path: 'waybills', element: <WaybillLedger /> },
      { path: 'waybills/new', element: <WaybillWizard /> },
      { path: 'waybills/manage', element: <WaybillManage /> },
      { path: 'waybills/:waybillId', element: <WaybillDetail /> },
      { path: 'waybills/:waybillId/pass', element: <WaybillPass /> },
      { path: 'identity', element: <ModuleComingSoon /> },
      { path: 'identity/*', element: <ModuleComingSoon /> },
      { path: 'revenue', element: <ModuleComingSoon /> },
      { path: 'revenue/*', element: <ModuleComingSoon /> },
      { path: 'partners', element: <ModuleComingSoon /> },
      { path: 'partners/*', element: <ModuleComingSoon /> },
      { path: 'enforcement-ops', element: <ModuleComingSoon /> },
      { path: 'enforcement-ops/*', element: <ModuleComingSoon /> },
      { path: 'settings', element: <ModuleComingSoon /> },
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
