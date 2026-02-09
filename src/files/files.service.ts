import {
  ForbiddenException,
  Injectable,
  NotFoundException,
} from '@nestjs/common';
import { MinioService } from '../minio/minio.service';
import { PrismaService } from '../prisma/prisma.service';
import { v4 as uuid } from 'uuid';

@Injectable()
export class FilesService {
  constructor(
    private readonly minioService: MinioService,
    private readonly prisma: PrismaService,
  ) {}

  // 📤 UPLOAD
  async upload(file: Express.Multer.File, user: any) {
    const ext = file.originalname.split('.').pop();
    const filename = `${uuid()}.${ext}`;
    const bucket = process.env.MINIO_BUCKET!;
    const path = `company/${user.companyId}/${filename}`;

    await this.minioService.upload(bucket, path, file.buffer, file.mimetype);

    return this.prisma.file.create({
      data: {
        name: filename,
        original: file.originalname,
        mimeType: file.mimetype,
        size: file.size,
        path,
        bucket,
        companyId: user.companyId,
        uploadedBy: user.id,
      },
    });
  }

  async getAll(user: any, page = 1, limit = 10) {
    const skip = (page - 1) * limit;

    const [items, total] = await this.prisma.$transaction([
      this.prisma.file.findMany({
        where: { companyId: user.companyId },
        orderBy: { createdAt: 'desc' },
        skip,
        take: limit,
      }),
      this.prisma.file.count({
        where: { companyId: user.companyId },
      }),
    ]);

    return {
      items,
      meta: {
        page,
        limit,
        total,
        totalPages: Math.ceil(total / limit),
      },
    };
  }

  // 📥 GET FILE
  async getFileStream(fileId: number, user: any) {
    const file = await this.prisma.file.findUnique({
      where: { id: fileId },
    });

    if (!file) {
      throw new NotFoundException('File not found');
    }

    if (file.companyId !== user.companyId) {
      throw new ForbiddenException();
    }

    const data = await this.minioService.get(file.bucket, file.path);

    return {
      file,
      stream: data.Body as NodeJS.ReadableStream,
    };
  }

  // 🗑 DELETE
  async remove(fileId: number, user: any) {
    const file = await this.prisma.file.findUnique({
      where: { id: fileId },
    });

    if (!file) {
      throw new NotFoundException('File not found');
    }

    if (file.companyId !== user.companyId) {
      throw new ForbiddenException();
    }

    await this.minioService.remove(file.bucket, file.path);
    await this.prisma.file.delete({
      where: { id: fileId },
    });

    return { success: true };
  }
}
