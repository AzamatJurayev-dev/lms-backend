import { Injectable, NotFoundException } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';
import PDFDocument = require('pdfkit');

@Injectable()
export class CertificatesService {
  constructor(private readonly prisma: PrismaService) {}

  async issueCertificate(dto: { studentId: number; groupId: number }) {
    const { studentId, groupId } = dto;

    const group = await this.prisma.group.findUnique({
      where: { id: groupId },
      include: {
        students: true,
      },
    });

    if (!group) {
      throw new NotFoundException('Group not found');
    }

    const isInGroup = group.students.some((s) => s.id === studentId);
    if (!isInGroup) {
      throw new NotFoundException('Student is not in this group');
    }

    const template = await this.prisma.certificateTemplate.findFirst({
      where: {
        isActive: true,
      },
    });

    if (!template) {
      throw new NotFoundException('Certificate template not found');
    }

    return this.prisma.certificate.create({
      data: {
        studentId,
        groupId,
        templateId: template.id,
      },
    });
  }

  async generateCertificatePdf(certificateId: number): Promise<Buffer> {
    const cert = await this.prisma.certificate.findUnique({
      where: { id: certificateId },
      include: {
        student: {
          include: {
            user: true,
          },
        },
        group: true,
        template: true,
        company: true,
      },
    });

    if (!cert) {
      throw new NotFoundException('Certificate not found');
    }

    const fullName = [
      cert.student.user.firstName,
      cert.student.user.lastName,
      cert.student.user.middleName,
    ]
      .filter(Boolean)
      .join(' ');

    const companyName = cert.company?.name ?? '';
    const courseName = cert.group.name;

    const doc = new PDFDocument({ size: 'A4', margin: 50 });
    const chunks: Buffer[] = [];

    doc.on('data', (chunk) => chunks.push(chunk));

    doc.fontSize(20).text(companyName, { align: 'center' });
    doc.moveDown(2);
    doc
      .fontSize(26)
      .text('Certificate of Completion', { align: 'center' })
      .moveDown(2);

    doc
      .fontSize(14)
      .text('This certificate is proudly presented to', { align: 'center' })
      .moveDown(1);

    doc.fontSize(22).text(fullName, { align: 'center' }).moveDown(2);

    doc
      .fontSize(14)
      .text(
        `for successfully completing the course "${courseName}".`,
        { align: 'center' },
      )
      .moveDown(4);

    doc.fontSize(12).text(`Date: ${cert.issuedAt.toDateString()}`);

    doc.end();

    await new Promise<void>((resolve) => {
      doc.on('end', () => resolve());
    });

    return Buffer.concat(chunks);
  }
}

