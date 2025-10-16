"use client";
import { useEffect, useState } from 'react';
import BrandSelector from '@/components/BrandSelector';
import TeamSettings from '@/components/TeamSettings';
import MenuGrid from '@/components/MenuGrid';
import OrderForm from '@/components/OrderForm';
import PassOption from '@/components/PassOption';
import OrderStatus from '@/components/OrderStatus';
import { useOrder } from '@/lib/state/OrderContext';

export default function Page() {
  const [brand, setBrand] = useState<'oozy' | 'gate'>('oozy');
  const [open, setOpen] = useState(false);
  const { dispatch } = useOrder();
  const [today, setToday] = useState('');

  useEffect(() => {
    const d = new Date(Date.now() - new Date().getTimezoneOffset() * 60000)
      .toISOString()
      .slice(0, 10);
    setToday(d);
  }, []);

  return (
    <div className="space-y-6">
      <header className="flex items-center justify-between">
        <h1 className="text-2xl font-bold">팀 커피 주문</h1>
      </header>

      <div className="grid gap-6 md:grid-cols-[1fr_450px]">
        <div className="space-y-6">
          <TeamSettings />
          <BrandSelector
            value={brand}
            onChange={(b) => {
              setBrand(b);
              setOpen(false);
              dispatch({ type: 'selectMenu', name: null });
              dispatch({ type: 'setBrand', value: b });
            }}
            onProceed={() => {
              dispatch({ type: 'setBrand', value: brand });
              setOpen(true);
            }}
          />

          {open && (
            <section className="space-y-4">
              <h2 className="text-xl font-semibold">메뉴 선택</h2>
              <MenuGrid brand={brand} withCategoryTabs />
            </section>
          )}
        </div>

        <aside className="block">
          <div className="sticky top-4 gap-4 space-y-4">
            <div className="rounded-md border bg-white p-3 shadow-sm">
              <div className="mb-2 flex items-center justify-between text-sm font-medium text-gray-700">
                <span>주문 현황</span>
                <span className="text-gray-500">{today}</span>
              </div>
              <OrderStatus />
            </div>
            <div className="flex flex-row gap-4 md:flex-row">
              <div className="rounded-md border bg-white p-3 shadow-sm flex-1">
                <OrderForm />
              </div>
              <div className="rounded-md border bg-white p-3 shadow-sm flex-1">
                <PassOption />
              </div>
            </div>
          </div>
        </aside>
      </div>
    </div>
  );
}
