import {Injectable} from '@nestjs/common';
import {CreateLessonDto} from './dto/create-lesson.dto';
import {UpdateLessonDto} from './dto/update-lesson.dto';
import {PrismaService} from "../prisma/prisma.service";
import {buildQuery} from "../common/query/query.helper";
import {paginate} from "../common/pagination/pagination.helper";
import {LessonSelect} from "./utils/lesson-select";
import {mappedUsers} from "../common/helpers/user-map";

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
}
