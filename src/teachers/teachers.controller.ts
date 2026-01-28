import {Body, Controller, Get, Param, Patch, Put, Query} from '@nestjs/common';
import {TeachersService} from './teachers.service';
import {UpdateTeacherDto, UpdateTeacherSubjectDto} from './dto/update-teacher.dto';
import {ParamsDTO} from "../common/query/query-dto";

@Controller('teachers')
export class TeachersController {
    constructor(private readonly teachersService: TeachersService) {
    }


    @Get()
    findAll(@Query() query: ParamsDTO) {
        return this.teachersService.findAll(query.page ?? 1, query.page_size ?? 10);
    }

    @Get(':id')
    findOne(@Param('id') id: string) {
        return this.teachersService.findOne(+id);
    }

    @Patch(':id')
    update(@Param('id') id: string, @Body() updateTeacherDto: UpdateTeacherDto) {
        return this.teachersService.update(+id, updateTeacherDto);
    }

    @Put(":id/set-subject")
    setSubject(@Param('id') id: string, @Body() dto: UpdateTeacherSubjectDto) {
        return this.teachersService.setSubject(+id, dto)
    }
}
