# CrescenDev — The Ember Studio

Next.js portfolio with a scroll-driven React Three Fiber studio and five server-rendered case studies. Original project repositories and the existing My Portfolio site are unchanged.

## Run

```sh
npm install
npm run dev
```

Open http://127.0.0.1:3000. Production: `npm run build`, then `npm start`. Checks: `npm test` and `npm run typecheck`.

The production build uses the supported Webpack compiler because Turbopack’s CSS worker failed in this Windows/OneDrive environment. Set `NEXT_PUBLIC_SITE_URL` to the final site origin when deploying so social image URLs use that domain.

## Content and assets

- `lib/projects.ts`: project copy, case studies and screenshot entries (caption, alt text, kind, size).
- `lib/config.ts`: verified email, GitHub, LinkedIn and résumé destinations. Empty optional fields are hidden.
- `lib/scene-config.ts`: room positions and chapter pacing.
- `components/World.tsx`: native-scroll camera timeline and studio geometry.
- `public/images/screens`: web copies of every product screenshot the site uses.

## Screenshots

Every project now uses real captures of its own interface. No placeholders remain.

- **Order matters.** In each project's `screenshots` list, entry 0 is the primary 3D screen and case-study lead image, and entry 1 is the supporting 3D screen. Both are desktop captures. Later entries form the case-study gallery: desktop captures run full width, and phone captures sit in a framed row labelled *native app* or *mobile web*.
- **Kinds.** `desktop` is a 1440×900 browser viewport. `mobile-web` is a 390×844 phone browser viewport showing the responsive web app, not a native app. `native-android` is the Expo app running in Expo Go on the Android emulator.
- **Provenance.** `assets/screenshots/manifest.json` records each screen's project, route or emulator screen, viewport, capture date, data source, and whether it was newly captured or reused. Tests fail if the manifest and `lib/projects.ts` disagree. The manifest contains no credentials.
- **Originals.** Full-resolution PNGs are kept in `assets/screenshots/originals` and are not served. After changing an original or the manifest, run `npm run screens` to rebuild the WebP copies (1440 px wide for desktop, 720 px for phone), keeping aspect ratios.

How the 2026-11-08 captures were made:

- **The Forge 2.0.** In-memory demo seed, with the AI, Firebase and Supabase keys blanked and outside network blocked. The draft-review screen comes from the app's built-in sample mode (no AI key set), and its caption says so. The native screens come from the Expo athlete app.
- **LJ Vet.** Local MySQL database `portfolio_ljvet_20261105`, built from the repository seed. The `.env` default points at a copy of the live database, so it was overridden for the process. Email and payment keys were blanked and outside network blocked. The native screens come from the Expo pet-owner app.
- **Inbox to Action, LaundroGo, Alt Ave.** Reused from the 2026-11-06 local captures documented in `My Portfolio/assets/screens/REPORT.md`. Their env files point at hosted databases, so they were not re-run.

## Launch requirements

1. Set a verified email in `lib/config.ts`.
2. Verify any optional public source/demo/social links before adding them.
3. Confirm project status wording and any personal contribution claims.
4. Keep personal material out of `public/`, since everything there is published. A saved private Messenger page and three live-data screenshots (with real names, email addresses or a personal device) were moved to `private-not-published/`, which is git-ignored and never served. The ten older `public/images/*-desktop-full-1440.webp` files are no longer referenced and can be removed.
5. Complete real-device Safari/Firefox and rendering-performance checks.

No database, secrets, payment integration, live AI service or contact-form backend is needed.

## Motion and accessibility

The HTML page is the base experience. A single decorative WebGL canvas is loaded only on desktop without reduced-motion preference. Each project uses 180svh in 3D mode, with a stationary camera reading interval. Chapter links skip directly to the selected room. Case study links preserve the room and restore focus on return. The view toggle saves a local preference.

Mobile, reduced motion, context loss, scene errors and sustained rendering below 30 FPS during movement use the lightweight view. Screenshots and semantic content remain in HTML; no content depends exclusively on WebGL. Fonts are bundled locally through Fontsource and the existing licensed Geist Mono asset.
