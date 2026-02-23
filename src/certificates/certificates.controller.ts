import { Body, Controller, Get, Param, Post, Query, Res } from '@nestjs/common';
import { CreateCertificateDto } from './dto/create-certificate.dto';
import type { Response } from 'express';
import { CertificateService } from './certificates.service';

@Controller('certificates')
export class CertificateController {
  constructor(private service: CertificateService) {}

  @Post()
  async create(@Body() dto: CreateCertificateDto) {
    return this.service.create(dto);
  }

  @Get()
  async findAll(@Query() query: any) {
    return this.service.findAll(query);
  }

  @Get(':id/pdf')
  async download(@Param('id') id: number, @Res() res: Response) {
    const pdf = await this.service.generatePdf(+id);

    res.set({
      'Content-Type': 'application/pdf',
      'Content-Disposition': `attachment; filename=certificate.pdf`,
    });

    res.send(pdf);
  }

  @Get('verify/:certificateNo')
  async verify(@Param('certificateNo') certificateNo: string) {
    return this.service.verify(certificateNo);
  }
}
