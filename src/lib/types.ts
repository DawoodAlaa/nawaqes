export const CATEGORIES = ['جرابات', 'اسكرينات', 'شواحن', 'سماعات', 'ميموري', 'أجهزة', 'قطع غيار'] as const;
export const STOCK_STATUSES = ['خلص', 'قرب يخلص', 'مطلوب'] as const;
export const ORDER_STATUSES = ['لسه متطلبش', 'تم الطلب', 'تم الاستلام'] as const;

export type Category = (typeof CATEGORIES)[number];
export type StockStatus = (typeof STOCK_STATUSES)[number];
export type OrderStatus = (typeof ORDER_STATUSES)[number];

export const RECEIVED: OrderStatus = 'تم الاستلام';
export const NOT_ORDERED: OrderStatus = 'لسه متطلبش';

export interface Shortage {
  id: string;
  name: string;
  category: Category;
  stock_status: StockStatus;
  order_status: OrderStatus;
  urgent: boolean;
  note: string | null;
  created_at: string;
  updated_at: string;
  received_at: string | null;
}

export const STOCK_STYLE: Record<StockStatus, string> = {
  'خلص': 'text-[#9A3412] bg-[#FFF1E8]',
  'قرب يخلص': 'text-[#854D0E] bg-[#FEF9C3]',
  'مطلوب': 'text-[#5B21B6] bg-[#F5F3FF]',
};

export const ORDER_STYLE: Record<OrderStatus, string> = {
  'لسه متطلبش': 'text-[#3F3F46] bg-[#F4F4F5]',
  'تم الطلب': 'text-[#1E40AF] bg-[#EEF2FF]',
  'تم الاستلام': 'text-[#166534] bg-[#F0FDF4]',
};
