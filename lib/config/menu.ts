export type MenuLite = { name: string; price: number | null; category: string };

export interface BrandMenuRules {
  categoryRank: (category: string) => number;
  itemCompare: (a: MenuLite, b: MenuLite) => number;
}

function makeRanker(priorities: Array<string | RegExp>): (c: string) => number {
  return (c: string) => {
    const cat = c || '';
    for (let i = 0; i < priorities.length; i++) {
      const p = priorities[i];
      if (typeof p === 'string') {
        if (cat.toLowerCase().includes(p.toLowerCase())) return i;
      } else if (p.test(cat)) {
        return i;
      }
    }
    return priorities.length + 1;
  };
}

function defaultItemCompare(a: MenuLite, b: MenuLite) {
  const ap = a.price == null ? 1 : 0;
  const bp = b.price == null ? 1 : 0;
  if (ap !== bp) return ap - bp; // priced first
  return a.name.localeCompare(b.name, 'ko');
}

export function getBrandRules(brandKey: 'oozy' | 'gate'): BrandMenuRules {
  if (brandKey === 'oozy') {
    const rank = makeRanker([
      '신메뉴',
      'COFFEE', '커피',
      'MATCHA', '말차',
      'TEA', '티',
      'BEVERAGE',
      'DESSERT', '디저트',
    ]);
    return {
      categoryRank: rank,
      itemCompare: defaultItemCompare,
    };
  }
  // gate (카페게이트): "new/추천" 최우선, 나머지는 가나다 순
  const rank = makeRanker([
    'new/추천', '추천', 'new',
  ]);
  return {
    categoryRank: rank,
    itemCompare: defaultItemCompare,
  };
}
