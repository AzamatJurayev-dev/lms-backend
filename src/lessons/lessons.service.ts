import {Injectable} from '@nestjs/common';
import {CreateLessonDto} from './dto/create-lesson.dto';
import {UpdateLessonDto} from './dto/update-lesson.dto';
import {PrismaService} from "../prisma/prisma.service";
import {buildQuery} from "../common/query/query.helper";
import {paginate} from "../common/pagination/pagination.helper";
import {LessonSelect} from "./utils/lesson-select";
import {mappedUsers} from "../common/helpers/user-map";
import {AttendanceStatus, BulkAttendanceDto} from "./dto/create-lesson-attendance.dto";
import {BulkPerformanceDto} from "./dto/create-performance.dto";

@Injectable()
export class LessonsService {
    constructor(private readonly prisma: PrismaService) {
    }

    create(createLessonDto: CreateLessonDto) {
        return 'This action adds a new lesson';
    }

    async findAll(query: any) {
        const q = buildQuery(
            {
                page: query.page,
                pageSize: query.pageSize,
                ordering: query.ordering,
                search: query.search,
                date_from: query.date_from,
                date_to: query.date_to,
                filters: {
                    isActive: query.isActive,
                },
            },
            {
                allowedOrderFields: ['name', 'code', 'createdAt', 'isActive'],
                allowedFilterFields: ['isActive'],
                searchableFields: ['name', 'code', 'email', 'phone'],
                defaultOrderBy: {createdAt: 'desc'},
                dateField: 'createdAt',
            },
        );
        const [items, total] = await this.prisma.$transaction([
            this.prisma.lesson.findMany({
                skip: q.skip,
                take: q.take,
                where: q.where,
                orderBy: q.orderBy,
                select: LessonSelect
            }),
            this.prisma.lesson.count({
                where: q?.where,
            }),
        ]);

        const result = items.map((lesson) => {
            if (!lesson.teacher?.user) return lesson;

            const [mappedTeacher] = mappedUsers([lesson.teacher]);

            return {
                ...lesson,
                teacher: mappedTeacher,
            };
        });
        return paginate(result, total, q.page, q.pageSize)
    }

    findOne(id: number) {
        return `This action returns a #${id} lesson`;
    }

    update(id: number, updateLessonDto: UpdateLessonDto) {
        return `This action updates a #${id} lesson`;
    }

    remove(id: number) {
        return `This action removes a #${id} lesson`;
    }

    async addBulkAttendance(dto: BulkAttendanceDto) {
        const lesson = await this.prisma.lesson.findUnique({
            where: {id: dto.lessonId},
            select: {
                group: {
                    select: {
                        students: {
                            select: {id: true},
                        },
                    },
                },
            },
        });

        if (!lesson) {
            throw new Error("Lesson not found");
        }

        const groupStudentIds = lesson.group.students.map(s => s.id);

        const invalidStudents = dto.attendances.filter(
            a => !groupStudentIds.includes(a.studentId)
        );

        if (invalidStudents.length) {
            throw new Error("Some students do not belong to this group");
        }

        const attendanceMap = new Map(
            dto.attendances.map(a => [a.studentId, a])
        );

        const operations = groupStudentIds.map(studentId => {
            const attendance = attendanceMap.get(studentId);

            return this.prisma.attendance.upsert({
                where: {
                    lessonId_studentId: {
                        lessonId: dto.lessonId,
                        studentId,
                    },
                },
                create: {
                    lessonId: dto.lessonId,
                    studentId,
                    status: attendance?.status ?? AttendanceStatus.PRESENT,
                    comment: attendance?.comment,
                },
                update: {
                    status: attendance?.status ?? AttendanceStatus.PRESENT,
                    comment: attendance?.comment,
                },
            });
        });

        return this.prisma.$transaction(operations);
    }

    async getAttendance(lessonId: number) {
        const lesson = await this.prisma.lesson.findUnique({
            where: {
                id: lessonId
            }
        })
        if (!lesson) {
            throw new Error("Lesson not found");
        }
        return this.prisma.attendance.findMany({
            where: {
                lessonId
            },
            select: {
                student: true
            }
        })
    }

    async addBulkPerformance(dto: BulkPerformanceDto) {
        const lesson = await this.prisma.lesson.findUnique({
            where: {id: dto.lessonId},
            select: {
                group: {
                    select: {
                        students: {
                            select: {id: true},
                        },
                    },
                },
            },
        });

        if (!lesson) {
            throw new Error("Lesson not found");
        }

        const groupStudentIds = lesson.group.students.map((s) => s.id);

        const invalid = dto.performances.filter(
            (p) => !groupStudentIds.includes(p.studentId)
        );

        if (invalid.length) {
            throw new Error("Some students do not belong to this group");
        }

        const operations = dto.performances.map((p) =>
            this.prisma.performance.upsert({
                where: {
                    lessonId_studentId: {
                        lessonId: dto.lessonId,
                        studentId: p.studentId,
                    },
                },
                create: {
                    lessonId: dto.lessonId,
                    studentId: p.studentId,
                    score: p.score,
                    grade: p.grade,
                    comment: p.comment,
                },
                update: {
                    score: p.score,
                    grade: p.grade,
                    comment: p.comment,
                },
            })
        );

        return this.prisma.$transaction(operations);
    }

    async getPerformance(lessonId: number) {
        const lesson = await this.prisma.lesson.findUnique({
            where: {
                id: lessonId
            }
        })
        if (!lesson) {
            throw new Error("Lesson not found");
        }
        return this.prisma.performance.findMany({
            where: {
                lessonId
            },
            select: {
                student: true
            }
        })
    }
}
