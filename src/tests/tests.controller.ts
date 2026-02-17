import {
  Body,
  Controller,
  Delete,
  Get,
  Param,
  ParseIntPipe,
  Patch,
  Post,
  Put,
  Query,
  Req,
  UseGuards,
} from '@nestjs/common';
import { TestsService } from './tests.service';
import { CreateTestDto } from './dto/create-test.dto';
import { UpdateTestDto } from './dto/update-test.dto';
import { CurrentUser } from '../auth/current-user';
import { JwtAuthGuard } from '../auth/jwt-auth.guard';
import { TestAttemptsService } from './test-attempts.service';

@UseGuards(JwtAuthGuard)
@Controller('tests')
export class TestsController {
  constructor(
    private readonly testsService: TestsService,
    private readonly testAttemptsService: TestAttemptsService,
  ) {}

  @Post()
  create(@Body() dto: CreateTestDto, @CurrentUser() user: any) {
    return this.testsService.create(dto, user);
  }

  @Get()
  findAll(@Query() query: any) {
    return this.testsService.findAll(query);
  }

  @Get(':id')
  findOne(@Param('id') id: string) {
    return this.testsService.findOne(+id);
  }

  @Put(':id')
  update(@Param('id') id: string, @Body() updateTestDto: UpdateTestDto) {
    return this.testsService.update(+id, updateTestDto);
  }

  @Delete(':id')
  remove(@Param('id') id: string) {
    return this.testsService.remove(+id);
  }

  @Patch(':id/questions')
  addQuestions(
    @Param('id', ParseIntPipe) id: number,
    @Body() dto: { questionIds: number[] },
  ) {
    return this.testsService.addQuestions(id, dto);
  }
  @Delete(':id/questions')
  removeQuestions(
    @Param('id') id: string,
    @Body() dto: { questionIds: number[] },
  ) {
    return this.testsService.removeQuestions(+id, dto);
  }

  @Get(':id/questions')
  getQuestions(@Param('id', ParseIntPipe) id: number, @Query() query: any) {
    return this.testsService.getQuestions(id, query);
  }

  @Post(':id/attempts/start')
  startTest(@Param('id', ParseIntPipe) testId: number, @Req() req) {
    return this.testAttemptsService.start(req.user.id, testId);
  }

  @Patch('attempts/:attemptId/answer')
  saveAnswer(
    @Param('attemptId', ParseIntPipe) attemptId: number,
    @Body()
    body: { questionId: number; optionId: number },
    @Req() req,
  ) {
    return this.testAttemptsService.saveAnswer(
      req.user.id,
      attemptId,
      body.questionId,
      body.optionId,
    );
  }

  @Post('attempts/:attemptId/finish')
  finishTest(@Param('attemptId', ParseIntPipe) attemptId: number, @Req() req) {
    return this.testAttemptsService.finish(req.user.id, attemptId);
  }
  @Get(':id/attempts/me')
  getActiveAttempt(@Param('id', ParseIntPipe) testId: number, @Req() req) {
    return this.testAttemptsService.getActiveAttempt(req.user.id, testId);
  }

  @Get(':id/stats')
  getStats(@Param('id', ParseIntPipe) id: number) {
    return this.testsService.getStats(id);
  }
}
