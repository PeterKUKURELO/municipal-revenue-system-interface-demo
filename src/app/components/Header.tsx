import { Building2, User } from 'lucide-react';

interface HeaderProps {
  userName?: string;
  onLogout?: () => void;
}

export default function Header({ userName = "Juan Pérez", onLogout }: HeaderProps) {
  return (
    <header className="bg-white border-b border-gray-200 sticky top-0 z-50">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex justify-between items-center h-16">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 bg-[#0FA958] rounded-lg flex items-center justify-center">
              <Building2 className="w-6 h-6 text-white" />
            </div>
            <div>
              <h1 className="text-lg text-[#0B7A43] m-0">Sistema de Recaudación</h1>
              <p className="text-xs text-gray-600 m-0">Municipalidad de La Molina</p>
            </div>
          </div>

          <div className="flex items-center gap-3">
            <div className="flex items-center gap-2 px-3 py-2 bg-gray-50 rounded-lg">
              <User className="w-4 h-4 text-gray-600" />
              <span className="text-sm text-gray-700">{userName}</span>
            </div>
          </div>
        </div>
      </div>
    </header>
  );
}
