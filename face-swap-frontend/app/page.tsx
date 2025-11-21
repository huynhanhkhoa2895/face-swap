import Link from 'next/link';
import Button from '@/components/ui/button/button';

export default function HomePage() {
  return (
    <main className="min-h-screen bg-gradient-to-br from-purple-600 via-pink-600 to-purple-800">
      {/* Hero Section */}
      <section className="container mx-auto px-4 pt-20 pb-16 text-center">
        <h1 className="text-5xl md:text-7xl font-bold text-white mb-6">
          Biến Bạn Thành<br />Siêu Anh Hùng Trong Game
        </h1>
        <p className="text-xl md:text-2xl text-white/90 mb-8 max-w-2xl mx-auto">
          Upload ảnh, chọn đối thủ, tạo video chỉ trong 1 phút
        </p>
        <Link href="/create">
          <Button size="lg" className="text-lg px-8 py-6">
            Bắt Đầu Ngay
          </Button>
        </Link>
      </section>

      {/* How It Works */}
      <section className="container mx-auto px-4 py-16">
        <h2 className="text-3xl font-bold text-white text-center mb-12">
          Cách Thức Hoạt Động
        </h2>
        <div className="grid md:grid-cols-3 gap-8 max-w-4xl mx-auto">
          <div className="bg-white/10 backdrop-blur-sm rounded-lg p-6 text-center">
            <div className="text-4xl mb-4">1️⃣</div>
            <h3 className="text-xl font-bold text-white mb-2">Upload Ảnh</h3>
            <p className="text-white/80">
              Chọn ảnh khuôn mặt của bạn để swap vào video
            </p>
          </div>
          <div className="bg-white/10 backdrop-blur-sm rounded-lg p-6 text-center">
            <div className="text-4xl mb-4">2️⃣</div>
            <h3 className="text-xl font-bold text-white mb-2">Chọn Template</h3>
            <p className="text-white/80">
              Chọn nhân vật và template video bạn muốn
            </p>
          </div>
          <div className="bg-white/10 backdrop-blur-sm rounded-lg p-6 text-center">
            <div className="text-4xl mb-4">3️⃣</div>
            <h3 className="text-xl font-bold text-white mb-2">Nhận Video</h3>
            <p className="text-white/80">
              Chờ xử lý và tải video đã hoàn thành về
            </p>
          </div>
        </div>
      </section>
    </main>
  );
}

