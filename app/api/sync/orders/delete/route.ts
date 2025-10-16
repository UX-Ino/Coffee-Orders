import { NextResponse } from 'next/server';
import { NotionService } from '@/lib/notion/service';

export async function POST(req: Request) {
  try {
    const body = await req.json();
    const name: string | undefined = body?.name;
    const brandKey: 'oozy' | 'gate' | null | undefined = body?.brandKey ?? null;
    let date: string | undefined = body?.date;

    if (!name) return NextResponse.json({ error: 'Missing name' }, { status: 400 });

    if (!date) {
      date = new Date(Date.now() - new Date().getTimezoneOffset() * 60000)
        .toISOString()
        .slice(0, 10);
    }

    const svc = new NotionService();
    const res = await svc.deleteOrdersByDate({ customerName: name, brandKey, date });
    return NextResponse.json({ ok: true, ...res, date });
  } catch (e: any) {
    return NextResponse.json({ error: e?.message ?? 'Unknown error' }, { status: 500 });
  }
}

