import { Users, TrendingUp, Calendar, DollarSign } from 'lucide-react';
import type {
  AdminMetrics,
  AdminTransaction,
  PaymentTypeSummary
} from '../types';

interface AdminPanelProps {
  adminName: string;
  metrics: AdminMetrics;
  recentTransactions: AdminTransaction[];
  paymentsByType: PaymentTypeSummary[];
}

export default function AdminPanel({
  adminName,
  metrics,
  recentTransactions,
  paymentsByType
}: AdminPanelProps) {
  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
      <div className="mb-8">
        <h2 className="text-2xl text-gray-900">Panel Administrativo</h2>
        <p className="text-gray-600 mt-1">
          Vista general de recaudación y transacciones para {adminName}
        </p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4 mb-8">
        <div className="bg-white rounded-xl p-6 border border-gray-200 shadow-sm">
          <div className="flex items-start justify-between mb-4">
            <div className="w-12 h-12 bg-[#E8F5E9] rounded-lg flex items-center justify-center">
              <DollarSign className="w-6 h-6 text-[#0FA958]" />
            </div>
          </div>
          <p className="text-sm text-gray-600 mb-1">Total Recaudado Hoy</p>
          <p className="text-2xl text-gray-900 mb-0">S/ {metrics.totalRecaudado.toLocaleString('es-PE', { minimumFractionDigits: 2 })}</p>
          <p className="text-xs text-green-600 mt-2">↑ 12.5% vs ayer</p>
        </div>

        <div className="bg-white rounded-xl p-6 border border-gray-200 shadow-sm">
          <div className="flex items-start justify-between mb-4">
            <div className="w-12 h-12 bg-blue-50 rounded-lg flex items-center justify-center">
              <Calendar className="w-6 h-6 text-blue-600" />
            </div>
          </div>
          <p className="text-sm text-gray-600 mb-1">Transacciones del Día</p>
          <p className="text-2xl text-gray-900 mb-0">{metrics.transaccionesHoy}</p>
          <p className="text-xs text-blue-600 mt-2">↑ 8 nuevas en la última hora</p>
        </div>

        <div className="bg-white rounded-xl p-6 border border-gray-200 shadow-sm">
          <div className="flex items-start justify-between mb-4">
            <div className="w-12 h-12 bg-purple-50 rounded-lg flex items-center justify-center">
              <Users className="w-6 h-6 text-purple-600" />
            </div>
          </div>
          <p className="text-sm text-gray-600 mb-1">Contribuyentes Activos</p>
          <p className="text-2xl text-gray-900 mb-0">{metrics.contribuyentes.toLocaleString('es-PE')}</p>
          <p className="text-xs text-purple-600 mt-2">245 nuevos este mes</p>
        </div>

        <div className="bg-white rounded-xl p-6 border border-gray-200 shadow-sm">
          <div className="flex items-start justify-between mb-4">
            <div className="w-12 h-12 bg-orange-50 rounded-lg flex items-center justify-center">
              <TrendingUp className="w-6 h-6 text-orange-600" />
            </div>
          </div>
          <p className="text-sm text-gray-600 mb-1">Tasa de Conversión</p>
          <p className="text-2xl text-gray-900 mb-0">{metrics.tasaConversion}%</p>
          <p className="text-xs text-orange-600 mt-2">↑ 3.2% vs mes anterior</p>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 mb-8">
        <div className="bg-white rounded-xl border border-gray-200 shadow-sm overflow-hidden">
          <div className="px-6 py-4 border-b border-gray-200">
            <h3 className="text-lg text-gray-900 m-0">Recaudación por Tipo</h3>
          </div>
          <div className="p-6">
            <div className="space-y-4">
              {paymentsByType.map((item) => (
                <div key={item.type}>
                  <div className="flex justify-between items-center mb-2">
                    <span className="text-sm text-gray-700">{item.type}</span>
                    <span className="text-sm text-gray-900">S/ {item.total.toFixed(2)}</span>
                  </div>
                  <div className="flex items-center gap-3">
                    <div className="flex-1 bg-gray-200 rounded-full h-2">
                      <div
                        className="bg-[#0FA958] h-2 rounded-full transition-all"
                        style={{ width: `${item.percentage}%` }}
                      />
                    </div>
                    <span className="text-xs text-gray-500 w-12 text-right">{item.percentage}%</span>
                  </div>
                  <p className="text-xs text-gray-500 mt-1">{item.count} transacciones</p>
                </div>
              ))}
            </div>
          </div>
        </div>

        <div className="bg-white rounded-xl border border-gray-200 shadow-sm overflow-hidden">
          <div className="px-6 py-4 border-b border-gray-200">
            <h3 className="text-lg text-gray-900 m-0">Últimas Transacciones</h3>
          </div>
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead className="bg-gray-50">
                <tr>
                  <th className="px-6 py-3 text-left text-xs text-gray-600">Contribuyente</th>
                  <th className="px-6 py-3 text-left text-xs text-gray-600">Tipo</th>
                  <th className="px-6 py-3 text-left text-xs text-gray-600">Monto</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-200">
                {recentTransactions.map((transaction) => (
                  <tr key={transaction.id}>
                    <td className="px-6 py-4">
                      <p className="text-sm text-gray-900">{transaction.contribuyente}</p>
                      <p className="text-xs text-gray-500">{transaction.fecha}</p>
                    </td>
                    <td className="px-6 py-4 text-sm text-gray-700">{transaction.tipo}</td>
                    <td className="px-6 py-4">
                      <p className="text-sm text-gray-900">S/ {transaction.monto.toFixed(2)}</p>
                      <span className="text-xs px-2 py-1 bg-green-50 text-green-700 rounded-full">
                        {transaction.estado}
                      </span>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      </div>
    </div>
  );
}
