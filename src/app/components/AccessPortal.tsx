import { FormEvent, useState } from 'react';
import {
  ArrowRight,
  CircleHelp,
  IdCard,
  LockKeyhole,
  ShieldCheck
} from 'lucide-react';
import type { AdminRecord } from '../types';
import logoMolina from '../../assets/logo_molina.png';
import amexLogo from '../../assets/amex.png';
import dinnersLogo from '../../assets/dinners.png';
import mstcLogo from '../../assets/mstc.png';
import pagoEfectivoLogo from '../../assets/pagoefectivo.png';
import payMeLogo from '../../assets/Pay-Me_logo.png';
import cartillaMunicipalImage from '../../assets/cartillaMunicipal.png';
import qrLogo from '../../assets/qr.png';
import visaLogo from '../../assets/visa.png';
import yapeLogo from '../../assets/yape.png';

type AccessMode = 'citizen' | 'admin';

interface AccessPortalProps {
  adminAccessHint: AdminRecord;
  onCitizenLogin: (credentials: {
    dni: string;
    cartillaPassword: string;
  }) => string | null;
  onAdminLogin: (credentials: {
    username: string;
    password: string;
  }) => string | null;
}

export default function AccessPortal({
  adminAccessHint,
  onCitizenLogin,
  onAdminLogin
}: AccessPortalProps) {
  const primaryPaymentLogos = [
    { src: visaLogo, alt: 'Visa' },
    { src: mstcLogo, alt: 'Mastercard' },
    { src: amexLogo, alt: 'American Express' },
    { src: dinnersLogo, alt: 'Diners Club' }
  ];

  const secondaryPaymentLogos = [
    { src: yapeLogo, alt: 'Yape' },
    { src: pagoEfectivoLogo, alt: 'PagoEfectivo' },
    { src: qrLogo, alt: 'Código QR' }
  ];

  const [mode, setMode] = useState<AccessMode>('citizen');
  const [dni, setDni] = useState('');
  const [cartillaPassword, setCartillaPassword] = useState('');
  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const [showCartillaHelp, setShowCartillaHelp] = useState(false);

  const handleCitizenSubmit = (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();

    if (!/^\d{8}$/.test(dni)) {
      setError('Ingresa un DNI válido de 8 dígitos.');
      return;
    }

    if (cartillaPassword.trim().length < 6) {
      setError('Ingresa la contraseña de la cartilla municipal.');
      return;
    }

    const loginError = onCitizenLogin({
      dni,
      cartillaPassword: cartillaPassword.trim()
    });
    setError(loginError ?? '');
  };

  const handleAdminSubmit = (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();

    const loginError = onAdminLogin({
      username: username.trim(),
      password
    });
    setError(loginError ?? '');
  };

  const switchMode = (nextMode: AccessMode) => {
    setMode(nextMode);
    setError('');
    setShowCartillaHelp(false);
  };

  return (
    <div className="flex min-h-screen items-center justify-center bg-[radial-gradient(circle_at_top,_rgba(15,169,88,0.16),_transparent_42%),linear-gradient(180deg,_#f7faf7_0%,_#f3efe8_100%)] px-4 py-6 sm:px-6 lg:px-8 lg:py-10">
      <div className="mx-auto grid w-full max-w-6xl gap-6 lg:grid-cols-[1.15fr_0.85fr]">
        <section className="relative overflow-hidden rounded-[32px] border border-white/70 bg-white/90 p-8 shadow-[0_32px_80px_rgba(15,23,42,0.12)] backdrop-blur md:p-10">
          <div className="absolute right-0 top-0 h-44 w-44 rounded-full bg-[#0FA958]/10 blur-3xl" />
          <div className="relative">
            <div className="mb-8 flex items-center gap-4">
              <div className="shrink-0">
                <img
                  src={logoMolina}
                  alt="Logo Municipalidad de La Molina"
                  className="h-[3.4rem] w-auto object-contain sm:h-[4.25rem]"
                />
              </div>
              <div className="hidden h-14 w-px shrink-0 bg-slate-200 sm:block" />
              <div>
                <h1 className="m-0 text-2xl text-slate-900">
                  Portal de Recaudación en Línea
                </h1>
                <p className="m-0 text-sm text-slate-600">
                  Acceso diferenciado para contribuyentes y personal autorizado
                </p>
              </div>
            </div>

            <div className="grid gap-4 md:grid-cols-2">
              <div className="rounded-[24px] border border-[#0FA958]/15 bg-[#F5FAF7] p-5">
                <div className="mb-4 flex h-11 w-11 items-center justify-center rounded-2xl bg-white shadow-sm">
                  <IdCard className="h-5 w-5 text-[#0FA958]" />
                </div>
                <h2 className="mb-2 text-lg text-slate-900">Acceso ciudadano</h2>
                <p className="m-0 text-sm leading-6 text-slate-600">
                  Consulta deudas, historial de pagos y conceptos pendientes
                  usando tu DNI y la clave de la cartilla municipal.
                </p>
              </div>

              <div className="rounded-[24px] border border-slate-200 bg-slate-50 p-5">
                <div className="mb-4 flex h-11 w-11 items-center justify-center rounded-2xl bg-white shadow-sm">
                  <ShieldCheck className="h-5 w-5 text-slate-700" />
                </div>
                <h2 className="mb-2 text-lg text-slate-900">Acceso administrativo</h2>
                <p className="m-0 text-sm leading-6 text-slate-600">
                  Panel interno para seguimiento de recaudación, transacciones y
                  métricas de operación.
                </p>
              </div>
            </div>

            <div className="mt-8">
              <p className="mb-3 text-sm text-slate-600">
                Canales de pago y entidades vinculadas:
              </p>
              <div className="flex flex-col gap-3 lg:flex-row lg:items-stretch">
                <div className="flex min-h-[110px] items-center justify-center px-2 py-4 lg:mr-3 lg:w-[220px] lg:border-r lg:border-slate-200 lg:pr-6">
                  <img
                    src={payMeLogo}
                    alt="Pay-Me"
                    className="h-auto w-full max-w-[190px] object-contain"
                  />
                </div>

                <div className="flex-1 space-y-3">
                  <div className="grid grid-cols-2 gap-3 sm:grid-cols-4">
                    {primaryPaymentLogos.map((logo) => (
                      <div
                        key={logo.alt}
                        className="flex h-14 items-center justify-center rounded-2xl border border-slate-200 bg-white px-4 shadow-sm"
                      >
                        <img
                          src={logo.src}
                          alt={logo.alt}
                          className="max-h-8 w-auto object-contain"
                        />
                      </div>
                    ))}
                  </div>

                  <div className="grid grid-cols-2 gap-3 sm:grid-cols-3">
                    {secondaryPaymentLogos.map((logo) => (
                      <div
                        key={logo.alt}
                        className="flex h-14 items-center justify-center rounded-2xl border border-slate-200 bg-white px-4 shadow-sm"
                      >
                        <img
                          src={logo.src}
                          alt={logo.alt}
                          className="max-h-8 w-auto object-contain"
                        />
                      </div>
                    ))}
                  </div>
                </div>
              </div>
            </div>
          </div>
        </section>

        <section className="flex rounded-[32px] border border-[#0FA958]/25 bg-white p-6 shadow-[0_32px_80px_rgba(15,23,42,0.12)] sm:p-8">
          <div className="mx-auto flex w-full max-w-[420px] flex-col justify-center">
            <div className="mb-6 flex justify-center">
              <div className="inline-flex rounded-full bg-[#E8F5E9] p-1">
                <button
                  onClick={() => switchMode('citizen')}
                  className={`rounded-full px-5 py-2 text-sm transition-colors ${
                    mode === 'citizen'
                      ? 'bg-[#0FA958] text-white shadow-sm'
                      : 'text-[#0B7A43]'
                  }`}
                >
                  Contribuyente
                </button>
                <button
                  onClick={() => switchMode('admin')}
                  className={`rounded-full px-5 py-2 text-sm transition-colors ${
                    mode === 'admin'
                      ? 'bg-slate-900 text-white shadow-sm'
                      : 'text-slate-600'
                  }`}
                >
                  Administración
                </button>
              </div>
            </div>

            {mode === 'citizen' ? (
              <>
                <div className="mb-8">
                  <p className="mb-2 text-sm uppercase tracking-[0.24em] text-[#0B7A43]/70">
                    Inicio de sesión
                  </p>
                  <h2 className="mb-2 text-3xl text-slate-900">
                    Ingresa con tu DNI y tu clave municipal
                  </h2>
                  <p className="m-0 text-sm leading-6 text-slate-600">
                    Accede con tu documento y la contraseña que recibiste en tu
                    cartilla municipal para revisar deuda y pagos.
                  </p>
                </div>

                <form className="space-y-5" onSubmit={handleCitizenSubmit}>
                  <label className="block">
                    <span className="mb-2 flex items-center gap-2 text-sm text-slate-700">
                      <IdCard className="h-4 w-4 text-[#0FA958]" />
                      Número de DNI
                    </span>
                    <input
                      value={dni}
                      onChange={(event) =>
                        setDni(event.target.value.replace(/\D/g, '').slice(0, 8))
                      }
                      inputMode="numeric"
                      placeholder="12345678"
                      className="w-full rounded-2xl border border-slate-200 bg-slate-50 px-4 py-3 text-slate-900 outline-none transition focus:border-[#0FA958] focus:bg-white"
                    />
                  </label>

                  <label className="block">
                    <span className="mb-2 flex items-center gap-2 text-sm text-slate-700">
                      <LockKeyhole className="h-4 w-4 text-[#0FA958]" />
                      Contraseña de cartilla municipal
                    </span>
                    <input
                      type="password"
                      value={cartillaPassword}
                      onChange={(event) => setCartillaPassword(event.target.value)}
                      placeholder="Ingresa tu contraseña"
                      className="w-full rounded-2xl border border-slate-200 bg-slate-50 px-4 py-3 text-slate-900 outline-none transition focus:border-[#0FA958] focus:bg-white"
                    />
                    <div className="mt-2">
                      <div className="flex items-center gap-2 text-xs leading-5 text-slate-500">
                        <span>
                          La encontrarás en la cartilla municipal entregada al
                          contribuyente.
                        </span>
                        <button
                          type="button"
                          onClick={() => setShowCartillaHelp((current) => !current)}
                          className="inline-flex h-6 w-6 items-center justify-center rounded-full border border-[#0FA958]/25 bg-white text-[#0FA958] transition hover:border-[#0FA958] hover:bg-[#F5FAF7]"
                          aria-label="Ver referencia de la cartilla municipal"
                          aria-expanded={showCartillaHelp}
                        >
                          <CircleHelp className="h-3.5 w-3.5" />
                        </button>
                      </div>

                      {showCartillaHelp && (
                        <div className="mt-3 overflow-hidden rounded-2xl border border-[#0FA958]/15 bg-[#F5FAF7] p-3">
                          <img
                            src={cartillaMunicipalImage}
                            alt="Referencia visual de la cartilla municipal con la ubicación de la contraseña"
                            className="w-full rounded-xl object-contain"
                          />
                        </div>
                      )}
                    </div>
                  </label>

                  {error && (
                    <div className="rounded-2xl border border-red-200 bg-red-50 px-4 py-3 text-sm text-red-700">
                      {error}
                    </div>
                  )}

                  <button
                    type="submit"
                    className="flex w-full items-center justify-center gap-2 rounded-2xl bg-[#0FA958] px-5 py-3 text-white transition hover:bg-[#0B7A43]"
                  >
                    Ingresar al panel ciudadano
                    <ArrowRight className="h-4 w-4" />
                  </button>
                </form>

              </>
            ) : (
              <>
                <div className="mb-8">
                  <p className="mb-2 text-sm uppercase tracking-[0.24em] text-slate-500">
                    Acceso interno
                  </p>
                  <h2 className="mb-2 text-3xl text-slate-900">
                    Panel de administración
                  </h2>
                  <p className="m-0 text-sm leading-6 text-slate-600">
                    Este acceso queda aislado del portal ciudadano y conserva una
                    autenticación separada para operaciones internas.
                  </p>
                </div>

                <form className="space-y-5" onSubmit={handleAdminSubmit}>
                  <label className="block">
                    <span className="mb-2 flex items-center gap-2 text-sm text-slate-700">
                      <ShieldCheck className="h-4 w-4 text-slate-700" />
                      Usuario
                    </span>
                    <input
                      value={username}
                      onChange={(event) => setUsername(event.target.value)}
                      placeholder="admin"
                      className="w-full rounded-2xl border border-slate-200 bg-slate-50 px-4 py-3 text-slate-900 outline-none transition focus:border-slate-900 focus:bg-white"
                    />
                  </label>

                  <label className="block">
                    <span className="mb-2 flex items-center gap-2 text-sm text-slate-700">
                      <LockKeyhole className="h-4 w-4 text-slate-700" />
                      Contraseña
                    </span>
                    <input
                      type="password"
                      value={password}
                      onChange={(event) => setPassword(event.target.value)}
                      placeholder="admin123"
                      className="w-full rounded-2xl border border-slate-200 bg-slate-50 px-4 py-3 text-slate-900 outline-none transition focus:border-slate-900 focus:bg-white"
                    />
                  </label>

                  {error && (
                    <div className="rounded-2xl border border-red-200 bg-red-50 px-4 py-3 text-sm text-red-700">
                      {error}
                    </div>
                  )}

                  <button
                    type="submit"
                    className="flex w-full items-center justify-center gap-2 rounded-2xl bg-slate-900 px-5 py-3 text-white transition hover:bg-slate-700"
                  >
                    Ingresar al panel administrativo
                    <ArrowRight className="h-4 w-4" />
                  </button>
                </form>

                <div className="mt-6 rounded-[24px] border border-slate-200 bg-slate-50 p-5">
                  <p className="mb-2 text-sm text-slate-700">Credenciales demo</p>
                  <p className="m-0 text-sm leading-6 text-slate-600">
                    Usuario:{' '}
                    <span className="font-medium text-slate-900">
                      {adminAccessHint.username}
                    </span>
                    <br />
                    Contraseña:{' '}
                    <span className="font-medium text-slate-900">
                      {adminAccessHint.password}
                    </span>
                  </p>
                </div>
              </>
            )}
          </div>
        </section>
      </div>
    </div>
  );
}
