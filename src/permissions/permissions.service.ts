import {Injectable} from '@nestjs/common';
import {PrismaService} from '../prisma/prisma.service';
import {mapPermissionTree} from './permissions.mapper';

@Injectable()
export class PermissionsService {
    constructor(private prisma: PrismaService) {
    }

    async buildTree(parentId: number | null = null) {
        const permissions = await this.prisma.permission.findMany({
            where: {parentId},
            include: {
                translations: true,
            },
            orderBy: {id: 'asc'},
        });

        return Promise.all(
            permissions.map(async (perm) => ({
                ...perm,
                children: await this.buildTree(perm.id),
            })),
        );
    }

    async getPermissions(lang = 'uz') {
        const rawTree = await this.buildTree(null);
        return mapPermissionTree(rawTree, new Set(), lang);
    }
}
