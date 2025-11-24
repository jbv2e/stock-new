import { NestFactory } from '@nestjs/core';
import { AppModule } from './app.module';
import cookieParser from 'cookie-parser';
import express from 'express';
import { ExpressAdapter } from '@nestjs/platform-express';
async function bootstrap() {
  const server = express(); // express 강제
  const app = await NestFactory.create(AppModule, new ExpressAdapter(server));
  // const app = await NestFactory.create(AppModule);

  app.use(cookieParser());  // 쿠키 파서 추가
 
  // CORS 허용 설정
  app.enableCors({
    // origin: ['http://localhost:3001'],
    // origin: 'http://localhost:3001',
    origin : [process.env.FRONTEND_URL?.split(',')],
    // methods: 'GET,HEAD,PUT,PATCH,POST,DELETE',
    credentials: true,
  });

  await app.listen(process.env.PORT ?? 3000);
}
bootstrap();
