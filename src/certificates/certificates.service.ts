import { Injectable, NotFoundException } from '@nestjs/common';
import { CreateCertificateDto } from './dto/create-certificate.dto';
import * as puppeteer from 'puppeteer';
import { PrismaService } from '../prisma/prisma.service';
import { CertificateTemplateType } from '@prisma/client';
import { paginate } from '../common/pagination/pagination.helper';

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

    return paginate(data, total, page, limit);
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
    if (certificate.template.type === CertificateTemplateType.CLASSIC) {
      return this.generateClassicHtml(certificate);
    }

    return this.generateModernHtml(certificate);
  }

  private generateClassicHtml(certificate: any) {
    return `
  <html lang="en">
    <body style="
      margin:0;
      width:1200px;
      height:850px;
      display:flex;
      justify-content:center;
      align-items:center;
      background:#f8f6f2;
      font-family: 'Georgia', serif;
    ">
      <div style="
        width:1100px;
        height:750px;
        border:8px solid #1e293b;
        padding:60px;
        box-sizing:border-box;
        position:relative;
        text-align:center;
        background:white;
      ">
        
        <h1 style="
          font-size:48px;
          margin-bottom:40px;
          letter-spacing:2px;
        ">
          CERTIFICATE OF COMPLETION
        </h1>

        <p style="font-size:22px;">This certifies that</p>

        <h2 style="
          font-size:56px;
          margin:30px 0;
          font-weight:bold;
          border-bottom:2px solid #000;
          display:inline-block;
          padding:0 20px 10px;
        ">
          ${certificate.fullName}
        </h2>

        <p style="font-size:22px; margin-top:30px;">
          has successfully completed the course
        </p>

        <h3 style="
          font-size:30px;
          margin-top:20px;
          font-weight:600;
        ">
          ${certificate.courseName}
        </h3>

        <div style="
          position:absolute;
          bottom:60px;
          left:80px;
          font-size:18px;
        ">
          ${new Date(certificate.issuedAt).toLocaleDateString()}
        </div>

        <div style="
          position:absolute;
          bottom:60px;
          right:80px;
          font-size:16px;
        ">
          ${certificate.certificateNo}
        </div>

      </div>
    </body>
  </html>
  `;
  }

  private generateModernHtml(certificate: any) {
    return `
  <html lang="en">
    <body style="
      margin:0;
      width:1200px;
      height:850px;
      display:flex;
      justify-content:center;
      align-items:center;
      background:linear-gradient(135deg,#0f172a,#1e3a8a);
      font-family: Arial, sans-serif;
    ">
      <div style="
        width:1050px;
        height:700px;
        background:white;
        border-radius:20px;
        padding:80px;
        box-sizing:border-box;
        text-align:center;
        position:relative;
      ">

        <h1 style="
          font-size:42px;
          margin-bottom:30px;
          color:#1e293b;
        ">
          Certificate
        </h1>

        <p style="font-size:20px; color:#475569;">
          This certificate is proudly presented to
        </p>

        <h2 style="
          font-size:54px;
          margin:40px 0;
          font-weight:800;
          color:#1e3a8a;
        ">
          ${certificate.fullName}
        </h2>

        <p style="font-size:20px; color:#475569;">
          for successfully completing
        </p>

        <h3 style="
          font-size:28px;
          margin-top:20px;
          font-weight:600;
          color:#0f172a;
        ">
          ${certificate.courseName}
        </h3>

        <div style="
          position:absolute;
          bottom:50px;
          left:80px;
          font-size:16px;
          color:#64748b;
        ">
          Issued: ${new Date(certificate.issuedAt).toLocaleDateString()}
        </div>

        <div style="
          position:absolute;
          bottom:50px;
          right:80px;
          font-size:14px;
          color:#64748b;
        ">
          ${certificate.certificateNo}
        </div>

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
