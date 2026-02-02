import {Module} from '@nestjs/common';
import {GroupsService} from './groups.service';
import {GroupsController} from './groups.controller';
import {GroupsLessonsService} from "./groups-lessons.service";
import {PrismaModule} from "../prisma/prisma.module";

@Module({
  imports: [PrismaModule],
  controllers: [GroupsController],
  providers: [GroupsService, GroupsLessonsService],
})
export class GroupsModule {}
