/**
 * @module superadmin_screens
 * @depends services/supportSlice
 */
import { useState } from 'react';
import {
  useListTicketsQuery,
  useGetTicketQuery,
  useAddMessageMutation,
  useUpdateTicketStatusMutation,
} from '@/services/supportSlice';
import type { SupportTicket } from '@/services/supportSlice';

const STATUS_STYLE: Record<string, { color: string; bg: string }> = {
  open:        { color: '#b91c1c', bg: '#fee2e2' },
  in_progress: { color: '#0369a1', bg: '#e0f2fe' },
  resolved:    { color: '#096c4b', bg: '#e6f4ef' },
  closed:      { color: '#64748b', bg: '#f1f3f9' },
};

const PRIORITY_STYLE: Record<string, { color: string }> = {
  low:    { color: '#94a3b8' },
  normal: { color: '#64748b' },
  high:   { color: '#0369a1' },
  urgent: { color: '#b91c1c' },
};

function TicketThread({ ticketId, onClose }: { ticketId: string; onClose: () => void }) {
  const [reply, setReply]               = useState('');
  const [isInternal, setIsInternal]     = useState(false);
  const { data, isLoading, refetch }    = useGetTicketQuery(ticketId);
  const [addMessage, { isLoading: sending }]         = useAddMessageMutation();
  const [updateStatus, { isLoading: updating }]      = useUpdateTicketStatusMutation();

  const ticket   = data?.data;
  const messages = ticket?.messages ?? [];

  async function handleReply(e: React.FormEvent) {
    e.preventDefault();
    if (!reply.trim()) return;
    await addMessage({ ticketId, body: reply, is_internal: isInternal });
    setReply('');
    refetch();
  }

  async function setStatus(status: string) {
    await updateStatus({ ticketId, status });
    refetch();
  }

  if (isLoading || !ticket) return <div className="py-10 text-center text-[#94a3b8] text-[13px]">Loading thread…</div>;

  const st = STATUS_STYLE[ticket.status] ?? STATUS_STYLE.open;

  return (
    <div className="flex flex-col h-full">
      {/* Thread header */}
      <div className="flex items-start justify-between px-6 py-4 border-b border-[#e2e4ed]">
        <div className="flex-1 min-w-0">
          <div className="flex items-center gap-2 mb-1">
            <span className="text-[10px] font-semibold px-2 py-0.5 rounded-full" style={{ backgroundColor: st.bg, color: st.color }}>
              {ticket.status.replace('_', ' ')}
            </span>
            <span className="text-[10px] text-[#94a3b8]">{ticket.category} · {ticket.priority}</span>
          </div>
          <p className="text-[14px] font-semibold text-[#1a1b20] truncate">{ticket.subject}</p>
          <p className="text-[11px] text-[#94a3b8] mt-0.5">
            Opened {new Date(ticket.created_at).toLocaleString('en-GB', { dateStyle: 'short', timeStyle: 'short' })}
          </p>
        </div>
        <div className="flex items-center gap-2 shrink-0 ml-4">
          {ticket.status === 'open' && (
            <button onClick={() => setStatus('in_progress')} disabled={updating}
              className="text-[11px] font-semibold px-3 py-1.5 bg-[#e0f2fe] text-[#0369a1] rounded-lg hover:bg-[#bae6fd] disabled:opacity-50">
              Start
            </button>
          )}
          {(ticket.status === 'open' || ticket.status === 'in_progress') && (
            <button onClick={() => setStatus('resolved')} disabled={updating}
              className="text-[11px] font-semibold px-3 py-1.5 bg-[#e6f4ef] text-[#096c4b] rounded-lg hover:bg-[#d1fae5] disabled:opacity-50">
              Resolve
            </button>
          )}
          {ticket.status === 'resolved' && (
            <button onClick={() => setStatus('closed')} disabled={updating}
              className="text-[11px] font-semibold px-3 py-1.5 bg-[#f1f3f9] text-[#64748b] rounded-lg hover:bg-[#e2e8f0] disabled:opacity-50">
              Close
            </button>
          )}
          <button onClick={onClose} className="text-[#94a3b8] hover:text-[#1a1b20] text-[18px] ml-1">×</button>
        </div>
      </div>

      {/* Messages */}
      <div className="flex-1 overflow-y-auto px-6 py-4 space-y-4">
        {messages.map((msg) => {
          const isSuper = msg.is_internal;
          return (
            <div key={msg.id} className={`flex ${isSuper ? 'justify-end' : 'justify-start'}`}>
              <div className={`max-w-[75%] rounded-xl px-4 py-3 ${
                isSuper
                  ? 'bg-[#002366] text-white'
                  : 'bg-[#f8f9fc] border border-[#e2e4ed] text-[#1a1b20]'
              }`}>
                <p className={`text-[10px] font-semibold mb-1 ${isSuper ? 'text-white/60' : 'text-[#94a3b8]'}`}>
                  {msg.sender_name ?? 'User'} · {new Date(msg.created_at).toLocaleTimeString('en-GB', { hour: '2-digit', minute: '2-digit' })}
                  {msg.is_internal && <span className="ml-1 text-[#758dd5]">(internal)</span>}
                </p>
                <p className="text-[13px] leading-relaxed">{msg.body}</p>
              </div>
            </div>
          );
        })}
        {messages.length === 0 && (
          <p className="text-center text-[#94a3b8] text-[12px] py-4">No messages yet.</p>
        )}
      </div>

      {/* Reply box */}
      {ticket.status !== 'closed' && (
        <div className="border-t border-[#e2e4ed] px-6 py-4">
          <form onSubmit={handleReply} className="space-y-3">
            <textarea
              rows={3}
              value={reply}
              onChange={(e) => setReply(e.target.value)}
              placeholder="Type your reply…"
              className="w-full border border-[#c5c6d2] rounded-lg px-3 py-2 text-[13px] resize-none focus:outline-none focus:ring-2 focus:ring-[#435b9f]"
            />
            <div className="flex items-center justify-between">
              <label className="flex items-center gap-2 text-[12px] text-[#64748b] cursor-pointer">
                <input type="checkbox" checked={isInternal} onChange={(e) => setIsInternal(e.target.checked)} className="rounded" />
                Internal note (not visible to sub-conc)
              </label>
              <button
                type="submit"
                disabled={sending || !reply.trim()}
                className="bg-[#002366] text-white text-[12px] font-semibold px-5 py-2 rounded-lg hover:bg-[#001a4d] disabled:opacity-50"
              >
                {sending ? 'Sending…' : 'Send Reply'}
              </button>
            </div>
          </form>
        </div>
      )}
    </div>
  );
}

export default function SuperAdminSupportInbox() {
  const [statusFilter, setStatusFilter] = useState<string>('open');
  const [selectedId, setSelectedId]     = useState<string | null>(null);

  const { data, isLoading, isError } = useListTicketsQuery({ page: 1, limit: 100, status: statusFilter === 'all' ? undefined : statusFilter });

  const tickets: SupportTicket[] = (data?.data ?? []) as SupportTicket[];

  return (
    <div className="max-w-[1280px] mx-auto">
      <div className="mb-6">
        <h1 className="text-[22px] font-bold text-[#1a1b20]">Support Inbox</h1>
        <p className="text-[13px] text-[#64748b] mt-0.5">Review and respond to support tickets from sub-concessionaires</p>
      </div>

      <div className="flex gap-6 h-[calc(100vh-220px)] min-h-[500px]">

        {/* Ticket list */}
        <div className="w-80 shrink-0 flex flex-col bg-white rounded-xl border border-[#e2e4ed] overflow-hidden">
          {/* Filter tabs */}
          <div className="flex border-b border-[#e2e4ed] p-1 gap-1">
            {['open', 'in_progress', 'resolved', 'all'].map((f) => (
              <button
                key={f}
                onClick={() => { setStatusFilter(f); setSelectedId(null); }}
                className={`flex-1 text-[10px] font-semibold px-2 py-1.5 rounded capitalize transition-colors ${
                  statusFilter === f ? 'bg-[#002366] text-white' : 'text-[#64748b] hover:bg-[#f1f3f9]'
                }`}
              >
                {f.replace('_', ' ')}
              </button>
            ))}
          </div>

          <div className="flex-1 overflow-y-auto divide-y divide-[#f1f3f9]">
            {isLoading && <div className="py-10 text-center text-[#94a3b8] text-[12px]">Loading…</div>}
            {isError   && <div className="py-10 text-center text-[#dc2626] text-[12px]">Failed to load tickets.</div>}
            {!isLoading && !isError && tickets.map((ticket) => {
              const st = STATUS_STYLE[ticket.status] ?? STATUS_STYLE.open;
              const pr = PRIORITY_STYLE[ticket.priority] ?? PRIORITY_STYLE.normal;
              return (
                <button
                  key={ticket.id}
                  onClick={() => setSelectedId(ticket.id)}
                  className={`w-full text-left px-4 py-3.5 hover:bg-[#f8f9fc] transition-colors ${selectedId === ticket.id ? 'bg-[#f0f4ff] border-l-2 border-[#002366]' : ''}`}
                >
                  <div className="flex items-start justify-between gap-2 mb-1">
                    <p className="text-[12px] font-semibold text-[#1a1b20] truncate flex-1">{ticket.subject}</p>
                    <span className="text-[9px] font-bold px-1.5 py-0.5 rounded-full shrink-0" style={{ backgroundColor: st.bg, color: st.color }}>
                      {ticket.status.replace('_', ' ')}
                    </span>
                  </div>
                  <p className="text-[11px] text-[#64748b]">{ticket.category}</p>
                  <div className="flex items-center justify-between mt-1">
                    <span className="text-[10px] font-semibold" style={pr}>{ticket.priority}</span>
                    <span className="text-[10px] text-[#94a3b8]">{new Date(ticket.updated_at).toLocaleDateString('en-GB')}</span>
                  </div>
                </button>
              );
            })}
            {!isLoading && !isError && tickets.length === 0 && (
              <div className="py-10 text-center text-[#94a3b8] text-[12px]">No tickets in this category.</div>
            )}
          </div>
        </div>

        {/* Thread pane */}
        <div className="flex-1 bg-white rounded-xl border border-[#e2e4ed] overflow-hidden flex flex-col">
          {selectedId ? (
            <TicketThread ticketId={selectedId} onClose={() => setSelectedId(null)} />
          ) : (
            <div className="flex-1 flex items-center justify-center">
              <div className="text-center">
                <p className="text-[14px] font-semibold text-[#1a1b20] mb-1">Select a ticket</p>
                <p className="text-[12px] text-[#94a3b8]">Choose a ticket from the list to view the thread and reply</p>
              </div>
            </div>
          )}
        </div>

      </div>
    </div>
  );
}
