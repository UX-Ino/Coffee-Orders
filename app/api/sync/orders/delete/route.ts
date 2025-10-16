import { NextResponse } from 'next/server';
import { NotionService } from '@/lib/notion/service';

export const runtime = 'nodejs';

export async function POST(req: Request) {
  try {
    const body = await req.json();
    const name: string | undefined = body?.name;
    const date: string | undefined = body?.date; // YYYY-MM-DD
    const brandKey: 'oozy' | 'gate' | null | undefined = body?.brandKey ?? null;

    if (!name || !date) {
      return NextResponse.json({ error: 'name and date are required' }, { status: 400 });
    }

    const svc = new NotionService();
    const res = await svc.deleteOrdersByDate({ customerName: name, date, brandKey });
    return NextResponse.json({ ok: true, ...res });
  } catch (e: any) {
    return NextResponse.json({ error: e?.message ?? 'Unknown error' }, { status: 500 });
  }
}

