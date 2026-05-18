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

  @Column({ default: UserRole.ADMIN })
  role!: UserRole;

  @Column({ default: true })
  isActive!: boolean;

  @Column({ nullable: true })
  businessId!: number;
}