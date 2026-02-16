import { IsInt } from 'class-validator';

export class ExtraLessonDto {
  @IsInt()
  subjectId: number;
  date: string;
  startTime: string;
  endTime: string;
  groupId: number;
}
