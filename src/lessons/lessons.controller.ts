import {
  Body,
  Controller,
  Delete,
  Get,
  Param,
  ParseIntPipe,
  Patch,
  Post,
  Query,
  UseGuards,
} from '@nestjs/common';
import { LessonsService } from './lessons.service';
import { ApiOperation, ApiResponse } from '@nestjs/swagger';
import { BulkAttendanceDto } from './dto/create-lesson-attendance.dto';
import { BulkPerformanceDto } from './dto/create-performance.dto';
import { JwtAuthGuard } from '../auth/jwt-auth.guard';
import { CurrentUser } from '../auth/current-user';
import { ExtraLessonDto } from '../groups/dto/extra-lesson.dto';

@UseGuards(JwtAuthGuard)
@Controller('lessons')
export class LessonsController {
  constructor(private readonly lessonsService: LessonsService) {}

  @Get()
  findAll(@Query() query: any) {
    return this.lessonsService.findAll(query);
  }

  @Get('schedule/teacher')
  getTeacherSchedule(
    @CurrentUser() user: any,
    @Query() query: { date_from?: string; date_to?: string },
  ) {
    return this.lessonsService.getTeacherSchedule(user.id, query);
  }

  @Get('schedule/student')
  getStudentSchedule(
    @CurrentUser() user: any,
    @Query() query: { date_from?: string; date_to?: string },
  ) {
    return this.lessonsService.getStudentSchedule(user.id, query);
  }

  @Get(':id')
  findOne(@Param('id') id: string) {
    return this.lessonsService.findOne(+id);
  }

  @Patch(':id')
  update(@Param('id') id: string) {
    return this.lessonsService.update(+id);
  }

  @Delete(':id')
  remove(@Param('id') id: string) {
    return this.lessonsService.remove(+id);
  }
  @Post('extra')
  createExtraLesson(@Body() dto: ExtraLessonDto) {
    return this.lessonsService.createExtraLesson(dto);
  }

  @Patch('attendance')
  @ApiOperation({ summary: 'Save lesson attendance (bulk)' })
  @ApiResponse({ status: 201, type: BulkAttendanceDto })
  addBulkAttendance(@Body() dto: BulkAttendanceDto) {
    return this.lessonsService.addBulkAttendance(dto);
  }

  @Patch('performance')
  @ApiOperation({ summary: 'Save lesson performance (bulk)' })
  @ApiResponse({ status: 201, type: BulkPerformanceDto })
  addBulkPerformance(@Body() dto: BulkPerformanceDto) {
    return this.lessonsService.addBulkPerformance(dto);
  }

  @Get(':lessonId/attendance')
  @ApiOperation({ summary: 'Get lesson attendance' })
  getAttendance(@Param('lessonId', ParseIntPipe) lessonId: number) {
    return this.lessonsService.getAttendance(lessonId);
  }

  @Get(':lessonId/performance')
  @ApiOperation({ summary: 'Get lesson performance' })
  getPerformance(@Param('lessonId', ParseIntPipe) lessonId: number) {
    return this.lessonsService.getPerformance(lessonId);
  }
}
