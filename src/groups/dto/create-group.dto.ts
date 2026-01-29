import {
    ArrayNotEmpty,
    IsArray,
    IsBoolean,
    IsDate,
    IsInt,
    IsNotEmpty,
    IsOptional,
    IsPositive,
    IsString,
    MaxLength,
    MinLength,
} from 'class-validator';
import {Type} from 'class-transformer';
import {ApiProperty, ApiPropertyOptional} from '@nestjs/swagger';

export class CreateGroupDto {
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
    name: string;

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
    code: string;

    @ApiPropertyOptional({
        example: 'Advanced math group',
        description: 'Optional description',
        maxLength: 255,
    })
    @IsString()
    @IsOptional()
    @MaxLength(255)
    description?: string;

    @ApiProperty({
        example: 1,
        description: 'Related level ID',
    })
    @IsInt()
    @IsPositive()
    levelId: number;

    @ApiProperty({
        example: 1,
        description: 'Related room ID',
    })
    @IsInt()
    @IsPositive()
    roomId: number;

    @ApiProperty({
        example: '2026-02-01',
        description: 'Group start date (ISO format)',
        type: String,
        format: 'date',
    })
    @Type(() => Date)
    @IsDate()
    startDate: Date;

    @ApiProperty({
        example: '2026-06-01',
        description: 'Group end date (ISO format)',
        type: String,
        format: 'date',
    })
    @Type(() => Date)
    @IsDate()
    endDate: Date;

    @ApiPropertyOptional({
        example: true,
        description: 'Group active status',
        default: true,
    })
    @IsBoolean()
    @IsOptional()
    isActive?: boolean;

    @ApiProperty({
        example: 1,
        description: 'Related subject ID',
    })
    @IsInt()
    @IsPositive()
    subjectId: number;

    @ApiProperty({
        example: [2, 5],
        description: 'Teacher IDs assigned to this group',
        type: [Number],
    })
    @IsArray()
    @ArrayNotEmpty()
    @IsInt({each: true})
    @IsPositive({each: true})
    teachersIds: number[];
}
