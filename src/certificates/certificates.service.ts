import { Injectable, NotFoundException } from '@nestjs/common';
import { CreateCertificateDto } from './dto/create-certificate.dto';
import * as puppeteer from 'puppeteer';
import { PrismaService } from '../prisma/prisma.service';
import { CertificateTemplateType } from '@prisma/client';

@Injectable()
export class CertificateService {
  constructor(private prisma: PrismaService) {}

  private generateCertificateNumber() {
    const year = new Date().getFullYear();
    return `CERT-${year}-${Date.now()}`;
  }

  async findAll(query: any) {
    const { page = 1, limit = 10 } = query;

    const skip = (page - 1) * limit;

    const [data, total] = await Promise.all([
      this.prisma.certificate.findMany({
        skip,
        take: limit,
        orderBy: { createdAt: 'desc' },
        include: {
          template: true,
        },
      }),
      this.prisma.certificate.count(),
    ]);

    return {
      data,
      meta: {
        total,
        page,
        limit,
        totalPages: Math.ceil(total / limit),
      },
    };
  }

  async create(dto: CreateCertificateDto) {
    const template = await this.prisma.certificateTemplate.findUnique({
      where: { id: dto.templateId },
    });

    if (!template) {
      throw new NotFoundException('Template not found');
    }

    return this.prisma.certificate.create({
      data: {
        fullName: dto.fullName,
        courseName: dto.courseName,
        certificateNo: this.generateCertificateNumber(),
        templateId: template.id,
      },
      include: { template: true },
    });
  }

  private generateHtml(certificate: any) {
    const BASE_URL = process.env.APP_BASE_URL;

    const backgroundUrl = `${BASE_URL}/templates/${
      certificate.template.type === CertificateTemplateType.CLASSIC
        ? 'template1.png'
        : 'template2.png'
    }`;

    if (certificate.template.type === CertificateTemplateType.CLASSIC) {
      return this.generateClassicHtml(certificate, backgroundUrl);
    }

    return this.generateModernHtml(certificate, backgroundUrl);
  }

  private generateClassicHtml(certificate: any, bg: string) {
    return `
    <html lang="en">
      <body style="
        margin:0;
        width:1200px;
        height:850px;
        background:url('${bg}') no-repeat center;
        background-size:cover;
        position:relative;
        font-family: Georgia, serif;
      ">

        <div style="
          position:absolute;
          top:360px;
          left:50%;
          transform:translateX(-50%);
          font-size:48px;
          font-weight:bold;
        ">
          ${certificate.fullName}
        </div>

        <div style="
          position:absolute;
          top:430px;
          left:50%;
          transform:translateX(-50%);
          font-size:24px;
        ">
          ${certificate.courseName}
        </div>

        <div style="
          position:absolute;
          bottom:100px;
          left:120px;
          font-size:16px;
        ">
          ${new Date(certificate.issuedAt).toLocaleDateString()}
        </div>

        <div style="
          position:absolute;
          bottom:100px;
          right:120px;
          font-size:14px;
        ">
          ${certificate.certificateNo}
        </div>

      </body>
    </html>
    `;
  }

  private generateModernHtml(certificate: any, bg: string) {
    return `
    <html lang="en">
      <body style="
        margin:0;
        width:1200px;
        height:850px;
        background:url('${bg}') no-repeat center;
        background-size:cover;
        position:relative;
        font-family: Arial, sans-serif;
        color:white;
      ">

        <div style="
          position:absolute;
          top:320px;
          left:50%;
          transform:translateX(-50%);
          font-size:52px;
          font-weight:bold;
        ">
          ${certificate.fullName}
        </div>

        <div style="
          position:absolute;
          top:400px;
          left:50%;
          transform:translateX(-50%);
          font-size:26px;
        ">
          ${certificate.courseName}
        </div>

        <div style="
          position:absolute;
          bottom:90px;
          left:120px;
          font-size:16px;
        ">
          ${new Date(certificate.issuedAt).toLocaleDateString()}
        </div>

        <div style="
          position:absolute;
          bottom:90px;
          right:120px;
          font-size:14px;
        ">
          ${certificate.certificateNo}
        </div>

      </body>
    </html>
    `;
  }

  async generatePdf(id: number) {
    const certificate = await this.prisma.certificate.findUnique({
      where: { id },
      include: { template: true },
    });

    if (!certificate) {
      throw new NotFoundException('Certificate not found');
    }

    const html = this.generateHtml(certificate);

    const browser = await puppeteer.launch({
      args: ['--no-sandbox'],
    });

    const page = await browser.newPage();
    await page.setContent(html, { waitUntil: 'networkidle0' });

    const pdf = await page.pdf({
      width: '1200px',
      height: '850px',
      printBackground: true,
    });

    await browser.close();
    return pdf;
  }

  async verify(certificateNo: string) {
    return this.prisma.certificate.findUnique({
      where: { certificateNo },
      include: { template: true },
    });
  }
}
