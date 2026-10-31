import { STOCK_STATUSES, STOCK_STYLE, type StockStatus } from '../lib/types';

interface Props {
  counts: Record<StockStatus, number>;
  active: StockStatus | null;
  onToggle: (s: StockStatus) => void;
}

export function StatCards({ counts, active, onToggle }: Props) {
  return (
    <div className="grid grid-cols-3 gap-2.5">
      {STOCK_STATUSES.map((s) => {
        const selected = active === s;
        return (
          <button
            key={s}
            type="button"
            onClick={() => onToggle(s)}
            aria-pressed={selected}
            className={`flex h-[78px] flex-col items-center justify-center rounded-[14px] transition ${STOCK_STYLE[s]} ${
              selected ? 'ring-2 ring-inset ring-current' : ''
            }`}
          >
            <span className="text-[28px] font-bold leading-none">{counts[s]}</span>
            <span className="mt-1.5 text-[14px] font-semibold">{s}</span>
          </button>
        );
      })}
    </div>
  );
}
