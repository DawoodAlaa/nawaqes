import { CloudOff, RefreshCw } from 'lucide-react';

export function SyncPill({ pending, online }: { pending: number; online: boolean }) {
  if (pending > 0) {
    return (
      <span
        className="inline-flex h-8 items-center gap-1.5 rounded-full bg-[#FEF9C3] px-2.5 text-[12px] font-medium text-[#854D0E]"
        aria-label={`${pending} تغيير لسه متزامنش`}
      >
        {online ? <RefreshCw size={14} className="animate-spin" /> : <CloudOff size={14} />}
        {pending} مستني
      </span>
    );
  }
  if (!online) {
    return (
      <span className="inline-flex h-8 items-center gap-1.5 rounded-full bg-[#F4F4F5] px-2.5 text-[12px] font-medium text-[#3F3F46]">
        <CloudOff size={14} />
        أوفلاين
      </span>
    );
  }
  return null;
}
