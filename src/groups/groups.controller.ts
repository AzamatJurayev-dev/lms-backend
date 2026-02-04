import {Body, Controller, Delete, Get, Param, ParseIntPipe, Patch, Post, Put, Query} from '@nestjs/common';
import {GroupsService} from './groups.service';
import {CreateGroupDto} from './dto/create-group.dto';
import {UpdateGroupDto} from './dto/update-group.dto';
import {ParamsDTO} from "../common/query/query-dto";
import {AddStudentsDto} from "./dto/add-students.dto";
import {ExtraLessonDto} from "./dto/extra-lesson.dto";

@Controller('groups')
export class GroupsController {
    constructor(private readonly groupsService: GroupsService) {
    }

    @Post()
    create(@Body() dto: CreateGroupDto) {
        return this.groupsService.create(dto);
    }

    @Get()
    findAll(@Query() query: ParamsDTO) {
        return this.groupsService.findAll(query.page ?? 1, query.page_size ?? 10);
    }

    @Get(':id')
    findOne(@Param('id', ParseIntPipe) id: number) {
        return this.groupsService.findOne(id);
    }

    @Patch(':id')
    update(
        @Param('id', ParseIntPipe) id: number,
        @Body() dto: UpdateGroupDto
    ) {
        return this.groupsService.update(id, dto);
    }

    @Delete(':id')
    remove(@Param('id', ParseIntPipe) id: number) {
        return this.groupsService.remove(id);
    }
    // ---------- STUDENTS ----------
    @Put(':id/students')
    addStudents(
        @Param('id', ParseIntPipe) groupId: number,
        @Body() dto: AddStudentsDto
    ) {
        return this.groupsService.addStudents(groupId, dto);
    }

    @Get(':id/students')
    getStudents(@Param('id', ParseIntPipe) groupId: number) {
        return this.groupsService.getStudents(groupId);
    }

    @Delete(':id/students')
    removeStudents(
        @Param('id', ParseIntPipe) groupId: number,
        @Body() dto: { ids: number[] }
    ) {
        return this.groupsService.removeStudents(groupId, dto.ids);
    }
    // ---------- SCHEDULE ----------
    @Post(':id/schedule')
    addSchedule(
        @Param('id', ParseIntPipe) groupId: number,
        @Body() dto: any
    ) {
        return this.groupsService.addSchedule(groupId, dto);
    }

    @Get(':id/schedule')
    getSchedules(@Param('id', ParseIntPipe) groupId: number) {
        return this.groupsService.getSchedules(groupId);
    }

    @Put(':id/schedule/:scheduleId')
    updateSchedule(
        @Param('id', ParseIntPipe) groupId: number,
        @Param('scheduleId', ParseIntPipe) scheduleId: number,
        @Body() dto: any
    ) {
        return this.groupsService.updateSchedule(groupId, scheduleId, dto);
    }

    @Delete(':id/schedule/:scheduleId')
    deleteSchedule(
        @Param('id', ParseIntPipe) groupId: number,
        @Param('scheduleId', ParseIntPipe) scheduleId: number
    ) {
        return this.groupsService.deleteSchedule(groupId, scheduleId);
    }

    @Get(':id/lessons')
    getLessons(@Param('id', ParseIntPipe) groupId: number) {
        return this.groupsService.getLessons(groupId);
    }

    @Post(':id/lessons/extra')
    createExtraLesson(
        @Param('id', ParseIntPipe) groupId: number,
        @Body() dto: ExtraLessonDto,
    ) {
        return this.groupsService.createExtraLesson(groupId, dto);
    }
}
