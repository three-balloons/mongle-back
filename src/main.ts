import { NestFactory } from '@nestjs/core';
import { AppModule } from './app.module';
import { ValidationPipe } from '@nestjs/common';
import { DocumentBuilder, SwaggerModule } from '@nestjs/swagger';
import * as express from 'express';
import { HttpExceptionFilter } from './utils/filter/http-exception.filter';

async function bootstrap() {
  const app = await NestFactory.create(AppModule);

  app.enableCors({
    origin: ['http://localhost:5173'],
    credentials: true,
    methods: 'GET,HEAD,PUT,PATCH,POST,DELETE',
    allowedHeaders: 'Content-Type, Authorization',
  });

  app.use(express.json());
  app.use(express.urlencoded({ extended: true }));

  // Enable global validation
  app.useGlobalPipes(
    new ValidationPipe({
      transform: true, // Enable automatic transformation using class-transformer
      whitelist: true, // Automatically strip properties that do not have decorators
    }),
  );

  app.useGlobalFilters(new HttpExceptionFilter());
  // Swagger setup
  const config = new DocumentBuilder()
    .setTitle('Mongle API')
    .setDescription('Mongle Back API')
    .setVersion('1.0')
    .addBearerAuth(
      {
        type: 'http',
        scheme: 'bearer',
        bearerFormat: 'JWT',
      },
      'jwt',
    )
    .build();
  const document = SwaggerModule.createDocument(app, config);
  SwaggerModule.setup('docs', app, document);

  await app.listen(process.env.PORT ?? 8080);
}
bootstrap();
