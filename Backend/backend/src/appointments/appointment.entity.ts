import { Entity, PrimaryGeneratedColumn, Column, ManyToOne, OneToMany, JoinColumn } from 'typeorm';
import { Customer } from '../customers/entities/customer.entity';
import { Business } from '../business/entities/business.entity';
import { Payment } from '../payments/entities/payment.entity';

export enum AppointmentStatus {
  PENDING = 'pending',
  CONFIRMED = 'confirmed',
  PAID = 'paid',
}

@Entity()
export class Appointment {
  @PrimaryGeneratedColumn()
  id!: number;

  @Column()
  date!: string;

  @Column()
  time!: string;

  @Column({
    type: 'text',
    enum: AppointmentStatus,
    default: AppointmentStatus.PENDING,
  })
  status!: AppointmentStatus;

  @Column()
  serviceName!: string;

  @ManyToOne(() => Customer, (customer) => customer.appointments)
  @JoinColumn({ name: 'customerId' })
  customer!: Customer;

  @Column()
  customerId!: number;

  @ManyToOne(() => Business, (business) => business.appointments)
  @JoinColumn({ name: 'businessId' })
  business!: Business;

  @Column()
  businessId!: number;

  @OneToMany(() => Payment, (payment) => payment.appointment)
  payments!: Payment[];
}