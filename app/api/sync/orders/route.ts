import { NextResponse } from 'next/server';
import { NotionService } from '@/lib/notion/service';

export async function POST(req: Request) {
  try {
    const body = await req.json();
    const orders = body?.orders as Array<{
      name: string;
      menu: string | null;
      status: 'ordered' | 'passed';
      brandKey: 'oozy' | 'gate' | null;
    }>;
    const date: string | undefined = body?.date; // YYYY-MM-DD

    if (!Array.isArray(orders) || orders.length === 0) {
      return NextResponse.json({ error: 'No orders provided' }, { status: 400 });
    }
    const d = date ?? new Date(Date.now() - new Date().getTimezoneOffset() * 60000).toISOString().slice(0, 10);
    const svc = new NotionService();
    const payload = orders.map((o) => ({
      customerName: o.name,
      menuName: o.menu,
      brandKey: o.brandKey,
      status: o.status,
      date: d,
    }));

    const res = await svc.syncOrdersByDate(payload as any);
    return NextResponse.json({ ok: true, ...res, date: d });
  } catch (e: any) {
    return NextResponse.json({ error: e?.message ?? 'Unknown error' }, { status: 500 });
  }
}
