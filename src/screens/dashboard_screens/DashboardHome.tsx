import { useAppSelector } from '@/hooks/useAppSelector';

const ROLE_WELCOME: Record<string, { title: string; subtitle: string }> = {
  NationalAdmin: {
    title: 'Strategic Oversight Dashboard',
    subtitle: 'National trade infrastructure — federal view',
  },
  StateAdmin: {
    title: 'Regional Oversight Dashboard',
    subtitle: 'State-level trade operations and revenue',
  },
  Agent: {
    title: 'Trade Agent Portal',
    subtitle: 'Manage waybills, shipments, and compliance',
  },
  Partner: {
    title: 'Partner Hub',
    subtitle: 'Sub-concessionaire operations and settlements',
  },
  Auditor: {
    title: 'Financial Integrity Hub',
    subtitle: 'Audit logs, revenue trails, and compliance checks',
  },
  JRB: {
    title: 'National Revenue Oversight',
    subtitle: 'JRB levy schedules and revenue distribution',
  },
  CorporateAccount: {
    title: 'Logistics Hub',
    subtitle: 'Corporate fleet, waybills, and trade accounts',
  },
  Enforcement: {
    title: 'Enforcement Command Dashboard',
    subtitle: 'Field operations, checkpoints, and enforcement intelligence',
  },
};

interface StatCardProps {
  label: string;
  value: string;
  accentColor: string;
  note?: string;
}

function StatCard({ label, value, accentColor, note }: StatCardProps) {
  return (
    <div className="bg-white border border-[#c5c6d2] rounded p-4 flex flex-col gap-1">
      <div
        className="w-1 h-8 rounded-full mb-2"
        style={{ backgroundColor: accentColor }}
      />
      <p className="text-[12px] font-bold uppercase tracking-[0.05em] text-[#444650]">{label}</p>
      <p className="text-[28px] font-bold text-[#1a1b20] leading-none">{value}</p>
      {note && <p className="text-[12px] text-[#475569] mt-1">{note}</p>}
    </div>
  );
}

export default function DashboardHome() {
  const user = useAppSelector((s) => s.auth.user);
  const roleName = user?.role_name ?? 'Agent';

  const welcome = ROLE_WELCOME[roleName] ?? {
    title: 'Dashboard',
    subtitle: 'Your TeMS workspace',
  };

  const firstName = user?.full_name?.split(' ')[0] ?? 'there';

  return (
    <div className="max-w-[1280px] mx-auto">
      {/* Page header */}
      <div className="mb-8">
        <h1 className="text-[32px] font-bold text-[#1a1b20] leading-tight">{welcome.title}</h1>
        <p className="text-[14px] text-[#444650] mt-1">{welcome.subtitle}</p>
      </div>

      {/* Welcome banner */}
      <div className="bg-[#00113a] rounded p-6 mb-8 flex items-center justify-between">
        <div>
          <p className="text-[#758dd5] text-[12px] font-bold uppercase tracking-[0.05em] mb-1">
            Welcome back
          </p>
          <p className="text-white text-[20px] font-bold leading-snug">
            Good day, {firstName}
          </p>
          <p className="text-white/60 text-[13px] mt-1">
            {user?.email ?? '—'} · {roleName}
          </p>
        </div>
        <div className="w-14 h-14 rounded-full bg-[#002366] flex items-center justify-center">
          <span className="text-white text-[20px] font-bold">
            {user?.full_name?.split(' ').slice(0, 2).map((w) => w[0].toUpperCase()).join('') ?? '?'}
          </span>
        </div>
      </div>

      {/* Stat cards — placeholder data until module APIs are built */}
      <div className="grid grid-cols-4 gap-4 mb-8">
        <StatCard
          label="Active Waybills"
          value="—"
          accentColor="#002366"
          note="Coming soon"
        />
        <StatCard
          label="Pending KYC"
          value="—"
          accentColor="#D4AF37"
          note="Coming soon"
        />
        <StatCard
          label="Revenue (Today)"
          value="—"
          accentColor="#096c4b"
          note="Coming soon"
        />
        <StatCard
          label="Alerts"
          value="—"
          accentColor="#D83B01"
          note="Coming soon"
        />
      </div>

      {/* Modules under construction notice */}
      <div className="bg-white border border-[#c5c6d2] rounded p-6">
        <div className="flex items-start gap-4">
          <div className="w-10 h-10 rounded bg-[#002366]/10 flex items-center justify-center shrink-0">
            <svg className="w-5 h-5 text-[#002366]" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.5}>
              <path strokeLinecap="round" strokeLinejoin="round" d="M11.25 11.25l.041-.02a.75.75 0 011.063.852l-.708 2.836a.75.75 0 001.063.853l.041-.021M21 12a9 9 0 11-18 0 9 9 0 0118 0zm-9-3.75h.008v.008H12V8.25z" />
            </svg>
          </div>
          <div>
            <p className="text-[14px] font-semibold text-[#1a1b20] mb-1">
              TeMS modules are being deployed
            </p>
            <p className="text-[13px] text-[#444650] leading-relaxed">
              Authentication is complete. The Waybill, Identity & KYC, Revenue, Partner, and Enforcement
              modules are under active development and will appear in the navigation once deployed.
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}
