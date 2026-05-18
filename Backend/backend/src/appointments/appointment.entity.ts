import { Entity, PrimaryGeneratedColumn, Column, ManyToOne, OneToMany, JoinColumn } from 'typeorm';
import { Customer } from '../customers/entities/customer.entity';
import { Business } from '../business/entities/business.entity';
import { Payment } from '../payments/entities/payment.entity';

/**
 * Definición de los estados de la cita.
 * Se incluye 'cancelled' para permitir la anulación de reservas.
 */
export enum AppointmentStatus {
  PENDING = 'pending',
  CONFIRMED = 'confirmed',
  PAID = 'paid',
  CANCELLED = 'cancelled',
}

@Entity()
export class Appointment {
  @PrimaryGeneratedColumn()
  id!: number;

  @Column()
  date!: string;

  @Column()
  time!: string;

  /**
   * Estado de la cita compatible con SQLite.
   * Dado que SQLite no soporta el tipo 'enum' nativo, se define la columna
   * como 'simple-enum' para que TypeORM gestione la validación por nosotros.
   */
  @Column({
    type: 'simple-enum', // Cambiado de 'enum' a 'simple-enum' para compatibilidad con SQLite
    enum: AppointmentStatus,
    default: AppointmentStatus.PENDING,
  })
  status!: AppointmentStatus;

  @Column()
  serviceName!: string;

  /**
   * Relación ManyToOne con Customer.
   * La clave foránea customerId vincula la cita con un cliente específico.
   */
  @ManyToOne(() => Customer, (customer) => customer.appointments)
  @JoinColumn({ name: 'customerId' })
  customer!: Customer;

  @Column()
  customerId!: number;

  /**
   * Relación con el centro de negocio.
   */
  @ManyToOne(() => Business, (business) => business.appointments)
  @JoinColumn({ name: 'businessId' })
  business!: Business;

  @Column()
  businessId!: number;

  /**
   * Pagos asociados a la cita.
   */
  @OneToMany(() => Payment, (payment) => payment.appointment)
  payments!: Payment[];
}