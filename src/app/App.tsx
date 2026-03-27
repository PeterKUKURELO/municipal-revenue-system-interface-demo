import { useState } from 'react';
import Header from './components/Header';
import Dashboard from './components/Dashboard';
import ObligationsTable from './components/ObligationsTable';
import PaymentFlow from './components/PaymentFlow';
import AdminPanel from './components/AdminPanel';
import { LayoutDashboard, FileText, Settings } from 'lucide-react';

type View = 'dashboard' | 'obligations' | 'payment' | 'admin';

interface Obligation {
  id: string;
  type: string;
  description: string;
  amount: number;
}

export default function App() {
  const [view, setView] = useState<View>('dashboard');
  const [selectedObligations, setSelectedObligations] = useState<Obligation[]>([]);

  const handlePayNow = () => {
    setView('obligations');
  };

  const handlePaySelected = (obligations: Obligation[]) => {
    setSelectedObligations(obligations);
    setView('payment');
  };

  const handlePaymentComplete = () => {
    setSelectedObligations([]);
    setView('dashboard');
  };

  const handleBackFromPayment = () => {
    setView('obligations');
  };

  return (
    <div className="min-h-screen bg-gray-50">
      <Header userName="Juan Pérez" />

      <nav className="bg-white border-b border-gray-200">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex gap-1">
            <button
              onClick={() => setView('dashboard')}
              className={`px-4 py-3 text-sm flex items-center gap-2 border-b-2 transition-colors ${
                view === 'dashboard'
                  ? 'border-[#0FA958] text-[#0FA958]'
                  : 'border-transparent text-gray-600 hover:text-gray-900'
              }`}
            >
              <LayoutDashboard className="w-4 h-4" />
              Dashboard
            </button>
            <button
              onClick={() => setView('obligations')}
              className={`px-4 py-3 text-sm flex items-center gap-2 border-b-2 transition-colors ${
                view === 'obligations'
                  ? 'border-[#0FA958] text-[#0FA958]'
                  : 'border-transparent text-gray-600 hover:text-gray-900'
              }`}
            >
              <FileText className="w-4 h-4" />
              Mis Obligaciones
            </button>
            <button
              onClick={() => setView('admin')}
              className={`px-4 py-3 text-sm flex items-center gap-2 border-b-2 transition-colors ${
                view === 'admin'
                  ? 'border-[#0FA958] text-[#0FA958]'
                  : 'border-transparent text-gray-600 hover:text-gray-900'
              }`}
            >
              <Settings className="w-4 h-4" />
              Panel Admin
            </button>
          </div>
        </div>
      </nav>

      {view === 'dashboard' && (
        <Dashboard userName="Juan Pérez" onPayNow={handlePayNow} />
      )}

      {view === 'obligations' && (
        <ObligationsTable onPaySelected={handlePaySelected} />
      )}

      {view === 'payment' && (
        <PaymentFlow
          selectedObligations={selectedObligations}
          onBack={handleBackFromPayment}
          onComplete={handlePaymentComplete}
        />
      )}

      {view === 'admin' && (
        <AdminPanel />
      )}
    </div>
  );
}