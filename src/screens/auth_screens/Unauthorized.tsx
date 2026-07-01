import { NavLink } from 'react-router-dom';
import { useAppSelector } from '@/hooks/useAppSelector';
import { ROLE_ROUTES } from '@/config/roles';
import type { RoleName } from '@/config/roles';

export default function Unauthorized() {
  const user = useAppSelector((s) => s.auth.user);
  const homeRoute = user?.role_name
    ? (ROLE_ROUTES[user.role_name as RoleName] ?? '/dashboard')
    : '/login';

  return (
    <div className="min-h-screen bg-[#faf8ff] flex items-center justify-center">
      <div className="bg-white border border-[#c5c6d2] rounded-xl p-10 text-center max-w-md w-full">
        <h1 className="text-[22px] font-bold text-[#1a1b20] mb-2">Access Denied</h1>
        <p className="text-[14px] text-[#444650] leading-relaxed mb-8">
          You do not have access to this area.
        </p>
        <NavLink
          to={homeRoute}
          className="inline-flex items-center gap-2 bg-[#002366] text-white text-[14px] font-medium px-5 py-2.5 rounded hover:bg-[#001a4d] transition-colors"
        >
          Go to my dashboard
        </NavLink>
      </div>
    </div>
  );
}
