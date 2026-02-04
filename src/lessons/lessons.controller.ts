import {Body, Controller, Delete, Get, Param, ParseIntPipe, Patch, Post} from '@nestjs/common';
import {LessonsService} from './lessons.service';
import {CreateLessonDto} from './dto/create-lesson.dto';
import {UpdateLessonDto} from './dto/update-lesson.dto';
import {ApiOperation, ApiResponse} from "@nestjs/swagger";
import {BulkAttendanceDto} from "./dto/create-lesson-attendance.dto";
import {BulkPerformanceDto} from "./dto/create-performance.dto";

@Controller('lessons')
export class LessonsController {
    constructor(private readonly lessonsService: LessonsService) {
    }

    @Post()
    create(@Body() createLessonDto: CreateLessonDto) {
        return this.lessonsService.create(createLessonDto);
    }

    @Get()
    findAll(@Param() query: any) {
        return this.lessonsService.findAll(query);
    }

    @Get(':id')
    findOne(@Param('id') id: string) {
        return this.lessonsService.findOne(+id);
    }

    @Patch(':id')
    update(@Param('id') id: string, @Body() updateLessonDto: UpdateLessonDto) {
        return this.lessonsService.update(+id, updateLessonDto);
    }

    @Delete(':id')
    remove(@Param('id') id: string) {
        return this.lessonsService.remove(+id);
    }


    @Patch("attendance")
    @ApiOperation({summary: "Save lesson attendance (bulk)"})
    @ApiResponse({status: 201, type: BulkAttendanceDto})
    addBulkAttendance(@Body() dto: BulkAttendanceDto) {
        return this.lessonsService.addBulkAttendance(dto);
    }

    @Patch("performance")
    @ApiOperation({summary: "Save lesson performance (bulk)"})
    @ApiResponse({status: 201, type: BulkPerformanceDto})
    addBulkPerformance(@Body() dto: BulkPerformanceDto) {
        return this.lessonsService.addBulkPerformance(dto);
    }

    @Get(":lessonId/attendance")
    @ApiOperation({summary: "Get lesson attendance"})
    getAttendance(@Param("lessonId", ParseIntPipe) lessonId: number) {
        return this.lessonsService.getAttendance(lessonId);
    }

    @Get(":lessonId/performance")
    @ApiOperation({summary: "Get lesson performance"})
    getPerformance(@Param("lessonId", ParseIntPipe) lessonId: number) {
        return this.lessonsService.getPerformance(lessonId);
    }

}
