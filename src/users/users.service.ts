import {
  BadRequestException,
  Injectable,
  NotFoundException,
  UnauthorizedException,
} from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';
import { CreateUserDto } from './dto/create-user.dto';
import * as bcrypt from 'bcrypt';
import { paginate } from '../common/pagination/pagination.helper';
import { UpdateUserDto } from './dto/update-user.dto';
import { UserSelect } from './utils/users.select';
import { buildQuery } from '../common/query/query.helper';
import type { CurrentUserType } from '../common/types/current-user.type';
import { ChangePasswordDto } from './dto/change-password.dto';

@Injectable()
export class UsersService {
  constructor(private prisma: PrismaService) {}

  async getAll(query: any, user: CurrentUserType) {
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

    const [items, total] = await this.prisma.$transaction([
      this.prisma.user.findMany({
        skip: q.skip,
        take: q.take,
        where,
        orderBy: q.orderBy,
        select: UserSelect,
      }),
      this.prisma.user.count({
        where,
      }),
    ]);

    const mappedUsers = items.map((item) => ({
      ...item,
      full_name: [item.firstName, item.lastName, item.middleName]
        .filter(Boolean)
        .join(' '),
    }));

    return paginate(mappedUsers, total, q.page, q.pageSize);
  }

  async findById(id: number) {
    const user = await this.prisma.user.findUnique({
      where: { id },
      select: UserSelect,
    });

    if (!user) {
      throw new BadRequestException('User not found');
    }

    return {
      ...user,
      full_name: [user.firstName, user.lastName, user.middleName]
        .filter(Boolean)
        .join(' '),
    };
  }

  async create(dto: CreateUserDto) {
    if (dto.password !== dto.confirmPassword) {
      throw new BadRequestException('Passwords do not match');
    }

    const existing = await this.prisma.user.findUnique({
      where: { username: dto.username },
    });

    if (existing) {
      throw new BadRequestException('Username already exists');
    }
    const role = await this.prisma.role.findUnique({
      where: { id: dto.roleId },
    });

    if (!role) {
      throw new BadRequestException('Role not found');
    }

    const hashedPassword = await bcrypt.hash(dto.password, 10);

    return this.prisma.$transaction(async (tx) => {
      const user = await tx.user.create({
        data: {
          username: dto.username,
          password: hashedPassword,
          firstName: dto.firstName,
          lastName: dto.lastName,
          middleName: dto.middleName,
          roleId: role.id,
          companyId: dto.companyId,
          phoneNumber: dto.phoneNumber,
          isActive: dto.isActive,
          canChangePassword: dto.canChangePassword,
        },
      });

      if (role.code === 'student') {
        await tx.student.create({
          data: {
            id: user.id,
          },
        });
      }

      if (role.code === 'teacher') {
        await tx.teacher.create({
          data: {
            id: user.id,
          },
        });
      }

      return tx.user.findUnique({
        where: { id: user.id },
        select: UserSelect,
      });
    });
  }

  async update(id: number, dto: UpdateUserDto) {
    const { confirmPassword, password, ...rest } = dto;

    if (password && password !== confirmPassword) {
      throw new BadRequestException('Passwords do not match');
    }

    const data: any = { ...rest };

    if (password) {
      data.password = await bcrypt.hash(password, 10);
    }

    return this.prisma.user.update({
      where: { id },
      data,
    });
  }

  async remove(id: number) {
    try {
      return await this.prisma.user.delete({
        where: { id },
      });
    } catch (e) {
      if (e.code === 'P2025') {
        throw new NotFoundException('Company not found');
      }
      throw e;
    }
  }

  async changePassword(currentUser: CurrentUserType, dto: ChangePasswordDto) {
    const userId = Number(currentUser.id);

    const user = await this.prisma.user.findUnique({
      where: { id: userId },
    });

    if (!user) {
      throw new BadRequestException('User not found');
    }

    const isMatch = await bcrypt.compare(dto.currentPassword, user.password);

    if (!isMatch) {
      throw new UnauthorizedException('Current password incorrect');
    }

    const hashedPassword = await bcrypt.hash(dto.newPassword, 10);

    await this.prisma.user.update({
      where: { id: userId },
      data: { password: hashedPassword },
    });

    return {
      message: 'Password successfully changed',
    };
  }
}
