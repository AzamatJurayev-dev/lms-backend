import {Injectable} from '@nestjs/common';
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
                    level: dto.level,
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

    findOne(id: number) {
        return `This action returns a #${id} group`;
    }

    update(id: number, updateGroupDto: UpdateGroupDto) {
        return `This action updates a #${id} group`;
    }

    remove(id: number) {
        return `This action removes a #${id} group`;
    }
}
