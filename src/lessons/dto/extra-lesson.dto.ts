import { IsDateString, IsInt, IsString } from 'class-validator';
import { Type } from 'class-transformer';

export class ExtraLessonDto {
  @Type(() => Number)
  @IsInt()
  subjectId: number;

  @IsDateString()
  date: string;

  @IsString()
  startTime: string;

  @IsString()
  endTime: string;

  @Type(() => Number)
  @IsInt()
  groupId: number;
}
