import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { AppointmentsModule } from './appointments/appointments.module';
import { CustomersModule } from './customers/customers.module';
import { BusinessModule } from './business/business.module';
import { PaymentsModule } from './payments/payments.module';
import { Appointment } from './appointments/appointment.entity';
import { Customer } from './customers/entities/customer.entity';
import { Business } from './business/entities/business.entity';
import { Payment } from './payments/entities/payment.entity';

@Module({
  imports: [
    TypeOrmModule.forRoot({
      type: 'sqlite',
      database: 'data/database.sqlite',
      entities: [Appointment, Customer, Business, Payment],
      synchronize: true,
    }),
    AppointmentsModule,
    CustomersModule,
    BusinessModule,
    PaymentsModule,
  ],
})
export class AppModule {}