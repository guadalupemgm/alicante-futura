<<<<<<< HEAD
import { Controller, Post, Patch, Body, UseGuards, Request, UnauthorizedException } from '@nestjs/common';
=======
import { Controller, Post, Body } from '@nestjs/common';
import { ApiBody, ApiTags } from '@nestjs/swagger';
>>>>>>> d7be664c788f348ad8fb349dab42835df3c40de6
import { AuthService } from './auth.service';
import { JwtAuthGuard } from './jwt-auth.guard';
import { UsersService } from '../users/users.service';
import * as bcrypt from 'bcrypt';

@ApiTags('auth')
@Controller('auth')
export class AuthController {
  constructor(
    private authService: AuthService,
    private usersService: UsersService,
  ) {}

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
<<<<<<< HEAD
  register(@Body() body: { email: string; password: string; name: string; phone: string; role: string }) {
=======
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
>>>>>>> d7be664c788f348ad8fb349dab42835df3c40de6
    return this.authService.register(body);
  }

  /** PATCH /auth/change-password — cualquier usuario autenticado */
  @UseGuards(JwtAuthGuard)
  @Patch('change-password')
  async changePassword(
    @Request() req: any,
    @Body() body: { currentPassword: string; newPassword: string },
  ) {
    const user = await this.usersService.findOne(req.user.id);
    if (!user) throw new UnauthorizedException('Usuario no encontrado');

    const valid = await bcrypt.compare(body.currentPassword, user.password);
    if (!valid) throw new UnauthorizedException('La contraseña actual es incorrecta');

    if (!body.newPassword || body.newPassword.length < 6) {
      throw new UnauthorizedException('La nueva contraseña debe tener al menos 6 caracteres');
    }

    await this.usersService.update(user.id, { password: body.newPassword } as any);
    return { message: 'Contraseña actualizada correctamente' };
  }
}