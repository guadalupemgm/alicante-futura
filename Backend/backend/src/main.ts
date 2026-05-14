import { NestFactory } from '@nestjs/core';
import { AppModule } from './app.module';
import { UsersService } from './users/users.service';

async function bootstrap() {
  const app = await NestFactory.create(AppModule);
  app.enableCors();

  // Seed admin user on first start
  const usersService = app.get(UsersService);
  await usersService.seedAdmin();

  await app.listen(3000);
  console.log('🚀 Backend running on http://localhost:3000');
}
bootstrap();