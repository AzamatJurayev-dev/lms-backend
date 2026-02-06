import {Injectable} from '@nestjs/common';
import {CreateTestDto} from './dto/create-test.dto';
import {UpdateTestDto} from './dto/update-test.dto';
import {PrismaService} from "../prisma/prisma.service";

@Injectable()
export class TestsService {
  constructor(private readonly prisma: PrismaService) {
  }

  create(dto: CreateTestDto, user: { id: number }) {
    return this.prisma.test.create({
      data: {
        ...dto,
        createdById: user.id
      }
    });
  }

  findAll() {
    return `This action returns all tests`;
  }

  findOne(id: number) {
    return `This action returns a #${id} test`;
  }

  update(id: number, updateTestDto: UpdateTestDto) {
    return `This action updates a #${id} test`;
  }

  remove(id: number) {
    return `This action removes a #${id} test`;
  }
}
