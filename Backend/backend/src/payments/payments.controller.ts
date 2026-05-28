import { Controller, Get, Post, Body, Patch, Param, Delete, UseGuards } from '@nestjs/common';
import { ApiBearerAuth, ApiTags } from '@nestjs/swagger';
import { JwtAuthGuard } from '../auth/jwt-auth.guard';
import { RolesGuard } from '../auth/roles.guard';
import { Roles } from '../auth/roles.decorator';
import { UserRole } from '../users/entities/user.entity';
import { PaymentsService } from './payments.service';
import { CreatePaymentDto } from './dto/create-payment.dto';
import { UpdatePaymentDto } from './dto/update-payment.dto';

@ApiTags('payments')
@ApiBearerAuth()
@UseGuards(JwtAuthGuard, RolesGuard)
@Controller('payments')
export class PaymentsController {
  constructor(private readonly paymentsService: PaymentsService) {}

  /** POST /payments — admin o business */
  @Post()
  @Roles(UserRole.ADMIN, UserRole.BUSINESS)
  create(@Body() createPaymentDto: CreatePaymentDto) {
    return this.paymentsService.create(createPaymentDto);
  }

  /** GET /payments — solo admin */
  @Get()
  @Roles(UserRole.ADMIN)
  findAll() {
    return this.paymentsService.findAll();
  }

  /** GET /payments/business/:businessId — admin o el propio negocio */
  @Get('business/:businessId')
  @Roles(UserRole.ADMIN, UserRole.BUSINESS)
  findByBusiness(@Param('businessId') businessId: string) {
    return this.paymentsService.findByBusiness(+businessId);
  }

  /** GET /payments/:id — admin o business */
  @Get(':id')
  @Roles(UserRole.ADMIN, UserRole.BUSINESS)
  findOne(@Param('id') id: string) {
    return this.paymentsService.findOne(+id);
  }

  /** PATCH /payments/:id — solo admin */
  @Patch(':id')
  @Roles(UserRole.ADMIN)
  update(@Param('id') id: string, @Body() updatePaymentDto: UpdatePaymentDto) {
    return this.paymentsService.update(+id, updatePaymentDto);
  }

  /** DELETE /payments/:id — solo admin */
  @Delete(':id')
  @Roles(UserRole.ADMIN)
  remove(@Param('id') id: string) {
    return this.paymentsService.remove(+id);
  }
}