import { BadRequestException, Injectable } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';
import { Prisma } from '@prisma/client';
import { formatTime, timeToDate, today } from '../common/utils/date-time.util';
import { WEEKDAY_MAP } from '../common/constants/week-days';

@Injectable()
export class GroupsLessonsService {
  constructor(private readonly prisma: PrismaService) {}

  async generateLessonsFromSchedule(
    tx: Prisma.TransactionClient,
    groupId: number,
    scheduleId: number,
  ) {
    const schedule = await tx.schedule.findUnique({
      where: { id: scheduleId },
      include: {
        group: {
          include: {
            teachers: true,
          },
        },
      },
    });

    if (!schedule || !schedule.group) {
      throw new BadRequestException('Schedule or group not found');
    }

    const { group } = schedule;
    const targetWeekDay = WEEKDAY_MAP[schedule.day];

    const lessons: any[] = [];
    const cursor = new Date(group.startDate!);

    while (cursor <= group.endDate!) {
      if (cursor.getDay() === targetWeekDay) {
        const startTime = timeToDate(cursor, formatTime(schedule.startTime));

        const endTime = timeToDate(cursor, formatTime(schedule.endTime));

        lessons.push({
          groupId,
          subjectId: group.subjectId,
          scheduleId: scheduleId,
          date: new Date(cursor),
          startTime,
          endTime,
          roomId: group.roomId,
          isExtra: false,
          companyId: group.companyId ?? undefined,
          teacherId: group.teachers[0]?.id ?? undefined,
        });
      }
      cursor.setDate(cursor.getDate() + 1);
    }

    if (lessons.length) {
      await tx.lesson.createMany({
        data: lessons,
        skipDuplicates: true,
      });
    }

    return { createdLessons: lessons.length };
  }

  async syncFutureLessonsWithSchedule(
    tx: Prisma.TransactionClient,
    groupId: number,
    scheduleId: number,
  ) {
    const schedule = await tx.schedule.findUnique({
      where: { id: scheduleId },
    });

    if (!schedule) {
      throw new BadRequestException('Schedule not found');
    }

    return tx.lesson.updateMany({
      where: {
        groupId,
        isExtra: false,
        isDone: false,
        date: {
          gte: today,
        },
      },
      data: {
        startTime: timeToDate(today, formatTime(schedule.startTime)),
        endTime: timeToDate(today, formatTime(schedule.endTime)),
      },
    });
  }

  async createExtraLesson(dto: {
    groupId: number;
    subjectId: number;
    date: string;
    startTime: string;
    endTime: string;
  }) {
    const date = new Date(dto.date);

    return this.prisma.lesson.create({
      data: {
        groupId: dto.groupId,
        subjectId: dto.subjectId,
        date,
        startTime: timeToDate(date, dto.startTime),
        endTime: timeToDate(date, dto.endTime),
        isExtra: true,
      },
    });
  }
}
