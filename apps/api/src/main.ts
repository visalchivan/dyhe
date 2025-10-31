import { NestFactory } from '@nestjs/core';
import { ValidationPipe } from '@nestjs/common';
import { AppModule } from './app.module';

async function bootstrap() {
  // Set timezone environment variable to ensure consistent timezone handling
  // This ensures that Node.js uses Asia/Phnom_Penh as the system timezone
  process.env.TZ = 'Asia/Phnom_Penh';

  const app = await NestFactory.create(AppModule);

  // Enable CORS
  app.enableCors();

  // Enable global validation
  app.useGlobalPipes(
    new ValidationPipe({
      whitelist: true,
      forbidNonWhitelisted: true,
      transform: true,
    }),
  );

  await app.listen(process.env.PORT ?? 8000);
}
void bootstrap();
