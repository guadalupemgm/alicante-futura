import { Controller, Post, Body } from '@nestjs/common';
import { AuthService } from './auth.service';

@Controller('auth')
export class AuthController {
  constructor(private authService: AuthService) {}

  @Post('login')
  login(@Body() body: { email: string; password: string }) {
    return this.authService.login(body.email, body.password);
  }

  // Ruta para registrar un nuevo cliente particular
  @Post('register')
  register(
    @Body() body: { 
      email: string; 
      password: string; 
      name: string; 
      phone: string; 
      role: string; 
    }
  ) {
    // Le pasamos el objeto completo al servicio para que cree el usuario en la BD
    return this.authService.register(body);
  }
}