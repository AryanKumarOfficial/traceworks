import { NestFactory } from '@nestjs/core';
import { AppModule } from './app.module';
import cookieParser from 'cookie-parser';
import { NestExpressApplication } from '@nestjs/platform-express';

async function bootstrap() {
  const app = await NestFactory.create<NestExpressApplication>(AppModule);
  app.enableCors({
    origin: (process.env.FRONTEND_HOST as string) ?? 'http://localhost:3000', // Your Next.js app's URL
    credentials: true, // Allow cookies to be sent
  });
  app.use(cookieParser());
  const port = parseInt(process.env.PORT || '5000', 10);

  await app.listen(port);
  console.log(`Backend listening on http://0.0.0.0:${port}`);
}
bootstrap();
