import { NestFactory } from '@nestjs/core';
import { Logger, ValidationPipe } from '@nestjs/common';
import { SwaggerModule, DocumentBuilder } from '@nestjs/swagger';
import { NestExpressApplication } from '@nestjs/platform-express';
import { AppModule } from './app.module';
import { SanitizePipe } from './common/sanitize.pipe';
import { AllExceptionsFilter } from './common/http-exception.filter';

async function bootstrap() {
  const isProd = process.env.NODE_ENV === 'production';
  const app = await NestFactory.create<NestExpressApplication>(AppModule, {
    logger: isProd ? ['error', 'warn', 'log'] : ['error', 'warn', 'log', 'debug', 'verbose'],
  });

  // Body size limits
  app.useBodyParser('json', { limit: '1mb' });
  app.useBodyParser('urlencoded', { limit: '1mb', extended: true });

  // Global exception filter
  app.useGlobalFilters(new AllExceptionsFilter());

  // Global validation + sanitization
  app.useGlobalPipes(new SanitizePipe(), new ValidationPipe({ whitelist: true, transform: true }));

  // CORS
  const allowedOrigins = (process.env.CORS_ORIGINS || process.env.APP_URL || 'http://localhost:3000')
    .split(',')
    .map((o) => o.trim());
  app.enableCors({
    origin: allowedOrigins,
    credentials: true,
  });

  // API prefix
  app.setGlobalPrefix('api');

  // Swagger
  const config = new DocumentBuilder()
    .setTitle('Darba API')
    .setDescription('Darba AI Studio — API Documentation')
    .setVersion('1.0')
    .addBearerAuth()
    .build();
  const document = SwaggerModule.createDocument(app, config);
  SwaggerModule.setup('api/docs', app, document);

  const port = process.env.PORT || 8000;
  await app.listen(port);
  const logger = new Logger('Bootstrap');
  logger.log(`Darba API running on http://localhost:${port}`);
  logger.log(`Swagger: http://localhost:${port}/api/docs`);
}
bootstrap();
