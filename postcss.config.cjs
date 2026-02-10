const has = (m) => { try { require.resolve(m); return true } catch (e) { return false } }

const plugins = {}
if (has('@tailwindcss/postcss')) plugins['@tailwindcss/postcss'] = {}
if (has('tailwindcss')) plugins['tailwindcss'] = {}
if (has('autoprefixer')) plugins['autoprefixer'] = {}

module.exports = { plugins }
