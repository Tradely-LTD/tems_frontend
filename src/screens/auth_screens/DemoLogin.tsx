import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useLoginMutation } from './services/authSlice';
import { ROUTES } from '@/constants/routes';
import { ROLE_DISPLAY } from '@/config/roles';
import type { RoleName } from '@/config/roles';
import Login from './Login';

const DEMO_PASSWORD = 'Demo@1234';

interface DemoUser {
  role: RoleName;
  email: string;
  description: string;
  accent: string;
}

const DEMO_USERS: DemoUser[] = [
  { role: 'SuperAdmin',             email: 'superadmin@tems.ng',    description: 'Full platform oversight & control',       accent: '#002366' },
  { role: 'NationalAdmin',          email: 'nationaladmin@tems.ng', description: 'National trade infrastructure — federal',  accent: '#1D4ED8' },
  { role: 'JRBAccount',             email: 'jrb@tems.ng',           description: 'JRB levy schedules & revenue distribution', accent: '#096c4b' },
  { role: 'FederalGovtAccount',     email: 'federal@tems.ng',       description: 'Federal revenue compliance & waybill data', accent: '#065f46' },
  { role: 'StateAdmin',             email: 'stateadmin@tems.ng',    description: 'State-level trade operations & revenue',    accent: '#7C3AED' },
  { role: 'LGAAdmin',               email: 'lgaadmin@tems.ng',      description: 'LGA area trade & enforcement',             accent: '#6D28D9' },
  { role: 'MarketAdmin',            email: 'marketadmin@tems.ng',   description: 'Market waybills, agents & partners',        accent: '#B45309' },
  { role: 'Agent',                  email: 'agent@tems.ng',         description: 'Issue & manage trade waybills',            accent: '#D97706' },
  { role: 'EnforcementOfficer',     email: 'officer@tems.ng',       description: 'Field checkpoints & incident reporting',   accent: '#DC2626' },
  { role: 'SubConcessionaireAdmin', email: 'subcon@tems.ng',        description: 'Concessionaire operations & settlements',  accent: '#0F766E' },
  { role: 'CorporateAccount',       email: 'corporate@tems.ng',     description: 'Corporate fleet, waybills & trade',        accent: '#7E22CE' },
  { role: 'Auditor',                email: 'auditor@tems.ng',       description: 'Financial audit logs & compliance checks', accent: '#92400E' },
  { role: 'Buyer',                  email: 'buyer@tems.ng',         description: 'Track waybills, shipments & deliveries',   accent: '#0369A1' },
];

export default function DemoLogin() {
  const navigate = useNavigate();
  const [login] = useLoginMutation();
  const [loadingRole, setLoadingRole] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [showManual, setShowManual] = useState(false);

  async function loginAs(email: string, role: string) {
    setLoadingRole(role);
    setError(null);
    try {
      const result = await login({ email, password: DEMO_PASSWORD }).unwrap();
      if (!result.data.user.phone_verified) {
        navigate(ROUTES.OTP_VERIFICATION);
      } else {
        navigate(ROUTES.HOME);
      }
    } catch {
      setError('Login failed — make sure the backend is running and demo users are seeded (`npm run db:seed:users`).');
      setLoadingRole(null);
    }
  }

  return (
    <div className="min-h-screen bg-[#f0f2f8] flex flex-col">
      {/* Top bar */}
      <header className="bg-[#00113a] px-6 md:px-10 py-4 flex items-center justify-between shrink-0">
        <div className="flex items-center gap-3">
          <div className="w-8 h-8 rounded bg-[#D4AF37] flex items-center justify-center shrink-0">
            <span className="text-[#00113a] font-black text-sm leading-none">T</span>
          </div>
          <div>
            <p className="text-white font-bold text-[15px] leading-none">TeMS</p>
            <p className="text-[#758dd5] text-[11px] mt-0.5 leading-none">Trade e-Management System</p>
          </div>
        </div>
        <span className="bg-[#D4AF37] text-[#00113a] text-[10px] font-black px-3 py-1 rounded-full tracking-[0.12em] uppercase">
          Demo Mode
        </span>
      </header>

      {/* Body */}
      <main className="flex-1 px-4 md:px-8 py-10 w-full max-w-7xl mx-auto">
        {/* Heading */}
        <div className="text-center mb-8">
          <h1 className="text-[26px] md:text-[30px] font-bold text-[#00113a]">Select a Role to Sign In</h1>
          <p className="text-[14px] text-[#555] mt-2">
            Click any card to instantly sign in as that role. All accounts use password&nbsp;
            <code className="bg-white border border-gray-200 text-[#002366] font-mono text-[12px] px-2 py-0.5 rounded">
              {DEMO_PASSWORD}
            </code>
          </p>
        </div>

        {/* Error banner */}
        {error && (
          <div className="mb-6 max-w-2xl mx-auto bg-red-50 border border-red-200 text-red-700 rounded-lg px-4 py-3 text-[13px] text-center">
            {error}
          </div>
        )}

        {/* Role cards grid */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4">
          {DEMO_USERS.map(({ role, email, description, accent }) => {
            const isLoading = loadingRole === role;
            const isDisabled = !!loadingRole;
            return (
              <button
                key={role}
                type="button"
                disabled={isDisabled}
                onClick={() => loginAs(email, role)}
                style={{ borderLeftColor: accent } as React.CSSProperties}
                className={[
                  'group text-left bg-white rounded-lg border border-gray-200 border-l-4 p-5',
                  'transition-all duration-150',
                  isDisabled
                    ? 'opacity-60 cursor-wait'
                    : 'hover:shadow-md hover:border-gray-300 cursor-pointer',
                ].join(' ')}
              >
                {/* Role name */}
                <p className="text-[13px] font-bold text-[#0F172A] leading-snug mb-0.5">
                  {ROLE_DISPLAY[role]}
                </p>
                {/* Email */}
                <p className="text-[11px] font-mono text-[#555] mb-2 truncate">{email}</p>
                {/* Description */}
                <p className="text-[11px] text-[#777] leading-relaxed mb-4">{description}</p>
                {/* CTA */}
                <div
                  style={{ color: accent, backgroundColor: `${accent}18` } as React.CSSProperties}
                  className="w-full text-center text-[12px] font-semibold py-1.5 rounded transition-colors"
                >
                  {isLoading ? (
                    <span className="flex items-center justify-center gap-1.5">
                      <svg className="w-3.5 h-3.5 animate-spin" viewBox="0 0 24 24" fill="none">
                        <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
                        <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8v4l3-3-3-3v4a8 8 0 00-8 8h4l-3 3 3 3H4z" />
                      </svg>
                      Signing in…
                    </span>
                  ) : (
                    'Sign In'
                  )}
                </div>
              </button>
            );
          })}
        </div>

        {/* Manual login toggle */}
        <div className="mt-12 text-center">
          <button
            type="button"
            onClick={() => setShowManual((v) => !v)}
            className="text-[13px] text-[#555] hover:text-[#00113a] underline-offset-2 underline transition-colors"
          >
            {showManual ? 'Hide manual login' : 'Sign in with your own credentials instead'}
          </button>
        </div>

        {showManual && (
          <div className="mt-6 flex justify-center">
            <Login />
          </div>
        )}
      </main>
    </div>
  );
}
