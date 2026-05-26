import { Injectable, NotFoundException } from '@nestjs/common';
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

  async findByBusiness(businessId: number) {
    return this.paymentRepository.find({
      where: { appointment: { businessId } },
      relations: ['appointment'],
    });
  }

  findOne(id: number) {
    return this.paymentRepository.findOneBy({ id });
  }

  /**
   * Actualiza el pago. Si cambia el estado, sincroniza la reserva:
   *   pago → paid      ⟹  reserva → paid
   *   pago → cancelled ⟹  reserva → cancelled
   *   pago → pending   ⟹  reserva → pending
   *
   * Si cambia el importe u otros campos, solo actualiza el pago.
   */
  async update(id: number, updatePaymentDto: UpdatePaymentDto) {
    const payment = await this.paymentRepository.findOneBy({ id });
    if (!payment) throw new NotFoundException(`No existe el pago con id ${id}`);

    await this.paymentRepository.update(id, updatePaymentDto);

    // Sincronizar reserva si cambia el estado del pago
    if (updatePaymentDto.status !== undefined && payment.appointmentId) {
      let newAppointmentStatus: AppointmentStatus;

      if (updatePaymentDto.status === 'paid') {
        newAppointmentStatus = AppointmentStatus.PAID;
      } else if (updatePaymentDto.status === 'cancelled') {
        newAppointmentStatus = AppointmentStatus.CANCELLED;
      } else {
        newAppointmentStatus = AppointmentStatus.PENDING;
      }

      await this.appointmentRepository.update(payment.appointmentId, {
        status: newAppointmentStatus,
      });
    }

    return this.paymentRepository.findOneBy({ id });
  }

  remove(id: number) {
    return this.paymentRepository.delete(id);
  }
}