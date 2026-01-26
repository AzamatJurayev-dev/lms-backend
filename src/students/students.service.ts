import {Injectable} from '@nestjs/common';
import {UpdateStudentDto} from './dto/update-student.dto';
import {PrismaService} from "../prisma/prisma.service";
import {ApiProperty} from "@nestjs/swagger";
import {UserSelect} from "../users/utils/users.select";
import {paginate} from "../common/pagination/pagination.helper";

@Injectable()
export class StudentsService {
    constructor(private prisma: PrismaService) {
    }

    @ApiProperty()
    async findAll(page: number, page_size) {
        const skip = (page - 1) * page_size;

        const [students, total] = await Promise.all([
            this.prisma.student.findMany({
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
            }),
            this.prisma.student.count()
        ])

        const mappedStudents = students.map(({user, ...student}) => ({
            ...user,
            full_name: [user.firstName, user.lastName, user.middleName]
                .filter(Boolean)
                .join(' '),
            ...student,
        }));

        return paginate(mappedStudents, total, page, page_size)
    }

    findOne(id: number) {
        return `This action returns a #${id} student`;
    }

    update(id: number, updateStudentDto: UpdateStudentDto) {
        return `This action updates a #${id} student`;
    }

}
