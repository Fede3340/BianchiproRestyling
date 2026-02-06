
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

  Deploy automatico:
  1. Collega il repository GitHub.
  2. Seleziona il branch `main`.
  3. Abilita i deploy automatici (Netlify lo fa di default). 

  L'endpoint di preventivo è disponibile su `/.netlify/functions/preventivo`.
  
