import { ArrayNotEmpty, IsArray, IsInt } from 'class-validator';

export class AddTestQuestionsDto {
  @IsArray()
  @ArrayNotEmpty()
  @IsInt({ each: true })
  questionIds: number[];
}
