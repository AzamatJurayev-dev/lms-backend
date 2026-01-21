import {Controller, Get, Post, Body, Patch, Param, Delete, Query, UseGuards, Req, Put} from '@nestjs/common';
import {UsersService} from './users.service';
import {CreateUserDto} from './dto/create-user.dto';
import {UpdateUserDto} from './dto/update-user.dto';
import {PaginationQueryDto} from "../common/pagination/pagination-query.dto";
import {JwtAuthGuard} from "../auth/jwt-auth.guard";

@Controller('users')
export class UsersController {
    constructor(private readonly usersService: UsersService) {
    }

    @Post()
    create(@Body() createUserDto: CreateUserDto) {
        return this.usersService.create(createUserDto);
    }

    @Get()
    findAll(@Query() query: PaginationQueryDto) {
        return this.usersService.getAll(query?.page ?? 1, query?.page_size ?? 10);
    }

    @UseGuards(JwtAuthGuard)
    @Get("me")
    async me(@Req() req: any) {
        return this.usersService.findById(req.user.id);
    }

    @Put(':id')
    update(@Param('id') id: string, @Body() updateUserDto: UpdateUserDto) {
        return this.usersService.update(+id, updateUserDto);
    }
}
