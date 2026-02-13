import { Module } from '@nestjs/common';
import { AppController } from './app.controller';
import { AppService } from './app.service';
import { PrismaModule } from './prisma/prisma.module';
import { UsersModule } from './users/users.module';
import { AuthModule } from './auth/auth.module';
import { RolesModule } from './roles/roles.module';
import { CompanyModule } from './company/company.module';
import { PermissionsModule } from './permissions/permissions.module';
import { StudentsModule } from './students/students.module';
import { TeachersModule } from './teachers/teachers.module';
import { SubjectsModule } from './subjects/subjects.module';
import { GroupsModule } from './groups/groups.module';
import { LevelsModule } from './levels/levels.module';
import { RoomsModule } from './rooms/rooms.module';
import { LessonsModule } from './lessons/lessons.module';
import { QuestionsModule } from './questions/questions.module';
import { TestsModule } from './tests/tests.module';
import { QuizzesModule } from './quizzes/quizzes.module';
import { NotificationsModule } from './notifications/notifications.module';
import { ChatModule } from './chat/chat.module';
import { PaymentsModule } from './payments/payments.module';
import { CertificatesModule } from './certificates/certificates.module';
import { FilesModule } from './files/files.module';
import { MinioModule } from './minio/minio.module';
import { PlansModule } from './plans/plans.module';
import { ParentsModule } from './parents/parents.module';
import { SchedulesModule } from './schedules/schedules.module';

@Module({
  imports: [
    PrismaModule,
    UsersModule,
    AuthModule,
    RolesModule,
    CompanyModule,
    PermissionsModule,
    StudentsModule,
    TeachersModule,
    SubjectsModule,
    GroupsModule,
    LevelsModule,
    RoomsModule,
    LessonsModule,
    QuestionsModule,
    TestsModule,
    QuizzesModule,
    NotificationsModule,
    ChatModule,
    PaymentsModule,
    CertificatesModule,
    MinioModule,
    FilesModule,
    PlansModule,
    ParentsModule,
    SchedulesModule,
  ],
  controllers: [AppController],
  providers: [AppService],
})
export class AppModule {}
