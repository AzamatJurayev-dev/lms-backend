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
  UseGuards,
} from '@nestjs/common';
import { TestsService } from './tests.service';
import { CreateTestDto } from './dto/create-test.dto';
import { UpdateTestDto } from './dto/update-test.dto';
import { CurrentUser } from '../auth/current-user';
import { JwtAuthGuard } from '../auth/jwt-auth.guard';

@UseGuards(JwtAuthGuard)
@Controller('tests')
export class TestsController {
  constructor(private readonly testsService: TestsService) {}

  @Post()
  create(@Body() dto: CreateTestDto, @CurrentUser() user: any) {
    return this.testsService.create(dto, user);
  }

  @Get()
  findAll(@Param() query: any) {
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
    @Param('id') id: string,
    @Body() dto: { questionIds: number[] },
  ) {
    return this.testsService.addQuestions(+id, dto);
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
}
