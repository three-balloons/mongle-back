import { NestFactory } from '@nestjs/core';
import { AppModule } from './app.module';
import { ValidationPipe } from '@nestjs/common';
import { DocumentBuilder, SwaggerModule } from '@nestjs/swagger';

async function bootstrap() {
  const app = await NestFactory.create(AppModule);

  // Enable global validation
  app.useGlobalPipes(
    new ValidationPipe({
      transform: true, // Enable automatic transformation using class-transformer
      whitelist: true, // Automatically strip properties that do not have decorators
    }),
  );

  // Swagger setup
  const config = new DocumentBuilder()
    .setTitle('Mongle API')
    .setDescription('Mongle Back API')
    .setVersion('1.0')
    .addCookieAuth('Authentication')
    .build();
  const document = SwaggerModule.createDocument(app, config);
  SwaggerModule.setup('docs', app, document); // 'api' is the URL path to access Swagger

  await app.listen(process.env.PORT ?? 8100);
}
bootstrap();
