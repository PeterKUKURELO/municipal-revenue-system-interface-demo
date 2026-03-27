import { CreditCard, AlertCircle, FileText, Home, IdCard, MapPinned } from 'lucide-react';
import type { DebtSummary, RecentPayment } from '../types';

interface DashboardProps {
  userName: string;
  dni: string;
  ubigeo: string;
  debtSummary: DebtSummary;
  recentPayments: RecentPayment[];
  onPayNow: () => void;
}

export default function Dashboard({
  userName,
  dni,
  ubigeo,
  debtSummary,
  recentPayments,
  onPayNow
}: DashboardProps) {
  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
      <div className="mb-8">
        <h2 className="text-2xl text-gray-900">Hola, {userName}</h2>
        <p className="text-gray-600 mt-1">Bienvenido a tu panel de gestión tributaria</p>
        <div className="flex flex-wrap gap-3 mt-4">
          <div className="inline-flex items-center gap-2 px-3 py-2 rounded-full bg-[#E8F5E9] text-sm text-[#0B7A43]">
            <IdCard className="w-4 h-4" />
            DNI {dni}
          </div>
          <div className="inline-flex items-center gap-2 px-3 py-2 rounded-full bg-blue-50 text-sm text-blue-700">
            <MapPinned className="w-4 h-4" />
            Ubigeo {ubigeo}
          </div>
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4 mb-8">
        <div className="bg-white rounded-xl p-6 border border-gray-200 shadow-sm">
          <div className="flex items-start justify-between mb-4">
            <div className="w-12 h-12 bg-red-50 rounded-lg flex items-center justify-center">
              <CreditCard className="w-6 h-6 text-red-600" />
            </div>
            <span className="px-2 py-1 bg-red-50 text-red-700 text-xs rounded-full">Pendiente</span>
          </div>
          <p className="text-sm text-gray-600 mb-1">Deuda Total</p>
          <p className="text-2xl text-gray-900 mb-0">S/ {debtSummary.total.toFixed(2)}</p>
        </div>

        <div className="bg-white rounded-xl p-6 border border-gray-200 shadow-sm">
          <div className="flex items-start justify-between mb-4">
            <div className="w-12 h-12 bg-[#E8F5E9] rounded-lg flex items-center justify-center">
              <Home className="w-6 h-6 text-[#0FA958]" />
            </div>
          </div>
          <p className="text-sm text-gray-600 mb-1">Arbitrios</p>
          <p className="text-2xl text-gray-900 mb-0">S/ {debtSummary.arbitrios.toFixed(2)}</p>
        </div>

        <div className="bg-white rounded-xl p-6 border border-gray-200 shadow-sm">
          <div className="flex items-start justify-between mb-4">
            <div className="w-12 h-12 bg-orange-50 rounded-lg flex items-center justify-center">
              <AlertCircle className="w-6 h-6 text-orange-600" />
            </div>
          </div>
          <p className="text-sm text-gray-600 mb-1">Multas</p>
          <p className="text-2xl text-gray-900 mb-0">S/ {debtSummary.multas.toFixed(2)}</p>
        </div>

        <div className="bg-white rounded-xl p-6 border border-gray-200 shadow-sm">
          <div className="flex items-start justify-between mb-4">
            <div className="w-12 h-12 bg-blue-50 rounded-lg flex items-center justify-center">
              <FileText className="w-6 h-6 text-blue-600" />
            </div>
          </div>
          <p className="text-sm text-gray-600 mb-1">Otros Conceptos</p>
          <p className="text-2xl text-gray-900 mb-0">S/ {debtSummary.otros.toFixed(2)}</p>
        </div>
      </div>

      <div className="flex justify-center mb-8">
        <button
          onClick={onPayNow}
          className="px-8 py-4 bg-[#0FA958] text-white rounded-lg hover:bg-[#0B7A43] transition-colors shadow-lg"
        >
          Pagar ahora
        </button>
      </div>

      <div className="bg-white rounded-xl border border-gray-200 shadow-sm overflow-hidden">
        <div className="px-6 py-4 border-b border-gray-200">
          <h3 className="text-lg text-gray-900 m-0">Historial reciente de pagos</h3>
        </div>
        <div className="overflow-x-auto">
          <table className="w-full">
            <thead className="bg-gray-50">
              <tr>
                <th className="px-6 py-3 text-left text-xs text-gray-600">Fecha</th>
                <th className="px-6 py-3 text-left text-xs text-gray-600">Concepto</th>
                <th className="px-6 py-3 text-left text-xs text-gray-600">Monto</th>
                <th className="px-6 py-3 text-left text-xs text-gray-600">Estado</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-200">
              {recentPayments.map((payment, index) => (
                <tr key={index}>
                  <td className="px-6 py-4 text-sm text-gray-900">{payment.date}</td>
                  <td className="px-6 py-4 text-sm text-gray-900">{payment.concept}</td>
                  <td className="px-6 py-4 text-sm text-gray-900">S/ {payment.amount.toFixed(2)}</td>
                  <td className="px-6 py-4">
                    <span className="px-2 py-1 bg-green-50 text-green-700 text-xs rounded-full">
                      {payment.status}
                    </span>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}
