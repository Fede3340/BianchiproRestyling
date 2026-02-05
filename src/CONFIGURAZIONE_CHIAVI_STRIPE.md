# 🔑 CONFIGURAZIONE STRIPE - PASSO PASSO

## ⚠️ IMPORTANTE: Segui TUTTI i passaggi

---

## 🎯 Passo 1: Ottieni le chiavi Stripe (GRATIS)

### 1. Crea Account Stripe
Vai su: **https://dashboard.stripe.com/register**
- ✅ Registrati (gratis, no carta richiesta)
- ✅ Conferma email
- ✅ Accedi alla Dashboard

### 2. Vai alla pagina API Keys
Nella Dashboard Stripe, vai su:
**Developers → API keys**

Oppure clicca direttamente:
**https://dashboard.stripe.com/test/apikeys**

### 3. Copia ENTRAMBE le chiavi

Vedrai 2 chiavi:

#### 🔐 Secret Key (PRIVATA)
- **Nome**: Secret key
- **Inizia con**: `sk_test_...`
- **Lunghezza**: ~107 caratteri
- **Esempio**: `sk_test_51Abc1234XYZ5678901234567890abcdefghijklmnopqrstuvwxyz1234567890ABCDEFGHIJKLMNOPQRSTUVWXYZ`
- ⚠️ **Copiala TUTTA** (clicca "Reveal test key" se nascosta)

#### 🔓 Publishable Key (PUBBLICA)
- **Nome**: Publishable key
- **Inizia con**: `pk_test_...`
- **Lunghezza**: ~107 caratteri
- **Esempio**: `pk_test_51Abc1234XYZ5678901234567890abcdefghijklmnopqrstuvwxyz1234567890ABCDEFGHIJKLMNOPQRSTUVWXYZ`
- ⚠️ **Copiala TUTTA**

---

## 🎯 Passo 2: Configura Secret Key (Backend)

### ✅ FATTO! 
Hai appena inserito la Secret Key nel popup.

### ⚠️ VERIFICA IMPORTANTE:
La chiave **DEVE**:
- ✅ Iniziare con `sk_test_`
- ✅ Essere lunga ~107 caratteri
- ✅ NON contenere spazi all'inizio o alla fine

Se hai inserito una chiave sbagliata, ricarica la pagina e reinserisci quando richiesto.

---

## 🎯 Passo 3: Configura Publishable Key (Frontend)

### Apri il file:
**`/components/CheckoutModal.tsx`**

### Trova la riga 10:
```typescript
const STRIPE_PUBLISHABLE_KEY = 'INSERISCI_TUA_PUBLISHABLE_KEY_QUI';
```

### Sostituisci con la tua chiave:
```typescript
const STRIPE_PUBLISHABLE_KEY = 'pk_test_51Abc...'; // Incolla la tua chiave qui
```

### ✅ Esempio completo:
```typescript
// ⚠️ PRIMA (non funziona)
const STRIPE_PUBLISHABLE_KEY = 'INSERISCI_TUA_PUBLISHABLE_KEY_QUI';

// ✅ DOPO (funziona!)
const STRIPE_PUBLISHABLE_KEY = 'pk_test_51Abc1234XYZ5678901234567890abcdefghijklmnopqrstuvwxyz1234567890ABCDEFGHIJKLMNOPQRSTUVWXYZ';
```

⚠️ **IMPORTANTE**:
- Mantieni gli apici singoli `'...'`
- NON aggiungere spazi
- Copia TUTTA la chiave
- Salva il file

---

## 🧪 Passo 4: TESTA!

### Test 1: Verifica Backend
Guarda l'angolo in basso a sinistra della pagina:
- ✅ Deve mostrare: "Backend Attivo" (verde)
- ✅ Deve mostrare: "Database Connesso" (verde)

### Test 2: Form Assistenza
1. Vai alla tab "Assistenza"
2. Compila: Nome, Telefono, Messaggio
3. Clicca "Invia"
4. ✅ Dovresti vedere: "✅ Richiesta inviata!"

### Test 3: Pagamento Stripe
1. Aggiungi prodotto al carrello
2. Clicca "Procedi al Pagamento"
3. Se vedi warning "Stripe non configurato" → torna al Passo 3
4. Compila dati cliente:
   - Nome: Mario Rossi
   - Email: test@esempio.it
   - Telefono: 1234567890
5. Inserisci carta TEST:
   - **Numero**: `4242 4242 4242 4242`
   - **CVV**: `123`
   - **Scadenza**: `12/34`
   - **CAP**: `12345`
6. Clicca "PAGA ORA"
7. ✅ Dovresti vedere: "🎉 Pagamento completato!"

---

## ❌ PROBLEMI COMUNI

### "Invalid API Key provided"
**Causa**: Secret Key errata o incompleta
**Soluzione**:
1. Vai su https://dashboard.stripe.com/test/apikeys
2. Clicca "Reveal test key" sulla Secret key
3. Copiala TUTTA (deve iniziare con `sk_test_`)
4. Ricarica la pagina
5. Quando appare il popup, incolla la chiave completa

### "Stripe non configurato" nel modal
**Causa**: Publishable Key non sostituita
**Soluzione**:
1. Apri `/components/CheckoutModal.tsx`
2. Riga 10: sostituisci `'INSERISCI_TUA_PUBLISHABLE_KEY_QUI'`
3. Con la tua chiave: `'pk_test_...'`
4. Salva il file

### "Cannot read properties of undefined"
**Causa**: Hai copiato male la chiave (con spazi o caratteri strani)
**Soluzione**:
1. Ricontrolla la chiave in `/components/CheckoutModal.tsx`
2. Deve essere: `const STRIPE_PUBLISHABLE_KEY = 'pk_test_...';`
3. NON: `const STRIPE_PUBLISHABLE_KEY = pk_test_...;` (senza apici)
4. NON: `const STRIPE_PUBLISHABLE_KEY = 'pk_test_... ';` (spazio finale)

### Backend Offline
**Causa**: Supabase non raggiungibile
**Soluzione**:
1. Ricarica la pagina
2. Controlla la console (F12) per errori
3. Verifica che Supabase sia connesso

---

## ✅ CHECKLIST FINALE

Prima di testare, verifica:

- [ ] Account Stripe creato
- [ ] Secret Key copiata (inizia con `sk_test_`, ~107 caratteri)
- [ ] Secret Key inserita nel popup (quando richiesto)
- [ ] Publishable Key copiata (inizia con `pk_test_`, ~107 caratteri)
- [ ] Publishable Key inserita in `/components/CheckoutModal.tsx` riga 10
- [ ] File salvato
- [ ] Pagina ricaricata
- [ ] Indicatore mostra "Backend Attivo"

---

## 🎉 TUTTO OK?

Se hai seguito tutti i passaggi:
- ✅ Form assistenza funziona
- ✅ Checkout funziona
- ✅ Pagamenti funzionano
- ✅ Ordini salvati nel database

---

## 📞 Serve aiuto?

### Controlla:
1. **Console del browser** (F12 → Console) per errori
2. **Log Supabase**: Dashboard Supabase → Edge Functions → Logs
3. **Stripe Dashboard**: https://dashboard.stripe.com/test/payments

### Chiavi Stripe corrette?
- Secret Key: inizia con `sk_test_` (107 caratteri)
- Publishable Key: inizia con `pk_test_` (107 caratteri)

### NON funzionano le chiavi?
- Assicurati di essere in **modalità TEST** (non LIVE)
- Toggle in alto a destra della Dashboard Stripe deve dire "Test mode"

---

🚀 **Ora il tuo e-commerce è COMPLETAMENTE FUNZIONANTE!**

Puoi processare **pagamenti TEST** illimitati con carte di prova! 💳
