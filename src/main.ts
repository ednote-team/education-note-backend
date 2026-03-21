import { NestFactory } from '@nestjs/core';
import { ValidationPipe } from '@nestjs/common';
import { AppModule } from './app.module';
import { CollabService } from './collab/collab.service';

async function bootstrap() {
  const app = await NestFactory.create(AppModule);

  const allowedOrigins = (process.env.FRONTEND_URL || 'http://localhost:3000').split(',');
  app.enableCors({
    origin: allowedOrigins,
    credentials: true,
  });

  app.useGlobalPipes(new ValidationPipe({
    whitelist: true,
    transform: true,
  }));

  app.setGlobalPrefix('api');

  const port = process.env.PORT || 4000;
  await app.listen(port);
  console.log(`🚀 Backend running on http://localhost:${port}`);

  // Attach Hocuspocus WebSocket to the same HTTP server (single port for production)
  const collabService = app.get(CollabService);
  collabService.attachToHttpServer(app.getHttpServer());
  console.log(`🤝 Collab (Hocuspocus) running on ws://localhost:${port}`);
}
bootstrap();