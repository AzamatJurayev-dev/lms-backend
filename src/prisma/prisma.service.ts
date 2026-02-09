import { Injectable, OnModuleDestroy } from '@nestjs/common';
import { PrismaClient } from '@prisma/client';
import { requestContext } from '../common/context/request-context';

// Barcha companyId maydoniga ega modellarning ro'yxati
const COMPANY_MODELS = [
  'User',
  'Student',
  'Teacher',
  'Group',
  'Lesson',
  'Parent',
  'Level',
  'Room',
  'Schedule',
  'Subject',
  'ChatRoom',
  'StudentPayment',
  'GroupFee',
  'CertificateTemplate',
  'Certificate',
];

@Injectable()
export class PrismaService extends PrismaClient implements OnModuleDestroy {
  constructor() {
    super();

    const ctxStorage = requestContext;

    const prisma = this.$extends({
      query: {
        $allModels: {
          async $allOperations({ model, operation, args, query }) {
            const ctx = ctxStorage.getStore();

            // 🔓 super admin yoki context yo‘q
            if (!ctx || ctx.role === 'super_admin') {
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
              if (args && 'where' in args && args.where && ctx.companyId != null) {
                (args.where as any).companyId = ctx.companyId;
              }
            }

            // ===== CREATE =====
            if (operation === 'create') {
              if (args && 'data' in args && args.data && ctx.companyId != null) {
                (args.data as any).companyId = ctx.companyId;
              }
            }

            // ===== CREATE MANY (ENG MUHIM JOY) =====
            if (operation === 'createMany') {
              if (args && 'data' in args && Array.isArray(args.data) && ctx.companyId != null) {
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
