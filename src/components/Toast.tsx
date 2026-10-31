export interface ToastData {
  id: number;
  message: string;
  action?: { label: string; onClick: () => void };
}

interface Props {
  toast: ToastData;
  placement: 'top' | 'bottom';
  onDismiss: () => void;
}

export function Toast({ toast, placement, onDismiss }: Props) {
  const pos =
    placement === 'top'
      ? 'top-[calc(env(safe-area-inset-top)+12px)]'
      : 'bottom-[calc(env(safe-area-inset-bottom)+92px)]';
  return (
    <div className={`pointer-events-none fixed inset-x-4 z-[70] flex justify-center ${pos}`} role="status" aria-live="polite">
      <div
        key={toast.id}
        className="animate-pop-in pointer-events-auto flex min-h-[52px] w-full max-w-md items-center justify-between gap-3 rounded-2xl bg-ink py-1.5 pe-1.5 ps-4 text-[15px] text-white shadow-lg"
      >
        <span className="py-2">{toast.message}</span>
        {toast.action && (
          <button
            type="button"
            onClick={() => {
              toast.action!.onClick();
              onDismiss();
            }}
            className="h-11 shrink-0 rounded-xl px-4 font-semibold text-[#93C5FD] active:bg-white/10"
          >
            {toast.action.label}
          </button>
        )}
      </div>
    </div>
  );
}
