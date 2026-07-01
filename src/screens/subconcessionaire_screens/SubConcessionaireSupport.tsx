import { useState } from 'react';
import {
  useListTicketsQuery,
  useGetTicketQuery,
  useCreateTicketMutation,
  useAddMessageMutation,
} from '@/services/supportSlice';
import type { SupportTicket } from '@/services/supportSlice';

const STATUS_STYLE: Record<string, { bg: string; text: string }> = {
  open:        { bg: '#fee2e2', text: '#b91c1c' },
  in_progress: { bg: '#e0f2fe', text: '#0369a1' },
  resolved:    { bg: '#e6f4ef', text: '#096c4b' },
  closed:      { bg: '#f1f3f9', text: '#64748b' },
};

const FAQS = [
  { q: 'How do I issue an eWaybill?', a: 'Navigate to Trade Operations → eWaybill Issuance, fill in Cargo Info, Route Info, Commodity details, then proceed to Payment.' },
  { q: "What happens if an agent's KYC expires?", a: 'The agent is flagged in the Compliance dashboard and cannot issue new waybills until their KYC documents are renewed.' },
  { q: 'How are levy settlements processed?', a: 'Levies are pooled daily at midnight and automatically settled to the designated JRB account.' },
  { q: 'How do I onboard a new agent?', a: 'Go to Agent Management → Agent Onboarding and fill in the agent\'s personal and bank details.' },
];

const EMPTY_FORM = { subject: '', category: 'general', priority: 'normal', body: '' };

function TicketThread({ ticketId, onClose }: { ticketId: string; onClose: () => void }) {
  const [reply, setReply] = useState('');
  const { data, isLoading, refetch } = useGetTicketQuery(ticketId);
  const [addMessage, { isLoading: sending }] = useAddMessageMutation();

  const ticket   = data?.data;
  const messages = ticket?.messages ?? [];

  async function handleReply(e: React.FormEvent) {
    e.preventDefault();
    if (!reply.trim()) return;
    await addMessage({ ticketId, body: reply, is_internal: false });
    setReply('');
    refetch();
  }

  if (isLoading || !ticket) return <div className="py-10 text-center text-[#94a3b8] text-[12px]">Loading…</div>;
  const st = STATUS_STYLE[ticket.status] ?? STATUS_STYLE.open;

  return (
    <div className="bg-white rounded-xl border border-[#e2e4ed] overflow-hidden flex flex-col" style={{ maxHeight: '70vh' }}>
      <div className="flex items-start justify-between px-5 py-4 border-b border-[#e2e4ed]">
        <div>
          <div className="flex items-center gap-2 mb-1">
            <span className="text-[10px] font-semibold px-2 py-0.5 rounded-full" style={{ backgroundColor: st.bg, color: st.text }}>
              {ticket.status.replace('_', ' ')}
            </span>
            <span className="text-[10px] text-[#94a3b8]">{ticket.category}</span>
          </div>
          <p className="text-[14px] font-semibold text-[#1a1b20]">{ticket.subject}</p>
        </div>
        <button onClick={onClose} className="text-[#94a3b8] hover:text-[#1a1b20] text-[18px]">×</button>
      </div>

      <div className="flex-1 overflow-y-auto px-5 py-4 space-y-3">
        {messages.map((msg) => {
          const fromSupport = msg.sender_name?.toLowerCase().includes('admin') || false;
          return (
            <div key={msg.id} className={`flex ${fromSupport ? 'justify-end' : 'justify-start'}`}>
              <div className={`max-w-[80%] rounded-xl px-4 py-2.5 ${fromSupport ? 'bg-[#002366] text-white' : 'bg-[#f8f9fc] border border-[#e2e4ed] text-[#1a1b20]'}`}>
                <p className={`text-[10px] mb-1 ${fromSupport ? 'text-white/60' : 'text-[#94a3b8]'}`}>
                  {msg.sender_name ?? 'You'} · {new Date(msg.created_at).toLocaleTimeString('en-GB', { hour: '2-digit', minute: '2-digit' })}
                </p>
                <p className="text-[13px]">{msg.body}</p>
              </div>
            </div>
          );
        })}
        {messages.length === 0 && (
          <p className="text-center text-[#94a3b8] text-[12px]">No messages yet. Add a reply below.</p>
        )}
      </div>

      {ticket.status !== 'closed' && (
        <div className="border-t border-[#e2e4ed] px-5 py-3">
          <form onSubmit={handleReply} className="flex gap-2">
            <input
              value={reply}
              onChange={(e) => setReply(e.target.value)}
              placeholder="Add a reply or more details…"
              className="flex-1 border border-[#c5c6d2] rounded-lg px-3 py-2 text-[13px] focus:outline-none focus:ring-2 focus:ring-[#435b9f]"
            />
            <button type="submit" disabled={sending || !reply.trim()}
              className="bg-[#002366] text-white text-[12px] font-semibold px-4 py-2 rounded-lg disabled:opacity-50">
              {sending ? '…' : 'Send'}
            </button>
          </form>
        </div>
      )}
    </div>
  );
}

export default function SubConcessionaireSupport() {
  const [openFaq, setOpenFaq]       = useState<number | null>(null);
  const [showForm, setShowForm]     = useState(false);
  const [form, setForm]             = useState(EMPTY_FORM);
  const [selectedId, setSelectedId] = useState<string | null>(null);

  const { data, isLoading } = useListTicketsQuery({ page: 1, limit: 50 });
  const [createTicket, { isLoading: creating, isSuccess: created }] = useCreateTicketMutation();

  const tickets: SupportTicket[] = (data?.data ?? []) as SupportTicket[];

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    await createTicket(form);
    setForm(EMPTY_FORM);
    setShowForm(false);
  }

  return (
    <div className="max-w-[1100px] mx-auto space-y-6">

      <div className="flex items-start justify-between">
        <div>
          <h1 className="text-[22px] font-bold text-[#1a1b20]">Support Centre</h1>
          <p className="text-[13px] text-[#64748b] mt-0.5">Submit tickets, track responses, and browse common questions</p>
        </div>
        <button
          onClick={() => { setShowForm(!showForm); setSelectedId(null); }}
          className="bg-[#002366] text-white text-[13px] font-semibold px-4 py-2 rounded-lg hover:bg-[#001a4d]"
        >
          + New Ticket
        </button>
      </div>

      {/* Contact strip */}
      <div className="grid grid-cols-3 gap-4">
        {[
          { icon: '📞', label: 'Phone Support', value: '+234 800 TEMS 001', note: 'Mon–Fri, 8 AM – 6 PM' },
          { icon: '✉️', label: 'Email',          value: 'support@tems.gov.ng', note: 'Response within 24h' },
          { icon: '💬', label: 'Live Chat',      value: 'Submit a ticket below', note: 'We reply in-platform' },
        ].map((c) => (
          <div key={c.label} className="bg-white rounded-xl border border-[#e2e4ed] p-4 flex items-start gap-3">
            <span className="text-[20px] shrink-0">{c.icon}</span>
            <div>
              <p className="text-[11px] font-semibold uppercase tracking-wide text-[#64748b]">{c.label}</p>
              <p className="text-[12px] font-semibold text-[#1a1b20] mt-0.5">{c.value}</p>
              <p className="text-[10px] text-[#94a3b8] mt-0.5">{c.note}</p>
            </div>
          </div>
        ))}
      </div>

      {/* New ticket form */}
      {showForm && (
        <div className="bg-white rounded-xl border border-[#e2e4ed] p-6">
          <p className="text-[15px] font-semibold text-[#1a1b20] mb-4">New Support Ticket</p>
          <form onSubmit={handleSubmit} className="space-y-4">
            <div className="grid grid-cols-2 gap-4">
              <div className="col-span-2">
                <label className="block text-[12px] font-medium text-[#1a1b20] mb-1">Subject *</label>
                <input required value={form.subject} onChange={(e) => setForm({ ...form, subject: e.target.value })}
                  placeholder="Brief description of the issue"
                  className="w-full border border-[#c5c6d2] rounded-lg px-3 py-2 text-[13px] focus:outline-none focus:ring-2 focus:ring-[#435b9f]" />
              </div>
              <div>
                <label className="block text-[12px] font-medium text-[#1a1b20] mb-1">Category *</label>
                <select required value={form.category} onChange={(e) => setForm({ ...form, category: e.target.value })}
                  className="w-full border border-[#c5c6d2] rounded-lg px-3 py-2 text-[13px] bg-white focus:outline-none focus:ring-2 focus:ring-[#435b9f]">
                  <option value="general">General</option>
                  <option value="waybill">Waybill issue</option>
                  <option value="agent">Agent onboarding</option>
                  <option value="compliance">KYC / compliance</option>
                  <option value="settlement">Settlement / payment</option>
                  <option value="technical">Technical problem</option>
                </select>
              </div>
              <div>
                <label className="block text-[12px] font-medium text-[#1a1b20] mb-1">Priority</label>
                <select value={form.priority} onChange={(e) => setForm({ ...form, priority: e.target.value })}
                  className="w-full border border-[#c5c6d2] rounded-lg px-3 py-2 text-[13px] bg-white focus:outline-none focus:ring-2 focus:ring-[#435b9f]">
                  <option value="low">Low</option>
                  <option value="normal">Normal</option>
                  <option value="high">High</option>
                  <option value="urgent">Urgent</option>
                </select>
              </div>
              <div className="col-span-2">
                <label className="block text-[12px] font-medium text-[#1a1b20] mb-1">Description *</label>
                <textarea required rows={4} value={form.body} onChange={(e) => setForm({ ...form, body: e.target.value })}
                  placeholder="Describe the issue in detail, include any reference numbers…"
                  className="w-full border border-[#c5c6d2] rounded-lg px-3 py-2 text-[13px] resize-none focus:outline-none focus:ring-2 focus:ring-[#435b9f]" />
              </div>
            </div>
            <div className="flex justify-end gap-3">
              <button type="button" onClick={() => setShowForm(false)} className="text-[13px] font-medium text-[#64748b] px-4 py-2">Cancel</button>
              <button type="submit" disabled={creating}
                className="bg-[#002366] text-white text-[13px] font-semibold px-5 py-2 rounded-lg hover:bg-[#001a4d] disabled:opacity-50">
                {creating ? 'Submitting…' : 'Submit Ticket'}
              </button>
            </div>
          </form>
        </div>
      )}

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">

        {/* My tickets */}
        <div className="bg-white rounded-xl border border-[#e2e4ed] overflow-hidden">
          <div className="px-5 py-4 border-b border-[#e2e4ed]">
            <p className="text-[14px] font-semibold text-[#1a1b20]">My Tickets</p>
          </div>
          {isLoading ? (
            <div className="py-10 text-center text-[#94a3b8] text-[12px]">Loading…</div>
          ) : tickets.length === 0 ? (
            <div className="py-10 text-center text-[#94a3b8] text-[12px]">No tickets yet. Submit one above.</div>
          ) : (
            <div className="divide-y divide-[#f1f3f9]">
              {tickets.map((t) => {
                const s = STATUS_STYLE[t.status] ?? STATUS_STYLE.open;
                return (
                  <button key={t.id} onClick={() => setSelectedId(selectedId === t.id ? null : t.id)}
                    className={`w-full text-left px-5 py-3.5 hover:bg-[#fafbfd] transition-colors ${selectedId === t.id ? 'bg-[#f0f4ff]' : ''}`}>
                    <div className="flex items-start justify-between gap-2">
                      <p className="text-[12px] font-semibold text-[#1a1b20] truncate flex-1">{t.subject}</p>
                      <span className="text-[9px] font-bold px-1.5 py-0.5 rounded-full shrink-0" style={{ backgroundColor: s.bg, color: s.text }}>
                        {t.status.replace('_', ' ')}
                      </span>
                    </div>
                    <p className="text-[11px] text-[#94a3b8] mt-0.5">{t.category} · {new Date(t.updated_at).toLocaleDateString('en-GB')}</p>
                  </button>
                );
              })}
            </div>
          )}
        </div>

        {/* FAQ */}
        <div className="bg-white rounded-xl border border-[#e2e4ed] p-6">
          <p className="text-[14px] font-semibold text-[#1a1b20] mb-4">Common Questions</p>
          <div className="space-y-2">
            {FAQS.map((faq, i) => (
              <div key={i} className="border border-[#e2e4ed] rounded-lg overflow-hidden">
                <button className="w-full text-left px-4 py-3 flex items-center justify-between gap-3 hover:bg-[#f8f9fc]"
                  onClick={() => setOpenFaq(openFaq === i ? null : i)}>
                  <span className="text-[13px] font-medium text-[#1a1b20]">{faq.q}</span>
                  <span className="text-[#94a3b8] text-[16px] shrink-0">{openFaq === i ? '−' : '+'}</span>
                </button>
                {openFaq === i && (
                  <div className="px-4 pb-4 text-[13px] text-[#64748b] border-t border-[#f1f3f9] pt-3">{faq.a}</div>
                )}
              </div>
            ))}
          </div>
        </div>

      </div>

      {/* Thread view */}
      {selectedId && (
        <TicketThread ticketId={selectedId} onClose={() => setSelectedId(null)} />
      )}

    </div>
  );
}
