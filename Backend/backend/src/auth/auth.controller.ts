import { Controller, Post, Body } from '@nestjs/common';
import { ApiBody, ApiTags } from '@nestjs/swagger';
import { AuthService } from './auth.service';

@ApiTags('auth')
@Controller('auth')
export class AuthController {
  constructor(private authService: AuthService) {}

  @Post('login')
  @ApiBody({
    schema: {
      type: 'object',
      required: ['email', 'password'],
      properties: {
        email: { type: 'string', example: 'admin@alicante.com' },
        password: { type: 'string', example: 'admin123' },
      },
    },
  })
  login(@Body() body: { email: string; password: string }) {
    return this.authService.login(body.email, body.password);
  }

  @Post('register')
  @ApiBody({
    schema: {
      type: 'object',
      required: ['email', 'password', 'name', 'phone'],
      properties: {
        email: { type: 'string', example: 'usuario@ejemplo.com' },
        password: { type: 'string', example: 'mipassword123' },
        name: { type: 'string', example: 'Juan García' },
        phone: { type: 'string', example: '600123456' },
        role: { type: 'string', example: 'customer' },
      },
    },
  })
  register(
    @Body() body: {
      email: string;
      password: string;
      name: string;
      phone: string;
      role: string;
    }
  ) {
    return this.authService.register(body);
  }
}