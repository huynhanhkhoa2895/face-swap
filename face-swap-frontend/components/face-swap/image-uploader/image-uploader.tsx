'use client';

import { useCallback } from 'react';
import { useDropzone } from 'react-dropzone';
import { useFaceSwapStore } from '@/lib/store/face-swap-store';
import Card from '@/components/ui/card/card';
import './image-uploader.style.scss';

interface ImageUploaderProps {
  onNext?: () => void;
}

export default function ImageUploader({ onNext }: ImageUploaderProps) {
  const { imagePreview, setImage } = useFaceSwapStore();

  const onDrop = useCallback(
    (acceptedFiles: File[]) => {
      if (acceptedFiles.length > 0) {
        setImage(acceptedFiles[0]);
        if (onNext) {
          setTimeout(onNext, 500);
        }
      }
    },
    [setImage, onNext],
  );

  const { getRootProps, getInputProps, isDragActive } = useDropzone({
    onDrop,
    accept: {
      'image/jpeg': ['.jpg', '.jpeg'],
      'image/png': ['.png'],
    },
    maxFiles: 1,
    maxSize: 5 * 1024 * 1024, // 5MB
  });

  return (
    <Card className="image-uploader">
      <div className="image-uploader__content">
        {imagePreview ? (
          <div className="image-uploader__preview">
            <img src={imagePreview} alt="Preview" />
            <button
              className="image-uploader__remove"
              onClick={() => setImage(null)}
            >
              Remove
            </button>
          </div>
        ) : (
          <div
            {...getRootProps()}
            className={`image-uploader__dropzone ${
              isDragActive ? 'image-uploader__dropzone--active' : ''
            }`}
          >
            <input {...getInputProps()} />
            <div className="image-uploader__dropzone-content">
              <svg
                className="image-uploader__icon"
                fill="none"
                stroke="currentColor"
                viewBox="0 0 24 24"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d="M7 16a4 4 0 01-.88-7.903A5 5 0 1115.9 6L16 6a5 5 0 011 9.9M15 13l-3-3m0 0l-3 3m3-3v12"
                />
              </svg>
              <p className="image-uploader__text">
                {isDragActive
                  ? 'Drop your image here'
                  : 'Drag & drop your image here, or click to select'}
              </p>
              <p className="image-uploader__hint">
                Supports JPG, PNG (Max 5MB)
              </p>
            </div>
          </div>
        )}
      </div>
    </Card>
  );
}

