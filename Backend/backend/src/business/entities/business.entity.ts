import { Entity, PrimaryGeneratedColumn, Column, OneToMany } from 'typeorm';
import { Appointment } from '../../appointments/appointment.entity';

@Entity()
export class Business {
  @PrimaryGeneratedColumn()
  id!: number;

  @Column()
  name!: string;

  @Column({ nullable: true })
  category!: string;

  @Column({ nullable: true })
  email!: string;

  @Column({ nullable: true })
  phone!: string;

  @Column()
  address!: string;

  @Column({ default: 'active' })
  status!: string;

  @OneToMany(() => Appointment, (appointment) => appointment.business)
  appointments!: Appointment[];
}