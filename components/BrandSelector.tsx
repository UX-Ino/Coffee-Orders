"use client";
import { useState } from 'react';

const tabs = [
  { key: 'oozy', label: '우지커피' },
  { key: 'gate', label: '카페게이트 - 리뉴얼 공사중' },
] as const;

export default function BrandSelector({
  onProceed,
  onChange,
  value,
}: {
  onProceed?: (brand: 'oozy' | 'gate') => void;
  onChange?: (brand: 'oozy' | 'gate') => void;
  value?: 'oozy' | 'gate';
}) {
  const [internal, setInternal] = useState<'oozy' | 'gate'>(value ?? 'oozy');
  const active = value ?? internal;

  const setActive = (v: 'oozy' | 'gate') => {
    setInternal(v);
    onChange?.(v);
  };

  return (
    <div className="space-y-3">
      <div className="flex gap-2">
        {tabs.map((t) => (
          <button
            key={t.key}
            onClick={() => setActive(t.key)}
            className={`sbx-tab ${
              active === t.key ? 'bg-sbx-primary text-white border-sbx-primary' : 'bg-white text-sbx-ink border-sbx-border'
            }`}
            aria-pressed={active === t.key}
          >
            {t.label}
          </button>
        ))}
      </div>
      <button
        onClick={() => onProceed?.(active)}
        className="sbx-btn-primary w-full"
      >
        {tabs.find((t) => t.key === active)!.label} 주문하러 가기
      </button>
    </div>
  );
}
