"use client";
import { useMemo } from 'react';
import { useOrder } from '@/lib/state/OrderContext';

export default function OrderStatus() {
  const { state, dispatch } = useOrder();
  const ordered = state.orders.filter((o) => o.status === 'ordered').length;
  const passed = state.orders.filter((o) => o.status === 'passed').length;
  const totalMembers = state.totalMembers;
  const progress = totalMembers > 0 ? Math.round(((ordered + passed) / totalMembers) * 100) : 0;

  const byMenu = useMemo(() => {
    const map = new Map<string, number>();
    state.orders.filter((o) => o.status === 'ordered').forEach((o) => {
      map.set(o.menu || '기타', (map.get(o.menu || '기타') || 0) + 1);
    });
    return Array.from(map.entries());
  }, [state.orders]);

  return (
    <div className="space-y-3">
      <div className="sbx-card">
        <div className="flex items-center justify-between text-sm text-gray-600">
          <span>진행률</span>
          <div className="flex items-center gap-2">
                  <div className="mt-1 text-sm">{ordered + passed} / {totalMembers}</div>

          </div>
        </div>
        <div className="sbx-progress-track">
          <div className="sbx-progress-bar" style={{ width: `${progress}%` }} />
        </div>
      </div>
      <div className="grid grid-cols-1 gap-3 md:grid-cols-2">
        <div className="sbx-card">
          <h4 className="font-medium">주문자</h4>
          <ul className="mt-2 space-y-1 text-sm text-gray-700">
            {state.orders.map((o, i) => (
              <li key={i} className="flex items-center justify-between gap-2">
                <span>
                  {o.name} — {o.status === 'passed' ? '주문 안함' : o.menu}
                </span>
                <button
                  type="button"
                  aria-label={`삭제: ${o.name}`}
                  className="inline-flex h-6 w-6 items-center justify-center rounded-full border border-gray-300 text-gray-600 hover:bg-gray-50"
                  onClick={async () => {
                    try {
                      const ts = o.timestamp ? new Date(o.timestamp) : new Date();
                      const localDate = new Date(ts.getTime() - ts.getTimezoneOffset() * 60000)
                        .toISOString()
                        .slice(0, 10);
                      const res = await fetch('/api/sync/orders/delete', {
                        method: 'POST',
                        headers: { 'Content-Type': 'application/json' },
                        body: JSON.stringify({ name: o.name, brandKey: o.brandKey ?? null, date: localDate }),
                      });
                      const data = await res.json();
                      if (!res.ok) throw new Error(data?.error || '노션 삭제 실패');
                    } catch (e) {
                      const msg = e instanceof Error ? e.message : String(e);
                      alert(`노션 삭제 실패: ${msg}`);
                      return;
                    }
                    dispatch({ type: 'remove', index: i });
                  }}
                >
                  ×
                </button>
              </li>
            ))}
            {state.orders.length === 0 && <li className="list-none text-gray-500">아직 주문이 없습니다.</li>}
          </ul>
        </div>
        <div className="sbx-card">
          <h4 className="font-medium">메뉴별 수량</h4>
          <ul className="mt-2 list-disc pl-5 text-sm text-gray-700">
            {byMenu.map(([name, count]) => (
              <li key={name}>{name} — {count}</li>
            ))}
            {byMenu.length === 0 && <li className="list-none text-gray-500">집계할 주문이 없습니다.</li>}
          </ul>
        </div>
      </div>
    </div>
  );
}
