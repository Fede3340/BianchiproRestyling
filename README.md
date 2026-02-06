
  # Bianchipro Restyling

  This is a code bundle for Bianchipro Restyling. The original project is available at https://www.figma.com/design/brHz1ZOcch0lObtYaEuHEC/Bianchipro-Restyling.

  ## Running the code

  Run `npm i` to install the dependencies.

  Run `npm run dev` to start the development server.

  ## Pubblicare su Netlify

  Il progetto è basato su **React + Vite** e il `package.json` principale si trova in radice. `netlify.toml` è già configurato per la build e le funzioni Netlify.

  Se Netlify non legge `netlify.toml`, inserisci manualmente:
  - **Build command**: `npm run build`
  - **Publish directory**: `build`
  - **Functions directory**: `netlify/functions`
  - **Node version**: `20` (via `.nvmrc` / `engines`)
  - **Environment variables**:
    - `VITE_STRIPE_PUBLISHABLE_KEY` (chiave pubblica Stripe, `pk_test_...`)
    - `STRIPE_SECRET_KEY` (chiave segreta Stripe, `sk_test_...`)

  Dove inserirle: **Site settings → Environment variables → Add a variable**.
  - Nel campo **Name** scrivi esattamente `VITE_STRIPE_PUBLISHABLE_KEY` e nel campo **Value** incolla la tua `pk_test_...`.
  - Ripeti con **Name** `STRIPE_SECRET_KEY` e **Value** `sk_test_...`.
  - Salva e poi fai **Deploys → Trigger deploy → Deploy site** per applicarle.

  Deploy automatico:
  1. Collega il repository GitHub.
  2. Seleziona il branch `main`.
  3. Abilita i deploy automatici (Netlify lo fa di default). 

  L'endpoint di preventivo è disponibile su `/.netlify/functions/preventivo`, mentre il pagamento usa `/.netlify/functions/create-payment-intent` e `/.netlify/functions/orders`.
  


  Build command + Publish directory (riassunto):
  - `buildCommand`: `npm run build`
  - `publishDir`: `build`

  Variabili ambiente richieste (solo nomi):
  - `VITE_STRIPE_PUBLISHABLE_KEY`
  - `STRIPE_SECRET_KEY`
