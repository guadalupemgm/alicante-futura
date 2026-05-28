// --- CAMBIO CLAVE: Añadir "cancelled" al tipo ---
export type BookingStatus = "pending" | "confirmed" | "paid" | "cancelled";

export interface Booking {
  id: number;
  date: string;
  time: string;
  status: BookingStatus;
  customerId: number;
  businessId: number;
  serviceName: string;
}

export interface CreateBookingDto {
  date: string;
  time: string;
  status: BookingStatus;
  customerId: number;
  businessId: number;
  serviceName: string;
}

export interface UpdateBookingDto {
  date?: string;
  time?: string;
  status?: BookingStatus;
  customerId?: number;
  businessId?: number;
  serviceName?: string;
}

export interface Business {
  id: number;
  name: string;
  address: string;
}

export interface Customer {
  id: number;
  name: string;
  email: string;
  phone: string;
  business?: string;
}

const API_URL = process.env.NEXT_PUBLIC_API_URL || "http://localhost:3000";

function getHeaders(token?: string): HeadersInit {
  const activeToken = token || (typeof window !== "undefined" ? localStorage.getItem("auth_token") : null);
  return {
    "Content-Type": "application/json",
    ...(activeToken ? { Authorization: `Bearer ${activeToken}` } : {}),
  };
}

export async function getAppointments(token?: string): Promise<Booking[]> {
  const res = await fetch(`${API_URL}/appointments`, {
    cache: "no-store",
    headers: getHeaders(token),
  });
  if (!res.ok) throw new Error("Error al obtener las reservas");
  return res.json();
}

export async function createAppointment(data: CreateBookingDto, token?: string): Promise<Booking> {
  const res = await fetch(`${API_URL}/appointments`, {
    method: "POST",
    headers: getHeaders(token),
    body: JSON.stringify(data),
  });
  if (!res.ok) {
    const errorText = await res.text();
    console.error("Error del backend:", errorText);
    throw new Error("Error al crear la reserva");
  }
  return res.json();
}

export async function updateAppointment(id: number, data: UpdateBookingDto, token?: string): Promise<Booking> {
  const res = await fetch(`${API_URL}/appointments/${id}`, {
    method: "PATCH",
    headers: getHeaders(token),
    body: JSON.stringify(data),
  });
  if (!res.ok) throw new Error("Error al editar la reserva");
  return res.json();
}

export async function deleteAppointment(id: number, token?: string): Promise<void> {
  const res = await fetch(`${API_URL}/appointments/${id}`, {
    method: "DELETE",
    headers: getHeaders(token),
  });
  if (!res.ok) throw new Error("Error al eliminar la reserva");
}

export async function getBusinesses(token?: string): Promise<Business[]> {
  const res = await fetch(`${API_URL}/business`, {
    cache: "no-store",
    headers: getHeaders(token),
  });
  if (!res.ok) throw new Error("Error al obtener los negocios");
  return res.json();
}

export async function getCustomers(token?: string): Promise<Customer[]> {
  const res = await fetch(`${API_URL}/customers`, {
    cache: "no-store",
    headers: getHeaders(token),
  });
  if (!res.ok) throw new Error("Error al obtener los clientes");
  return res.json();
}

export interface CreateCustomerDto {
  name: string;
  email: string;
  phone: string;
  business?: string;
}

export async function createCustomer(data: CreateCustomerDto, token?: string): Promise<Customer> {
  const res = await fetch(`${API_URL}/customers`, {
    method: "POST",
    headers: getHeaders(token),
    body: JSON.stringify(data),
  });
  if (!res.ok) {
    const errorText = await res.text();
    console.error("Error del backend:", errorText);
    throw new Error("Error al crear el cliente");
  }
  return res.json();
}

export interface CreateBusinessDto {
  name: string;
  address: string;
  category?: string;
  phone?: string;
  status?: string;
  ownerEmail: string;
  ownerPassword: string;
}

export async function createBusiness(data: CreateBusinessDto, token?: string): Promise<Business> {
  const res = await fetch(`${API_URL}/business`, {
    method: "POST",
    headers: getHeaders(token),
    body: JSON.stringify(data),
  });
  if (!res.ok) {
    const errorText = await res.text();
    console.error("Error del backend:", errorText);
    throw new Error("Error al crear el negocio");
  }
  return res.json();
}

// ─── Admin: editar usuario (cliente) ────────────────────────────────────────
export interface UpdateCustomerDto {
  name?: string;
  email?: string;
  phone?: string;
  business?: string;
}

export async function updateCustomer(id: number, data: UpdateCustomerDto, token?: string): Promise<Customer> {
  const res = await fetch(`${API_URL}/customers/${id}`, {
    method: "PATCH",
    headers: getHeaders(token),
    body: JSON.stringify(data),
  });
  if (!res.ok) throw new Error("Error al actualizar el cliente");
  return res.json();
}

// ─── Admin: editar negocio ───────────────────────────────────────────────────
export interface UpdateBusinessDto {
  name?: string;
  address?: string;
  category?: string;
  phone?: string;
  email?: string;
  status?: string;
}

export async function updateBusiness(id: number, data: UpdateBusinessDto, token?: string): Promise<Business> {
  const res = await fetch(`${API_URL}/business/${id}`, {
    method: "PATCH",
    headers: getHeaders(token),
    body: JSON.stringify(data),
  });
  if (!res.ok) throw new Error("Error al actualizar el negocio");
  return res.json();
}

export interface Payment {
  id: number;
  amount: number;
  method: string;
  status: "pending" | "paid" | "cancelled";
  appointmentId: number;
}

export async function getAppointmentsByBusiness(businessId: number, token?: string): Promise<Booking[]> {
  const res = await fetch(`${API_URL}/appointments/business/${businessId}`, {
    cache: "no-store",
    headers: getHeaders(token),
  });
  if (!res.ok) throw new Error("Error al obtener las reservas del negocio");
  return res.json();
}

export async function getPaymentsByBusiness(businessId: number, token?: string): Promise<Payment[]> {
  const res = await fetch(`${API_URL}/payments/business/${businessId}`, {
    cache: "no-store",
    headers: getHeaders(token),
  });
  if (!res.ok) throw new Error("Error al obtener los pagos del negocio");
  return res.json();
}