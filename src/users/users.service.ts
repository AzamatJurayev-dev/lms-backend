import {
  BadRequestException,
  Injectable,
  NotFoundException,
} from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';
import { CreateUserDto } from './dto/create-user.dto';
import * as bcrypt from 'bcrypt';
import { paginate } from '../common/pagination/pagination.helper';
import { UpdateUserDto } from './dto/update-user.dto';
import { UserSelect } from './utils/users.select';

@Injectable()
export class UsersService {
  constructor(private prisma: PrismaService) {}

  async getAll(page: number, page_size: number) {
    const skip = (page - 1) * page_size;

    const [users, total] = await Promise.all([
      this.prisma.user.findMany({
        skip,
        take: page_size,
        select: UserSelect,
      }),
      this.prisma.user.count(),
    ]);

    const mappedUsers = users.map((user) => ({
      ...user,
      full_name: [user.firstName, user.lastName, user.middleName]
        .filter(Boolean)
        .join(' '),
    }));

    return paginate(mappedUsers, total, page, page_size);
  }

  async findById(id: number) {
    const user = await this.prisma.user.findUnique({
      where: { id },
      select: UserSelect,
    });

    if (!user) {
      throw new BadRequestException('User not found');
    }

    return user;
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
    await this.findById(id);

    const data: any = { ...dto };

    if (dto.password) {
      data.password = await bcrypt.hash(dto.password, 10);
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
}
