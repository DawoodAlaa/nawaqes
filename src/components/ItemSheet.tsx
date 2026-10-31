import { useMemo, useState, type ReactNode } from 'react';
import { Save, Search, Trash2, X, Zap } from 'lucide-react';
import {
  ORDER_STATUSES,
  ORDER_STYLE,
  RECEIVED,
  STOCK_STATUSES,
  STOCK_STYLE,
  type Category,
  type OrderStatus,
  type Shortage,
  type StockStatus,
} from '../lib/types';
import { cleanName, normalize, uuid } from '../lib/utils';
import { BottomSheet } from './BottomSheet';
import { CategoryChips } from './CategoryChips';
import { CategoryIcon } from './CategoryIcon';
import { ConfirmDialog } from './ConfirmDialog';

interface Props {
  /** Item being edited; undefined = add mode */
  initial?: Shortage;
  /** All items, including received ones (used for suggestions and duplicate checks) */
  items: Shortage[];
  onClose: () => void;
  onSave: (row: Shortage, prev?: Shortage) => void;
  onDelete: (item: Shortage) => void;
  /** Called in add mode when the name already exists and isn't received yet */
  onDuplicate: (existing: Shortage) => void;
}

const MAX_SUGGESTIONS = 6;

export function ItemSheet({ initial, items, onClose, onSave, onDelete, onDuplicate }: Props) {
  const isEdit = !!initial;
  const [name, setName] = useState(initial?.name ?? '');
  const [category, setCategory] = useState<Category | null>(initial?.category ?? null);
  const [stock, setStock] = useState<StockStatus>(initial?.stock_status ?? 'خلص');
  const [order, setOrder] = useState<OrderStatus>(initial?.order_status ?? 'لسه متطلبش');
  const [urgent, setUrgent] = useState(initial?.urgent ?? false);
  const [note, setNote] = useState(initial?.note ?? '');
  const [suggestOpen, setSuggestOpen] = useState(false);
  const [confirming, setConfirming] = useState(false);

  const canSave = cleanName(name).length > 0 && category !== null;

  const findActive = (n: string) => {
    const key = normalize(n);
    return items.find((i) => i.order_status !== RECEIVED && i.id !== initial?.id && normalize(i.name) === key);
  };

  // Unique past names (latest record wins), filtered by what's typed.
  const suggestions = useMemo(() => {
    const q = normalize(name);
    if (!suggestOpen || !q) return [];
    const byName = new Map<string, Shortage>();
    for (const it of [...items].sort((a, b) => b.updated_at.localeCompare(a.updated_at))) {
      const k = normalize(it.name);
      if (!byName.has(k)) byName.set(k, it);
    }
    return [...byName.entries()]
      .filter(([k]) => k.includes(q))
      .sort(([a], [b]) => Number(b.startsWith(q)) - Number(a.startsWith(q)))
      .slice(0, MAX_SUGGESTIONS)
      .map(([, it]) => it);
  }, [items, name, suggestOpen]);

  const pickSuggestion = (s: Shortage) => {
    setSuggestOpen(false);
    if (!isEdit) {
      const dup = findActive(s.name);
      if (dup) {
        onDuplicate(dup);
        return;
      }
    }
    setName(s.name);
    setCategory(s.category);
  };

  const handleSave = () => {
    if (!canSave || !category) return;
    const clean = cleanName(name);
    if (!isEdit) {
      const dup = findActive(clean);
      if (dup) {
        onDuplicate(dup);
        return;
      }
    }
    const now = new Date().toISOString();
    onSave(
      {
        id: initial?.id ?? uuid(),
        name: clean,
        category,
        stock_status: stock,
        order_status: order,
        urgent,
        note: note.trim() || null,
        created_at: initial?.created_at ?? now,
        updated_at: now,
        received_at: order === RECEIVED ? (initial?.received_at ?? now) : null,
      },
      initial,
    );
  };

  const saveButton = (
    <button
      type="button"
      onClick={handleSave}
      disabled={!canSave}
      className="flex h-[54px] flex-1 items-center justify-center gap-2 rounded-[14px] bg-primary text-[17px] font-semibold text-white transition active:opacity-90 disabled:opacity-40"
    >
      <Save size={20} strokeWidth={1.75} />
      {isEdit ? 'حفظ التعديل' : 'حفظ'}
    </button>
  );

  return (
    <BottomSheet
      title={isEdit ? 'تعديل الصنف' : 'ضيف صنف ناقص'}
      onClose={onClose}
      footer={
        isEdit ? (
          <div className="flex gap-3">
            {saveButton}
            <button
              type="button"
              onClick={() => setConfirming(true)}
              aria-label="مسح الصنف"
              className="flex size-[54px] shrink-0 items-center justify-center rounded-[14px] bg-[#FEF2F2] text-[#B91C1C] active:opacity-80"
            >
              <Trash2 size={22} strokeWidth={1.75} />
            </button>
          </div>
        ) : (
          <div className="flex">{saveButton}</div>
        )
      }
    >
      <Field label="اسم الصنف">
        <div className="relative">
          {!isEdit && (
            <Search size={20} strokeWidth={1.75} className="pointer-events-none absolute start-3.5 top-1/2 -translate-y-1/2 text-muted" />
          )}
          <input
            autoFocus={!isEdit}
            value={name}
            onChange={(e) => {
              setName(e.target.value);
              setSuggestOpen(true);
            }}
            onBlur={() => window.setTimeout(() => setSuggestOpen(false), 150)}
            onKeyDown={(e) => {
              if (e.key === 'Escape') setSuggestOpen(false);
              if (e.key === 'Enter') e.currentTarget.blur();
            }}
            placeholder="مثلًا: اسكرين ايفون 15 برو"
            enterKeyHint="done"
            autoComplete="off"
            className={`h-[52px] w-full rounded-[14px] border border-line bg-white pe-11 text-[16px] text-ink outline-none placeholder:text-[#A1A1AA] focus:border-primary focus:ring-2 focus:ring-primary/15 ${
              isEdit ? 'ps-4' : 'ps-11'
            }`}
          />
          {name && (
            <button
              type="button"
              onPointerDown={(e) => e.preventDefault()}
              onClick={() => {
                setName('');
                setSuggestOpen(false);
              }}
              aria-label="امسح الاسم"
              className="absolute end-0.5 top-1/2 flex size-11 -translate-y-1/2 items-center justify-center text-[#A1A1AA]"
            >
              <X size={18} />
            </button>
          )}
        </div>

        {suggestions.length > 0 && (
          <ul className="mt-2 overflow-hidden rounded-[14px] border border-line bg-white shadow-sm">
            {suggestions.map((s) => {
              const active = !isEdit && !!findActive(s.name);
              return (
                <li key={s.id} className="border-b border-line last:border-b-0">
                  <button
                    type="button"
                    onPointerDown={(e) => e.preventDefault()}
                    onClick={() => pickSuggestion(s)}
                    className="flex min-h-[56px] w-full items-center gap-3 px-3 py-2 text-start active:bg-[#F4F4F5]"
                  >
                    <span className="flex size-10 shrink-0 items-center justify-center rounded-xl border border-line text-[#3F3F46]">
                      <CategoryIcon category={s.category} />
                    </span>
                    <span className="min-w-0 flex-1">
                      <span className="block truncate text-[15px] font-medium text-ink">{s.name}</span>
                      <span className="block text-[13px] text-muted">{s.category}</span>
                    </span>
                    {active && (
                      <span className="shrink-0 rounded-md bg-[#EEF2FF] px-2 py-1 text-[12px] font-medium text-[#1E40AF]">
                        في القائمة
                      </span>
                    )}
                  </button>
                </li>
              );
            })}
          </ul>
        )}
      </Field>

      <Field label="القسم">
        <CategoryChips value={category} onChange={(c) => c && setCategory(c)} variant="form" />
      </Field>

      <Field label="الحالة">
        <Segmented options={STOCK_STATUSES} value={stock} onChange={setStock} styles={STOCK_STYLE} />
      </Field>

      <Field label="حالة الطلب">
        <Segmented options={ORDER_STATUSES} value={order} onChange={setOrder} styles={ORDER_STYLE} />
      </Field>

      <button
        type="button"
        role="switch"
        aria-checked={urgent}
        onClick={() => setUrgent((u) => !u)}
        className="mt-5 flex h-14 w-full items-center justify-between rounded-[14px] border border-[#FDBA74] bg-[#FFF7ED] px-4 text-[#C2410C]"
      >
        <span className="flex items-center gap-2 text-[16px] font-semibold">
          <Zap size={20} strokeWidth={1.75} fill={urgent ? 'currentColor' : 'none'} />
          مستعجل
        </span>
        <span
          className={`relative h-[31px] w-[51px] rounded-full transition-colors ${urgent ? 'bg-[#C2410C]' : 'bg-[#D4D4D8]'}`}
        >
          <span
            className="absolute right-[2px] top-[2px] size-[27px] rounded-full bg-white shadow transition-transform"
            style={{ transform: urgent ? 'translateX(-20px)' : 'none' }}
          />
        </span>
      </button>

      <Field label="ملاحظة (اختياري)">
        <textarea
          value={note}
          onChange={(e) => setNote(e.target.value)}
          rows={2}
          placeholder="اكتب ملاحظة..."
          className="w-full resize-none rounded-[14px] border border-line bg-white px-4 py-3 text-[16px] text-ink outline-none placeholder:text-[#A1A1AA] focus:border-primary focus:ring-2 focus:ring-primary/15"
        />
      </Field>

      {confirming && initial && (
        <ConfirmDialog
          title="تمسح الصنف ده؟"
          message={`"${initial.name}" هيتمسح من القائمة ومن السجل.`}
          confirmLabel="امسح"
          onConfirm={() => {
            setConfirming(false);
            onDelete(initial);
          }}
          onCancel={() => setConfirming(false)}
        />
      )}
    </BottomSheet>
  );
}

function Field({ label, children }: { label: string; children: ReactNode }) {
  return (
    <div className="mt-5 first:mt-3">
      <div className="mb-2 text-[15px] font-medium text-ink">{label}</div>
      {children}
    </div>
  );
}

function Segmented<T extends string>({
  options,
  value,
  onChange,
  styles,
}: {
  options: readonly T[];
  value: T;
  onChange: (v: T) => void;
  styles: Record<T, string>;
}) {
  return (
    <div className="grid grid-cols-3 gap-2">
      {options.map((o) => {
        const selected = o === value;
        return (
          <button
            key={o}
            type="button"
            onClick={() => onChange(o)}
            aria-pressed={selected}
            className={`h-12 rounded-[12px] border-2 px-1 text-[15px] font-medium transition ${styles[o]} ${
              selected ? 'border-current' : 'border-transparent opacity-80'
            }`}
          >
            {o}
          </button>
        );
      })}
    </div>
  );
}
