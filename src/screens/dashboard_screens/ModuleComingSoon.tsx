import { useLocation, NavLink } from 'react-router-dom';
import { useAppSelector } from '@/hooks/useAppSelector';

const ROLE_HOME: Record<string, string> = {
  NationalAdmin: '/dashboard/national',
  StateAdmin: '/dashboard/state',
  Agent: '/dashboard/agent',
  Partner: '/dashboard/partner',
  Auditor: '/dashboard/auditor',
  JRB: '/dashboard/jrb',
  CorporateAccount: '/dashboard/corporate',
  Enforcement: '/dashboard/enforcement',
};

const SEGMENT_LABELS: Record<string, string> = {
  waybills: 'Waybill Module',
  identity: 'Identity & KYC Module',
  revenue: 'Revenue Module',
  partners: 'Partners Module',
  'enforcement-ops': 'Enforcement Module',
  settings: 'System Settings',
};

export default function ModuleComingSoon() {
  const location = useLocation();
  const user = useAppSelector((s) => s.auth.user);
  const roleName = user?.role_name ?? 'Agent';
  const homeRoute = ROLE_HOME[roleName] ?? '/dashboard';

  const segment = location.pathname.split('/').filter(Boolean).pop() ?? '';
  const moduleName = SEGMENT_LABELS[segment] ?? 'This Module';

  return (
    <div className="max-w-[640px] mx-auto mt-16">
      <div className="bg-white border border-[#c5c6d2] rounded p-10 text-center">
        <div className="w-16 h-16 rounded-full bg-[#002366]/10 flex items-center justify-center mx-auto mb-6">
          <svg className="w-8 h-8 text-[#002366]" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.5}>
            <path strokeLinecap="round" strokeLinejoin="round" d="M11.42 15.17L17.25 21A2.652 2.652 0 0021 17.25l-5.877-5.877M11.42 15.17l2.496-3.03c.317-.384.74-.626 1.208-.766M11.42 15.17l-4.655 5.653a2.548 2.548 0 11-3.586-3.586l6.837-5.63m5.108-.233c.55-.164 1.163-.188 1.743-.14a4.5 4.5 0 004.486-6.336l-3.276 3.277a3.004 3.004 0 01-2.25-2.25l3.276-3.276a4.5 4.5 0 00-6.336 4.486c.091 1.076-.071 2.264-.904 2.95l-.102.085m-1.745 1.437L5.909 7.5H4.5L2.25 3.75l1.5-1.5L7.5 4.5v1.409l4.26 4.26m-1.745 1.437l1.745-1.437m6.615 8.206L15.75 15.75M4.867 19.125h.008v.008h-.008v-.008z" />
          </svg>
        </div>

        <h2 className="text-[22px] font-bold text-[#1a1b20] mb-2">{moduleName}</h2>
        <p className="text-[14px] text-[#444650] leading-relaxed mb-8">
          This module is under active development and will be available soon.
          The TeMS platform is being built in phases — core authentication is live,
          and trade operations modules are next.
        </p>

        <NavLink
          to={homeRoute}
          className="inline-flex items-center gap-2 bg-[#002366] text-white text-[14px] font-medium px-5 py-2.5 rounded hover:bg-[#001a4d] transition-colors"
        >
          <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.5}>
            <path strokeLinecap="round" strokeLinejoin="round" d="M10.5 19.5L3 12m0 0l7.5-7.5M3 12h18" />
          </svg>
          Back to Overview
        </NavLink>
      </div>
    </div>
  );
}
