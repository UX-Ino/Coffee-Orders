"use client";
import { useEffect, useMemo, useState } from 'react';
import useSWR from 'swr';
import { useOrder } from '@/lib/state/OrderContext';
import Image from 'next/image';
import { getBrandRules } from '@/lib/config/menu';

type Menu = {
  id: string;
  brand: string;
  category: string;
  name: string;
  price: number | null;
  image?: string;
};

const fetcher = (url: string) => fetch(url).then((r) => r.json());

export default function MenuGrid({ brand, withCategoryTabs = false }: { brand: 'oozy' | 'gate'; withCategoryTabs?: boolean }) {
  const { data, error, isLoading } = useSWR<{ menus: Menu[] }>(`/api/menu/${brand}`, fetcher);
  const { state, dispatch } = useOrder();
  const menus = useMemo(() => data?.menus ?? [], [data?.menus]);
  const rules = getBrandRules(brand);
  const categories = useMemo(() => {
    const set = new Set(menus.map((m) => m.category).filter(Boolean));
    const arr = Array.from(set);
    return arr.sort((a, b) => {
      const wa = rules.categoryRank(a);
      const wb = rules.categoryRank(b);
      if (wa !== wb) return wa - wb;
      return a.localeCompare(b, 'ko');
    });
  }, [menus, rules]);
  const [activeCat, setActiveCat] = useState<string | null>(null);
  useEffect(() => {
    if (activeCat) return;
    if (categories.length === 0) return;
    // Prefer 'new/추천' for gate if present
    if (brand === 'gate') {
      const preferred = categories.find((c) => c.toLowerCase().includes('new/추천'))
        || categories.find((c) => c.toLowerCase().includes('추천'))
        || categories.find((c) => c.toLowerCase().includes('new'));
      if (preferred) {
        setActiveCat(preferred);
        return;
      }
    }
    setActiveCat(categories[0]);
  }, [categories, activeCat, brand]);

  const items = useMemo(() => {
    const base = withCategoryTabs && activeCat ? menus.filter((m) => m.category === activeCat) : menus;
    return [...base].sort((a, b) => rules.itemCompare(
      { name: a.name, price: a.price, category: a.category },
      { name: b.name, price: b.price, category: b.category },
    ));
  }, [menus, withCategoryTabs, activeCat, rules]);

  return (
    <div className="space-y-3">
      {withCategoryTabs && categories.length > 0 && (
        <div className="flex flex-wrap gap-2">
          {categories.map((c) => (
            <button
              key={c}
              onClick={() => setActiveCat(c)}
              className={`sbx-tab ${activeCat === c ? 'bg-sbx-primary text-white border-sbx-primary' : 'bg-white text-sbx-ink border-sbx-border'}`}
            >
              {c}
            </button>
          ))}
        </div>
      )}

      {isLoading && <div className="text-sm text-sbx-ink/70">메뉴 불러오는 중…</div>}
      {error && !isLoading && <div className="text-sm text-red-600">메뉴 로드 실패</div>}

      {!isLoading && !error && (
      <div className="grid grid-cols-2 gap-3 md:grid-cols-3">
        {items.map((i) => (
          <button
            key={i.id}
            onClick={() => dispatch({ type: 'selectMenu', name: i.name })}
            className={`sbx-card text-left hover:border-sbx-primary/30 ${
              state.selectedMenu === i.name ? 'ring-2 ring-sbx-accent' : ''
            }`}
          >
            {i.image && (
              <div className="mb-2 overflow-hidden rounded-xl bg-sbx-surface">
                <Image
                  src={i.image}
                  alt={i.name}
                  width={400}
                  height={300}
                  className="h-28 w-full object-cover"
                />
              </div>
            )}
            <div className="font-medium">{i.name}</div>
            <div className="text-sm text-sbx-ink/70">{i.price === null ? '-' : new Intl.NumberFormat('ko-KR').format(i.price) + '원'}</div>
          </button>
        ))}
        {items.length === 0 && (
          <div className="col-span-full text-sm text-sbx-ink/70">표시할 메뉴가 없습니다.</div>
        )}
      </div>
      )}
    </div>
  );
}
