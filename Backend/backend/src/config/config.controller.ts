import { Controller, Get, Put, Body, Param } from '@nestjs/common';
import { ConfigService } from './config.service';

@Controller('config')
export class ConfigController {
  constructor(private readonly configService: ConfigService) {}

  @Get('admin')
  getAdminConfig() {
    return this.configService.getConfig('admin', 'system');
  }

  @Put('admin')
  updateAdminConfig(@Body() updates: Record<string, any>) {
    return this.configService.updateConfig('admin', 'system', updates);
  }

  @Get('business/:id')
  getBusinessConfig(@Param('id') businessId: string) {
    return this.configService.getConfig('business', businessId);
  }

  @Put('business/:id')
  updateBusinessConfig(@Param('id') businessId: string, @Body() updates: Record<string, any>) {
    return this.configService.updateConfig('business', businessId, updates);
  }

  @Get('customer/:id')
  getCustomerConfig(@Param('id') customerId: string) {
    return this.configService.getConfig('customer', customerId);
  }

  @Put('customer/:id')
  updateCustomerConfig(@Param('id') customerId: string, @Body() updates: Record<string, any>) {
    return this.configService.updateConfig('customer', customerId, updates);
  }
}
