<<<<<<< HEAD
import { Entity, PrimaryGeneratedColumn, Column, OneToMany } from 'typeorm';
import { Appointment } from '../../appointments/appointment.entity';
=======
import { Column, Entity, PrimaryGeneratedColumn } from 'typeorm';
>>>>>>> e1b3fb2182e54d464229d93a0bbe3d13edf285f7

@Entity()
export class Customer {
  @PrimaryGeneratedColumn()
  id!: number;

  @Column()
  name!: string;

  @Column()
<<<<<<< HEAD
  email!: string;

  @Column()
  phone!: string;

  @Column({ nullable: true })
  business!: string;

  @OneToMany(() => Appointment, (appointment) => appointment.customer)
  appointments!: Appointment[];
=======
  phone!: string;

  @Column()
  email!: string;

  @Column()
  business!: string;
>>>>>>> e1b3fb2182e54d464229d93a0bbe3d13edf285f7
}