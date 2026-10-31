import {
  Headphones,
  MemoryStick,
  MonitorSmartphone,
  PlugZap,
  Smartphone,
  TabletSmartphone,
  Wrench,
  type LucideIcon,
} from 'lucide-react';
import type { Category } from '../lib/types';

const ICONS: Record<Category, LucideIcon> = {
  'جرابات': Smartphone,
  'اسكرينات': MonitorSmartphone,
  'شواحن': PlugZap,
  'سماعات': Headphones,
  'ميموري': MemoryStick,
  'أجهزة': TabletSmartphone,
  'قطع غيار': Wrench,
};

export function CategoryIcon({ category, size = 20 }: { category: Category; size?: number }) {
  const Icon = ICONS[category] ?? Smartphone;
  return <Icon size={size} strokeWidth={1.75} />;
}
