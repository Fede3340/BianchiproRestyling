# 🔴 ATTENZIONE - SECRET KEY STRIPE SBAGLIATA!

## ❌ PROBLEMA CRITICO:

L'errore `Invalid API Key provided: 44134226613` indica che hai inserito una **Secret Key Stripe NON valida**.

### Cosa hai inserito (SBAGLIATO):
```
44134226613  ← Solo 11 numeri, NON è una chiave Stripe!
```

### Cosa DEVI inserire (CORRETTO):
```
sk_test_51Abc123...  ← Inizia con "sk_test_", circa 107 caratteri
```

---

## 🚨 AZIONE IMMEDIATA:

### 👉 LEGGI QUESTO FILE PRIMA DI FARE ALTRO:
```
/AIUTO_IMMEDIATO.md
```

Contiene istruzioni passo-passo con screenshot testuali!

---

## ⚡ Quick Fix (30 secondi):

### 1. Vai qui: https://dashboard.stripe.com/test/apikeys

### 2. Clicca "Reveal test key" sulla riga "Secret key"

### 3. Copia la chiave INTERA (inizia con `sk_test_`)

### 4. Ricarica questa pagina (F5)

### 5. Incolla nel popup che appare

### 6. Verifica che inizi con `sk_test_` PRIMA di salvare!

---

## 🔧 Dopo aver configurato la Secret Key corretta:

### 1️⃣ Ottieni la Stripe Publishable Key

1. Vai su: https://dashboard.stripe.com/test/apikeys
2. Copia la **Publishable key** (inizia con `pk_test_`)
3. Sostituiscila nel file `/components/CheckoutModal.tsx` alla riga 7:

```typescript
// PRIMA (riga 7)
const stripePromise = loadStripe(import.meta.env.VITE_STRIPE_PUBLISHABLE_KEY || 'pk_test_YOUR_KEY');

// DOPO (inserisci la tua chiave)
const stripePromise = loadStripe('pk_test_TUA_CHIAVE_QUI');
```

### 2️⃣ Testa il pagamento!

1. Aggiungi prodotto al carrello
2. Clicca "Procedi al Pagamento"
3. Compila dati cliente
4. Carta test: **4242 4242 4242 4242**
   - CVV: 123
   - Scadenza: 12/34
5. Clicca "PAGA ORA"

✅ **FUNZIONA!** L'ordine viene salvato nel database!

---

## 🧪 Testa anche il form assistenza

1. Vai alla tab "Assistenza"
2. Compila nome, telefono, messaggio
3. Clicca "Invia"

✅ **Salvato nel database!**

---

## 🎉 Fatto!

Il tuo e-commerce è **completamente funzionante** con:
- ✅ Pagamenti Stripe reali
- ✅ Database persistente
- ✅ API backend complete
- ✅ Form assistenza funzionante

Per dettagli completi, leggi: `/README_BACKEND.md`
