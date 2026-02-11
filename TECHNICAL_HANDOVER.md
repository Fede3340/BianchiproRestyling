# Technical Handover - BianchiPro Restyling

Data: 2026-02-11

## Panoramica progetto

Progetto frontend **React 18 + Vite 6 + TypeScript** con deploy su **Netlify**.
Backend serverless tramite Netlify Functions (`netlify/functions/`).
Pagamenti via Stripe (chiavi in variabili d'ambiente Netlify).

### Stack

- React 18, Vite 6.3.5, TypeScript
- UI: Radix UI, Tailwind CSS, shadcn/ui, Lucide icons
- Pagamenti: Stripe (react-stripe-js, stripe-js)
- Deploy: Netlify (con Functions)
- CI: GitHub Actions (`ci-build.yml`)

### Struttura cartelle principali

```
BianchiproRestyling/
  .github/workflows/ci-build.yml   # CI: npm ci && npm run build (Node 20)
  netlify/functions/                # Backend serverless (preventivo, orders, payment-intent)
  scripts/check-conflicts.mjs      # Pre-build: verifica assenza merge conflict markers
  src/
    App.tsx                         # Entry component
    main.tsx                        # React root mount
    components/                     # Componenti applicativi
    components/ui/                  # shadcn/ui components
    components/figma/               # ImageWithFallback helper
    assets/                         # Immagini statiche
    config/                         # Configurazione app
    styles/                         # Stili aggiuntivi
    utils/supabase/                 # Supabase client info
  vite.config.ts                    # Configurazione Vite
  postcss.config.cjs                # PostCSS (Tailwind/autoprefixer)
  netlify.toml                      # Deploy config Netlify
  PANNELLO.ps1                      # Script automazione avvio/condivisione (Windows)
  PANNELLO.bat                      # Launcher per PANNELLO.ps1
  AVVIA_TUTTO.bat                   # Scorciatoia: avvia locale
  AVVIA_LOCALE.bat                  # Scorciatoia: avvia locale (identico)
  CHIUDI_TUTTO.bat                  # Scorciatoia: chiudi tutti i processi
  CONDIVIDI_ONLINE.bat              # Scorciatoia: tunnel Cloudflare
  _LOG/                             # Log di runtime (vite, cloudflared)
  _STATE.json                       # Stato processi avviati (PID)
```

---

## Bug trovati e corretti

### 1. vite.config.ts importava `@vitejs/plugin-vue` (progetto React)

**File**: `vite.config.ts`
**Problema**: Il file importava `@vitejs/plugin-vue` ma il progetto usa React. L'unico plugin installato e' `@vitejs/plugin-react-swc`.
**Fix**: Cambiato import e plugin a `@vitejs/plugin-react-swc`.

### 2. vite.config.ts aveva BOM (Byte Order Mark)

**File**: `vite.config.ts`
**Problema**: Il file iniziava con `EF BB BF` (UTF-8 BOM).
**Fix**: File riscritto senza BOM.

### 3. build.outDir non corrispondeva a netlify.toml

**File**: `vite.config.ts`, `netlify.toml`
**Problema**: `netlify.toml` dichiara `publish = "build"` ma Vite di default produce `dist/`.
**Fix**: Aggiunto `build: { outDir: 'build' }` in `vite.config.ts`.

### 4. ~70 import con versione nel modulo specifier

**File**: Tutti i file in `src/components/ui/` e vari in `src/`
**Problema**: Import come `"sonner@2.0.3"`, `"lucide-react@0.487.0"` ecc. Non sono moduli validi.
**Fix**: Rimosso il suffisso `@X.Y.Z` da tutti gli import.

### 5. Import `figma:asset/...` non risolvibile

**File**: `src/App.tsx`, `src/components/ProductGallery.tsx`
**Problema**: `figma:asset` non e' gestito da Vite.
**Fix**: Cambiato a path relativi verso `src/assets/`.

### 6. AVVIA_TUTTO.bat corrotto con marcatori merge conflict

**File**: `AVVIA_TUTTO.bat`
**Problema**: Conteneva `@@ -1,3 +1,4 @@` (diff header) e due righe PowerShell contraddittorie.
**Fix**: Riscritto con una sola riga corretta.

### 7. Cartella log duplicata (`_LOG/` + `_LOGS/`)

**Problema**: Due cartelle di log con file diversi. PANNELLO.ps1 usa `_LOG/`.
**Fix**: Rimossa `_LOGS/`, tenuta solo `_LOG/`.

### 8. File di stato duplicato (`_STATE.json` + `_PANNELLO_STATE.json`)

**Problema**: Due file con strutture diverse. PANNELLO.ps1 usa `_STATE.json`.
**Fix**: Rimosso `_PANNELLO_STATE.json`, resettato `_STATE.json`.

### 9. Commento spazzatura in PANNELLO.ps1

**Problema**: Riga 198 conteneva `:contentReference[oaicite:1]{index=1}` (artefatto AI).
**Fix**: Rimosso.

---

## PANNELLO.ps1 - stato attuale

### Garanzie di compatibilita'

- **Nessun uso di `$pid`**: variabile riservata PowerShell, mai usata come variabile utente
- **Nessun operatore `??`**: compatibile con Windows PowerShell 5.1
- **Nessun `&&`**: non usato (non supportato in PS 5.1)
- **Tutto self-contained**: nessun dot-sourcing di file esterni, tutto in un unico file
- **Nessuna funzione esterna**: niente `Crea-CartellaSeManca` o simili
- **PID sicuri**: Kill-PidTree rifiuta PID <= 4 (processi di sistema)
- **ArgumentList mai nullo**: Start-Process riceve sempre argomenti validi

### Menu (7 opzioni + Esci)

| Tasto | Azione |
|---|---|
| 1 | Avvia locale (Vite su porta 3000, apre browser quando pronto) |
| 2 | Condividi online (avvia locale + tunnel Cloudflare, apre link pubblico) |
| 3 | Chiudi tutto (PID salvati + fallback per porta) |
| 4 | Apri locale nel browser |
| 5 | Apri link online nel browser |
| 6 | Vedi log (scelta tra vite/cloudflared stdout/stderr) |
| 7 | Ripara PostCSS (rimuove BOM da file config) |
| Q | Esci |

### File .bat e relazione con PANNELLO.ps1

| File | Parametro passato | Effetto |
|---|---|---|
| `PANNELLO.bat` | (nessuno) | Apre il menu interattivo |
| `AVVIA_TUTTO.bat` | `-Azione AVVIA_LOCALE` | Avvia locale, poi mostra menu |
| `AVVIA_LOCALE.bat` | `-Azione AVVIA_LOCALE` | Identico ad AVVIA_TUTTO |
| `CHIUDI_TUTTO.bat` | `-Azione CHIUDI_TUTTO` | Chiude tutto, poi mostra menu |
| `CONDIVIDI_ONLINE.bat` | `-Azione CONDIVIDI_ONLINE` | Condivide, poi mostra menu |

---

## vite.config.ts - configurazione chiave

```typescript
export default defineConfig({
  plugins: [react()],
  build: { outDir: 'build' },
  server: {
    port: 3000,
    strictPort: true,
    host: '0.0.0.0',
    allowedHosts: ['.trycloudflare.com', 'localhost', '127.0.0.1'],
    open: false
  }
})
```

- `allowedHosts`: permette Cloudflare tunnel senza "Blocked request"
- `open: false`: evita doppia apertura schede (solo lo script apre il browser)
- `strictPort: true`: fallisce se porta 3000 e' occupata (evita conflitti)

---

## Porte assegnate

| Servizio | Porta |
|---|---|
| BianchiPro (Vite dev) | 3000 |
| SpedizioneFacile Nuxt (se coesiste) | 3001 |
| SpedizioneFacile Laravel | 8000 |
| SpedizioneFacile Caddy proxy | 8787 |

---

## Come avviare da zero

```bash
# 1. Clonare il repo
git clone <url> BianchiproRestyling
cd BianchiproRestyling

# 2. Installare Node 20 (se non presente)
nvm install 20 && nvm use 20

# 3. Installare dipendenze
npm ci

# 4. Avviare in sviluppo
npm run dev
# oppure su Windows: doppio clic su PANNELLO.bat -> premi 1

# 5. Build produzione
npm run build
# Output in cartella build/
```

### Deploy Netlify

Il deploy e' automatico su push a `main`. Le variabili d'ambiente richieste su Netlify:
- `VITE_STRIPE_PUBLISHABLE_KEY` (pk_test_...)
- `STRIPE_SECRET_KEY` (sk_test_...)

---

## Contesto SpedizioneFacile (progetto separato)

Il progetto SpedizioneFacile (cartella `tuttoinsieme/` sul Desktop dell'utente) e' un progetto **separato** con architettura Nuxt + Laravel + Caddy. Non fa parte di questa repository.

I punti aperti per SpedizioneFacile (documentati nel report precedente) sono:
- Normalizzare variabili Nuxt verso origine Caddy 8787
- Verificare `SANCTUM_STATEFUL_DOMAINS` e `SESSION_DOMAIN` in `.env` Laravel
- Gestire il 401 "non loggato" come stato normale (non errore) nel modulo nuxt-auth-sanctum SSR
