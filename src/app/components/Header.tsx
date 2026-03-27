import { LogOut, ShieldCheck, User } from 'lucide-react';
import logoMolina from '../../assets/logo_molina.png';

interface HeaderProps {
  userName?: string;
  role?: 'user' | 'admin';
  userMeta?: string;
  onLogout?: () => void;
}

export default function Header({
  userName = 'Juan Pérez',
  role = 'user',
  userMeta,
  onLogout
}: HeaderProps) {
  return (
    <header className="bg-white border-b border-gray-200 sticky top-0 z-50">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex flex-col gap-3 py-3 sm:flex-row sm:items-center sm:justify-between sm:min-h-16">
          <div className="flex items-center gap-3">
            <div className="flex h-12 w-12 shrink-0 items-center justify-center overflow-hidden rounded-xl border border-[#0FA958]/15 bg-white">
              <img
                src={logoMolina}
                alt="Logo Municipalidad de La Molina"
                className="h-10 w-10 object-contain"
              />
            </div>
            <div>
              <h1 className="text-lg text-[#0B7A43] m-0">Sistema de Recaudación</h1>
              <p className="text-xs text-gray-600 m-0">Municipalidad de La Molina</p>
            </div>
          </div>

          <div className="flex items-center justify-end gap-2 sm:gap-3">
            <div className="hidden sm:flex items-center px-3 py-1 rounded-full bg-gray-100 text-xs text-gray-600">
              {role === 'admin' ? (
                <ShieldCheck className="w-3.5 h-3.5 mr-2 text-slate-700" />
              ) : (
                <User className="w-3.5 h-3.5 mr-2 text-[#0FA958]" />
              )}
              {role === 'admin' ? 'Administrador' : 'Contribuyente'}
            </div>
            <div className="flex min-w-0 items-center gap-2 rounded-lg bg-gray-50 px-3 py-2">
              <User className="w-4 h-4 text-gray-600 shrink-0" />
              <div className="min-w-0">
                <p className="truncate text-sm text-gray-700 m-0 leading-5">{userName}</p>
                {userMeta && (
                  <p className="hidden sm:block text-xs text-gray-500 m-0 leading-4">
                    {userMeta}
                  </p>
                )}
              </div>
            </div>
            {onLogout && (
              <button
                onClick={onLogout}
                className="inline-flex items-center gap-2 px-3 py-2 rounded-lg border border-gray-200 text-sm text-gray-700 hover:bg-gray-50 transition-colors"
              >
                <LogOut className="w-4 h-4" />
                <span className="hidden sm:inline">Salir</span>
              </button>
            )}
          </div>
        </div>
      </div>
    </header>
  );
}
