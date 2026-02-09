import { Injectable } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';

@Injectable()
export class PaymentsService {
  constructor(private readonly prisma: PrismaService) {}

  async createPayment(dto: {
    studentId: number;
    groupId?: number;
    amount: number;
    type?: 'PAYMENT' | 'REFUND';
    note?: string;
  }) {
    return this.prisma.studentPayment.create({
      data: {
        studentId: dto.studentId,
        groupId: dto.groupId,
        amount: dto.amount,
        type: dto.type ?? 'PAYMENT',
        note: dto.note,
      },
    });
  }

  getStudentPayments(studentId: number) {
    return this.prisma.studentPayment.findMany({
      where: { studentId },
      orderBy: { paidAt: 'desc' },
    });
  }

  async getGroupDebts(groupId: number) {
    const group = await this.prisma.group.findUniqueOrThrow({
      where: { id: groupId },
      include: {
        students: {
          include: {
            user: true,
          },
        },
        groupFee: true,
      },
    });

    const feePerStudent = group.groupFee?.monthlyFee ?? 0;

    const payments = await this.prisma.studentPayment.findMany({
      where: { groupId },
      select: {
        studentId: true,
        amount: true,
        type: true,
      },
    });

    const paidMap = new Map<number, number>();
    for (const p of payments) {
      const sign = p.type === 'REFUND' ? -1 : 1;
      paidMap.set(
        p.studentId,
        (paidMap.get(p.studentId) ?? 0) + sign * p.amount,
      );
    }

    const students = group.students.map((student) => {
      const fullName = [
        student.user.firstName,
        student.user.lastName,
        student.user.middleName,
      ]
        .filter(Boolean)
        .join(' ');

      const totalPaid = paidMap.get(student.id) ?? 0;
      const debt = Math.max(feePerStudent - totalPaid, 0);

      return {
        studentId: student.id,
        fullName,
        totalPaid,
        fee: feePerStudent,
        debt,
      };
    });

    return {
      group: {
        id: group.id,
        name: group.name,
        code: group.code,
      },
      students,
    };
  }

  async exportGroupDebtsCsv(
    groupId: number,
  ): Promise<{ filename: string; content: Buffer }> {
    const data = await this.getGroupDebts(groupId);

    const header = 'Student ID,Full Name,Fee,Total Paid,Debt';
    const rows = data.students.map((s) =>
      [s.studentId, `"${s.fullName}"`, s.fee, s.totalPaid, s.debt].join(','),
    );

    const csv = [header, ...rows].join('\n');
    const filename = `group-${data.group.code}-debts.csv`;

    return {
      filename,
      content: Buffer.from(csv, 'utf-8'),
    };
  }
}
