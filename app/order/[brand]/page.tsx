import { notFound } from 'next/navigation';
import MenuGrid from '@/components/MenuGrid';
import OrderForm from '@/components/OrderForm';
import PassOption from '@/components/PassOption';

interface Props {
  params: { brand: string };
}

const BRANDS = ['oozy', 'gate'] as const;
type BrandKey = (typeof BRANDS)[number];

function isBrandKey(v: string): v is BrandKey {
  return (BRANDS as readonly string[]).includes(v);
}

export default function OrderPage({ params }: Props) {
  const brandParam = (params.brand ?? '').toLowerCase();
  if (!isBrandKey(brandParam)) return notFound();
  const brand: BrandKey = brandParam;

  return (
    <div className="space-y-6">
      <h2 className="text-xl font-semibold">
        {brand === 'oozy' ? '우지커피' : '카페게이트'} 메뉴
      </h2>
      <MenuGrid brand={brand} />
      <div className="grid grid-cols-1 gap-4 md:grid-cols-2">
        <OrderForm />
        <PassOption />
      </div>
    </div>
  );
}
