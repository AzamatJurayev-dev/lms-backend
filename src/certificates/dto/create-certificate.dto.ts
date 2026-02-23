import { IsInt, IsNotEmpty, IsPositive, IsString } from 'class-validator';

export class CreateCertificateDto {
  @IsString()
  @IsNotEmpty()
  fullName: string;

  @IsString()
  @IsNotEmpty()
  courseName: string;

  @IsInt()
  @IsPositive()
  templateId: number;
}
