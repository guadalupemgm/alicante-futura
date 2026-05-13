<<<<<<< HEAD
import { Injectable } from '@nestjs/common';
=======
import { Injectable, NotFoundException } from '@nestjs/common';
>>>>>>> e1b3fb2182e54d464229d93a0bbe3d13edf285f7
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { Customer } from './entities/customer.entity';
import { CreateCustomerDto } from './dto/create-customer.dto';
import { UpdateCustomerDto } from './dto/update-customer.dto';

@Injectable()
export class CustomersService {
  constructor(
    @InjectRepository(Customer)
<<<<<<< HEAD
    private readonly customerRepository: Repository<Customer>,
  ) {}

  create(createCustomerDto: CreateCustomerDto) {
    const customer = this.customerRepository.create(createCustomerDto);
    return this.customerRepository.save(customer);
  }

  findAll() {
    return this.customerRepository.find();
  }

  findOne(id: number) {
    return this.customerRepository.findOneBy({ id });
  }

  update(id: number, updateCustomerDto: UpdateCustomerDto) {
    return this.customerRepository.update(id, updateCustomerDto);
  }

  remove(id: number) {
    return this.customerRepository.delete(id);
  }
=======
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
>>>>>>> e1b3fb2182e54d464229d93a0bbe3d13edf285f7
}