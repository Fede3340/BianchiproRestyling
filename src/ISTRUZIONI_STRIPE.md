# 🚀 Configurazione Stripe per Pagamenti

## 📋 Panoramica

Il tuo sito e-commerce HORECA è ora dotato di un sistema di pagamenti completo integrato con **Stripe**, il leader mondiale nei pagamenti online sicuri.

## ✅ Cosa è già implementato:

- ✅ Backend completo con Supabase
- ✅ Salvataggio ordini nel database
- ✅ Form assistenza funzionante
- ✅ Carrello persistente
- ✅ Integrazione Stripe Elements
- ✅ Gestione pagamenti sicuri PCI-compliant

## 🔧 Configurazione Necessaria (2 minuti):

### 1️⃣ Ottieni le chiavi Stripe

**Account Test (gratuito, per sviluppo):**

1. Vai su: https://dashboard.stripe.com/register
2. Crea un account gratuito (nessuna carta richiesta)
3. Una volta loggato, vai su: https://dashboard.stripe.com/test/apikeys
4. Troverai due chiavi:
   - **Publishable key** (inizia con `pk_test_...`) - SICURA, va nel frontend
   - **Secret key** (inizia con `sk_test_...`) - SENSIBILE, va nel backend

### 2️⃣ Configura la Publishable Key (Frontend)

1. Apri il file `/config/stripe.ts`
2. Sostituisci questa riga:
   ```typescript
   publishableKey: 'pk_test_INSERISCI_QUI_LA_TUA_PUBLISHABLE_KEY',
   ```
   Con la tua chiave:
   ```typescript
   publishableKey: 'pk_test_51AbCdEf...',  // La tua chiave reale
   ```

### 3️⃣ Configura la Secret Key (Backend)

⚠️ **IMPORTANTE:** La Secret Key NON va mai nel codice!

**Dove configurarla:**
1. Vai al pannello Supabase di questo progetto
2. Settings → Edge Functions → Environment Variables
3. Aggiungi una nuova variabile:
   - Nome: `STRIPE_SECRET_KEY`
   - Valore: `sk_test_51AbCdEf...` (la tua Secret Key)

## 🧪 Test dei Pagamenti

**Carte di test da usare:**

- ✅ **Successo:** `4242 4242 4242 4242`
- ❌ **Carta rifiutata:** `4000 0000 0000 0002`
- ⏳ **Richiede autenticazione:** `4000 0025 0000 3155`

**Dati aggiuntivi per il test:**
- Data scadenza: qualsiasi data futura (es. 12/25)
- CVV: qualsiasi 3 cifre (es. 123)
- CAP: qualsiasi (es. 12345)

## 💳 Passare in Produzione

Quando sei pronto per accettare pagamenti reali:

1. Completa la verifica del tuo account Stripe
2. Vai su: https://dashboard.stripe.com/apikeys (senza /test/)
3. Usa le chiavi di produzione (iniziano con `pk_live_...` e `sk_live_...`)
4. Sostituiscile seguendo gli stessi passaggi sopra

## 🔒 Sicurezza

- ✅ I dati delle carte NON passano mai dal tuo server
- ✅ Stripe gestisce tutto in modo PCI-compliant
- ✅ La Secret Key è protetta nel backend
- ✅ Comunicazioni crittografate HTTPS

## 📊 Funzionalità Disponibili

### Carrello
- Aggiunta/rimozione prodotti
- Calcolo automatico IVA (22%)
- Accessori e opzioni personalizzabili

### Checkout
- Form dati cliente (nome, email, telefono, indirizzo)
- Stripe Payment Element (carte, Google Pay, Apple Pay*)
- Gestione errori in tempo reale
- Conferma pagamento

### Database
- Salvataggio automatico ordini
- Storico per ogni cliente
- Stato ordine (pending/paid)
- Tracking Payment Intent ID

### Assistenza
- Form contatto funzionante
- Salvataggio richieste nel database
- Notifiche toast per l'utente

## 🛠️ Troubleshooting

### "Stripe Non Configurato"
→ Hai dimenticato di sostituire la publishable key in `/config/stripe.ts`

### "Errore durante la creazione del pagamento"
→ La Secret Key non è configurata nelle variabili d'ambiente di Supabase

### Pagamento non va a buon fine
→ Verifica di usare le carte di test corrette (vedi sopra)

## 📞 Supporto

- Documentazione Stripe: https://stripe.com/docs
- Dashboard Stripe: https://dashboard.stripe.com
- Test cards: https://stripe.com/docs/testing

---

## 🎉 Pronto per vendere!

Una volta configurate le chiavi, il tuo e-commerce è COMPLETAMENTE funzionante e pronto per accettare ordini reali!
