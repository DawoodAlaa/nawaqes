import { Zap } from 'lucide-react';

export function UrgentBadge() {
  return (
    <span className="inline-flex h-6 items-center gap-1 rounded-md bg-[#C2410C] px-2 text-[12px] font-semibold text-white">
      <Zap size={13} strokeWidth={2.25} fill="currentColor" />
      مستعجل
    </span>
  );
}
