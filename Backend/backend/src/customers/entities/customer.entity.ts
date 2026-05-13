import { Entity, PrimaryGeneratedColumn, Column, OneToMany } from 'typeorm';
import { Appointment } from '../../appointments/appointment.entity';

@Entity()
export class Customer {
  @PrimaryGeneratedColumn()
  id!: number;

  @Column()
  name!: string;

  @Column()
  email!: string;

  @Column()
  phone!: string;

  @Column({ nullable: true })
  business!: string;

  @OneToMany(() => Appointment, (appointment) => appointment.customer)
  appointments!: Appointment[];
}