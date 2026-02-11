# Technical Handover - BianchiPro Restyling

Data: 2026-02-11 (secondo passaggio - audit completo)

## Panoramica progetto

Progetto frontend **React 18 + Vite 6 + TypeScript** con deploy su **Netlify**.
Backend serverless tramite Netlify Functions (`netlify/functions/`).
Pagamenti via Stripe (chiavi in variabili d'ambiente Netlify).
Backend secondario: Supabase Edge Functions (Deno) in `src/supabase/functions/server/`.

### Stack

- React 18, Vite 6.3.5, TypeScript
- UI: Radix UI, Tailwind CSS (v4), shadcn/ui, Lucide icons
- Pagamenti: Stripe (react-stripe-js, stripe-js)
- Database/KV: Supabase (Edge Functions Deno)
- Deploy: Netlify (con Functions serverless)
- CI: GitHub Actions (`ci-build.yml` - Node 20)

### Struttura cartelle

```
BianchiproRestyling/
  .github/workflows/ci-build.yml    # CI: npm ci && npm run build (Node 20)
  netlify/functions/                 # Backend serverless Netlify
    preventivo.js                    #   Calcolo preventivo con IVA
    orders.js                        #   Gestione ordini
    create-payment-intent.js         #   Stripe Payment Intent
  scripts/check-conflicts.mjs       # Pre-build: verifica merge conflict markers
  src/
    main.tsx                         # Entry point React
    App.tsx                          # Root component
    index.css                        # Stili globali (Tailwind generato, 67KB)
    assets/                          # Immagini (1 file PNG prodotto)
    components/                      # 15 componenti applicativi
      figma/ImageWithFallback.tsx    #   Fallback per immagini mancanti
      ui/                            #   62 componenti shadcn/ui
        utils.ts                     #   cn() utility (clsx + tailwind-merge)
    config/stripe.ts                 # Config Stripe (publishable key)
    styles/globals.css               # CSS custom properties light/dark
    utils/supabase/info.tsx          # Supabase project ID e anon key
    supabase/functions/server/       # Edge Functions Deno (NON Vite)
      index.tsx                      #   API Hono (ordini, pagamenti, supporto)
      kv_store.tsx                   #   KV store via Supabase
  vite.config.ts                     # Config Vite (react-swc, porta 3000)
  tsconfig.json                      # TypeScript config
  postcss.config.cjs                 # PostCSS (Tailwind/autoprefixer auto-detect)
  netlify.toml                       # Deploy config (build -> build/, Node 20)
  PANNELLO.ps1                       # Pannello automazione Windows
  PANNELLO.bat                       # Launcher menu interattivo
  AVVIA_TUTTO.bat / AVVIA_LOCALE.bat # Scorciatoia: avvia locale
  CHIUDI_TUTTO.bat                   # Scorciatoia: chiudi tutto
  CONDIVIDI_ONLINE.bat               # Scorciatoia: tunnel Cloudflare
  _LOGS/                             # Log runtime (frontend, tunnel)
  _STATE.json                        # PID processi avviati
```

---

## Bug trovati e corretti (totale: 10)

### 1. vite.config.ts importava `@vitejs/plugin-vue` (progetto React)

**Problema**: Plugin sbagliato. Il progetto e' React ma il config importava Vue.
L'unico plugin in node_modules e' `@vitejs/plugin-react-swc`.
**Fix**: Cambiato a `import react from '@vitejs/plugin-react-swc'`.

### 2. vite.config.ts aveva BOM (Byte Order Mark)

**Problema**: Primi 3 byte `EF BB BF`. Puo' causare errori di parsing.
**Fix**: Riscritto senza BOM.

### 3. build.outDir mancante (mismatch con netlify.toml)

**Problema**: `netlify.toml` dice `publish = "build"` ma Vite default e' `dist/`.
**Fix**: Aggiunto `build: { outDir: 'build' }`.

### 4. ~70 import con `@version` nel modulo specifier

**Problema**: Import come `"sonner@2.0.3"`, `"lucide-react@0.487.0"`,
`"@radix-ui/react-dialog@1.1.6"`. Generati da Figma Make.
Non sono specifier validi in Node - la build fallisce.
**File coinvolti**: 47 file `ui/` + `App.tsx`, `CartDrawer.tsx`, `ProductTabs.tsx`,
`ui/sonner.tsx` (che aveva anche `"next-themes@0.4.6"`).
**Fix**: Rimosso `@X.Y.Z` da tutti gli import.

### 5. Import `figma:asset/...` non risolvibile

**Problema**: `App.tsx` e `ProductGallery.tsx` usavano `"figma:asset/f4ed0b..."`.
Nessun plugin Vite gestisce questo protocollo.
Il file PNG esiste in `src/assets/`.
**Fix**: Cambiato a path relativo (`./assets/...`, `../assets/...`).

### 6. `_STATE.json` con BOM e struttura incompatibile

**Problema**: BOM + campi `frontend`, `cloudflared`, `base`, `port` (vecchio formato).
`PANNELLO.ps1` aspetta `front_pid`, `tunnel_pid`, `last_url`.
**Fix**: Riscritto con struttura corretta senza BOM.

### 7. `AVVIA_TUTTO.bat` parametro sbagliato

**Problema**: Passava `-Azione AVVIA_LOCALE`. PANNELLO.ps1 accetta `start`/`share`/`stop`/`logs`.
**Fix**: Cambiato a `PANNELLO.ps1 start`.

### 8. `PANNELLO.ps1` passava `--open false` a Vite

**Problema**: `--open false` puo' aprire una pagina "false". Config ha gia' `open: false`.
**Fix**: Rimosso dal comando npm.

### 9. `tsconfig.json` mancante

**Problema**: Nessun tsconfig.json nel progetto. IDE TypeScript senza configurazione.
**Fix**: Creato tsconfig.json con target ES2020, jsx react-jsx, strict mode.
`src/supabase/` escluso (e' codice Deno, non Vite).

### 10. PANNELLO.ps1 ricostruito da zero

**Problemi nel vecchio**: `$ErrorActionPreference = "Stop"` (crash su ogni errore),
state file path inconsistente (`_PANNELLO_STATE.json` vs `_STATE.json`),
nessuna verifica npm nel PATH, nessun cleanup log prima di avvio,
nessuna gestione config cloudflared che interferisce con quick tunnel,
nessun feedback errore (mostra log), nessun indicatore stato nel menu.
**Fix**: Riscritto completamente con:
- `$ErrorActionPreference = "Continue"` (robusto)
- State file unificato `_STATE.json`
- Verifica npm nel PATH prima di avviare
- Cleanup log vecchi prima di ogni avvio
- Rinomina temporanea config cloudflared durante quick tunnel
- Mostra ultime 5 righe del log errore quando fallisce
- Indicatore stato in tempo reale nel menu (locale attivo/spento, URL tunnel)
- Protezione PID <= 4 (mai toccare processi di sistema)
- `KillByPort` include anche `npm` e `conhost` nei processi ammessi
- Uscita con Q chiude anche i processi (cleanup automatico)

---

## Build verificata

```
npm run build  ->  OK (1628 moduli, 5.99s)

Output:
  build/index.html              0.44 KB
  build/assets/*.png          154.42 KB
  build/assets/*.css           54.37 KB (gzip 9.45 KB)
  build/assets/*.js           288.86 KB (gzip 85.15 KB)
```

---

## Componenti verificati (audit completo)

### 15 componenti applicativi
AccessoriesSection, AppErrorBoundary, BackendStatus, CartDrawer,
CheckoutModal, CompactAccessories, FavoritesDrawer, FeedatyReviews,
Footer, Header, ProductDetails, ProductGallery, ProductTabs,
ShippingCalculator, TrustBadges + figma/ImageWithFallback

### 62 componenti UI (shadcn/ui)
Tutti verificati: import corretti, cross-reference interni funzionanti.
Contengono `"use client"` (direttiva Next.js, innocua in Vite - ignorata silenziosamente).

### Dipendenze esterne
Tutte presenti in node_modules: react, react-dom, lucide-react, sonner,
next-themes, @stripe/*, @radix-ui/* (29 pacchetti), class-variance-authority,
clsx, tailwind-merge, cmdk, vaul, embla-carousel-react, input-otp,
react-day-picker, react-hook-form, react-resizable-panels, recharts.

### Import inter-componente
Tutti risolti correttamente. Nessun import circolare rilevato.

---

## File Deno (NON Vite) - `src/supabase/functions/server/`

Questi file usano sintassi Deno (`jsr:`, `npm:`, `Deno.env`, `Deno.serve`).
Sono Edge Functions che girano su Supabase, NON nel browser.
**Non vanno modificati** e sono esclusi da tsconfig.json.

- `index.tsx`: API Hono con endpoint ordini, supporto, Stripe payment intent
- `kv_store.tsx`: KV store tramite Supabase (auto-generato)

---

## Script automazione Windows

### File e ruoli

| File | Azione | Equivalente menu |
|---|---|---|
| `PANNELLO.bat` | Menu interattivo | - |
| `AVVIA_TUTTO.bat` | Avvia locale | Tasto 1 |
| `AVVIA_LOCALE.bat` | Avvia locale | Tasto 1 |
| `CHIUDI_TUTTO.bat` | Chiudi tutto | Tasto 4 |
| `CONDIVIDI_ONLINE.bat` | Tunnel Cloudflare | Tasto 2 |

### PANNELLO.ps1 - garanzie

- Compatibile Windows PowerShell 5.1 (no `??`, no `&&`, no `$pid` come variabile)
- Self-contained: nessun file esterno, nessun dot-sourcing
- Protezione PID di sistema: mai tocca PID <= 4
- Cleanup log prima di ogni avvio (evita URL tunnel stale)
- Verifica npm nel PATH con messaggio chiaro se manca
- Browser si apre SOLO dopo risposta porta (o tunnel raggiungibile)
- Una sola scheda (Vite `open: false` + script controlla apertura)
- Menu mostra stato: locale attivo/spento, URL tunnel corrente
- Uscita Q chiude tutto automaticamente

### Cloudflare tunnel

- Richiede `cloudflared.exe` nel PATH
- `allowedHosts` in vite.config.ts include `.trycloudflare.com`
- Config cloudflared locale (`.cloudflared/config.yml`) rinominata temporaneamente
  durante quick tunnel per evitare interferenze
- URL letto da log stderr/stdout con regex
- Verifica HTTP prima di aprire browser

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
# 1. Clonare e installare
git clone <url> BianchiproRestyling && cd BianchiproRestyling
nvm install 20 && nvm use 20   # oppure installare Node 20 LTS
npm ci

# 2. Sviluppo
npm run dev                     # porta 3000
# oppure Windows: doppio clic PANNELLO.bat -> 1

# 3. Build produzione
npm run build                   # output in build/

# 4. Preview build
npm start                       # porta 4173
```

### Deploy Netlify

Deploy automatico su push a `main`. Variabili ambiente richieste:
- `VITE_STRIPE_PUBLISHABLE_KEY` (pk_test_...)
- `STRIPE_SECRET_KEY` (sk_test_...)

---

## Note per chi continua il lavoro

### Node version
Il progetto richiede Node >=20 <23 (`.nvmrc` dice 20, CI usa 20).
L'utente aveva Node 24 che genera warning `EBADENGINE`.

### `"use client"` nei componenti UI
36 file ui/ hanno `"use client"` (direttiva Next.js). E' innocua in Vite.
Non rimuoverla: i componenti shadcn/ui la includono di default e puo'
servire se il progetto migra a Next.js o se i componenti vengono copiati altrove.

### Supabase Edge Functions
I file in `src/supabase/functions/server/` sono Deno, non Node.
Usano `jsr:@supabase/supabase-js@2.49.8`, `npm:hono`, `Deno.serve`.
Non modificarli nel contesto Vite. Sono gestiti separatamente da Supabase CLI.

### Contesto SpedizioneFacile (progetto separato)

SpedizioneFacile (cartella `tuttoinsieme/` sul Desktop) e' un progetto separato
con Nuxt + Laravel + Caddy. Non fa parte di questa repository.
Punti aperti documentati nel report originale dell'utente.
