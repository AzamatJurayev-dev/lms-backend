import {
  Body,
  Controller,
  Get,
  Param,
  ParseIntPipe,
  Put,
  Query,
  UseGuards,
} from '@nestjs/common';
import { StudentsService } from './students.service';
import type { CurrentUserType } from '../common/types/current-user.type';
import { CurrentUser } from '../auth/current-user';
import { JwtAuthGuard } from '../auth/jwt-auth.guard';
import { UpdateStudentDto } from './dto/update-student.dto';

@UseGuards(JwtAuthGuard)
@Controller('students')
export class StudentsController {
  constructor(private readonly studentsService: StudentsService) {}

  @Get()
  findAll(@Query() query: any, @CurrentUser() user: CurrentUserType) {
    return this.studentsService.findAll(query, user);
  }

  @Get(':id')
  findOne(@Param('id', ParseIntPipe) id: number) {
    return this.studentsService.findOne(id);
  }
  @Put('id')
  update(
    @Param('id', ParseIntPipe) id: number,
    @Body() data: UpdateStudentDto,
  ) {
    return this.studentsService.update(id, data);
  }
  @Get(':id/parents')
  getParent(@Param('id', ParseIntPipe) id: number) {
    return this.studentsService.getParents(id);
  }
  @Get(':id/groups')
  getGroups(@Param('id', ParseIntPipe) id: number) {
    return this.studentsService.getGroups(id);
  }
  @Get(':id/lessons')
  getLessons(@Param('id', ParseIntPipe) id: number) {
    return this.studentsService.getLessons(id);
  }
  @Get(':id/schedules')
  getSchedules(@Param('id', ParseIntPipe) id: number) {
    return this.studentsService.getStudentSchedules(id);
  }
}
