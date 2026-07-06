import { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { useProfileSettings } from './hooks/useProfileSettings';
import type { UpdateSettingsRequest, UserSettingsData } from './services/types';
import { ROUTES } from '@/constants/routes';

const AGENT_ROLES = new Set(['Agent', 'EnforcementOfficer']);
const ADMIN_ROLES = new Set(['SuperAdmin', 'NationalAdmin', 'StateAdmin', 'LGAAdmin', 'MarketAdmin']);

function BackIcon() {
  return (
    <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2} aria-hidden="true">
      <path strokeLinecap="round" strokeLinejoin="round" d="M15.75 19.5L8.25 12l7.5-7.5" />
    </svg>
  );
}

function SpinnerIcon() {
  return (
    <div className="flex items-center justify-center py-16">
      <div className="animate-spin w-8 h-8 rounded-full border-4 border-[#002366] border-t-transparent" aria-label="Loading" />
    </div>
  );
}

function ToggleField({
  label,
  description,
  checked,
  onChange,
}: {
  label: string;
  description?: string;
  checked: boolean;
  onChange: (checked: boolean) => void;
}) {
  return (
    <div className="flex items-start justify-between gap-4 py-4">
      <div className="flex-1 min-w-0">
        <p className="text-[13px] font-medium text-[#1a1b20]">{label}</p>
        {description && <p className="text-[12px] text-[#94a3b8] mt-0.5">{description}</p>}
      </div>
      <button
        type="button"
        role="switch"
        aria-checked={checked}
        aria-label={label}
        onClick={() => onChange(!checked)}
        className={[
          'relative inline-flex items-center w-10 h-5.5 rounded-full transition-colors shrink-0 mt-0.5',
          checked ? 'bg-[#002366]' : 'bg-[#c5c6d2]',
        ].join(' ')}
        style={{ minWidth: '40px', height: '22px' }}
      >
        <span
          className={[
            'inline-block w-4 h-4 rounded-full bg-white shadow transition-transform',
            checked ? 'translate-x-5' : 'translate-x-1',
          ].join(' ')}
        />
      </button>
    </div>
  );
}

function SelectField({
  label,
  description,
  value,
  options,
  onChange,
}: {
  label: string;
  description?: string;
  value: string;
  options: { value: string; label: string }[];
  onChange: (value: string) => void;
}) {
  return (
    <div className="py-4">
      <div className="flex items-start justify-between gap-4">
        <div className="flex-1 min-w-0">
          <p className="text-[13px] font-medium text-[#1a1b20]">{label}</p>
          {description && <p className="text-[12px] text-[#94a3b8] mt-0.5">{description}</p>}
        </div>
        <select
          aria-label={label}
          value={value}
          onChange={(e) => onChange(e.target.value)}
          className="px-3 py-1.5 rounded-lg border border-[#c5c6d2] text-[13px] text-[#1a1b20] bg-white focus:outline-none focus:ring-2 focus:ring-[#002366]/20"
        >
          {options.map((opt) => (
            <option key={opt.value} value={opt.value}>
              {opt.label}
            </option>
          ))}
        </select>
      </div>
    </div>
  );
}

export default function ProfileSettingsScreen() {
  const { settings, isLoading, roleName, handleUpdate, isUpdating, error } = useProfileSettings();

  const settingsData = settings?.data;
  const isAgent = roleName !== undefined && AGENT_ROLES.has(roleName);
  const isAdmin = roleName !== undefined && ADMIN_ROLES.has(roleName);

  const [localSettings, setLocalSettings] = useState<Partial<UserSettingsData>>({});
  const [saveSuccess, setSaveSuccess] = useState(false);

  // Sync local state when remote data loads
  useEffect(() => {
    if (settingsData) {
      setLocalSettings({
        notifications_enabled: settingsData.notifications_enabled,
        email_notifications: settingsData.email_notifications,
        theme: settingsData.theme,
        ...(isAgent && {
          scan_sound_enabled: settingsData.scan_sound_enabled ?? false,
          offline_mode_hint: settingsData.offline_mode_hint ?? false,
        }),
        ...(isAdmin && {
          digest_frequency: settingsData.digest_frequency ?? 'none',
        }),
      });
    }
  }, [settingsData, isAgent, isAdmin]);

  if (isLoading) return <SpinnerIcon />;

  if (!settingsData) {
    return (
      <div className="max-w-2xl mx-auto">
        <div className="bg-[rgba(186,26,26,0.08)] border border-[rgba(186,26,26,0.2)] rounded-xl px-4 py-3 text-[#ba1a1a] text-[13px]">
          Failed to load settings. Please refresh the page.
        </div>
      </div>
    );
  }

  function patch<K extends keyof UserSettingsData>(key: K, value: UserSettingsData[K]) {
    setLocalSettings((prev) => ({ ...prev, [key]: value }));
    setSaveSuccess(false);
  }

  async function handleSave() {
    // Build payload containing only role-relevant fields
    const payload: UpdateSettingsRequest = {
      notifications_enabled: localSettings.notifications_enabled,
      email_notifications: localSettings.email_notifications,
      theme: localSettings.theme,
    };
    if (isAgent) {
      payload.scan_sound_enabled = localSettings.scan_sound_enabled;
      payload.offline_mode_hint = localSettings.offline_mode_hint;
    }
    if (isAdmin) {
      payload.digest_frequency = localSettings.digest_frequency;
    }
    setSaveSuccess(false);
    const ok = await handleUpdate(payload);
    if (ok) {
      setSaveSuccess(true);
    }
  }

  const themeValue = (localSettings.theme ?? settingsData.theme) as string;
  const notificationsEnabled = localSettings.notifications_enabled ?? settingsData.notifications_enabled;
  const emailNotifications = localSettings.email_notifications ?? settingsData.email_notifications;

  return (
    <div className="max-w-2xl mx-auto space-y-6">
      {/* Back link */}
      <Link
        to={ROUTES.PROFILE}
        className="inline-flex items-center gap-1.5 text-[13px] text-[#002366] font-medium hover:underline"
      >
        <BackIcon />
        Back to Profile
      </Link>

      <div>
        <h1 className="text-[22px] font-bold text-[#0F172A]">Preferences &amp; Settings</h1>
        <p className="text-[13px] text-[#64748b] mt-0.5">Manage notifications, theme, and other preferences.</p>
      </div>

      {/* General settings */}
      <div className="bg-white rounded-2xl border border-[#e2e4ed] shadow-sm overflow-hidden">
        <div className="px-6 py-4 border-b border-[#e2e4ed]">
          <h2 className="text-[14px] font-semibold text-[#0F172A]">General</h2>
        </div>
        <div className="px-6 divide-y divide-[#e2e4ed]">
          <ToggleField
            label="Push notifications"
            description="Receive in-app notifications for important updates"
            checked={notificationsEnabled}
            onChange={(v) => patch('notifications_enabled', v)}
          />
          <ToggleField
            label="Email notifications"
            description="Receive notifications via email"
            checked={emailNotifications}
            onChange={(v) => patch('email_notifications', v)}
          />
          <SelectField
            label="Theme"
            description="Choose how the application looks"
            value={themeValue}
            options={[
              { value: 'light', label: 'Light' },
              { value: 'dark', label: 'Dark' },
              { value: 'system', label: 'System default' },
            ]}
            onChange={(v) => patch('theme', v as UserSettingsData['theme'])}
          />
        </div>
      </div>

      {/* Agent / Enforcement-specific settings */}
      {isAgent && (
        <div className="bg-white rounded-2xl border border-[#e2e4ed] shadow-sm overflow-hidden">
          <div className="px-6 py-4 border-b border-[#e2e4ed]">
            <h2 className="text-[14px] font-semibold text-[#0F172A]">Field Operations</h2>
          </div>
          <div className="px-6 divide-y divide-[#e2e4ed]">
            <ToggleField
              label="Scan sound"
              description="Play a sound when scanning a waybill QR code"
              checked={localSettings.scan_sound_enabled ?? settingsData.scan_sound_enabled ?? false}
              onChange={(v) => patch('scan_sound_enabled', v)}
            />
            <ToggleField
              label="Offline mode hint"
              description="Show a banner when operating in offline mode"
              checked={localSettings.offline_mode_hint ?? settingsData.offline_mode_hint ?? false}
              onChange={(v) => patch('offline_mode_hint', v)}
            />
          </div>
        </div>
      )}

      {/* Admin digest settings */}
      {isAdmin && (
        <div className="bg-white rounded-2xl border border-[#e2e4ed] shadow-sm overflow-hidden">
          <div className="px-6 py-4 border-b border-[#e2e4ed]">
            <h2 className="text-[14px] font-semibold text-[#0F172A]">Reports &amp; Digests</h2>
          </div>
          <div className="px-6">
            <SelectField
              label="Digest frequency"
              description="How often to receive activity summary reports"
              value={localSettings.digest_frequency ?? settingsData.digest_frequency ?? 'none'}
              options={[
                { value: 'daily', label: 'Daily' },
                { value: 'weekly', label: 'Weekly' },
                { value: 'none', label: 'None' },
              ]}
              onChange={(v) => patch('digest_frequency', v as UserSettingsData['digest_frequency'])}
            />
          </div>
        </div>
      )}

      {/* Save section */}
      <div className="flex items-center gap-4">
        <button
          type="button"
          onClick={handleSave}
          disabled={isUpdating}
          className="px-6 py-2.5 rounded-lg bg-[#002366] text-white text-[14px] font-semibold hover:bg-[#00113a] transition-colors disabled:opacity-60 disabled:cursor-not-allowed"
        >
          {isUpdating ? 'Saving…' : 'Save preferences'}
        </button>
        {saveSuccess && (
          <p className="text-[13px] text-[#065f46] font-medium">Settings saved.</p>
        )}
        {error && (
          <p className="text-[13px] text-[#ba1a1a]">{error}</p>
        )}
      </div>
    </div>
  );
}
