import { useMemo, useState } from 'react';
import { X, CreditCard, Lock, Loader2 } from 'lucide-react';
import { loadStripe } from '@stripe/stripe-js';
import { Elements, PaymentElement, useStripe, useElements } from '@stripe/react-stripe-js';
import { STRIPE_CONFIG, getStripePublishableKey, persistStripePublishableKey } from '../config/stripe';

// ⚠️ CONFIGURAZIONE STRIPE
// 1. Vai su: https://dashboard.stripe.com/test/apikeys
// 2. Copia la "Publishable key" (inizia con pk_test_...)
// 3. Impostala in VITE_STRIPE_PUBLISHABLE_KEY oppure inseriscila nel modal

interface CheckoutModalProps {
  isOpen: boolean;
  onClose: () => void;
  total: number;
  items: any[];
  onSuccess: (orderId: string) => void;
}

function CheckoutForm({ 
  total, 
  items, 
  onClose, 
  onSuccess 
}: { 
  total: number; 
  items: any[]; 
  onClose: () => void; 
  onSuccess: (orderId: string) => void;
}) {
  const stripe = useStripe();
  const elements = useElements();
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  
  // Form dati cliente
  const [customerName, setCustomerName] = useState('');
  const [customerEmail, setCustomerEmail] = useState('');
  const [customerPhone, setCustomerPhone] = useState('');
  const [customerAddress, setCustomerAddress] = useState('');

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!stripe || !elements) {
      return;
    }

    if (!customerName || !customerEmail || !customerPhone) {
      setError('Compila tutti i campi obbligatori');
      return;
    }

    setLoading(true);
    setError(null);

    try {
      // Conferma il pagamento con Stripe
      const { error: submitError, paymentIntent } = await elements.submit();
      
      if (submitError) {
        setError(submitError.message || 'Errore durante il pagamento');
        setLoading(false);
        return;
      }

      const { error: confirmError } = await stripe.confirmPayment({
        elements,
        confirmParams: {
          return_url: window.location.href,
          receipt_email: customerEmail,
        },
        redirect: 'if_required',
      });

      if (confirmError) {
        setError(confirmError.message || 'Pagamento non riuscito');
        setLoading(false);
        return;
      }

      // Salva l'ordine nel database
      const response = await fetch('/.netlify/functions/orders', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          customerName,
          customerEmail,
          customerPhone,
          customerAddress,
          items,
          total,
          paymentIntentId: paymentIntent?.id,
        }),
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.error || 'Errore durante il salvataggio dell\'ordine');
      }

      console.log('✅ Ordine completato:', data.orderId);
      onSuccess(data.orderId);
      onClose();

    } catch (err: any) {
      console.error('❌ Errore checkout:', err);
      setError(err.message || 'Errore durante il checkout');
    } finally {
      setLoading(false);
    }
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-4">
      {/* Dati Cliente */}
      <div className="bg-gray-50 rounded-lg p-4 space-y-3">
        <h3 className="font-bold text-gray-900 text-lg">Dati di Fatturazione</h3>
        
        <div>
          <label className="block text-sm font-bold text-gray-700 mb-1">
            Nome e Cognome *
          </label>
          <input
            type="text"
            value={customerName}
            onChange={(e) => setCustomerName(e.target.value)}
            className="w-full px-3 py-2.5 border-2 border-gray-300 rounded-lg focus:outline-none focus:border-green-500 text-base"
            placeholder="Mario Rossi"
            required
          />
        </div>

        <div>
          <label className="block text-sm font-bold text-gray-700 mb-1">
            Email *
          </label>
          <input
            type="email"
            value={customerEmail}
            onChange={(e) => setCustomerEmail(e.target.value)}
            className="w-full px-3 py-2.5 border-2 border-gray-300 rounded-lg focus:outline-none focus:border-green-500 text-base"
            placeholder="mario.rossi@esempio.it"
            required
          />
        </div>

        <div>
          <label className="block text-sm font-bold text-gray-700 mb-1">
            Telefono *
          </label>
          <input
            type="tel"
            value={customerPhone}
            onChange={(e) => setCustomerPhone(e.target.value)}
            className="w-full px-3 py-2.5 border-2 border-gray-300 rounded-lg focus:outline-none focus:border-green-500 text-base"
            placeholder="+39 123 456 7890"
            required
          />
        </div>

        <div>
          <label className="block text-sm font-bold text-gray-700 mb-1">
            Indirizzo di Spedizione
          </label>
          <textarea
            value={customerAddress}
            onChange={(e) => setCustomerAddress(e.target.value)}
            className="w-full px-3 py-2.5 border-2 border-gray-300 rounded-lg focus:outline-none focus:border-green-500 text-base resize-none"
            placeholder="Via Roma 123, 00100 Roma (RM)"
            rows={2}
          />
        </div>
      </div>

      {/* Stripe Payment Element */}
      <div className="bg-gray-50 rounded-lg p-4">
        <h3 className="font-bold text-gray-900 text-lg mb-3 flex items-center gap-2">
          <CreditCard className="w-5 h-5 text-green-600" />
          Metodo di Pagamento
        </h3>
        <PaymentElement />
      </div>

      {/* Error Message */}
      {error && (
        <div className="bg-red-50 border-2 border-red-200 rounded-lg p-3">
          <p className="text-sm font-semibold text-red-800">{error}</p>
        </div>
      )}

      {/* Totale e Pulsante */}
      <div className="bg-green-50 rounded-lg p-4 border-2 border-green-200">
        <div className="flex items-center justify-between mb-3">
          <span className="text-lg font-bold text-gray-900">Totale da pagare:</span>
          <span className="text-2xl font-black text-green-700">€ {total.toFixed(2)}</span>
        </div>

        <button
          type="submit"
          disabled={!stripe || loading}
          className="w-full bg-green-600 text-white font-black text-lg py-4 rounded-xl hover:bg-green-700 disabled:bg-gray-400 disabled:cursor-not-allowed transition-all flex items-center justify-center gap-2 shadow-lg hover:shadow-xl"
        >
          {loading ? (
            <>
              <Loader2 className="w-5 h-5 animate-spin" />
              Elaborazione...
            </>
          ) : (
            <>
              <Lock className="w-5 h-5" />
              PAGA ORA € {total.toFixed(2)}
            </>
          )}
        </button>

        <p className="text-xs text-gray-600 text-center mt-2">
          🔒 Pagamento sicuro protetto da Stripe
        </p>
      </div>
    </form>
  );
}

export default function CheckoutModal({ isOpen, onClose, total, items, onSuccess }: CheckoutModalProps) {
  const [publishableKey, setPublishableKey] = useState(getStripePublishableKey());
  const [clientSecret, setClientSecret] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [localKeyInput, setLocalKeyInput] = useState('');

  const stripePromise = useMemo(() => {
    if (!publishableKey || publishableKey === 'pk_test_INSERISCI_QUI_LA_TUA_PUBLISHABLE_KEY') {
      return null;
    }
    return loadStripe(publishableKey);
  }, [publishableKey]);

  // Crea Payment Intent quando si apre il modal
  const initializePayment = async () => {
    if (clientSecret) return; // Già inizializzato

    setLoading(true);
    setError(null);

    try {
      const response = await fetch('/.netlify/functions/create-payment-intent', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          amount: total,
          currency: STRIPE_CONFIG.currency,
        }),
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.error || 'Errore durante l\'inizializzazione del pagamento');
      }

      setClientSecret(data.clientSecret);
      console.log('✅ Payment Intent creato');

    } catch (err: any) {
      console.error('❌ Errore inizializzazione pagamento:', err);
      setError(err.message || 'Impossibile inizializzare il pagamento');
    } finally {
      setLoading(false);
    }
  };

  // Inizializza quando il modal si apre
  if (isOpen && !clientSecret && !loading && !error) {
    initializePayment();
  }

  if (!isOpen) return null;

  const options = {
    clientSecret: clientSecret || undefined,
    appearance: {
      theme: 'stripe' as const,
      variables: {
        colorPrimary: '#16a34a',
        colorText: '#1f2937',
        fontFamily: 'system-ui, sans-serif',
        borderRadius: '0.75rem',
      },
    },
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm">
      <div className="bg-white rounded-2xl shadow-2xl max-w-2xl w-full max-h-[90vh] overflow-y-auto">
        {/* Header */}
        <div className="sticky top-0 bg-white border-b-2 border-gray-200 p-4 flex items-center justify-between z-10">
          <h2 className="text-2xl font-black text-gray-900">Completa il Pagamento</h2>
          <button
            onClick={onClose}
            className="p-2 hover:bg-gray-100 rounded-full transition-colors"
            disabled={loading}
          >
            <X className="w-6 h-6 text-gray-600" />
          </button>
        </div>

        {/* Content */}
        <div className="p-6">
          {/* Warning se Stripe non configurato */}
          {!stripePromise && (
            <div className="bg-orange-50 border-2 border-orange-300 rounded-lg p-6">
              <h3 className="text-lg font-bold text-orange-900 mb-3 flex items-center gap-2">
                ⚠️ Publishable Key Non Configurata
              </h3>
              <p className="text-sm text-orange-800 mb-4">
                Per abilitare i pagamenti, inserisci la <strong>Publishable key</strong> (pk_test...) o configuralo in <code className="bg-white px-2 py-0.5 rounded font-mono text-xs">VITE_STRIPE_PUBLISHABLE_KEY</code>.
              </p>

              <div className="bg-white rounded-lg p-4 mb-4 border border-orange-200">
                <label className="block text-xs font-semibold text-gray-700 mb-2">
                  Inserisci la tua Publishable key
                </label>
                <div className="flex flex-col sm:flex-row gap-2">
                  <input
                    type="text"
                    value={localKeyInput}
                    onChange={(event) => setLocalKeyInput(event.target.value)}
                    placeholder="pk_test_..."
                    className="flex-1 px-3 py-2 text-sm border border-orange-200 rounded-md focus:outline-none focus:ring-2 focus:ring-orange-200"
                  />
                  <button
                    type="button"
                    onClick={() => {
                      if (!localKeyInput.trim()) {
                        return;
                      }
                      persistStripePublishableKey(localKeyInput.trim());
                      setPublishableKey(localKeyInput.trim());
                    }}
                    className="px-4 py-2 text-sm font-bold text-white bg-orange-600 rounded-md hover:bg-orange-700 transition-colors"
                  >
                    Salva chiave
                  </button>
                </div>
                <p className="text-xs text-gray-600 mt-2">
                  La chiave viene salvata nel browser solo per questo dispositivo.
                </p>
              </div>
              
              <div className="bg-white rounded-lg p-4 mb-4 border border-orange-200">
                <p className="text-xs font-semibold text-gray-900 mb-3">📋 Passaggi rapidi:</p>
                <ol className="space-y-2 text-xs text-gray-700">
                  <li className="flex gap-2">
                    <span className="font-bold text-orange-600">1.</span>
                    <span>Vai su: <a href="https://dashboard.stripe.com/test/apikeys" target="_blank" rel="noopener" className="text-blue-600 underline font-semibold">dashboard.stripe.com/test/apikeys</a></span>
                  </li>
                  <li className="flex gap-2">
                    <span className="font-bold text-orange-600">2.</span>
                    <span>Copia la <strong>Publishable key</strong> (inizia con <code className="bg-gray-100 px-1">pk_test_...</code>)</span>
                  </li>
                  <li className="flex gap-2">
                    <span className="font-bold text-orange-600">3.</span>
                    <span>Incolla la chiave sopra oppure apri le variabili d'ambiente in Netlify</span>
                  </li>
                  <li className="flex gap-2">
                    <span className="font-bold text-orange-600">4.</span>
                    <span>Imposta <code className="bg-gray-100 px-1">VITE_STRIPE_PUBLISHABLE_KEY</code> con la tua chiave</span>
                  </li>
                  <li className="flex gap-2">
                    <span className="font-bold text-orange-600">5.</span>
                    <span>Salva e ricarica la pagina</span>
                  </li>
                </ol>
              </div>

              <div className="bg-blue-50 border border-blue-200 rounded p-3 mb-4">
                <p className="text-xs text-blue-800">
                  <strong>💡 Esempio:</strong>
                </p>
                <pre className="text-xs mt-2 bg-white p-2 rounded border border-blue-200 overflow-x-auto">
<code>VITE_STRIPE_PUBLISHABLE_KEY=pk_test_51Abc...</code>
                </pre>
              </div>

              <p className="text-xs text-gray-600 mb-3">
                📖 <strong>Guida completa</strong>: leggi <code className="bg-gray-100 px-1">/CONFIGURAZIONE_CHIAVI_STRIPE.md</code>
              </p>
              
              <button
                onClick={onClose}
                className="w-full py-3 bg-orange-600 text-white font-bold rounded-lg hover:bg-orange-700 transition-colors"
              >
                Chiudi - Vado a Configurare
              </button>
            </div>
          )}

          {stripePromise && loading && !clientSecret && (
            <div className="flex flex-col items-center justify-center py-12">
              <Loader2 className="w-12 h-12 text-green-600 animate-spin mb-4" />
              <p className="text-lg font-semibold text-gray-700">Inizializzazione pagamento...</p>
            </div>
          )}

          {stripePromise && error && (
            <div className="bg-red-50 border-2 border-red-200 rounded-lg p-4 mb-4">
              <p className="text-sm font-semibold text-red-800">{error}</p>
              <button
                onClick={() => {
                  setError(null);
                  setClientSecret(null);
                  initializePayment();
                }}
                className="mt-3 px-4 py-2 bg-red-600 text-white font-bold rounded-lg hover:bg-red-700 transition-colors"
              >
                Riprova
              </button>
            </div>
          )}

          {stripePromise && clientSecret && (
            <Elements stripe={stripePromise} options={options}>
              <CheckoutForm 
                total={total} 
                items={items} 
                onClose={onClose}
                onSuccess={onSuccess}
              />
            </Elements>
          )}
        </div>
      </div>
    </div>
  );
}
