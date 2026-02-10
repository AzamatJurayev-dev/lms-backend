import { ApiProperty } from '@nestjs/swagger';
import { IsBoolean, IsInt, IsOptional, IsString, Min } from 'class-validator';

export class CreatePlanDto {
  @ApiProperty({ example: 'BASIC' })
  @IsString()
  code: string;

  @ApiProperty({ example: 'Basic Plan' })
  @IsString()
  name: string;

  @ApiProperty({ example: 'For small teams', required: false })
  @IsOptional()
  @IsString()
  description?: string;

  @ApiProperty({ example: 1 })
  @IsInt()
  @Min(1)
  maxGroups: number;

  @ApiProperty({ example: 5 })
  @IsInt()
  @Min(1)
  maxStudents: number;

  @ApiProperty({ example: 1 })
  @IsInt()
  @Min(1)
  maxTeachers: number;

  @ApiProperty({ example: 1024, description: 'MB' })
  @IsInt()
  @Min(1)
  maxStorageMb: number;

  @ApiProperty({ example: 0 })
  @IsInt()
  @Min(0)
  price: number;

  @ApiProperty({ example: 30 })
  @IsInt()
  @Min(1)
  durationDays: number;

  @ApiProperty({ example: true })
  @IsOptional()
  @IsBoolean()
  isActive?: boolean;
}
