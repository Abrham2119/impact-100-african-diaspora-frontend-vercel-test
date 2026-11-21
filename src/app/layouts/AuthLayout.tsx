import { PublicLayout } from './PublicLayout';

// Sign-in screens (README "Four layouts" #2: sign in, sign up, forgot password, check your
// email, two-step). In the design they render inside the full public chrome — top bar, main
// menu (nothing active), breadcrumb banner, footer — with the card as page content
// (ARCHITECTURE.md §0.3 fact 2), so the layout IS the public chrome. Guards are per route
// (public-only vs. signed-in for two-step set-up). The starter's centred-card layout lives on
// as StarterAuthLayout for the legacy password screens.
export function AuthLayout() {
  return <PublicLayout />;
}
