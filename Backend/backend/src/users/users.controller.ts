import { Controller, Get, Post, Body, UseGuards, Request, Patch } from '@nestjs/common';
import { UsersService } from './users.service';
import { UserRole } from './user.entity';
import { JwtAuthGuard } from '../auth/jwt-auth.guard';
import { RolesGuard } from '../auth/roles.guard';
import { Roles } from '../auth/roles.decorator';

@Controller('users')
export class UsersController {
  constructor(private readonly usersService: UsersService) {}

  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles(UserRole.ADMIN)
  @Get()
  findAll() {
    return this.usersService.findAll();
  }

  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles(UserRole.ADMIN)
  @Post()
  create(@Body() body: { email: string; password: string; role: UserRole; businessId?: number }) {
    return this.usersService.create(body.email, body.password, body.role, body.businessId);
  }

  @UseGuards(JwtAuthGuard)
  @Patch('change-password')
  changePassword(@Request() req: any, @Body() body: { newPassword: string }) {
    return this.usersService.changePassword(req.user.id, body.newPassword);
  }
}