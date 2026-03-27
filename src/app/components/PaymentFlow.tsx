import { useState } from 'react';
import { ChevronLeft, CreditCard, Smartphone, Building2, Lock, CheckCircle, Download, Mail } from 'lucide-react';

interface Obligation {
  id: string;
  type: string;
  description: string;
  amount: number;
}

interface PaymentFlowProps {
  selectedObligations: Obligation[];
  onBack: () => void;
  onComplete: () => void;
}

export default function PaymentFlow({ selectedObligations, onBack, onComplete }: PaymentFlowProps) {
  const [step, setStep] = useState<'summary' | 'method' | 'gateway' | 'confirmation'>('summary');
  const [paymentMethod, setPaymentMethod] = useState<'card' | 'bank' | 'wallet' | null>(null);
  const [isProcessing, setIsProcessing] = useState(false);

  const total = selectedObligations.reduce((sum, o) => sum + o.amount, 0);

  const handleSelectMethod = (method: 'card' | 'bank' | 'wallet') => {
    setPaymentMethod(method);
    setStep('gateway');
  };

  const handleProcessPayment = () => {
    setIsProcessing(true);
    setTimeout(() => {
      setIsProcessing(false);
      setStep('confirmation');
    }, 3000);
  };

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
              <div key={obligation.id} className="flex justify-between items-start pb-4 border-b border-gray-200 last:border-0">
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
          <h2 className="text-2xl text-gray-900 mb-2">Método de pago</h2>
          <p className="text-gray-600 mb-6">Selecciona cómo deseas realizar tu pago</p>

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
                  <p className="text-base text-gray-900 m-0">Tarjeta de crédito o débito</p>
                  <p className="text-sm text-gray-600 mt-1">Visa, Mastercard, American Express</p>
                </div>
              </div>
            </button>

            <button
              onClick={() => handleSelectMethod('bank')}
              className="w-full p-6 border-2 border-gray-200 rounded-xl hover:border-[#0FA958] hover:bg-gray-50 transition-all text-left"
            >
              <div className="flex items-center gap-4">
                <div className="w-12 h-12 bg-purple-50 rounded-lg flex items-center justify-center">
                  <Building2 className="w-6 h-6 text-purple-600" />
                </div>
                <div>
                  <p className="text-base text-gray-900 m-0">Banca por Internet</p>
                  <p className="text-sm text-gray-600 mt-1">BCP, BBVA, Interbank, Scotiabank</p>
                </div>
              </div>
            </button>

            <button
              onClick={() => handleSelectMethod('wallet')}
              className="w-full p-6 border-2 border-gray-200 rounded-xl hover:border-[#0FA958] hover:bg-gray-50 transition-all text-left"
            >
              <div className="flex items-center gap-4">
                <div className="w-12 h-12 bg-green-50 rounded-lg flex items-center justify-center">
                  <Smartphone className="w-6 h-6 text-green-600" />
                </div>
                <div>
                  <p className="text-base text-gray-900 m-0">Billeteras digitales</p>
                  <p className="text-sm text-gray-600 mt-1">Yape, Plin, Tunki</p>
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
          Cambiar método de pago
        </button>

        <div className="bg-white rounded-xl border border-gray-200 shadow-lg p-8">
          <div className="text-center mb-6">
            <h2 className="text-2xl text-gray-900 mb-2">Completa tu pago de forma segura</h2>
            <p className="text-gray-600">Total a pagar: <span className="text-[#0FA958]">S/ {total.toFixed(2)}</span></p>
          </div>

          <div className="bg-gradient-to-br from-gray-50 to-gray-100 border-2 border-dashed border-gray-300 rounded-xl p-12 mb-6 min-h-[400px] flex flex-col items-center justify-center">
            <Lock className="w-16 h-16 text-gray-400 mb-4" />
            <h3 className="text-lg text-gray-700 mb-2">Área de pago segura</h3>
            <p className="text-sm text-gray-500 text-center mb-6 max-w-md">
              Aquí se carga el formulario del gateway de pago (iframe)<br/>
              En producción, aquí aparecería el formulario de la pasarela de pagos seleccionada
            </p>

            <div className="w-full max-w-md space-y-4">
              <div className="bg-white rounded-lg p-4 border border-gray-200">
                <p className="text-xs text-gray-500 mb-2">Simulación de gateway:</p>
                <p className="text-sm text-gray-700">✓ Conexión segura SSL/TLS</p>
                <p className="text-sm text-gray-700">✓ PCI-DSS Compliant</p>
                <p className="text-sm text-gray-700">✓ Encriptación 256-bit</p>
              </div>
            </div>
          </div>

          <div className="flex items-center justify-center gap-2 mb-6 text-sm text-gray-600">
            <Lock className="w-4 h-4" />
            <span>Pago procesado de forma segura por Niubiz / Izipay / Culqi</span>
          </div>

          <div className="flex gap-4">
            <button
              onClick={() => setStep('method')}
              className="flex-1 px-6 py-3 bg-white border border-gray-300 text-gray-700 rounded-lg hover:bg-gray-50 transition-colors"
            >
              Cancelar pago
            </button>
            <button
              onClick={handleProcessPayment}
              disabled={isProcessing}
              className="flex-1 px-6 py-3 bg-[#0FA958] text-white rounded-lg hover:bg-[#0B7A43] transition-colors disabled:bg-gray-400 disabled:cursor-not-allowed"
            >
              {isProcessing ? 'Procesando...' : 'Confirmar pago'}
            </button>
          </div>
        </div>
      </div>
    );
  }

  if (step === 'confirmation') {
    const operationCode = 'OP' + Math.random().toString(36).substring(2, 11).toUpperCase();
    const currentDate = new Date().toLocaleDateString('es-PE', {
      day: '2-digit',
      month: '2-digit',
      year: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    });

    return (
      <div className="max-w-3xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="bg-white rounded-xl border border-gray-200 shadow-sm p-8 text-center">
          <div className="w-20 h-20 bg-green-50 rounded-full flex items-center justify-center mx-auto mb-6">
            <CheckCircle className="w-12 h-12 text-[#0FA958]" />
          </div>

          <h2 className="text-2xl text-gray-900 mb-2">¡Pago realizado correctamente!</h2>
          <p className="text-gray-600 mb-8">Tu pago ha sido procesado exitosamente</p>

          <div className="bg-gray-50 rounded-xl p-6 mb-8 text-left">
            <div className="grid grid-cols-2 gap-4 mb-4">
              <div>
                <p className="text-xs text-gray-500 mb-1">Código de operación</p>
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
                    <span className="text-gray-700">{obligation.type} - {obligation.description}</span>
                    <span className="text-gray-900">S/ {obligation.amount.toFixed(2)}</span>
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
