import {Body, Controller, Delete, Get, Param, Patch, Post, UseGuards} from '@nestjs/common';
import {TestsService} from './tests.service';
import {CreateTestDto} from './dto/create-test.dto';
import {UpdateTestDto} from './dto/update-test.dto';
import {CurrentUser} from "../auth/current-user";
import {JwtAuthGuard} from "../auth/jwt-auth.guard";

@UseGuards(JwtAuthGuard)
@Controller('tests')
export class TestsController {
  constructor(private readonly testsService: TestsService) {}

  @Post()
  create(@Body() dto: CreateTestDto, @CurrentUser() user: any) {
    return this.testsService.create(dto, user);
  }

  @Get()
  findAll() {
    return this.testsService.findAll();
  }

  @Get(':id')
  findOne(@Param('id') id: string) {
    return this.testsService.findOne(+id);
  }

  @Patch(':id')
  update(@Param('id') id: string, @Body() updateTestDto: UpdateTestDto) {
    return this.testsService.update(+id, updateTestDto);
  }

  @Delete(':id')
  remove(@Param('id') id: string) {
    return this.testsService.remove(+id);
  }
}
