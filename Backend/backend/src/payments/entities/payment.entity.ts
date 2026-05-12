import { Entity, PrimaryGeneratedColumn, Column, ManyToOne, JoinColumn } from 'typeorm';
import { Appointment } from '../../appointments/appointment.entity';

@Entity()
export class Payment {
  @PrimaryGeneratedColumn()
  id!: number;

  @Column('decimal')
  amount!: number;

  @Column()
  method!: string;

  @Column()
  status!: string;

  @ManyToOne(() => Appointment, (appointment) => appointment.payments)
  @JoinColumn({ name: 'appointmentId' })
  appointment!: Appointment;

  @Column()
  appointmentId!: number;
}