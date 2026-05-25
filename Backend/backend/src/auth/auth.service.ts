import { Injectable, UnauthorizedException, BadRequestException } from '@nestjs/common';
import { JwtService } from '@nestjs/jwt';
import * as bcrypt from 'bcrypt';
import { UsersService } from '../users/users.service';
import { CustomersService } from '../customers/customers.service';

@Injectable()
export class AuthService {
  constructor(
    private usersService: UsersService,
    private jwtService: JwtService,
    private customersService: CustomersService,
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
      customerId: user.customerId,
    };

    return {
      access_token: this.jwtService.sign(payload),
      user: {
        id: user.id,
        email: user.email,
        role: user.role,
        businessId: user.businessId,
        customerId: user.customerId,
      },
    };
  }

  async register(body: { email: string; password: string; name: string; phone: string }) {
    const { email, password, name, phone } = body;

    const existingUser = await this.usersService.findByEmail(email);
    if (existingUser) {
      throw new BadRequestException('El correo electrónico ya está registrado');
    }

    // 1. Crear el cliente en la tabla customers
    const newCustomer = await this.customersService.create({
      name,
      email,
      phone,
    });

    // 2. Crear el usuario vinculado al cliente con rol customer
    const newUser = await this.usersService.create({
      email,
      password,
      username: email,
      name,
      phone,
      role: 'customer',
      isActive: true,
      customerId: newCustomer.id,
    } as any);

    const payload = {
      sub: newUser.id,
      email: newUser.email,
      role: newUser.role,
      customerId: newUser.customerId,
    };

    return {
      access_token: this.jwtService.sign(payload),
      user: {
        id: newUser.id,
        email: newUser.email,
        role: newUser.role,
        customerId: newUser.customerId,
      },
    };
  }
}