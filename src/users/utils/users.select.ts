import { Prisma } from '@prisma/client';

export const UserSelect = Prisma.validator<Prisma.UserSelect>()({
  id: true,
  username: true,
  firstName: true,
  lastName: true,
  middleName: true,
  role: {
    select: {
      code: true,
    },
  },
  company: false,
  companyId: true,
  isActive: true,
  phoneNumber: true,
  canChangePassword: true,
  createdAt: true,
  updatedAt: true,
});
