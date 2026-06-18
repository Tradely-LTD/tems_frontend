import type { AuthCardProps } from './types';

export default function AuthCard({ children, className }: AuthCardProps) {
  return (
    <div className="min-h-screen bg-ghost-white flex items-center justify-center p-4">
      <div
        className={`w-full max-w-[480px] bg-pure-white border border-silver-border rounded overflow-hidden shadow-sm ${
          className ?? ''
        }`}
      >
        {/* Header strip */}
        <div className="bg-royal-navy px-10 py-5 flex items-center gap-3">
          <div className="flex flex-col">
            <span className="text-white font-bold text-[20px] tracking-wider font-sans">
              TeMS
            </span>
            <span className="text-periwinkle text-[11px] font-bold tracking-[0.08em] uppercase font-sans">
              National Trade Infrastructure
            </span>
          </div>
        </div>
        {/* Body */}
        <div className="px-10 py-8">{children}</div>
      </div>
    </div>
  );
}
