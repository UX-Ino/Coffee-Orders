import OrderStatus from '@/components/OrderStatus';

export default function StatusPage() {
  return (
    <section className="space-y-4">
      <h2 className="text-xl font-semibold">주문 현황</h2>
      <OrderStatus />
    </section>
  );
}

