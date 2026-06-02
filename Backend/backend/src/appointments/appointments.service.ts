import { Injectable, NotFoundException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { Appointment, AppointmentStatus } from './appointment.entity';
import { CreateAppointmentDto } from './dto/create-appointment.dto';
import { UpdateAppointmentDto } from './dto/update-appointment.dto';
import { Payment } from '../payments/entities/payment.entity';

@Injectable()
export class AppointmentsService {
  constructor(
    @InjectRepository(Appointment)
    private readonly appointmentsRepository: Repository<Appointment>,
    @InjectRepository(Payment)
    private readonly paymentRepository: Repository<Payment>,
  ) {}

  findAll() {
    return this.appointmentsRepository.find({
      order: { date: 'ASC', time: 'ASC' },
    });
  }

  findByBusiness(businessId: number) {
    return this.appointmentsRepository.find({
      where: { businessId },
      order: { date: 'ASC', time: 'ASC' },
    });
  }

  findByCustomer(customerId: number) {
    return this.appointmentsRepository.find({
      where: { customerId },
      relations: ['business'], // <--- Esto le dice a TypeORM: "trae también el objeto relacionado"
      order: { date: 'ASC', time: 'ASC' },
    });
  }

  findOne(id: number) {
    return this.appointmentsRepository.findOneBy({ id });
  }

  /**
   * Crea la reserva y automáticamente genera un pago asociado.
   * Si la reserva ya está pagada (prepago), se registra el pago completado.
   * Si está pendiente (ej. opción 'Otro'), el pago queda pendiente de presupuestar.
   */
  async create(createAppointmentDto: CreateAppointmentDto) {
    console.log('[Create Appointment] Payload recibido:', createAppointmentDto);
    const appointment =
      this.appointmentsRepository.create(createAppointmentDto);
    const saved = await this.appointmentsRepository.save(appointment);

    const isPrepaid = createAppointmentDto.status === AppointmentStatus.PAID;
    console.log(
      '[Create Appointment] ¿Es prepago?:',
      isPrepaid,
      '| Estado:',
      createAppointmentDto.status,
      '| Precio:',
      createAppointmentDto.price,
    );

    // Crear pago automático vinculado a la reserva
    const payment = this.paymentRepository.create({
      amount: isPrepaid ? (createAppointmentDto.price ?? 0) : 0,
      method: isPrepaid ? 'Tarjeta' : 'Pendiente',
      status: isPrepaid ? 'paid' : 'pending',
      appointmentId: saved.id,
    });
    console.log('[Create Appointment] Pago generado:', payment);
    await this.paymentRepository.save(payment);

    return saved;
  }

  /**
   * Actualiza la reserva. Si cambia el estado, sincroniza el pago:
   *   reserva → paid      ⟹  pago → paid
   *   reserva → cancelled ⟹  pago → cancelled
   *   reserva → pending/confirmed ⟹ pago → pending
   */
  async update(id: number, updateAppointmentDto: UpdateAppointmentDto) {
    const appointment = await this.appointmentsRepository.findOneBy({ id });
    if (!appointment) {
      throw new NotFoundException(`No existe la reserva con id ${id}`);
    }

    const updated = this.appointmentsRepository.merge(
      appointment,
      updateAppointmentDto,
    );
    const saved = await this.appointmentsRepository.save(updated);

    // Sincronizar pago si cambia el estado
    if (updateAppointmentDto.status !== undefined) {
      const paymentStatus =
        updateAppointmentDto.status === AppointmentStatus.PAID
          ? 'paid'
          : updateAppointmentDto.status === AppointmentStatus.CANCELLED
            ? 'cancelled'
            : 'pending';

      await this.paymentRepository.update(
        { appointmentId: id },
        { status: paymentStatus },
      );
    }

    return saved;
  }

  async remove(id: number) {
    const appointment = await this.appointmentsRepository.findOneBy({ id });
    if (!appointment) {
      throw new NotFoundException(`No existe la reserva con id ${id}`);
    }
    await this.appointmentsRepository.remove(appointment);
    return { message: `Reserva ${id} eliminada correctamente` };
  }
}
