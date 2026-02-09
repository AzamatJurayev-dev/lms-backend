import {
  Body,
  Controller,
  Get,
  Param,
  ParseIntPipe,
  Post,
  UseGuards,
} from '@nestjs/common';
import { CertificatesService } from './certificates.service';
import { JwtAuthGuard } from '../auth/jwt-auth.guard';
import { CurrentUser } from '../auth/current-user';
import { StreamableFile } from '@nestjs/common';

@UseGuards(JwtAuthGuard)
@Controller('certificates')
export class CertificatesController {
  constructor(private readonly certificatesService: CertificatesService) {}

  @Post()
  issue(
    @CurrentUser() user: any,
    @Body() dto: { studentId: number; groupId: number },
  ) {
    // user hozircha faqat audit uchun ishlatilmayapti
    return this.certificatesService.issueCertificate(dto);
  }

  @Get(':id/pdf')
  async downloadPdf(
    @Param('id', ParseIntPipe) id: number,
  ): Promise<StreamableFile> {
    const buffer = await this.certificatesService.generateCertificatePdf(id);

    return new StreamableFile(buffer, {
      type: 'application/pdf',
      disposition: `attachment; filename="certificate-${id}.pdf"`,
    });
  }
}

