import {Injectable} from "@nestjs/common";
import {PrismaService} from "../prisma/prisma.service";

@Injectable()
export class AttendanceService {
    constructor(private prisma: PrismaService) {
    }

    async markAttendance(
        lessonId: number,
        studentId: number,
        status: "present" | "absent" | "late" | "excused",
        comment?: string,
    ) {
        return this.prisma.attendance.upsert({
            where: {
                lessonId_studentId: {
                    lessonId,
                    studentId,
                },
            },
            update: {
                status,
                comment,
            },
            create: {
                lessonId,
                studentId,
                status,
                comment,
            },
        });
    }

    async getLessonAttendance(lessonId: number) {
        return this.prisma.attendance.findMany({
            where: {lessonId},
            include: {
                student: true,
            },
        });
    }
}
