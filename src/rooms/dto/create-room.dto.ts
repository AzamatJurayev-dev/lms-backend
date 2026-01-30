import {ApiProperty, ApiPropertyOptional} from "@nestjs/swagger";
import {IsBoolean, IsInt, IsNotEmpty, IsOptional, IsString, MaxLength, MinLength} from "class-validator";
import {Type} from "class-transformer";

export class CreateRoomDto {
    @ApiProperty({
        example: 'Math Group A',
        description: 'Group name',
        minLength: 2,
        maxLength: 100,
    })
    @IsString()
    @IsNotEmpty()
    @MinLength(2)
    @MaxLength(100)
    name: string

    @ApiProperty({
        example: 'MATH_9A',
        description: 'Unique group code',
        minLength: 2,
        maxLength: 20,
    })
    @IsString()
    @IsNotEmpty()
    @MinLength(2)
    @MaxLength(20)
    code: string

    @ApiProperty({example: 1})
    @IsOptional()
    @Type(() => Number)
    @IsInt()
    floor: number;

    @ApiProperty({example: 1})
    @IsOptional()
    @Type(() => Number)
    @IsInt()
    number: number;

    @ApiPropertyOptional({
        example: true,
        description: 'Group active status',
        default: true,
    })
    @IsBoolean()
    @IsOptional()
    isActive: boolean
}
