import type { Metadata } from 'next';
import Header from '@/components/layout/header/header';
import Footer from '@/components/layout/footer/footer';
import './globals.css';

export const metadata: Metadata = {
  title: 'Face Swap - Tạo Video Face Swap',
  description: 'Tạo video face swap chuyên nghiệp',
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="vi">
      <body className="min-h-screen flex flex-col">
        <Header />
        <main className="flex-1">{children}</main>
        <Footer />
      </body>
    </html>
  );
}

