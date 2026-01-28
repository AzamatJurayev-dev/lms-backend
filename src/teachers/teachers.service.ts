import {Injectable} from '@nestjs/common';
import {UpdateTeacherDto, UpdateTeacherSubjectDto} from './dto/update-teacher.dto';
import {ApiProperty} from "@nestjs/swagger";
import {UserSelect} from "../users/utils/users.select";
import {PrismaService} from "../prisma/prisma.service";
import {paginate} from "../common/pagination/pagination.helper";

@Injectable()
export class TeachersService {
    constructor(private prisma: PrismaService) {
    }


    @ApiProperty()
    async findAll(page: number, page_size: number) {
        const skip = (page - 1) * page_size
        const [teachers, total] = await Promise.all([
            this.prisma.teacher.findMany({
                select: {
                    id: true,
                    bio: true,
                    photo: true,
                    groups: true,
                    subjects: true,
                    experience: true,
                    user: {
                        select: UserSelect
                    },
                }
            }),
            this.prisma.teacher.count()
        ])

        const mappedTeachers = teachers.map(({user, ...teacher}) => ({
            ...user,
            full_name: [user.firstName, user.lastName, user.middleName]
                .filter(Boolean)
                .join(' '),
            ...teacher,
        }));

        return paginate(mappedTeachers, total, page, page_size)
    }

    findOne(id: number) {
        return this.prisma.teacher.findUnique({
            where: {id},
            select: {
                id: true,
                bio: true,
                photo: true,
                groups: true,
                subjects: true,
                experience: true,
                user: {
                    select: UserSelect
                },
            }
        });
    }

    update(id: number, updateTeacherDto: UpdateTeacherDto) {
        return `This action updates a #${id} teacher`;
    }

    setSubject(teacherId: number, dto: UpdateTeacherSubjectDto) {
        return this.prisma.teacher.update({
            where: {id: teacherId},
            data: {
                subjects: {
                    connect: dto.subject_ids.map((id) => ({id})),
                },
            },
        });
    }
}
