# 🔑 COME OTTENERE LA SECRET KEY DI STRIPE

## ⚠️ HAI INSERITO LA CHIAVE SBAGLIATA!

### ❌ Quello che hai inserito:
```
44134226613
```
- ❌ Solo 11 caratteri
- ❌ Solo numeri
- ❌ NON inizia con "sk_test_"
- ❌ NON è una chiave Stripe valida

### ✅ Quello che DEVI inserire:
```
sk_test_51Abc1234XYZ5678901234567890abcdefghijklmnopqrstuvwxyz1234567890ABCDEFGHIJKLMNOPQRSTUVWXYZ
```
- ✅ Circa 107 caratteri
- ✅ Contiene lettere, numeri e underscore
- ✅ Inizia con "sk_test_"
- ✅ È la chiave Stripe COMPLETA

---

## 📋 PASSO-PASSO (LEGGI ATTENTAMENTE!)

### 1️⃣ Vai sulla Dashboard Stripe

Clicca questo link:
👉 **https://dashboard.stripe.com/test/apikeys**

Se non hai un account:
1. Vai su https://dashboard.stripe.com/register
2. Registrati (GRATIS, no carta richiesta)
3. Conferma email
4. Torna al link sopra

---

### 2️⃣ Trova la "Secret key"

Nella pagina vedrai una tabella con 2 righe:

```
┌─────────────────────────────────────────────────────────┐
│ Standard keys                                           │
├─────────────────────────────────────────────────────────┤
│ Publishable key    pk_test_51...  [Coppia chiave]      │
│ Secret key         sk_test_51...  [Reveal test key]    │
└─────────────────────────────────────────────────────────┘
```

Quella che ti serve è la **Secret key** (seconda riga)!

---

### 3️⃣ Clicca "Reveal test key"

La chiave potrebbe essere nascosta come:
```
sk_test_••••••••••••••••••••••••••••••••••••••••
```

**Clicca il pulsante "Reveal test key"** per vedere la chiave completa!

---

### 4️⃣ Copia LA CHIAVE INTERA!

Ora vedrai qualcosa tipo:
```
sk_test_51AbC1234XYZ5678901234567890abcdefghijklmnopqrstuvwxyz1234567890ABCDEFGHIJKLMNOPQRSTUVWXYZ
```

**COPIA TUTTA QUESTA STRINGA!**

⚠️ **CONTROLLI PRIMA DI COPIARE**:
- [ ] Inizia con `sk_test_` 
- [ ] Contiene circa 107 caratteri
- [ ] Contiene lettere MAIUSCOLE e minuscole
- [ ] Contiene numeri
- [ ] NON ha spazi all'inizio o alla fine

**COME COPIARE CORRETTAMENTE**:
1. Clicca sull'icona "📋" accanto alla chiave
   OPPURE
2. Triplo-clic sulla chiave per selezionarla tutta
3. CTRL+C (Windows) o CMD+C (Mac)

---

### 5️⃣ Incolla nel Popup

Quando appare il popup "STRIPE_SECRET_KEY":
1. ✅ Fai CTRL+V (Windows) o CMD+V (Mac)
2. ✅ Controlla che INIZI con `sk_test_`
3. ✅ Controlla che sia LUNGA (circa 107 caratteri)
4. ✅ NON modificare, NON aggiungere spazi
5. ✅ Clicca "Salva" o "OK"

---

## 🎯 VERIFICA VISIVA

### ❌ SBAGLIATO (quello che hai fatto):
```
Secret Key: 44134226613
            ^^^^^^^^^^^
            Solo 11 numeri - SBAGLIATO!
```

### ✅ CORRETTO (quello che devi fare):
```
Secret Key: sk_test_51AbC1234XYZ5678901234567890abcdefgh...
            ^^^^^^^^
            Inizia con sk_test_ - GIUSTO! ✓
            
            Lunghezza totale: ~107 caratteri ✓
```

---

## 🔍 DOVE SEI ANDATO STORTO?

### Probabilmente hai fatto una di queste cose:

#### 1. Copiato solo UNA PARTE della chiave
```
sk_test_51AbC1234XYZ567890...
         ^^^^^^^^^^^^^
         Hai copiato solo questa parte?
```
❌ Devi copiare TUTTA la stringa!

#### 2. Copiato un ID progetto
Nella Dashboard Stripe ci sono vari numeri:
- Account ID
- Project ID  
- Customer ID

❌ Nessuno di questi è la Secret Key!
✅ La Secret Key è nella pagina "Developers → API keys"

#### 3. Copiato la Publishable Key
```
pk_test_51... ← Questa è la Publishable Key
sk_test_51... ← Questa è la Secret Key (quella giusta!)
```

#### 4. Guardato il numero sbagliato
Hai cercato "Secret Key" su Google o nella documentazione e trovato un esempio?

❌ Gli esempi NON funzionano!
✅ Devi usare LA TUA chiave dalla TUA Dashboard!

---

## 🆘 ANCORA CONFUSO?

### Ecco uno screenshot testuale di cosa dovresti vedere:

```
════════════════════════════════════════════════════════════
                 STRIPE DASHBOARD
                    API Keys
════════════════════════════════════════════════════════════

  Standard keys

  Publishable key (usata nel frontend)
  pk_test_51Abc...XYZ123  [📋 Copy]
  
  Secret key (usata nel backend) ← QUESTA QUI!!!
  sk_test_51Def...ABC789  [👁️ Reveal test key]
                          
════════════════════════════════════════════════════════════
```

**Clicca "Reveal test key"** e poi **copia sk_test_...**

---

## ✅ PROSSIMI PASSI

### Dopo aver inserito la Secret Key corretta:

1. **Ricarica la pagina** (F5)
2. Guarda l'indicatore in basso a sinistra:
   - ✅ Backend Attivo (verde)
   - ✅ Database Connesso (verde)

3. **Testa il form assistenza**:
   - Tab "Assistenza"
   - Compila e invia
   - Dovresti vedere: "✅ Richiesta inviata!"

4. **Configura la Publishable Key** (vedi file precedente)

---

## 📞 LA TUA CHIAVE È NEL FORMATO GIUSTO?

Prima di incollare, controlla:

```
sk_test_51   ← Inizia così? ✓
       |
       Numero account Stripe (2 cifre)
       
sk_test_51AbC1234567890...
          ^^^^^^^^^^^^^^^^
          Lettere e numeri casuali
          
Totale: ~107 caratteri
```

### ESEMPI DI CHIAVI VALIDE (non funzionanti, solo esempi):
```
sk_test_51AbCdEfGh1234567890IjKlMnOpQrStUvWxYz1234567890ABCDEFGHIJKLMNOPQRSTUVWXYZ1234567890XYZ
sk_test_51Qr8Xyz9AbCdEfGh7654321IjKlMnOpQrStUv1234567890ABCDEFabcdefGHIJKLghijklMNOPQRmnopqr
sk_test_51MnOpQr0123456789StUvWxYzAbCdEfGh9876543210IjKlMnOpQrStUvWxYz1234567890ABCDEFGHIJ
```

Vedi il pattern? Tutte:
- ✅ Iniziano con `sk_test_51`
- ✅ Contengono ~107 caratteri
- ✅ Mix di lettere e numeri

---

## 🚨 IMPORTANTE

### La Secret Key è PRIVATA!
- ⚠️ NON condividerla con nessuno
- ⚠️ NON pubblicarla su GitHub/forum
- ⚠️ È come la password del tuo conto bancario!

### Usa la modalità TEST!
- ✅ Chiavi TEST iniziano con `sk_test_`
- ✅ Non processano pagamenti reali
- ✅ Gratis, illimitate, sicure per sviluppo

### NON usare chiavi LIVE (ancora)!
- ❌ Chiavi LIVE iniziano con `sk_live_`
- ❌ Processano pagamenti REALI
- ❌ Usale solo quando vai in produzione!

---

## 🎉 SEI PRONTO?

1. Vai su: https://dashboard.stripe.com/test/apikeys
2. Clicca "Reveal test key" sulla SECRET KEY
3. Copia TUTTA la stringa (sk_test_51...)
4. Incolla nel popup
5. Salva
6. Ricarica la pagina

**Fatto? Ora prova il test del form assistenza!** 🚀

Se funziona, vedrai: "✅ Richiesta inviata con successo!"

---

📖 **Prossimo step**: Configura la Publishable Key in `/components/CheckoutModal.tsx`
(Leggi: `/CONFIGURAZIONE_CHIAVI_STRIPE.md`)
