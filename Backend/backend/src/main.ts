import { NestFactory } from '@nestjs/core';
import { AppModule } from './app.module';
import { UsersService } from './users/users.service';
import { SwaggerModule, DocumentBuilder } from '@nestjs/swagger';
import { NextFunction, Request, Response } from 'express';

async function bootstrap() {
  const app = await NestFactory.create(AppModule);
  app.enableCors();

  const SWAGGER_USER = process.env.SWAGGER_USER ?? 'admin';
  const SWAGGER_PASS = process.env.SWAGGER_PASS ?? 'admin';

  app.use(
    [
      '/api/index.html',
      '/api/swagger-ui.css',
      '/api/swagger-ui-bundle.js',
      '/api/swagger-ui-standalone-preset.js',
      '/api-json',
    ],
    (req: Request, res: Response, next: NextFunction) => {
      const auth = req.headers['authorization'];
      if (auth) {
        const [type, credentials] = auth.split(' ');
        if (type === 'Basic') {
          const [user, pass] = Buffer.from(credentials, 'base64')
            .toString()
            .split(':');
          if (user === SWAGGER_USER && pass === SWAGGER_PASS) {
            return next();
          }
        }
      }
      res.setHeader('WWW-Authenticate', 'Basic realm="Swagger"');
      res.status(401).send('Acceso no autorizado a la documentación');
    },
  );

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

  //Activa los CORS para permitir peticiones desde el frontend (ajusta el origen según tu configuración)
  app.enableCors({
    origin: 'http://localhost:3001',
  });

  await app.listen(3000);
  console.log('🚀 Backend running on http://localhost:3000');
  console.log('📄 Swagger en http://localhost:3000/api');
}
bootstrap().catch((err) => {
  console.error(err);
});
