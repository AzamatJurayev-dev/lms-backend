import {Body, Controller, Delete, Get, Param, Patch, Post, Query} from '@nestjs/common';
import {GroupsService} from './groups.service';
import {CreateGroupDto} from './dto/create-group.dto';
import {UpdateGroupDto} from './dto/update-group.dto';
import {ParamsDTO} from "../common/query/query-dto";

@Controller('groups')
export class GroupsController {
    constructor(private readonly groupsService: GroupsService) {
    }

    @Post()
    create(@Body() createGroupDto: CreateGroupDto) {
        return this.groupsService.create(createGroupDto);
    }

    @Get()
    findAll(@Query() query: ParamsDTO) {
        return this.groupsService.findAll(query.page ?? 1, query.page_size ?? 10);
    }

    @Get(':id')
    findOne(@Param('id') id: string) {
        return this.groupsService.findOne(+id);
    }

    @Patch(':id')
    update(@Param('id') id: string, @Body() updateGroupDto: UpdateGroupDto) {
        return this.groupsService.update(+id, updateGroupDto);
    }

    @Delete(':id')
    remove(@Param('id') id: string) {
        return this.groupsService.remove(+id);
    }
}
