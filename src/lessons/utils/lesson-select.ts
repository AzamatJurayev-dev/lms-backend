import { Prisma } from '@prisma/client';

export const LessonSelect = {
  id: true,
  date: true,
  startTime: true,
  endTime: true,
  isExtra: true,
  isDone: true,
  isCanceled: true,
  subject: {
    select: {
      id: true,
      name: true,
    },
  },
  teacher: {
    select: {
      id: true,
      user: {
        select: {
          firstName: true,
          middleName: true,
          lastName: true,
        },
      },
    },
  },

  room: {
    select: {
      id: true,
      name: true,
      floor: true,
      number: true,
    },
  },
  group: {
    select: {
      id: true,
      name: true,
      code: true,
    },
  },
} satisfies Prisma.LessonSelect;
