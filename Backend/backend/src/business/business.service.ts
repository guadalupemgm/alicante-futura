import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { Business } from './entities/business.entity';
import { CreateBusinessDto } from './dto/create-business.dto';

@Injectable()
export class BusinessService {
  constructor(
    @InjectRepository(Business)
    private readonly businessRepository: Repository<Business>,
  ) {}

  create(createBusinessDto: CreateBusinessDto) {
    const business = this.businessRepository.create(createBusinessDto);
    return this.businessRepository.save(business);
  }

  findAll() {
    return this.businessRepository.find();
  }

  findOne(id: number) {
    return this.businessRepository.findOneBy({ id });
  }

  remove(id: number) {
    return this.businessRepository.delete(id);
  }
}