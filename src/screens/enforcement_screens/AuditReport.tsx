import { useState } from 'react';

function triggerDownload(filename: string, content: string) {
  const blob = new Blob([content], { type: 'text/plain' });
  const url  = URL.createObjectURL(blob);
  const a    = document.createElement('a');
  a.href     = url;
  a.download = filename;
  a.click();
  URL.revokeObjectURL(url);
}

const PAST_REPORTS = [
  { ref: 'RPT-2024-0021', title: 'Weekly Checkpoint Summary', period: 'Jun 10–16, 2024', checkpoint: 'All checkpoints', generated: '2024-06-17', size: '248 KB', status: 'Ready' },
  { ref: 'RPT-2024-0020', title: 'Kano Gate A — Monthly',     period: 'May 2024',         checkpoint: 'Kano–Lagos Gate A',  generated: '2024-06-01', size: '142 KB', status: 'Ready' },
  { ref: 'RPT-2024-0019', title: 'Violation Report Q2',       period: 'Apr–Jun 2024',      checkpoint: 'All checkpoints', generated: '2024-06-01', size: '391 KB', status: 'Ready' },
  { ref: 'RPT-2024-0018', title: 'Weekly Checkpoint Summary', period: 'Jun 3–9, 2024',    checkpoint: 'All checkpoints', generated: '2024-06-10', size: '231 KB', status: 'Ready' },
  { ref: 'RPT-2024-0017', title: 'Sokoto Border — Spot Check', period: '2024-05-28',       checkpoint: 'Sokoto Border Post', generated: '2024-05-28', size: '88 KB',  status: 'Archived' },
];

const CHECKPOINTS = ['All checkpoints', 'Kano–Lagos Gate A', 'Sokoto Border Post', 'Borno Entry Point', 'Onitsha Bridge Toll', 'Lagos Port Gate 3', 'Abuja Truck Terminal'];

export default function AuditReport() {
  const [generating, setGenerating] = useState(false);
  const [generated, setGenerated] = useState(false);
  const [form, setForm] = useState({ title: '', period: 'custom', dateFrom: '', dateTo: '', checkpoint: 'All checkpoints', includeViolations: true, includeSummary: true });

  function handleGenerate(e: React.FormEvent) {
    e.preventDefault();
    setGenerating(true);
    setTimeout(() => { setGenerating(false); setGenerated(true); }, 1500);
  }

  return (
    <div className="max-w-[1100px] mx-auto space-y-6">

      <div>
        <h1 className="text-[22px] font-bold text-[#1a1b20]">Audit Report</h1>
        <p className="text-[13px] text-[#64748b] mt-0.5">Generate enforcement operation reports and download past reports</p>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-5 gap-6">

        {/* Generate form */}
        <div className="lg:col-span-2 bg-white rounded-xl border border-[#e2e4ed] p-6">
          <p className="text-[14px] font-semibold text-[#1a1b20] mb-5">Generate New Report</p>
          {generated ? (
            <div className="text-center py-10 space-y-3">
              <div className="w-12 h-12 rounded-full bg-[#e6f4ef] flex items-center justify-center mx-auto">
                <span className="text-[20px]">✓</span>
              </div>
              <p className="text-[13px] font-semibold text-[#096c4b]">Report generated</p>
              <p className="text-[11px] text-[#64748b]">RPT-2024-0022 is ready for download.</p>
              <div className="flex gap-2 justify-center">
                <button
                  onClick={() => triggerDownload('RPT-2024-0022.txt', `TeMS Audit Report\nRef: RPT-2024-0022\nTitle: ${form.title}\nCheckpoint: ${form.checkpoint}\nPeriod: ${form.dateFrom} to ${form.dateTo}\nGenerated: ${new Date().toLocaleDateString('en-GB')}\n`)}
                  className="bg-[#002366] text-white text-[12px] font-semibold px-4 py-1.5 rounded-lg hover:bg-[#001a4d]"
                >
                  Download PDF
                </button>
                <button onClick={() => setGenerated(false)} className="text-[12px] text-[#64748b] hover:text-[#1a1b20]">
                  Generate another
                </button>
              </div>
            </div>
          ) : (
            <form onSubmit={handleGenerate} className="space-y-4">
              <div>
                <label className="block text-[12px] font-medium text-[#1a1b20] mb-1">Report Title *</label>
                <input
                  required
                  value={form.title}
                  onChange={(e) => setForm({ ...form, title: e.target.value })}
                  placeholder="e.g. Weekly Checkpoint Summary"
                  className="w-full border border-[#c5c6d2] rounded-lg px-3 py-2 text-[13px] focus:outline-none focus:ring-2 focus:ring-[#435b9f]"
                />
              </div>
              <div>
                <label className="block text-[12px] font-medium text-[#1a1b20] mb-1">Checkpoint</label>
                <select value={form.checkpoint} onChange={(e) => setForm({ ...form, checkpoint: e.target.value })} className="w-full border border-[#c5c6d2] rounded-lg px-3 py-2 text-[13px] bg-white focus:outline-none focus:ring-2 focus:ring-[#435b9f]">
                  {CHECKPOINTS.map((c) => <option key={c}>{c}</option>)}
                </select>
              </div>
              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-[12px] font-medium text-[#1a1b20] mb-1">Date From *</label>
                  <input required type="date" value={form.dateFrom} onChange={(e) => setForm({ ...form, dateFrom: e.target.value })} className="w-full border border-[#c5c6d2] rounded-lg px-3 py-2 text-[13px] focus:outline-none focus:ring-2 focus:ring-[#435b9f]" />
                </div>
                <div>
                  <label className="block text-[12px] font-medium text-[#1a1b20] mb-1">Date To *</label>
                  <input required type="date" value={form.dateTo} onChange={(e) => setForm({ ...form, dateTo: e.target.value })} className="w-full border border-[#c5c6d2] rounded-lg px-3 py-2 text-[13px] focus:outline-none focus:ring-2 focus:ring-[#435b9f]" />
                </div>
              </div>
              <div className="space-y-2">
                <p className="text-[12px] font-medium text-[#1a1b20]">Include sections:</p>
                {[
                  { key: 'includeSummary',    label: 'Executive summary'       },
                  { key: 'includeViolations', label: 'Violations detail'       },
                ].map((opt) => (
                  <label key={opt.key} className="flex items-center gap-2 cursor-pointer">
                    <input
                      type="checkbox"
                      checked={(form as Record<string,unknown>)[opt.key] as boolean}
                      onChange={(e) => setForm({ ...form, [opt.key]: e.target.checked })}
                      className="w-3.5 h-3.5 accent-[#002366]"
                    />
                    <span className="text-[12px] text-[#1a1b20]">{opt.label}</span>
                  </label>
                ))}
              </div>
              <button
                type="submit"
                disabled={generating}
                className="w-full bg-[#002366] text-white text-[13px] font-semibold py-2.5 rounded-lg hover:bg-[#001a4d] transition-colors disabled:opacity-60"
              >
                {generating ? 'Generating...' : 'Generate Report'}
              </button>
            </form>
          )}
        </div>

        {/* Past reports */}
        <div className="lg:col-span-3 bg-white rounded-xl border border-[#e2e4ed] overflow-hidden self-start">
          <div className="px-6 py-4 border-b border-[#e2e4ed]">
            <p className="text-[14px] font-semibold text-[#1a1b20]">Past Reports</p>
          </div>
          <div className="divide-y divide-[#f1f3f9]">
            {PAST_REPORTS.map((r) => (
              <div key={r.ref} className="px-6 py-4 flex items-start gap-4 hover:bg-[#fafbfd]">
                <div className="w-10 h-10 rounded-lg bg-[#e8edf7] flex items-center justify-center shrink-0">
                  <span className="text-[18px]">📄</span>
                </div>
                <div className="flex-1 min-w-0">
                  <p className="text-[13px] font-semibold text-[#1a1b20]">{r.title}</p>
                  <p className="text-[11px] text-[#64748b] mt-0.5">{r.checkpoint} · {r.period}</p>
                  <p className="text-[10px] text-[#94a3b8] font-mono mt-0.5">{r.ref} · Generated {r.generated} · {r.size}</p>
                </div>
                <div className="flex flex-col items-end gap-2 shrink-0">
                  <span className={`text-[10px] font-semibold px-2 py-0.5 rounded-full ${r.status === 'Ready' ? 'bg-[#e6f4ef] text-[#096c4b]' : 'bg-[#f1f3f9] text-[#64748b]'}`}>
                    {r.status}
                  </span>
                  {r.status === 'Ready' && (
                    <button
                      onClick={() => triggerDownload(`${r.ref}.txt`, `TeMS Audit Report\nRef: ${r.ref}\nTitle: ${r.title}\nCheckpoint: ${r.checkpoint}\nPeriod: ${r.period}\nGenerated: ${r.generated}\nSize: ${r.size}\n`)}
                      className="text-[12px] text-[#002366] font-medium hover:underline"
                    >
                      Download
                    </button>
                  )}
                </div>
              </div>
            ))}
          </div>
        </div>

      </div>
    </div>
  );
}
