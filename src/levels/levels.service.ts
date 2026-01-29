import {Injectable} from '@nestjs/common';
import {CreateLevelDto} from './dto/create-level.dto';
import {UpdateLevelDto} from './dto/update-level.dto';
import {PrismaService} from "../prisma/prisma.service";

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

    findAll() {
        return `This action returns all levels`;
    }

    findOne(id: number) {
        return `This action returns a #${id} level`;
    }

    update(id: number, updateLevelDto: UpdateLevelDto) {
        return `This action updates a #${id} level`;
    }

    remove(id: number) {
        return `This action removes a #${id} level`;
    }
}
