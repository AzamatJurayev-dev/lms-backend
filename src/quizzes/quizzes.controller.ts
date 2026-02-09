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
  Req,
} from '@nestjs/common';
import { QuizzesService } from './quizzes.service';
import { CreateQuizDto } from './dto/create-quiz.dto';
import { UpdateQuizDto } from './dto/update-quiz.dto';

@Controller('quizzes')
export class QuizzesController {
  constructor(private readonly quizzesService: QuizzesService) {}

  @Post()
  create(@Body() dto: CreateQuizDto, @Req() req: any) {
    return this.quizzesService.create(dto, req.user);
  }

  @Get()
  findAll(@Query() query: any) {
    return this.quizzesService.findAll(query);
  }

  @Get(':id')
  findOne(@Param('id', ParseIntPipe) id: number) {
    return this.quizzesService.findOne(id);
  }

  @Patch(':id')
  update(@Param('id', ParseIntPipe) id: number, @Body() dto: UpdateQuizDto) {
    return this.quizzesService.update(id, dto);
  }

  @Delete(':id')
  remove(@Param('id', ParseIntPipe) id: number) {
    return this.quizzesService.remove(id);
  }

  @Get(':id/questions')
  getQuestions(@Param('id', ParseIntPipe) id: number, @Query() query: any) {
    return this.quizzesService.getQuestions(id, query);
  }

  @Post(':id/questions')
  addQuestions(
    @Param('id', ParseIntPipe) id: number,
    @Body() dto: { questionIds: number[] },
  ) {
    return this.quizzesService.addQuestions(id, dto);
  }

  @Delete(':id/questions')
  removeQuestions(
    @Param('id', ParseIntPipe) id: number,
    @Body() dto: { questionIds: number[] },
  ) {
    return this.quizzesService.removeQuestions(id, dto);
  }
}
