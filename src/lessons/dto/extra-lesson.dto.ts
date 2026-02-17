import { IsDateString, IsInt, IsString } from 'class-validator';
import { Type } from 'class-transformer';

export class ExtraLessonDto {
  @Type(() => Number)
  @IsInt()
  subjectId: number;

  @Type(() => Number)
  @IsInt()
  teacherId: number;

  @Type(() => Number)
  @IsInt()
  roomId: number;

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
