export type ObligationType = 'Arbitrios' | 'Multas' | 'Impuesto Predial' | 'Otros';

export type ObligationStatus = 'Pagado' | 'Pendiente' | 'Vencido';

export interface Obligation {
  id: string;
  type: ObligationType;
  year: string;
  period: string;
  description: string;
  amount: number;
  status: ObligationStatus;
}

export interface DebtSummary {
  total: number;
  arbitrios: number;
  multas: number;
  otros: number;
}

export interface RecentPayment {
  date: string;
  concept: string;
  amount: number;
  status: string;
}

export interface CitizenRecord {
  dni: string;
  ubigeo: string;
  name: string;
  debtSummary: DebtSummary;
  recentPayments: RecentPayment[];
  obligations: Obligation[];
}

export interface AdminRecord {
  username: string;
  password: string;
  displayName: string;
}

export interface AdminMetrics {
  totalRecaudado: number;
  transaccionesHoy: number;
  contribuyentes: number;
  tasaConversion: number;
}

export interface AdminTransaction {
  id: string;
  contribuyente: string;
  tipo: string;
  monto: number;
  fecha: string;
  estado: string;
}

export interface PaymentTypeSummary {
  type: string;
  count: number;
  total: number;
  percentage: number;
}

export interface AdminDashboardData {
  metrics: AdminMetrics;
  recentTransactions: AdminTransaction[];
  paymentsByType: PaymentTypeSummary[];
}

export interface AccessHint {
  dni: string;
  ubigeo: string;
}

export interface AppData {
  settings: {
    paymentChannels: string[];
    citizenAccessHint: AccessHint;
  };
  admins: AdminRecord[];
  citizens: CitizenRecord[];
  adminDashboard: AdminDashboardData;
}
