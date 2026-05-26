import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { User, UserRole } from './entities/user.entity';
import { CreateUserDto } from './dto/create-user.dto';
import { UpdateUserDto } from './dto/update-user.dto';
import * as bcrypt from 'bcrypt';

@Injectable()
export class UsersService {
  constructor(
    @InjectRepository(User)
    private readonly userRepository: Repository<User>,
  ) {}

  async create(createUserDto: CreateUserDto) {
    const passwordHash = await bcrypt.hash(createUserDto.password, 10);
    const user = this.userRepository.create({
      ...createUserDto,
      password: passwordHash,
    });
    return this.userRepository.save(user);
  }

  findAll() {
    return this.userRepository.find();
  }

  findOne(id: number) {
    return this.userRepository.findOneBy({ id });
  }

  findByEmail(email: string) {
    return this.userRepository.findOneBy({ email });
  }

  findByUsername(username: string) {
    return this.userRepository.findOneBy({ username });
  }

  async update(id: number, updateUserDto: UpdateUserDto) {
    const data: Partial<User> = { ...updateUserDto } as any;

    // Si se envía una nueva contraseña, la hasheamos antes de guardar
    if (updateUserDto.password) {
      data.password = await bcrypt.hash(updateUserDto.password, 10);
    }

    await this.userRepository.update(id, data);
    return this.userRepository.findOneBy({ id });
  }

  remove(id: number) {
    return this.userRepository.delete(id);
  }

  async seedAdmin() {
    const existing = await this.findByEmail('admin@alicante.com');
    if (existing) return;

    const passwordHash = await bcrypt.hash('admin123', 10);
    const admin = this.userRepository.create({
      email: 'admin@alicante.com',
      password: passwordHash,
      role: UserRole.ADMIN,
      isActive: true,
    });
    await this.userRepository.save(admin);
    console.log('✅ Usuario admin creado: admin@alicante.com / admin123');
  }
}