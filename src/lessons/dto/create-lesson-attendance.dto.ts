import {ApiProperty} from "@nestjs/swagger";
import {IsArray, IsEnum, IsInt, IsOptional, IsString, ValidateNested} from "class-validator";
import {Type} from "class-transformer";


export enum AttendanceStatus {
    PRESENT = "present",
    ABSENT = "absent",
    LATE = "late",
    EXCUSED = "excused",
}

class AttendanceItemDto {
    @ApiProperty({example: 23})
    @IsInt()
    studentId: number;

    @ApiProperty({
        enum: AttendanceStatus,
        example: AttendanceStatus.ABSENT,
    })
    @IsEnum(AttendanceStatus)
    status: AttendanceStatus;

    @ApiProperty({
        example: "Sick",
        required: false,
    })
    @IsOptional()
    @IsString()
    comment?: string;
}

export class BulkAttendanceDto {
    @ApiProperty({
        example: 12,
        description: "Lesson ID",
    })
    @IsInt()
    lessonId: number;

    @ApiProperty({
        type: [AttendanceItemDto],
        description: "Only students with non-present status",
    })
    @IsArray()
    @ValidateNested({each: true})
    @Type(() => AttendanceItemDto)
    attendances: AttendanceItemDto[];
}