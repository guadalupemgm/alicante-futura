import {
  Body,
  Controller,
  Delete,
  Get,
  Param,
  ParseIntPipe,
  Patch,
  Post,
  UseGuards,
} from '@nestjs/common';
import {
  ApiBearerAuth,
  ApiCreatedResponse,
  ApiOkResponse,
  ApiTags,
} from '@nestjs/swagger';
import { JwtAuthGuard } from '../auth/jwt-auth.guard';
import { RolesGuard } from '../auth/roles.guard';
import { Roles } from '../auth/roles.decorator';
import { UserRole } from '../users/entities/user.entity';
import { AppointmentsService } from './appointments.service';
import { CreateAppointmentDto } from './dto/create-appointment.dto';
import { UpdateAppointmentDto } from './dto/update-appointment.dto';

@ApiTags('appointments')
@ApiBearerAuth()
@UseGuards(JwtAuthGuard, RolesGuard)
@Controller('appointments')
export class AppointmentsController {
  constructor(private readonly appointmentsService: AppointmentsService) {}

  /** GET /appointments — admin ve todas; business ve las suyas */
  @Get()
  @Roles(UserRole.ADMIN, UserRole.BUSINESS)
  @ApiOkResponse({ description: 'Listado de reservas' })
  findAll() {
    return this.appointmentsService.findAll();
  }

  /** GET /appointments/business/:businessId — admin o el propio negocio */
  @Get('business/:businessId')
  @Roles(UserRole.ADMIN, UserRole.BUSINESS)
  @ApiOkResponse({ description: 'Reservas de un negocio' })
  findByBusiness(@Param('businessId', ParseIntPipe) businessId: number) {
    return this.appointmentsService.findByBusiness(businessId);
  }

  /** GET /appointments/customer/:customerId — admin o el propio cliente */
  @Get('customer/:customerId')
  @UseGuards(JwtAuthGuard) // <-- Pisa el RolesGuard de la clase para que el cliente pueda ver sus propias citas
  @ApiOkResponse({ description: 'Reservas de un cliente' })
  findByCustomer(@Param('customerId', ParseIntPipe) customerId: number) {
    return this.appointmentsService.findByCustomer(customerId);
  }

  /** GET /appointments/:id — admin, business o customer */
  @Get(':id')
  @Roles(UserRole.ADMIN, UserRole.BUSINESS, UserRole.CUSTOMER)
  @ApiOkResponse({ description: 'Detalle de una reserva' })
  findOne(@Param('id', ParseIntPipe) id: number) {
    return this.appointmentsService.findOne(id);
  }

  /** POST /appointments — cualquier usuario autenticado puede crear */
  @Post()
  @Roles(UserRole.ADMIN, UserRole.BUSINESS, UserRole.CUSTOMER)
  @ApiCreatedResponse({ description: 'Reserva creada' })
  create(@Body() createAppointmentDto: CreateAppointmentDto) {
    return this.appointmentsService.create(createAppointmentDto);
  }

  /** PATCH /appointments/:id — admin o business pueden modificar */
  @Patch(':id')
  @Roles(UserRole.ADMIN, UserRole.BUSINESS)
  @ApiOkResponse({ description: 'Reserva actualizada' })
  update(
    @Param('id', ParseIntPipe) id: number,
    @Body() updateAppointmentDto: UpdateAppointmentDto,
  ) {
    return this.appointmentsService.update(id, updateAppointmentDto);
  }

  /** DELETE /appointments/:id — solo admin */
  @Delete(':id')
  @Roles(UserRole.ADMIN)
  @ApiOkResponse({ description: 'Reserva eliminada' })
  remove(@Param('id', ParseIntPipe) id: number) {
    return this.appointmentsService.remove(id);
  }
}