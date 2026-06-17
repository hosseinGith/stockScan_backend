import {
 Controller,
 Get,
 Post,
 Body,
 Param,
 Delete,
 UseInterceptors,
 UploadedFile,
 BadRequestException,
 Res,
 Req,
} from '@nestjs/common';
import { FilesService } from './files.service';
import { FileValidationFilter } from './filters/file-validation.filter';
import type { Request, Response } from 'express';
import { FileInterceptor } from '@nestjs/platform-express';

@Controller('files')
export class FilesController {
 constructor(private readonly filesService: FilesService) {}

 @Post()
 @UseInterceptors(
  FileInterceptor('file', FileValidationFilter.createMulterOptions()),
 )
 async uploadSingle(
  @UploadedFile() file: Express.Multer.File,
  @Req() request: Request,
  @Body('subFolder') subFolder?: string,
 ) {
  if (!file) throw new BadRequestException('فایلی برای آپلود وجود ندارد');
  return this.filesService.create(file, request.user.id, subFolder);
 }
 @Get(':filename')
 async serveFile(@Param('filename') filename: string, @Res() res: Response) {
  try {
   const { stream, mimetype, size } =
    await this.filesService.getFileStream(filename);

   res.setHeader('Content-Type', mimetype);
   res.setHeader('Content-Length', size);
   res.setHeader('Cache-Control', 'public, max-age=31536000');

   stream.pipe(res);
  } catch (error: any) {
   // eslint-disable-next-line @typescript-eslint/no-unsafe-member-access
   if (error.status === 404) {
    res.status(404).send('فایل یافت نشد');
   } else {
    res.status(500).send('خطا در نمایش فایل');
   }
  }
 }
 @Get('info/:filename')
 async getFileInfo(@Param('filename') filename: string) {
  return this.filesService.getFileInfo(filename);
 }

 @Delete(':filename')
 remove(@Param('filename') filename: string) {
  return this.filesService.remove(filename);
 }
}
