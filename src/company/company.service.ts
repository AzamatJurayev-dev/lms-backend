import {BadRequestException, Injectable, NotFoundException} from '@nestjs/common';
import {CreateCompanyDto} from './dto/create-company.dto';
import {UpdateCompanyDto} from './dto/update-company.dto';
import {PrismaService} from "../prisma/prisma.service";
import {CompanyPublicSelect} from "./utils/company.select";
import {buildQuery} from "../common/query/query.helper";
import {paginate} from "../common/pagination/pagination.helper";

@Injectable()
export class CompanyService {
    constructor(private prisma: PrismaService) {
    }

    async create(createCompanyDto: CreateCompanyDto) {
        const existing = await this.prisma.company.findUnique({
            where: {name: createCompanyDto.name},
        });

        if (existing) {
            throw new BadRequestException('Name already exists');
        }
        return this.prisma.company.create({
            data: createCompanyDto, select: CompanyPublicSelect
        });
    }

    async findAll(query: any) {
        const q = buildQuery(
            {
                page: query.page,
                pageSize: query.pageSize,
                ordering: query.ordering,
                search: query.search,
                date_from: query.date_from,
                date_to: query.date_to,
                filters: {
                    isActive: query.isActive,
                },
            },
            {
                allowedOrderFields: ['name', 'code', 'createdAt', 'isActive'],
                allowedFilterFields: ['isActive'],
                searchableFields: ['name', 'code', 'email', 'phone'],
                defaultOrderBy: {createdAt: 'desc'},
                dateField: 'createdAt',
            },
        );

        const [items, total] = await this.prisma.$transaction([
            this.prisma.company.findMany({
                skip: q.skip,
                take: q.take,
                where: q.where,
                orderBy: q.orderBy,
            }),
            this.prisma.company.count({
                where: q.where,
            }),
        ]);

        return paginate(items, total, q.page, q.pageSize)
    }
    async findOne(id: number) {
        const company = await this.prisma.company.findUnique({
            where: {id},
        });

        if (!company) {
            throw new BadRequestException('User not found');
        }

        return company;
    }
    async update(id: number, dto: UpdateCompanyDto) {
        try {
            return await this.prisma.company.update({
                where: {id},
                data: {
                    ...(dto.name !== undefined && {name: dto.name}),
                    ...(dto.code !== undefined && {code: dto.code}),
                    ...(dto.isActive !== undefined && {isActive: dto.isActive}),
                    ...(dto.address !== undefined && {address: dto.address}),
                    ...(dto.phone !== undefined && {phone: dto.phone}),
                    ...(dto.email !== undefined && {email: dto.email}),
                    ...(dto.description !== undefined && {description: dto.description}),
                },
                select: CompanyPublicSelect,
            });
        } catch (e) {
            if (e.code === 'P2025') {
                throw new NotFoundException('Company not found');
            }
            throw e;
        }
    }
    async remove(id: number) {
        try {
            return await this.prisma.company.delete({
                where: {id},
            });
        } catch (e) {
            if (e.code === 'P2025') {
                throw new NotFoundException('Company not found');
            }
            throw e;
        }
    }
}
