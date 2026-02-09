import { ApiProperty } from '@nestjs/swagger';
import { IsEnum, IsInt, IsNotEmpty, IsString, Max, Min } from 'class-validator';
import { TestStatus } from '@prisma/client';

export class CreateTestDto {
  @ApiProperty({
    example: 'Math Final Test',
    description: 'Test title',
  })
  @IsString()
  @IsNotEmpty()
  title: string;

  @ApiProperty({
    example: 60,
    description: 'Test duration in minutes',
    minimum: 1,
    maximum: 300,
  })
  @IsInt()
  @Min(1)
  @Max(300)
  duration: number;

  @ApiProperty({
    example: 20,
    description: 'Number of questions in the test',
    minimum: 1,
    maximum: 200,
  })
  @IsInt()
  @Min(1)
  @Max(200)
  count: number;

  @ApiProperty({
    enum: TestStatus,
    example: TestStatus.DRAFT,
    description: 'Test status',
  })
  @IsEnum(TestStatus)
  status: TestStatus;
}
