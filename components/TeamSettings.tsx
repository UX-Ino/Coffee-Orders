"use client";
import { useEffect, useState } from 'react';
import { useOrder } from '@/lib/state/OrderContext';

export default function TeamSettings() {
  const [members, setMembers] = useState<number>(10);
  const { dispatch } = useOrder();

  useEffect(() => {
    const v = typeof window !== 'undefined' ? window.localStorage.getItem('totalMembers') : null;
    if (v) setMembers(Number(v));
  }, []);

  useEffect(() => {
    if (typeof window !== 'undefined') window.localStorage.setItem('totalMembers', String(members));
  }, [members]);

  return (
    <div className="flex rounded-md border p-4 items-center gap-4 bg-white shadow-sm">
      <label className="text-sm font-medium">팀 인원수 설정</label>
      <div className="ml-auto  flex items-center gap-2">
        <input
          type="number"
          min={1}
          max={50}
          className="w-24 rounded border px-3 py-2"
          value={members}
          onChange={(e) => setMembers(Math.max(1, Math.min(50, Number(e.target.value))))}
        />
        <span className="text-sm text-gray-500">1–50명</span>
        <button
          type="button"
          onClick={() => {
            if (typeof window !== 'undefined') window.localStorage.setItem('totalMembers', String(members));
            dispatch({ type: 'setTotal', value: members });
          }}
          className="rounded-md border border-gray-300 bg-white px-3 py-2 text-sm hover:bg-gray-50"
        >
          설정
        </button>
      </div>
    </div>
  );
}
