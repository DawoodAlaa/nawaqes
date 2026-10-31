import { useState, type ReactNode } from 'react';
import { X } from 'lucide-react';
import { useLockBodyScroll } from '../lib/hooks';

interface Props {
  title: string;
  onClose: () => void;
  children: ReactNode;
  footer: ReactNode;
}

export function BottomSheet({ title, onClose, children, footer }: Props) {
  const [closing, setClosing] = useState(false);
  useLockBodyScroll();

  const requestClose = () => {
    if (closing) return;
    setClosing(true);
    window.setTimeout(onClose, 190);
  };

  return (
    <div className="fixed inset-0 z-50">
      <div
        className={`absolute inset-0 bg-black/40 ${closing ? 'animate-fade-out' : 'animate-fade-in'}`}
        onClick={requestClose}
      />
      <div
        role="dialog"
        aria-modal="true"
        aria-label={title}
        className={`absolute inset-x-0 mx-auto flex max-w-lg flex-col rounded-t-[22px] bg-white shadow-2xl ${
          closing ? 'animate-sheet-down' : 'animate-sheet-up'
        }`}
        style={{
          bottom: 'var(--kb, 0px)',
          maxHeight: 'calc(var(--vvh, 100dvh) - env(safe-area-inset-top) - 16px)',
        }}
      >
        <div className="flex justify-center pt-2.5">
          <span className="h-1.5 w-10 rounded-full bg-[#D4D4D8]" />
        </div>
        <div className="flex items-center justify-between px-4 pb-1 pt-1">
          <h2 className="text-[22px] font-bold text-ink">{title}</h2>
          <button
            type="button"
            onClick={requestClose}
            aria-label="إغلاق"
            className="-me-2 flex size-11 items-center justify-center rounded-full text-[#3F3F46] active:bg-[#F4F4F5]"
          >
            <X size={24} strokeWidth={1.75} />
          </button>
        </div>
        <div className="min-h-0 flex-1 overflow-y-auto overscroll-contain px-4 pb-4">{children}</div>
        <div className="border-t border-line px-4 pb-[calc(env(safe-area-inset-bottom)+12px)] pt-3">{footer}</div>
      </div>
    </div>
  );
}
