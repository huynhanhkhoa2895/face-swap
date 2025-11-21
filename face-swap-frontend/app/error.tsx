'use client';

import { useEffect } from 'react';
import Button from '@/components/ui/button/button';

export default function Error({
  error,
  reset,
}: {
  error: Error & { digest?: string };
  reset: () => void;
}) {
  useEffect(() => {
    console.error(error);
  }, [error]);

  return (
    <div className="min-h-screen flex items-center justify-center bg-gray-50">
      <div className="text-center">
        <h2 className="text-2xl font-bold text-red-600 mb-4">
          Đã xảy ra lỗi!
        </h2>
        <p className="text-gray-600 mb-8">{error.message}</p>
        <Button onClick={reset}>Thử lại</Button>
      </div>
    </div>
  );
}

