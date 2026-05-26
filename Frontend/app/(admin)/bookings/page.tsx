"use client";

import { useEffect, useState } from "react";
import BookingsClient from "./BookingsClient";
import { getAppointments } from "@/lib/api";
import type { Booking } from "@/lib/api";

export default function BookingsPage() {
  const [bookings, setBookings] = useState<Booking[]>([]);
  const [loading, setLoading]   = useState(true);

  useEffect(() => {
    getAppointments()
      .then(setBookings)
      .catch(console.error)
      .finally(() => setLoading(false));
  }, []);

  if (loading) {
    return (
      <div className="auth-loading">
        <div className="auth-loading__spinner" />
      </div>
    );
  }

  return <BookingsClient initialBookings={bookings} />;
}