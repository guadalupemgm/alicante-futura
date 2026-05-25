import { Entity, PrimaryGeneratedColumn, Column } from 'typeorm';

export enum UserRole {
  ADMIN = 'admin',
  BUSINESS = 'business',
  CUSTOMER = 'customer',
}

@Entity()
export class User {
  @PrimaryGeneratedColumn()
  id!: number;

  @Column({ unique: true, nullable: true })
  username!: string;

  @Column({ unique: true, nullable: true })
  email!: string;

  @Column()
  password!: string;

  @Column({ nullable: true })
  name!: string;

  @Column({ nullable: true })
  phone!: string;

  @Column({ default: UserRole.CUSTOMER })
  role!: string;

  @Column({ default: true })
  isActive!: boolean;

  @Column({ nullable: true })
  businessId!: number;

  @Column({ nullable: true })
  customerId!: number;
}