import {
 BadRequestException,
 Injectable,
 NotFoundException,
} from '@nestjs/common';
import { extname, join, resolve } from 'path';
import {
 createReadStream,
 createWriteStream,
 existsSync,
 mkdirSync,
 stat,
 Stats,
 unlink,
} from 'fs';
import { randomUUID } from 'crypto';
import Stream, { pipeline, Readable } from 'stream';
import { FileEntity } from './entities/file.entity';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { CryptoService } from '../crypto/crypto.service';
import { UsersService } from '../users/users.service';

@Injectable()
export class FilesService {
 private readonly uploadDir = 'uploads';
 private readonly allowedExtensions = [
  '.jpg',
  '.jpeg',
  '.png',
  '.gif',
  '.webp',
  '.svg',
  '.pdf',
  '.doc',
  '.docx',
  '.xls',
  '.xlsx',
  '.txt',
 ];
 private readonly maxFileSize = 5 * 1024 * 1024; // 5MB

 constructor(
  @InjectRepository(FileEntity)
  private readonly fileEntity: Repository<FileEntity>,
  private readonly cryptoService: CryptoService,
  private readonly users: UsersService,
 ) {
  this.ensureUploadDirectory();
 }

 async create(file: Express.Multer.File, userId: string, subFolder?: string) {
  if (!file) {
   throw new BadRequestException('فایلی برای آپلود وجود ندارد');
  }

  // اعتبارسنجی
  this.validateFile(file);

  const folder = subFolder || this.determineSubFolder(file.mimetype);
  const filename = this.generateFilename(file.originalname);
  const filePath = this.getFilePath(filename, folder);
  const fileUrl = this.getFileUrl(filename, folder);
  const query = this.fileEntity.manager.connection.createQueryRunner();
  await query.connect();
  await query.startTransaction();
  const user = await this.users.findOne(userId);

  try {
   const dir = join(resolve(process.cwd(), this.uploadDir), folder);
   if (!existsSync(dir)) {
    mkdirSync(dir, { recursive: true });
   }

   const writeStream = createWriteStream(filePath);

   const readableStream = Readable.from(file.buffer);

   await new Promise((res, rej) =>
    pipeline(readableStream, writeStream, (err) =>
     err ? rej(err) : res(null),
    ),
   );
   await query.manager.save(
    FileEntity,
    query.manager.create(FileEntity, {
     extension: extname(file.originalname),
     fileName: filename,
     folder,
     originalName: this.cryptoService.hashForSearch(file.originalname),
     url: fileUrl,
     path: filePath,
     size: file.size,
     uploadedBy: user,
     mimeType: file.mimetype,
    }),
   );
   await query.commitTransaction();
   return {
    success: true,
    file: {
     id: randomUUID(),
     filename,
     originalName: file.originalname,
     url: fileUrl,
     size: file.size,
     mimetype: file.mimetype,
     createdAt: new Date(),
    },
    message: 'فایل با موفقیت آپلود شد',
   };
  } catch {
   await query.rollbackTransaction();
   throw new BadRequestException('خطا در ذخیره فایل');
  } finally {
   await query.release();
  }
 }
 async getFileStream(
  filename: string,
 ): Promise<{ stream: Stream; mimetype: string; size: number }> {
  const info = await this.getFileInfo(filename);

  if (!info.exists) {
   throw new NotFoundException('فایل مورد نظر یافت نشد');
  }

  const extension = extname(filename).toLowerCase();
  const mimetypeMap: Record<string, string> = {
   '.jpg': 'image/jpeg',
   '.jpeg': 'image/jpeg',
   '.png': 'image/png',
   '.gif': 'image/gif',
   '.webp': 'image/webp',
   '.svg': 'image/svg+xml',
   '.pdf': 'application/pdf',
   '.doc': 'application/msword',
   '.docx':
    'application/vnd.openxmlformats-officedocument.wordprocessingml.document',
   '.xls': 'application/vnd.ms-excel',
   '.xlsx': 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet',
   '.txt': 'text/plain',
  };

  return {
   stream: createReadStream(info.path),
   mimetype: mimetypeMap[extension] || 'application/octet-stream',
   size: info.size,
  };
 }
 async getFileInfo(
  filename: string,
 ): Promise<{ exists: boolean; path: string; size: number }> {
  const subDirs = ['images', 'documents', 'temporary'];

  for (const subDir of subDirs) {
   const filePath = this.getFilePath(filename, subDir);
   if (existsSync(filePath)) {
    const stats: Stats = await new Promise((res, rej) =>
     stat(filePath, (err, stats) => (!err ? res(stats) : rej(err))),
    );
    return {
     exists: true,
     path: filePath,
     size: stats.size,
    };
   }
  }

  return {
   exists: false,
   path: '',
   size: 0,
  };
 }
 async remove(filename: string) {
  const subDirs = ['images', 'documents', 'temporary'];

  for (const subDir of subDirs) {
   const filePath = this.getFilePath(filename, subDir);
   if (existsSync(filePath)) {
    try {
     await new Promise((res, rej) =>
      unlink(filePath, (err) => (!err ? res(null) : rej(err))),
     );

     return {
      success: true,
      message: 'فایل با موفقیت حذف شد',
     };
    } catch {
     throw new BadRequestException('خطا در حذف فایل');
    }
   }
  }

  throw new NotFoundException('فایل مورد نظر یافت نشد');
 }
 private ensureUploadDirectory(): void {
  const uploadPath = resolve(process.cwd(), this.uploadDir);
  if (!existsSync(uploadPath)) {
   mkdirSync(uploadPath, { recursive: true });
  }
  const subDirs = ['images', 'documents', 'temporary'];
  subDirs.forEach((dir) => {
   const path = join(uploadPath, dir);
   if (!existsSync(path)) {
    mkdirSync(path, { recursive: true });
   }
  });
 }
 private generateFilename(originalName: string): string {
  const extension = extname(originalName);
  const randomName = randomUUID();
  return `${randomName}${extension}`;
 }
 private getFileUrl(filename: string, subFolder: string = 'images'): string {
  return `/${this.uploadDir}/${subFolder}/${filename}`;
 }

 private getFilePath(filename: string, subFolder: string = 'images'): string {
  return join(resolve(process.cwd(), this.uploadDir), subFolder, filename);
 }

 private validateFile(file: Express.Multer.File): void {
  if (file.size > this.maxFileSize) {
   throw new BadRequestException(
    `حجم فایل بیشتر از ${this.maxFileSize / 1024 / 1024}MB است`,
   );
  }

  const extension = extname(file.originalname).toLowerCase();
  if (!this.allowedExtensions.includes(extension)) {
   throw new BadRequestException(
    `پسوند فایل مجاز نیست. پسوندهای مجاز: ${this.allowedExtensions.join(', ')}`,
   );
  }
 }
 private determineSubFolder(mimetype: string): string {
  if (mimetype.startsWith('image/')) {
   return 'images';
  } else if (
   mimetype === 'application/pdf' ||
   mimetype === 'application/msword' ||
   mimetype ===
    'application/vnd.openxmlformats-officedocument.wordprocessingml.document' ||
   mimetype === 'application/vnd.ms-excel' ||
   mimetype ===
    'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet'
  ) {
   return 'documents';
  } else {
   return 'temporary';
  }
 }
}
