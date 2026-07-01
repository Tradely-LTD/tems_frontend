import { useState } from 'react';
import { Outlet, NavLink, Navigate, useNavigate, useLocation } from 'react-router-dom';
import { useAppSelector } from '@/hooks/useAppSelector';
import { useAppDispatch } from '@/hooks/useAppDispatch';
import { clearAuth, useLogoutMutation } from '@/screens/auth_screens/services/authSlice';
import { ROUTES } from '@/constants/routes';
import { NAV_ITEMS, ROLE_ROUTES, ROLE_DISPLAY } from '@/config/roles';
import type { RoleName, NavIconKey, NavItemConfig } from '@/config/roles';

interface NavItem {
  label: string;
  to: string;
  icon: React.ReactNode;
  section?: string;
  built?: boolean;
  children?: NavItem[];
}

function HomeIcon() {
  return (
    <svg className="w-5 h-5 shrink-0" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.5} aria-hidden="true">
      <path strokeLinecap="round" strokeLinejoin="round" d="M2.25 12l8.954-8.955a1.126 1.126 0 011.591 0L21.75 12M4.5 9.75v10.125c0 .621.504 1.125 1.125 1.125H9.75v-4.875c0-.621.504-1.125 1.125-1.125h2.25c.621 0 1.125.504 1.125 1.125V21h4.125c.621 0 1.125-.504 1.125-1.125V9.75M8.25 21h8.25" />
    </svg>
  );
}

function DocumentIcon() {
  return (
    <svg className="w-5 h-5 shrink-0" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.5} aria-hidden="true">
      <path strokeLinecap="round" strokeLinejoin="round" d="M19.5 14.25v-2.625a3.375 3.375 0 00-3.375-3.375h-1.5A1.125 1.125 0 0113.5 7.125v-1.5a3.375 3.375 0 00-3.375-3.375H8.25m0 12.75h7.5m-7.5 3H12M10.5 2.25H5.625c-.621 0-1.125.504-1.125 1.125v17.25c0 .621.504 1.125 1.125 1.125h12.75c.621 0 1.125-.504 1.125-1.125V11.25a9 9 0 00-9-9z" />
    </svg>
  );
}

function IdentityIcon() {
  return (
    <svg className="w-5 h-5 shrink-0" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.5} aria-hidden="true">
      <path strokeLinecap="round" strokeLinejoin="round" d="M15 9h3.75M15 12h3.75M15 15h3.75M4.5 19.5h15a2.25 2.25 0 002.25-2.25V6.75A2.25 2.25 0 0019.5 4.5h-15a2.25 2.25 0 00-2.25 2.25v10.5A2.25 2.25 0 004.5 19.5zm6-10.125a1.875 1.875 0 11-3.75 0 1.875 1.875 0 013.75 0zm1.294 6.336a6.721 6.721 0 01-3.17.789 6.721 6.721 0 01-3.168-.789 3.376 3.376 0 016.338 0z" />
    </svg>
  );
}

function RevenueIcon() {
  return (
    <svg className="w-5 h-5 shrink-0" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.5} aria-hidden="true">
      <path strokeLinecap="round" strokeLinejoin="round" d="M3 13.125C3 12.504 3.504 12 4.125 12h2.25c.621 0 1.125.504 1.125 1.125v6.75C7.5 20.496 6.996 21 6.375 21h-2.25A1.125 1.125 0 013 19.875v-6.75zM9.75 8.625c0-.621.504-1.125 1.125-1.125h2.25c.621 0 1.125.504 1.125 1.125v11.25c0 .621-.504 1.125-1.125 1.125h-2.25a1.125 1.125 0 01-1.125-1.125V8.625zM16.5 4.125c0-.621.504-1.125 1.125-1.125h2.25C20.496 3 21 3.504 21 4.125v15.75c0 .621-.504 1.125-1.125 1.125h-2.25a1.125 1.125 0 01-1.125-1.125V4.125z" />
    </svg>
  );
}

function PartnersIcon() {
  return (
    <svg className="w-5 h-5 shrink-0" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.5} aria-hidden="true">
      <path strokeLinecap="round" strokeLinejoin="round" d="M18 18.72a9.094 9.094 0 003.741-.479 3 3 0 00-4.682-2.72m.94 3.198l.001.031c0 .225-.012.447-.037.666A11.944 11.944 0 0112 21c-2.17 0-4.207-.576-5.963-1.584A6.062 6.062 0 016 18.719m12 0a5.971 5.971 0 00-.941-3.197m0 0A5.995 5.995 0 0012 12.75a5.995 5.995 0 00-5.058 2.772m0 0a3 3 0 00-4.681 2.72 8.986 8.986 0 003.74.477m.94-3.197a5.971 5.971 0 00-.94 3.197M15 6.75a3 3 0 11-6 0 3 3 0 016 0zm6 3a2.25 2.25 0 11-4.5 0 2.25 2.25 0 014.5 0zm-13.5 0a2.25 2.25 0 11-4.5 0 2.25 2.25 0 014.5 0z" />
    </svg>
  );
}

function ShieldIcon() {
  return (
    <svg className="w-5 h-5 shrink-0" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.5} aria-hidden="true">
      <path strokeLinecap="round" strokeLinejoin="round" d="M9 12.75L11.25 15 15 9.75m-3-7.036A11.959 11.959 0 013.598 6 11.99 11.99 0 003 9.749c0 5.592 3.824 10.29 9 11.623 5.176-1.332 9-6.03 9-11.622 0-1.31-.21-2.571-.598-3.751h-.152c-3.196 0-6.1-1.248-8.25-3.285z" />
    </svg>
  );
}

function GearIcon() {
  return (
    <svg className="w-5 h-5 shrink-0" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.5} aria-hidden="true">
      <path strokeLinecap="round" strokeLinejoin="round" d="M9.594 3.94c.09-.542.56-.94 1.11-.94h2.593c.55 0 1.02.398 1.11.94l.213 1.281c.063.374.313.686.645.87.074.04.147.083.22.127.324.196.72.257 1.075.124l1.217-.456a1.125 1.125 0 011.37.49l1.296 2.247a1.125 1.125 0 01-.26 1.431l-1.003.827c-.293.24-.438.613-.431.992a6.759 6.759 0 010 .255c-.007.378.138.75.43.99l1.005.828c.424.35.534.954.26 1.43l-1.298 2.247a1.125 1.125 0 01-1.369.491l-1.217-.456c-.355-.133-.75-.072-1.076.124a6.57 6.57 0 01-.22.128c-.331.183-.581.495-.644.869l-.213 1.28c-.09.543-.56.941-1.11.941h-2.594c-.55 0-1.02-.398-1.11-.94l-.213-1.281c-.062-.374-.312-.686-.644-.87a6.52 6.52 0 01-.22-.127c-.325-.196-.72-.257-1.076-.124l-1.217.456a1.125 1.125 0 01-1.369-.49l-1.297-2.247a1.125 1.125 0 01.26-1.431l1.004-.827c.292-.24.437-.613.43-.992a6.932 6.932 0 010-.255c.007-.378-.138-.75-.43-.99l-1.004-.828a1.125 1.125 0 01-.26-1.43l1.297-2.247a1.125 1.125 0 011.37-.491l1.216.456c.356.133.751.072 1.076-.124.072-.044.146-.087.22-.128.332-.183.582-.495.644-.869l.214-1.281z" />
      <path strokeLinecap="round" strokeLinejoin="round" d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
    </svg>
  );
}

function UsersIcon() {
  return (
    <svg className="w-5 h-5 shrink-0" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.5} aria-hidden="true">
      <path strokeLinecap="round" strokeLinejoin="round" d="M15 19.128a9.38 9.38 0 002.625.372 9.337 9.337 0 004.121-.952 4.125 4.125 0 00-7.533-2.493M15 19.128v-.003c0-1.113-.285-2.16-.786-3.07M15 19.128v.106A12.318 12.318 0 018.624 21c-2.331 0-4.512-.645-6.374-1.766l-.001-.109a6.375 6.375 0 0111.964-3.07M12 6.375a3.375 3.375 0 11-6.75 0 3.375 3.375 0 016.75 0zm8.25 2.25a2.625 2.625 0 11-5.25 0 2.625 2.625 0 015.25 0z" />
    </svg>
  );
}

function ChartIcon() {
  return (
    <svg className="w-5 h-5 shrink-0" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.5} aria-hidden="true">
      <path strokeLinecap="round" strokeLinejoin="round" d="M7.5 14.25v2.25m3-4.5v4.5m3-6.75v6.75m3-9v9M6 20.25h12A2.25 2.25 0 0020.25 18V6A2.25 2.25 0 0018 3.75H6A2.25 2.25 0 003.75 6v12A2.25 2.25 0 006 20.25z" />
    </svg>
  );
}

function ClockIcon() {
  return (
    <svg className="w-5 h-5 shrink-0" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.5} aria-hidden="true">
      <path strokeLinecap="round" strokeLinejoin="round" d="M12 6v6h4.5m4.5 0a9 9 0 11-18 0 9 9 0 0118 0z" />
    </svg>
  );
}

function HelpIcon() {
  return (
    <svg className="w-5 h-5 shrink-0" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.5} aria-hidden="true">
      <path strokeLinecap="round" strokeLinejoin="round" d="M9.879 7.519c1.171-1.025 3.071-1.025 4.242 0 1.172 1.025 1.172 2.687 0 3.712-.203.179-.43.326-.67.442-.745.361-1.45.999-1.45 1.827v.75M21 12a9 9 0 11-18 0 9 9 0 0118 0zm-9 5.25h.008v.008H12v-.008z" />
    </svg>
  );
}

function AlertIcon() {
  return (
    <svg className="w-5 h-5 shrink-0" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.5} aria-hidden="true">
      <path strokeLinecap="round" strokeLinejoin="round" d="M12 9v3.75m-9.303 3.376c-.866 1.5.217 3.374 1.948 3.374h14.71c1.73 0 2.813-1.874 1.948-3.374L13.949 3.378c-.866-1.5-3.032-1.5-3.898 0L2.697 16.126zM12 15.75h.007v.008H12v-.008z" />
    </svg>
  );
}

function BuildingIcon() {
  return (
    <svg className="w-5 h-5 shrink-0" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.5} aria-hidden="true">
      <path strokeLinecap="round" strokeLinejoin="round" d="M3.75 21h16.5M4.5 3h15M5.25 3v18m13.5-18v18M9 6.75h1.5m-1.5 3h1.5m-1.5 3h1.5m3-6H15m-1.5 3H15m-1.5 3H15M9 21v-3.375c0-.621.504-1.125 1.125-1.125h3.75c.621 0 1.125.504 1.125 1.125V21" />
    </svg>
  );
}

const ICON_MAP: Record<NavIconKey, React.ReactNode> = {
  home:     <HomeIcon />,
  document: <DocumentIcon />,
  identity: <IdentityIcon />,
  revenue:  <RevenueIcon />,
  partners: <PartnersIcon />,
  shield:   <ShieldIcon />,
  gear:     <GearIcon />,
  users:    <UsersIcon />,
  chart:    <ChartIcon />,
  clock:    <ClockIcon />,
  help:     <HelpIcon />,
  alert:    <AlertIcon />,
  building: <BuildingIcon />,
};

// The set of exact paths that are role-home routes (used for wrong-role redirect guard)
const ROLE_HOME_PATHS = new Set(Object.values(ROLE_ROUTES));

function resolveNavItems(roleName: string): NavItem[] {
  const configs = NAV_ITEMS[roleName as RoleName];
  if (!configs) return [];

  const homeRoute = ROLE_ROUTES[roleName as RoleName] ?? ROUTES.DASHBOARD;

  function mapConfig(cfg: NavItemConfig): NavItem {
    return {
      label:    cfg.label,
      to:       cfg.path === '__home__' ? homeRoute : cfg.path,
      icon:     ICON_MAP[cfg.iconKey],
      section:  cfg.section,
      built:    cfg.built,
      children: cfg.children?.map(mapConfig),
    };
  }

  return configs.map(mapConfig);
}

function ChevronIcon({ open }: { open: boolean }) {
  return (
    <svg
      className={`w-3.5 h-3.5 shrink-0 text-white/40 transition-transform duration-150 ${open ? 'rotate-90' : ''}`}
      fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2} aria-hidden="true"
    >
      <path strokeLinecap="round" strokeLinejoin="round" d="M8.25 4.5l7.5 7.5-7.5 7.5" />
    </svg>
  );
}

function SidebarNavItems({ items, onNavigate }: { items: NavItem[]; onNavigate?: () => void }) {
  const location = useLocation();

  const [expanded, setExpanded] = useState<Set<string>>(() => {
    const open = new Set<string>();
    for (const item of items) {
      if (item.children?.some((c) => location.pathname === c.to || location.pathname.startsWith(c.to + '/'))) {
        open.add(item.label);
      }
    }
    return open;
  });

  function toggle(label: string) {
    setExpanded((prev) => {
      const next = new Set(prev);
      if (next.has(label)) next.delete(label);
      else next.add(label);
      return next;
    });
  }

  let lastSection: string | undefined = undefined;

  return (
    <nav className="flex-1 overflow-y-auto py-4 px-3">
      {items.map((item) => {
        const showSection = item.section && item.section !== lastSection;
        lastSection = item.section;

        if (item.children && item.children.length > 0) {
          const isOpen = expanded.has(item.label);
          const hasActiveChild = item.children.some(
            (c) => location.pathname === c.to || location.pathname.startsWith(c.to + '/')
          );

          return (
            <div key={item.label}>
              {showSection && (
                <p className="text-[11px] font-bold tracking-[0.05em] text-[#758dd5] uppercase px-3 pt-5 pb-1">
                  {item.section}
                </p>
              )}
              <button
                type="button"
                onClick={() => toggle(item.label)}
                className={[
                  'w-full flex items-center gap-3 px-3 py-2.5 rounded text-[13px] font-medium transition-colors border-l-2',
                  hasActiveChild
                    ? 'bg-white/5 text-white border-[#D4AF37]'
                    : 'text-white/60 hover:text-white hover:bg-white/5 border-transparent',
                ].join(' ')}
              >
                {item.icon}
                <span className="flex-1 text-left">{item.label}</span>
                <ChevronIcon open={isOpen} />
              </button>
              {isOpen && (
                <div className="ml-3 mt-0.5 mb-1 border-l border-white/10 pl-2">
                  {item.children.map((child) => (
                    <NavLink
                      key={child.to}
                      to={child.to}
                      end
                      onClick={onNavigate}
                      className={({ isActive }) =>
                        [
                          'flex items-center gap-3 px-3 py-2 rounded text-[12px] font-medium transition-colors',
                          isActive
                            ? 'bg-[#002366] text-white'
                            : 'text-white/50 hover:text-white hover:bg-white/5',
                        ].join(' ')
                      }
                    >
                      {child.icon}
                      <span className="flex-1">{child.label}</span>
                      {child.built === false && (
                        <span className="text-[9px] font-bold tracking-wide bg-white/10 text-white/50 px-1.5 py-0.5 rounded uppercase">
                          Soon
                        </span>
                      )}
                    </NavLink>
                  ))}
                </div>
              )}
            </div>
          );
        }

        return (
          <div key={item.to}>
            {showSection && (
              <p className="text-[11px] font-bold tracking-[0.05em] text-[#758dd5] uppercase px-3 pt-5 pb-1">
                {item.section}
              </p>
            )}
            <NavLink
              to={item.to}
              end
              onClick={onNavigate}
              className={({ isActive }) =>
                [
                  'flex items-center gap-3 px-3 py-2.5 rounded text-[13px] font-medium transition-colors',
                  isActive
                    ? 'bg-[#002366] text-white border-l-2 border-[#D4AF37] pl-[10px]'
                    : 'text-white/60 hover:text-white hover:bg-white/5 border-l-2 border-transparent',
                ].join(' ')
            }
            >
              {item.icon}
              <span className="flex-1">{item.label}</span>
              {item.built === false && (
                <span className="text-[9px] font-bold tracking-wide bg-white/10 text-white/50 px-1.5 py-0.5 rounded uppercase">
                  Soon
                </span>
              )}
            </NavLink>
          </div>
        );
      })}
    </nav>
  );
}

function HamburgerIcon() {
  return (
    <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.5} aria-hidden="true">
      <path strokeLinecap="round" strokeLinejoin="round" d="M3.75 6.75h16.5M3.75 12h16.5m-16.5 5.25h16.5" />
    </svg>
  );
}

function XIcon() {
  return (
    <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.5} aria-hidden="true">
      <path strokeLinecap="round" strokeLinejoin="round" d="M6 18L18 6M6 6l12 12" />
    </svg>
  );
}

function LogoutIcon() {
  return (
    <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.5} aria-hidden="true">
      <path strokeLinecap="round" strokeLinejoin="round" d="M15.75 9V5.25A2.25 2.25 0 0013.5 3h-6a2.25 2.25 0 00-2.25 2.25v13.5A2.25 2.25 0 007.5 21h6a2.25 2.25 0 002.25-2.25V15M12 9l-3 3m0 0l3 3m-3-3h12.75" />
    </svg>
  );
}

function BellIcon() {
  return (
    <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.5} aria-hidden="true">
      <path strokeLinecap="round" strokeLinejoin="round" d="M14.857 17.082a23.848 23.848 0 005.454-1.31A8.967 8.967 0 0118 9.75v-.7V9A6 6 0 006 9v.75a8.967 8.967 0 01-2.312 6.022c1.733.64 3.56 1.085 5.455 1.31m5.714 0a24.255 24.255 0 01-5.714 0m5.714 0a3 3 0 11-5.714 0" />
    </svg>
  );
}

export default function DashboardLayout() {
  const dispatch = useAppDispatch();
  const navigate = useNavigate();
  const location = useLocation();
  const { user, refresh_token } = useAppSelector((s) => s.auth);
  const [logoutMutation] = useLogoutMutation();
  const [sidebarOpen, setSidebarOpen] = useState(() => window.innerWidth >= 768);
  const [showNotifications, setShowNotifications] = useState(false);
  const toggleSidebar = () => setSidebarOpen((o) => !o);

  const roleName = user?.role_name ?? '';
  const navItems = resolveNavItems(roleName);
  const roleLabel = ROLE_DISPLAY[roleName as RoleName] ?? roleName;
  const userRoleHome = ROLE_ROUTES[roleName as RoleName];



  // Wrong-role redirect guard: if visiting an exact role-home path that does not belong to this user
  if (
    userRoleHome &&
    ROLE_HOME_PATHS.has(location.pathname) &&
    location.pathname !== userRoleHome
  ) {
    return <Navigate to={userRoleHome} replace />;
  }

  async function handleLogout() {
    if (refresh_token) {
      await logoutMutation({ refresh_token }).unwrap().catch(() => {});
    }
    dispatch(clearAuth());
    navigate(ROUTES.LOGIN, { replace: true });
  }

  const initials = user?.full_name
    ? user.full_name.split(' ').slice(0, 2).map((w) => w[0].toUpperCase()).join('')
    : '?';

  return (
    <div className="flex h-screen overflow-hidden bg-[#faf8ff]">
      {/* Mobile backdrop — closes sidebar when tapped outside */}
      {sidebarOpen && (
        <div
          className="fixed inset-0 z-30 bg-black/50 md:hidden"
          onClick={toggleSidebar}
          aria-hidden="true"
        />
      )}

      {/* Sidebar */}
      <aside
        className={[
          'flex flex-col bg-[#00113a] h-full shrink-0',
          'transition-all duration-300 ease-in-out',
          // Mobile: fixed overlay, slide in/out via transform
          'fixed inset-y-0 left-0 z-40 w-64',
          sidebarOpen ? 'translate-x-0' : '-translate-x-full',
          // Desktop: static in flow, collapse via width
          'md:relative md:z-auto md:translate-x-0',
          sidebarOpen ? 'md:w-60' : 'md:w-0 md:overflow-hidden',
        ].join(' ')}
      >
        {/* Logo zone */}
        <div className="h-16 flex items-center px-5 border-b border-white/10 shrink-0 overflow-hidden">
          <div className="flex items-center gap-2 flex-1 min-w-0">
            <div className="w-7 h-7 rounded bg-[#D4AF37] flex items-center justify-center shrink-0">
              <span className="text-[#00113a] text-[11px] font-black leading-none">T</span>
            </div>
            <div className="min-w-0">
              <p className="text-white text-[13px] font-bold leading-none whitespace-nowrap">TeMS</p>
              <p className="text-[#758dd5] text-[10px] leading-none mt-0.5 whitespace-nowrap">Trade e-Management</p>
            </div>
          </div>
        </div>

        {/* Navigation */}
        <SidebarNavItems
          items={navItems}
          onNavigate={() => { if (window.innerWidth < 768) setSidebarOpen(false); }}
        />

        {/* User card */}
        <div className="shrink-0 border-t border-white/10 px-3 py-3">
          <div className="flex items-center gap-2.5">
            <div className="w-8 h-8 rounded-full bg-[#002366] flex items-center justify-center shrink-0">
              <span className="text-white text-[11px] font-bold">{initials}</span>
            </div>
            <div className="flex-1 min-w-0">
              <p className="text-white text-[12px] font-medium truncate leading-none">{user?.full_name ?? '—'}</p>
              <p className="text-[#758dd5] text-[11px] truncate mt-0.5">{roleLabel}</p>
            </div>
            <button
              onClick={handleLogout}
              className="text-white/40 hover:text-white transition-colors p-1 rounded"
              title="Sign out"
              aria-label="Sign out"
            >
              <LogoutIcon />
            </button>
          </div>
        </div>
      </aside>

      {/* Right panel */}
      <div className="flex-1 flex flex-col overflow-hidden min-w-0">
        {/* Top bar */}
        <header className="h-16 shrink-0 bg-white border-b border-[#c5c6d2] flex items-center justify-between px-4 md:px-8">
          <div className="flex items-center gap-3">
            {/* Sidebar toggle — visible on all screen sizes */}
            <button
              type="button"
              onClick={toggleSidebar}
              className="text-[#444650] hover:text-[#00113a] transition-colors p-1.5 rounded hover:bg-gray-100"
              aria-label={sidebarOpen ? 'Collapse navigation' : 'Expand navigation'}
            >
              <HamburgerIcon />
            </button>
            <div className="text-[#0F172A] text-[14px] font-semibold">
              {roleLabel} Portal
            </div>
          </div>
          <div className="flex items-center gap-3 md:gap-4">
            <div className="relative">
              <button
                onClick={() => setShowNotifications((v) => !v)}
                className="text-[#444650] hover:text-[#00113a] transition-colors relative"
                aria-label="Notifications"
              >
                <BellIcon />
              </button>
              {showNotifications && (
                <div className="absolute right-0 top-full mt-2 w-72 bg-white border border-[#e2e4ed] rounded-xl shadow-lg z-50">
                  <div className="px-4 py-3 border-b border-[#e2e4ed] flex items-center justify-between">
                    <p className="text-[13px] font-semibold text-[#1a1b20]">Notifications</p>
                    <button onClick={() => setShowNotifications(false)} className="text-[#94a3b8] hover:text-[#1a1b20] text-[12px]">✕</button>
                  </div>
                  <div className="px-4 py-8 text-center">
                    <p className="text-[13px] text-[#94a3b8]">No new notifications</p>
                  </div>
                </div>
              )}
            </div>
            <div className="h-5 w-px bg-[#c5c6d2]" />
            <div className="flex items-center gap-2">
              <div className="w-7 h-7 rounded-full bg-[#002366] flex items-center justify-center shrink-0">
                <span className="text-white text-[11px] font-bold">{initials}</span>
              </div>
              <span className="hidden sm:block text-[#1a1b20] text-[13px] font-medium">{user?.full_name ?? '—'}</span>
            </div>
          </div>
        </header>

        {/* Content */}
        <main className="flex-1 overflow-y-auto p-4 md:p-8">
          <Outlet />
        </main>
      </div>
    </div>
  );
}
