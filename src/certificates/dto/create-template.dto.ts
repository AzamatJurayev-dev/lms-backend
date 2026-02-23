import { IsEnum, IsInt, IsString } from 'class-validator';
import { CertificateTemplateType } from '@prisma/client';

export class CreateTemplateDto {
  @IsString()
  name: string;

  @IsEnum(CertificateTemplateType)
  type: CertificateTemplateType;

  @IsString()
  imageUrl: string;

  @IsInt()
  width: number;

  @IsInt()
  height: number;
}
