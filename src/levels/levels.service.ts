import {Injectable, NotFoundException} from '@nestjs/common';
import {CreateLevelDto} from './dto/create-level.dto';
import {UpdateLevelDto} from './dto/update-level.dto';
import {PrismaService} from "../prisma/prisma.service";
import {paginate} from "../common/pagination/pagination.helper";

@Injectable()
export class LevelsService {
    constructor(private prisma: PrismaService) {
    }

    create(createLevelDto: CreateLevelDto) {
        return this.prisma.level.create({
            data: {
                ...createLevelDto
            }
        })
    }

    async findAll(page: number, page_size: number) {
        const skip = (page - 1) * page_size

        const [levels, total] = await Promise.all([
            this.prisma.level.findMany({
                skip,
                take: page_size,
            }),
            this.prisma.level.count(),
        ]);
        return paginate(levels, total, page, page_size)
    }

    findOne(id: number) {
        return `This action returns a #${id} level`;
    }

    update(id: number, updateLevelDto: UpdateLevelDto) {
        return `This action updates a #${id} level`;
    }

    async remove(id: number) {
        try {
            return await this.prisma.level.delete({
                where: {id}
            })
        } catch (e) {
            if (e.code === 'P2025') {
                throw new NotFoundException('Company not found');
            }
            throw e;
        }
    }
}
