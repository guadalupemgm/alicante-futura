import { NestFactory } from '@nestjs/core';
import { AppModule } from './app.module';
import { UsersService } from './users/users.service';
import { SwaggerModule, DocumentBuilder } from '@nestjs/swagger';

async function bootstrap() {
  const app = await NestFactory.create(AppModule);
  app.enableCors();

  // Swagger
  const config = new DocumentBuilder()
    .setTitle('Alicante Futura API')
    .setDescription('API de gestión de reservas')
    .setVersion('1.0')
    .addBearerAuth()
    .build();
  const document = SwaggerModule.createDocument(app, config);
  SwaggerModule.setup('api', app, document);

  // Seed admin user on first start
  const usersService = app.get(UsersService);
  await usersService.seedAdmin();

  await app.listen(3000);
  console.log('🚀 Backend running on http://localhost:3000');
  console.log('📄 Swagger en http://localhost:3000/api');
}
bootstrap();