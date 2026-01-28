import {ApiProperty, PartialType} from '@nestjs/swagger';
import {CreateTeacherDto} from './create-teacher.dto';
import {ArrayNotEmpty, IsArray} from "class-validator";

export class UpdateTeacherDto extends PartialType(CreateTeacherDto) {
}

export class UpdateTeacherSubjectDto {
    @ApiProperty()
    @IsArray()
    @ArrayNotEmpty()
    subject_ids: number[]
}