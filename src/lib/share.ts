import { CATEGORIES, NOT_ORDERED, type Shortage } from './types';
import { sortItems } from './utils';

export function buildShareText(items: Shortage[]): string | null {
  const list = items.filter((i) => i.order_status === NOT_ORDERED);
  if (!list.length) return null;

  const date = new Intl.DateTimeFormat('ar-EG-u-nu-latn', { weekday: 'long', day: 'numeric', month: 'long' }).format(
    new Date(),
  );
  const lines = ['*نواقص دريم فون*', date, ''];

  for (const cat of CATEGORIES) {
    const inCat = sortItems(list.filter((i) => i.category === cat));
    if (!inCat.length) continue;
    lines.push(`*${cat}* (${inCat.length})`);
    for (const it of inCat) {
      const tags = it.urgent ? ['مستعجل', it.stock_status] : [it.stock_status];
      lines.push(`- ${it.name} (${tags.join('، ')})`);
      if (it.note) lines.push(`   ${it.note}`);
    }
    lines.push('');
  }

  lines.push(`الإجمالي: ${list.length} صنف`);
  return lines.join('\n');
}

/** Opens the native share sheet when available, otherwise WhatsApp. */
export async function shareText(text: string): Promise<void> {
  if (navigator.share) {
    try {
      await navigator.share({ text });
      return;
    } catch (e) {
      if ((e as Error).name === 'AbortError') return;
    }
  }
  window.open(`https://wa.me/?text=${encodeURIComponent(text)}`, '_blank');
}
