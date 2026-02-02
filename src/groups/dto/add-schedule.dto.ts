import {IsDateString, IsEnum} from "class-validator";
import {WeekDays} from "@prisma/client";

export class AddScheduleDto {

    @IsEnum(WeekDays)
    day: WeekDays;

    @IsDateString()
    startTime: string;

    @IsDateString()
    endTime: string;
}
