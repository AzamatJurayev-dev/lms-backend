import {
  Body,
  Controller,
  Get,
  Param,
  ParseIntPipe,
  Patch,
  Post,
  UseGuards,
} from '@nestjs/common';
import { CertificateTemplatesService } from './certificate-templates.service';
import { JwtAuthGuard } from '../auth/jwt-auth.guard';
import { CurrentUser } from '../auth/current-user';

@Controller('certificate-templates')
@UseGuards(JwtAuthGuard)
export class CertificateTemplatesController {
  constructor(private readonly service: CertificateTemplatesService) {}

  @Post()
  create(@Body() dto: any, @CurrentUser() user: any) {
    return this.service.create({
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

  @Patch(':id')
  update(@Param('id', ParseIntPipe) id: number, @Body() dto: any) {
    return this.service.update(id, dto);
  }

  @Patch(':id/disable')
  disable(@Param('id', ParseIntPipe) id: number) {
    return this.service.disable(id);
  }
}
