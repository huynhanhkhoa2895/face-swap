'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import ImageUploader from '@/components/face-swap/image-uploader/image-uploader';
import GenderSelector from '@/components/face-swap/gender-selector/gender-selector';
import CharacterSelector from '@/components/face-swap/character-selector/character-selector';
import TemplateSelector from '@/components/face-swap/template-selector/template-selector';
import { useFaceSwap } from '@/lib/hooks/use-face-swap';
import { useFaceSwapStore } from '@/lib/store/face-swap-store';
import Button from '@/components/ui/button/button';
import Card from '@/components/ui/card/card';

export default function CreatePage() {
  const router = useRouter();
  const [step, setStep] = useState(1);
  const { uploadAndProcess, isUploading } = useFaceSwap();
  const { selectedImage, selectedTemplate } = useFaceSwapStore();

  const handleSubmit = async () => {
    try {
      const jobId = await uploadAndProcess();
      router.push(`/result/${jobId}`);
    } catch (error) {
      console.error('Upload failed:', error);
    }
  };

  return (
    <main className="min-h-screen bg-gray-50 py-8">
      <div className="container mx-auto px-4 max-w-4xl">
        {/* Progress Steps */}
        <div className="mb-8">
          <div className="flex items-center justify-between">
            <div
              className={`flex-1 text-center ${
                step >= 1 ? 'text-primary-600' : 'text-gray-400'
              }`}
            >
              <div
                className={`w-10 h-10 mx-auto rounded-full flex items-center justify-center ${
                  step >= 1 ? 'bg-primary-600 text-white' : 'bg-gray-200'
                }`}
              >
                1
              </div>
              <p className="mt-2 text-sm font-medium">Upload Ảnh</p>
            </div>
            <div className="flex-1 h-1 mx-4 bg-gray-200">
              <div
                className={`h-1 ${
                  step >= 2 ? 'bg-primary-600' : 'bg-gray-200'
                }`}
                style={{ width: step >= 2 ? '100%' : '0%' }}
              />
            </div>
            <div
              className={`flex-1 text-center ${
                step >= 2 ? 'text-primary-600' : 'text-gray-400'
              }`}
            >
              <div
                className={`w-10 h-10 mx-auto rounded-full flex items-center justify-center ${
                  step >= 2 ? 'bg-primary-600 text-white' : 'bg-gray-200'
                }`}
              >
                2
              </div>
              <p className="mt-2 text-sm font-medium">Chọn Options</p>
            </div>
            <div className="flex-1 h-1 mx-4 bg-gray-200">
              <div
                className={`h-1 ${
                  step >= 3 ? 'bg-primary-600' : 'bg-gray-200'
                }`}
                style={{ width: step >= 3 ? '100%' : '0%' }}
              />
            </div>
            <div
              className={`flex-1 text-center ${
                step >= 3 ? 'text-primary-600' : 'text-gray-400'
              }`}
            >
              <div
                className={`w-10 h-10 mx-auto rounded-full flex items-center justify-center ${
                  step >= 3 ? 'bg-primary-600 text-white' : 'bg-gray-200'
                }`}
              >
                3
              </div>
              <p className="mt-2 text-sm font-medium">Xác Nhận</p>
            </div>
          </div>
        </div>

        {/* Step Content */}
        {step === 1 && (
          <div>
            <h1 className="text-3xl font-bold mb-6">Upload Ảnh Của Bạn</h1>
            <ImageUploader onNext={() => setStep(2)} />
          </div>
        )}

        {step === 2 && (
          <div>
            <h1 className="text-3xl font-bold mb-6">Chọn Tùy Chọn</h1>
            <GenderSelector />
            <CharacterSelector />
            <TemplateSelector />
            <div className="flex gap-4 mt-8">
              <Button variant="outline" onClick={() => setStep(1)}>
                Quay lại
              </Button>
              <Button
                onClick={() => setStep(3)}
                disabled={!selectedTemplate}
              >
                Tiếp tục
              </Button>
            </div>
          </div>
        )}

        {step === 3 && (
          <div>
            <h1 className="text-3xl font-bold mb-6">Xác Nhận</h1>
            <Card className="p-6 mb-6">
              <h2 className="text-xl font-bold mb-4">Thông tin đã chọn:</h2>
              {selectedImage && (
                <div className="mb-4">
                  <p className="font-semibold">Ảnh đã chọn:</p>
                  <img
                    src={URL.createObjectURL(selectedImage)}
                    alt="Selected"
                    className="mt-2 w-32 h-32 object-cover rounded-lg"
                  />
                </div>
              )}
              {selectedTemplate && (
                <div>
                  <p className="font-semibold">Template: {selectedTemplate.name}</p>
                </div>
              )}
            </Card>
            <div className="flex gap-4">
              <Button variant="outline" onClick={() => setStep(2)}>
                Quay lại
              </Button>
              <Button onClick={handleSubmit} disabled={isUploading}>
                {isUploading ? 'Đang xử lý...' : 'Tạo Video'}
              </Button>
            </div>
          </div>
        )}
      </div>
    </main>
  );
}

