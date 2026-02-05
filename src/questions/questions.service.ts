import {Injectable} from '@nestjs/common';
import {CreateQuestionDto} from './dto/create-question.dto';
import {UpdateQuestionDto} from './dto/update-question.dto';
import {PrismaService} from "../prisma/prisma.service";

@Injectable()
export class QuestionsService {
    constructor(private readonly prisma: PrismaService) {
    }

    async create(createQuestionDto: CreateQuestionDto, user: { id: number }) {
        return await this.prisma.question.create({
            data: {
                text: createQuestionDto.text,
                difficulty: createQuestionDto.difficulty,
                source: createQuestionDto.source,
                subjectId: createQuestionDto.subjectId,
                createdById: user.id,
                options: {
                    create: createQuestionDto.options,
                }
            }
        })
    }

    async findAll() {
        return await this.prisma.question.findMany({
            include: {
                options: true,
            }
        });
    }

    findOne(id: number) {
        return `This action returns a #${id} question`;
    }

    update(id: number, updateQuestionDto: UpdateQuestionDto) {
        return `This action updates a #${id} question`;
    }

    remove(id: number) {
        return `This action removes a #${id} question`;
    }
}
