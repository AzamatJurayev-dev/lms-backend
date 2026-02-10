import {
  ConflictException,
  Injectable,
  NotFoundException,
} from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';

@Injectable()
export class CertificatesService {
  constructor(private readonly prisma: PrismaService) {}

  async issueCertificate(dto: {
    studentId: number;
    groupId: number;
    templateId: number;
    companyId?: number | null;
  }) {
    // 1 student + 1 group = 1 certificate
    const exists = await this.prisma.certificate.findFirst({
      where: {
        studentId: dto.studentId,
        groupId: dto.groupId,
      },
    });

    if (exists) {
      throw new ConflictException('Certificate already issued');
    }

    // template tekshirish
    const template = await this.prisma.certificateTemplate.findUnique({
      where: { id: dto.templateId },
    });

    if (!template || !template.isActive) {
      throw new NotFoundException('Template not available');
    }

    // bu yerda keyinroq:
    // HTML -> PDF -> MinIO upload
    const fileUrl = null;

    return this.prisma.certificate.create({
      data: {
        studentId: dto.studentId,
        groupId: dto.groupId,
        templateId: dto.templateId,
        companyId: dto.companyId ?? null,
        fileUrl,
      },
    });
  }

  findAll(companyId?: number | null) {
    return this.prisma.certificate.findMany({
      where: {
        OR: [{ companyId: null }, { companyId }],
      },
      include: {
        student: true,
        group: true,
        template: true,
      },
      orderBy: { issuedAt: 'desc' },
    });
  }

  async findOne(id: number) {
    const cert = await this.prisma.certificate.findUnique({
      where: { id },
      include: {
        student: true,
        group: true,
        template: true,
      },
    });

    if (!cert) {
      throw new NotFoundException('Certificate not found');
    }

    return cert;
  }
}
