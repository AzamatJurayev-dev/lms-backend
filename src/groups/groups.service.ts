import {BadRequestException, Injectable, NotFoundException} from '@nestjs/common';
import {CreateGroupDto} from './dto/create-group.dto';
import {UpdateGroupDto} from './dto/update-group.dto';
import {PrismaService} from "../prisma/prisma.service";
import {paginate} from "../common/pagination/pagination.helper";
import {GroupSelect} from "./utils/group.select";

@Injectable()
export class GroupsService {
    constructor(private prisma: PrismaService) {
    }

    create(dto: CreateGroupDto) {
        return this.prisma.group.create(
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
        return group
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
}
