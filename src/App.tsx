import { useCallback, useMemo, useRef, useState } from 'react';
import { PackageCheck, Plus, Search, Share2, X } from 'lucide-react';
import { CategoryChips } from './components/CategoryChips';
import { ItemCard } from './components/ItemCard';
import { ItemSheet } from './components/ItemSheet';
import { StatCards } from './components/StatCards';
import { SyncPill } from './components/SyncPill';
import { Toast, type ToastData } from './components/Toast';
import { UpdateBanner } from './components/UpdateBanner';
import { useNow, useVisualViewportVars } from './lib/hooks';
import { buildShareText, shareText } from './lib/share';
import { deleteItem, saveItem, useStore } from './lib/store';
import { RECEIVED, STOCK_STATUSES, type Category, type Shortage, type StockStatus } from './lib/types';
import { normalize, sortItems } from './lib/utils';

interface SheetState {
  key: number;
  item?: Shortage;
}

export default function App() {
  const { ready, items, pending, online } = useStore();
  const now = useNow();
  useVisualViewportVars();

  const [stockFilter, setStockFilter] = useState<StockStatus | null>(null);
  const [category, setCategory] = useState<Category | null>(null);
  const [query, setQuery] = useState('');
  const [sheet, setSheet] = useState<SheetState | null>(null);
  const [toast, setToast] = useState<ToastData | null>(null);
  const toastTimer = useRef<number>();

  const showToast = useCallback((message: string, action?: ToastData['action']) => {
    window.clearTimeout(toastTimer.current);
    setToast({ id: Date.now(), message, action });
    toastTimer.current = window.setTimeout(() => setToast(null), action ? 5000 : 2500);
  }, []);

  const active = useMemo(() => items.filter((i) => i.order_status !== RECEIVED), [items]);

  const counts = useMemo(() => {
    const c = Object.fromEntries(STOCK_STATUSES.map((s) => [s, 0])) as Record<StockStatus, number>;
    for (const i of active) c[i.stock_status]++;
    return c;
  }, [active]);

  const visible = useMemo(() => {
    const q = normalize(query);
    return sortItems(
      active.filter(
        (i) =>
          (!stockFilter || i.stock_status === stockFilter) &&
          (!category || i.category === category) &&
          (!q || normalize(`${i.name} ${i.note ?? ''} ${i.category}`).includes(q)),
      ),
    );
  }, [active, stockFilter, category, query]);

  const hasFilters = !!(stockFilter || category || query);

  const handleShare = async () => {
    const text = buildShareText(active);
    if (!text) {
      showToast('مفيش أصناف لسه متطلبتش');
      return;
    }
    await shareText(text);
  };

  const handleSave = (row: Shortage, prev?: Shortage) => {
    saveItem(row);
    setSheet(null);
    if (row.order_status === RECEIVED && prev?.order_status !== RECEIVED) {
      showToast(`"${row.name}" اتستلم واتشال من القائمة`, {
        label: 'تراجع',
        onClick: () => (prev ? saveItem(prev) : deleteItem(row.id)),
      });
    } else {
      showToast(prev ? 'اتحفظ التعديل' : 'اتضاف للقائمة');
    }
  };

  const handleDelete = (item: Shortage) => {
    deleteItem(item.id);
    setSheet(null);
    showToast(`"${item.name}" اتمسح`, { label: 'تراجع', onClick: () => saveItem(item) });
  };

  const handleDuplicate = (existing: Shortage) => {
    setSheet({ key: Date.now(), item: existing });
    showToast('الصنف ده موجود في القائمة، فتحتهولك');
  };

  const clearFilters = () => {
    setStockFilter(null);
    setCategory(null);
    setQuery('');
  };

  return (
    <div className="min-h-dvh pe-[env(safe-area-inset-right)] ps-[env(safe-area-inset-left)]">
      <div className="mx-auto max-w-lg">
        <header className="border-b border-line bg-white px-4 pb-4 pt-[calc(env(safe-area-inset-top)+10px)]">
          <div className="relative flex h-[64px] flex-col items-center justify-center">
            <div className="text-[14px] font-semibold text-primary">دريم فون</div>
            <h1 className="text-[26px] font-bold leading-tight text-ink">النواقص</h1>
            <div className="absolute right-0 top-1/2 -translate-y-1/2">
              <SyncPill pending={pending} online={online} />
            </div>
            <button
              type="button"
              onClick={handleShare}
              aria-label="مشاركة"
              className="absolute left-0 top-1/2 flex size-12 -translate-y-1/2 items-center justify-center rounded-[14px] border border-line bg-white text-primary active:bg-[#F4F4F5]"
            >
              <Share2 size={22} strokeWidth={1.75} />
            </button>
          </div>

          <div className="mt-4">
            <StatCards counts={counts} active={stockFilter} onToggle={(s) => setStockFilter((f) => (f === s ? null : s))} />
          </div>

          <div className="relative mt-3">
            <Search
              size={20}
              strokeWidth={1.75}
              className="pointer-events-none absolute start-3.5 top-1/2 -translate-y-1/2 text-muted"
            />
            <input
              type="search"
              value={query}
              onChange={(e) => setQuery(e.target.value)}
              placeholder="ابحث عن صنف..."
              enterKeyHint="search"
              className="h-12 w-full rounded-[14px] bg-[#F4F4F5] pe-11 ps-11 text-[16px] text-ink outline-none placeholder:text-[#71717A] focus:ring-2 focus:ring-primary/20 [&::-webkit-search-cancel-button]:hidden"
            />
            {query && (
              <button
                type="button"
                onClick={() => setQuery('')}
                aria-label="امسح البحث"
                className="absolute end-0.5 top-1/2 flex size-11 -translate-y-1/2 items-center justify-center text-[#71717A]"
              >
                <X size={18} />
              </button>
            )}
          </div>

          <div className="mt-3">
            <CategoryChips value={category} onChange={setCategory} withAll />
          </div>
        </header>

        <main className="space-y-2.5 px-4 pb-[calc(env(safe-area-inset-bottom)+100px)] pt-3">
          {ready && active.length === 0 && (
            <div className="flex flex-col items-center px-6 pt-16 text-center">
              <span className="flex size-16 items-center justify-center rounded-full bg-white text-muted ring-1 ring-line">
                <PackageCheck size={30} strokeWidth={1.5} />
              </span>
              <p className="mt-4 text-[18px] font-semibold text-ink">مفيش نواقص دلوقتي</p>
              <p className="mt-1 text-[15px] text-muted">لو فيه حاجة خلصت دوس على + وضيفها</p>
            </div>
          )}

          {ready && active.length > 0 && visible.length === 0 && (
            <div className="flex flex-col items-center px-6 pt-12 text-center">
              <p className="text-[16px] font-semibold text-ink">مفيش أصناف بالفلتر ده</p>
              {hasFilters && (
                <button
                  type="button"
                  onClick={clearFilters}
                  className="mt-3 h-11 rounded-full border border-line bg-white px-5 text-[15px] font-medium text-primary"
                >
                  شيل الفلتر
                </button>
              )}
            </div>
          )}

          {visible.map((item) => (
            <ItemCard key={item.id} item={item} now={now} onClick={() => setSheet({ key: Date.now(), item })} />
          ))}
        </main>
      </div>

      <button
        type="button"
        onClick={() => setSheet({ key: Date.now() })}
        aria-label="ضيف صنف"
        className="fixed bottom-[calc(env(safe-area-inset-bottom)+20px)] left-[calc(env(safe-area-inset-left)+18px)] z-40 flex size-[60px] items-center justify-center rounded-full bg-primary text-white shadow-[0_8px_24px_rgba(29,78,216,0.35)] transition active:scale-95"
      >
        <Plus size={30} strokeWidth={2.25} />
      </button>

      {sheet && (
        <ItemSheet
          key={sheet.key}
          initial={sheet.item}
          items={items}
          onClose={() => setSheet(null)}
          onSave={handleSave}
          onDelete={handleDelete}
          onDuplicate={handleDuplicate}
        />
      )}

      {toast && <Toast toast={toast} placement={sheet ? 'top' : 'bottom'} onDismiss={() => setToast(null)} />}

      <UpdateBanner />
    </div>
  );
}
