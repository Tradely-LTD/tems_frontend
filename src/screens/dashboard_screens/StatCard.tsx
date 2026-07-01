export const colClass: Record<number, string> = { 2: 'grid-cols-2', 3: 'grid-cols-3', 4: 'grid-cols-4' };

interface StatCardProps {
  label: string;
  value: string;
  accentColor: string;
  note?: string;
}

export default function StatCard({ label, value, accentColor, note }: StatCardProps) {
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
