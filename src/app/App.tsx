import { useState } from 'react';
import Header from './components/Header';
import Dashboard from './components/Dashboard';
import ObligationsTable from './components/ObligationsTable';
import PaymentFlow from './components/PaymentFlow';
import AdminPanel from './components/AdminPanel';
import AccessPortal from './components/AccessPortal';
import { LayoutDashboard, FileText } from 'lucide-react';
import database from '../../db.json';
import type { AdminRecord, AppData, CitizenRecord, Obligation } from './types';

type View = 'dashboard' | 'obligations' | 'payment' | 'admin';

type Session =
  | { role: 'user'; citizen: CitizenRecord }
  | { role: 'admin'; admin: AdminRecord };

const appData = database as AppData;

export default function App() {
  const [view, setView] = useState<View>('dashboard');
  const [selectedObligations, setSelectedObligations] = useState<Obligation[]>([]);
  const [session, setSession] = useState<Session | null>(null);

  const isCitizen = session?.role === 'user';
  const isAdmin = session?.role === 'admin';

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

  const handleCitizenLogin = ({
    dni,
    ubigeo
  }: {
    dni: string;
    ubigeo: string;
  }) => {
    const citizen = appData.citizens.find(
      (item) => item.dni === dni && item.ubigeo === ubigeo
    );

    if (!citizen) {
      return 'No encontramos un contribuyente con ese DNI y ubigeo.';
    }

    setSession({
      role: 'user',
      citizen
    });
    setView('dashboard');
    return null;
  };

  const handleAdminLogin = ({
    username,
    password
  }: {
    username: string;
    password: string;
  }) => {
    const admin = appData.admins.find(
      (item) => item.username === username && item.password === password
    );

    if (!admin) {
      return 'Credenciales administrativas inválidas.';
    }

    setSession({
      role: 'admin',
      admin
    });
    setView('admin');
    return null;
  };

  const handleLogout = () => {
    setSelectedObligations([]);
    setSession(null);
    setView('dashboard');
  };

  if (!session) {
    return (
      <AccessPortal
        adminAccessHint={appData.admins[0]}
        onCitizenLogin={handleCitizenLogin}
        onAdminLogin={handleAdminLogin}
      />
    );
  }

  return (
    <div className="min-h-screen bg-gray-50">
      <Header
        userName={isCitizen ? session.citizen.name : session.admin.displayName}
        role={session.role}
        userMeta={
          isCitizen
            ? `DNI ${session.citizen.dni} • Ubigeo ${session.citizen.ubigeo}`
            : 'Acceso administrativo'
        }
        onLogout={handleLogout}
      />

      {isCitizen && (
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
                Resumen
              </button>
              <button
                onClick={() => setView('obligations')}
                className={`px-4 py-3 text-sm flex items-center gap-2 border-b-2 transition-colors ${
                  view === 'obligations' || view === 'payment'
                    ? 'border-[#0FA958] text-[#0FA958]'
                    : 'border-transparent text-gray-600 hover:text-gray-900'
                }`}
              >
                <FileText className="w-4 h-4" />
                Mis Obligaciones
              </button>
            </div>
          </div>
        </nav>
      )}

      {isCitizen && view === 'dashboard' && (
        <Dashboard
          userName={session.citizen.name}
          dni={session.citizen.dni}
          ubigeo={session.citizen.ubigeo}
          debtSummary={session.citizen.debtSummary}
          recentPayments={session.citizen.recentPayments}
          onPayNow={handlePayNow}
        />
      )}

      {isCitizen && view === 'obligations' && (
        <ObligationsTable
          obligations={session.citizen.obligations}
          onPaySelected={handlePaySelected}
        />
      )}

      {isCitizen && view === 'payment' && (
        <PaymentFlow
          selectedObligations={selectedObligations}
          onBack={handleBackFromPayment}
          onComplete={handlePaymentComplete}
        />
      )}

      {isAdmin && view === 'admin' && (
        <AdminPanel
          adminName={session.admin.displayName}
          metrics={appData.adminDashboard.metrics}
          recentTransactions={appData.adminDashboard.recentTransactions}
          paymentsByType={appData.adminDashboard.paymentsByType}
        />
      )}
    </div>
  );
}
