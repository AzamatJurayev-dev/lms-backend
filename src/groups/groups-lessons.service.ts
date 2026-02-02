import {BadRequestException, Injectable} from "@nestjs/common";
import {PrismaService} from "../prisma/prisma.service";
import {WeekDays} from "@prisma/client";

/**
 * Group + Schedule + Lesson orchestration service
 * - Auto lesson create
 * - Future lesson sync
 * - Extra lesson create
 */
@Injectable()
export class GroupsLessonsService {
    constructor(private readonly prisma: PrismaService) {
    }

    /* ---------------------------------- */
    /* Helpers                            */
    /* ---------------------------------- */

    private WEEKDAY_MAP: Record<WeekDays, number> = {
        sunday: 0,
        monday: 1,
        tuesday: 2,
        wednesday: 3,
        thursday: 4,
        friday: 5,
        saturday: 6,
    };

    private timeToDate(baseDate: Date, time: string) {
        const [h, m] = time.split(":").map(Number);
        const d = new Date(baseDate);
        d.setHours(h, m, 0, 0);
        return d;
    }

    private formatTime(date: Date) {
        return date.toISOString().substring(11, 16);
    }

    /* ---------------------------------- */
    /* AUTO LESSON GENERATION              */

    /* ---------------------------------- */

    /**
     * Schedule create bo‘lganda chaqiriladi
     * Group startDate → endDate oralig‘ida auto lesson yaratadi
     */
    async generateLessonsFromSchedule(groupId: number, scheduleId: number) {
        const schedule = await this.prisma.schedule.findUnique({
            where: {id: scheduleId},
            include: {
                group: true,
            },
        });

        if (!schedule || !schedule.group) {
            throw new BadRequestException("Schedule or group not found");
        }

        const {group} = schedule;
        const targetWeekDay = this.WEEKDAY_MAP[schedule.day];

        const lessons: any[] = [];
        let cursor = new Date(group.startDate!);

        while (cursor <= group.endDate!) {
            if (cursor.getDay() === targetWeekDay) {
                const startTime = this.timeToDate(
                    cursor,
                    this.formatTime(schedule.startTime),
                );

                const endTime = this.timeToDate(
                    cursor,
                    this.formatTime(schedule.endTime),
                );

                lessons.push({
                    groupId,
                    subjectId: group.subjectId,
                    date: new Date(cursor),
                    startTime,
                    endTime,
                    isExtra: false,
                });
            }

            cursor.setDate(cursor.getDate() + 1);
        }

        if (lessons.length) {
            await this.prisma.lesson.createMany({
                data: lessons,
                skipDuplicates: true, // @@unique([groupId, date, startTime])
            });
        }

        return {
            createdLessons: lessons.length,
        };
    }

    /* ---------------------------------- */
    /* SCHEDULE UPDATE → FUTURE LESSONS    */

    /* ---------------------------------- */

    /**
     * Schedule update bo‘lganda chaqiriladi
     * Faqat:
     * - isExtra = false
     * - isDone = false
     * - future lessons
     */
    async syncFutureLessonsWithSchedule(
        groupId: number,
        scheduleId: number,
    ) {
        const schedule = await this.prisma.schedule.findUnique({
            where: {id: scheduleId},
        });

        if (!schedule) {
            throw new BadRequestException("Schedule not found");
        }

        const today = new Date();

        return this.prisma.lesson.updateMany({
            where: {
                groupId,
                isExtra: false,
                isDone: false,
                date: {
                    gte: today,
                },
            },
            data: {
                startTime: this.timeToDate(
                    today,
                    this.formatTime(schedule.startTime),
                ),
                endTime: this.timeToDate(
                    today,
                    this.formatTime(schedule.endTime),
                ),
            },
        });
    }

    /* ---------------------------------- */
    /* EXTRA LESSON                        */

    /* ---------------------------------- */

    /**
     * Qo‘lda extra lesson qo‘shish
     * Schedule bilan bog‘liq emas
     */
    async createExtraLesson(dto: {
        groupId: number;
        subjectId: number;
        date: string;       // YYYY-MM-DD
        startTime: string;  // HH:mm
        endTime: string;    // HH:mm
    }) {
        const date = new Date(dto.date);

        return this.prisma.lesson.create({
            data: {
                groupId: dto.groupId,
                subjectId: dto.subjectId,
                date,
                startTime: this.timeToDate(date, dto.startTime),
                endTime: this.timeToDate(date, dto.endTime),
                isExtra: true,
            },
        });
    }
}
