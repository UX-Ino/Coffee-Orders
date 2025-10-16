import './globals.css';
import type { ReactNode } from 'react';
import { OrderProvider } from '@/lib/state/OrderContext';

export default function RootLayout({ children }: { children: ReactNode }) {
  return (
    <html lang="ko">
      <body className="min-h-screen bg-sbx-surface text-sbx-ink">
        <OrderProvider>
          <main className="mx-auto max-w-5xl p-4">{children}</main>
        </OrderProvider>
      </body>
    </html>
  );
}
