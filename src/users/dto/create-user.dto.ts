import {
  IsBoolean,
  IsInt,
  IsNotEmpty,
  IsOptional,
  IsString,
} from 'class-validator';
import { Type } from 'class-transformer';
import { ApiProperty } from '@nestjs/swagger';

export class CreateUserDto {
  @ApiProperty({ example: 'username' })
  @IsString()
  @IsNotEmpty()
  username: string;

  @ApiProperty({ example: 'firstName' })
  @IsString()
  @IsNotEmpty()
  firstName: string;

  @ApiProperty({ example: 'lastName' })
  @IsString()
  @IsNotEmpty()
  lastName: string;

  @ApiProperty({ example: 'middleName' })
  @IsString()
  @IsOptional()
  middleName?: string;

  @ApiProperty({ example: 'password' })
  @IsString()
  @IsNotEmpty()
  password: string;

  @ApiProperty({ example: 'confirm' })
  @IsString()
  @IsNotEmpty()
  confirmPassword: string;

  @ApiProperty({ example: 1 })
  @IsOptional()
  @Type(() => Number)
  @IsInt()
  roleId: number;

  @ApiProperty({ example: '+998909009090' })
  @IsNotEmpty()
  @IsString({ each: true })
  phoneNumber: string;

  @ApiProperty({ example: 1 })
  @IsOptional()
  @IsInt()
  @Type(() => Number)
  companyId: number;

  @ApiProperty({ example: true })
  @IsBoolean()
  @IsNotEmpty()
  isActive: boolean;

  @ApiProperty({ example: true })
  @IsBoolean()
  @IsNotEmpty()
  canChangePassword: boolean;
}
