import {
  Body,
  Controller,
  Delete,
  Get,
  Param,
  Patch,
  Post,
  Put,
  Query,
  Req,
  UseGuards,
} from '@nestjs/common';
import { UsersService } from './users.service';
import { CreateUserDto } from './dto/create-user.dto';
import { UpdateUserDto } from './dto/update-user.dto';
import { JwtAuthGuard } from '../auth/jwt-auth.guard';
import { CurrentUser } from '../auth/current-user';
import type { CurrentUserType } from '../common/types/current-user.type';
import * as currentUserType from '../common/types/current-user.type';
import { ChangePasswordDto } from './dto/change-password.dto';

@UseGuards(JwtAuthGuard)
@Controller('users')
export class UsersController {
  constructor(private readonly usersService: UsersService) {}

  @Post()
  create(@Body() createUserDto: CreateUserDto) {
    return this.usersService.create(createUserDto);
  }

  @Get()
  findAll(
    @Query() query: any,
    @CurrentUser() user: currentUserType.CurrentUserType,
  ) {
    return this.usersService.getAll(query, user);
  }

  @Get('me')
  async me(@Req() req: any) {
    return this.usersService.findById(req.user.id);
  }

  @Get(':id')
  async findById(@Param('id') id: string) {
    return this.usersService.findById(+id);
  }

  @Put(':id')
  update(@Param('id') id: string, @Body() updateUserDto: UpdateUserDto) {
    return this.usersService.update(+id, updateUserDto);
  }

  @Delete(':id')
  async remove(@Param('id') id: string) {
    return this.usersService.remove(+id);
  }

  @Patch('change-password')
  async changePassword(
    @CurrentUser() user: CurrentUserType,
    @Body() dto: ChangePasswordDto,
  ) {
    return this.usersService.changePassword(user, dto);
  }
}
