import {Body, Controller, Delete, Get, Param, Patch, Post, UseGuards} from '@nestjs/common';
import {QuestionsService} from './questions.service';
import {CreateQuestionDto} from './dto/create-question.dto';
import {UpdateQuestionDto} from './dto/update-question.dto';
import {CurrentUser} from "../auth/current-user";
import {JwtAuthGuard} from "../auth/jwt-auth.guard";

@Controller('questions')
export class QuestionsController {
    constructor(private readonly questionsService: QuestionsService) {
    }

    @UseGuards(JwtAuthGuard)
    @Post()
    create(@Body() dto: CreateQuestionDto, @CurrentUser() user: any) {
        return this.questionsService.create(dto, user);
    }

    @Get()
    findAll(@Param() query: any) {
        return this.questionsService.findAll(query);
    }

    @Get(':id')
    findOne(@Param('id') id: string) {
        return this.questionsService.findOne(+id);
    }

    @Patch(':id')
    update(@Param('id') id: string, @Body() updateQuestionDto: UpdateQuestionDto) {
        return this.questionsService.update(+id, updateQuestionDto);
    }

    @Delete(':id')
    remove(@Param('id') id: string) {
        return this.questionsService.remove(+id);
    }
}
