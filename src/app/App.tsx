import { useEffect, useState } from 'react';
import Header from './components/Header';
import Dashboard from './components/Dashboard';
import ObligationsTable from './components/ObligationsTable';
import PaymentFlow from './components/PaymentFlow';
import AdminPanel from './components/AdminPanel';
import AccessPortal from './components/AccessPortal';
import { LayoutDashboard, FileText } from 'lucide-react';
import type { AdminTransaction, AppData, Obligation } from './types';
import { APP_STORAGE_KEY, cloneAppData, loadAppData, saveAppData } from './storage';

type View = 'dashboard' | 'obligations' | 'payment' | 'admin';

type Session =
  | { role: 'user'; citizenDni: string }
  | { role: 'admin'; adminUsername: string };

function calculateDebtSummary(obligations: Obligation[]) {
  const pendingObligations = obligations.filter(
    (obligation) => obligation.status !== 'Pagado'
  );

  return pendingObligations.reduce(
    (summary, obligation) => {
      summary.total += obligation.amount;

      if (obligation.type === 'Arbitrios') {
        summary.arbitrios += obligation.amount;
      } else if (obligation.type === 'Multas') {
        summary.multas += obligation.amount;
      } else if (obligation.type === 'Otros') {
        summary.otros += obligation.amount;
      }

      return summary;
    },
    { total: 0, arbitrios: 0, multas: 0, otros: 0 }
  );
}

function formatPaymentDate(date: Date) {
  return new Intl.DateTimeFormat('es-PE', {
    day: '2-digit',
    month: '2-digit',
    year: 'numeric'
  }).format(date);
}

function formatPaymentDateTime(date: Date) {
  return new Intl.DateTimeFormat('es-PE', {
    day: '2-digit',
    month: '2-digit',
    year: 'numeric',
    hour: '2-digit',
    minute: '2-digit',
    hour12: false
  }).format(date);
}

function updatePaymentsByType(appData: AppData, paidObligations: Obligation[]) {
  const byType = new Map(
    appData.adminDashboard.paymentsByType.map((item) => [item.type, { ...item }])
  );

  paidObligations.forEach((obligation) => {
    const current = byType.get(obligation.type) ?? {
      type: obligation.type,
      count: 0,
      total: 0,
      percentage: 0
    };

    current.count += 1;
    current.total += obligation.amount;
    byType.set(obligation.type, current);
  });

  const updated = Array.from(byType.values());
  const totalCount = updated.reduce((sum, item) => sum + item.count, 0);

  return updated.map((item) => ({
    ...item,
    percentage: totalCount > 0 ? Math.round((item.count / totalCount) * 100) : 0
  }));
}

function applyPaymentToAppData(
  currentData: AppData,
  citizenDni: string,
  paidObligations: Obligation[],
  operationCode: string,
  paidAt: Date
) {
  const nextData = cloneAppData(currentData);
  const citizen = nextData.citizens.find((item) => item.dni === citizenDni);

  if (!citizen) {
    return currentData;
  }

  const paidIds = new Set(paidObligations.map((obligation) => obligation.id));
  citizen.obligations = citizen.obligations.map((obligation) => {
    if (!paidIds.has(obligation.id)) {
      return obligation;
    }

    return {
      ...obligation,
      status: 'Pagado'
    };
  });

  const paymentDate = formatPaymentDate(paidAt);
  const paymentDateTime = formatPaymentDateTime(paidAt);

  const newRecentPayments = paidObligations.map((obligation) => ({
    date: paymentDate,
    concept: `${obligation.type} - ${obligation.description}`,
    amount: obligation.amount,
    status: 'Completado'
  }));

  citizen.recentPayments = [
    ...newRecentPayments,
    ...citizen.recentPayments
  ].slice(0, 20);
  citizen.debtSummary = calculateDebtSummary(citizen.obligations);

  const newTransactions: AdminTransaction[] = paidObligations.map(
    (obligation, index) => ({
      id: `${operationCode}-${index + 1}`,
      contribuyente: citizen.name,
      tipo: obligation.type,
      monto: obligation.amount,
      fecha: paymentDateTime,
      estado: 'Completado'
    })
  );

  nextData.adminDashboard.recentTransactions = [
    ...newTransactions,
    ...nextData.adminDashboard.recentTransactions
  ].slice(0, 20);

  const totalPaid = paidObligations.reduce(
    (sum, obligation) => sum + obligation.amount,
    0
  );

  nextData.adminDashboard.metrics.totalRecaudado += totalPaid;
  nextData.adminDashboard.metrics.transaccionesHoy += paidObligations.length;
  nextData.adminDashboard.metrics.tasaConversion = Math.min(
    99.9,
    Number((nextData.adminDashboard.metrics.tasaConversion + 0.2).toFixed(1))
  );
  nextData.adminDashboard.paymentsByType = updatePaymentsByType(
    nextData,
    paidObligations
  );

  return nextData;
}

export default function App() {
  const [appData, setAppData] = useState<AppData>(() => loadAppData());
  const [view, setView] = useState<View>('dashboard');
  const [selectedObligations, setSelectedObligations] = useState<Obligation[]>([]);
  const [session, setSession] = useState<Session | null>(null);

  const currentCitizen =
    session?.role === 'user'
      ? appData.citizens.find((item) => item.dni === session.citizenDni) ?? null
      : null;
  const currentAdmin =
    session?.role === 'admin'
      ? appData.admins.find((item) => item.username === session.adminUsername) ?? null
      : null;

  const isCitizen = currentCitizen !== null;
  const isAdmin = currentAdmin !== null;

  useEffect(() => {
    saveAppData(appData);
  }, [appData]);

  useEffect(() => {
    const handleStorage = (event: StorageEvent) => {
      if (event.key !== APP_STORAGE_KEY) {
        return;
      }

      setAppData(loadAppData());
    };

    window.addEventListener('storage', handleStorage);
    return () => window.removeEventListener('storage', handleStorage);
  }, []);

  useEffect(() => {
    if (session?.role === 'user' && !currentCitizen) {
      setSession(null);
      setView('dashboard');
    }

    if (session?.role === 'admin' && !currentAdmin) {
      setSession(null);
      setView('dashboard');
    }
  }, [currentAdmin, currentCitizen, session]);

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

  const handlePaymentSuccess = ({
    obligations,
    operationCode
  }: {
    obligations: Obligation[];
    operationCode: string;
  }) => {
    if (!currentCitizen || obligations.length === 0) {
      return;
    }

    setAppData((previousData) =>
      applyPaymentToAppData(
        previousData,
        currentCitizen.dni,
        obligations,
        operationCode,
        new Date()
      )
    );
  };

  const handleCitizenLogin = ({
    dni,
    cartillaPassword
  }: {
    dni: string;
    cartillaPassword: string;
  }) => {
    const citizen = appData.citizens.find(
      (item) =>
        item.dni === dni &&
        item.cartillaPassword === cartillaPassword.trim()
    );

    if (!citizen) {
      return 'No encontramos un contribuyente con ese DNI y contraseña de cartilla.';
    }

    setSession({
      role: 'user',
      citizenDni: citizen.dni
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
      adminUsername: admin.username
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

  if (session.role === 'user' && !currentCitizen) {
    return null;
  }

  if (session.role === 'admin' && !currentAdmin) {
    return null;
  }

  return (
    <div className="min-h-screen bg-gray-50">
      <Header
        userName={isCitizen ? currentCitizen.name : currentAdmin!.displayName}
        role={isCitizen ? 'user' : 'admin'}
        userMeta={
          isCitizen
            ? `DNI ${currentCitizen.dni} • Ubigeo ${currentCitizen.ubigeo}`
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
          userName={currentCitizen.name}
          dni={currentCitizen.dni}
          ubigeo={currentCitizen.ubigeo}
          debtSummary={currentCitizen.debtSummary}
          recentPayments={currentCitizen.recentPayments}
          onPayNow={handlePayNow}
        />
      )}

      {isCitizen && view === 'obligations' && (
        <ObligationsTable
          obligations={currentCitizen.obligations}
          onPaySelected={handlePaySelected}
        />
      )}

      {isCitizen && view === 'payment' && (
        <PaymentFlow
          selectedObligations={selectedObligations}
          onBack={handleBackFromPayment}
          onPaymentSuccess={handlePaymentSuccess}
          onComplete={handlePaymentComplete}
        />
      )}

      {isAdmin && view === 'admin' && (
        <AdminPanel
          adminName={currentAdmin.displayName}
          metrics={appData.adminDashboard.metrics}
          recentTransactions={appData.adminDashboard.recentTransactions}
          paymentsByType={appData.adminDashboard.paymentsByType}
        />
      )}
    </div>
  );
}
