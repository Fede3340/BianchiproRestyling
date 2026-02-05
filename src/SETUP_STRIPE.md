# 🚀 Guida Configurazione Stripe

## ✅ Backend già configurato!

Il backend Supabase è **completamente funzionante** e pronto per processare pagamenti.

---

## 🔑 Configurazione necessaria (5 minuti)

### 1️⃣ Crea Account Stripe (Gratuito)

1. Vai su: **https://dashboard.stripe.com/register**
2. Registrati gratuitamente
3. Accedi alla Dashboard

---

### 2️⃣ Ottieni le chiavi API

Nella Dashboard Stripe, vai su: **Developers → API Keys**

Troverai 2 chiavi:

#### 📌 **Publishable Key** (inizia con `pk_test_...`)
- ✅ **Pubblica** - può essere esposta nel codice
- 📍 Usata nel **frontend**
- Esempio: `pk_test_51Abc...XYZ`

#### 📌 **Secret Key** (inizia con `sk_test_...`)
- ⚠️ **PRIVATA** - NON condividere mai!
- 📍 Usata nel **backend** (già configurata su Supabase)
- Esempio: `sk_test_51Abc...XYZ`

---

### 3️⃣ Configura le chiavi

#### ✅ Secret Key (Backend) - GIÀ FATTO! ✅
Hai già inserito la Secret Key quando ti è stato richiesto.

#### 🔧 Publishable Key (Frontend) - DA FARE

**Opzione A - File .env (Sviluppo locale):**
```bash
# Crea un file .env nella root del progetto
VITE_STRIPE_PUBLISHABLE_KEY=pk_test_TUA_CHIAVE_QUI
```

**Opzione B - Variabile d'ambiente (Produzione):**
Nelle impostazioni del tuo hosting (Vercel, Netlify, ecc.), aggiungi:
```
VITE_STRIPE_PUBLISHABLE_KEY=pk_test_TUA_CHIAVE_QUI
```

---

## 🧪 Modalità Test

Stripe parte in **modalità test** (chiavi `pk_test_` e `sk_test_`):

✅ **Puoi testare SUBITO senza rischi!**

### Carte di credito TEST (non verranno addebitate):

| Numero Carta        | Risultato           |
|---------------------|---------------------|
| 4242 4242 4242 4242 | ✅ Successo         |
| 4000 0000 0000 9995 | ❌ Declinata        |
| 4000 0025 0000 3155 | 🔐 Richiede 3D Secure |

- **Data scadenza**: qualsiasi data futura (es: 12/34)
- **CVV**: qualsiasi 3 cifre (es: 123)
- **CAP**: qualsiasi (es: 12345)

---

## 🎯 Come testare il pagamento

1. Aggiungi un prodotto al carrello
2. Clicca "Procedi al Pagamento"
3. Compila i dati cliente
4. Inserisci carta test: **4242 4242 4242 4242**
5. Completa il pagamento

✅ **L'ordine verrà salvato nel database!**

---

## 🔴 Modalità LIVE (Produzione)

Quando sei pronto per pagamenti REALI:

1. Nella Dashboard Stripe, **attiva l'account** (richiede verifica identità)
2. Vai su **Developers → API Keys**
3. Passa a **Modalità Live** (toggle in alto a destra)
4. Sostituisci le chiavi test con quelle LIVE:
   - `pk_live_...` → Frontend (.env)
   - `sk_live_...` → Backend (Supabase secrets)

⚠️ **ATTENZIONE**: In modalità LIVE i pagamenti sono REALI!

---

## 📊 Monitoraggio Pagamenti

Dashboard Stripe → **Payments**

Qui vedrai:
- ✅ Transazioni completate
- ❌ Pagamenti falliti
- 💰 Totale incassato
- 📧 Email ricevute clienti

---

## 🛡️ Sicurezza

✅ **I dati delle carte NON passano dal tuo server**
- Stripe gestisce tutto in modo sicuro (PCI-DSS compliant)
- Il tuo backend riceve solo un `paymentIntentId`
- Nessun dato sensibile salvato nel tuo database

---

## ❓ Problemi comuni

### "Provider is not enabled"
→ Hai configurato solo la Publishable Key, non la Secret Key

### "Invalid API Key"
→ Controlla di aver copiato la chiave completa (senza spazi)

### Pagamento non funziona
→ Verifica di essere in modalità TEST e usare carte di test

---

## 📚 Documentazione

- Stripe Dashboard: https://dashboard.stripe.com
- Documentazione API: https://stripe.com/docs/api
- Carte di test: https://stripe.com/docs/testing

---

## ✅ Checklist Finale

- [ ] Account Stripe creato
- [ ] Secret Key inserita su Supabase (✅ già fatto)
- [ ] Publishable Key in .env o variabili d'ambiente
- [ ] Test pagamento con carta 4242...
- [ ] Ordine salvato nel database verificato

---

🎉 **Fatto! Il tuo e-commerce è pronto per processare pagamenti!**
