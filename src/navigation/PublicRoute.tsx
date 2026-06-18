import { Navigate } from 'react-router-dom';
import { useAppSelector } from '@/hooks/useAppSelector';
import { ROUTES } from '@/constants/routes';

export default function PublicRoute({ children }: { children: React.ReactNode }) {
  const { access_token, phone_confirmed } = useAppSelector((s) => s.auth);
  if (access_token && phone_confirmed) return <Navigate to={ROUTES.HOME} replace />;
  return <>{children}</>;
}
