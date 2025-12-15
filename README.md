# Crowd View

Minimal React + Vite dashboard rewritten to plain JSX with Tailwind CSS. TypeScript and third‑party UI kits were removed for simplicity; styling relies on Tailwind utility classes and a few custom utilities in `src/index.css`. Data and realtime updates are stubbed through simple fetch/Socket.IO wrappers.

## Setup & Quick Start
1) Install Node 18+ (recommended) and npm.  
2) Install dependencies:
```bash
npm install
```
3) Start the dev server (default Vite port 5173):
```bash
npm run dev
```
   - If you want a custom port, add `server: { port: 8080 }` in `vite.config.js`.
4) Production build & preview:
```bash
npm run build
npm run preview   # serves the built files
```

## Tech stack
- React 18, React Router
- Vite + SWC
- Tailwind CSS + tailwindcss-animate
- Recharts (charts), lucide-react (icons)
- Socket.IO client for realtime events

## Project structure
```
src/
  main.jsx           # entry
  App.jsx            # routes
  contexts/AuthContext.jsx
  hooks/useSocketIO.jsx
  services/analyticsApi.js, sitesApi.js
  pages/             # Login, Dashboard, CrowdEntries, NotFound
  components/
    layout/          # DashboardLayout, Sidebar
    dashboard/       # StatCard, charts
  index.css          # Tailwind layers + custom utilities
  App.css            # page-level styles
```

## Configuration
- `tailwind.config.js` — scans `./src/**/*.{js,jsx}` and defines the color tokens used in `index.css` (includes `glass` colors for the glassmorphism cards).
- `vite.config.js` — default Vite config; dev server uses the default port unless you set `server.port`.
- `postcss.config.js` — Tailwind + autoprefixer.

## Notes
- Imports use relative paths (no `@` alias).
- Custom glass card style lives in `index.css`; keep `--glass` colors in `tailwind.config.js` in sync.
- Auth/API endpoints point to the provided Kloudspot hiring endpoints; adjust as needed.

## Scripts
- `npm run dev` — start dev server
- `npm run build` — build for production
- `npm run preview` — preview production build

