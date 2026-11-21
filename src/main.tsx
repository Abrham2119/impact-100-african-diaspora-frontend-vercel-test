import { StrictMode } from 'react';
import { createRoot } from 'react-dom/client';
import { App } from '@/app/App';
// Global CSS — order matters (ARCHITECTURE.md §1.1). Do not reorder.
import '@/styles/fonts.css'; // self-hosted Nunito, Nunito Sans, Caveat
import '@/assets/css/impact100.css'; // design theme + Bootstrap 5.3.2 (unchanged copy)
import '@/assets/css/icons.css'; // design icon font (unchanged copy)
import '@/assets/css/impact100-ext.css'; // design ix_* layer (unchanged copy), loads last of the three
import '@/styles/app.css'; // design rules declared outside its stylesheets
import '@/styles/tw-scope.css'; // starter scope: neutralise design CSS + scoped preflight
import '@/index.css'; // Tailwind (starter screens only)
import '@/styles/tw-compat.css'; // starter scope: Bootstrap-collision compat

// Real entry point — mounts <App/>. Everything else (providers, router,
// layouts, guards) is composed inside src/app.
createRoot(document.getElementById('root')!).render(
  <StrictMode>
    <App />
  </StrictMode>,
);
