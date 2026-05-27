"use client";

import { useState } from "react";

interface PaymentGatewayProps {
  amount: number;
  onSuccess: (paymentDetails: any) => void;
  onCancel: () => void;
}

export default function PaymentGateway({ amount, onSuccess, onCancel }: PaymentGatewayProps) {
  const [loading, setLoading] = useState(false);
  const [formData, setFormData] = useState({
    cardName: "",
    cardNumber: "",
    expiry: "",
    cvv: "",
  });

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target;
    setFormData((prev) => ({ ...prev, [name]: value }));
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);

    // Simulamos la pasarela de pago (un pequeño retraso de red)
    setTimeout(() => {
      setLoading(false);
      onSuccess(formData);
    }, 2000);
  };

  return (
    <div className="max-w-md mx-auto bg-white rounded-xl shadow-md overflow-hidden p-6 border border-gray-100">
      {/* 1. Resumen de la Compra */}
      <div className="border-b border-gray-200 pb-4 mb-6">
        <h2 className="text-xl font-bold text-gray-800">Resumen del Pedido</h2>
        <div className="flex justify-between items-center mt-3 text-gray-600">
          <span>Servicio de Reserva (BookFlow)</span>
          <span className="font-semibold text-gray-900">{amount.toFixed(2)}€</span>
        </div>
        <div className="flex justify-between items-center mt-2 pt-2 border-t border-dashed text-lg font-bold text-gray-900">
          <span>Total a pagar:</span>
          <span className="text-blue-600">{amount.toFixed(2)}€</span>
        </div>
      </div>

      {/* 2. Formulario de la Tarjeta */}
      <form onSubmit={handleSubmit} className="space-y-4">
        <h3 className="text-sm font-semibold text-gray-700 uppercase tracking-wider mb-2">
          Detalles del Pago
        </h3>

        <div>
          <label className="block text-xs font-medium text-gray-600 mb-1">Nombre en la tarjeta</label>
          <input
            type="text"
            name="cardName"
            required
            value={formData.cardName}
            onChange={handleChange}
            placeholder="Juan Pérez"
            className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
          />
        </div>

        <div>
          <label className="block text-xs font-medium text-gray-600 mb-1">Número de tarjeta</label>
          <div className="relative">
            <input
              type="text"
              name="cardNumber"
              required
              maxLength={16}
              value={formData.cardNumber}
              onChange={handleChange}
              placeholder="4000 1234 5678 9010"
              className="w-full px-3 py-2 pl-10 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
            />
            <i className="bi bi-credit-card-2-front absolute left-3 top-3 text-gray-400"></i>
          </div>
        </div>

        <div className="grid grid-cols-2 gap-4">
          <div>
            <label className="block text-xs font-medium text-gray-600 mb-1">Fecha expiración</label>
            <input
              type="text"
              name="expiry"
              required
              maxLength={5}
              value={formData.expiry}
              onChange={handleChange}
              placeholder="MM/AA"
              className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 text-center"
            />
          </div>
          <div>
            <label className="block text-xs font-medium text-gray-600 mb-1">CVV</label>
            <input
              type="password"
              name="cvv"
              required
              maxLength={3}
              value={formData.cvv}
              onChange={handleChange}
              placeholder="•••"
              className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 text-center"
            />
          </div>
        </div>

        {/* Botonera */}
        <div className="pt-4 flex space-x-3">
          <button
            type="button"
            onClick={onCancel}
            disabled={loading}
            className="w-1/2 bg-gray-100 hover:bg-gray-200 text-gray-700 font-medium py-2 rounded-lg transition duration-200 disabled:opacity-50"
          >
            Cancelar
          </button>
          <button
            type="submit"
            disabled={loading}
            className="w-1/2 bg-blue-600 hover:bg-blue-700 text-white font-medium py-2 rounded-lg transition duration-200 flex justify-center items-center disabled:opacity-50"
          >
            {loading ? (
              <>
                <span className="spinner-border spinner-border-sm mr-2 animate-spin" role="status" />
                Procesando...
              </>
            ) : (
              `Pagar ${amount.toFixed(2)}€`
            )}
          </button>
        </div>
      </form>
    </div>
  );
}