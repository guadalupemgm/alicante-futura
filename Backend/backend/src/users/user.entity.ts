import { Entity, PrimaryGeneratedColumn, Column } from 'typeorm';

export enum UserRole {
  ADMIN = 'admin',
  BUSINESS = 'business',
}

@Entity()
export class User {
  @PrimaryGeneratedColumn()
  id!: number;

  @Column({ unique: true })
  email!: string;

  @Column()
  password!: string;

  @Column({ type: 'text', enum: UserRole, default: UserRole.ADMIN })
  role!: UserRole;

  @Column({ nullable: true })
  businessId!: number;

  @Column({ default: true })
  isActive!: boolean;
}