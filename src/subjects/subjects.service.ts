import {BadRequestException, Injectable, NotFoundException} from '@nestjs/common';
import {PrismaService} from "../prisma/prisma.service";
import {paginate} from "../common/pagination/pagination.helper";
import {CreateSubjectDto} from "./dto/create-subject.dto";
import {UpdateSubjectDto} from "./dto/update-subject.dto";
import {SubjectSelect} from "./utils/subject.select";

@Injectable()
export class SubjectsService {
    constructor(private prisma: PrismaService) {
    }

    async create(createSubjectDto: CreateSubjectDto) {
        const existing = await this.prisma.subject.findUnique({
            where: {name: createSubjectDto.name},
        });

        if (existing) {
            throw new BadRequestException('Name already exists');
        }
        return this.prisma.subject.create({
            data: createSubjectDto, select: SubjectSelect
        });
    }

    async findAll(page: number, page_size: number) {
        const skip = (page - 1) * page_size
        const [subject, total] = await Promise.all([
            this.prisma.subject.findMany({
                skip,
                take: page_size,
                select: SubjectSelect,
            }),
            this.prisma.subject.count()
        ])
        return paginate(subject, page, page_size, total)
    }

    async findOne(id: number) {
        const subject = await this.prisma.subject.findUnique({
            where: {id},
        });

        if (!subject) {
            throw new BadRequestException('User not found');
        }

        return subject;
    }

    async update(id: number, dto: UpdateSubjectDto) {
        try {
            return await this.prisma.subject.update({
                where: {id},
                data: {
                    ...(dto.name !== undefined && {name: dto.name}),
                    ...(dto.isActive !== undefined && {isActive: dto.isActive}),
                },
                select: SubjectSelect,
            });
        } catch (e) {
            if (e.code === 'P2025') {
                throw new NotFoundException('Subject not found');
            }
            throw e;
        }
    }


    async remove(id: number) {
        try {
            return await this.prisma.subject.delete({
                where: {id},
            });
        } catch (e) {
            if (e.code === 'P2025') {
                throw new NotFoundException('Subject not found');
            }
            throw e;
        }
    }
}
