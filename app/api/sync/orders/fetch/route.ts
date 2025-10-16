import { NextResponse } from 'next/server';
import { NotionService } from '@/lib/notion/service';

export const runtime = 'nodejs';

export async function GET(req: Request) {
  try {
    const url = new URL(req.url);
    const date = url.searchParams.get('date');
    if (!date) return NextResponse.json({ error: 'date is required' }, { status: 400 });

    const svc = new NotionService();
    const data = await svc.fetchOrdersByDate(date);
    return NextResponse.json(data);
  } catch (e: any) {
    return NextResponse.json({ error: e?.message ?? 'Unknown error' }, { status: 500 });
  }
}

