import {Body, Controller, Get, Param, Patch, Query} from '@nestjs/common';
import {StudentsService} from './students.service';
import {UpdateStudentDto} from './dto/update-student.dto';
import {ParamsDTO} from "../common/query/query-dto";

@Controller('students')
export class StudentsController {
    constructor(private readonly studentsService: StudentsService) {
    }

    @Get()
    findAll(@Query() query: ParamsDTO) {
        return this.studentsService.findAll(query.page ?? 1, query.page_size ?? 10);
    }

    @Get(':id')
    findOne(@Param('id') id: string) {
        return this.studentsService.findOne(+id);
    }

    @Patch(':id')
    update(@Param('id') id: string, @Body() updateStudentDto: UpdateStudentDto) {
        return this.studentsService.update(+id, updateStudentDto);
    }
}
