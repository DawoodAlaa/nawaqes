import { useSyncExternalStore } from 'react';
import { openDB, type DBSchema, type IDBPDatabase } from 'idb';
import { supabase, TABLE } from './supabase';
import type { Shortage } from './types';

/**
 * Offline-first store.
 * Every change is written to IndexedDB (items + outbox) and shown right away,
 * then the outbox is pushed to Supabase whenever we're online.
 * Rows with a pending outbox entry are never overwritten by server data.
 */

interface OutboxEntry {
  id: string;
  op: 'upsert' | 'delete';
  row?: Shortage;
  ts: number;
}

interface NawaqesDB extends DBSchema {
  items: { key: string; value: Shortage };
  outbox: { key: string; value: OutboxEntry };
}

export interface StoreState {
  ready: boolean;
  items: Shortage[];
  pending: number;
  online: boolean;
}

let state: StoreState = {
  ready: false,
  items: [],
  pending: 0,
  online: typeof navigator === 'undefined' ? true : navigator.onLine,
};
const listeners = new Set<() => void>();

let db: IDBPDatabase<NawaqesDB>;
let itemsMap = new Map<string, Shortage>();
/** id -> ts of the latest outbox entry, kept in memory so checks are synchronous. */
const pendingTs = new Map<string, number>();
let lastTs = 0;

function setState(patch: Partial<StoreState>) {
  state = { ...state, ...patch };
  listeners.forEach((l) => l());
}

function emit() {
  setState({ items: Array.from(itemsMap.values()), pending: pendingTs.size });
}

function nextTs() {
  lastTs = Math.max(Date.now(), lastTs + 1);
  return lastTs;
}

function subscribe(l: () => void) {
  listeners.add(l);
  return () => listeners.delete(l);
}

export function useStore(): StoreState {
  return useSyncExternalStore(subscribe, () => state);
}

// ---------- init ----------

let started = false;

export async function initStore() {
  if (started) return;
  started = true;

  db = await openDB<NawaqesDB>('nawaqes', 1, {
    upgrade(d) {
      d.createObjectStore('items', { keyPath: 'id' });
      d.createObjectStore('outbox', { keyPath: 'id' });
    },
  });

  const [rows, outbox] = await Promise.all([db.getAll('items'), db.getAll('outbox')]);
  itemsMap = new Map(rows.map((r) => [r.id, r]));
  for (const e of outbox) {
    pendingTs.set(e.id, e.ts);
    lastTs = Math.max(lastTs, e.ts);
  }
  emit();
  setState({ ready: true });

  window.addEventListener('online', () => {
    setState({ online: true });
    syncNow();
  });
  window.addEventListener('offline', () => setState({ online: false }));
  document.addEventListener('visibilitychange', () => {
    if (document.visibilityState === 'visible') syncNow();
  });
  window.setInterval(() => {
    if (pendingTs.size > 0) flush();
  }, 20000);

  subscribeRealtime();
  syncNow();
}

async function syncNow() {
  await flush();
  await pull();
}

// ---------- local writes ----------

export function saveItem(item: Shortage) {
  const row: Shortage = { ...item, updated_at: new Date().toISOString() };
  const ts = nextTs();
  itemsMap.set(row.id, row);
  pendingTs.set(row.id, ts);
  emit();

  const tx = db.transaction(['items', 'outbox'], 'readwrite');
  tx.objectStore('items').put(row);
  tx.objectStore('outbox').put({ id: row.id, op: 'upsert', row, ts });
  tx.done.then(() => flush());
}

export function deleteItem(id: string) {
  const ts = nextTs();
  itemsMap.delete(id);
  pendingTs.set(id, ts);
  emit();

  const tx = db.transaction(['items', 'outbox'], 'readwrite');
  tx.objectStore('items').delete(id);
  tx.objectStore('outbox').put({ id, op: 'delete', ts });
  tx.done.then(() => flush());
}

// ---------- push ----------

let flushing = false;
let flushAgain = false;

export async function flush() {
  if (flushing) {
    flushAgain = true;
    return;
  }
  flushing = true;
  try {
    do {
      flushAgain = false;
      await pushOutbox();
    } while (flushAgain);
  } finally {
    flushing = false;
  }
}

async function pushOutbox() {
  if (!supabase || !navigator.onLine) return;
  const entries = (await db.getAll('outbox')).sort((a, b) => a.ts - b.ts);

  for (const e of entries) {
    const { error } =
      e.op === 'upsert'
        ? await supabase.from(TABLE).upsert(e.row!)
        : await supabase.from(TABLE).delete().eq('id', e.id);

    if (error) {
      console.warn('مزامنة فشلت', error);
      // A Postgres error (has a code) won't fix itself by retrying now; a network error stops the loop.
      if (error.code) continue;
      break;
    }

    // Only clear the entry if nothing newer was queued for this row meanwhile.
    if (pendingTs.get(e.id) === e.ts) {
      pendingTs.delete(e.id);
      db.delete('outbox', e.id);
      emit();
    }
  }
}

// ---------- pull ----------

async function pull() {
  if (!supabase || !navigator.onLine) return;
  const { data, error } = await supabase
    .from(TABLE)
    .select('*')
    .order('updated_at', { ascending: false })
    .limit(5000);
  if (error || !data) {
    if (error) console.warn('تحميل البيانات فشل', error);
    return;
  }

  const next = new Map<string, Shortage>();
  for (const r of data as Shortage[]) if (!pendingTs.has(r.id)) next.set(r.id, r);
  for (const id of pendingTs.keys()) {
    const local = itemsMap.get(id);
    if (local) next.set(id, local);
  }
  itemsMap = next;

  const tx = db.transaction('items', 'readwrite');
  tx.store.clear();
  for (const r of next.values()) tx.store.put(r);
  emit();
  await tx.done;
}

// ---------- realtime ----------

function subscribeRealtime() {
  if (!supabase) return;
  supabase
    .channel('shortages-realtime')
    .on('postgres_changes', { event: '*', schema: 'public', table: TABLE }, (payload) => {
      if (payload.eventType === 'DELETE') {
        const id = (payload.old as Partial<Shortage>).id;
        if (!id || pendingTs.has(id)) return;
        itemsMap.delete(id);
        db.delete('items', id);
      } else {
        const row = payload.new as Shortage;
        if (pendingTs.has(row.id)) return;
        itemsMap.set(row.id, row);
        db.put('items', row);
      }
      emit();
    })
    .subscribe((status) => {
      // Catch anything missed while the socket was down.
      if (status === 'SUBSCRIBED') pull();
    });
}
