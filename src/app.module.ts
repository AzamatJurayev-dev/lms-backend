import {Module} from '@nestjs/common';
import {AppController} from './app.controller';
import {AppService} from './app.service';
import {PrismaModule} from './prisma/prisma.module';
import {UsersModule} from './users/users.module';
import {AuthModule} from './auth/auth.module';
import {JwtModule} from "@nestjs/jwt";
import { RolesModule } from './roles/roles.module';
import { CompanyModule } from './company/company.module';
import { PermissionsModule } from './permissions/permissions.module';
import { StudentsModule } from './students/students.module';
import { TeachersModule } from './teachers/teachers.module';
import { SubjectsModule } from './subjects/subjects.module';

@Module({
    imports: [PrismaModule, UsersModule, AuthModule, JwtModule.register({
        secret: process.env.JWT_SECRET || 'secret123',
        signOptions: {
            expiresIn: '1d',
        },
    }), RolesModule, CompanyModule, PermissionsModule, StudentsModule, TeachersModule, SubjectsModule,],
    controllers: [AppController],
    providers: [AppService],
})
export class AppModule {
}
