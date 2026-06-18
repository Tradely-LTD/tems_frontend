import { Navigate } from 'react-router-dom';
import { useAppSelector } from '@/hooks/useAppSelector';
import { ROUTES } from '@/constants/routes';

const roleRoutes: Record<string, string> = {
  NationalAdmin: '/dashboard/national',
  StateAdmin: '/dashboard/state',
  Agent: '/dashboard/agent',
  Partner: '/dashboard/partner',
  Auditor: '/dashboard/auditor',
  JRB: '/dashboard/jrb',
  CorporateAccount: '/dashboard/corporate',
  Enforcement: '/dashboard/enforcement',
};

export default function RoleRouter() {
  const user = useAppSelector((s) => s.auth.user);
  const target = user?.role_name
    ? (roleRoutes[user.role_name] ?? '/dashboard/agent')
    : ROUTES.LOGIN;
  return <Navigate to={target} replace />;
}
