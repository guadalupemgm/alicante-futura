import { AppDataSource } from './src/data-source';
import { Business } from './src/business/entities/business.entity';
import { Customer } from './src/customers/entities/customer.entity';
import { User, UserRole } from './src/users/entities/user.entity';
import { Appointment, AppointmentStatus } from './src/appointments/appointment.entity';
import { Payment } from './src/payments/entities/payment.entity';
import { Config } from './src/config/config.entity';
import * as bcrypt from 'bcrypt';

// ─── Helpers ────────────────────────────────────────────────────────────────

const rand = <T>(arr: T[]): T => arr[Math.floor(Math.random() * arr.length)];
const randInt = (min: number, max: number) =>
  Math.floor(Math.random() * (max - min + 1)) + min;
const randFloat = (min: number, max: number) =>
  parseFloat((Math.random() * (max - min) + min).toFixed(2));

const NAMES = [
  'Ana García', 'Luis Martínez', 'María López', 'Carlos Pérez', 'Laura Sánchez',
  'Pablo Rodríguez', 'Elena Fernández', 'Javier González', 'Sofía Díaz', 'Adrián Torres',
  'Lucía Ramírez', 'Miguel Herrera', 'Isabel Castro', 'David Morales', 'Marta Jiménez',
];

const BUSINESSES = [
  'Peluquería Sol', 'Barbería El Rincón', 'Centro Estética Bella', 'Clínica Dental Sonrisa',
  'Fisioterapia Activa', 'Spa Relax', 'Uñas & Más', 'Centro Médico Salud', 'Óptica Clara',
  'Podología Express', 'Masajes Zen', 'Pilates Studio', 'Yoga Centro', 'Nutrición Vital',
];

const CATEGORIES = [
  'Peluquería', 'Barbería', 'Estética', 'Dental', 'Fisioterapia',
  'Spa', 'Manicura', 'Médico', 'Óptica', 'Podología',
];

const SERVICES = [
  'Corte de pelo', 'Tinte', 'Manicura', 'Pedicura', 'Masaje relajante',
  'Limpieza facial', 'Depilación', 'Consulta médica', 'Revisión dental', 'Fisioterapia',
];

const STREETS = [
  'Calle Mayor 12', 'Av. Constitución 45', 'C/ Valencia 8', 'Paseo Marítimo 3',
  'C/ San Juan 22', 'Av. España 100', 'C/ Colón 15', 'Plaza Mayor 1',
];

const CONFIG_KEYS = ['working_hours', 'timezone', 'currency', 'language', 'notifications'];

const CONFIG_VALUES: Record<string, any> = {
  working_hours: { start: '09:00', end: '18:00', days: ['Mon', 'Tue', 'Wed', 'Thu', 'Fri'] },
  timezone: 'Europe/Madrid',
  currency: 'EUR',
  language: 'es',
  notifications: { email: true, sms: false },
};

function randomPhone(): string {
  return `6${randInt(10, 99)}${randInt(100000, 999999)}`;
}

function futureDate(): string {
  const d = new Date();
  d.setDate(d.getDate() + randInt(1, 60));
  return d.toISOString().split('T')[0];
}

function randomTime(): string {
  const hour = randInt(9, 19);
  const min = rand(['00', '15', '30', '45']);
  return `${hour}:${min}`;
}

// ─── Main ────────────────────────────────────────────────────────────────────

async function seed() {
  await AppDataSource.initialize();
  console.log('📦 Conexión establecida');

  const businessRepo = AppDataSource.getRepository(Business);
  const customerRepo = AppDataSource.getRepository(Customer);
  const userRepo = AppDataSource.getRepository(User);
  const appointmentRepo = AppDataSource.getRepository(Appointment);
  const paymentRepo = AppDataSource.getRepository(Payment);
  const configRepo = AppDataSource.getRepository(Config);

  // 0. LIMPIAR tablas en orden inverso para respetar foreign keys
  await configRepo.query('DELETE FROM configurations');
  await paymentRepo.query('DELETE FROM payment');
  await appointmentRepo.query('DELETE FROM appointment');
  await userRepo.query('DELETE FROM user');
  await customerRepo.query('DELETE FROM customer');
  await businessRepo.query('DELETE FROM business');
  // Resetear los autoincrementos
  await businessRepo.query("DELETE FROM sqlite_sequence WHERE name IN ('business','customer','user','appointment','payment','configurations')");
  console.log('🧹 Tablas limpiadas');

  // 1. BUSINESS
  const businesses: Business[] = [];
  for (let i = 0; i < 50; i++) {
    const b = new Business();
    b.name = BUSINESSES[i % BUSINESSES.length] + (i >= BUSINESSES.length ? ` ${i}` : '');
    b.category = CATEGORIES[i % CATEGORIES.length];
    b.email = `negocio${i + 1}@ejemplo.com`;
    b.phone = randomPhone();
    b.address = STREETS[i % STREETS.length];
    b.status = rand(['active', 'active', 'active', 'inactive']);
    businesses.push(await businessRepo.save(b));
  }
  console.log('✅ 50 businesses insertados');

  // 2. CUSTOMER
  const customers: Customer[] = [];
  for (let i = 0; i < 50; i++) {
    const c = new Customer();
    c.name = NAMES[i % NAMES.length];
    c.email = `cliente${i + 1}@ejemplo.com`;
    c.phone = randomPhone();
    c.business = businesses[i % businesses.length].name;
    customers.push(await customerRepo.save(c));
  }
  console.log('✅ 50 customers insertados');

  // 3. USER
  const hashedPassword = await bcrypt.hash('Password123!', 10);
  for (let i = 0; i < 50; i++) {
    const u = new User();
    u.username = `user${i + 1}`;
    u.email = `user${i + 1}@ejemplo.com`;
    u.password = hashedPassword;
    u.name = NAMES[i % NAMES.length];
    u.phone = randomPhone();
    u.role = i === 0 ? UserRole.ADMIN : rand([UserRole.BUSINESS, UserRole.CUSTOMER]);
    u.isActive = rand([true, true, true, false]);
    u.businessId = (u.role === UserRole.BUSINESS ? businesses[i % businesses.length].id : null) as any;
    u.customerId = (u.role === UserRole.CUSTOMER ? customers[i % customers.length].id : null) as any;
    await userRepo.save(u);
  }
  console.log('✅ 50 users insertados');

  // 4. APPOINTMENT
  const appointments: Appointment[] = [];
  for (let i = 0; i < 50; i++) {
    const a = new Appointment();
    a.date = futureDate();
    a.time = randomTime();
    a.status = rand([
      AppointmentStatus.PENDING,
      AppointmentStatus.CONFIRMED,
      AppointmentStatus.PAID,
      AppointmentStatus.CANCELLED,
    ]);
    a.serviceName = SERVICES[i % SERVICES.length];
    a.customerId = customers[i % customers.length].id;
    a.businessId = businesses[i % businesses.length].id;
    appointments.push(await appointmentRepo.save(a));
  }
  console.log('✅ 50 appointments insertados');

  // 5. PAYMENT (solo citas no canceladas)
  let paymentCount = 0;
  for (const appt of appointments) {
    if (paymentCount >= 50) break;
    if (appt.status === AppointmentStatus.CANCELLED) continue;
    const p = new Payment();
    p.amount = randFloat(15, 120);
    p.method = rand(['cash', 'card', 'transfer']);
    p.status = appt.status === AppointmentStatus.PAID ? 'paid' : rand(['pending', 'paid']);
    p.appointmentId = appt.id;
    await paymentRepo.save(p);
    paymentCount++;
  }
  console.log(`✅ ${paymentCount} payments insertados`);

  // 6. CONFIGURATIONS — 3 servicios únicos por negocio + horario
  const ALL_SERVICES = [
    'Corte de pelo', 'Tinte', 'Manicura', 'Pedicura', 'Masaje relajante',
    'Limpieza facial', 'Depilación', 'Consulta médica', 'Revisión dental',
    'Fisioterapia', 'Mechas', 'Alisado', 'Hidratación', 'Exfoliación', 'Microblading',
  ];

  for (const business of businesses) {
    const shuffled = [...ALL_SERVICES].sort(() => Math.random() - 0.5);
    const services = shuffled.slice(0, 3).map(name => ({
      name,
      price: parseFloat((Math.random() * (80 - 10) + 10).toFixed(2)),
    }));

    const cfg = new Config();
    cfg.entityId = String(business.id);
    cfg.entityType = 'business';
    cfg.key = 'services';
    cfg.value = services;
    await configRepo.save(cfg);

    const horario = new Config();
    horario.entityId = String(business.id);
    horario.entityType = 'business';
    horario.key = 'working_hours';
    horario.value = { start: '09:00', end: '18:00', days: ['Mon', 'Tue', 'Wed', 'Thu', 'Fri'] };
    await configRepo.save(horario);
  }
  console.log('✅ 50 negocios con 3 servicios insertados en configurations');

  await AppDataSource.destroy();
  console.log('\n🎉 Seed completado');
}

seed().catch((err) => {
  console.error('❌ Error en seed:', err);
  process.exit(1);
});