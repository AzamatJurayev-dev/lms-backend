import { Injectable, OnModuleDestroy } from '@nestjs/common';
import { PrismaClient } from '@prisma/client';
import { requestContext } from '../common/context/request-context';

const COMPANY_MODELS = [
    'User',
    'Student',
    'Teacher',
    'Group',
    'Lesson',
];

@Injectable()
export class PrismaService
    extends PrismaClient
    implements OnModuleDestroy
{
    constructor() {
        super();

        const ctxStorage = requestContext;

        const prisma = this.$extends({
            query: {
                $allModels: {
                    async $allOperations({ model, operation, args, query }) {
                        const ctx = ctxStorage.getStore();

                        // 🔓 superadmin yoki context yo‘q
                        if (!ctx || ctx.role === 'SUPERADMIN') {
                            return query(args);
                        }

                        // 🔒 faqat companyId bo‘lgan modellarga
                        if (!COMPANY_MODELS.includes(model)) {
                            return query(args);
                        }

                        // ===== FIND / UPDATE / DELETE =====
                        if (
                            [
                                'findMany',
                                'findFirst',
                                'findUnique',
                                'findFirstOrThrow',
                                'findUniqueOrThrow',
                                'update',
                                'updateMany',
                                'delete',
                                'deleteMany',
                                'count',
                            ].includes(operation)
                        ) {
                            if (args && 'where' in args && args.where) {
                                (args.where as any).companyId = ctx.companyId;
                            }
                        }

                        // ===== CREATE =====
                        if (operation === 'create') {
                            if (args && 'data' in args && args.data) {
                                (args.data as any).companyId = ctx.companyId;
                            }
                        }

                        // ===== CREATE MANY (ENG MUHIM JOY) =====
                        if (operation === 'createMany') {
                            if (args && 'data' in args && Array.isArray(args.data)) {
                                args.data = (args.data as any[]).map((item) => ({
                                    ...item,
                                    companyId: ctx.companyId,
                                }));
                            }
                        }

                        return query(args);
                    },
                },
            },
        });

        Object.assign(this, prisma);
    }

    async onModuleDestroy() {
        await this.$disconnect();
    }
}
