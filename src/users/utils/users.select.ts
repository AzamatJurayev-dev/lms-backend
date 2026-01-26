import {Prisma} from '@prisma/client';

export const UserSelect = Prisma.validator<Prisma.UserSelect>()({
    id: true,
    username: true,
    firstName: true,
    lastName: true,
    middleName: true,
    role: true,
    company: true,
    isActive: true,
    phoneNumber: true,
    canChangePassword: true,
    createdAt: true,
    updatedAt: true,
});
