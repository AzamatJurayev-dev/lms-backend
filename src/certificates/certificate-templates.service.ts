import { Injectable, NotFoundException } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';

@Injectable()
export class CertificateTemplatesService {
  constructor(private readonly prisma: PrismaService) {}

  create(dto: {
    name: string;
    html?: string;
    isActive?: boolean;
    companyId?: number | null;
  }) {
    return this.prisma.certificateTemplate.create({
      data: dto,
    });
  }

  findAll(companyId?: number | null) {
    return this.prisma.certificateTemplate.findMany({
      where: {
        OR: [
          { companyId: null }, // global (superadmin)
          { companyId },
        ],
      },
      orderBy: { createdAt: 'desc' },
    });
  }

  async findOne(id: number) {
    const template = await this.prisma.certificateTemplate.findUnique({
      where: { id },
    });

    if (!template) {
      throw new NotFoundException('Template not found');
    }

    return template;
  }

  async update(id: number, dto: any) {
    await this.findOne(id);

    return this.prisma.certificateTemplate.update({
      where: { id },
      data: dto,
    });
  }

  async disable(id: number) {
    await this.findOne(id);

    return this.prisma.certificateTemplate.update({
      where: { id },
      data: { isActive: false },
    });
  }
}
