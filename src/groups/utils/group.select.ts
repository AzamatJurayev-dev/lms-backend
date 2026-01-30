import {Prisma} from '@prisma/client';

export const GroupSelect = Prisma.validator<Prisma.GroupSelect>()({
    id: true,
    name: true,
    code: true,
    description: true,
    startDate: true,
    endDate: true,
    isActive: true,
    subjectId: true,
    room: {
        select: {
            id: true,
            name: true,
        },
    },
    level: {
        select: {
            id: true,
            name: true,
        },
    },
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
