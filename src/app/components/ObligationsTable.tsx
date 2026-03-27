import { useState } from 'react';
import { Home, AlertCircle, FileText, Building2, Filter } from 'lucide-react';
import type { Obligation, ObligationType } from '../types';

interface ObligationsTableProps {
  obligations: Obligation[];
  onPaySelected: (selected: Obligation[]) => void;
}

const typeConfig: Record<
  ObligationType,
  { icon: typeof Home; color: string; bgColor: string }
> = {
  'Arbitrios': { icon: Home, color: 'text-[#0FA958]', bgColor: 'bg-[#E8F5E9]' },
  'Multas': { icon: AlertCircle, color: 'text-orange-600', bgColor: 'bg-orange-50' },
  'Impuesto Predial': { icon: Building2, color: 'text-blue-600', bgColor: 'bg-blue-50' },
  'Otros': { icon: FileText, color: 'text-purple-600', bgColor: 'bg-purple-50' }
};

export default function ObligationsTable({
  obligations,
  onPaySelected
}: ObligationsTableProps) {
  const [selected, setSelected] = useState<string[]>([]);
  const [filter, setFilter] = useState<ObligationType | 'all'>('all');

  const filteredObligations = filter === 'all'
    ? obligations
    : obligations.filter(o => o.type === filter);

  const handleSelectAll = (checked: boolean) => {
    if (checked) {
      setSelected(filteredObligations.map(o => o.id));
    } else {
      setSelected([]);
    }
  };

  const handleSelectOne = (id: string, checked: boolean) => {
    if (checked) {
      setSelected([...selected, id]);
    } else {
      setSelected(selected.filter(s => s !== id));
    }
  };

  const handlePaySelected = () => {
    const selectedObligations = obligations.filter(o => selected.includes(o.id));
    onPaySelected(selectedObligations);
  };

  const totalSelected = obligations
    .filter(o => selected.includes(o.id))
    .reduce((sum, o) => sum + o.amount, 0);

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
      <div className="mb-6">
        <h2 className="text-2xl text-gray-900">Mis Obligaciones</h2>
        <p className="text-gray-600 mt-1">Selecciona las obligaciones que deseas pagar</p>
      </div>

      <div className="flex flex-wrap gap-2 mb-6">
        <button
          onClick={() => setFilter('all')}
          className={`px-4 py-2 rounded-lg text-sm transition-colors ${
            filter === 'all'
              ? 'bg-[#0FA958] text-white'
              : 'bg-white border border-gray-300 text-gray-700 hover:bg-gray-50'
          }`}
        >
          <Filter className="w-4 h-4 inline mr-2" />
          Todos
        </button>
        {Object.keys(typeConfig).map(type => (
          <button
            key={type}
            onClick={() => setFilter(type)}
            className={`px-4 py-2 rounded-lg text-sm transition-colors ${
              filter === type
                ? 'bg-[#0FA958] text-white'
                : 'bg-white border border-gray-300 text-gray-700 hover:bg-gray-50'
            }`}
          >
            {type}
          </button>
        ))}
      </div>

      <div className="bg-white rounded-xl border border-gray-200 shadow-sm overflow-hidden mb-6">
        <div className="overflow-x-auto">
          <table className="w-full">
            <thead className="bg-gray-50">
              <tr>
                <th className="px-6 py-3 text-left">
                  <input
                    type="checkbox"
                    checked={selected.length === filteredObligations.length && filteredObligations.length > 0}
                    onChange={(e) => handleSelectAll(e.target.checked)}
                    className="w-4 h-4"
                  />
                </th>
                <th className="px-6 py-3 text-left text-xs text-gray-600">Tipo</th>
                <th className="px-6 py-3 text-left text-xs text-gray-600">Año</th>
                <th className="px-6 py-3 text-left text-xs text-gray-600">Periodo</th>
                <th className="px-6 py-3 text-left text-xs text-gray-600">Descripción</th>
                <th className="px-6 py-3 text-left text-xs text-gray-600">Monto</th>
                <th className="px-6 py-3 text-left text-xs text-gray-600">Estado</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-200">
              {filteredObligations.map((obligation) => {
                const config = typeConfig[obligation.type];
                const Icon = config.icon;
                return (
                  <tr key={obligation.id} className="hover:bg-gray-50">
                    <td className="px-6 py-4">
                      <input
                        type="checkbox"
                        checked={selected.includes(obligation.id)}
                        onChange={(e) => handleSelectOne(obligation.id, e.target.checked)}
                        className="w-4 h-4"
                      />
                    </td>
                    <td className="px-6 py-4">
                      <div className="flex items-center gap-2">
                        <div className={`w-8 h-8 ${config.bgColor} rounded-lg flex items-center justify-center`}>
                          <Icon className={`w-4 h-4 ${config.color}`} />
                        </div>
                        <span className="text-sm text-gray-900">{obligation.type}</span>
                      </div>
                    </td>
                    <td className="px-6 py-4 text-sm text-gray-900">{obligation.year}</td>
                    <td className="px-6 py-4 text-sm text-gray-900">{obligation.period}</td>
                    <td className="px-6 py-4 text-sm text-gray-700">{obligation.description}</td>
                    <td className="px-6 py-4 text-sm text-gray-900">S/ {obligation.amount.toFixed(2)}</td>
                    <td className="px-6 py-4">
                      <span className={`px-2 py-1 text-xs rounded-full ${
                        obligation.status === 'Pagado' ? 'bg-green-50 text-green-700' :
                        obligation.status === 'Pendiente' ? 'bg-yellow-50 text-yellow-700' :
                        'bg-red-50 text-red-700'
                      }`}>
                        {obligation.status}
                      </span>
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      </div>

      {selected.length > 0 && (
        <div className="sticky bottom-0 bg-white border-t border-gray-200 shadow-lg rounded-t-xl p-6">
          <div className="max-w-7xl mx-auto flex flex-col sm:flex-row items-center justify-between gap-4">
            <div>
              <p className="text-sm text-gray-600">Total a pagar ({selected.length} seleccionados)</p>
              <p className="text-2xl text-gray-900 m-0">S/ {totalSelected.toFixed(2)}</p>
            </div>
            <button
              onClick={handlePaySelected}
              className="px-8 py-4 bg-[#0FA958] text-white rounded-lg hover:bg-[#0B7A43] transition-colors"
            >
              Pagar seleccionados
            </button>
          </div>
        </div>
      )}
    </div>
  );
}
