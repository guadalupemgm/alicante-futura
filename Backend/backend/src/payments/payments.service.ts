import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { Payment } from './entities/payment.entity';
import { CreatePaymentDto } from './dto/create-payment.dto';
import { UpdatePaymentDto } from './dto/update-payment.dto';
import { Appointment, AppointmentStatus } from '../appointments/appointment.entity';

@Injectable()
export class PaymentsService {
  constructor(
    @InjectRepository(Payment)
    private readonly paymentRepository: Repository<Payment>,
    @InjectRepository(Appointment)
    private readonly appointmentRepository: Repository<Appointment>,
  ) {}

  create(createPaymentDto: CreatePaymentDto) {
    const payment = this.paymentRepository.create(createPaymentDto);
    return this.paymentRepository.save(payment);
  }

  findAll() {
    return this.paymentRepository.find();
  }

  findOne(id: number) {
    return this.paymentRepository.findOneBy({ id });
  }

  async update(id: number, updatePaymentDto: UpdatePaymentDto) {
    await this.paymentRepository.update(id, updatePaymentDto);

    // Sincronizar el appointment vinculado si cambia el status del payment
    if (updatePaymentDto.status !== undefined) {
      const payment = await this.paymentRepository.findOneBy({ id });
      if (payment?.appointmentId) {
        const newAppointmentStatus =
          updatePaymentDto.status === 'paid'
            ? AppointmentStatus.PAID
            : AppointmentStatus.PENDING;
        await this.appointmentRepository.update(payment.appointmentId, {
          status: newAppointmentStatus,
        });
      }
    }

    return this.paymentRepository.findOneBy({ id });
  }

  remove(id: number) {
    return this.paymentRepository.delete(id);
  }
}