import {
  Controller,
  Delete,
  Get,
  Param,
  ParseIntPipe,
  Post,
  Query,
  Res,
  UploadedFile,
  UseGuards,
  UseInterceptors,
} from '@nestjs/common';
import express from 'express';
import { FileInterceptor } from '@nestjs/platform-express';
import { FilesService } from './files.service';
import { JwtAuthGuard } from '../auth/jwt-auth.guard';
import { CurrentUser } from '../auth/current-user';
import type { CurrentUserType } from '../common/types/current-user.type';
import { ApiBody, ApiConsumes } from '@nestjs/swagger';

@Controller('files')
@UseGuards(JwtAuthGuard)
export class FilesController {
  constructor(private readonly filesService: FilesService) {}

  @Post()
  @UseInterceptors(FileInterceptor('file'))
  @ApiConsumes('multipart/form-data')
  @ApiBody({
    schema: {
      type: 'object',
      properties: {
        file: {
          type: 'string',
          format: 'binary',
        },
      },
      required: ['file'],
    },
  })
  upload(
    @UploadedFile() file: Express.Multer.File,
    @CurrentUser() user: CurrentUserType,
  ) {
    return this.filesService.upload(file, user);
  }

  @Get()
  getAll(
    @CurrentUser() user: any,
    @Query('page') page = 1,
    @Query('limit') limit = 10,
  ) {
    return this.filesService.getAll(user, +page, +limit);
  }

  @Get(':id')
  async getFile(
    @Param('id', ParseIntPipe) id: number,
    @CurrentUser() user: any,
    @Res() res: express.Response,
  ) {
    const { file, stream } = await this.filesService.getFileStream(id, user);

    res.setHeader('Content-Type', file.mimeType);
    res.setHeader('Content-Disposition', `inline; filename="${file.original}"`);

    stream.pipe(res);
  }

  @Delete(':id')
  remove(@Param('id', ParseIntPipe) id: number, @CurrentUser() user: any) {
    return this.filesService.remove(id, user);
  }
  @Get(':id/preview')
  @UseGuards(JwtAuthGuard)
  async preview(
    @Param('id', ParseIntPipe) id: number,
    @CurrentUser() user: any,
  ) {
    const url = await this.filesService.getPreviewUrl(id, user);
    return { url };
  }
}
