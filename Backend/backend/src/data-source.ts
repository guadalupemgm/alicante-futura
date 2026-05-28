import { DataSource } from 'typeorm';
import { Appointment } from './appointments/appointment.entity';
import { Customer } from './customers/entities/customer.entity';
import { Business } from './business/entities/business.entity';
import { Payment } from './payments/entities/payment.entity';
import { User } from './users/entities/user.entity';
import { Config } from './config/config.entity';

export const AppDataSource = new DataSource({
  type: 'sqlite',
  database: 'data/database.sqlite',
  entities: [Appointment, Customer, Business, Payment, User, Config],
  synchronize: false,
});