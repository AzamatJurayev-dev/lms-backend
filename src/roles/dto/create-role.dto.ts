import {IsArray, IsBoolean, IsNotEmpty, IsOptional, IsString} from 'class-validator';

export class CreateRoleTranslationDto {
    @IsString()
    @IsNotEmpty()
    lang: string;

    @IsString()
    @IsNotEmpty()
    name: string;
}

export class CreateRoleDto {
    @IsString()
    @IsNotEmpty()
    code: string;

    @IsBoolean()
    @IsOptional()
    isActive?: boolean;

    @IsBoolean()
    @IsOptional()
    isPublic?: boolean;

    @IsArray()
    permission_ids: number[]

    @IsArray()
    translations: CreateRoleTranslationDto[];
}
