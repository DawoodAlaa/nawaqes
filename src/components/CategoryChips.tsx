import { CATEGORIES, type Category } from '../lib/types';

interface Props {
  value: Category | null;
  onChange: (c: Category | null) => void;
  /** Show a leading "الكل" chip (list screen) */
  withAll?: boolean;
  /** list = dark selected chip, form = blue selected chip */
  variant?: 'list' | 'form';
}

export function CategoryChips({ value, onChange, withAll, variant = 'list' }: Props) {
  const options: (Category | null)[] = withAll ? [null, ...CATEGORIES] : [...CATEGORIES];
  const selectedCls = variant === 'list' ? 'bg-ink text-white border-ink' : 'bg-primary text-white border-primary';
  const idleCls =
    variant === 'list' ? 'bg-white text-[#3F3F46] border-line' : 'bg-[#F4F4F5] text-[#3F3F46] border-[#F4F4F5]';

  return (
    <div className="no-scrollbar -mx-4 flex gap-2 overflow-x-auto px-4">
      {options.map((c) => {
        const selected = value === c;
        return (
          <button
            key={c ?? 'all'}
            type="button"
            onClick={() => onChange(c)}
            aria-pressed={selected}
            className={`h-11 shrink-0 whitespace-nowrap rounded-full border px-4 text-[15px] font-medium transition-colors ${
              selected ? selectedCls : idleCls
            }`}
          >
            {c ?? 'الكل'}
          </button>
        );
      })}
    </div>
  );
}
