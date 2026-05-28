import { AppDataSource } from './src/data-source';
import { Business } from './src/business/entities/business.entity';
import { Customer } from './src/customers/entities/customer.entity';
import { User, UserRole } from './src/users/entities/user.entity';
import { Appointment, AppointmentStatus } from './src/appointments/appointment.entity';
import { Payment } from './src/payments/entities/payment.entity';
import { Config } from './src/config/config.entity';
import * as bcrypt from 'bcrypt';
import { faker } from '@faker-js/faker/locale/es';

// ─── Helpers ────────────────────────────────────────────────────────────────

const rand = <T>(arr: T[]): T => arr[Math.floor(Math.random() * arr.length)];

const APPOINTMENT_STATUSES = [
  AppointmentStatus.PENDING,
  AppointmentStatus.CONFIRMED,
  AppointmentStatus.PAID,
  AppointmentStatus.CANCELLED,
];

const PAYMENT_METHODS = ['cash', 'card', 'transfer'];

// ─── Main ────────────────────────────────────────────────────────────────────

async function seed() {
  await AppDataSource.initialize();
  console.log('📦 Conexión establecida');

  const businessRepo    = AppDataSource.getRepository(Business);
  const customerRepo    = AppDataSource.getRepository(Customer);
  const userRepo        = AppDataSource.getRepository(User);
  const appointmentRepo = AppDataSource.getRepository(Appointment);
  const paymentRepo     = AppDataSource.getRepository(Payment);
  const configRepo      = AppDataSource.getRepository(Config);

  // 0. LIMPIAR tablas en orden inverso
  await configRepo.query('DELETE FROM configurations');
  await paymentRepo.query('DELETE FROM payment');
  await appointmentRepo.query('DELETE FROM appointment');
  await userRepo.query('DELETE FROM user');
  await customerRepo.query('DELETE FROM customer');
  await businessRepo.query('DELETE FROM business');
  await businessRepo.query("DELETE FROM sqlite_sequence WHERE name IN ('business','customer','user','appointment','payment','configurations')");
  console.log('🧹 Tablas limpiadas');

  const hashedPassword = await bcrypt.hash('prueba', 10);

  // 1. BUSINESS — 300 negocios
  const businesses: Business[] = [];
  for (let i = 0; i < 300; i++) {
    const b = new Business();
    b.name     = faker.company.name();
    b.category = faker.commerce.department();
    b.email    = faker.internet.email().toLowerCase();
    b.phone    = faker.phone.number({ style: 'national' });
    b.address  = `${faker.location.street()} ${faker.location.buildingNumber()}, ${faker.location.city()}`;
    b.status   = faker.helpers.arrayElement(['active', 'active', 'active', 'inactive']);
    businesses.push(await businessRepo.save(b));
  }
  console.log('✅ 300 businesses insertados');

  // 2. Usuarios BUSINESS — uno por cada negocio
  for (const business of businesses) {
    const u = new User();
    u.email      = business.email;
    u.username   = business.email;
    u.password   = hashedPassword;
    u.name       = business.name;
    u.phone      = business.phone;
    u.role       = UserRole.BUSINESS;
    u.isActive   = business.status === 'active';
    u.businessId = business.id;
    u.customerId = null as any;
    await userRepo.save(u);
  }
  console.log('✅ 300 usuarios business insertados (vinculados a sus negocios)');

  // 3. CUSTOMER — 300 clientes
  const customers: Customer[] = [];
  for (let i = 0; i < 300; i++) {
    const c = new Customer();
    c.name     = faker.person.fullName();
    c.email    = faker.internet.email().toLowerCase();
    c.phone    = faker.phone.number({ style: 'national' });
    c.business = faker.helpers.arrayElement(businesses).name;
    customers.push(await customerRepo.save(c));
  }
  console.log('✅ 300 customers insertados');

  // 4. Usuarios CUSTOMER — uno por cada cliente
  for (const customer of customers) {
    const u = new User();
    u.email      = customer.email;
    u.username   = customer.email;
    u.password   = hashedPassword;
    u.name       = customer.name;
    u.phone      = customer.phone;
    u.role       = UserRole.CUSTOMER;
    u.isActive   = true;
    u.customerId = customer.id;
    u.businessId = null as any;
    await userRepo.save(u);
  }
  console.log('✅ 300 usuarios customer insertados (vinculados a sus clientes)');

  // 5. Usuario ADMIN
  const admin = new User();
  admin.username   = 'admin';
  admin.email      = 'admin@alicante.com';
  admin.password   = await bcrypt.hash('admin123', 10);
  admin.name       = 'Administrador';
  admin.role       = UserRole.ADMIN;
  admin.isActive   = true;
  admin.businessId = null as any;
  admin.customerId = null as any;
  await userRepo.save(admin);
  console.log('✅ Usuario admin insertado (admin@alicante.com / admin123)');

  // 6. APPOINTMENTS — 300 citas entre clientes y negocios reales
  const appointments: Appointment[] = [];
  for (let i = 0; i < 300; i++) {
    const a = new Appointment();
    a.date        = faker.date.between({
      from: new Date(Date.now() - 30 * 24 * 60 * 60 * 1000),
      to:   new Date(Date.now() + 60 * 24 * 60 * 60 * 1000),
    }).toISOString().split('T')[0];
    a.time        = faker.helpers.arrayElement([
      '09:00', '09:30', '10:00', '10:30', '11:00', '11:30',
      '12:00', '12:30', '13:00', '15:00', '15:30', '16:00',
      '16:30', '17:00', '17:30', '18:00',
    ]);
    a.status      = rand(APPOINTMENT_STATUSES);
    a.serviceName = faker.commerce.productName();
    a.customerId  = faker.helpers.arrayElement(customers).id;
    a.businessId  = faker.helpers.arrayElement(businesses).id;
    appointments.push(await appointmentRepo.save(a));
  }
  console.log('✅ 300 appointments insertados');

  // 7. PAYMENTS — solo para citas no canceladas
  let paymentCount = 0;
  for (const appt of appointments) {
    if (appt.status === AppointmentStatus.CANCELLED) continue;
    const p = new Payment();
    p.amount        = parseFloat(faker.commerce.price({ min: 15, max: 120 }));
    p.method        = rand(PAYMENT_METHODS);
    p.status        = appt.status === AppointmentStatus.PAID
      ? 'paid'
      : faker.helpers.arrayElement(['pending', 'paid']);
    p.appointmentId = appt.id;
    await paymentRepo.save(p);
    paymentCount++;
  }
  console.log(`✅ ${paymentCount} payments insertados`);

  // 8. CONFIGURATIONS — 3 servicios + horario por cada negocio
  for (const business of businesses) {
    const services = Array.from({ length: 3 }, () => ({
      name:  faker.commerce.productName(),
      price: parseFloat(faker.commerce.price({ min: 10, max: 80 })),
    }));

    const cfgServices = new Config();
    cfgServices.entityId   = String(business.id);
    cfgServices.entityType = 'business';
    cfgServices.key        = 'services';
    cfgServices.value      = services;
    await configRepo.save(cfgServices);

    const cfgHorario = new Config();
    cfgHorario.entityId   = String(business.id);
    cfgHorario.entityType = 'business';
    cfgHorario.key        = 'working_hours';
    cfgHorario.value      = {
      start: faker.helpers.arrayElement(['08:00', '09:00', '10:00']),
      end:   faker.helpers.arrayElement(['17:00', '18:00', '19:00', '20:00']),
      days:  faker.helpers.arrayElements(
        ['Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'],
        { min: 4, max: 6 }
      ),
    };
    await configRepo.save(cfgHorario);
  }
  console.log('✅ 300 negocios con servicios y horarios en configurations');

  await AppDataSource.destroy();
  console.log('\n🎉 Seed completado con 300 registros de cada entidad');
  console.log('📋 Credenciales de prueba:');
  console.log('   Admin:    admin@alicante.com / admin123');
  console.log('   Negocio:  <email del negocio> / prueba');
  console.log('   Cliente:  <email del cliente> / prueba');
}

seed().catch((err) => {
  console.error('❌ Error en seed:', err);
  process.exit(1);
});