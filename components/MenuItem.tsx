import type { Menu } from '@/types/index';

export default function MenuItem({ item }: { item: Menu }) {
  return (
    <button className="w-full rounded-md border p-3 text-left hover:bg-gray-50">
      <div className="font-medium">{item.name}</div>
      <div className="text-sm text-gray-500">{item.price === null ? '-' : `${item.price.toLocaleString()}원`}</div>
    </button>
  );
}
