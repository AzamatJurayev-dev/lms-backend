import {Controller, Get, Headers} from '@nestjs/common';
import {PermissionsService} from './permissions.service';

@Controller('permissions')
export class PermissionsController {
    constructor(private readonly permissionsService: PermissionsService) {
    }

    @Get()
    getPermissions(
        @Headers('accept-language') lang = 'en'
    ) {
        return this.permissionsService.getPermissions(lang ?? 'uz');
    }
}
