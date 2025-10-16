import { notFound } from 'next/navigation';
import MenuGrid from '@/components/MenuGrid';
import OrderForm from '@/components/OrderForm';
import PassOption from '@/components/PassOption';

interface Props {
  params: { brand: string };
}

const BRANDS = ['oozy', 'gate'];

export default function OrderPage({ params }: Props) {
  const brand = params.brand?.toLowerCase();
  if (!BRANDS.includes(brand)) return notFound();

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

