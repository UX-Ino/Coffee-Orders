import { NextResponse } from 'next/server';
import { Client } from '@notionhq/client';

export async function GET() {
  const token = process.env.NOTION_TOKEN;
  const orderDbId = process.env.NOTION_ORDER_DB_ID;

  const env = {
    hasToken: Boolean(token),
    hasOrderDbId: Boolean(orderDbId),
  };

  if (!token || !orderDbId) {
    return NextResponse.json({ ok: false, reason: 'missing_env', env });
  }

  try {
    const notion = new Client({ auth: token });
    const db = await notion.databases.retrieve({ database_id: orderDbId });
    const title = (db as any).title?.[0]?.plain_text ?? '';
    return NextResponse.json({ ok: true, env, database: { id: db.id, title } });
  } catch (e: any) {
    return NextResponse.json({ ok: false, reason: 'notion_error', message: e?.message ?? String(e), env }, { status: 500 });
  }
}

