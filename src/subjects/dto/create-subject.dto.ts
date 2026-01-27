import {IsBoolean, IsNotEmpty, IsString} from "class-validator";

export class CreateSubjectDto {
    @IsString()
    @IsNotEmpty()
    name: string

    @IsBoolean()
    isActive: boolean
}
