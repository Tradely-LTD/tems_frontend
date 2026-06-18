import { Navigate } from 'react-router-dom';
import { useAppSelector } from '@/hooks/useAppSelector';
import { ROUTES } from '@/constants/routes';

interface Props {
  children: React.ReactNode;
  requirePhoneVerified?: boolean;
}

export default function ProtectedRoute({ children, requirePhoneVerified = true }: Props) {
  const { access_token, phone_confirmed } = useAppSelector((s) => s.auth);
  if (!access_token) return <Navigate to={ROUTES.LOGIN} replace />;
  if (requirePhoneVerified && !phone_confirmed)
    return <Navigate to={ROUTES.OTP_VERIFICATION} replace />;
  return <>{children}</>;
}
