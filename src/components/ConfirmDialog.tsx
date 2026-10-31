interface Props {
  title: string;
  message: string;
  confirmLabel: string;
  onConfirm: () => void;
  onCancel: () => void;
}

export function ConfirmDialog({ title, message, confirmLabel, onConfirm, onCancel }: Props) {
  return (
    <div className="animate-fade-in fixed inset-0 z-[60] flex items-center justify-center bg-black/45 p-6" onClick={onCancel}>
      <div
        role="alertdialog"
        aria-modal="true"
        className="animate-pop-in w-full max-w-sm rounded-[20px] bg-white p-5"
        onClick={(e) => e.stopPropagation()}
      >
        <h2 className="text-[18px] font-bold text-ink">{title}</h2>
        <p className="mt-1.5 text-[15px] text-muted">{message}</p>
        <div className="mt-5 grid grid-cols-2 gap-2.5">
          <button
            type="button"
            onClick={onConfirm}
            className="h-12 rounded-[14px] bg-[#B91C1C] text-[16px] font-semibold text-white active:opacity-90"
          >
            {confirmLabel}
          </button>
          <button
            type="button"
            onClick={onCancel}
            className="h-12 rounded-[14px] bg-[#F4F4F5] text-[16px] font-semibold text-[#3F3F46] active:opacity-90"
          >
            إلغاء
          </button>
        </div>
      </div>
    </div>
  );
}
