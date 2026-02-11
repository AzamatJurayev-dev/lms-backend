import {
  BadRequestException,
  ForbiddenException,
  Injectable,
  NotFoundException,
} from '@nestjs/common';
import { MinioService } from '../minio/minio.service';
import { PrismaService } from '../prisma/prisma.service';
import { v4 as uuid } from 'uuid';
import { paginate } from '../common/pagination/pagination.helper';

@Injectable()
export class FilesService {
  constructor(
    private readonly minioService: MinioService,
    private readonly prisma: PrismaService,
  ) {}

  async upload(file: Express.Multer.File, user: any) {
    if (!file) {
      throw new BadRequestException('File is required');
    }

    const ext = file.originalname.split('.').pop();
    const filename = `${uuid()}.${ext}`;
    const bucket = process.env.MINIO_BUCKET!;

    let path: string;

    if (user.role === 'super_admin') {
      path = `system/${filename}`;
    } else {
      if (!user.companyId) {
        throw new BadRequestException('User has no company');
      }
      path = `company/${user.companyId}/${filename}`;
    }

    await this.minioService.upload(bucket, path, file.buffer, file.mimetype);

    return this.prisma.file.create({
      data: {
        name: filename,
        original: file.originalname,
        mimeType: file.mimetype,
        size: file.size,
        path,
        bucket,
        companyId: user.companyId ?? null,
        uploadedBy: {
          connect: {
            id: user.id,
          },
        },
      },
    });
  }

  async getAll(user: any, page = 1, limit = 10) {
    const skip = (page - 1) * limit;

    const where =
      user.role === 'super_admin' ? {} : { companyId: user.companyId };

    const [items, total] = await this.prisma.$transaction([
      this.prisma.file.findMany({
        where,
        orderBy: { createdAt: 'desc' },
        skip,
        take: limit,
      }),
      this.prisma.file.count({ where }),
    ]);

    const thumbItems = await Promise.all(
      items.map(async (file) => ({
        ...file,
        thumbnailUrl: await this.minioService.getPresignedUrl(
          file.bucket,
          file.path,
          60 * 5,
        ),
      })),
    );

    return paginate(thumbItems, page, limit, total);
  }

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

  async getPreviewUrl(id: number, user: any): Promise<string> {
    const file = await this.prisma.file.findUnique({
      where: { id },
    });

    if (!file) {
      throw new NotFoundException('File not found');
    }
    if (user.role !== 'super_admin' && file.companyId !== user.companyId) {
      throw new ForbiddenException();
    }
    return this.minioService.getPresignedUrl(file.bucket, file.path, 60 * 5);
  }
}
