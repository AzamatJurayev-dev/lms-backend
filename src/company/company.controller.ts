import {Body, Controller, Delete, Get, Param, ParseIntPipe, Patch, Post, Put, Query} from '@nestjs/common';
import {CompanyService} from './company.service';
import {CreateCompanyDto} from './dto/create-company.dto';
import {UpdateCompanyDto} from './dto/update-company.dto';
import {ParamsDTO} from "../common/query/query-dto";
import {ApiOkResponse, ApiOperation, ApiParam, ApiResponse, ApiTags} from "@nestjs/swagger";

@ApiTags('Companies')
@Controller('company')
export class CompanyController {
    constructor(private readonly companyService: CompanyService) {
    }

    @ApiOperation({summary: 'Create company'})
    @ApiResponse({status: 201, type: CreateCompanyDto})
    @Post()
    create(@Body() createCompanyDto: CreateCompanyDto) {
        return this.companyService.create(createCompanyDto);
    }

    @Get()
    findAll(@Query() query: ParamsDTO) {
        return this.companyService.findAll(query?.page ?? 1, query?.page_size ?? 10);
    }

    @Get(':id')
    findOne(@Param('id') id: string) {
        return this.companyService.findOne(+id);
    }

    @ApiOperation({summary: 'Update company'})
    @ApiResponse({status: 201, type: CreateCompanyDto})
    @Put(':id')
    update(@Param('id') id: string, @Body() updateCompanyDto: UpdateCompanyDto) {
        return this.companyService.update(+id, updateCompanyDto);
    }

    @Patch(':id')
    @ApiOperation({summary: 'Update company (partial)'})
    @ApiParam({name: 'id', type: Number})
    @ApiOkResponse({type: UpdateCompanyDto})
    updatePartial(
        @Param('id', ParseIntPipe) id: number,
        @Body() dto: UpdateCompanyDto,
    ) {
        return this.companyService.update(id, dto);
    }

    @Delete(':id')
    remove(@Param('id') id: string) {
        return this.companyService.remove(+id);
    }
}
