import { RefreshCw } from 'lucide-react';
import { useRegisterSW } from 'virtual:pwa-register/react';

const CHECK_EVERY_MS = 30 * 60 * 1000;

/** Shows "في تحديث جديد" when a new version of the app has been downloaded. */
export function UpdateBanner() {
  const {
    needRefresh: [needRefresh],
    updateServiceWorker,
  } = useRegisterSW({
    onRegisteredSW(_url, reg) {
      if (!reg) return;
      // iOS keeps installed PWAs alive for a long time, so check for updates on open and periodically.
      const check = () => {
        if (navigator.onLine) reg.update().catch(() => {});
      };
      window.setInterval(check, CHECK_EVERY_MS);
      document.addEventListener('visibilitychange', () => {
        if (document.visibilityState === 'visible') check();
      });
    },
  });

  if (!needRefresh) return null;

  return (
    <div className="fixed inset-x-4 top-[calc(env(safe-area-inset-top)+10px)] z-[80] flex justify-center">
      <div className="animate-pop-in flex min-h-[52px] w-full max-w-md items-center justify-between gap-3 rounded-2xl bg-primary py-1.5 pe-1.5 ps-4 text-[15px] text-white shadow-lg">
        <span className="flex items-center gap-2 font-medium">
          <RefreshCw size={18} strokeWidth={1.75} />
          في تحديث جديد
        </span>
        <button
          type="button"
          onClick={() => updateServiceWorker(true)}
          className="h-11 shrink-0 rounded-xl bg-white px-4 font-semibold text-primary active:opacity-90"
        >
          حدّث دلوقتي
        </button>
      </div>
    </div>
  );
}
