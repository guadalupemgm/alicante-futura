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

export async function getAppointments(): Promise<Booking[]> {
  const res = await fetch(`${API_URL}/appointments`, {
    cache: "no-store",
  });
  if (!res.ok) throw new Error("Error al obtener las reservas");
  return res.json();
}

export async function createAppointment(data: CreateBookingDto): Promise<Booking> {
  const res = await fetch(`${API_URL}/appointments`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(data),
  });
  if (!res.ok) {
    const errorText = await res.text();
    console.error("Error del backend:", errorText);
    throw new Error("Error al crear la reserva");
  }
  return res.json();
}

export async function updateAppointment(id: number, data: UpdateBookingDto): Promise<Booking> {
  const res = await fetch(`${API_URL}/appointments/${id}`, {
    method: "PATCH",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(data),
  });
  if (!res.ok) throw new Error("Error al editar la reserva");
  return res.json();
}

export async function deleteAppointment(id: number): Promise<void> {
  const res = await fetch(`${API_URL}/appointments/${id}`, {
    method: "DELETE",
  });
  if (!res.ok) throw new Error("Error al eliminar la reserva");
}

export async function getBusinesses(): Promise<Business[]> {
  const res = await fetch(`${API_URL}/business`, {
    cache: "no-store",
  });
  if (!res.ok) throw new Error("Error al obtener los negocios");
  return res.json();
}

export async function getCustomers(): Promise<Customer[]> {
  const res = await fetch(`${API_URL}/customers`, {
    cache: "no-store",
  });
  if (!res.ok) throw new Error("Error al obtener los clientes");
  return res.json();
}