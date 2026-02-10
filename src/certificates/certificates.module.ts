import { Module } from '@nestjs/common';
import { PrismaModule } from '../prisma/prisma.module';
import { CertificateTemplatesService } from './certificate-templates.service';
import { CertificateTemplatesController } from './certificate-templates.controller';
import { CertificatesService } from './certificates.service';
import { CertificatesController } from './certificates.controller';

@Module({
  imports: [PrismaModule],
  controllers: [CertificateTemplatesController, CertificatesController],
  providers: [CertificateTemplatesService, CertificatesService],
})
export class CertificatesModule {}
