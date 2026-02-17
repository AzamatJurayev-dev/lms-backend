import { Module } from '@nestjs/common';
import { TestsService } from './tests.service';
import { TestsController } from './tests.controller';
import { TestAttemptsService } from './test-attempts.service';

@Module({
  controllers: [TestsController],
  providers: [TestsService, TestAttemptsService],
})
export class TestsModule {}
