export interface Menu {
  id: string;
  brand: 'OOZY COFFEE' | '카페게이트';
  category: string;
  name: string;
  price: number | null;
  image?: string;
  options?: {
    temperature?: 'HOT' | 'ICE';
    size?: string;
  };
  notionProperties: {
    createdTime: string;
    lastEditedTime: string;
  };
}

export interface Order {
  id: string;
  customerName: string;
  menuId: string | null;
  menuName: string;
  brand: string;
  timestamp: Date;
  status: 'ordered' | 'passed';
  notionProperties: {
    createdTime: string;
    lastEditedTime: string;
  };
}

export interface NotionMenuDatabase {
  databaseId: string;
  properties: {
    brand: { select: { name: string } };
    category: { select: { name: string } };
    item_name_ko: { title: { plain_text: string } };
    price_krw: { number: number | null };
    image: { files: Array<{ file: { url: string } }> };
    options_json: { rich_text: { plain_text: string } };
  };
}

export interface NotionOrderDatabase {
  databaseId: string;
  properties: {
    customer_name: { title: { plain_text: string } };
    menu_id: { relation: { id: string } } | null;
    menu_name: { rich_text: { plain_text: string } };
    brand: { select: { name: string } };
    status: { select: { name: 'ordered' | 'passed' } };
    order_date: { date: { start: string } };
  };
}

export interface OrderState {
  orders: Order[];
  totalMembers: number;
  orderedCount: number;
  passedCount: number;
}

export interface TeamSettings {
  totalMembers: number;
  createdAt: Date;
  updatedAt: Date;
}

