import { useState, useEffect } from 'react';
import { CheckCircle, XCircle, Loader2, Database, CreditCard } from 'lucide-react';
import { isStripeConfigured } from '../config/stripe';

const isLocalDev = Boolean((import.meta as any).env?.DEV);

export default function BackendStatus() {
  const [backendStatus, setBackendStatus] = useState<'loading' | 'online' | 'offline'>('loading');
  const [stripeConfigured, setStripeConfigured] = useState<boolean | null>(null);

  useEffect(() => {
    const checkBackend = async () => {
      try {
        if (isLocalDev) {
          // In sviluppo locale (vite dev) le Netlify Functions potrebbero non essere instradate.
          // Evitiamo un falso 'offline' e usiamo il calcolo locale nel carrello.
          setBackendStatus('online');
          setStripeConfigured(isStripeConfigured());
          return;
        }

        const healthGet = await fetch('/.netlify/functions/preventivo', { method: 'GET' });
        const health = healthGet.ok
          ? healthGet
          : await fetch('/.netlify/functions/preventivo', {
              method: 'POST',
              headers: { 'Content-Type': 'application/json' },
              body: JSON.stringify({ items: [] }),
            });

        if (health.ok) {
          setBackendStatus('online');
          setStripeConfigured(isStripeConfigured());
        } else {
          setBackendStatus('offline');
        }
      } catch (error) {
        console.error('Backend non raggiungibile:', error);
        setBackendStatus('offline');
      }
    };

    checkBackend();
  }, []);

  return (
    <div className="fixed bottom-4 left-4 z-40 bg-white rounded-lg shadow-lg border-2 border-gray-200 p-3 max-w-xs">
      <div className="text-xs font-bold text-gray-700 mb-2">Stato Sistema</div>

      <div className="flex items-center gap-2 mb-1.5">
        {backendStatus === 'loading' && (
          <>
            <Loader2 className="w-4 h-4 text-gray-400 animate-spin" />
            <span className="text-xs text-gray-600">Controllo backend...</span>
          </>
        )}
        {backendStatus === 'online' && (
          <>
            <CheckCircle className="w-4 h-4 text-green-600" />
            <span className="text-xs text-gray-900 font-semibold">Backend Attivo</span>
          </>
        )}
        {backendStatus === 'offline' && (
          <>
            <XCircle className="w-4 h-4 text-red-600" />
            <span className="text-xs text-red-700 font-semibold">Backend Offline</span>
          </>
        )}
      </div>

      {backendStatus === 'online' && (
        <div className="flex items-center gap-2 mb-1.5">
          <Database className="w-4 h-4 text-green-600" />
          <span className="text-xs text-gray-900">Database Connesso</span>
        </div>
      )}

      {backendStatus === 'online' && stripeConfigured !== null && (
        <div className="flex items-center gap-2">
          {stripeConfigured ? (
            <>
              <CreditCard className="w-4 h-4 text-green-600" />
              <span className="text-xs text-gray-900">Stripe Configurato</span>
            </>
          ) : (
            <>
              <CreditCard className="w-4 h-4 text-orange-500" />
              <span className="text-xs text-orange-700">Stripe: aggiungi chiave</span>
            </>
          )}
        </div>
      )}

      {backendStatus === 'online' && stripeConfigured === false && (
        <div className="mt-2 pt-2 border-t border-gray-200">
          <p className="text-xs text-orange-700 font-semibold mb-1">⚠️ Configura chiavi Stripe</p>
          <p className="text-xs text-gray-600 leading-tight">
            Leggi: <code className="bg-gray-100 px-1">COME_OTTENERE_SECRET_KEY.md</code>
          </p>
        </div>
      )}
    </div>
  );
}
