# Technical Handover - BianchiPro Restyling

Data: 2026-02-10

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
  AVVIA_TUTTO.bat / AVVIA_LOCALE.bat / CHIUDI_TUTTO.bat / CONDIVIDI_ONLINE.bat
  _LOGS/                            # Log di runtime (frontend, tunnel)
  _STATE.json                       # Stato processi avviati (PID)
```

---

## Bug trovati e corretti

### 1. vite.config.ts importava `@vitejs/plugin-vue` (progetto React)

**File**: `vite.config.ts`
**Problema**: Il file importava `@vitejs/plugin-vue` ma il progetto usa React (`.tsx`, `react-dom`, `createRoot`). L'unico plugin installato in `node_modules` e' `@vitejs/plugin-react-swc`. Vite non poteva partire.
**Fix**: Cambiato import e plugin a `@vitejs/plugin-react-swc`.

### 2. vite.config.ts aveva BOM (Byte Order Mark)

**File**: `vite.config.ts`
**Problema**: Il file iniziava con `EF BB BF` (UTF-8 BOM). Alcuni tool trattano il BOM come carattere invalido.
**Fix**: File riscritto senza BOM.

### 3. build.outDir non corrispondeva a netlify.toml

**File**: `vite.config.ts`, `netlify.toml`
**Problema**: `netlify.toml` dichiara `publish = "build"` ma Vite di default produce output in `dist/`. La build su Netlify non troverebbe i file.
**Fix**: Aggiunto `build: { outDir: 'build' }` in `vite.config.ts`.

### 4. ~70 import con versione nel modulo specifier (`"package@X.Y.Z"`)

**File**: Tutti i file in `src/components/ui/`, piu' `src/App.tsx`, `src/components/CartDrawer.tsx`, `src/components/ProductTabs.tsx`
**Problema**: Gli import usavano specifier come `"sonner@2.0.3"`, `"lucide-react@0.487.0"`, `"@radix-ui/react-dialog@1.1.6"`, ecc. Questi non sono moduli validi in Node/npm - la versione va in `package.json`, non nell'import. Probabilmente generati da uno strumento di code generation (Figma o simile) che include i numeri di versione.
**Fix**: Rimosso il suffisso `@X.Y.Z` da tutti gli import. Esempio: `"sonner@2.0.3"` diventa `"sonner"`.
**File coinvolti**: 47 file in `src/components/ui/` + 4 file in `src/` e `src/components/`.

### 5. Import `figma:asset/...` non risolvibile

**File**: `src/App.tsx`, `src/components/ProductGallery.tsx`
**Problema**: Usavano `import mainImage from "figma:asset/f4ed0b..."`. Il protocollo `figma:asset` non e' gestito da Vite (nessun plugin custom). Il file PNG esiste in `src/assets/`.
**Fix**: Cambiato a path relativo: `"./assets/f4ed0b..."` e `"../assets/f4ed0b..."`.

### 6. `_STATE.json` con BOM e struttura incompatibile

**File**: `_STATE.json`
**Problema**: Il file aveva BOM e usava campi `frontend`, `cloudflared`, `base`, `port`. Ma `PANNELLO.ps1` (funzione `NewState`) crea e legge campi `front_pid`, `tunnel_pid`, `last_url`. La funzione `StopAll` cercava `$st.front_pid` che non esisteva nel vecchio formato.
**Fix**: Riscritto con struttura corretta `{"front_pid":0,"tunnel_pid":0,"last_url":""}` senza BOM.

### 7. `AVVIA_TUTTO.bat` passava parametro sbagliato a PANNELLO.ps1

**File**: `AVVIA_TUTTO.bat`
**Problema**: Passava `-Azione AVVIA_LOCALE` ma `PANNELLO.ps1` dichiara `param([string]$Action = "")` e il suo `switch` accetta i valori `start`, `share`, `stop`, `logs`. Il parametro `-Azione` non esiste e `AVVIA_LOCALE` non e' un valore valido.
**Fix**: Cambiato a `PANNELLO.ps1 start` (come fanno gli altri .bat).

### 8. `PANNELLO.ps1` passava `--open false` a Vite

**File**: `PANNELLO.ps1` riga 102
**Problema**: Il comando `npm run dev -- --host 127.0.0.1 --port $FrontPort --open false` e' problematico. Vite tratta `--open` come flag booleano; `--open false` puo' essere interpretato come "apri la pagina 'false'". Inoltre `vite.config.ts` ha gia' `open: false`, rendendo il flag ridondante.
**Fix**: Rimosso `--open false` dal comando.

---

## Problemi noti NON corretti (da affrontare)

### A. Node versione utente fuori dal range supportato

I log mostrano che l'utente usa Node v24.13.0 ma `engines` in `package.json` richiede `>=20 <23` e `.nvmrc` dice `20`. La build CI usa Node 20 (corretto). Sul PC dell'utente npm mostra warning `EBADENGINE`. Potrebbe causare comportamenti imprevisti in sviluppo locale.
**Azione**: L'utente dovrebbe installare Node 20 LTS tramite nvm (`nvm install 20 && nvm use 20`).

### B. Log `front_err.log`: "vite non e' riconosciuto"

Il log `_LOGS/front_err.log` mostra che in una sessione precedente `vite` non era nel PATH. Questo succede quando `PANNELLO.ps1` lancia `cmd.exe /c "cd ... && npm run dev ..."` ma l'ambiente cmd.exe non ha Node/npm nel PATH. Il PANNELLO.ps1 attuale usa `npm run dev` (non `vite` direttamente), il che dovrebbe funzionare se npm e' nel PATH globale. Se il problema si ripresenta, verificare che Node sia installato globalmente o che nvm sia configurato per cmd.exe.

### C. Doppia apertura schede browser

Il report precedente segnalava che a volte si aprono due schede: una dallo script e una dal server Vite. Ora `vite.config.ts` ha `open: false` e il PANNELLO.ps1 non passa piu' `--open`, quindi l'unica apertura dovrebbe essere quella controllata dallo script (dopo `WaitPort`). Se il problema persiste, verificare che non ci siano altri file di configurazione Vite o variabili d'ambiente che forzano `open`.

### D. Tailwind CSS / PostCSS configurazione

`postcss.config.cjs` fa auto-detect di `@tailwindcss/postcss` o `tailwindcss`. Non c'e' un file `tailwind.config.*` nella root. Tailwind dovrebbe funzionare tramite le direttive CSS in `src/index.css`. Se la build fallisce su stili mancanti, verificare la versione di Tailwind installata e se serve un file di configurazione esplicito.

---

## Script di automazione Windows - stato attuale

### File e ruoli

| File | Funzione |
|---|---|
| `PANNELLO.bat` | Menu interattivo (1=Avvia, 2=Condividi, 3=Log, 4=Chiudi, Q=Esci) |
| `AVVIA_TUTTO.bat` | Scorciatoia: avvia locale (equivale a premere "1") |
| `AVVIA_LOCALE.bat` | Scorciatoia: avvia locale (identico ad AVVIA_TUTTO) |
| `CHIUDI_TUTTO.bat` | Scorciatoia: chiudi tutti i processi |
| `CONDIVIDI_ONLINE.bat` | Scorciatoia: tunnel Cloudflare |

### PANNELLO.ps1 - note tecniche

- **Nessun uso di `$pid`**: Lo script usa correttamente `$proc.Id`, `$st.front_pid`, `$st.tunnel_pid` (mai la variabile riservata `$pid`).
- **Nessun operatore `??`**: Compatibile con Windows PowerShell 5.1.
- **Funzioni self-contained**: Nessun dot-sourcing di file esterni. Tutto in un unico file.
- **Gestione processi**: Salva PID in `_STATE.json`, chiude per PID e poi per porta come fallback. `KillByPort` filtra solo processi `node`, `cmd`, `cloudflared`.
- **Cloudflare tunnel**: Richiede `cloudflared.exe` nel PATH. Legge URL dal log (stdout o stderr). Verifica raggiungibilita' HTTP prima di aprire il browser.

### `vite.config.ts` - configurazione Cloudflare

`allowedHosts: ['.trycloudflare.com', 'localhost', '127.0.0.1']` permette a Vite di accettare richieste dal tunnel Cloudflare senza bloccarle.

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
nvm install 20
nvm use 20

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
