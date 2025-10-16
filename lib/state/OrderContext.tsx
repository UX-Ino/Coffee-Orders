"use client";
import { createContext, useContext, useEffect, useReducer, type ReactNode } from 'react';

type OrderItem = {
  name: string;
  menu: string | null;
  status: 'ordered' | 'passed';
  brandKey: 'oozy' | 'gate' | null;
  timestamp: string;
  tags?: string[];
};

type OrderState = {
  orders: OrderItem[];
  totalMembers: number;
  selectedMenu: string | null;
  currentBrand: 'oozy' | 'gate' | null;
};

const initialState: OrderState = { orders: [], totalMembers: 0, selectedMenu: null, currentBrand: null };

type Action =
  | { type: 'setTotal'; value: number }
  | { type: 'setBrand'; value: 'oozy' | 'gate' }
  | { type: 'order'; name: string; menu: string }
  | { type: 'pass'; name: string }
  | { type: 'selectMenu'; name: string | null }
  | { type: 'remove'; index: number }
  | { type: 'setOrders'; orders: OrderState['orders'] }
  | { type: 'assignBaemin'; names: string[] }
  | { type: 'clearBaemin' };

function reducer(state: OrderState, action: Action): OrderState {
  switch (action.type) {
    case 'setTotal':
      return { ...state, totalMembers: action.value };
    case 'setBrand':
      return { ...state, currentBrand: action.value };
    case 'order':
      return {
        ...state,
        orders: [
          ...state.orders,
          {
            name: action.name,
            menu: action.menu,
            status: 'ordered',
            brandKey: state.currentBrand,
            timestamp: new Date().toISOString(),
            tags: [],
          },
        ],
      };
    case 'pass':
      return {
        ...state,
        orders: [
          ...state.orders,
          {
            name: action.name,
            menu: null,
            status: 'passed',
            brandKey: state.currentBrand,
            timestamp: new Date().toISOString(),
            tags: [],
          },
        ],
      };
    case 'selectMenu':
      return { ...state, selectedMenu: action.name };
    case 'remove': {
      const next = state.orders.slice();
      if (action.index >= 0 && action.index < next.length) next.splice(action.index, 1);
      return { ...state, orders: next };
    }
    case 'setOrders': {
      const normalized = action.orders.map((o) => ({ ...o, tags: o.tags ?? [] }));
      return { ...state, orders: normalized };
    }
    case 'assignBaemin': {
      const target = new Set(action.names);
      const next = state.orders.map((o) => {
        const tags = new Set(o.tags ?? []);
        if (target.has(o.name) && o.status === 'ordered') {
          tags.add('배달의민족');
        } else {
          tags.delete('배달의민족');
        }
        return { ...o, tags: Array.from(tags) };
      });
      return { ...state, orders: next };
    }
    case 'clearBaemin': {
      const next = state.orders.map((o) => ({ ...o, tags: (o.tags ?? []).filter((t) => t !== '배달의민족') }));
      return { ...state, orders: next };
    }
    default:
      return state;
  }
}

const Ctx = createContext<{ state: OrderState; dispatch: React.Dispatch<Action> } | null>(null);

export function OrderProvider({ children }: { children: ReactNode }) {
  const [state, dispatch] = useReducer(reducer, initialState);
  useEffect(() => {
    // Initialize totalMembers from localStorage once on mount (client-side only)
    if (typeof window !== 'undefined') {
      const v = window.localStorage.getItem('totalMembers');
      if (v) dispatch({ type: 'setTotal', value: Number(v) || 0 });
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);
  useEffect(() => {
    // Fetch today's orders from Notion and load into context
    (async () => {
      try {
        const today = new Date(Date.now() - new Date().getTimezoneOffset() * 60000)
          .toISOString()
          .slice(0, 10);
        const res = await fetch(`/api/sync/orders/fetch?date=${today}`, { cache: 'no-store' });
        if (!res.ok) return;
        const data = await res.json();
        if (data?.orders) dispatch({ type: 'setOrders', orders: data.orders });
      } catch (e) {
        // best-effort
        console.error('Failed to fetch Notion orders', e);
      }
    })();
  }, []);
  return <Ctx.Provider value={{ state, dispatch }}>{children}</Ctx.Provider>;
}

export const useOrder = () => {
  const ctx = useContext(Ctx);
  if (!ctx) throw new Error('useOrder must be used within OrderProvider');
  return ctx;
};
