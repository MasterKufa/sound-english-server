import { NestFactory, Reflector } from '@nestjs/core';
import { NestExpressApplication } from '@nestjs/platform-express';
import { join } from 'path';
import { AppModule } from './app.module';
import { JwtAuthGuard } from './auth/jwt-auth.guard';

async function bootstrap() {
  const app = await NestFactory.create<NestExpressApplication>(AppModule, {
    cors: true,
  });
  const reflector = app.get(Reflector);

  app.useGlobalGuards(new JwtAuthGuard(reflector));
  app.enableShutdownHooks();
  app.useStaticAssets(join(__dirname, '..', '..', 'client', 'build'));
  app.setBaseViewsDir(join(__dirname, '..', '..', 'client', 'build'));
  app.setViewEngine('hbs');

  await app.listen(
    process.env.NODE_ENV === 'production' ? process.env.PORT : 3000,
  );
}
bootstrap();
