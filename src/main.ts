import { ValidationPipe } from '@nestjs/common';
import { NestFactory } from '@nestjs/core';
import { AppModule } from './app.module';
import { ResponseInterceptor } from './common/interceptors/response.interceptor';
import { DocumentBuilder, SwaggerModule } from '@nestjs/swagger';
import { ContextInterceptor } from './common/interceptors/context.interceptor';
import cookieParser from 'cookie-parser';

const config = new DocumentBuilder()
  .setTitle('Admin API')
  .setDescription('Company management endpoints')
  .setVersion('1.0')
  .addBearerAuth()
  .build();

async function bootstrap() {
  const app = await NestFactory.create(AppModule);

  const document = SwaggerModule.createDocument(app, config);
  SwaggerModule.setup('api/docs', app, document);

  app.useGlobalPipes(
    new ValidationPipe({
      whitelist: true,
      forbidNonWhitelisted: true,
      transform: true,
    }),
  );

  app.useGlobalInterceptors(
    new ContextInterceptor(),
    new ResponseInterceptor(),
  );
  app.enableCors({
    origin: ['https://lms-nine-mu.vercel.app', 'http://localhost:3000'],
    credentials: true,
  });

  app.use(cookieParser());
  await app.listen(process.env.PORT || 8080);
}

bootstrap();
