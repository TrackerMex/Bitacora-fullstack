import { ValidationPipe, Logger } from '@nestjs/common';
import { NestFactory } from '@nestjs/core';
import { ConfigService } from '@nestjs/config';
import helmet from 'helmet';
import { AppModule } from './app.module';
import { GlobalExceptionFilter } from './common/filters/global-exception.filter';
import { TransformResponseInterceptor } from './common/interceptors/transform-response.interceptor';

async function bootstrap() {
  const logger = new Logger('Bootstrap');
  const app = await NestFactory.create(AppModule);
  const configService = app.get(ConfigService);

  const apiPrefix = configService.get<string>('app.apiPrefix', 'api');
  const port = configService.get<number>('app.port', 3000);
  const corsOrigin = configService.get<string>('cors.origin', '*');
  const nodeEnv = configService.get<string>('app.env', 'development');

  // Security: Helmet for HTTP headers protection
  app.use(
    helmet({
      contentSecurityPolicy: nodeEnv === 'production',
      crossOriginEmbedderPolicy: nodeEnv === 'production',
    }),
  );

  // Security: CORS configuration
  app.enableCors({
    origin: corsOrigin === '*' ? true : corsOrigin.split(','),
    methods: ['GET', 'POST', 'PUT', 'PATCH', 'DELETE', 'OPTIONS'],
    allowedHeaders: ['Content-Type', 'Authorization', 'Accept'],
    credentials: true,
    maxAge: 86400, // 24 hours
  });

  // API prefix for all routes
  app.setGlobalPrefix(apiPrefix);

  // Global validation pipe with strict rules
  app.useGlobalPipes(
    new ValidationPipe({
      whitelist: true,
      transform: true,
      forbidNonWhitelisted: true,
      transformOptions: {
        enableImplicitConversion: true,
      },
    }),
  );

  // Global exception filter for consistent error responses
  app.useGlobalFilters(new GlobalExceptionFilter());

  // Global response interceptor for consistent response format
  app.useGlobalInterceptors(new TransformResponseInterceptor());

  await app.listen(port);

  logger.log(`Application running on: http://localhost:${port}/${apiPrefix}`);
  logger.log(`Environment: ${nodeEnv}`);
  logger.log(`CORS origin: ${corsOrigin}`);
}
void bootstrap();
