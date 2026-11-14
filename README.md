# React + Vite

## Supabase Realtime

Run `supabase/enable-realtime.sql` in the SQL Editor of the project specified by
`VITE_SUPABASE_URL`. The five application tables must be in the `supabase_realtime`
publication. Existing SELECT grants and row-level security determine which changes
each signed-in user can receive; this script does not broaden access.

Authenticated routes share a subscription for users, loans, loan payments, loan
types and special payment dates. Events refresh the affected React Query caches,
including joined data and filtered/paginated reports. Bursts are batched, reconnects
refresh cached data, and leaving authenticated routes removes the channel.
Legacy local Zustand payment/ledger data is not synchronized by this integration.

To verify, open two authenticated browser sessions, edit a visible user or approve
a loan in one, and confirm the other updates without reloading. Also check reports
after a payment change and reconnect a temporarily offline tab. Use records both
sessions are permitted to read. See the [Supabase Postgres Changes documentation](https://supabase.com/docs/guides/realtime/postgres-changes).

This template provides a minimal setup to get React working in Vite with HMR and some ESLint rules.

Currently, two official plugins are available:

- [@vitejs/plugin-react](https://github.com/vitejs/vite-plugin-react/blob/main/packages/plugin-react) uses [Babel](https://babeljs.io/) (or [oxc](https://oxc.rs) when used in [rolldown-vite](https://vite.dev/guide/rolldown)) for Fast Refresh
- [@vitejs/plugin-react-swc](https://github.com/vitejs/vite-plugin-react/blob/main/packages/plugin-react-swc) uses [SWC](https://swc.rs/) for Fast Refresh

## React Compiler

The React Compiler is enabled on this template. See [this documentation](https://react.dev/learn/react-compiler) for more information.

Note: This will impact Vite dev & build performances.

## Expanding the ESLint configuration

If you are developing a production application, we recommend using TypeScript with type-aware lint rules enabled. Check out the [TS template](https://github.com/vitejs/vite/tree/main/packages/create-vite/template-react-ts) for information on how to integrate TypeScript and [`typescript-eslint`](https://typescript-eslint.io) in your project.
