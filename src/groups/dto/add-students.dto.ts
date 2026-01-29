import {ArrayNotEmpty, IsArray, IsInt, IsPositive} from "class-validator";

export class AddStudentsDto {
    @IsArray()
    @ArrayNotEmpty()
    @IsInt({each: true})
    @IsPositive({each: true})
    studentIds: number[]
}
