import {Body, Controller, Delete, Get, Headers, Param, Patch, Post, Query,} from '@nestjs/common';
import {RolesService} from './roles.service';
import {CreateRoleDto} from './dto/create-role.dto';
import {UpdateRoleDto} from './dto/update-role.dto';
import {ParamsDTO} from "../common/query/query-dto";

@Controller('roles')
export class RolesController {
    constructor(private readonly rolesService: RolesService) {
    }

    @Post()
    create(@Body() createRoleDto: CreateRoleDto) {
        return this.rolesService.create(createRoleDto);
    }

    @Get()
    findAll(@Headers('accept-language') lang = 'en', @Query() query: ParamsDTO) {
        return this.rolesService.getAll(lang);
    }

    @Get(':id')
    findOne(
        @Param('id') id: string,
    ) {
        return this.rolesService.findOne(+id);
    }

    @Patch(':id')
    update(@Param('id') id: string, @Body() updateRoleDto: UpdateRoleDto) {
        return this.rolesService.update(+id, updateRoleDto);
    }

    @Delete(':id')
    remove(@Param('id') id: string) {
        return this.rolesService.remove(+id);
    }
}
