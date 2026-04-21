# AGENTS.md

## Scope and current modules
- Monorepo root: `tp_final/`.
- Active app is `tp1_inf1013/` (Angular 21, standalone components, SSR enabled).
- `tp2_inf1013_microservice/` is currently empty; do not assume backend APIs exist.
- Existing AI guidance files found via glob search: only `tp1_inf1013/README.md`.

## Big picture architecture (read these first)
- Bootstrap path: `tp1_inf1013/src/main.ts` -> `src/app/app.config.ts` -> `provideAppInitializer(...)`.
- Startup order matters: `AuthService.init()` runs before `AdService.init()` in `app.config.ts`.
- Data is local-first, browser-only persistence: services guard `localStorage` access with `isPlatformBrowser(...)`.
- Initial seed data comes from static JSON (`src/assets/mock/users.json`, `src/assets/mock/ads.json`) only when storage keys are missing.
- Route layer (`src/app/app.routes.ts`) is page-driven; protected paths use `authGuard` in `src/app/auth.guard.ts`.
- SSR policy is selective (`src/app/app.routes.server.ts`): ad detail/edit routes server-rendered, fallback prerender.

## Service boundaries and data flow
- `AuthService` owns `users` and `current_user` keys, login/register/profile update logic.
- `AdService` owns `ads` key, ad CRUD, active toggle, views increment, and address normalization.
- `MessageService` owns `messages` key and ad/owner message queries.
- Typical interaction flow:
  - `AdDetailsComponent.onContact()` -> dialog -> `MessageService.sendMessage(...)`.
  - `MyAdsComponent` reads `MessageService.countMessagesForAd(...)` and opens `AdMessagesDialogComponent`.

## Project-specific conventions
- Use standalone components everywhere; many pages/components use inline `template` + `styles` (examples: `pages/ads-list`, `pages/my-ads`, `components/contact-dialog`).
- Dependency injection style is `inject(...)` fields (not constructor DI).
- IDs can be `string | number` for ads/messages (`models/ad.model.ts`, `models/message.model.ts`); compare via string conversion (`matchesId`).
- Address compatibility is intentional: keep both legacy `streetAddress` and normalized `street/city/postalCode` fields (`AdService.normalizeAd`).
- Guarded navigation preserves return URL (`auth.guard.ts` + `login.component.ts`).
- UI stack is Angular Material; keep UX patterns consistent (snackbars + dialog confirmations).

## Developer workflows
- Run from `tp1_inf1013/`.
- Install: `npm install`
- Dev server: `npm start` (Angular dev server on 4200)
- Build: `npm run build`
- Unit tests: `npm test` (`@angular/build:unit-test`, Vitest globals configured in `tsconfig.spec.json`)
- SSR local serve (after build): `npm run serve:ssr:mon-location`
- Deploy hosting: `npm run deploy` (build + `firebase deploy --only hosting`)

## Integration points and gotchas for agents
- Google Maps integration is URL-based only (no API key):
  - embed iframe in `pages/ad-details/ad-details.component.ts`
  - preview/search URL in `pages/ad-form/ad-form.component.ts`
- `src/app/app.spec.ts` still contains default starter expectation (`Hello, mon-location`) and may fail unless updated.
- For SSR-safe changes, never add direct `window/localStorage` use outside `isPlatformBrowser`-guarded service logic.
- Prefer extending existing services instead of adding new state stores; current architecture centralizes persistence in these three services.

