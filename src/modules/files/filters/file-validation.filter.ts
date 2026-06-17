import { BadRequestException } from '@nestjs/common';

export interface FileValidationOptions {
 maxSize?: number; //byte
 allowedMimeTypes?: string[];
 allowedExtensions?: string[];
}

export class FileValidationFilter {
 private static readonly DEFAULT_MAX_SIZE = 5 * 1024 * 1024;
 private static readonly DEFAULT_ALLOWED_MIME_TYPES = [
  'image/jpeg',
  'image/png',
  'image/gif',
  'image/webp',
  'image/svg+xml',
  'application/pdf',
  'application/msword',
  'application/vnd.openxmlformats-officedocument.wordprocessingml.document',
  'application/vnd.ms-excel',
  'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet',
  'text/plain',
 ];

 static validate(
  file: Express.Multer.File,
  options: FileValidationOptions = {},
 ): void {
  const maxSize = options.maxSize || this.DEFAULT_MAX_SIZE;
  const allowedMimeTypes =
   options.allowedMimeTypes || this.DEFAULT_ALLOWED_MIME_TYPES;

  if (file.size > maxSize) {
   throw new BadRequestException(
    `حجم فایل بیشتر از حد مجاز است. حداکثر حجم: ${maxSize / 1024 / 1024}MB`,
   );
  }

  if (!allowedMimeTypes.includes(file.mimetype)) {
   throw new BadRequestException(
    `نوع فایل مجاز نیست. انواع مجاز: ${allowedMimeTypes.join(', ')}`,
   );
  }
 }

 static createMulterOptions(options: FileValidationOptions = {}) {
  const maxSize = options.maxSize || this.DEFAULT_MAX_SIZE;
  const allowedMimeTypes =
   options.allowedMimeTypes || this.DEFAULT_ALLOWED_MIME_TYPES;

  return {
   limits: {
    fileSize: maxSize,
   },
   fileFilter: (_, file: Express.Multer.File, cb: (...arg: any) => void) => {
    if (allowedMimeTypes.includes(file.mimetype)) {
     cb(null, true);
    } else {
     cb(
      new BadRequestException(
       `نوع فایل مجاز نیست. انواع مجاز: ${allowedMimeTypes.join(', ')}`,
      ),
      false,
     );
    }
   },
  };
 }
}
