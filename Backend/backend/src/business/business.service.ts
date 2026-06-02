import { Injectable, BadRequestException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { Business } from './entities/business.entity';
import { CreateBusinessDto } from './dto/create-business.dto';
import { UpdateBusinessDto } from './dto/update-business.dto';
import { UsersService } from '../users/users.service';
import { UserRole } from '../users/entities/user.entity';

@Injectable()
export class BusinessService {
  constructor(
    @InjectRepository(Business)
    private readonly businessRepository: Repository<Business>,
    private readonly usersService: UsersService,
  ) {}

  async create(createBusinessDto: CreateBusinessDto) {
    const existingUser = await this.usersService.findByEmail(createBusinessDto.ownerEmail);
    if (existingUser) {
      throw new BadRequestException('El correo electrónico ya está registrado');
    }

    const business = this.businessRepository.create(createBusinessDto);
    const saved = await this.businessRepository.save(business);

    try {
      await this.usersService.create({
        email: createBusinessDto.ownerEmail,
        password: createBusinessDto.ownerPassword,
        username: createBusinessDto.ownerEmail, // ✅ evita conflicto de unique null
        role: UserRole.BUSINESS,
        businessId: saved.id,
      });
    } catch (error) {
      // Si por alguna razón la creación del usuario falla (ej. carrera de condiciones),
      // borramos el negocio para no dejarlo huérfano.
      await this.businessRepository.delete(saved.id);
      throw error;
    }

    return saved;
  }

  findAll() {
    return this.businessRepository.find();
  }

  findOne(id: number) {
    return this.businessRepository.findOneBy({ id });
  }

  async update(id: number, updateBusinessDto: UpdateBusinessDto) {
    await this.businessRepository.update(id, updateBusinessDto);
    return this.businessRepository.findOneBy({ id });
  }

  remove(id: number) {
    return this.businessRepository.delete(id);
  }
}
