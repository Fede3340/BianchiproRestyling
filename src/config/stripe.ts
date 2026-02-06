// ⚠️ IMPORTANTE: Sostituisci queste chiavi con le tue chiavi Stripe
// 
// Per ottenere le chiavi:
// 1. Vai su https://dashboard.stripe.com/test/apikeys
// 2. Copia la "Publishable key" (inizia con pk_test_...)
// 3. Copia la "Secret key" (inizia con sk_test_...) e aggiungila nelle variabili d'ambiente del server
//
// NOTA: La Secret Key va configurata nelle variabili d'ambiente di Supabase,
// NON in questo file (per sicurezza)

const fallbackPublishableKey = 'pk_test_INSERISCI_QUI_LA_TUA_PUBLISHABLE_KEY';
const localStorageKey = 'stripePublishableKey';

export function getStripePublishableKey(): string {
  if (typeof window !== 'undefined') {
    const storedKey = window.localStorage.getItem(localStorageKey);
    if (storedKey) {
      return storedKey;
    }
  }

  return import.meta.env.VITE_STRIPE_PUBLISHABLE_KEY || fallbackPublishableKey;
}

export const STRIPE_CONFIG = {
  // Publishable Key (sicura da esporre nel frontend)
  publishableKey: getStripePublishableKey(),

  // Altre configurazioni
  currency: 'eur',
  country: 'IT',
};

// Verifica che la chiave sia stata configurata
export function isStripeConfigured(): boolean {
  return getStripePublishableKey() !== fallbackPublishableKey;
}

export function persistStripePublishableKey(key: string) {
  if (typeof window !== 'undefined') {
    window.localStorage.setItem(localStorageKey, key);
  }
}
