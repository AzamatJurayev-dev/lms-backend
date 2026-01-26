import {Body, Controller, Get, Param, Post, Put, Query, Req, UseGuards} from '@nestjs/common';
import {UsersService} from './users.service';
import {CreateUserDto} from './dto/create-user.dto';
import {UpdateUserDto} from './dto/update-user.dto';
import {JwtAuthGuard} from "../auth/jwt-auth.guard";
import {ParamsDTO} from "../common/query/query-dto";

@UseGuards(JwtAuthGuard)
@Controller('users')
export class UsersController {
    constructor(private readonly usersService: UsersService) {
    }

    @Post()
    create(@Body() createUserDto: CreateUserDto) {
        return this.usersService.create(createUserDto);
    }

    @Get()
    findAll(@Query() query: ParamsDTO) {
        return this.usersService.getAll(query?.page ?? 1, query?.page_size ?? 10);
    }

    @Get("me")
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
}
