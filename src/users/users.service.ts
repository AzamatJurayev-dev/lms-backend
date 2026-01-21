import {Injectable, BadRequestException} from '@nestjs/common';
import {PrismaService} from '../prisma/prisma.service';
import {CreateUserDto} from './dto/create-user.dto';
import * as bcrypt from 'bcrypt';
import {paginate} from "../common/pagination/pagination.helper";
import {UpdateUserDto} from "./dto/update-user.dto";
import {PartialType} from "@nestjs/mapped-types";

@Injectable()
export class UsersService {
    constructor(private prisma: PrismaService) {
    }

    async getAll(page: number, page_size: number) {
        const skip = (page - 1) * page_size;

        const [users, total] = await Promise.all([
            this.prisma.user.findMany({
                skip,
                take: page_size,
                select: {
                    id: true,
                    username: true,
                    role: true,
                    createdAt: true,
                },
            }),
            this.prisma.user.count(),
        ]);

        return paginate(users, total, page, page_size);
    }

    async findById(id: number) {
        const user = this.prisma.user.findUnique({
            where: {id},
        })
        if (!user) {
            throw new BadRequestException('User not found');
        }
        return user;
    }

    async create(dto: CreateUserDto) {
        const existing = await this.prisma.user.findUnique({
            where: {username: dto.username},
        });

        if (existing) {
            throw new BadRequestException('Username already exists');
        }

        const hashedPassword = await bcrypt.hash(dto.password, 10);

        return this.prisma.user.create({
            data: {
                username: dto.username,
                password: hashedPassword,
                role: 'USER', // default
            },
            select: {
                id: true,
                username: true,
                role: true,
                createdAt: true,
            },
        });
    }

    async update(id: number, dto: UpdateUserDto) {
        const user = await this.findById(id);

        if (!user) {
            throw new BadRequestException("User not found");
        }

        return this.prisma.user.update({
            where: {id},
            data: {
                ...dto,
            },
        });
    }
}
