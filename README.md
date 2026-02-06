# Bianchipro Restyling

Progetto frontend **React + Vite** con deploy su **Netlify** e funzioni serverless in `netlify/functions`.

## Avvio locale

- `npm i`
- `npm run dev`

## Soluzione definitiva (gratis) senza Codespaces

Se Codespaces si ferma, non perdi il flusso: usa questo setup permanente.

1. **GitHub come sorgente unica**
   - lavori da PC locale (o da editor cloud come `github.dev`),
   - fai commit/push su branch.

2. **Netlify collegato al repo**
   - deploy automatico su `main` (produzione),
   - deploy preview automatico su ogni PR (link pronto da aprire).

3. **GitHub Actions (CI build)**
   - ad ogni push/PR viene eseguito `npm ci && npm run build`,
   - se qualcosa rompe build/form/pagine/funzioni, lo vedi subito prima del merge.

4. **Stripe e funzioni serverless**
   - chiavi segrete solo in variabili d'ambiente Netlify,
   - endpoint attivi su `/.netlify/functions/*`.

Questo è il modo più vicino a “Figma Make ma per sempre”: push e vedi subito preview/deploy, senza dipendere da una sessione Codespace.

## Pubblicare su Netlify

Il progetto è già configurato in `netlify.toml`.

Se Netlify non legge il file, inserisci manualmente:

- **Build command**: `npm run build`
- **Publish directory**: `build`
- **Functions directory**: `netlify/functions`
- **Node version**: `20`

### Variabili ambiente richieste (solo nomi)

- `VITE_STRIPE_PUBLISHABLE_KEY`
- `STRIPE_SECRET_KEY`

### Dove inserirle in Netlify

1. **Site settings → Environment variables → Add a variable**
2. Name: `VITE_STRIPE_PUBLISHABLE_KEY` → Value: la tua `pk_test_...`
3. Name: `STRIPE_SECRET_KEY` → Value: la tua `sk_test_...`
4. Deploy: **Deploys → Trigger deploy → Deploy site**

## Endpoint backend (Netlify Functions)

- `/.netlify/functions/preventivo`
- `/.netlify/functions/create-payment-intent`
- `/.netlify/functions/orders`
