"use client";
import { useState } from 'react';
import { useOrder } from '@/lib/state/OrderContext';

export default function OrderForm() {
  const [name, setName] = useState('');
  const { state, dispatch } = useOrder();
  const ordered = state.orders.filter((o) => o.status === 'ordered').length;
  const passed = state.orders.filter((o) => o.status === 'passed').length;
  const total = state.totalMembers;
  const isClosed = total > 0 && ordered + passed >= total;
  return (
    <form
      className="sbx-card p-4 space-y-3"
      onSubmit={async (e) => {
        e.preventDefault();
        if (isClosed) {
          alert('주문이 마감되었습니다.');
          return;
        }
        if (!name.trim()) return;
        const menu = state.selectedMenu || '선택된 메뉴';
        dispatch({ type: 'order', name, menu });
        setName('');
        try {
          const today = new Date(Date.now() - new Date().getTimezoneOffset() * 60000)
            .toISOString()
            .slice(0, 10);
          await fetch('/api/sync/orders', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({
              orders: [
                { name, menu, status: 'ordered', brandKey: state.currentBrand ?? null },
              ],
              date: today,
            }),
          });
        } catch (err) {
          console.error('Notion sync failed', err);
        }
      }}
    >
      <h3 className="font-semibold">주문자</h3>
      {isClosed && (
        <div className="rounded border border-yellow-300 bg-yellow-50 p-2 text-xs text-yellow-800">
          주문이 마감되어 더 이상 접수되지 않습니다.
        </div>
      )}
      <label className="block text-sm">이름</label>
      <input
        className="w-full rounded border px-3 py-2"
        placeholder="홍길동"
        value={name}
        onChange={(e) => setName(e.target.value)}
        required
        disabled={isClosed}
      />
      <button className="sbx-btn-primary w-full disabled:cursor-not-allowed disabled:opacity-50" disabled={!state.selectedMenu || isClosed}>
        {isClosed ? '주문 마감' : (state.selectedMenu ? `"${state.selectedMenu}" 주문 하기` : '메뉴를 선택하세요')}
      </button>
    </form>
  );
}
