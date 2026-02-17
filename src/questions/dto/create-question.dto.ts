import { ApiProperty } from '@nestjs/swagger';
import {
  ArrayNotEmpty,
  IsArray,
  IsBoolean,
  IsEnum,
  IsInt,
  IsNotEmpty,
  IsPositive,
  IsString,
  ValidateNested,
} from 'class-validator';
import { Type } from 'class-transformer';
import { Difficulty } from '@prisma/client';

export class CreateOptionDto {
  @ApiProperty({
    example: '4',
    description: 'Option text',
  })
  @IsString()
  @IsNotEmpty()
  text: string;

  @ApiProperty({
    example: true,
    description: 'Whether this option is correct',
  })
  @IsBoolean()
  isCorrect: boolean;
}

export class CreateQuestionDto {
  @ApiProperty({
    example: 'What is 2 + 2?',
    description: 'The text of the question',
  })
  @IsString()
  @IsNotEmpty()
  text: string;

  @ApiProperty({
    enum: Difficulty,
    example: Difficulty.LOW,
    description: 'Difficulty level of the question',
  })
  @IsEnum(Difficulty)
  difficulty: Difficulty;

  @ApiProperty({
    example: 1,
    description: 'Related subject ID',
  })
  @IsInt()
  @IsPositive()
  subjectId: number;

  @ApiProperty({
    type: CreateOptionDto,
    description: 'List of options for the question',
  })
  @IsArray()
  @ArrayNotEmpty()
  @ValidateNested({ each: true })
  @Type(() => CreateOptionDto)
  options: CreateOptionDto[];
}
