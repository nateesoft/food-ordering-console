import type { Metadata } from 'next';
import './globals.css';
import ServiceStatusIndicator from '@/components/ServiceStatusIndicator';

export const metadata: Metadata = {
  title: 'Food Ordering Console',
  description: 'ระบบจัดการร้านอาหาร - Food Ordering Console',
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="th">
      <body className="antialiased">
        {children}
        <ServiceStatusIndicator />
      </body>
    </html>
  );
}
