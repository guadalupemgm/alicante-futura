import { Injectable, UnauthorizedException, BadRequestException } from '@nestjs/common';
import { JwtService } from '@nestjs/jwt';
import * as bcrypt from 'bcrypt';
import { UsersService } from '../users/users.service';

@Injectable()
export class AuthService {
  constructor(
    private usersService: UsersService,
    private jwtService: JwtService,
  ) {}

  async login(identifier: string, password: string) {
    let user = await this.usersService.findByEmail(identifier);
    if (!user) {
      user = await this.usersService.findByUsername(identifier);
    }

    if (!user || !user.isActive) {
      throw new UnauthorizedException('Credenciales incorrectas');
    }

    const valid = await bcrypt.compare(password, user.password);
    if (!valid) {
      throw new UnauthorizedException('Credenciales incorrectas');
    }

    const payload = {
      sub: user.id,
      email: user.email,
      role: user.role,
      businessId: user.businessId,
    };

    return {
      access_token: this.jwtService.sign(payload),
      user: {
        id: user.id,
        email: user.email,
        role: user.role,
        businessId: user.businessId,
      },
    };
  }

  // Registro de nuevos usuarios (clientes particulares)
  async register(body: { email: string; password: string; name: string; phone: string; role: any }) {
    const { email, password, name, phone, role } = body;

    // Controlamos que el email no esté ya en uso
    const existingUser = await this.usersService.findByEmail(email);
    if (existingUser) {
      throw new BadRequestException('El correo electrónico ya está registrado');
    }

    // Llamamos al método create de usersService pasándole la contraseña en texto plano, 
    // ya que el propio servicio de usuarios se encarga de aplicar el hash con bcrypt
    const newUser = await this.usersService.create({
      email,
      password, // Se encarga UsersService de encriptarla
      username: email, // Usamos el email como username por defecto
      name,
      phone,
      role: role || 'particular', 
      isActive: true, 
    } as any); // Ponemos el cast as any temporal por si el DTO valida tipos estrictos de roles

    // Generamos el payload para devolver el token directamente
    const payload = {
      sub: newUser.id,
      email: newUser.email,
      role: newUser.role,
      businessId: newUser.businessId,
    };

    // Retornamos el token y los datos para que el front haga login automático
    return {
      access_token: this.jwtService.sign(payload),
      user: {
        id: newUser.id,
        email: newUser.email,
        role: newUser.role,
        businessId: newUser.businessId,
      },
    };
  }
}