import { Controller, Get, Put, Body, Param, UseGuards } from '@nestjs/common';
import { ApiBearerAuth, ApiTags } from '@nestjs/swagger';
import { JwtAuthGuard } from '../auth/jwt-auth.guard';
import { RolesGuard } from '../auth/roles.guard';
import { Roles } from '../auth/roles.decorator';
import { UserRole } from '../users/entities/user.entity';
import { ConfigService } from './config.service';

@ApiTags('config')
@ApiBearerAuth()
@UseGuards(JwtAuthGuard, RolesGuard)
@Controller('config')
export class ConfigController {
  constructor(private readonly configService: ConfigService) {}

  /** GET /config/admin — solo admin */
  @Get('admin')
  @Roles(UserRole.ADMIN)
  getAdminConfig() {
    return this.configService.getConfig('admin', 'system');
  }

  /** PUT /config/admin — solo admin */
  @Put('admin')
  @Roles(UserRole.ADMIN)
  updateAdminConfig(@Body() updates: Record<string, any>) {
    return this.configService.updateConfig('admin', 'system', updates);
  }

  /** GET /config/business/:id — admin o el propio negocio */
  @Get('business/:id')
  @Roles(UserRole.ADMIN, UserRole.BUSINESS)
  getBusinessConfig(@Param('id') businessId: string) {
    return this.configService.getConfig('business', businessId);
  }

  /** PUT /config/business/:id — admin o el propio negocio */
  @Put('business/:id')
  @Roles(UserRole.ADMIN, UserRole.BUSINESS)
  updateBusinessConfig(@Param('id') businessId: string, @Body() updates: Record<string, any>) {
    return this.configService.updateConfig('business', businessId, updates);
  }

  /** GET /config/customer/:id — admin o el propio customer */
  @Get('customer/:id')
  @Roles(UserRole.ADMIN, UserRole.CUSTOMER)
  getCustomerConfig(@Param('id') customerId: string) {
    return this.configService.getConfig('customer', customerId);
  }

  /** PUT /config/customer/:id — admin o el propio customer */
  @Put('customer/:id')
  @Roles(UserRole.ADMIN, UserRole.CUSTOMER)
  updateCustomerConfig(@Param('id') customerId: string, @Body() updates: Record<string, any>) {
    return this.configService.updateConfig('customer', customerId, updates);
  }
}