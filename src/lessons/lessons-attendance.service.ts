import {Injectable} from "@nestjs/common";
import {PrismaService} from "../prisma/prisma.service";

@Injectable()
export class LessonsAttendanceService {
    constructor(private readonly prisma: PrismaService) {
    }

    addLessonAttendance(dto: any) {
        this.prisma.attendance.create({
            data: {...dto}
        })
    }
}