import { Client } from '@notionhq/client';

type SyncOrder = {
  customerName: string;
  menuName: string | null;
  brandKey: 'oozy' | 'gate' | null;
  status: 'ordered' | 'passed';
  date: string; // YYYY-MM-DD
};

export class NotionService {
  private client: Client;
  private orderDbId: string;
  private props: {
    customerName: string;
    menuName: string;
    brand: string;
    status: string;
    orderDate: string;
  };

  constructor() {
    this.client = new Client({ auth: process.env.NOTION_TOKEN });
    this.orderDbId = process.env.NOTION_ORDER_DB_ID || '';
    this.props = {
      customerName: process.env.NOTION_PROP_CUSTOMER_NAME || 'customer_name',
      menuName: process.env.NOTION_PROP_MENU_NAME || 'menu_name',
      brand: process.env.NOTION_PROP_BRAND || 'brand',
      status: process.env.NOTION_PROP_STATUS || 'status',
      orderDate: process.env.NOTION_PROP_ORDER_DATE || 'order_date',
    };
  }

  private brandLabel(key: 'oozy' | 'gate' | null): string | undefined {
    if (!key) return undefined;
    if (key === 'oozy') return '우지커피';
    if (key === 'gate') return '카페게이트';
    return undefined;
  }

  async upsertOrder(order: SyncOrder) {
    if (!this.orderDbId) throw new Error('NOTION_ORDER_DB_ID is not set');
    const name = order.customerName;
    const date = order.date;
    const existing = await this.client.databases.query({
      database_id: this.orderDbId,
      filter: {
        and: [
          { property: this.props.customerName, title: { equals: name } },
          { property: this.props.orderDate, date: { equals: date } },
        ],
      },
      page_size: 1,
    });

    const props: Record<string, any> = {
      [this.props.customerName]: { title: [{ text: { content: name } }] },
      [this.props.menuName]: { rich_text: [{ text: { content: order.menuName ?? '' } }] },
      [this.props.status]: { select: { name: order.status } },
      [this.props.orderDate]: { date: { start: date } },
    };
    const brandName = this.brandLabel(order.brandKey);
    if (brandName) props[this.props.brand] = { select: { name: brandName } };

    if (existing.results.length > 0) {
      const pageId = (existing.results[0] as any).id;
      await this.client.pages.update({ page_id: pageId, properties: props });
      return { updated: 1, created: 0 };
    } else {
      await this.client.pages.create({ parent: { database_id: this.orderDbId }, properties: props });
      return { updated: 0, created: 1 };
    }
  }

  async syncOrdersByDate(orders: SyncOrder[]) {
    let created = 0;
    let updated = 0;
    for (const o of orders) {
      const res = await this.upsertOrder(o);
      created += res.created;
      updated += res.updated;
    }
    return { created, updated };
  }

  async deleteOrdersByDate({
    customerName,
    date,
    brandKey,
  }: {
    customerName: string;
    date: string; // YYYY-MM-DD
    brandKey?: 'oozy' | 'gate' | null;
  }) {
    if (!this.orderDbId) throw new Error('NOTION_ORDER_DB_ID is not set');
    const andFilters: any[] = [
      { property: this.props.customerName, title: { equals: customerName } },
      { property: this.props.orderDate, date: { equals: date } },
    ];
    const brandName = this.brandLabel(brandKey ?? null);
    if (brandName) andFilters.push({ property: this.props.brand, select: { equals: brandName } });

    const existing = await this.client.databases.query({
      database_id: this.orderDbId,
      filter: { and: andFilters },
    });

    let archived = 0;
    for (const page of existing.results as any[]) {
      await this.client.pages.update({ page_id: page.id, archived: true });
      archived += 1;
    }
    return { archived };
  }

  async fetchOrdersByDate(date: string) {
    if (!this.orderDbId) throw new Error('NOTION_ORDER_DB_ID is not set');
    const resp = await this.client.databases.query({
      database_id: this.orderDbId,
      filter: { property: this.props.orderDate, date: { equals: date } },
      page_size: 100,
    });
    const brandKeyFrom = (name?: string | null): 'oozy' | 'gate' | null => {
      if (!name) return null;
      if (name.includes('우지')) return 'oozy';
      if (name.includes('게이트') || name.includes('카페게이트')) return 'gate';
      return null;
    };
    // Map results into lightweight client shape
    const items = (resp.results as any[]).map((page) => {
      const props: any = page.properties || {};
      const getTitle = (p: any) => p?.title?.[0]?.plain_text ?? '';
      const getText = (p: any) => p?.rich_text?.[0]?.plain_text ?? '';
      const getSelect = (p: any) => p?.select?.name ?? '';
      const getDate = (p: any) => p?.date?.start ?? page.created_time;
      const name = getTitle(props[this.props.customerName]);
      const menu = getText(props[this.props.menuName]) || null;
      const status = getSelect(props[this.props.status]) as 'ordered' | 'passed';
      const brandName = getSelect(props[this.props.brand]);
      const brandKey = brandKeyFrom(brandName);
      const timestamp = getDate(props[this.props.orderDate]);
      return { name, menu, status, brandKey, timestamp };
    });
    return { orders: items };
  }
}
