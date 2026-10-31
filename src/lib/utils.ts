import { STOCK_STATUSES, type Shortage } from './types';

/** Loose Arabic normalization for search and duplicate checks. */
export function normalize(s: string): string {
  return s
    .trim()
    .toLowerCase()
    .replace(/[ً-ْـ]/g, '')
    .replace(/[أإآ]/g, 'ا')
    .replace(/ة/g, 'ه')
    .replace(/ى/g, 'ي')
    .replace(/[٠-٩]/g, (d) => String(d.charCodeAt(0) - 0x660))
    .replace(/\s+/g, ' ');
}

export function cleanName(s: string): string {
  return s.trim().replace(/\s+/g, ' ');
}

export function uuid(): string {
  if (typeof crypto !== 'undefined' && 'randomUUID' in crypto) return crypto.randomUUID();
  return 'xxxxxxxx-xxxx-4xxx-yxxx-xxxxxxxxxxxx'.replace(/[xy]/g, (c) => {
    const r = (Math.random() * 16) | 0;
    return (c === 'x' ? r : (r & 0x3) | 0x8).toString(16);
  });
}

/** Urgent first, then خلص, قرب يخلص, مطلوب; newest first inside each group. */
export function sortItems(items: Shortage[]): Shortage[] {
  const rank = (i: Shortage) => (i.urgent ? 0 : 1 + STOCK_STATUSES.indexOf(i.stock_status));
  return [...items].sort((a, b) => rank(a) - rank(b) || b.created_at.localeCompare(a.created_at));
}

function plural(n: number, one: string, two: string, few: string, many: string): string {
  if (n === 1) return one;
  if (n === 2) return two;
  if (n <= 10) return `${n} ${few}`;
  return `${n} ${many}`;
}

function startOfDay(d: Date): number {
  return new Date(d.getFullYear(), d.getMonth(), d.getDate()).getTime();
}

export function relativeTime(iso: string, now: number): string {
  const then = new Date(iso);
  const diffMin = Math.floor((now - then.getTime()) / 60000);
  if (diffMin < 1) return 'دلوقتي';
  if (diffMin < 60) return 'من ' + plural(diffMin, 'دقيقة', 'دقيقتين', 'دقايق', 'دقيقة');

  const days = Math.round((startOfDay(new Date(now)) - startOfDay(then)) / 86400000);
  const hours = Math.floor(diffMin / 60);
  if (days === 0 || hours < 6) return 'من ' + plural(hours, 'ساعة', 'ساعتين', 'ساعات', 'ساعة');
  if (days === 1) return 'إمبارح';
  if (days < 7) return 'من ' + plural(days, 'يوم', 'يومين', 'أيام', 'يوم');
  if (days < 14) return 'من أسبوع';
  if (days < 30) return 'من ' + plural(Math.floor(days / 7), 'أسبوع', 'أسبوعين', 'أسابيع', 'أسبوع');
  return new Intl.DateTimeFormat('ar-EG-u-nu-latn', { day: 'numeric', month: 'long' }).format(then);
}
