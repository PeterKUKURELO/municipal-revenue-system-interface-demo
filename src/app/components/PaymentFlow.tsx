import { useEffect, useRef, useState } from 'react';
import {
  CheckCircle,
  ChevronLeft,
  CreditCard,
  Download,
  Lock,
  Mail
} from 'lucide-react';
import type { Obligation } from '../types';
import pagoEfectivoLogo from '../../assets/pagoefectivo.png';
import qrLogo from '../../assets/qr.png';
import yapeLogo from '../../assets/yape.png';

interface PaymentFlowProps {
  selectedObligations: Obligation[];
  onBack: () => void;
  onComplete: () => void;
}

type PaymentStep = 'summary' | 'method' | 'gateway' | 'confirmation';
type PaymentMethod = 'card' | 'pagoefectivo' | 'yape' | 'qr';
type GatewayStatus = 'idle' | 'loading' | 'ready' | 'error';

interface PaymeGatewayConfig {
  nonce: string;
  payload: Record<string, unknown>;
  settings: {
    display_result_screen: boolean;
    show_close_button: boolean;
  };
  display_settings?: {
    methods: string[];
  };
  i18n: {
    mode: 'multi';
    default_language: 'es';
    languages: string[];
  };
}

interface PaymeGatewayInstance {
  init: (
    target: HTMLElement,
    onSuccess?: (response: unknown) => void,
    onCancel?: (response: unknown) => void,
    onError?: (error: unknown) => void
  ) => void;
  terminate?: () => void;
}

declare global {
  interface Window {
    FlexPaymentForms?: new (config: PaymeGatewayConfig) => PaymeGatewayInstance;
    __paymeFlexCssLoaded?: boolean;
  }
}

const PAYME_DEMO_CONFIG = {
  algApiVersion: '1709847567',
  authBaseUrl: 'https://auth.preprod.alignet.io',
  apiDevBaseUrl: 'https://api.dev.alignet.io',
  cancelApiBaseUrl: 'https://api.preprod.alignet.io',
  apiAudience: 'https://api.dev.alignet.io',
  js: 'https://flex.dev.pay-me.cloud/flex-payment-forms.min.js',
  css: 'https://flex.dev.pay-me.cloud/main-flex-payment-forms.css',
  creds: {
    clientId: 'TMFk2TBUIsEaeayXnw5zBHxujFGa2g',
    clientSecret: 'OwpVh3aNmzmVZp7v1t63EzMKA7mZAY9jfpQV7LfW8adFF7EZAoAq8t78iifh24My',
    merchantCode: 'ec366f80-24fa-47ce-8898-b32763a1b14b'
  }
} as const;

let lastOperationSeed = 0;
let operationSequence = 0;

const paymentMethodLabels: Record<PaymentMethod, string> = {
  card: 'Tarjeta de credito o debito',
  pagoefectivo: 'PagoEfectivo',
  yape: 'Yape',
  qr: 'Codigo QR'
};

const paymeMethodMap: Record<PaymentMethod, string[]> = {
  card: ['CARD'],
  pagoefectivo: ['PAGOEFECTIVO'],
  yape: ['YAPE'],
  qr: ['QR']
};

function loadPaymeCss(url: string) {
  if (typeof document === 'undefined' || window.__paymeFlexCssLoaded) {
    return Promise.resolve();
  }

  const existing = document.querySelector<HTMLLinkElement>(
    'link[data-payme-flex="true"]'
  );
  if (existing) {
    window.__paymeFlexCssLoaded = true;
    return Promise.resolve();
  }

  return new Promise<void>((resolve, reject) => {
    const link = document.createElement('link');
    link.rel = 'stylesheet';
    link.href = url;
    link.dataset.paymeFlex = 'true';
    link.onload = () => {
      window.__paymeFlexCssLoaded = true;
      resolve();
    };
    link.onerror = () => reject(new Error('No se pudo cargar el CSS de Pay-Me.'));
    document.head.appendChild(link);
  });
}

function loadPaymeScript(url: string) {
  if (typeof window === 'undefined') {
    return Promise.reject(new Error('La ventana del navegador no esta disponible.'));
  }

  if (window.FlexPaymentForms) {
    return Promise.resolve();
  }

  const existing = document.querySelector<HTMLScriptElement>(
    'script[data-payme-flex="true"]'
  );
  if (existing) {
    return new Promise<void>((resolve, reject) => {
      existing.addEventListener('load', () => resolve(), { once: true });
      existing.addEventListener(
        'error',
        () => reject(new Error('No se pudo cargar el SDK de Pay-Me.')),
        { once: true }
      );
    });
  }

  return new Promise<void>((resolve, reject) => {
    const script = document.createElement('script');
    script.src = url;
    script.async = true;
    script.dataset.paymeFlex = 'true';
    script.onload = () => resolve();
    script.onerror = () => reject(new Error('No se pudo cargar el SDK de Pay-Me.'));
    document.body.appendChild(script);
  });
}

async function parseJsonSafe(response: Response) {
  try {
    return await response.json();
  } catch {
    return null;
  }
}

async function getAccessToken(
  audience = PAYME_DEMO_CONFIG.apiAudience || PAYME_DEMO_CONFIG.apiDevBaseUrl
) {
  const response = await fetch(`${PAYME_DEMO_CONFIG.authBaseUrl}/token`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({
      action: 'authorize',
      grant_type: 'client_credentials',
      audience,
      client_id: PAYME_DEMO_CONFIG.creds.clientId,
      client_secret: PAYME_DEMO_CONFIG.creds.clientSecret,
      scope: 'create:token post:charges offline_access'
    })
  });

  const data = await parseJsonSafe(response);
  if (!response.ok || !data?.access_token) {
    console.error('[PAYME][AUTH][TOKEN]', { status: response.status, data });
    throw new Error('No se pudo obtener el access token de Pay-Me.');
  }

  return data.access_token as string;
}

async function getNonce(accessToken: string) {
  const response = await fetch(`${PAYME_DEMO_CONFIG.authBaseUrl}/nonce`, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      Authorization: `Bearer ${accessToken}`
    },
    body: JSON.stringify({
      action: 'create.nonce',
      audience: PAYME_DEMO_CONFIG.apiAudience || PAYME_DEMO_CONFIG.apiDevBaseUrl,
      client_id: PAYME_DEMO_CONFIG.creds.clientId,
      scope: 'post:charges'
    })
  });

  const data = await parseJsonSafe(response);
  if (!response.ok || !data?.nonce) {
    console.error('[PAYME][AUTH][NONCE]', { status: response.status, data });
    throw new Error('No se pudo obtener el nonce de Pay-Me.');
  }

  return data.nonce as string;
}

function generateOperationNumber() {
  const seed = Date.now();
  operationSequence =
    seed === lastOperationSeed ? operationSequence + 1 : 0;
  lastOperationSeed = seed;

  const base = String(seed % 100000000).padStart(8, '0');
  const sequence = String(operationSequence % 1000).padStart(3, '0');
  return `${base}${sequence}`;
}

function detectDeviceOrigin() {
  if (typeof navigator === 'undefined') {
    return 'WEB';
  }

  return /android|iphone|ipad|mobile/i.test(navigator.userAgent)
    ? 'MOBILE'
    : 'WEB';
}

function buildPayload(amount: number, currencyCode = '604') {
  const operationNumber = generateOperationNumber();
  const profile = {
    first_name: 'Peter',
    last_name: 'Kukurelo',
    email: 'peter.kukurelo@pay-me.com',
    phone: { country_code: '+51', subscriber: '999999999' },
    location: {
      line_1: 'Av. Ejemplo 123',
      line_2: '',
      city: 'Lima',
      state: '',
      country: 'Peru'
    }
  };

  return {
    operationNumber,
    payload: {
      action: 'authorize',
      channel: 'ecommerce',
      merchant_code: PAYME_DEMO_CONFIG.creds.merchantCode,
      merchant_operation_number: operationNumber,
      payment_method: {},
      payment_details: {
        amount: Math.round(amount * 100).toString(),
        currency: currencyCode,
        billing: profile,
        additional_fields: {
          device_origin: detectDeviceOrigin()
        }
      }
    }
  };
}

function getErrorMessage(error: unknown) {
  if (error instanceof Error && error.message) {
    return error.message;
  }

  if (
    typeof error === 'object' &&
    error !== null &&
    'error' in error &&
    typeof error.error === 'object' &&
    error.error !== null &&
    'message' in error.error &&
    typeof error.error.message === 'string'
  ) {
    return error.error.message;
  }

  if (
    typeof error === 'object' &&
    error !== null &&
    'message' in error &&
    typeof error.message === 'string'
  ) {
    return error.message;
  }

  return 'Ocurrio un error inesperado al cargar el gateway.';
}

function resolveOperationCode(response: unknown, fallback: string) {
  if (
    typeof response === 'object' &&
    response !== null &&
    'merchant_operation_number' in response &&
    typeof response.merchant_operation_number === 'string'
  ) {
    return response.merchant_operation_number;
  }

  if (
    typeof response === 'object' &&
    response !== null &&
    'operation_number' in response &&
    typeof response.operation_number === 'string'
  ) {
    return response.operation_number;
  }

  return fallback;
}

export default function PaymentFlow({
  selectedObligations,
  onBack,
  onComplete
}: PaymentFlowProps) {
  const [step, setStep] = useState<PaymentStep>('summary');
  const [paymentMethod, setPaymentMethod] = useState<PaymentMethod | null>(null);
  const [gatewayStatus, setGatewayStatus] = useState<GatewayStatus>('idle');
  const [gatewayError, setGatewayError] = useState<string | null>(null);
  const [gatewayResponse, setGatewayResponse] = useState<unknown>(null);
  const [operationNumber, setOperationNumber] = useState('');
  const [gatewayReloadKey, setGatewayReloadKey] = useState(0);
  const gatewayTargetRef = useRef<HTMLDivElement | null>(null);
  const gatewayInstanceRef = useRef<PaymeGatewayInstance | null>(null);

  const total = selectedObligations.reduce((sum, obligation) => {
    return sum + obligation.amount;
  }, 0);

  const handleSelectMethod = (method: PaymentMethod) => {
    setPaymentMethod(method);
    setGatewayError(null);
    setGatewayStatus('idle');
    setGatewayResponse(null);
    setStep('gateway');
  };

  useEffect(() => {
    if (
      step !== 'gateway' ||
      !paymentMethod ||
      !gatewayTargetRef.current
    ) {
      return;
    }

    let cancelled = false;
    const target = gatewayTargetRef.current;

    const initializeGateway = async () => {
      setGatewayStatus('loading');
      setGatewayError(null);
      target.innerHTML = '';

      try {
        await Promise.all([
          loadPaymeCss(PAYME_DEMO_CONFIG.css),
          loadPaymeScript(PAYME_DEMO_CONFIG.js)
        ]);

        if (!window.FlexPaymentForms) {
          throw new Error('El SDK de Pay-Me no quedo disponible en la pagina.');
        }

        const accessToken = await getAccessToken();
        if (cancelled) {
          return;
        }

        const nonce = await getNonce(accessToken);
        if (cancelled) {
          return;
        }

        const { operationNumber: nextOperationNumber, payload } = buildPayload(total);
        setOperationNumber(nextOperationNumber);

        const gatewayConfig: PaymeGatewayConfig = {
          nonce,
          payload,
          settings: {
            display_result_screen: true,
            show_close_button: false
          },
          display_settings: {
            methods: paymeMethodMap[paymentMethod]
          },
          i18n: {
            mode: 'multi',
            default_language: 'es',
            languages: ['es', 'en']
          }
        };

        const paymeInstance = new window.FlexPaymentForms(gatewayConfig);
        gatewayInstanceRef.current = paymeInstance;

        const handleSuccess = (response: unknown) => {
          if (cancelled) {
            return;
          }

          setGatewayResponse(response);
          setStep('confirmation');
        };

        const handleCancel = () => {
          if (cancelled) {
            return;
          }

          setGatewayStatus('idle');
          setStep('method');
        };

        const handleError = (error: unknown) => {
          if (cancelled) {
            return;
          }

          const message = getErrorMessage(error).toLowerCase();
          console.error('[PAYME][GATEWAY]', error);

          if (
            message.includes('carrito') &&
            (message.includes('cerro') || message.includes('cerr'))
          ) {
            setGatewayStatus('idle');
            setStep('method');
            return;
          }

          setGatewayError(getErrorMessage(error));
          setGatewayStatus('error');
        };

        paymeInstance.init(target, handleSuccess, handleCancel, handleError);

        if (!cancelled) {
          setGatewayStatus('ready');
        }
      } catch (error) {
        if (cancelled) {
          return;
        }

        console.error('[PAYME][INIT]', error);
        setGatewayError(getErrorMessage(error));
        setGatewayStatus('error');
      }
    };

    initializeGateway();

    return () => {
      cancelled = true;

      if (gatewayInstanceRef.current?.terminate) {
        gatewayInstanceRef.current.terminate();
      }

      gatewayInstanceRef.current = null;
      target.innerHTML = '';
    };
  }, [paymentMethod, step, total, gatewayReloadKey]);

  if (step === 'summary') {
    return (
      <div className="max-w-3xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <button
          onClick={onBack}
          className="flex items-center gap-2 text-gray-600 hover:text-gray-900 mb-6"
        >
          <ChevronLeft className="w-5 h-5" />
          Volver
        </button>

        <div className="bg-white rounded-xl border border-gray-200 shadow-sm p-6 mb-6">
          <h2 className="text-2xl text-gray-900 mb-6">Resumen de pago</h2>

          <div className="space-y-4 mb-6">
            {selectedObligations.map((obligation) => (
              <div
                key={obligation.id}
                className="flex justify-between items-start pb-4 border-b border-gray-200 last:border-0"
              >
                <div>
                  <p className="text-sm text-[#0FA958] mb-1">{obligation.type}</p>
                  <p className="text-sm text-gray-700">{obligation.description}</p>
                </div>
                <p className="text-sm text-gray-900">S/ {obligation.amount.toFixed(2)}</p>
              </div>
            ))}
          </div>

          <div className="bg-gray-50 rounded-lg p-4 flex justify-between items-center">
            <p className="text-base text-gray-900 m-0">Total a pagar</p>
            <p className="text-2xl text-gray-900 m-0">S/ {total.toFixed(2)}</p>
          </div>
        </div>

        <button
          onClick={() => setStep('method')}
          className="w-full px-8 py-4 bg-[#0FA958] text-white rounded-lg hover:bg-[#0B7A43] transition-colors"
        >
          Continuar al pago
        </button>
      </div>
    );
  }

  if (step === 'method') {
    return (
      <div className="max-w-3xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <button
          onClick={() => setStep('summary')}
          className="flex items-center gap-2 text-gray-600 hover:text-gray-900 mb-6"
        >
          <ChevronLeft className="w-5 h-5" />
          Volver
        </button>

        <div className="bg-white rounded-xl border border-gray-200 shadow-sm p-6 mb-6">
          <h2 className="text-2xl text-gray-900 mb-2">Metodo de pago</h2>
          <p className="text-gray-600 mb-6">
            Selecciona como deseas realizar tu pago
          </p>

          <div className="space-y-4">
            <button
              onClick={() => handleSelectMethod('card')}
              className="w-full p-6 border-2 border-gray-200 rounded-xl hover:border-[#0FA958] hover:bg-gray-50 transition-all text-left"
            >
              <div className="flex items-center gap-4">
                <div className="w-12 h-12 bg-blue-50 rounded-lg flex items-center justify-center">
                  <CreditCard className="w-6 h-6 text-blue-600" />
                </div>
                <div>
                  <p className="text-base text-gray-900 m-0">Tarjeta de credito o debito</p>
                  <p className="text-sm text-gray-600 mt-1">
                    Visa, Mastercard, American Express, Diners
                  </p>
                </div>
              </div>
            </button>

            <button
              onClick={() => handleSelectMethod('pagoefectivo')}
              className="w-full p-6 border-2 border-gray-200 rounded-xl hover:border-[#0FA958] hover:bg-gray-50 transition-all text-left"
            >
              <div className="flex items-center gap-4">
                <div className="w-12 h-12 bg-amber-50 rounded-lg flex items-center justify-center overflow-hidden">
                  <img
                    src={pagoEfectivoLogo}
                    alt="PagoEfectivo"
                    className="max-h-7 w-auto object-contain"
                  />
                </div>
                <div>
                  <p className="text-base text-gray-900 m-0">PagoEfectivo</p>
                  <p className="text-sm text-gray-600 mt-1">
                    Genera y paga con codigo CIP
                  </p>
                </div>
              </div>
            </button>

            <button
              onClick={() => handleSelectMethod('yape')}
              className="w-full p-6 border-2 border-gray-200 rounded-xl hover:border-[#0FA958] hover:bg-gray-50 transition-all text-left"
            >
              <div className="flex items-center gap-4">
                <div className="w-12 h-12 bg-fuchsia-50 rounded-lg flex items-center justify-center overflow-hidden">
                  <img
                    src={yapeLogo}
                    alt="Yape"
                    className="max-h-7 w-auto object-contain"
                  />
                </div>
                <div>
                  <p className="text-base text-gray-900 m-0">Yape</p>
                  <p className="text-sm text-gray-600 mt-1">
                    Paga de forma inmediata desde tu billetera
                  </p>
                </div>
              </div>
            </button>

            <button
              onClick={() => handleSelectMethod('qr')}
              className="w-full p-6 border-2 border-gray-200 rounded-xl hover:border-[#0FA958] hover:bg-gray-50 transition-all text-left"
            >
              <div className="flex items-center gap-4">
                <div className="w-12 h-12 bg-cyan-50 rounded-lg flex items-center justify-center overflow-hidden">
                  <img
                    src={qrLogo}
                    alt="QR"
                    className="max-h-7 w-auto object-contain"
                  />
                </div>
                <div>
                  <p className="text-base text-gray-900 m-0">Codigo QR</p>
                  <p className="text-sm text-gray-600 mt-1">
                    Escanea el codigo con tu app bancaria o billetera
                  </p>
                </div>
              </div>
            </button>
          </div>
        </div>

        <div className="bg-gray-50 rounded-lg p-4 flex justify-between items-center">
          <p className="text-sm text-gray-600">Total a pagar</p>
          <p className="text-xl text-gray-900 m-0">S/ {total.toFixed(2)}</p>
        </div>
      </div>
    );
  }

  if (step === 'gateway') {
    return (
      <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <button
          onClick={() => setStep('method')}
          className="flex items-center gap-2 text-gray-600 hover:text-gray-900 mb-6"
        >
          <ChevronLeft className="w-5 h-5" />
          Cambiar metodo de pago
        </button>

        <div className="bg-white rounded-xl border border-gray-200 shadow-lg p-8">
          <div className="text-center mb-6">
            <h2 className="text-2xl text-gray-900 mb-2">
              Completa tu pago de forma segura
            </h2>
            <p className="text-gray-600">
              Total a pagar:{' '}
              <span className="text-[#0FA958]">S/ {total.toFixed(2)}</span>
            </p>
            {paymentMethod && (
              <p className="mt-2 text-sm text-gray-500">
                Metodo seleccionado: {paymentMethodLabels[paymentMethod]}
              </p>
            )}
            {operationNumber && (
              <p className="mt-1 text-xs text-gray-400">
                Operacion demo: {operationNumber}
              </p>
            )}
          </div>

          <div className="rounded-xl border border-gray-200 bg-gray-50 p-4 mb-6">
            {gatewayStatus === 'loading' && (
              <div className="mb-4 flex items-center justify-center gap-2 text-sm text-gray-500">
                <Lock className="w-4 h-4" />
                Cargando gateway Pay-Me...
              </div>
            )}

            {gatewayError && (
              <div className="mb-4 rounded-lg border border-red-200 bg-red-50 px-4 py-3 text-sm text-red-700">
                {gatewayError}
              </div>
            )}

            <section className="payment-wrap">
              <div className="payment-container">
                <div
                  id="demo"
                  ref={gatewayTargetRef}
                  className="min-h-[520px] overflow-hidden rounded-xl bg-white"
                />
              </div>
            </section>
          </div>

          <div className="flex items-center justify-center gap-2 mb-6 text-sm text-gray-600">
            <Lock className="w-4 h-4" />
            <span>Pago demo procesado con Pay-Me / Alignet</span>
          </div>

          <div className="flex gap-4">
            <button
              onClick={() => setStep('method')}
              className="flex-1 px-6 py-3 bg-white border border-gray-300 text-gray-700 rounded-lg hover:bg-gray-50 transition-colors"
            >
              Volver a metodos
            </button>
            {gatewayStatus === 'error' && (
              <button
                onClick={() => setGatewayReloadKey((value) => value + 1)}
                className="flex-1 px-6 py-3 bg-[#0FA958] text-white rounded-lg hover:bg-[#0B7A43] transition-colors"
              >
                Reintentar carga
              </button>
            )}
          </div>
        </div>
      </div>
    );
  }

  if (step === 'confirmation') {
    const currentDate = new Date().toLocaleDateString('es-PE', {
      day: '2-digit',
      month: '2-digit',
      year: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    });

    const operationCode = resolveOperationCode(gatewayResponse, operationNumber);

    return (
      <div className="max-w-3xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="bg-white rounded-xl border border-gray-200 shadow-sm p-8 text-center">
          <div className="w-20 h-20 bg-green-50 rounded-full flex items-center justify-center mx-auto mb-6">
            <CheckCircle className="w-12 h-12 text-[#0FA958]" />
          </div>

          <h2 className="text-2xl text-gray-900 mb-2">
            Pago realizado correctamente
          </h2>
          <p className="text-gray-600 mb-8">
            Tu pago ha sido procesado exitosamente
          </p>

          <div className="bg-gray-50 rounded-xl p-6 mb-8 text-left">
            <div className="grid grid-cols-2 gap-4 mb-4">
              <div>
                <p className="text-xs text-gray-500 mb-1">Codigo de operacion</p>
                <p className="text-sm text-gray-900">{operationCode}</p>
              </div>
              <div>
                <p className="text-xs text-gray-500 mb-1">Fecha y hora</p>
                <p className="text-sm text-gray-900">{currentDate}</p>
              </div>
            </div>

            <div className="border-t border-gray-200 pt-4 mb-4">
              <p className="text-xs text-gray-500 mb-2">Conceptos pagados</p>
              <div className="space-y-2">
                {selectedObligations.map((obligation) => (
                  <div key={obligation.id} className="flex justify-between text-sm">
                    <span className="text-gray-700">
                      {obligation.type} - {obligation.description}
                    </span>
                    <span className="text-gray-900">
                      S/ {obligation.amount.toFixed(2)}
                    </span>
                  </div>
                ))}
              </div>
            </div>

            <div className="border-t border-gray-200 pt-4">
              <div className="flex justify-between">
                <p className="text-base text-gray-900 m-0">Total pagado</p>
                <p className="text-xl text-[#0FA958] m-0">S/ {total.toFixed(2)}</p>
              </div>
            </div>
          </div>

          <div className="flex flex-col sm:flex-row gap-4 mb-6">
            <button className="flex-1 px-6 py-3 bg-white border border-gray-300 text-gray-700 rounded-lg hover:bg-gray-50 transition-colors flex items-center justify-center gap-2">
              <Download className="w-5 h-5" />
              Descargar comprobante
            </button>
            <button className="flex-1 px-6 py-3 bg-white border border-gray-300 text-gray-700 rounded-lg hover:bg-gray-50 transition-colors flex items-center justify-center gap-2">
              <Mail className="w-5 h-5" />
              Enviar por correo
            </button>
          </div>

          <button
            onClick={onComplete}
            className="w-full px-8 py-4 bg-[#0FA958] text-white rounded-lg hover:bg-[#0B7A43] transition-colors"
          >
            Volver al dashboard
          </button>
        </div>
      </div>
    );
  }

  return null;
}
