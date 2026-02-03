import {BadRequestException, Injectable, NotFoundException} from '@nestjs/common';
import {CreateGroupDto} from './dto/create-group.dto';
import {UpdateGroupDto} from './dto/update-group.dto';
import {PrismaService} from "../prisma/prisma.service";
import {paginate} from "../common/pagination/pagination.helper";
import {GroupSelect} from "./utils/group.select";
import {AddStudentsDto} from "./dto/add-students.dto";
import {AddScheduleDto} from "./dto/add-schedule.dto";
import {timeToDate} from "../common/utils/time-to-date";
import {GroupsLessonsService} from "./groups-lessons.service";
import {ExtraLessonDto} from "./dto/extra-lesson.dto";
import {formatTime} from "../common/utils/date-time.util";
import {mappedUsers} from "../common/helpers/user-map";
import {UserSelect} from "../users/utils/users.select";

@Injectable()
export class GroupsService {
    constructor(private prisma: PrismaService, private readonly groupsLessonsService: GroupsLessonsService) {
    }

    async create(dto: CreateGroupDto) {
        return await this.prisma.group.create(
            {
                data: {
                    name: dto.name,
                    code: dto.code,
                    description: dto.description,
                    levelId: dto.levelId,
                    roomId: dto.roomId,
                    startDate: dto.startDate,
                    endDate: dto.endDate,
                    isActive: dto.isActive,
                    subjectId: dto.subjectId,
                    teachers: {
                        connect: dto.teachersIds.map((id) => ({id}))
                    }
                }
            }
        )
    }
    async findAll(page: number, page_size: number) {
        const skip = (page - 1) * page_size;

        const [groups, total] = await Promise.all([
            this.prisma.group.findMany({
                skip,
                take: page_size,
                select: GroupSelect
            }),
            this.prisma.user.count(),
        ]);

        return paginate(groups, total, page, page_size);
    }

    async findOne(id: number) {
        const group = await this.prisma.group.findUnique({
            where: {id},
            select: GroupSelect
        });

        if (!group) {
            throw new BadRequestException('Group not found');
        }
        return {
            ...group,
            teachers: mappedUsers(group.teachers)
        }
    }
    update(id: number, updateGroupDto: UpdateGroupDto) {
        return `This action updates a #${id} group`;
    }
    async remove(id: number) {
        try {
            return await this.prisma.group.delete({
                where: {id}
            })
        } catch (e) {
            if (e.code === 'P2025') {
                throw new NotFoundException('Company not found');
            }
            throw e;
        }
    }
    async addStudents(groupId: number, dto: AddStudentsDto) {
        return this.prisma.$transaction(async (tx) => {

            const group = await tx.group.findUnique({
                where: {id: groupId}
            });
            if (!group) throw new Error('Group not found');

            const students = await tx.student.findMany({
                where: {id: {in: dto.studentIds}},
                select: {id: true}
            });

            if (students.length !== dto.studentIds.length) {
                throw new Error('Some students not found');
            }

            await tx.group.update({
                where: {id: groupId},
                data: {
                    students: {
                        connect: dto.studentIds.map(id => ({id}))
                    }
                }
            });

            return {groupId, added: dto.studentIds.length};
        });
    }
    async getStudents(groupId: number) {
        const group = await this.prisma.group.findUnique({
            where: {id: groupId},
            select: {
                students: {
                    select: {
                        id: true,
                        bio: true,
                        hobby: true,
                        photo: true,
                        parents: true,
                        groups: true,
                        user: {
                            select: UserSelect
                        },
                    }
                }
            }
        });

        if (!group) {
            throw new Error('Group not found');
        }
        return mappedUsers(group.students)
    }
    async removeStudents(groupId: number, studentIds: number[]) {
        return this.prisma.$transaction(async (tx) => {
            const group = await tx.group.findUnique({
                where: {id: groupId},
            });
            if (!group) throw new Error("Group not found");

            return tx.group.update({
                where: {id: groupId},
                data: {
                    students: {
                        disconnect: studentIds.map((id) => ({id})),
                    },
                },
            });
        });
    }
    async addSchedule(groupId: number, dto: AddScheduleDto) {
        return this.prisma.$transaction(async (tx) => {
            const group = await tx.group.findUnique({
                where: {id: groupId},
            });

            if (!group) {
                throw new Error("Group not found");
            }

            const startTime = timeToDate(dto.startTime);
            const endTime = timeToDate(dto.endTime);

            const conflict = await tx.schedule.findFirst({
                where: {
                    groupId,
                    day: dto.day,
                    startTime: {lt: endTime},
                    endTime: {gt: startTime},
                },
            });

            if (conflict) {
                throw new Error("Schedule time conflict");
            }

            const schedule = await tx.schedule.create({
                data: {
                    day: dto.day,
                    startTime,
                    endTime,
                    groupId,
                    companyId: group.companyId ?? undefined,
                },
            });

            await this.groupsLessonsService.generateLessonsFromSchedule(
                tx,
                groupId,
                schedule.id
            );

            return schedule;
        });
    }
    async getSchedules(groupId: number) {
        const group = await this.prisma.group.findUnique({
            where: {id: groupId},
            select: {
                schedules: {
                    orderBy: [
                        {day: "asc"},
                        {startTime: "asc"},
                    ],
                },
            },
        });

        if (!group) {
            throw new Error("Group not found");
        }

        return group.schedules.map((s) => ({
            id: s.id,
            day: s.day,
            startTime: formatTime(s.startTime),
            endTime: formatTime(s.endTime),
            groupId: s.groupId,
        }));
    }
    async deleteSchedule(groupId: number, scheduleId: number) {
        return this.prisma.$transaction(async (tx) => {
            const schedule = await tx.schedule.findUnique({
                where: {id: scheduleId},
            });

            if (!schedule) {
                throw new NotFoundException("Schedule not found");
            }

            const now = new Date();

            await tx.lesson.deleteMany({
                where: {
                    groupId,
                    scheduleId,
                    isExtra: false,
                    isDone: false,
                    date: {gt: now},
                },
            });

            await tx.schedule.delete({
                where: {id: scheduleId},
            });

            return {success: true};
        });
    }
    async updateSchedule(
        groupId: number,
        scheduleId: number,
        dto: AddScheduleDto,
    ) {
        return this.prisma.$transaction(async (tx) => {
            const group = await tx.group.findUnique({
                where: {id: groupId},
            });
            if (!group) {
                throw new Error("Group not found");
            }

            const schedule = await tx.schedule.findUnique({
                where: {id: scheduleId},
            });
            if (!schedule) {
                throw new Error("Schedule not found");
            }

            const startTime = timeToDate(dto.startTime);
            const endTime = timeToDate(dto.endTime);

            if (startTime >= endTime) {
                throw new Error("End time must be after start time");
            }

            const conflict = await tx.schedule.findFirst({
                where: {
                    id: {not: scheduleId},
                    groupId,
                    day: dto.day,
                    startTime: {lt: endTime},
                    endTime: {gt: startTime},
                },
            });

            if (conflict) {
                throw new Error("Schedule time conflict");
            }

            const updatedSchedule = await tx.schedule.update({
                where: {id: scheduleId},
                data: {
                    day: dto.day,
                    startTime,
                    endTime,
                    companyId: group.companyId ?? undefined,
                },
            });

            await this.groupsLessonsService.syncFutureLessonsWithSchedule(
                tx,
                groupId,
                scheduleId
            );

            return updatedSchedule;
        });
    }
    async getLessons(groupId: number) {
        const group = await this.prisma.group.findUnique({
            where: {id: groupId},
            select: {
                lessons: {
                    orderBy: [
                        {date: "asc"},
                        {startTime: "asc"},
                    ],
                    include: {
                        subject: true,
                        teacher: {
                            include: {
                                user: true,
                            },
                        },
                        room: true,
                    },
                },
            },
        });

        if (!group) {
            throw new NotFoundException("Group not found");
        }

        return group.lessons.map((l) => ({
            id: l.id,
            date: l.date,
            startTime: l.startTime,
            endTime: l.endTime,
            isExtra: l.isExtra,
            isDone: l.isDone,
            isCanceled: l.isCanceled,
            subject: l.subject,
            teacher: l.teacher,
            room: l.room,
        }));
    }
    async createExtraLesson(groupId: number, dto: ExtraLessonDto) {
        return this.groupsLessonsService.createExtraLesson({
            ...dto,
            groupId,
        });
    }
}
