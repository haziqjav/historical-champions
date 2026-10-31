/** Local build of the same Tailwind v3 the CDN script served, so the look is preserved. */
export default {
  // Scan every source folder that contains JSX. (A folder missing here silently loses its styles.)
  content: ['./index.html', './*.{ts,tsx}', './{components,screens,hooks,services,game}/**/*.{ts,tsx}'],
  theme: { extend: {} },
  plugins: [],
};
