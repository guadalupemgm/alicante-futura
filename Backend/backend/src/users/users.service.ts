import { Injectable, ConflictException, NotFoundException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import * as bcrypt from 'bcrypt';
import { User, UserRole } from './user.entity';

@Injectable()
export class UsersService {
  constructor(
    @InjectRepository(User)
    private usersRepository: Repository<User>,
  ) {}

  async findByEmail(email: string): Promise<User | null> {
    return this.usersRepository.findOne({ where: { email } });
  }

  async findAll(): Promise<User[]> {
    return this.usersRepository.find({ select: ['id', 'email', 'role', 'businessId', 'isActive'] });
  }

  async create(email: string, password: string, role: UserRole, businessId?: number): Promise<User> {
    const existing = await this.findByEmail(email);
    if (existing) throw new ConflictException('Ya existe un usuario con ese email');

    const hashed = await bcrypt.hash(password, 10);
    const user = this.usersRepository.create({ email, password: hashed, role, businessId });
    return this.usersRepository.save(user);
  }

  async changePassword(userId: number, newPassword: string): Promise<void> {
    const user = await this.usersRepository.findOne({ where: { id: userId } });
    if (!user) throw new NotFoundException('Usuario no encontrado');
    user.password = await bcrypt.hash(newPassword, 10);
    await this.usersRepository.save(user);
  }

  async seedAdmin(): Promise<void> {
    const existing = await this.findByEmail('admin@bookflow.com');
    if (!existing) {
      await this.create('admin@bookflow.com', 'admin123', UserRole.ADMIN);
      console.log('✅ Admin creado: admin@bookflow.com / admin123');
    }
  }
}