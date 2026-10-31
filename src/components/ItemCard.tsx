import { ORDER_STYLE, STOCK_STYLE, type Shortage } from '../lib/types';
import { relativeTime } from '../lib/utils';
import { UrgentBadge } from './UrgentBadge';

export function ItemCard({ item, now, onClick }: { item: Shortage; now: number; onClick: () => void }) {
  return (
    <button
      type="button"
      onClick={onClick}
      className={`flex w-full items-stretch gap-3 rounded-[14px] bg-white p-4 text-start transition active:scale-[0.99] ${
        item.urgent ? 'border-[1.5px] border-[#FDBA74]' : 'border border-line'
      }`}
    >
      <div className="min-w-0 flex-1">
        <div className="flex items-center gap-2 text-[13px] text-muted">
          {item.urgent && <UrgentBadge />}
          <span>{item.category}</span>
        </div>
        <div className="mt-1 break-words text-[16px] font-semibold leading-snug text-ink">{item.name}</div>
        {item.note && <div className="mt-0.5 line-clamp-2 text-[14px] text-muted">{item.note}</div>}
        <div className="mt-1.5 text-[12.5px] text-muted/80">{relativeTime(item.created_at, now)}</div>
      </div>
      <div className="flex w-[104px] shrink-0 flex-col gap-2">
        <span
          className={`flex h-8 items-center justify-center rounded-lg px-2 text-[13px] font-medium ${ORDER_STYLE[item.order_status]}`}
        >
          {item.order_status}
        </span>
        <span
          className={`flex h-8 items-center justify-center rounded-lg px-2 text-[13px] font-medium ${STOCK_STYLE[item.stock_status]}`}
        >
          {item.stock_status}
        </span>
      </div>
    </button>
  );
}
