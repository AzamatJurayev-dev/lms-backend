import { Injectable, NotFoundException } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';
import { ApiProperty } from '@nestjs/swagger';
import { UserSelect } from '../users/utils/users.select';
import { paginate } from '../common/pagination/pagination.helper';
import { mappedUsers } from '../common/helpers/user-map';
import { buildQuery } from '../common/query/query.helper';
import type { CurrentUserType } from '../common/types/current-user.type';

@Injectable()
export class StudentsService {
  constructor(private prisma: PrismaService) {}

  @ApiProperty()
  async findAll(query: any, user: CurrentUserType) {
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
        allowedOrderFields: ['firstName', 'lastName', 'middleName', 'isActive'],
        allowedFilterFields: ['isActive'],
        searchableFields: [
          'firstName',
          'lastName',
          'middleName',
          'phoneNumber',
        ],
        defaultOrderBy: { createdAt: 'desc' },
        dateField: 'createdAt',
        virtualOrderFields: {
          full_name: (order) => [
            { firstName: order },
            { lastName: order },
            { middleName: order },
          ],
        },
      },
    );

    const where: any = {
      ...q.where,
    };

    if (user.role.code !== 'super_admin' && user.companyId !== null) {
      where.companyId = user.companyId;
    }

    const [students, total] = await Promise.all([
      this.prisma.student.findMany({
        where: {
          user: {
            ...where,
          },
        },
        select: {
          id: true,
          bio: true,
          hobby: true,
          parents: true,
          groups: true,
          user: {
            select: UserSelect,
          },
        },
      }),
      this.prisma.student.count(),
    ]);

    const mappedStudents = mappedUsers(students);

    return paginate(mappedStudents, total, q.page, q.pageSize);
  }

  findOne(id: number) {
    return `This action returns a #${id} student`;
  }

  async getParents(id: number) {
    const student = await this.prisma.student.findUnique({
      where: { id },
      select: {
        parents: true,
      },
    });

    if (!student) {
      throw new NotFoundException('Student not found');
    }
    return student.parents;
  }
  async getGroups(id: number) {
    const student = await this.prisma.student.findUnique({
      where: { id },
      select: {
        groups: true,
      },
    });

    if (!student) {
      throw new NotFoundException('Student not found');
    }
    return student.groups;
  }
  async getLessons(id: number) {
    const student = await this.prisma.student.findUnique({
      where: { id },
      select: {
        groups: true,
      },
    });

    if (!student) {
      throw new NotFoundException('Student not found');
    }
    return student.groups;
  }
  async getStudentSchedules(studentId: number) {
    return this.prisma.schedule.findMany({
      where: {
        group: {
          students: {
            some: { id: studentId },
          },
        },
      },
    });
  }
}
