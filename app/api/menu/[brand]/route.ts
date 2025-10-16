import { NextResponse } from 'next/server';
import fs from 'node:fs';
import path from 'node:path';

type FullMenu = {
  brand: string;
  store: string;
  category: string;
  item_name_ko: string;
  item_name_en?: string;
  item_desc_ko?: string;
  price_krw: number | null;
  options_json?: string;
  source_url?: string;
  captured_at?: string;
  note?: string;
};

function brandLabel(param: string): string | null {
  const key = param.toLowerCase();
  if (key === 'oozy') return '우지커피';
  if (key === 'gate') return '카페게이트';
  return null;
}

export async function GET(_: Request, { params }: { params: { brand: string } }) {
  const brandParam = params.brand;
  const brand = brandLabel(brandParam);
  if (!brand) return NextResponse.json({ error: 'Unknown brand' }, { status: 400 });

  const jsonPath = path.join(process.cwd(), 'passorder_fullmenu.json');
  if (!fs.existsSync(jsonPath)) {
    return NextResponse.json({ error: 'JSON not found' }, { status: 500 });
  }

  const raw = fs.readFileSync(jsonPath, 'utf8');
  const all: FullMenu[] = JSON.parse(raw);

  const menus = all
    .filter((m) => m.brand === brand)
    .map((m, i) => ({
      id: `${brandParam}-${i}`,
      brand: m.brand,
      category: m.category || '',
      name: m.item_name_ko || '',
      price: typeof m.price_krw === 'number' && Number.isFinite(m.price_krw) ? m.price_krw : null,
      image: (() => {
        const src = m.source_url || '';
        if (!src) return undefined;
        // If value looks like Next image proxy path("/_next/image?url=..."), extract actual remote URL
        try {
          if (src.startsWith('/_next/image')) {
            const q = src.split('?')[1] || '';
            const params = new URLSearchParams(q);
            const u = params.get('url');
            return u ? decodeURIComponent(u) : undefined;
          }
        } catch {}
        return src;
      })(),
    }));

  return NextResponse.json({ menus });
}
