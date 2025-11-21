import { FileInterceptor } from '@nestjs/platform-express';
import { diskStorage } from 'multer';
import { extname } from 'path';
import { v4 as uuidv4 } from 'uuid';
import { BadRequestException } from '@nestjs/common';

export function FileUploadInterceptor() {
  const uploadsPath = 'uploads';
  const maxFileSize = 5242880; // 5MB
  const allowedMimeTypes = ['image/jpeg', 'image/png', 'image/jpg'];

  return FileInterceptor('image', {
    storage: diskStorage({
      destination: (req, file, cb) => {
        cb(null, uploadsPath);
      },
      filename: (req, file, cb) => {
        const uniqueName = `${uuidv4()}${extname(file.originalname)}`;
        cb(null, uniqueName);
      },
    }),
    limits: {
      fileSize: maxFileSize,
    },
    fileFilter: (req, file, cb) => {
      if (allowedMimeTypes.includes(file.mimetype)) {
        cb(null, true);
      } else {
        cb(new BadRequestException('Invalid file type'), false);
      }
    },
  });
}
