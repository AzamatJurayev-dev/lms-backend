import {
  Body,
  Controller,
  Get,
  Param,
  ParseIntPipe,
  Post,
  StreamableFile,
  UseGuards,
} from '@nestjs/common';
import { PaymentsService } from './payments.service';
import { JwtAuthGuard } from '../auth/jwt-auth.guard';
import { CurrentUser } from '../auth/current-user';

@UseGuards(JwtAuthGuard)
@Controller('payments')
export class PaymentsController {
  constructor(private readonly paymentsService: PaymentsService) {}

  @Post()
  create(
    @CurrentUser() user: any,
    @Body()
    dto: {
      studentId: number;
      groupId?: number;
      amount: number;
      type?: 'PAYMENT' | 'REFUND';
      note?: string;
    },
  ) {
    // user hozircha faqat audit uchun ishlatilmayapti, lekin kerak bo'lsa log qo'shish mumkin
    return this.paymentsService.createPayment(dto);
  }

  @Get('students/:id')
  getStudentPayments(@Param('id', ParseIntPipe) id: number) {
    return this.paymentsService.getStudentPayments(id);
  }

  @Get('groups/:id/debts')
  getGroupDebts(@Param('id', ParseIntPipe) id: number) {
    return this.paymentsService.getGroupDebts(id);
  }

  @Get('groups/:id/debts.csv')
  async exportGroupDebtsCsv(
    @Param('id', ParseIntPipe) id: number,
  ): Promise<StreamableFile> {
    const { filename, content } =
      await this.paymentsService.exportGroupDebtsCsv(id);

    return new StreamableFile(content, {
      type: 'text/csv',
      disposition: `attachment; filename="${filename}"`,
    });
  }
}
