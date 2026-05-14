import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { AppointmentsModule } from './appointments/appointments.module';
import { CustomersModule } from './customers/customers.module';
import { BusinessModule } from './business/business.module';
import { PaymentsModule } from './payments/payments.module';
import { AuthModule } from './auth/auth.module';
import { UsersModule } from './users/users.module';
import { Appointment } from './appointments/appointment.entity';
import { Customer } from './customers/entities/customer.entity';
import { Business } from './business/entities/business.entity';
import { Payment } from './payments/entities/payment.entity';
import { User } from './users/user.entity';

@Module({
  imports: [
    TypeOrmModule.forRoot({
      type: 'sqlite',
      database: 'data/database.sqlite',
      entities: [Appointment, Customer, Business, Payment, User],
      synchronize: true,
    }),
    AppointmentsModule,
    CustomersModule,
    BusinessModule,
    PaymentsModule,
    AuthModule,
    UsersModule,
  ],
})
export class AppModule {}