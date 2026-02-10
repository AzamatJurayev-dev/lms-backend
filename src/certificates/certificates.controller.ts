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

@Controller('certificates')
@UseGuards(JwtAuthGuard)
export class CertificatesController {
  constructor(private readonly service: CertificatesService) {}

  @Post()
  issue(
    @Body()
    dto: {
      studentId: number;
      groupId: number;
      templateId: number;
    },
    @CurrentUser() user: any,
  ) {
    return this.service.issueCertificate({
      ...dto,
      companyId: user.companyId ?? null,
    });
  }

  @Get()
  findAll(@CurrentUser() user: any) {
    return this.service.findAll(user.companyId);
  }

  @Get(':id')
  findOne(@Param('id', ParseIntPipe) id: number) {
    return this.service.findOne(id);
  }
}
