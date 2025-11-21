import Link from 'next/link';
import Button from '@/components/ui/button/button';

export default function NotFound() {
  return (
    <div className="min-h-screen flex items-center justify-center bg-gray-50">
      <div className="text-center">
        <h2 className="text-4xl font-bold text-gray-800 mb-4">404</h2>
        <p className="text-gray-600 mb-8">Trang không tồn tại</p>
        <Link href="/">
          <Button>Về trang chủ</Button>
        </Link>
      </div>
    </div>
  );
}

