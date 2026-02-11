import { IsEnum, IsInt, IsOptional, IsString } from 'class-validator';
import { ParentType } from '@prisma/client';

export class CreateParentDto {
  @IsString()
  name: string;

  @IsString()
  phone: string;

  @IsEnum(ParentType)
  type: ParentType;

  @IsInt()
  studentId: number;

  @IsOptional()
  @IsInt()
  companyId?: number;
}
