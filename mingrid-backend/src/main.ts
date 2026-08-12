import { NestFactory } from '@nestjs/core';
import { ValidationPipe } from '@nestjs/common';
import { AppModule } from './app.module';
import helmet from 'helmet';
import cookieParser from 'cookie-parser';


async function bootstrap() {
  const app = await NestFactory.create(AppModule);

  // Security Middleware
  app.use(helmet());
  app.use(cookieParser());

  // Enable CORS for frontend credentials (HttpOnly JWT cookies)
  app.enableCors({
    origin: process.env.FRONTEND_URL || 'http://localhost:3000',
    credentials: true,
    methods: ['GET', 'POST', 'PUT', 'PATCH', 'DELETE', 'OPTIONS'],
    allowedHeaders: ['Content-Type', 'Authorization', 'X-Requested-With'],
  });

  // Global Validation Pipe
  app.useGlobalPipes(
    new ValidationPipe({
      whitelist: true,
      forbidNonWhitelisted: true,
      transform: true,
      transformOptions: {
        enableImplicitConversion: true,
      },
    }),
  );

  // Set API prefix
  app.setGlobalPrefix('api');

  const port = process.env.PORT ?? 5000;
  await app.listen(port);
  console.log(`🚀 Mingrid Enterprise Backend running on: http://localhost:${port}/api`);
}
bootstrap();

