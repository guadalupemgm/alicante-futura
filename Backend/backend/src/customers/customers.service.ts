import { Injectable, NotFoundException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { Customer } from './entities/customer.entity';
import { CreateCustomerDto } from './dto/create-customer.dto';
import { UpdateCustomerDto } from './dto/update-customer.dto';

@Injectable()
export class CustomersService {
  constructor(
    @InjectRepository(Customer)
    private readonly customersRepository: Repository<Customer>,
  ) {}

  findAll() {
    return this.customersRepository.find();
  }

  findOne(id: number) {
    return this.customersRepository.findOneBy({ id });
  }

  create(createCustomerDto: CreateCustomerDto) {
    const customer = this.customersRepository.create(createCustomerDto);
    return this.customersRepository.save(customer);
  }

  async update(id: number, updateCustomerDto: UpdateCustomerDto) {
    const customer = await this.customersRepository.findOneBy({ id });
    if (!customer) {
      throw new NotFoundException(`No existe el cliente con id ${id}`);
    }
    const updated = this.customersRepository.merge(customer, updateCustomerDto);
    return this.customersRepository.save(updated);
  }

  async remove(id: number) {
    const customer = await this.customersRepository.findOneBy({ id });
    if (!customer) {
      throw new NotFoundException(`No existe el cliente con id ${id}`);
    }
    await this.customersRepository.remove(customer);
    return { message: `Cliente ${id} eliminado correctamente` };
  }
}