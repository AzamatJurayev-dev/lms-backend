import { Module } from '@nestjs/common';
import { CertificateService } from './certificates.service';
import { CertificateController } from './certificates.controller';

@Module({
  controllers: [CertificateController],
  providers: [CertificateService],
})
export class CertificatesModule {}
