import {
  Body,
  Controller,
  Delete,
  Get,
  Param,
  Post,
  Put,
  Query,
} from '@nestjs/common';
import { LevelsService } from './levels.service';
import { CreateLevelDto } from './dto/create-level.dto';
import { UpdateLevelDto } from './dto/update-level.dto';
import { ParamsDTO } from '../common/query/query-dto';

@Controller('levels')
export class LevelsController {
  constructor(private readonly levelsService: LevelsService) {}

  @Post()
  create(@Body() createLevelDto: CreateLevelDto) {
    return this.levelsService.create(createLevelDto);
  }

  @Get()
  findAll(@Query() query: ParamsDTO) {
    return this.levelsService.findAll(query.page ?? 1, query.page_size ?? 10);
  }

  @Get(':id')
  findOne(@Param('id') id: string) {
    return this.levelsService.findOne(+id);
  }

  @Put(':id')
  update(@Param('id') id: string, @Body() updateLevelDto: UpdateLevelDto) {
    return this.levelsService.update(+id, updateLevelDto);
  }

  @Delete(':id')
  remove(@Param('id') id: string) {
    return this.levelsService.remove(+id);
  }
}
