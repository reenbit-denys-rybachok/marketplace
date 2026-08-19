import 'dotenv/config';
import { NestFactory } from '@nestjs/core';
import { AppModule } from './app.module';

async function bootstrap() {
  const app = await NestFactory.create(AppModule);
  const corsOrigins = (process.env.FRONTEND_URL ?? 'http://localhost:3001')
    .split(',')
    .map((origin) => origin.trim())
    .filter(Boolean);
  const corsOriginSuffixes = (
    process.env.FRONTEND_ORIGIN_SUFFIXES ?? '.vercel.app'
  )
    .split(',')
    .map((suffix) => suffix.trim())
    .filter(Boolean);

  function isAllowedOrigin(origin?: string) {
    return (
      !origin ||
      corsOrigins.includes(origin) ||
      corsOriginSuffixes.some((suffix) => origin.endsWith(suffix))
    );
  }

  app.enableCors({
    origin: (
      origin: string | undefined,
      callback: (error: Error | null, allow?: boolean) => void,
    ) => {
      callback(null, isAllowedOrigin(origin));
    },
    credentials: true,
  });
  app.setGlobalPrefix('api');

  await app.listen(process.env.PORT ?? 4000);
}

void bootstrap();
