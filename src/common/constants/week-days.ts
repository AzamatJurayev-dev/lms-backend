import {WeekDays} from "@prisma/client";

export const WEEKDAY_MAP: Record<WeekDays, number> = {
    sunday: 0,
    monday: 1,
    tuesday: 2,
    wednesday: 3,
    thursday: 4,
    friday: 5,
    saturday: 6,
};