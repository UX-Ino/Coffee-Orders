import { NextResponse } from 'next/server';
import { NotionService } from '@/lib/notion/service';

export async function GET(req: Request) {
  try {
    const url = new URL(req.url);
    let date = url.searchParams.get('date') || undefined;
    if (!date) {
      date = new Date(Date.now() - new Date().getTimezoneOffset() * 60000)
        .toISOString()
        .slice(0, 10);
    }
    const svc = new NotionService();
    const res = await svc.fetchOrdersByDate(date);
    return NextResponse.json({ ok: true, date, ...res });
  } catch (e: any) {
    return NextResponse.json({ ok: false, error: e?.message ?? 'Unknown error' }, { status: 500 });
  }
}

