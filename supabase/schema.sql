-- =============================================================
-- النواقص - دريم فون
-- شغّل الملف ده كله مرة واحدة من Supabase → SQL Editor
-- =============================================================

create table if not exists public.shortages (
  id           uuid primary key default gen_random_uuid(),
  name         text not null check (length(btrim(name)) > 0),
  category     text not null check (category in ('جرابات', 'اسكرينات', 'شواحن', 'سماعات', 'ميموري', 'أجهزة', 'قطع غيار')),
  stock_status text not null default 'خلص' check (stock_status in ('خلص', 'قرب يخلص', 'مطلوب')),
  order_status text not null default 'لسه متطلبش' check (order_status in ('لسه متطلبش', 'تم الطلب', 'تم الاستلام')),
  urgent       boolean not null default false,
  note         text,
  created_at   timestamptz not null default now(),
  updated_at   timestamptz not null default now(),
  received_at  timestamptz
);

create index if not exists shortages_order_status_idx on public.shortages (order_status);
create index if not exists shortages_updated_at_idx on public.shortages (updated_at desc);

-- received_at بيتسجل لوحده لما الحالة تبقى "تم الاستلام"، ويتشال لو الحالة رجعت.
-- الصنف المستلم مبيتمسحش: بيفضل في الجدول كسجل، والتطبيق بيخفيه من القائمة بس.
create or replace function public.shortages_before_write()
returns trigger
language plpgsql
as $$
begin
  if new.order_status = 'تم الاستلام' then
    if new.received_at is null then
      new.received_at := now();
    end if;
  else
    new.received_at := null;
  end if;

  if new.updated_at is null then
    new.updated_at := now();
  end if;

  return new;
end;
$$;

drop trigger if exists shortages_before_write on public.shortages;
create trigger shortages_before_write
  before insert or update on public.shortages
  for each row execute function public.shortages_before_write();

-- =============================================================
-- RLS
-- ⚠️ مؤقت: السياسات دي بتسمح لأي حد معاه الـ anon key يقرا ويكتب ويمسح.
-- لما نضيف تسجيل دخول، غيّر "to anon, authenticated" لـ "to authenticated"
-- وضيف شرط على صاحب المحل/الموظفين.
-- =============================================================

alter table public.shortages enable row level security;

grant select, insert, update, delete on public.shortages to anon, authenticated;

drop policy if exists "shortages_select_temp" on public.shortages;
create policy "shortages_select_temp" on public.shortages
  for select to anon, authenticated using (true);

drop policy if exists "shortages_insert_temp" on public.shortages;
create policy "shortages_insert_temp" on public.shortages
  for insert to anon, authenticated with check (true);

drop policy if exists "shortages_update_temp" on public.shortages;
create policy "shortages_update_temp" on public.shortages
  for update to anon, authenticated using (true) with check (true);

drop policy if exists "shortages_delete_temp" on public.shortages;
create policy "shortages_delete_temp" on public.shortages
  for delete to anon, authenticated using (true);

-- =============================================================
-- Realtime: عشان كل الموبايلات تشوف نفس القائمة لحظيًا
-- =============================================================

do $$
begin
  alter publication supabase_realtime add table public.shortages;
exception
  when duplicate_object then null;
end;
$$;
