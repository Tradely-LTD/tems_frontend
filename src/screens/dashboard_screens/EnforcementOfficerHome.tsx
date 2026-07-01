import { useNavigate } from 'react-router-dom';
import { useAppSelector } from '@/hooks/useAppSelector';
import { ROUTES } from '@/constants/routes';
import { useListScansQuery } from '@/screens/enforcement_screens/services/enforcementSlice';
import { useListIncidentsQuery } from '@/screens/enforcement_screens/services/incidentSlice';

const KPI_CARDS = [
  { label: 'Active Checkpoints',   value: '12',  delta: '3 states covered',     color: '#002366', bg: '#e8edf7' },
  { label: 'Incidents Today',      value:  '7',  delta: '2 high priority',       color: '#dc2626', bg: '#fee2e2' },
  { label: 'Vehicles Cleared',     value: '248', delta: 'Since 06:00 today',     color: '#096c4b', bg: '#e6f4ef' },
  { label: 'Violations Flagged',   value:  '14', delta: '↑ 3 from yesterday',    color: '#D4AF37', bg: '#fdf8e3' },
];

const CHECKPOINTS = [
  { name: 'Kano–Lagos Gate A',      location: 'Kaduna South', status: 'Active',   scans: 48, officer: 'Sgt. Musa'      },
  { name: 'Sokoto Border Post',     location: 'Sokoto',       status: 'Active',   scans: 31, officer: 'Insp. Danladi'  },
  { name: 'Borno Entry Point',      location: 'Maiduguri',    status: 'Active',   scans: 24, officer: 'Sgt. Ibrahim'   },
  { name: 'Onitsha Bridge Toll',    location: 'Anambra',      status: 'Active',   scans: 19, officer: 'Cpl. Okafor'   },
  { name: 'Lagos Port Gate 3',      location: 'Lagos Island', status: 'Offline',  scans:  0, officer: 'Sgt. Adeyemi'  },
  { name: 'Abuja Truck Terminal',   location: 'FCT',          status: 'Active',   scans: 38, officer: 'Insp. Ahmed'   },
];

const UNIT_PERFORMANCE = [
  { unit: 'Kano Field Unit',    scans: 128, violations: 6, clearance: 95 },
  { unit: 'Sokoto Field Unit',  scans:  89, violations: 3, clearance: 97 },
  { unit: 'Lagos Mobile Unit',  scans: 203, violations: 4, clearance: 98 },
  { unit: 'Borno Border Unit',  scans:  62, violations: 2, clearance: 97 },
];

const LIVE_SCAN_STREAM = [
  { time: '09:17', type: 'Cleared',  plate: 'KAN-234-AA', checkpoint: 'Kano–Lagos Gate A',  waybill: 'WB-20240622-8294' },
  { time: '09:16', type: 'Violation', plate: 'ABJ-771-BD', checkpoint: 'Abuja Truck Terminal', waybill: 'No waybill'       },
  { time: '09:15', type: 'Cleared',  plate: 'SOK-102-ZA', checkpoint: 'Sokoto Border Post',  waybill: 'WB-20240622-8293' },
  { time: '09:14', type: 'Cleared',  plate: 'LAG-889-CC', checkpoint: 'Lagos Port Gate 3',   waybill: 'WB-20240622-8291' },
  { time: '09:13', type: 'Flagged',  plate: 'RIV-445-DE', checkpoint: 'Onitsha Bridge Toll', waybill: 'Expired waybill'  },
  { time: '09:12', type: 'Cleared',  plate: 'BOR-312-FA', checkpoint: 'Borno Entry Point',   waybill: 'WB-20240622-8290' },
  { time: '09:11', type: 'Cleared',  plate: 'KAN-120-AB', checkpoint: 'Kano–Lagos Gate A',   waybill: 'WB-20240622-8289' },
  { time: '09:10', type: 'Violation', plate: 'KDS-558-CD', checkpoint: 'Kaduna South Check',  waybill: 'No waybill'       },
];

const SCAN_TYPE: Record<string, { color: string; bg: string; dot: string }> = {
  Cleared:   { color: '#096c4b', bg: '#e6f4ef', dot: '#096c4b' },
  Violation: { color: '#b91c1c', bg: '#fee2e2', dot: '#dc2626' },
  Flagged:   { color: '#856e0e', bg: '#fdf8e3', dot: '#D4AF37' },
};

export default function EnforcementOfficerHome() {
  const navigate  = useNavigate();
  const user      = useAppSelector((s) => s.auth.user);
  const firstName = user?.full_name?.split(' ')[0] ?? 'there';

  const { data: scansData }     = useListScansQuery({ page: 1, limit: 50 });
  const { data: incidentsData } = useListIncidentsQuery({ page: 1, limit: 50 });

  const scans           = scansData?.data ?? [];
  const incidents       = incidentsData?.data ?? [];
  const vehiclesCleared = scans.filter((s) => s.scan_result === 'valid').length;
  const violationsFlagged = scans.filter((s) => s.incident_flagged).length;
  const incidentsToday  = incidents.filter((i) => {
    const d = new Date(i.created_at);
    const now = new Date();
    return d.toDateString() === now.toDateString();
  }).length;

  const kpiCards = [
    { label: 'Active Checkpoints',  value: '12',                         delta: '3 states covered',      color: '#002366', bg: '#e8edf7' },
    { label: 'Incidents Today',     value: String(incidentsToday),        delta: incidents.filter(i => i.state === 'open').length + ' open',   color: '#dc2626', bg: '#fee2e2' },
    { label: 'Vehicles Cleared',    value: String(vehiclesCleared),       delta: 'Valid scans today',     color: '#096c4b', bg: '#e6f4ef' },
    { label: 'Violations Flagged',  value: String(violationsFlagged),     delta: 'Incidents flagged',     color: '#D4AF37', bg: '#fdf8e3' },
  ];

  const liveScanStream = scans.slice(0, 8);

  return (
    <div className="max-w-[1280px] mx-auto space-y-6">

      {/* Header */}
      <div className="flex items-start justify-between">
        <div>
          <h1 className="text-[26px] font-bold text-[#1a1b20] leading-tight">Enforcement Command Dashboard</h1>
          <p className="text-[13px] text-[#64748b] mt-0.5">Welcome, {firstName} — field operations and real-time monitoring</p>
        </div>
        <div className="flex gap-2">
          <button
            onClick={() => navigate(ROUTES.INCIDENT_REPORTING)}
            className="flex items-center gap-1.5 bg-[#dc2626] text-white text-[13px] font-semibold px-4 py-2 rounded-lg hover:bg-[#b91c1c] transition-colors"
          >
            Report Incident
          </button>
          <button
            onClick={() => navigate(ROUTES.AUDIT_REPORT)}
            className="flex items-center gap-1.5 bg-white border border-[#c5c6d2] text-[#1a1b20] text-[13px] font-semibold px-4 py-2 rounded-lg hover:bg-[#f8f8fb] transition-colors"
          >
            Audit Report
          </button>
        </div>
      </div>

      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        {kpiCards.map((card) => (
          <div key={card.label} className="rounded-xl border border-[#e2e4ed] p-5" style={{ backgroundColor: card.bg }}>
            <p className="text-[11px] font-semibold uppercase tracking-wide text-[#64748b]">{card.label}</p>
            <p className="text-[30px] font-bold mt-1" style={{ color: card.color }}>{card.value}</p>
            <p className="text-[11px] text-[#64748b] mt-1">{card.delta}</p>
          </div>
        ))}
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-4">

        {/* Live checkpoints */}
        <div className="lg:col-span-2 bg-white rounded-xl border border-[#e2e4ed] p-6">
          <div className="flex items-center justify-between mb-4">
            <p className="text-[14px] font-semibold text-[#1a1b20]">Live Checkpoints</p>
            <span className="flex items-center gap-1 text-[10px] font-semibold text-[#096c4b]">
              <span className="w-1.5 h-1.5 rounded-full bg-[#096c4b] animate-pulse" /> LIVE
            </span>
          </div>
          <div className="space-y-2.5">
            {CHECKPOINTS.map((cp) => (
              <div key={cp.name} className="flex items-center gap-3 p-3 rounded-lg border border-[#f1f3f9] hover:border-[#c5c6d2] transition-colors">
                <div className={`w-2 h-2 rounded-full shrink-0 ${cp.status === 'Active' ? 'bg-[#096c4b]' : 'bg-[#94a3b8]'}`} />
                <div className="flex-1 min-w-0">
                  <p className="text-[12px] font-medium text-[#1a1b20] truncate">{cp.name}</p>
                  <p className="text-[10px] text-[#94a3b8]">{cp.location} · {cp.officer}</p>
                </div>
                <div className="text-right shrink-0">
                  <p className="text-[12px] font-bold text-[#1a1b20]">{cp.scans}</p>
                  <p className="text-[10px] text-[#94a3b8]">scans</p>
                </div>
                <span className={`text-[10px] font-semibold px-2 py-0.5 rounded-full shrink-0 ${
                  cp.status === 'Active' ? 'bg-[#e6f4ef] text-[#096c4b]' : 'bg-[#f1f3f9] text-[#94a3b8]'
                }`}>
                  {cp.status}
                </span>
              </div>
            ))}
          </div>
        </div>

        {/* Live scan stream */}
        <div className="bg-[#00113a] rounded-xl p-6 flex flex-col">
          <div className="flex items-center justify-between mb-4">
            <p className="text-[14px] font-semibold text-white">Live Scan Stream</p>
            <span className="flex items-center gap-1 text-[10px] font-semibold text-[#22c55e]">
              <span className="w-1.5 h-1.5 rounded-full bg-[#22c55e] animate-pulse" /> LIVE
            </span>
          </div>
          <div className="flex-1 space-y-2.5 overflow-y-auto max-h-[280px] pr-1">
            {liveScanStream.length === 0 ? (
              <p className="text-[12px] text-white/40">No scans yet.</p>
            ) : liveScanStream.map((s) => {
              const resultStyle = s.scan_result === 'valid'
                ? SCAN_TYPE.Cleared
                : s.incident_flagged
                  ? SCAN_TYPE.Flagged
                  : SCAN_TYPE.Violation;
              const label = s.scan_result === 'valid' ? 'Cleared' : s.incident_flagged ? 'Flagged' : 'Invalid';
              const time  = new Date(s.scanned_at).toLocaleTimeString('en-GB', { hour: '2-digit', minute: '2-digit' });
              return (
                <div key={s.id} className="flex items-start gap-2.5">
                  <span className="w-1.5 h-1.5 rounded-full mt-1.5 shrink-0" style={{ backgroundColor: resultStyle.dot }} />
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center gap-1.5">
                      <span className="text-[11px] font-bold font-mono text-white">{s.waybill_id}</span>
                      <span className="text-[10px] font-semibold px-1.5 py-0.5 rounded" style={{ backgroundColor: resultStyle.bg, color: resultStyle.color }}>
                        {label}
                      </span>
                    </div>
                    <p className="text-[10px] text-[#758dd5] truncate">{s.location_name ?? s.scan_method}</p>
                  </div>
                  <span className="text-[10px] text-white/40 font-mono shrink-0">{time}</span>
                </div>
              );
            })}
          </div>
        </div>

      </div>

      {/* Unit performance */}
      <div className="bg-white rounded-xl border border-[#e2e4ed] p-6">
        <p className="text-[14px] font-semibold text-[#1a1b20] mb-5">Enforcement Unit Performance</p>
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
          {UNIT_PERFORMANCE.map((u) => (
            <div key={u.unit} className="border border-[#e2e4ed] rounded-xl p-4">
              <p className="text-[12px] font-semibold text-[#1a1b20] mb-3">{u.unit}</p>
              <div className="space-y-2">
                <div className="flex items-center justify-between">
                  <span className="text-[11px] text-[#64748b]">Scans Today</span>
                  <span className="text-[13px] font-bold text-[#002366]">{u.scans}</span>
                </div>
                <div className="flex items-center justify-between">
                  <span className="text-[11px] text-[#64748b]">Violations</span>
                  <span className="text-[13px] font-bold text-[#dc2626]">{u.violations}</span>
                </div>
                <div>
                  <div className="flex items-center justify-between mb-1">
                    <span className="text-[11px] text-[#64748b]">Clearance Rate</span>
                    <span className="text-[12px] font-bold text-[#096c4b]">{u.clearance}%</span>
                  </div>
                  <div className="h-1.5 rounded-full bg-[#e2e8f0]">
                    <div className="h-full rounded-full bg-[#096c4b]" style={{ width: `${u.clearance}%` }} />
                  </div>
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>

    </div>
  );
}
