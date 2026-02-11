import { Injectable, NotFoundException } from '@nestjs/common';
import {
  UpdateTeacherDto,
  UpdateTeacherSubjectDto,
} from './dto/update-teacher.dto';
import { ApiProperty } from '@nestjs/swagger';
import { UserSelect } from '../users/utils/users.select';
import { PrismaService } from '../prisma/prisma.service';
import { paginate } from '../common/pagination/pagination.helper';
import { mappedUsers } from '../common/helpers/user-map';

@Injectable()
export class TeachersService {
  constructor(private prisma: PrismaService) {}

  @ApiProperty()
  async findAll(page: number, page_size: number) {
    const skip = (page - 1) * page_size;
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
            select: UserSelect,
          },
        },
      }),
      this.prisma.teacher.count(),
    ]);

    const mappedTeachers = mappedUsers(teachers);
    return paginate(mappedTeachers, total, page, page_size);
  }

  findOne(id: number) {
    return this.prisma.teacher.findUnique({
      where: { id },
      select: {
        id: true,
        bio: true,
        photo: true,
        groups: true,
        subjects: true,
        experience: true,
        user: {
          select: UserSelect,
        },
      },
    });
  }

  update(id: number, updateTeacherDto: UpdateTeacherDto) {
    return `This action updates a #${id} teacher`;
  }

  async getSubjects(id: number) {
    const teacher = await this.prisma.teacher.findUnique({
      where: { id },
      select: {
        subjects: true,
      },
    });

    if (!teacher) {
      throw new NotFoundException('Teacher not found');
    }

    return teacher.subjects;
  }

  async getGroups(id: number) {
    return this.prisma.group.findMany({
      where: {
        teachers: {
          some: {
            id,
          },
        },
      },
    });
  }

  async getLessons(id: number) {
    return this.prisma.lesson.findMany({
      where: { teacherId: id },
    });
  }
  async getTeacherSchedules(teacherId: number) {
    return this.prisma.schedule.findMany({
      where: {
        group: {
          teachers: {
            some: { id: teacherId },
          },
        },
      },
    });
  }

  setSubject(teacherId: number, dto: UpdateTeacherSubjectDto) {
    return this.prisma.teacher.update({
      where: { id: teacherId },
      data: {
        subjects: {
          connect: dto.subject_ids.map((id) => ({ id })),
        },
      },
    });
  }
}
