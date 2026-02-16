import {
  BadRequestException,
  Injectable,
  NotFoundException,
} from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';
import { CreateRoleDto } from './dto/create-role.dto';
import { UpdateRoleDto } from './dto/update-role.dto';
import { buildQuery } from '../common/query/query.helper';
import { paginate } from '../common/pagination/pagination.helper';

@Injectable()
export class RolesService {
  constructor(private prisma: PrismaService) {}

  async create(dto: CreateRoleDto) {
    const exists = await this.prisma.role.findUnique({
      where: { code: dto.code },
    });

    if (exists) {
      throw new BadRequestException('Role code already exists');
    }

    return this.prisma.role.create({
      data: {
        code: dto.code,
        isActive: dto.isActive ?? true,
        translations: {
          create: dto.translations.map((t) => ({
            lang: t.lang,
            name: t.name,
          })),
        },
        isPublic: dto.isPublic,
        isSystem: false,
        permissions: {
          connect: dto.permission_ids.map((id) => ({ id })),
        },
      },
      select: {
        id: true,
        translations: {
          select: {
            lang: true,
            name: true,
          },
        },
        code: true,
        isActive: true,
        isPublic: true,
        permissions: true,
      },
    });
  }

  async findAll(query: any, lang: string) {
    const q = buildQuery(
      {
        page: query.page,
        pageSize: query.pageSize,
        ordering: query.ordering,
        search: query.search,
        filters: {
          isActive: query.isActive,
        },
      },
      {
        allowedOrderFields: ['isActive'],
        allowedFilterFields: ['isActive'],
        searchableFields: ['code'],
      },
    );

    const where: any = {
      ...q.where,
      isSystem: false,
    };
    const [roles, total] = await Promise.all([
      this.prisma.role.findMany({
        skip: q.skip,
        take: q.take,
        where,
        orderBy: q.orderBy,
        select: {
          id: true,
          code: true,
          translations: {
            where: {
              lang: { in: [lang, 'en'] },
            },
            select: {
              lang: true,
              name: true,
            },
          },
          isActive: true,
          isPublic: true,
          permissions: true,
        },
      }),
      this.prisma.role.count({
        where,
      }),
    ]);

    const mappedRoles = roles.map((role) => {
      const t =
        role.translations.find((t) => t.lang === lang) ??
        role.translations.find((t) => t.lang === 'en');

      return {
        id: role.id,
        code: role.code,
        name: t?.name ?? role.code,
        isActive: role.isActive,
        isPublic: role.isPublic,
      };
    });

    return paginate(mappedRoles, total, q.page, q.pageSize);
  }

  async findOne(id: number) {
    const role = await this.prisma.role.findUnique({
      where: { id },
      select: {
        id: true,
        code: true,
        isActive: true,
        isPublic: true,
        permissions: true,
        translations: {
          select: {
            lang: true,
            name: true,
          },
        },
      },
    });

    if (!role) {
      throw new NotFoundException('Role not found');
    }

    return {
      id: role.id,
      code: role.code,
      isActive: role.isActive,
      isPublic: role.isPublic,
      permissions: role.permissions,
      translations: role.translations,
    };
  }

  async update(id: number, dto: UpdateRoleDto) {
    const role = await this.prisma.role.findUnique({
      where: { id },
    });

    if (!role) {
      throw new NotFoundException('Role not found');
    }

    if (dto.code && dto.code !== role.code) {
      const exists = await this.prisma.role.findUnique({
        where: { code: dto.code },
      });

      if (exists) {
        throw new BadRequestException('Role code already exists');
      }
    }

    return this.prisma.role.update({
      where: { id },
      data: {
        code: dto.code,
        isActive: dto.isActive,
        isPublic: dto.isPublic,

        translations: dto.translations
          ? {
              deleteMany: {},
              create: dto.translations.map((t) => ({
                lang: t.lang,
                name: t.name,
              })),
            }
          : undefined,
        permissions: dto.permission_ids
          ? {
              set: dto.permission_ids.map((id) => ({ id })),
            }
          : undefined,
      },
      select: {
        id: true,
        code: true,
        isActive: true,
        isPublic: true,
        permissions: true,
        translations: {
          select: {
            lang: true,
            name: true,
          },
        },
      },
    });
  }

  async remove(id: number) {
    try {
      return await this.prisma.role.delete({
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
