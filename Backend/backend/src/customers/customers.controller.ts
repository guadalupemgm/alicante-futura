import { Controller, Get, Post, Body, Patch, Param, Delete, UseGuards } from '@nestjs/common';
import { ApiBearerAuth, ApiTags } from '@nestjs/swagger';
import { JwtAuthGuard } from '../auth/jwt-auth.guard';
import { RolesGuard } from '../auth/roles.guard';
import { Roles } from '../auth/roles.decorator';
import { UserRole } from '../users/entities/user.entity';
import { CustomersService } from './customers.service';
import { CreateCustomerDto } from './dto/create-customer.dto';
import { UpdateCustomerDto } from './dto/update-customer.dto';

@ApiTags('Customers')
@ApiBearerAuth()
@UseGuards(JwtAuthGuard, RolesGuard)
@Controller('customers')
export class CustomersController {
  constructor(private readonly customersService: CustomersService) {}

  /** POST /customers — solo admin (el registro público va por /auth/register) */
  @Post()
  @Roles(UserRole.ADMIN)
  create(@Body() createCustomerDto: CreateCustomerDto) {
    return this.customersService.create(createCustomerDto);
  }

  /** GET /customers — solo admin */
  @Get()
  @Roles(UserRole.ADMIN)
  findAll() {
    return this.customersService.findAll();
  }

  /** GET /customers/:id — admin o el propio customer */
  @Get(':id')
  @Roles(UserRole.ADMIN, UserRole.CUSTOMER)
  findOne(@Param('id') id: string) {
    return this.customersService.findOne(+id);
  }

  /** PATCH /customers/:id — admin o el propio customer */
  @Patch(':id')
  @Roles(UserRole.ADMIN, UserRole.CUSTOMER)
  update(@Param('id') id: string, @Body() updateCustomerDto: UpdateCustomerDto) {
    return this.customersService.update(+id, updateCustomerDto);
  }

  /** DELETE /customers/:id — solo admin */
  @Delete(':id')
  @Roles(UserRole.ADMIN)
  remove(@Param('id') id: string) {
    return this.customersService.remove(+id);
  }
}