import {Prisma} from '@prisma/client';

export const GroupSelect = Prisma.validator<Prisma.GroupSelect>()({
    id: true,
    name: true,
    code: true,
    description: true,
    level: true,
    startDate: true,
    endDate: true,
    isActive: true,

    subjectId: true,
    subject: {
        select: {
            id: true,
            name: true,
        },
    },
    teachers: {
        select: {
            id: true,
            user: true
        },
    },

    createdAt: true,
    updatedAt: true,
});
