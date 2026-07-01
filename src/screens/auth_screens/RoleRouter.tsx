import { Navigate } from 'react-router-dom';
import { useAppSelector } from '@/hooks/useAppSelector';
import { ROUTES } from '@/constants/routes';
import { ROLE_ROUTES } from '@/config/roles';
import type { RoleName } from '@/config/roles';

export default function RoleRouter() {
  const user = useAppSelector((s) => s.auth.user);

  if (!user) {
    return <Navigate to={ROUTES.LOGIN} replace />;
  }

  const target = ROLE_ROUTES[user.role_name as RoleName];

  if (target) {
    return <Navigate to={target} replace />;
  }

  return <Navigate to="/unauthorized" replace />;
}
